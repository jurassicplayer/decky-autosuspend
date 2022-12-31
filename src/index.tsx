import {
  definePlugin,
  ServerAPI,
  staticClasses
} from "decky-frontend-lib"
import { BatteryState } from "./lib/SteamClient"
import { FaBatteryQuarter } from "react-icons/fa"
import { QAMPanel } from "./QAM/QAMPanel"
import { Settings } from "./Utils/Settings"
import { Backend } from "./Utils/Backend"
import { SteamUtils } from "./Utils/SteamUtils"


export default definePlugin((serverApi: ServerAPI) => {
  Backend.initBackend(serverApi)
  Settings.loadFromLocalStorage()

  let warnNotifiedState = false
  let criticalNotifiedState = false

  // percentage check loop
  SteamClient.System.RegisterForBatteryStateChanges((batteryState: BatteryState)=> {
    let batteryPercent = Math.round(batteryState.flLevel * 100)
    if (!criticalNotifiedState && batteryPercent <= Settings.criticalLevel ) {
      console.debug(`[AutoSuspend] Critical threshold triggered, current state: warnNotifiedState:${warnNotifiedState}, criticalNotifiedState:${criticalNotifiedState}, warnThreshold:${Settings.warningLevel}, critThreshold:${Settings.criticalLevel}, battPercent:${batteryPercent}, battRaw:${batteryState.flLevel}`)
      console.debug(batteryState)
      SteamUtils.notify("AutoSuspend", "Critical limit exceeded, suspending device", Settings.notificationEnabled, Settings.soundEnabled, 5000)
      setTimeout(() => {SteamUtils.suspend();}, 5500)
      criticalNotifiedState = true
    } else if (!warnNotifiedState && batteryPercent <= Settings.warningLevel && Settings.warningLevel > Settings.criticalLevel && !criticalNotifiedState) {
      console.debug(`[AutoSuspend] Warning threshold triggered, current state: warnNotifiedState:${warnNotifiedState}, criticalNotifiedState:${criticalNotifiedState}, warnThreshold:${Settings.warningLevel}, critThreshold:${Settings.criticalLevel}, battPercent:${batteryPercent}, battRaw:${batteryState.flLevel}`)
      console.debug(batteryState)
      SteamUtils.notify("AutoSuspend", "Warning limit exceeded")
      warnNotifiedState = true
    }
    if (criticalNotifiedState && batteryPercent > Settings.criticalLevel) {
      console.debug(`[AutoSuspend] Reset criticalNotifiedState, current state: warnNotifiedState:${warnNotifiedState}, criticalNotifiedState:${criticalNotifiedState}, warnThreshold:${Settings.warningLevel}, critThreshold:${Settings.criticalLevel}, battPercent:${batteryPercent}, battRaw:${batteryState.flLevel}`)
      criticalNotifiedState = false
    }
    if (warnNotifiedState && batteryPercent > Settings.warningLevel) {
      console.debug(`[AutoSuspend] Reset warnNotifiedState, current state: warnNotifiedState:${warnNotifiedState}, criticalNotifiedState:${criticalNotifiedState}, warnThreshold:${Settings.warningLevel}, critThreshold:${Settings.criticalLevel}, battPercent:${batteryPercent}, battRaw:${batteryState.flLevel}`)
      warnNotifiedState = false
    }
  })
  Backend.setAppInitialized(true)

  return {
    title: <div className={staticClasses.Title}>AutoSuspend</div>,
    content: <QAMPanel />,
    icon: <FaBatteryQuarter />,
  }
})
