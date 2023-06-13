import { Backend, BackendCtx } from './Backend'
import { Logger } from './Logger'
import { NavSoundMap } from './SteamUtils'

export class Settings {
  public static showToast: boolean = true
  public static playSound: boolean = true
  public static warningEnabled: boolean = true
  public static criticalEnabled: boolean = true
  public static overchargeEnabled: boolean = false
  public static warningLevel: number = 20
  public static criticalLevel: number = 10
  public static overchargeLevel: number = 80

  static async loadFromLocalStorage() {
    let settings = "[AutoSuspend] Loaded settings from storage"
    for (let key in this) {
      try {
        if (typeof this[key] == "boolean") this[key] = (await Backend.getSetting(key, this[key])) as boolean
        else if (typeof this[key] == "number") this[key] = (await Backend.getSetting(key, this[key])) as number
        else if (typeof this[key] == "string") this[key] = (await Backend.getSetting(key, this[key])) as string
        else if (this[key] instanceof Date) this[key] = new Date((await Backend.getSetting(key, this[key])).toString())
        settings += `\n\t${key}: ${this[key]}`
      } catch (error) {
        console.debug(`[AutoSuspend] Failed to load setting: ${key}`)
      }
    }
    console.debug(settings)
  }

  static async saveToLocalStorage() {
    let promises = Object.keys(this).map(key => {
      return Backend.setSetting(key, this[key])
    })
    Promise.all(promises).then(async () => {
      await Backend.commitSettings()
      console.debug("[AutoSuspend] Saved settings to storage")
    })
  }
}






// #region Enumerations
enum alarmTypes {
  none = 'none',
  repeatToast = 'repeatToast',
  repeatSound = 'repeatSound',
  repeatBoth = 'repeatBoth'
}
enum thresholdTypes {
  overcharge = 'overcharge',
  discharge = 'discharge',
  dailyPlaytime = 'dailyPlaytime',
  bedtime = 'bedtime'
}
enum triggerActions {
  none = 'none',
  suspend = 'suspend'
}
// #endregion

// #region Interfaces
interface AlarmSetting {
  showToast?: boolean
  playSound?: boolean
  sound?: string
  alarmType?: alarmTypes
  alarmRepeat?: number
  alarmName: string
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
  lastTriggered: number
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
  alarmName: 'defaults',
  thresholdLevel: 0,
  thresholdType: thresholdTypes.discharge,
  triggeredAction: triggerActions.none,
  enabled: true,
  profile: 'deck',
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
    let settings: {[key:string]: any} = {...defaultSettings}
    let validSettings: {[key:string]: any} = {...defaultSettings}
    let alarmSettings: {[key:string]: any} = {...exampleAlarmSettings}
    let userSettings: {[key:string]: any} = {}
    let invalidNotices: string[] = []
    for (let key in settings) {
      userSettings[key] = await BackendCtx.getSetting(key, settings[key])
      let settingValidation = this.validateKey(key, userSettings[key], settings[key])
      if (settingValidation == 'valid') {
        validSettings[key] = userSettings[key]
      } else {
        validSettings[key] = settings[key]
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
    let allSettings = { validSettings: (validSettings as SettingsProps), userSettings: (userSettings as SettingsProps) }
    Logger.info('Loaded user settings')
    return allSettings
  }

  static validateKey(key: string, setting: any, defaults: any) {
    let invalidNotice: string = 'valid'
    let nullableSettings = ['showToast', 'playSound', 'sound', 'alarmType', 'alarmRepeat', 'profile']
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
    Logger.debug(`GetAlarmHistory [${alarmID}]: ${JSON.stringify(history)}`)
    return history
  }
  static setAlarmHistory(alarmID: string, history: AlarmHistory) {
    let s_histories = localStorage.getItem('autosuspend-alarms')
    let histories = JSON.parse(s_histories ? s_histories : '{}')
    histories[alarmID] = history
    localStorage.setItem('autosuspend-alarms', JSON.stringify(histories))
    Logger.debug(`SetAlarmHistory [${alarmID}]: ${JSON.stringify(history)}`)
  }
}