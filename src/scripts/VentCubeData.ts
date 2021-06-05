import { OperatingModes_Int, FanLevels_Int } from "./ValueDefinitions";

export class VentCubeData
{
     

    public currentOperationMode: OperatingModes_Int = OperatingModes_Int.OFF;

    public currentManualFanLevel: FanLevels_Int = FanLevels_Int.AUTO;
    public currentFanLevel: FanLevels_Int = FanLevels_Int.AUTO;

    public temp_Outside: number = 0;

    public lastUpdate: string;


    constructor()
    {

    }


    logConsole():void
    {
        console.log("--------------------------------------------------");
        console.log("------------- Current Vent-Cube-Data -------------");
        console.log(". Current Operating Mode: "    + this.currentOperationMode);
        console.log(". Current Manual Fan Level: "  + this.currentManualFanLevel);
        console.log(". Current Fan Level: "         + this.currentFanLevel);
        console.log(". TEMP_Outside: "              + this.temp_Outside);
        console.log("--------------------------------------------------");
        console.log("--------------------------------------------------");
    }

    

    

}