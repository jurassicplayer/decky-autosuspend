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
  static getSettings(context: IAppContextState, key?: string): any {
    const {context: appContext} = context
    if (key !== undefined && !(key in appContext.settings)) return null
    if (key !== undefined && key in appContext.settings) {
      return appContext.settings[key]
    } else {
      return appContext.settings
    }
  }
  static setSettings(context: IAppContextState, key: string, value: any): boolean {
    const {context: appContext, setContext: setAppContext} = context
    if (!(key in appContext.settings)) return false
    let newSettings = {...appContext.settings}
    newSettings[key] = value
    setAppContext({settings: newSettings})
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




import { FC, createContext, useContext, useMemo, useState, useEffect } from "react"

const SettingsCtx = createContext<ISettingsContextState>(null as any)
export const useSettingsContext = () => useContext(SettingsCtx)

export const SettingsContextProvider: FC = ({children}) => {
  let settingsContext = new SettingsContext()
  const [settingsContextState, setSettingsContextState] = useState<ISettingsContext>(settingsContext)
  const setSettingsContext = (data: any) => { setSettingsContextState({...settingsContextState, ...data}) }

  useEffect(() => {
    console.log(`Created Settings Context`)
  }, [])

  const context = {context: settingsContextState, setContext: setSettingsContext}
  return (
    <SettingsCtx.Provider value={context}>
      {useMemo(() => children, [])}
    </SettingsCtx.Provider>
  )
}