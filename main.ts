/*
 * Created with @iobroker/create-adapter v1.34.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from "@iobroker/adapter-core";
import { Connector } from "./scripts/Connector";
import { VentCubeData } from "./scripts/VentCubeData";
import { OperatingModes_Int, ObjectIDs, RegisterAddresses, FanLevels_Int, OperatingModes_String, FanLevels_String } from "./scripts/ValueDefinitions";


// Augment the adapter.config object with the actual types
declare global
{
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace ioBroker
    {
        interface AdapterConfig
        {
            // Define the shape of your options here (recommended)
            ventCubeIP: string;
            refreshRate: number;
            doLog: boolean;
            // Or use a catch-all approach
            [key: string]: any;
        }
    }
}

export class autoVent extends utils.Adapter
{
    connector: Connector; 

    ip: string = "192.168.000.000";
    port: number = 502;
    refreshRate: number = 5;

    public constructor(options: Partial<ioBroker.AdapterOptions> = {})
    {
        super({
            ...options,
            name: "autoVent",
        });
        this.on("ready",        this.onReady.bind(this));
        this.on("objectChange", this.onObjectChange.bind(this));
        this.on("stateChange",  this.onStateChange.bind(this));
        // this.on("message",   this.onMessage.bind(this));
        this.on("unload", this.onUnload.bind(this)); 

        this.connector = new Connector(this.ip, this.port, this);
 
    }

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
    private async onReady(): Promise<void>
    {
        // Initialize your adapter here

        // The adapters config (in the instance object everything under the attribute "native") is accessible via
        // this.config:
        this.writeLog("config ventCubeIP: " + this.config.ventCubeIP);
        this.ip = this.config.ventCubeIP;
        this.writeLog("Using IP: " + this.ip);

        this.writeLog("config refreshRate: " + this.config.refreshRate);
        this.refreshRate = this.config.refreshRate;
        this.writeLog("Using refreshRate: " + this.refreshRate);

		/*
		For every state in the system there has to be also an object of type state
		Here a simple template for a boolean variable named "testVariable"
		Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
		*/

        await this.setObjectAsync(ObjectIDs.lastUpdate, {
            type: "state",
            common: {
                name: "lastUpdate",
                type: "string",
                role: "state",
                read: true,
                write: false,
            },
            native: {},
        });

        await this.setObjectAsync(ObjectIDs.tempOutside, {
            type: "state",
            common: {
                name: "Außentemperatur",
                type: "number",
                role: "value.temperatur",
                unit: "°C",
                read: true,
                write: false,
            },
            native: {},
        });

        await this.setObjectAsync(ObjectIDs.operatingMode, {
            type: "state",
            common: {
                name: ObjectIDs.operatingMode,
                type: "number",
                role: "level.valve",
                read: true,
                write: true,
            },
            native: {},
        });

        await this.setObjectAsync(ObjectIDs.manualFanLevel, {
            type: "state",
            common: {
                name: ObjectIDs.manualFanLevel,
                type: "number",
                role: "level.valve",
                read: true,
                write: true,
            },
            native: {},
        });

        await this.setObjectAsync(ObjectIDs.currentFanLevel, {
            type: "state",
            common: {
                name: ObjectIDs.currentFanLevel,
                type: "number",
                role: "level.valve",
                read: true,
                write: false,
            },
            native: {},
        });

        // In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
		//this.subscribeStates("testVariable");
		// You can also add a subscription for multiple states. The following line watches all states starting with "lights."
		// this.subscribeStates("lights.*");
		// Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
		this.subscribeStates("*");

		/*
			setState examples
			you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
		*/
		// the variable testVariable is set to true as command (ack=false)
        
        // same thing, but the value is flagged "ack"
		// ack should be always set to true if the value is received from or acknowledged from the target system
		//await this.setStateAsync("testVariable", { val: true, ack: true });

		// same thing, but the state is deleted after 30s (getState will return null afterwards)
		//await this.setStateAsync("testVariable", { val: true, ack: true, expire: 30 });

		// examples for the checkPassword/checkGroup functions
		//let result = await this.checkPasswordAsync("admin", "iobroker");
		//this.log.info("check user admin pw iobroker: " + result);

		//result = await this.checkGroupAsync("admin", "admin");
        


        this.connector = new Connector(this.ip, this.port, this);
        this.connector.getVentCubeData();
       

        
    }

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 */
    private onUnload(callback: () => void): void
    {
        try
        {
            this.writeLog("cleaned everything up...");
            callback();
        } catch (e)
        {
            callback();
        }
    }

	/**
	 * Is called if a subscribed object changes
	 */
    private onObjectChange(id: string, obj: ioBroker.Object | null | undefined): void
    {
        if (obj)
        {
            // The object was changed
            this.writeLog(`object ${id} changed: ${JSON.stringify(obj)}`);            
        }
        else
        {
            // The object was deleted
            this.writeLog(`object ${id} deleted`);
        }
    }

	/**
	 * Is called if a subscribed state changes
	 */
    private onStateChange(id: string, state: ioBroker.State | null | undefined): void
    {
        if (state)
        {
            // The state was changed
            this.writeLog(`state ${id} changed: ${state.val} (ack = ${state.ack}),  c: ` + state.c);           

            if (state.c != "init")
            {
                let idArray: Array<string> = id.split(".");

                let objectID: string = idArray[2];
                this.handleStateChange(objectID, state.val);
            }            
        }
        else
        {
            // The state was deleted
            this.writeLog(`state ${id} deleted`);
        }
    }


    private handleStateChange(_objectID: string, _value: any)
    {
        this.writeLog("Handling State Change! ObjectID: " + _objectID + "  Value: " + _value);
        switch (_objectID)
        {
            case ObjectIDs.tempOutside:
            case ObjectIDs.currentFanLevel:
                this.log.warn(_objectID + " is read-only! Setting this value is not supported");
                return;

            case ObjectIDs.operatingMode:
                this.writeLog("Setting -OPERATION MODE- got value: " + _value);

                switch (_value)
                {
                    case OperatingModes_Int.OFF:
                    case OperatingModes_String.OFF:
                        this.connector.setVentCubeData(RegisterAddresses.OperationMode, 0);
                        this.connector.ventCubeData.currentOperationMode = OperatingModes_Int.OFF;
                        break;

                    case OperatingModes_Int.MANUAL:
                    case OperatingModes_String.MANUAL:
                        this.connector.setVentCubeData(RegisterAddresses.OperationMode, 1);
                        this.connector.ventCubeData.currentOperationMode = OperatingModes_Int.MANUAL;
                        break;

                    case OperatingModes_Int.WINTER:
                    case OperatingModes_String.WINTER:
                        this.connector.setVentCubeData(RegisterAddresses.OperationMode, 2);
                        this.connector.ventCubeData.currentOperationMode = OperatingModes_Int.WINTER;
                        break;

                    case OperatingModes_Int.SUMMER:
                    case OperatingModes_String.SUMMER:
                        this.connector.setVentCubeData(RegisterAddresses.OperationMode, 3);
                        this.connector.ventCubeData.currentOperationMode = OperatingModes_Int.SUMMER;
                        break;

                    case OperatingModes_Int.SUMMER_EX:
                    case OperatingModes_String.SUMMER_EX:
                        this.connector.setVentCubeData(RegisterAddresses.OperationMode, 4);
                        this.connector.ventCubeData.currentOperationMode = OperatingModes_Int.SUMMER_EX;
                        break;

                    default:
                        this.log.error("Unhandled value for -SET-OPERATION-MODE-! Was: " + _value);
                        break;
                }

                this.writeLog("currentOperationMode now: " + OperatingModes_Int[this.connector.ventCubeData.currentOperationMode]);

                this.setStates(false);
                break;

            case ObjectIDs.manualFanLevel:
                this.writeLog("Setting -MANUAL FAN LEVEL- got value: " + _value);

                switch (_value)
                {
                    case FanLevels_Int.OFF:
                    case FanLevels_String.OFF:
                        this.connector.setVentCubeData(RegisterAddresses.ManualFanLevel, 0);
                        this.connector.ventCubeData.currentManualFanLevel = FanLevels_Int.OFF;
                        break;

                    case FanLevels_Int.LEVEL_1:
                    case FanLevels_String.LEVEL_1:
                        this.connector.setVentCubeData(RegisterAddresses.ManualFanLevel, 1);
                        this.connector.ventCubeData.currentManualFanLevel = FanLevels_Int.LEVEL_1;
                        break;

                    case FanLevels_Int.LEVEL_2:
                    case FanLevels_String.LEVEL_2:
                        this.connector.setVentCubeData(RegisterAddresses.ManualFanLevel, 2);
                        this.connector.ventCubeData.currentManualFanLevel = FanLevels_Int.LEVEL_2;
                        break;

                    case FanLevels_Int.LEVEL_3:
                    case FanLevels_String.LEVEL_3:
                        this.connector.setVentCubeData(RegisterAddresses.ManualFanLevel, 3);
                        this.connector.ventCubeData.currentManualFanLevel = FanLevels_Int.LEVEL_3;
                        break;

                    case FanLevels_Int.LEVEL_4:
                    case FanLevels_String.LEVEL_4:
                        this.connector.setVentCubeData(RegisterAddresses.ManualFanLevel, 4);
                        this.connector.ventCubeData.currentManualFanLevel = FanLevels_Int.LEVEL_4;
                        break;

                    case FanLevels_Int.AUTO:
                    case FanLevels_String.AUTO:
                        this.connector.setVentCubeData(RegisterAddresses.ManualFanLevel, 5);
                        this.connector.ventCubeData.currentManualFanLevel = FanLevels_Int.AUTO;
                        break;

                    case FanLevels_Int.LINEAR:
                    case FanLevels_String.LINEAR:
                        this.connector.setVentCubeData(RegisterAddresses.ManualFanLevel, 6);
                        this.connector.ventCubeData.currentManualFanLevel = FanLevels_Int.LINEAR;
                        break;

                    default:
                        this.log.error("Unhandled value for -MANUAL FAN LEVEL-! Was: " + _value);
                        break;
                }

                this.writeLog("currentManualFanLevel now: " + FanLevels_Int[this.connector.ventCubeData.currentFanLevel]);

                this.setStates(false);
                break;
        }
    }

    public getCurrentState()
    {
        this.connector = new Connector(this.ip, this.port, this);
        this.connector.getVentCubeData();
    }

    // /**
    //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
    //  * Using this method requires "common.message" property to be set to true in io-package.json
    //  */
    // private onMessage(obj: ioBroker.Message): void {
    // 	if (typeof obj === "object" && obj.message) {
    // 		if (obj.command === "send") {
    // 			// e.g. send email or pushover or whatever
    // 			this.writeLog("send command");

    // 			// Send response in callback if required
    // 			if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
    // 		}
    // 	}
    // }




    public logVentCubeDataAdapter(): void
    {        
        if (this.connector != null)
        {
            this.writeLog("------------- Current Vent-Cube-Data -------------");
            this.writeLog(". Current Operating Mode: " + this.connector.ventCubeData.currentOperationMode);        
            this.writeLog(". Current Manual Fan Level: "    + this.connector.ventCubeData.currentManualFanLevel);
            this.writeLog(". Current Fan Level: "           + this.connector.ventCubeData.currentFanLevel);
            this.writeLog(". TEMP_Outside: "                + this.connector.ventCubeData.temp_Outside);
            this.writeLog("--------------------------------------------------");
        }

       
    }

    public setStates(_fromInitialRead: boolean): void
    {
        let today = new Date();
        let date = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        let dateTime: string = (date + "  " + time);

        this.connector.ventCubeData.lastUpdate = dateTime;

        if (_fromInitialRead == true)
        {
            this.writeLog("Setting Sates from initialRead...");


            this.setState(ObjectIDs.lastUpdate, { val: this.connector.ventCubeData.lastUpdate, ack: true, c: "init" });

            this.setState(ObjectIDs.tempOutside, { val: this.connector.ventCubeData.temp_Outside, ack: true, c: "init" });

            this.setState(ObjectIDs.operatingMode, { val: OperatingModes_Int[this.connector.ventCubeData.currentOperationMode], ack: true, c: "init" });

            this.setState(ObjectIDs.manualFanLevel, { val: FanLevels_Int[this.connector.ventCubeData.currentManualFanLevel], ack: true, c: "init" });

            this.setState(ObjectIDs.currentFanLevel, { val: FanLevels_Int[this.connector.ventCubeData.currentFanLevel], ack: true, c: "init" });
        }
        else
        {

        }
    }

    public writeLog(message: string)
    {
        if (this.config.doLog)
        {
            this.log.info(message);
        }
    }

}

if (require.main !== module) 
{
	// Export the constructor in compact mode
	module.exports = (options: Partial<ioBroker.AdapterOptions> | undefined) => new autoVent(options);
} 
else 
{
	// otherwise start the instance directly
	(() => new autoVent())();
}