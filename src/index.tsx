import { definePlugin, ServerAPI, staticClasses } from "decky-frontend-lib"
import { FaBatteryQuarter } from "react-icons/fa"
import { QAMPanel } from "./QAM/QAMPanel"
import { Settings } from "./Utils/Settings"
import { Backend } from "./Utils/Backend"
import { SteamUtils } from "./Utils/SteamUtils"
import { events } from "./Utils/Events"
import { AppContextProvider, AppContextState } from "./Utils/Context"

export default definePlugin((serverApi: ServerAPI) => {
  Backend.initBackend(serverApi)
  Settings.loadFromLocalStorage()

  let warnNotifiedState = false
  let criticalNotifiedState = false
  let overchargeNotifiedState = false
  let offset = 0.5
  let resolution = 0.02

  // percentage check loop
  const IntervalCheck = (e: Event) => {
    if (!Backend.getAppInitialized()) return
    let batteryState = (e as events.BatteryStateEvent).batteryState
    let batteryPercent = Math.round(batteryState.flLevel * 10000) / 100
    let debugInfo = `warnNotifiedState:${warnNotifiedState}
      criticalNotifiedState:${criticalNotifiedState}
      overchargeNotifiedState:${overchargeNotifiedState}
      warnThreshold:${Settings.warningLevel}
      critThreshold:${Settings.criticalLevel}
      overThreshold:${Settings.overchargeLevel}
      battPercent:${batteryPercent}
      battRaw:${batteryState.flLevel}`
    if (Settings.criticalEnabled && !criticalNotifiedState && batteryPercent <= (Settings.criticalLevel+offset) ) {
      console.debug(`[AutoSuspend] Critical threshold triggered, current state:\n${debugInfo}`)
      SteamUtils.notify("AutoSuspend", "Critical limit exceeded, suspending device", undefined, undefined, undefined, 5000)
      setTimeout(() => {SteamUtils.suspend();}, 5500)
      criticalNotifiedState = true
    } else if (Settings.warningEnabled && !warnNotifiedState && batteryPercent <= (Settings.warningLevel+offset) && Settings.warningLevel > Settings.criticalLevel && !criticalNotifiedState) {
      console.debug(`[AutoSuspend] Warning threshold triggered, current state:\n${debugInfo}`)
      SteamUtils.notify("AutoSuspend", "Warning limit exceeded")
      warnNotifiedState = true
    } else if (Settings.overchargeEnabled && !overchargeNotifiedState && batteryPercent >= (Settings.overchargeLevel+offset) && (Settings.overchargeLevel > Settings.criticalLevel && Settings.overchargeLevel > Settings.warningLevel)) {
      console.debug(`[AutoSuspend] Overcharge threshold triggered, current state:\n${debugInfo}`)
      SteamUtils.notify("AutoSuspend", "Overcharge limit exceeded")
      overchargeNotifiedState = true
    }
    if (Settings.overchargeEnabled && overchargeNotifiedState && batteryPercent < Settings.overchargeLevel+offset - resolution) {
      console.debug(`[AutoSuspend] Reset overchargeNotifiedState, current state:\n${debugInfo}`)
      overchargeNotifiedState = false
    }
    if (Settings.criticalEnabled && criticalNotifiedState && batteryPercent > (Settings.criticalLevel+offset + resolution)) {
      console.debug(`[AutoSuspend] Reset criticalNotifiedState, current state:\n${debugInfo}`)
      criticalNotifiedState = false
    }
    if (Settings.warningEnabled && warnNotifiedState && batteryPercent > (Settings.warningLevel+offset + resolution)) {
      console.debug(`[AutoSuspend] Reset warnNotifiedState, current state:\n${debugInfo}`)
      warnNotifiedState = false
    }
  }
  Backend.eventBus.addEventListener(events.BatteryStateEvent.eType, IntervalCheck)
  Backend.setAppInitialized(true)
  let appCtx = new AppContextState(serverApi)

  return {
    title: <div className={staticClasses.Title}>AutoSuspend</div>,
    content:  <AppContextProvider appContextState={appCtx}><QAMPanel /></AppContextProvider>,
    icon: <FaBatteryQuarter />,
    onDismount: () => {
      Backend.eventBus.removeEventListener(events.BatteryStateEvent.eType, IntervalCheck)
      Backend.onDismount()
    }
  }
})
