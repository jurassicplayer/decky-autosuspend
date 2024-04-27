import { IAlarmSettings } from "../Alarms/Alarms.h"
import { IAppContextState } from "./AppContext.h"
import { IAppSettings, IDefaultSettings, ISettingsContext } from "./SettingsContext.h"

export class GlobalDefaults implements IDefaultSettings {
  showToast: boolean = true
  playSound: boolean = true
  sound: string = "ToastMisc"
  repeatToast: boolean = false
  repeatSound: boolean = false
  repeatAlarm: number = -1
}



export class Settings {
  static _settings: IAppSettings
  static loadSettings(): IAppSettings {
    return this._settings
  }
  static saveSettings(settings: IAppSettings) {
    this._settings = settings
  }
  static getSettings(context: IAppContextState, key?: string): any {
    const {settings} = context
    if (key !== undefined && !(key in settings)) return null
    if (key !== undefined && key in settings) {
      return settings[key]
    } else {
      return settings
    }
  }
  static setSettings(context: IAppContextState, key: string, value: any): boolean {
    const {settings, setContext} = context
    if (!(key in settings)) return false
    let newSettings = {...settings}
    newSettings[key] = value
    setContext({settings: newSettings})
    return true
  }
  static getAlarmSettings(context: IAppContextState, id: string, key?: string): any {
    let alarms: IAlarmSettings[] = Settings.getSettings(context, "alarms")
    let alarm = alarms.find((alarm)=>alarm.id == id)
    if (alarm === undefined || (key !== undefined && !(key in alarm))) return null
    if (key !== undefined && key in alarm) {
      return alarm[key]
    } else {
      return alarm
    }
  }
}

export class SettingsContext implements ISettingsContext {
  getSettings = async () => {}
  getSetting = async (key: string) => {}
  setSetting = async (key: string, value: any) => {}
  getAlarmSettings = async (alarmID: string) => {}
  setAlarmSettings = async (alarmID: string, alarmSettings: any) => {}
  getAlarmSetting = async (alarmID: string, key: string) => {}
  setAlarmSetting = async (alarmID: string, key: string, value: any) => {}
  deleteAlarmSetting = async (alarmID: string, key: string) => {}
  addAlarm = async (alarmID: string, alarmSettings: any) => {}
  deleteAlarm = async (alarmID: string) => {}
}

export function validateAppSettings(object: any): object is IAppSettings {
  console.log(`Validating: `, object)
  return "configVersion" in object
}

export function validateObject(object: any, defaults: any) {
  console.log(`Validating`, ` (`, typeof object, `): `, object, ` Default: (`, typeof defaults, `): `, defaults)
  if (object && typeof object == typeof defaults) {
    if (typeof object == "number") return true
    if (typeof object == "string") return true
    if (typeof object == "boolean") return true
    if (typeof object == "undefined") return true
    if (typeof object == "object") {
      if (Object.entries(object)
          .map(([key, value]) => {
            let isValid = validateObject(value, defaults[key])
            if (isValid) return true
            return false
          })
          .filter((value) => value = false).length = 0) return true
    }
  }
  console.log(`Validation failed (`, typeof object, `): `, object, ` Default: (`, typeof defaults, `): `, defaults)
  return false
}