import { BackendCtx } from './Backend'
import { Logger } from './Logger'
import { NavSoundMap } from './SteamUtils'
import { Alarms, AlarmSetting, SettingsProps, thresholdLevels, thresholdTypes, triggerActions } from './Interfaces'

// #region Default application settings
export const defaultSettings: SettingsProps = {
  defaultShowToast: true,
  defaultPlaySound: true,
  defaultSound: NavSoundMap[6],
  defaultRepeatToast: false,
  defaultRepeatSound: false,
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
export const thresholdLevelDefaults: thresholdLevels = {
  discharge: 20,
  overcharge: 80,
  bedtime: 79200000, // 10pm
  dailyPlaytime: 14400000, // 4 hours
  sessionPlaytime: 7200000, // 2 hours
  downloadComplete: 600000 // 10 minutes
}
const exampleAlarmSettings: AlarmSetting = {
  showToast: true,
  playSound: true,
  sound: NavSoundMap[6],
  repeatToast: false,
  repeatSound: false,
  alarmRepeat: 0,
  alarmName: '',
  alarmMessage: '',
  thresholdLevel: 0,
  thresholdType: thresholdTypes.discharge,
  triggeredAction: triggerActions.none,
  enabled: false,
  profile: '',
  sortOrder: 0
}
// #endregion

export class SettingsManager {
  static debuggingMode: boolean = false
  static async saveToFile(userSettings: SettingsProps) {
    let settings = userSettings
    let promises = Object.keys(settings).map(key => {
      return BackendCtx.setSetting(key, settings[key])
    })
    Promise.all(promises).then(async () => {
      await BackendCtx.commitSettings()
    })
    Logger.info(`Saved user settings:\n${JSON.stringify(settings, null, 2)}`)
  }

  static async loadFromFile() {
    let userSettings: {[key:string]: any} = {}
    let validSettings = defaultSettings
    for (let key in validSettings) {
      userSettings[key] = await BackendCtx.getSetting(key, validSettings[key])
    }
    //this.userSettings = userSettings as SettingsProps
    let settings = await this.validateSettings(userSettings as SettingsProps)
    this.debuggingMode = settings.debuggingMode
    Logger.info(`Loaded user settings:\n${JSON.stringify(settings, null, 2)}`)
    return settings
  }

  static validateSettings(settings: SettingsProps): SettingsProps {
    let userSettings = settings
    let validSettings = defaultSettings
    let alarmSettings = exampleAlarmSettings
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
    let nullableSettings = ['showToast', 'playSound', 'sound', 'repeatToast', 'repeatSound', 'alarmRepeat', 'alarmMessage', 'profile']
    // Validate settings: remove wrong base typing (number, string, boolean, object, undefined)
    if (!(typeof setting == typeof defaults) && !(typeof setting == 'undefined' && nullableSettings.includes(key))) {
      invalidNotice = `[${key}]: expected ${typeof defaults}, found ${typeof setting}`
    } else
    // Validate settings: remove wrong interface typing (navSound, alarmTypes, thresholdTypes, triggerActions)
    if (['defaultSound', 'sound'].includes(key) && (!(setting in NavSoundMap) && (typeof setting) != 'undefined')) {
      invalidNotice = `[${key}]: "${setting}" is not a valid sound`
    } else
    if (key == 'thresholdType' && !Object.values(thresholdTypes).includes(setting as thresholdTypes)) {
      invalidNotice = `[${key}]: "${setting}" is not a valid threshold type`
    } else
    if (key == 'triggeredAction' && !Object.values(triggerActions).includes(setting as triggerActions)) {
      invalidNotice = `[${key}]: "${setting}" is not a valid trigger action`
    }
    return invalidNotice
  }
}

export function applyDefaults(settings: AlarmSetting, defaults: SettingsProps) {
  let { showToast, playSound, sound, repeatToast, repeatSound, alarmRepeat, alarmMessage } = settings
  let { defaultShowToast, defaultPlaySound, defaultSound, defaultRepeatToast, defaultRepeatSound, defaultAlarmRepeat } = defaults
  let showToastOrDefault    = (typeof showToast     != 'undefined') ? showToast    : defaultShowToast
  let playSoundOrDefault    = (typeof playSound     != 'undefined') ? playSound    : defaultPlaySound
  let soundOrDefault        = (typeof sound         != 'undefined') ? sound        : defaultSound
  let repeatToastOrDefault  = (typeof repeatToast   != 'undefined') ? repeatToast  : defaultRepeatToast
  let repeatSoundOrDefault  = (typeof repeatSound   != 'undefined') ? repeatSound  : defaultRepeatSound
  let alarmRepeatOrDefault  = (typeof alarmRepeat   != 'undefined') ? alarmRepeat  : defaultAlarmRepeat
  let alarmMessageOrBlank   = (typeof alarmMessage  != 'undefined') ? alarmMessage : ""
  let newSettings = {
    showToast:    showToastOrDefault,
    playSound:    playSoundOrDefault,
    sound:        soundOrDefault,
    repeatToast:  repeatToastOrDefault,
    repeatSound:  repeatSoundOrDefault,
    alarmRepeat:  alarmRepeatOrDefault,
    alarmMessage: alarmMessageOrBlank
  }
  return {...settings, ...newSettings}
}