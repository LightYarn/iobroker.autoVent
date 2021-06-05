"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValueParser = void 0;
const ValueDefinitions_1 = require("./ValueDefinitions");
class ValueParser {
    autovent;
    constructor(_autovent) {
        this.autovent = _autovent;
    }
    parseOperatingMode(_response) {
        let value = _response.slice(-2);
        switch (value) {
            case "00":
                return ValueDefinitions_1.OperatingModes_Int.OFF;
            case "01":
                return ValueDefinitions_1.OperatingModes_Int.MANUAL;
            case "02":
                return ValueDefinitions_1.OperatingModes_Int.WINTER;
            case "03":
                return ValueDefinitions_1.OperatingModes_Int.SUMMER;
            case "04":
                return ValueDefinitions_1.OperatingModes_Int.SUMMER_EX;
            default:
                this.autovent.log.warn("UNHANDLED VALUE @parseOperatingMode! Was: " + value);
                return ValueDefinitions_1.OperatingModes_Int.ERROR;
        }
    }
    parseManualFanLevel(_response) {
        let value = _response.slice(-2);
        switch (value) {
            case "00":
            case "0":
                return ValueDefinitions_1.FanLevels_Int.OFF;
            case "01":
            case "1":
                return ValueDefinitions_1.FanLevels_Int.LEVEL_1;
            case "02":
            case "2":
                return ValueDefinitions_1.FanLevels_Int.LEVEL_2;
            case "03":
            case "3":
                return ValueDefinitions_1.FanLevels_Int.LEVEL_3;
            case "04":
            case "4":
                return ValueDefinitions_1.FanLevels_Int.LEVEL_4;
            case "05":
            case "5":
                return ValueDefinitions_1.FanLevels_Int.AUTO;
            case "06":
            case "6":
                return ValueDefinitions_1.FanLevels_Int.LINEAR;
            default:
                this.autovent.log.warn("UNHANDLED VALUE @parseManualFanLevel! Was: " + value);
                return ValueDefinitions_1.FanLevels_Int.ERROR;
        }
    }
    parseCurrentFanLevel(_response) {
        let value = _response.slice(-2);
        switch (value) {
            case "00":
            case "0":
                return ValueDefinitions_1.FanLevels_Int.OFF;
            case "01":
            case "1":
                return ValueDefinitions_1.FanLevels_Int.LEVEL_1;
            case "02":
            case "1":
                return ValueDefinitions_1.FanLevels_Int.LEVEL_2;
            case "03":
            case "3":
                return ValueDefinitions_1.FanLevels_Int.LEVEL_3;
            case "04":
            case "4":
                return ValueDefinitions_1.FanLevels_Int.LEVEL_4;
            default:
                this.autovent.log.warn("UNHANDLED VALUE @parseCurrentFanLevel! Was: " + value);
                return ValueDefinitions_1.FanLevels_Int.ERROR;
        }
    }
    parseTemp_Outside(_response) {
        let temp = (this.hexToInt(_response.slice(-4)) / 10.0);
        this.autovent.writeLog("New TEMP: " + temp);
        return temp;
    }
    hexToInt(_hex) {
        if (_hex.length % 2 != 0) {
            _hex = "0" + _hex;
        }
        let num = parseInt(_hex, 16);
        let maxVal = Math.pow(2, _hex.length / 2 * 8);
        if (num > maxVal / 2 - 1) {
            num = num - maxVal;
        }
        return num;
    }
}
exports.ValueParser = ValueParser;
