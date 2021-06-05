import { Socket } from "dgram";
import net = require("net");
import fs = require('fs');
import { TextEncoder } from "util";
import { FUNCTIONCODES } from "./FUNCTIONCODES";
import { VentCubeData } from "./VentCubeData";
import { ReadDataIndex, RegisterAddresses as RegisterAddresses } from "./ValueDefinitions";
import { ValueParser } from "./ValueParser";
import { autoVent } from "../main";

export enum COMMANDMODES
{
    NONE = "NONE",
    initialRead = "initialRead",
    writeData = "writeData"
}

export class Connector 
{  
    private outputStream: Buffer;
    private socket: net.Socket | undefined;
    private currentReadDataIndex: ReadDataIndex;

    private ipAddress: string;
    private port: number;

    private autoVent: autoVent;
    private valueParser: ValueParser;

    private currentCommandMode: COMMANDMODES = COMMANDMODES.NONE;

    private writeData_Address: number | undefined;
    private writeData_Value: number | undefined;

    private socketConnected: boolean = false;

    private timer: NodeJS.Timer | undefined;




    public ventCubeData: VentCubeData;

    


    constructor(_ipAddress: string, _port: number, _autoVent: autoVent)
    {
        this.autoVent = _autoVent;

        this.outputStream = new Buffer(0);
        this.currentReadDataIndex = 0;

        this.ipAddress = _ipAddress;
        this.port = _port;


        this.valueParser = new ValueParser(_autoVent);
        this.ventCubeData = new VentCubeData();
    }


    public getVentCubeData(): void
    {
        this.autoVent.writeLog("Trying to get VentCubeData...");

        if (this.currentCommandMode == COMMANDMODES.NONE)
        {
            this.autoVent.writeLog("Success! Getting VentCubeData...");
            this.currentCommandMode = COMMANDMODES.initialRead;

            this.prepareSocket();
            if (this.socket != null)
            {
                if (this.socketConnected == true)
                {
                    this.executeCurrentCommand();
                }
                else
                {
                    this.autoVent.writeLog("Connecting Socket...");
                    this.socket.connect(this.port, this.ipAddress);
                }
            }



        }
        else
        {
            this.autoVent.log.warn("Tried to GET VentCubeData but CommandMode is not in the correct state! Was: " + this.currentCommandMode);
        }
    }

    public setVentCubeData(_address: number, _value: number)
    {
        if (this.currentCommandMode == COMMANDMODES.NONE)
        {
            this.currentCommandMode = COMMANDMODES.writeData;

            this.writeData_Address = _address;
            this.writeData_Value = _value;

            this.prepareSocket();
            if (this.socket != null)
            {
                if (this.socketConnected == true)
                {
                    this.executeCurrentCommand();
                }
                else
                {
                    this.autoVent.writeLog("Connecting Socket...");
                    this.socket.connect(this.port, this.ipAddress);
                }
            }
        }
        else
        {
            this.autoVent.log.warn("Tried to SET VentCubeData but CommandMode is not in the correct state! Was: " + this.currentCommandMode);
        }
    }




    private prepareSocket(): void
    {
        if (this.socket == null)
        {
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
    
    private read(_addr: number): void
    {     
        this.outputStream = Buffer.from(this.prepareMessage_read(_addr, 1));
        if (this.socket != null)
        {           
            this.socket.write(this.outputStream);
        }
    }

    private write(): void
    {
        if (this.writeData_Address != null && this.writeData_Value != null)
        {
            this.autoVent.writeLog("setting " + RegisterAddresses[this.writeData_Address] + " to value: " + this.writeData_Value);
            this.outputStream = Buffer.from(this.prepareMessage_write(this.writeData_Address, this.writeData_Value));
            if (this.socket != null)
            {
                this.socket.write(this.outputStream);
            }
        }
    }

    private readData(): void
    {
        if (this.ventCubeData == null)
        {
            this.autoVent.writeLog("Creating new ventCubeData object");
            this.ventCubeData = new VentCubeData();
        }

        this.autoVent.writeLog("reading Data! Index: " + this.currentReadDataIndex);

        switch (this.currentReadDataIndex)
        {
            case ReadDataIndex.OperationMode:
                this.read(RegisterAddresses.OperationMode);
                break;

            case ReadDataIndex.ManualFanLevel:
                this.read(RegisterAddresses.ManualFanLevel);
                break;

            case ReadDataIndex.CurrentFanLevel:
                this.read(RegisterAddresses.CurrentFanLevel);
                break;

            case ReadDataIndex.TempValue_Outside:
                this.read(RegisterAddresses.TempValue_Outside);
                break;








            case ReadDataIndex.DONE:
                this.autoVent.writeLog("READ DONE");
                this.autoVent.logVentCubeDataAdapter();
                this.autoVent.setStates(true);

                this.currentReadDataIndex = 0;
                this.currentCommandMode = COMMANDMODES.NONE;
                if (this.socket != null)
                {
                    this.socket.end();
                }

                if (this.timer)
                {
                    clearTimeout(this.timer);
                }
                           

                this.timer = setTimeout(function () { this.getVentCubeData(); }.bind(this), this.autoVent.refreshRate * 60000);


                break;

            default:
                throw new Error("UNHANDLED RED DATA-INDEX! WAS: " + this.currentReadDataIndex);
        }


    }

    private prepareMessage_read(_startingAddress: number, _numberOfRegisters: number,): Uint8Array
    {
        let message: Uint8Array = this.prepareEmptyMessage(12, 0x06, FUNCTIONCODES.READ_HoldingRegisters);

        let startAddress_HEX: string = _startingAddress.toString(16);
        if (startAddress_HEX.length > 4)
        {
            throw new Error("START ADDRESS NOT SUPPORTED");
        }
        else if (startAddress_HEX.length == 1)
        {
            startAddress_HEX = "000" + startAddress_HEX;
        }
        else if (startAddress_HEX.length == 2)
        {
            startAddress_HEX = "00" + startAddress_HEX;
        }
        else if (startAddress_HEX.length == 3)
        {
            startAddress_HEX = "0" + startAddress_HEX;
        }        
        
        let highBit_string: any = "0x" + startAddress_HEX[0] + startAddress_HEX[1];
        let lowBit_string: any  = "0x" +startAddress_HEX[2] + startAddress_HEX[3];
                     
        // DATA
        message[8] = highBit_string;
        message[9] = lowBit_string;        
        message[10] = 0x00;
        message[11] = _numberOfRegisters;
        //-----------------------


        return message;
    }

    private prepareMessage_write(_startingAddress: number, _value: number): Uint8Array
    {
        let message: Uint8Array = this.prepareEmptyMessage(15, 0x09, FUNCTIONCODES.WRITE_HoldingRegisters);

        let startAddress_HEX: string = _startingAddress.toString(16);
        if (startAddress_HEX.length > 4)
        {
            throw new Error("START ADDRESS NOT SUPPORTED");
        }
        else if (startAddress_HEX.length == 1)
        {
            startAddress_HEX = "000" + startAddress_HEX;
        }
        else if (startAddress_HEX.length == 2)
        {
            startAddress_HEX = "00" + startAddress_HEX;
        }
        else if (startAddress_HEX.length == 3)
        {
            startAddress_HEX = "0" + startAddress_HEX;
        }      

        let highBit_string: any = "0x" + startAddress_HEX[0] + startAddress_HEX[1];
        let lowBit_string: any = "0x" + startAddress_HEX[2] + startAddress_HEX[3];
       

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

    private prepareEmptyMessage(_length: number, _lengthValue: any, _functionCode: FUNCTIONCODES): Uint8Array
    {
        let message: Uint8Array = new Uint8Array(_length);       

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

    private handleAnswer_ReadHoldingRegisters(dv: DataView)
    {
        let responseMessage: string = "(Read-Holding-Registers) RESPONSE: ";
        let plainResponse: string = "";

        for (let i = 0; i < dv.byteLength; i++)
        {
            let hexString: string = dv.getUint8(i).toString(16);
            if (hexString.length < 2)
            {
                hexString = "0" + hexString;
            }

            plainResponse += hexString;
        }        

       

        switch (this.currentReadDataIndex)
        {
            case ReadDataIndex.OperationMode:
                this.ventCubeData.currentOperationMode = this.valueParser.parseOperatingMode(plainResponse);
                this.currentReadDataIndex++;
                break;

            case ReadDataIndex.ManualFanLevel:
                this.ventCubeData.currentManualFanLevel = this.valueParser.parseManualFanLevel(plainResponse);
                this.currentReadDataIndex++;
                break;

            case ReadDataIndex.CurrentFanLevel:
                this.ventCubeData.currentFanLevel = this.valueParser.parseCurrentFanLevel(plainResponse);
                this.currentReadDataIndex++;
                break;

            case ReadDataIndex.TempValue_Outside:
                this.ventCubeData.temp_Outside = this.valueParser.parseTemp_Outside(plainResponse);
                this.currentReadDataIndex = ReadDataIndex.DONE;
                break;



            case ReadDataIndex.DONE:
               
                break;

            default:
                this.autoVent.log.error("UNHANDLED RED DATA-INDEX! WAS: " + this.currentReadDataIndex);
                throw new Error("UNHANDLED RED DATA-INDEX! WAS: " + this.currentReadDataIndex);
        }

        this.readData();  
    }

    private handleAnswer_WriteHoldingRegisters(dv: DataView)
    {
        let responseMessage: string = "(Write-Holding-Registers) RESPONSE: ";
        let plainResponse: string = "";

        for (let i = 0; i < dv.byteLength; i++)
        {
            let hexString: string = dv.getUint8(i).toString(16);
            if (hexString.length < 2)
            {
                hexString = "0" + hexString;
            }

            plainResponse += hexString;
        }

        this.autoVent.writeLog(responseMessage + plainResponse);
        this.currentCommandMode = COMMANDMODES.NONE;
    }

    private executeCurrentCommand()
    {
        this.autoVent.writeLog("CurrentCommandMode: " + this.currentCommandMode);
        switch (this.currentCommandMode)
        {
            case COMMANDMODES.initialRead:
                this.readData();
                return;

            case COMMANDMODES.writeData:
                this.write();
                return;

            default:
                this.autoVent.log.error(" Unhandled CurrentCommandMode! Was: " + this.currentCommandMode);
                return;
        }
    }


    private socketEvent_close(hadError: boolean): void
    {
        if (hadError)
        {
            this.autoVent.writeLog("SOCKET-EVENT:  CLOSE!   Had Error: " + hadError);
        }
    }

    private socketEvent_connect(): void
    {
        this.autoVent.writeLog("Socket connected!");
        this.socketConnected = true;

        this.executeCurrentCommand();                       
    }

    private socketEvent_data(data: Buffer): void
    {
        //console.log("SOCKET-EVENT:  DATA");

        let dv: DataView = new DataView(data.buffer);

        
        let responseFunctionCode: number = parseInt(dv.getUint8(7).toString());

        // ERROR RESPONSE
        if (responseFunctionCode > 80)
        {
            this.autoVent.log.error("ERROR RESPONSE!! " + responseFunctionCode + "   ERROR-CODE: " + parseInt(dv.getUint8(8).toString(16)));
        }
        else
        {
            switch (responseFunctionCode)
            {                    
                case FUNCTIONCODES.READ_HoldingRegisters:

                    this.handleAnswer_ReadHoldingRegisters(dv);
                    break;

                case FUNCTIONCODES.WRITE_HoldingRegisters:

                    this.handleAnswer_WriteHoldingRegisters(dv);
                    break;

                default:
                    this.autoVent.log.warn("UNHANDLED FUNCTION-CODE: " + responseFunctionCode);
                    break;
            }
        }

        

    }

    private socketEvent_drain(): void
    {
        this.socketConnected = false;           
    }

    private socketEvent_end(): void
    {
        this.socketConnected = false;   
    }

    private socketEvent_error(err: Error): void
    {   
        this.socketConnected = false;
        this.autoVent.log.error("SOCKET-EVENT:  ERROR!   " + err.message);
    }

    private socketEvent_lookup(err: Error, address: string, family: string | number, host: string): void
    {
        this.autoVent.writeLog("SOCKET-EVENT:  LOOKUP");

        if (err != null )
        {
            console.log("ERROR: " + err);
        }

        if (address != null)
        {
            console.log("address: " + address);
        }

        if (family != null)
        {
            console.log("family: " + family);
        }

        if (host != null)
        {
            console.log("host: " + host);
        }

        console.log("");
    }

    private socketEvent_timeout(): void
    {
        this.socketConnected = false;
         
    }
}