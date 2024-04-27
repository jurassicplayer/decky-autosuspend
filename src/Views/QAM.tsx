import {
  DialogButton,
  Focusable,
  Navigation,
  ToggleField
} from "decky-frontend-lib"
import { VFC, useEffect, useState } from "react"
import { Settings, validateAppSettings } from "../Plugin/SettingsContext"
import { useAppContext } from "../Plugin/AppContext"
import { FaCoffee } from "react-icons/fa"
import { alarmTypes, createAlarm } from "../Alarms/Alarms"
import { IAlarm } from "../Alarms/Alarms.h"

const QAMPanel: VFC = () => {
  //const { activeRoutes } = useAppContext()
  const NavigateToPage = (path:string) => {
    //if (!activeRoutes.includes(path)) { return }
    Navigation.Navigate(path)
    Navigation.CloseSideMenus()
  }
  
  //const {context: settingsContext } = useSettingsContext()
  const ctx = useAppContext()
  const {caffeineMode, settings, setContext: setAppContext} = ctx
  const [alarms, setAlarms] = useState<IAlarm[]>([]) 
  useEffect(() => {
    console.log(`Created QAM`)
    console.log(`ctx: `, ctx )
  }, [])
  
  function test() {
    console.log(`Test button`)
    console.log(`AppContext: `, ctx)
    //console.log(`SettingsContext: `, settingsContext)
    console.log(`Alarms: `, alarms)
  }
  const addAlarm = (alarmClass: any) => {
    let alarm = createAlarm(alarmClass)
    let newAlarms = [...alarms, alarm] 
    setAlarms(newAlarms)
  }
  const fiddleSettings = () => {
    console.log(`Config Version: `, Settings.getSettings(ctx, "configVersion"))
    let debugMode = Settings.getSettings(ctx, "debuggingMode")
    console.log(`Debug Mode: `, debugMode)
    Settings.setSettings(ctx, "debuggingMode", !debugMode)
  }
  const validateSettings = (isValid: boolean) => {
    console.log(`AppContext Settings: `, ctx.settings)
    let res
    if (isValid) {
      res = validateAppSettings(ctx.settings)
    } else {
      let invalidSettings = {...ctx.settings, debuggingMode: "yes"}
      res = validateAppSettings(invalidSettings)
    }
    console.log(`Result: `, res)
  }
  const saveSettings = () => {
    Settings.saveSettings(settings)
    console.log(`Saved context settings to static class`)
  }
  
  let alarmList = alarmTypes.map((alarmType) => <DialogButton onClick={()=>addAlarm(alarmType.class)}>{alarmType.icon} {alarmType.name}</DialogButton>)

  return (
    <Focusable>
      <ToggleField
        label="Caffeine Mode"
        icon={<FaCoffee/>}
        checked={caffeineMode}
        onChange={(checked) => {setAppContext({caffeineMode: checked})}}
        />
      <DialogButton onClick={()=>NavigateToPage("/autosuspend")}>Configuration</DialogButton>
      <DialogButton onClick={()=>validateSettings(true)}>Valid</DialogButton>
      <DialogButton onClick={()=>validateSettings(false)}>Invalid</DialogButton>
      <DialogButton onClick={()=>test()}>Test</DialogButton>
      <DialogButton onClick={()=>fiddleSettings()}>Debug</DialogButton>
      <DialogButton onClick={()=>saveSettings()}>Save</DialogButton>
      {alarmList}
      <ToggleField
        label="Debug Mode"
        icon={<FaCoffee/>}
        checked={settings.debuggingMode}
        />
      {/* <DialogButton onClick={()=>NavigateToPage("/autosuspend/information")}>Information</DialogButton>
      <DialogButton onClick={()=>NavigateToPage("/autosuspend/about")}>About</DialogButton> */}
    </Focusable>
  )
}

export default QAMPanel