import { ReactNode } from "react"
import { SettingsManager } from "./Settings"

// export interface Alarm {
//   evaluate(): void
//   registerHooks(): void
//   registerEvents(): void
//   unregisterEvents(): void
//   settingElement(): React.ReactNode
// }

// export class DischargeAlarm implements Alarm {
//   private settings: DischargeAlarmSetting
//   private history: DischargeAlarmHistory
//   evaluate(): void {
//     throw new Error("Method not implemented.")
//   }
//   registerHooks(): void {
//     throw new Error("Method not implemented.")
//   }
//   registerEvents(): void {
//     throw new Error("Method not implemented.")
//   }
//   unregisterEvents(): void {
//     throw new Error("Method not implemented.")
//   }
//   settingElement(): ReactNode {
//     throw new Error("Method not implemented.")
//   }
// }


// interface BaseAlarmHistory {
//   triggered: boolean
//   lastTriggered: number
// }

// interface DischargeAlarmHistory extends BaseAlarmHistory {}
// interface OverchargeAlarmHistory extends BaseAlarmHistory {}
// interface DailyAlarmHistory extends BaseAlarmHistory {
//   lastUpdatedTime: number
//   currentPlayTime: number
// }

// interface AlarmHistory extends DischargeAlarmHistory {}
// interface AlarmHistory extends OverchargeAlarmHistory {}
// interface AlarmHistory extends DailyAlarmHistory {}

interface BaseAlarmHistory {
  triggered: boolean
  lastTriggered: number

}
type DischargeAlarmHistory = BaseAlarmHistory
type DailyAlarmHistory = BaseAlarmHistory & {
  lastUpdatedTime?: number
  currentPlayTime?: number
}
type SessionAlarmHistory = BaseAlarmHistory & {
  sessionStartTime?: number
}
type AlarmHistory = DischargeAlarmHistory | DailyAlarmHistory | SessionAlarmHistory


let history: AlarmHistory = {
  triggered: true,
  lastTriggered: 100,
  sessionStartTime: 0
}






interface IObjectKeys {
  [key: string]: any
}
interface ISettingsProps {
  defaultShowToast: boolean
  defaultPlaySound: boolean
  defaultSound: string
  defaultRepeatToast: boolean
  defaultRepeatSound: boolean
  defaultAlarmRepeat: number
  debuggingMode: boolean
  alarms: { [uniqueid: string]: IAlarmSetting }
}

export interface IAlarmSetting extends IObjectKeys {
  showToast?: boolean
  playSound?: boolean
  sound?: string
  repeatToast?: boolean
  repeatSound?: boolean
  alarmRepeat?: number
  alarmName: string
  alarmMessage?: string
  thresholdLevel: number
  thresholdType: eAlarmType
  triggeredAction: eTriggerActions
  enabled: boolean
  profile?: string
  sortOrder: number
}
interface ISettingsContext {
  getSettings: () => ISettingsProps
  getSetting: (key: string) => any
  setSetting: (key: string, value: any) => void
  getAlarmSettings: (alarmID: string) => IAlarmSetting
  setAlarmSettings: (alarmID: string, alarmSettings: IAlarmSetting) => void
  getAlarmSetting: (alarmID: string, key: string) => any
  setAlarmSetting: (alarmID: string, key: string, value: any) => void
  deleteAlarmSetting: (alarmID: string, key: string) => void
  addAlarm: (alarmID: string, alarmSettings: IAlarmSetting) => void
  deleteAlarm: (alarmID: string) => void
}
interface IAlarmHistory {
  triggered: boolean
  lastTriggered: number
}
export enum eAlarmType {
  notimplemented = 'notimplemented',
  overcharge = 'overcharge',
  discharge = 'discharge',
  dailyPlaytime = 'dailyPlaytime',
  sessionPlaytime = 'sessionPlaytime',
  bedtime = 'bedtime',
  downloadComplete = 'downloadComplete',
  inactivity = 'inactivity'
}
export enum eTriggerActions {
  none = 'none',
  suspend = 'suspend',
  shutdown = 'shutdown'
}
export interface IAlarm {
  id: string
  type: eAlarmType
  setting: IAlarmSetting
  get history(): IAlarmHistory
  set history(data: IAlarmHistory)
  // context: ISettingsContext
  evaluate(): void
  registerHooks(): void
  registerEvents(): void
  unregisterEvents(): void
  component(): ReactNode
  sendNotification(): void
  save(): void
  delete(): void
  toDischargeAlarm(): IAlarm
  toOverchargeAlarm(): IAlarm
  toBedtimeAlarm(): IAlarm
  toDailyAlarm(): IAlarm
  toSessionAlarm(): IAlarm
  toDownloadAlarm(): IAlarm
  toInactivityAlarm(): IAlarm
}
const localStorageKey = 'autosuspend-alarms'
function getAlarmHistories(): {[key: string]: AlarmHistory} {
  let s_histories = localStorage.getItem(localStorageKey)
  return JSON.parse(s_histories ? s_histories : '{}')
}
function uuidv4() {
  // @ts-ignore
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16))
}
class Alarm implements IAlarm {
  id: string 
  type: eAlarmType
  setting: IAlarmSetting
  get history() {
    let histories = getAlarmHistories()
    let alarmHistory: IAlarmHistory = (this.id in histories) ? histories[this.id] : { triggered: false, lastTriggered: 0 }
    return alarmHistory
  }
  set history(data: IAlarmHistory) {
    let histories = getAlarmHistories()
    if (data === undefined) { delete histories[this.id] }
    else if (data) { histories[this.id] = data }
    localStorage.setItem(localStorageKey, JSON.stringify(histories))
  }
  // context: ISettingsContext
  static defaultSetting: IAlarmSetting = {
    alarmName: "Not Implemented",
    thresholdLevel: 0,
    thresholdType: eAlarmType.notimplemented,
    triggeredAction: eTriggerActions.none,
    enabled: false,
    sortOrder: 0
  }
  constructor(setting: IAlarmSetting, alarmID?: string) {
    // this.context = context
    if (alarmID !== undefined) {
      this.id = alarmID
    } else {
      this.id = uuidv4()
    }
    if (setting !== undefined) {
      this.setting = setting
      this.type = setting.thresholdType
    } else {
      this.setting = Alarm.defaultSetting
      this.type = Alarm.defaultSetting.thresholdType
    }
  }
  evaluate(): void {
    throw new Error("Method not implemented.")
  }
  registerHooks(): void {
    throw new Error("Method not implemented.")
  }
  registerEvents(): void {
    throw new Error("Method not implemented.")
  }
  unregisterEvents(): void {
    throw new Error("Method not implemented.")
  }
  component(): ReactNode {
    throw new Error("Method not implemented.")
  }
  sendNotification(): void {
    // should implement here
    throw new Error("Method not implemented.")
  }
  save(): void {
    // should implement here
    SettingsManager.saveToFile
  }
  delete(): void {
    // should implement here
    throw new Error("Method not implemented.")
  }
  toDischargeAlarm(thresholdLevel?: number): IAlarm {
    return new DischargeAlarm(thresholdLevel ? {...this.setting, thresholdLevel: thresholdLevel} : this.setting)
  }
  toOverchargeAlarm(thresholdLevel?: number): IAlarm {
    return new OverchargeAlarm(thresholdLevel ? {...this.setting, thresholdLevel: thresholdLevel} : this.setting)
  }
  toBedtimeAlarm(thresholdLevel?: number): IAlarm {
    return new BedtimeAlarm(thresholdLevel ? {...this.setting, thresholdLevel: thresholdLevel} : this.setting)
  }
  toDailyAlarm(thresholdLevel?: number): IAlarm {
    return new DailyAlarm(thresholdLevel ? {...this.setting, thresholdLevel: thresholdLevel} : this.setting)
  }
  toSessionAlarm(thresholdLevel?: number): IAlarm {
    return new SessionAlarm(thresholdLevel ? {...this.setting, thresholdLevel: thresholdLevel} : this.setting)
  }
  toDownloadAlarm(thresholdLevel?: number): IAlarm {
    return new DownloadAlarm(thresholdLevel ? {...this.setting, thresholdLevel: thresholdLevel} : this.setting)
  }
  toInactivityAlarm(thresholdLevel?: number): IAlarm {
    return new InactivityAlarm(thresholdLevel ? {...this.setting, thresholdLevel: thresholdLevel} : this.setting)
  }
}
class DischargeAlarm extends Alarm {
  static defaultSetting: IAlarmSetting = {
    alarmName: "Discharge",
    thresholdLevel: 20,
    thresholdType: eAlarmType.discharge,
    triggeredAction: eTriggerActions.suspend,
    enabled: false,
    sortOrder: 0
  }
  constructor(setting?: IAlarmSetting, alarmID?: string) {
    super(setting ? setting : DischargeAlarm.defaultSetting, alarmID)
  }
}
class OverchargeAlarm extends Alarm {
  static defaultSetting: IAlarmSetting = {
    alarmName: "Overcharge",
    thresholdLevel: 80,
    thresholdType: eAlarmType.overcharge,
    triggeredAction: eTriggerActions.none,
    enabled: false,
    sortOrder: 0
  }
  constructor(setting?: IAlarmSetting, alarmID?: string) {
    super(setting ? setting : OverchargeAlarm.defaultSetting, alarmID)
  }
}
class BedtimeAlarm extends Alarm {
  static defaultSetting: IAlarmSetting = {
    alarmName: "Bedtime",
    thresholdLevel: 79200000,
    thresholdType: eAlarmType.bedtime,
    triggeredAction: eTriggerActions.suspend,
    enabled: false,
    sortOrder: 0
  }
  constructor(setting?: IAlarmSetting, alarmID?: string) {
    super(setting ? setting : BedtimeAlarm.defaultSetting, alarmID)
  }
}
class DailyAlarm extends Alarm {
  static defaultSetting: IAlarmSetting = {
    alarmName: "Daily",
    thresholdLevel: 14400000,
    thresholdType: eAlarmType.dailyPlaytime,
    triggeredAction: eTriggerActions.suspend,
    enabled: false,
    sortOrder: 0
  }
  constructor(setting?: IAlarmSetting, alarmID?: string) {
    super(setting ? setting : DailyAlarm.defaultSetting, alarmID)
  }
}
class SessionAlarm extends Alarm {
  static defaultSetting: IAlarmSetting = {
    alarmName: "Session",
    thresholdLevel: 7200000,
    thresholdType: eAlarmType.sessionPlaytime,
    triggeredAction: eTriggerActions.suspend,
    enabled: false,
    sortOrder: 0
  }
  constructor(setting?: IAlarmSetting, alarmID?: string) {
    super(setting ? setting : SessionAlarm.defaultSetting, alarmID)
  }
}
class DownloadAlarm extends Alarm {
  static defaultSetting: IAlarmSetting = {
    alarmName: "Download",
    thresholdLevel: 600000,
    thresholdType: eAlarmType.downloadComplete,
    triggeredAction: eTriggerActions.suspend,
    enabled: false,
    sortOrder: 0
  }
  constructor(setting?: IAlarmSetting, alarmID?: string) {
    super(setting ? setting : DownloadAlarm.defaultSetting, alarmID)
  }
}
class InactivityAlarm extends Alarm {
  static defaultSetting: IAlarmSetting = {
    alarmName: "Inactivity",
    thresholdLevel: 600000,
    thresholdType: eAlarmType.inactivity,
    triggeredAction: eTriggerActions.suspend,
    enabled: false,
    sortOrder: 0
  }
  constructor(setting?: IAlarmSetting, alarmID?: string) {
    super(setting ? setting : InactivityAlarm.defaultSetting, alarmID)
  }
}
export class Alarms {
  static create(type?: eAlarmType, setting?: IAlarmSetting, alarmID?: string): IAlarm {
    let alarmType: eAlarmType
    if (setting) { alarmType = setting.thresholdType }
    else if (type) { alarmType = type }
    else { throw new Error("No alarm type specified") }

    switch (alarmType) {
      case eAlarmType.discharge:
        return new DischargeAlarm(setting, alarmID)
      case eAlarmType.overcharge:
        return new OverchargeAlarm(setting, alarmID)
      case eAlarmType.bedtime:
        return new BedtimeAlarm(setting, alarmID)
      case eAlarmType.dailyPlaytime:
        return new DailyAlarm(setting, alarmID)
      case eAlarmType.sessionPlaytime:
        return new SessionAlarm(setting, alarmID)
      case eAlarmType.downloadComplete:
        return new DownloadAlarm(setting, alarmID)
      case eAlarmType.inactivity:
        return new InactivityAlarm(setting, alarmID)
      default:
        throw new Error(`Alarm type not implemented: ${alarmType}`)
    }
  }
}