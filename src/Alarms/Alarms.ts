import { IAlarm, IAlarmConstructor, IAlarmSettings, IMetadata } from "./Alarms.h";
import discharge from "./Battery/Discharge/Discharge"
import overcharge from "./Battery/Overcharge/Overcharge"
export function createAlarm(ctor: IAlarmConstructor, alarmSettings?: IAlarmSettings): IAlarm {
  return new ctor(alarmSettings)
}

export var alarmTypes: IMetadata[] = [discharge, overcharge]