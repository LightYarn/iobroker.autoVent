import { OperatingModes_Int, FanLevels_Int } from "./ValueDefinitions";
import { autoVent } from "../main";

export class ValueParser
{
    private autoVent: autoVent;

    constructor(_autoVent: autoVent)
    {
        this.autoVent = _autoVent;
    }

    public parseOperatingMode(_response: string): OperatingModes_Int
    {
        let value: string = _response.slice(-2);

        switch (value)
        {
            case "00":
                return OperatingModes_Int.OFF;

            case "01":
                return OperatingModes_Int.MANUAL;

            case "02":
                return OperatingModes_Int.WINTER;

            case "03":
                return OperatingModes_Int.SUMMER;

            case "04":
                return OperatingModes_Int.SUMMER_EX;

            default:
                this.autoVent.log.warn("UNHANDLED VALUE @parseOperatingMode! Was: " + value);
                return OperatingModes_Int.ERROR;
        }
    }

    public parseManualFanLevel(_response: string): FanLevels_Int
    {
        let value: string = _response.slice(-2);

        switch (value)
        {
            case "00":
            case "0":
                return FanLevels_Int.OFF;

            case "01":
            case "1":                
                return FanLevels_Int.LEVEL_1;

            case "02":
            case "2":    
                return FanLevels_Int.LEVEL_2;

            case "03":
            case "3":
                return FanLevels_Int.LEVEL_3;

            case "04":
            case "4":
                return FanLevels_Int.LEVEL_4;

            case "05":
            case "5":
                return FanLevels_Int.AUTO;

            case "06":
            case "6":
                return FanLevels_Int.LINEAR;

            default:
                this.autoVent.log.warn("UNHANDLED VALUE @parseManualFanLevel! Was: " + value);
                return FanLevels_Int.ERROR;
        }
    }

    public parseCurrentFanLevel(_response: string): FanLevels_Int
    {
        let value: string = _response.slice(-2);

        switch (value)
        {
            case "00":
            case "0":
                return FanLevels_Int.OFF;

            case "01":
            case "1":
                return FanLevels_Int.LEVEL_1;

            case "02":
            case "1":
                return FanLevels_Int.LEVEL_2;

            case "03":
            case "3":
                return FanLevels_Int.LEVEL_3;

            case "04":
            case "4":
                return FanLevels_Int.LEVEL_4;           

            default:
                this.autoVent.log.warn("UNHANDLED VALUE @parseCurrentFanLevel! Was: " + value);
                return FanLevels_Int.ERROR;
        }
    }

    public parseTemp_Outside(_response: string): number
    {
        let temp = (this.hexToInt(_response.slice(-4)) / 10.0);
        this.autoVent.writeLog("New TEMP: " + temp);
        return temp;    
    }


    private hexToInt(_hex: string): number
    {
        if (_hex.length % 2 != 0)
        {
            _hex = "0" + _hex;
        }

        let num: number = parseInt(_hex, 16);
        let maxVal: number = Math.pow(2, _hex.length / 2 * 8);

        if (num > maxVal / 2 - 1)
        {
            num = num - maxVal
        }


        return num;
    }
}