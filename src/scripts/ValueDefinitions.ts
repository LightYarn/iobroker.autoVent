export enum RegisterAddresses
{
    OperationMode      = 100,
    ManualFanLevel      = 101,
    CurrentFanLevel     = 102,
    TempValue_Outside   = 209
}

export enum ReadDataIndex
{
    OperationMode      = 0,
    ManualFanLevel      = 1,
    CurrentFanLevel     = 2,
    TempValue_Outside   = 3,


    DONE = 9999
}

export enum OperatingModes_Int
{
    OFF         = 0,
    MANUAL      = 1,
    WINTER      = 2,
    SUMMER      = 3,
    SUMMER_EX   = 4,



    ERROR = 99
}

export enum OperatingModes_String
{
    OFF = 'OFF',
    MANUAL = 'MANUAL',
    WINTER = 'WINTER',
    SUMMER = 'SUMMER',
    SUMMER_EX = 'SUMMER_EX',



    ERROR = 'ERROR'
}

export enum FanLevels_Int
{
    OFF     = 0,
    LEVEL_1 = 1,
    LEVEL_2 = 2,
    LEVEL_3 = 3,
    LEVEL_4 = 4,
    AUTO    = 5,
    LINEAR  = 6,



    ERROR   = 99
}

export enum FanLevels_String
{
    OFF = 'OFF',
    LEVEL_1 = 'LEVEL_1',
    LEVEL_2 = 'LEVEL_2',
    LEVEL_3 = 'LEVEL_3',
    LEVEL_4 = 'LEVEL_4',
    AUTO = 'AUTO',
    LINEAR = 'LINEAR',



    ERROR = 'ERROR'
}

export enum ObjectIDs
{
    lastUpdate = "lastUpdate",
    operatingMode = "operatingMode",
    manualFanLevel = "manualFanLevel",
    currentFanLevel = "currentFanLevel",
    tempOutside = "tempOutside",
}