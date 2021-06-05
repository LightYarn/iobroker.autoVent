"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectIDs = exports.FanLevels_String = exports.FanLevels_Int = exports.OperatingModes_String = exports.OperatingModes_Int = exports.ReadDataIndex = exports.RegisterAddresses = void 0;
var RegisterAddresses;
(function (RegisterAddresses) {
    RegisterAddresses[RegisterAddresses["OperationMode"] = 100] = "OperationMode";
    RegisterAddresses[RegisterAddresses["ManualFanLevel"] = 101] = "ManualFanLevel";
    RegisterAddresses[RegisterAddresses["CurrentFanLevel"] = 102] = "CurrentFanLevel";
    RegisterAddresses[RegisterAddresses["TempValue_Outside"] = 209] = "TempValue_Outside";
})(RegisterAddresses = exports.RegisterAddresses || (exports.RegisterAddresses = {}));
var ReadDataIndex;
(function (ReadDataIndex) {
    ReadDataIndex[ReadDataIndex["OperationMode"] = 0] = "OperationMode";
    ReadDataIndex[ReadDataIndex["ManualFanLevel"] = 1] = "ManualFanLevel";
    ReadDataIndex[ReadDataIndex["CurrentFanLevel"] = 2] = "CurrentFanLevel";
    ReadDataIndex[ReadDataIndex["TempValue_Outside"] = 3] = "TempValue_Outside";
    ReadDataIndex[ReadDataIndex["DONE"] = 9999] = "DONE";
})(ReadDataIndex = exports.ReadDataIndex || (exports.ReadDataIndex = {}));
var OperatingModes_Int;
(function (OperatingModes_Int) {
    OperatingModes_Int[OperatingModes_Int["OFF"] = 0] = "OFF";
    OperatingModes_Int[OperatingModes_Int["MANUAL"] = 1] = "MANUAL";
    OperatingModes_Int[OperatingModes_Int["WINTER"] = 2] = "WINTER";
    OperatingModes_Int[OperatingModes_Int["SUMMER"] = 3] = "SUMMER";
    OperatingModes_Int[OperatingModes_Int["SUMMER_EX"] = 4] = "SUMMER_EX";
    OperatingModes_Int[OperatingModes_Int["ERROR"] = 99] = "ERROR";
})(OperatingModes_Int = exports.OperatingModes_Int || (exports.OperatingModes_Int = {}));
var OperatingModes_String;
(function (OperatingModes_String) {
    OperatingModes_String["OFF"] = "OFF";
    OperatingModes_String["MANUAL"] = "MANUAL";
    OperatingModes_String["WINTER"] = "WINTER";
    OperatingModes_String["SUMMER"] = "SUMMER";
    OperatingModes_String["SUMMER_EX"] = "SUMMER_EX";
    OperatingModes_String["ERROR"] = "ERROR";
})(OperatingModes_String = exports.OperatingModes_String || (exports.OperatingModes_String = {}));
var FanLevels_Int;
(function (FanLevels_Int) {
    FanLevels_Int[FanLevels_Int["OFF"] = 0] = "OFF";
    FanLevels_Int[FanLevels_Int["LEVEL_1"] = 1] = "LEVEL_1";
    FanLevels_Int[FanLevels_Int["LEVEL_2"] = 2] = "LEVEL_2";
    FanLevels_Int[FanLevels_Int["LEVEL_3"] = 3] = "LEVEL_3";
    FanLevels_Int[FanLevels_Int["LEVEL_4"] = 4] = "LEVEL_4";
    FanLevels_Int[FanLevels_Int["AUTO"] = 5] = "AUTO";
    FanLevels_Int[FanLevels_Int["LINEAR"] = 6] = "LINEAR";
    FanLevels_Int[FanLevels_Int["ERROR"] = 99] = "ERROR";
})(FanLevels_Int = exports.FanLevels_Int || (exports.FanLevels_Int = {}));
var FanLevels_String;
(function (FanLevels_String) {
    FanLevels_String["OFF"] = "OFF";
    FanLevels_String["LEVEL_1"] = "LEVEL_1";
    FanLevels_String["LEVEL_2"] = "LEVEL_2";
    FanLevels_String["LEVEL_3"] = "LEVEL_3";
    FanLevels_String["LEVEL_4"] = "LEVEL_4";
    FanLevels_String["AUTO"] = "AUTO";
    FanLevels_String["LINEAR"] = "LINEAR";
    FanLevels_String["ERROR"] = "ERROR";
})(FanLevels_String = exports.FanLevels_String || (exports.FanLevels_String = {}));
var ObjectIDs;
(function (ObjectIDs) {
    ObjectIDs["lastUpdate"] = "lastUpdate";
    ObjectIDs["operatingMode"] = "operatingMode";
    ObjectIDs["manualFanLevel"] = "manualFanLevel";
    ObjectIDs["currentFanLevel"] = "currentFanLevel";
    ObjectIDs["tempOutside"] = "tempOutside";
})(ObjectIDs = exports.ObjectIDs || (exports.ObjectIDs = {}));
