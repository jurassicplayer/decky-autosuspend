import { ServerAPI } from "decky-frontend-lib"
import { BatteryState } from "../lib/SteamClient"
import { events } from "./Events"

export enum appStates {
  initializing,
  failedInitialize,
  idle
}

export class Backend {
  private static serverAPI: ServerAPI
  private static appState: {
    initialized : boolean
    state: number
  }
  private static pseudoBatteryState: BatteryState
  private static intervalID: NodeJS.Timer
  public static eventBus: EventTarget

  static initBackend(server: ServerAPI) {
    this.setServer(server)
    this.appState = {
      initialized: false,
      state: appStates.idle
    }
    this.eventBus = new EventTarget()
    this.intervalID = setInterval(()=>{
      // @ts-ignore
      let currentState = window.SystemPowerStore.batteryState
      if (currentState != this.pseudoBatteryState) this.setBatteryStateChange(currentState)
    }, 1000)
  }
  static onDismount() {
    clearInterval(this.intervalID)
  }
  static setBatteryStateChange(batteryState: BatteryState) {
    this.pseudoBatteryState = batteryState
    this.eventBus.dispatchEvent(new events.BatteryStateEvent(this.pseudoBatteryState))
  }
  static setServer(server: ServerAPI) { this.serverAPI = server }
  static getServer() { return this.serverAPI }
  static setAppState(state: number) {
    this.appState.state = state
    this.eventBus.dispatchEvent(new events.AppStateEvent(this.appState.state))
  }
  static getAppState() { return this.appState.state }
  static setAppInitialized(state: boolean) { 
    console.debug(`[AutoSuspend] Setting backend AppInitialized: ${state}`)
    this.appState.initialized = state }
  static getAppInitialized() { return this.appState.initialized }

  static async bridge(functionName: string, namedArgs?: any) {
    namedArgs = (namedArgs) ? namedArgs : {}
    console.debug(`[AutoSuspend] Calling backend function: ${functionName}`)
    var output = await this.serverAPI.callPluginMethod(functionName, namedArgs)
    return output.result
  }

  static async getSetting(key: string, defaults: any) {
    var output = await this.bridge("settings_getSetting", {key, defaults})
    return output
  }
  static async setSetting(key: string, value: any) {
    var output = await this.bridge("settings_setSetting", {key, value})
    return output
  }
  static async commitSettings() {
    var output = await this.bridge("settings_commit")
    return output
  }
}
