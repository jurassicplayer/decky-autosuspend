import { Backend, BackendCtx } from './Backend'
import { Logger } from './Logger'

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
enum toastSfx {
  LaunchGame = 'LaunchGame',
  FriendMessage = 'FriendMessage',
  ChatMention = 'ChatMention',
  ChatMessage = 'ChatMessage',
  ToastMessage = 'ToastMessage',
  ToastAchievement = 'ToastAchievement',
  ToastMisc = 'ToastMisc',
  FriendOnline = 'FriendOnline',
  FriendInGame = 'FriendInGame',
  VolSound = 'VolSound',
  ShowModal = 'ShowModal',
  HideModal = 'HideModal',
  IntoGameDetail = 'IntoGameDetail',
  OutOfGameDetail = 'OutOfGameDetail',
  PagedNavigation = 'PagedNavigation',
  ToggleOn = 'ToggleOn',
  ToggleOff = 'ToggleOff',
  SliderUp = 'SliderUp',
  SliderDown = 'SliderDown',
  ChangeTabs = 'ChangeTabs',
  DefaultOk = 'DefaultOk',
  OpenSideMenu = 'OpenSideMenu',
  CloseSideMenu = 'CloseSideMenu',
  BasicNav = 'BasicNav',
  FailedNav = 'FailedNav',
  Typing = 'Typing'
}
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
  sortOrder: number
}
interface Alarms {
  [uniqueid: string]: AlarmSetting
}

export interface SettingsProps {
  defaultShowToast: boolean
  defaultPlaySound: boolean
  defaultSound: string
  defaultAlarmType: string
  defaultAlarmRepeat: number
  alarms: Alarms
}
// #endregion

// #region Default application settings
export const defaultSettings: SettingsProps = {
  defaultShowToast: true,
  defaultPlaySound: true,
  defaultSound: toastSfx.ToastMisc,
  defaultAlarmType: alarmTypes.none,
  defaultAlarmRepeat: 0,
  alarms: {
    defaultWarning: {
      alarmName: 'Warning 20%',
      thresholdLevel: 20,
      thresholdType: thresholdTypes.discharge,
      triggeredAction: triggerActions.none,
      sortOrder: 0
    },
    defaultCritical: {
      alarmName: 'Critical 15%',
      thresholdLevel: 15,
      thresholdType: thresholdTypes.discharge,
      triggeredAction: triggerActions.suspend,
      sortOrder: 1
    }
  } 
}
// #endregion
export class SettingsManager {
  static async saveToFile(userSettings: SettingsProps) {
    let settings: {[key:string]: any} = {...userSettings}
    for (let key in settings) {
      await BackendCtx.setSetting(key, settings[key])
    }
  }
  static async loadFromFile() {
    let settings: {[key:string]: any} = {...defaultSettings}
    let invalidNotices: string[] = []
    for (let key in settings) {
      let setting = await BackendCtx.getSetting(key, settings[key])
      // Validate settings: remove wrong base typing (number, string, boolean, etc.)
      if ((typeof setting) != (typeof settings[key])) {
        invalidNotices.push(`Invalid setting [${key}]: expected ${typeof settings[key]}, found ${typeof setting}`)
        continue
      }
      // Validate settings: remove wrong interface typing (toastSfx, alarmTypes, thresholdTypes, triggerActions)
      if (key == 'defaultSound' && !Object.values(toastSfx).includes(setting as toastSfx)) {
        invalidNotices.push(`Invalid setting [${key}]: "${setting}" is not a valid sound`)
        continue
      }
      if (key == 'defaultAlarmType' && !Object.values(alarmTypes).includes(setting as alarmTypes)) {
        invalidNotices.push(`Invalid setting [${key}]: "${setting}" is not a valid alarm type`)
        continue
      }
      if (key == 'alarms' && (typeof setting) != 'string') {
        // @ts-ignore
        let alarms: Alarms = setting 
        for (let alarm in alarms) {
          let alarmInvalidNotices = this.validateAlarm(alarms[alarm])
          if (alarmInvalidNotices.length > 0) {
            invalidNotices.push(`Invalid alarm configuration: ${alarm}`)
            invalidNotices = invalidNotices.concat(alarmInvalidNotices)
            delete alarms[alarm]
          }
        }
      }
      settings[key] = setting
    }
    if (invalidNotices.length > 0) { Logger.warning(invalidNotices.join('\n')) }
    return settings as SettingsProps
  }

  static validateAlarm(alarmSettings: AlarmSetting) {
    let defaults:{[key:string]: any} = {
      showToast: true,
      playSound: true,
      sound: 'ToastMisc',
      alarmType: 'none',
      alarmRepeat: 0,
      alarmName: 'defaults',
      thresholdLevel: 0,
      thresholdType: 'discharge',
      triggeredAction: 'none',
      sortOrder: 0
    }
    let settings: {[key:string]: any} = {...alarmSettings}
    let nullableSettings = ['showToast', 'playSound', 'sound', 'alarmType', 'alarmRepeat']
    let invalidNotices: string[] = []
    for (let key in defaults) {
      // Validate settings: remove wrong base typing (number, string, boolean, etc.)
      let setting = settings[key]
      if (!(typeof setting == typeof defaults[key] || (typeof setting == 'undefined' && nullableSettings.includes(key)))) {
        invalidNotices.push(`\tInvalid setting [${key}]: expected ${typeof defaults[key]}, found ${typeof setting}`)
        continue
      }
      // Validate settings: remove wrong interface typing (toastSfx, alarmTypes, thresholdTypes, triggerActions)
      if (key == 'sound' && (!Object.values(toastSfx).includes(setting as toastSfx) && (typeof setting) != 'undefined')) {
        invalidNotices.push(`\tInvalid setting [${key}]: "${setting}" is not a valid sound`)
        continue
      }
      if (key == 'alarmType' && (!Object.values(alarmTypes).includes(setting as alarmTypes) && (typeof setting) != 'undefined')) {
        invalidNotices.push(`\tInvalid setting [${key}]: "${setting}" is not a valid alarm type`)
        continue
      }
      if (key == 'thresholdType' && !Object.values(thresholdTypes).includes(setting as thresholdTypes)) {
        invalidNotices.push(`\tInvalid setting [${key}]: "${setting}" is not a valid threshold type`)
        continue
      }
      if (key == 'triggeredAction' && !Object.values(triggerActions).includes(setting as triggerActions)) {
        invalidNotices.push(`\tInvalid setting [${key}]: "${setting}" is not a valid trigger action`)
        continue
      }
    }
    return invalidNotices
  }
}