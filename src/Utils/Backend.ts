import { ServerAPI } from "decky-frontend-lib"

export class Backend {
  private static serverAPI: ServerAPI
  private static appState: {
    initialized : boolean
    state: string
  }

  static initBackend(server: ServerAPI) {
    this.setServer(server)
    this.appState = {
      initialized: false,
      state: "Idle"  
    }
  }
  static setServer(server: ServerAPI) { this.serverAPI = server }
  static getServer() { return this.serverAPI }
  static setAppState(state: string) { this.appState.state = state }
  static getAppState() { return this.appState.state }
  static setAppInitialized(state: boolean) {this.appState.initialized = state}
  static getAppInitialized() { return this.appState.initialized}

  static async bridge(functionName: string, namedArgs?: any) {
    namedArgs = (namedArgs) ? namedArgs : {}
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
