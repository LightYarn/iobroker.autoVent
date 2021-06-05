"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connector = exports.COMMANDMODES = void 0;
const net = require("net");
const FUNCTIONCODES_1 = require("./FUNCTIONCODES");
const VentCubeData_1 = require("./VentCubeData");
const ValueDefinitions_1 = require("./ValueDefinitions");
const ValueParser_1 = require("./ValueParser");
var COMMANDMODES;
(function (COMMANDMODES) {
    COMMANDMODES["NONE"] = "NONE";
    COMMANDMODES["initialRead"] = "initialRead";
    COMMANDMODES["writeData"] = "writeData";
})(COMMANDMODES = exports.COMMANDMODES || (exports.COMMANDMODES = {}));
class Connector {
    outputStream;
    socket;
    currentReadDataIndex;
    ipAddress;
    port;
    autovent;
    valueParser;
    currentCommandMode = COMMANDMODES.NONE;
    writeData_Address;
    writeData_Value;
    socketConnected = false;
    timer;
    ventCubeData;
    constructor(_ipAddress, _port, _autovent) {
        this.autovent = _autovent;
        this.outputStream = new Buffer(0);
        this.currentReadDataIndex = 0;
        this.ipAddress = _ipAddress;
        this.port = _port;
        this.valueParser = new ValueParser_1.ValueParser(_autovent);
        this.ventCubeData = new VentCubeData_1.VentCubeData();
    }
    getVentCubeData() {
        this.autovent.writeLog("Trying to get VentCubeData...");
        if (this.currentCommandMode == COMMANDMODES.NONE) {
            this.autovent.writeLog("Success! Getting VentCubeData...");
            this.currentCommandMode = COMMANDMODES.initialRead;
            this.prepareSocket();
            if (this.socket != null) {
                if (this.socketConnected == true) {
                    this.executeCurrentCommand();
                }
                else {
                    this.autovent.writeLog("Connecting Socket...");
                    this.socket.connect(this.port, this.ipAddress);
                }
            }
        }
        else {
            this.autovent.log.warn("Tried to GET VentCubeData but CommandMode is not in the correct state! Was: " + this.currentCommandMode);
        }
    }
    setVentCubeData(_address, _value) {
        if (this.currentCommandMode == COMMANDMODES.NONE) {
            this.currentCommandMode = COMMANDMODES.writeData;
            this.writeData_Address = _address;
            this.writeData_Value = _value;
            this.prepareSocket();
            if (this.socket != null) {
                if (this.socketConnected == true) {
                    this.executeCurrentCommand();
                }
                else {
                    this.autovent.writeLog("Connecting Socket...");
                    this.socket.connect(this.port, this.ipAddress);
                }
            }
        }
        else {
            this.autovent.log.warn("Tried to SET VentCubeData but CommandMode is not in the correct state! Was: " + this.currentCommandMode);
        }
    }
    prepareSocket() {
        if (this.socket == null) {
            this.socket = new net.Socket();
            this.socket.setTimeout(1000);
            this.socket.addListener("close", this.socketEvent_close.bind(this));
            this.socket.addListener("connect", this.socketEvent_connect.bind(this));
            this.socket.addListener("data", this.socketEvent_data.bind(this));
            this.socket.addListener("drain", this.socketEvent_drain.bind(this));
            this.socket.addListener("end", this.socketEvent_end.bind(this));
            this.socket.addListener("error", this.socketEvent_error.bind(this));
            this.socket.addListener("lookup", this.socketEvent_lookup.bind(this));
            this.socket.addListener("timeout", this.socketEvent_timeout.bind(this));
        }
    }
    read(_addr) {
        this.outputStream = Buffer.from(this.prepareMessage_read(_addr, 1));
        if (this.socket != null) {
            this.socket.write(this.outputStream);
        }
    }
    write() {
        if (this.writeData_Address != null && this.writeData_Value != null) {
            this.autovent.writeLog("setting " + ValueDefinitions_1.RegisterAddresses[this.writeData_Address] + " to value: " + this.writeData_Value);
            this.outputStream = Buffer.from(this.prepareMessage_write(this.writeData_Address, this.writeData_Value));
            if (this.socket != null) {
                this.socket.write(this.outputStream);
            }
        }
    }
    readData() {
        if (this.ventCubeData == null) {
            this.autovent.writeLog("Creating new ventCubeData object");
            this.ventCubeData = new VentCubeData_1.VentCubeData();
        }
        this.autovent.writeLog("reading Data! Index: " + this.currentReadDataIndex);
        switch (this.currentReadDataIndex) {
            case ValueDefinitions_1.ReadDataIndex.OperationMode:
                this.read(ValueDefinitions_1.RegisterAddresses.OperationMode);
                break;
            case ValueDefinitions_1.ReadDataIndex.ManualFanLevel:
                this.read(ValueDefinitions_1.RegisterAddresses.ManualFanLevel);
                break;
            case ValueDefinitions_1.ReadDataIndex.CurrentFanLevel:
                this.read(ValueDefinitions_1.RegisterAddresses.CurrentFanLevel);
                break;
            case ValueDefinitions_1.ReadDataIndex.TempValue_Outside:
                this.read(ValueDefinitions_1.RegisterAddresses.TempValue_Outside);
                break;
            case ValueDefinitions_1.ReadDataIndex.DONE:
                this.autovent.writeLog("READ DONE");
                this.autovent.logVentCubeDataAdapter();
                this.autovent.setStates(true);
                this.currentReadDataIndex = 0;
                this.currentCommandMode = COMMANDMODES.NONE;
                if (this.socket != null) {
                    this.socket.end();
                }
                if (this.timer) {
                    clearTimeout(this.timer);
                }
                this.timer = setTimeout(function () { this.getVentCubeData(); }.bind(this), this.autovent.refreshRate * 60000);
                break;
            default:
                throw new Error("UNHANDLED RED DATA-INDEX! WAS: " + this.currentReadDataIndex);
        }
    }
    prepareMessage_read(_startingAddress, _numberOfRegisters) {
        let message = this.prepareEmptyMessage(12, 0x06, FUNCTIONCODES_1.FUNCTIONCODES.READ_HoldingRegisters);
        let startAddress_HEX = _startingAddress.toString(16);
        if (startAddress_HEX.length > 4) {
            throw new Error("START ADDRESS NOT SUPPORTED");
        }
        else if (startAddress_HEX.length == 1) {
            startAddress_HEX = "000" + startAddress_HEX;
        }
        else if (startAddress_HEX.length == 2) {
            startAddress_HEX = "00" + startAddress_HEX;
        }
        else if (startAddress_HEX.length == 3) {
            startAddress_HEX = "0" + startAddress_HEX;
        }
        let highBit_string = "0x" + startAddress_HEX[0] + startAddress_HEX[1];
        let lowBit_string = "0x" + startAddress_HEX[2] + startAddress_HEX[3];
        // DATA
        message[8] = highBit_string;
        message[9] = lowBit_string;
        message[10] = 0x00;
        message[11] = _numberOfRegisters;
        //-----------------------
        return message;
    }
    prepareMessage_write(_startingAddress, _value) {
        let message = this.prepareEmptyMessage(15, 0x09, FUNCTIONCODES_1.FUNCTIONCODES.WRITE_HoldingRegisters);
        let startAddress_HEX = _startingAddress.toString(16);
        if (startAddress_HEX.length > 4) {
            throw new Error("START ADDRESS NOT SUPPORTED");
        }
        else if (startAddress_HEX.length == 1) {
            startAddress_HEX = "000" + startAddress_HEX;
        }
        else if (startAddress_HEX.length == 2) {
            startAddress_HEX = "00" + startAddress_HEX;
        }
        else if (startAddress_HEX.length == 3) {
            startAddress_HEX = "0" + startAddress_HEX;
        }
        let highBit_string = "0x" + startAddress_HEX[0] + startAddress_HEX[1];
        let lowBit_string = "0x" + startAddress_HEX[2] + startAddress_HEX[3];
        // START-ADDRESS
        message[8] = highBit_string;
        message[9] = lowBit_string;
        //-----------------------
        // REGISTER-COUNT
        message[10] = 0x00;
        message[11] = 0x01;
        //-----------------------
        // BYTE-COUNT
        message[12] = 0x02;
        //-----------------------
        // BYTE-DATA
        message[13] = 0x00;
        message[14] = _value;
        //-----------------------
        return message;
    }
    prepareEmptyMessage(_length, _lengthValue, _functionCode) {
        let message = new Uint8Array(_length);
        // Transaction-Identifier
        message[0] = 0x00;
        message[1] = 0x00;
        //------------------------
        // Protocol-Identifier
        message[2] = 0x00;
        message[3] = 0x00;
        //-----------------------
        // Length
        message[4] = 0x00;
        message[5] = _lengthValue;
        //-----------------------
        // Unit-Identifier
        message[6] = 0xFF;
        //-----------------------        
        // Function-Code
        message[7] = _functionCode;
        //----------------------- 
        return message;
    }
    handleAnswer_ReadHoldingRegisters(dv) {
        let responseMessage = "(Read-Holding-Registers) RESPONSE: ";
        let plainResponse = "";
        for (let i = 0; i < dv.byteLength; i++) {
            let hexString = dv.getUint8(i).toString(16);
            if (hexString.length < 2) {
                hexString = "0" + hexString;
            }
            plainResponse += hexString;
        }
        switch (this.currentReadDataIndex) {
            case ValueDefinitions_1.ReadDataIndex.OperationMode:
                this.ventCubeData.currentOperationMode = this.valueParser.parseOperatingMode(plainResponse);
                this.currentReadDataIndex++;
                break;
            case ValueDefinitions_1.ReadDataIndex.ManualFanLevel:
                this.ventCubeData.currentManualFanLevel = this.valueParser.parseManualFanLevel(plainResponse);
                this.currentReadDataIndex++;
                break;
            case ValueDefinitions_1.ReadDataIndex.CurrentFanLevel:
                this.ventCubeData.currentFanLevel = this.valueParser.parseCurrentFanLevel(plainResponse);
                this.currentReadDataIndex++;
                break;
            case ValueDefinitions_1.ReadDataIndex.TempValue_Outside:
                this.ventCubeData.temp_Outside = this.valueParser.parseTemp_Outside(plainResponse);
                this.currentReadDataIndex = ValueDefinitions_1.ReadDataIndex.DONE;
                break;
            case ValueDefinitions_1.ReadDataIndex.DONE:
                break;
            default:
                this.autovent.log.error("UNHANDLED RED DATA-INDEX! WAS: " + this.currentReadDataIndex);
                throw new Error("UNHANDLED RED DATA-INDEX! WAS: " + this.currentReadDataIndex);
        }
        this.readData();
    }
    handleAnswer_WriteHoldingRegisters(dv) {
        let responseMessage = "(Write-Holding-Registers) RESPONSE: ";
        let plainResponse = "";
        for (let i = 0; i < dv.byteLength; i++) {
            let hexString = dv.getUint8(i).toString(16);
            if (hexString.length < 2) {
                hexString = "0" + hexString;
            }
            plainResponse += hexString;
        }
        this.autovent.writeLog(responseMessage + plainResponse);
        this.currentCommandMode = COMMANDMODES.NONE;
    }
    executeCurrentCommand() {
        this.autovent.writeLog("CurrentCommandMode: " + this.currentCommandMode);
        switch (this.currentCommandMode) {
            case COMMANDMODES.initialRead:
                this.readData();
                return;
            case COMMANDMODES.writeData:
                this.write();
                return;
            default:
                this.autovent.log.error(" Unhandled CurrentCommandMode! Was: " + this.currentCommandMode);
                return;
        }
    }
    socketEvent_close(hadError) {
        if (hadError) {
            this.autovent.writeLog("SOCKET-EVENT:  CLOSE!   Had Error: " + hadError);
        }
    }
    socketEvent_connect() {
        this.autovent.writeLog("Socket connected!");
        this.socketConnected = true;
        this.executeCurrentCommand();
    }
    socketEvent_data(data) {
        //console.log("SOCKET-EVENT:  DATA");
        let dv = new DataView(data.buffer);
        let responseFunctionCode = parseInt(dv.getUint8(7).toString());
        // ERROR RESPONSE
        if (responseFunctionCode > 80) {
            this.autovent.log.error("ERROR RESPONSE!! " + responseFunctionCode + "   ERROR-CODE: " + parseInt(dv.getUint8(8).toString(16)));
        }
        else {
            switch (responseFunctionCode) {
                case FUNCTIONCODES_1.FUNCTIONCODES.READ_HoldingRegisters:
                    this.handleAnswer_ReadHoldingRegisters(dv);
                    break;
                case FUNCTIONCODES_1.FUNCTIONCODES.WRITE_HoldingRegisters:
                    this.handleAnswer_WriteHoldingRegisters(dv);
                    break;
                default:
                    this.autovent.log.warn("UNHANDLED FUNCTION-CODE: " + responseFunctionCode);
                    break;
            }
        }
    }
    socketEvent_drain() {
        this.socketConnected = false;
    }
    socketEvent_end() {
        this.socketConnected = false;
    }
    socketEvent_error(err) {
        this.socketConnected = false;
        this.autovent.log.error("SOCKET-EVENT:  ERROR!   " + err.message);
    }
    socketEvent_lookup(err, address, family, host) {
        this.autovent.writeLog("SOCKET-EVENT:  LOOKUP");
        if (err != null) {
            console.log("ERROR: " + err);
        }
        if (address != null) {
            console.log("address: " + address);
        }
        if (family != null) {
            console.log("family: " + family);
        }
        if (host != null) {
            console.log("host: " + host);
        }
        console.log("");
    }
    socketEvent_timeout() {
        this.socketConnected = false;
    }
}
exports.Connector = Connector;
