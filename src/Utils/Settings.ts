import { BackendCtx } from './Backend'
import { Logger } from './Logger'
import { NavSoundMap } from './SteamUtils'


// #region Enumerations
export enum alarmTypes {
  none = 'none',
  repeatToast = 'repeatToast',
  repeatSound = 'repeatSound',
  repeatBoth = 'repeatBoth'
}
export enum thresholdTypes {
  overcharge = 'overcharge',
  discharge = 'discharge',
  dailyPlaytime = 'dailyPlaytime',
  bedtime = 'bedtime'
}
export enum triggerActions {
  none = 'none',
  suspend = 'suspend'
}
// #endregion

// #region Interfaces
export interface AlarmSetting {
  showToast?: boolean
  playSound?: boolean
  sound?: string
  alarmType?: alarmTypes
  alarmRepeat?: number
  alarmName: string
  alarmMessage?: string
  thresholdLevel: number
  thresholdType: thresholdTypes
  triggeredAction: triggerActions
  enabled: boolean
  profile?: string
  sortOrder: number
}
interface Alarms {
  [uniqueid: string]: AlarmSetting
}
interface AlarmHistory {
  triggered: boolean
  lastTriggered?: number
  sessionStartTime?: number
  currentPlayTime?: number
}

export interface SettingsProps {
  defaultShowToast: boolean
  defaultPlaySound: boolean
  defaultSound: string
  defaultAlarmType: string
  defaultAlarmRepeat: number
  debuggingMode: boolean
  alarms: Alarms
}
// #endregion

// #region Default application settings
export const defaultSettings: SettingsProps = {
  defaultShowToast: true,
  defaultPlaySound: true,
  defaultSound: NavSoundMap.ToastMisc,
  defaultAlarmType: alarmTypes.none,
  defaultAlarmRepeat: 0,
  debuggingMode: false,
  alarms: {
    defaultWarning: {
      alarmName: 'Warning 20%',
      thresholdLevel: 20,
      thresholdType: thresholdTypes.discharge,
      triggeredAction: triggerActions.none,
      enabled: true,
      sortOrder: 0
    },
    defaultCritical: {
      alarmName: 'Critical 15%',
      thresholdLevel: 15,
      thresholdType: thresholdTypes.discharge,
      triggeredAction: triggerActions.suspend,
      enabled: true,
      sortOrder: 1
    }
  } 
}
const exampleAlarmSettings: AlarmSetting = {
  showToast: true,
  playSound: true,
  sound: NavSoundMap[6],
  alarmType: alarmTypes.none,
  alarmRepeat: 0,
  alarmName: '',
  alarmMessage: '',
  thresholdLevel: 0,
  thresholdType: thresholdTypes.discharge,
  triggeredAction: triggerActions.none,
  enabled: true,
  profile: '',
  sortOrder: 0
}
// #endregion

export class SettingsManager {
  static settings: SettingsProps = defaultSettings
  static userSettings: SettingsProps
  static async saveToFile(userSettings: SettingsProps) {
    let settings: {[key:string]: any} = {...userSettings}
    let promises = Object.keys(settings).map(key => {
      return BackendCtx.setSetting(key, settings[key])
    })
    Promise.all(promises).then(async () => {
      await BackendCtx.commitSettings()
    })
    Logger.info('Saved user settings')
  }

  static async loadFromFile() {
    let userSettings: {[key:string]: any} = {}
    let validSettings: {[key:string]: any} = {...defaultSettings}
    for (let key in validSettings) {
      userSettings[key] = await BackendCtx.getSetting(key, validSettings[key])
    }
    this.userSettings = userSettings as SettingsProps
    this.settings = await this.validateSettings(this.userSettings)
    Logger.info('Loaded user settings')
    return this.settings
  }

  static validateSettings(settings: SettingsProps): SettingsProps {
    let userSettings: {[key:string]: any} = {...settings}
    let validSettings: {[key:string]: any} = {...defaultSettings}
    let alarmSettings: {[key:string]: any} = {...exampleAlarmSettings}
    let invalidNotices: string[] = []
    for (let key in validSettings) {
      let settingValidation = this.validateKey(key, userSettings[key], validSettings[key])
      if (settingValidation == 'valid') {
        validSettings[key] = userSettings[key]
      } else {
        invalidNotices.push(`\t${settingValidation}`)
      }
      if (key == 'alarms' && (typeof userSettings[key]) != 'string') {
        let alarms: Alarms = {...userSettings[key]}
        for (let alarmID in alarms) {
          let invalidAlarm = false
          let alarm: {[key:string]: any} = {...alarms[alarmID]}
          let validAlarm: {[key:string]: any} = {}
          for (let alarmKey in alarmSettings) {
            let alarmValidation = this.validateKey(alarmKey, alarm[alarmKey], alarmSettings[alarmKey])
            if (alarmValidation == 'valid') {
              validAlarm[alarmKey] = alarm[alarmKey]
            } else {
              invalidAlarm = true
              invalidNotices.push(`\t\t[${alarmID}] ${alarmValidation}`)
            }
          }
          if (invalidAlarm) { delete alarms[alarmID] }
        }
        validSettings[key] = alarms
      }
    }
    if (invalidNotices.length > 0) {
      invalidNotices.unshift('Invalid settings:')
      Logger.warning(invalidNotices.join('\n'))
      console.log(invalidNotices.join('\n'))
    }
    return validSettings as SettingsProps
  }

  static validateKey(key: string, setting: any, defaults: any) {
    let invalidNotice: string = 'valid'
    let nullableSettings = ['showToast', 'playSound', 'sound', 'alarmType', 'alarmRepeat', 'alarmMessage', 'profile']
    // Validate settings: remove wrong base typing (number, string, boolean, object, undefined)
    if (!(typeof setting == typeof defaults) && !(typeof setting == 'undefined' && nullableSettings.includes(key))) {
      invalidNotice = `[${key}]: expected ${typeof defaults}, found ${typeof setting}`
    } else
    // Validate settings: remove wrong interface typing (navSound, alarmTypes, thresholdTypes, triggerActions)
    if (['defaultSound', 'sound'].includes(key) && (!(setting in NavSoundMap) && (typeof setting) != 'undefined')) {
      invalidNotice = `[${key}]: "${setting}" is not a valid sound`
    } else
    if (['defaultAlarmType', 'alarmType'].includes(key) && (!Object.values(alarmTypes).includes(setting as alarmTypes) && (typeof setting) != 'undefined')) {
      invalidNotice = `[${key}]: "${setting}" is not a valid alarm type`
    } else
    if (key == 'thresholdType' && !Object.values(thresholdTypes).includes(setting as thresholdTypes)) {
      invalidNotice = `[${key}]: "${setting}" is not a valid threshold type`
    } else
    if (key == 'triggeredAction' && !Object.values(triggerActions).includes(setting as triggerActions)) {
      invalidNotice = `[${key}]: "${setting}" is not a valid trigger action`
    }
    return invalidNotice
  }

  static getAlarmHistory(alarmID: string): AlarmHistory | null {
    let s_histories = localStorage.getItem('autosuspend-alarms')
    let histories: {[key: string]: AlarmHistory} = JSON.parse(s_histories ? s_histories : '{}')
    let history = null
    if (alarmID in histories) { history = histories[alarmID] }
    return history
  }
  static setAlarmHistory(alarmID: string, history: AlarmHistory) {
    let s_histories = localStorage.getItem('autosuspend-alarms')
    let histories = JSON.parse(s_histories ? s_histories : '{}')
    histories[alarmID] = history
    localStorage.setItem('autosuspend-alarms', JSON.stringify(histories))
  }
}