"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VentCubeData = void 0;
const ValueDefinitions_1 = require("./ValueDefinitions");
class VentCubeData {
    currentOperationMode = ValueDefinitions_1.OperatingModes_Int.OFF;
    currentManualFanLevel = ValueDefinitions_1.FanLevels_Int.AUTO;
    currentFanLevel = ValueDefinitions_1.FanLevels_Int.AUTO;
    temp_Outside = 0;
    lastUpdate;
    constructor() {
    }
    logConsole() {
        console.log("--------------------------------------------------");
        console.log("------------- Current Vent-Cube-Data -------------");
        console.log(". Current Operating Mode: " + this.currentOperationMode);
        console.log(". Current Manual Fan Level: " + this.currentManualFanLevel);
        console.log(". Current Fan Level: " + this.currentFanLevel);
        console.log(". TEMP_Outside: " + this.temp_Outside);
        console.log("--------------------------------------------------");
        console.log("--------------------------------------------------");
    }
}
exports.VentCubeData = VentCubeData;
