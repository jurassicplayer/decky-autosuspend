import { ServerAPI } from "decky-frontend-lib"
import { PluginInfo } from "./Interfaces"

export class BackendCtx {
  static initialize(serverApi: ServerAPI) {
    this.serverAPI = serverApi
  }
  static serverAPI: ServerAPI
  static async bridge(functionName: string, namedArgs?: any) {
    namedArgs = (namedArgs) ? namedArgs : {}
    console.debug(`[AutoSuspend] Calling backend function: ${functionName}`)
    let output = await this.serverAPI.callPluginMethod(functionName, namedArgs)
    return output.result
  }
  static async getSetting(key: string, defaults: any) {
    let output = await this.bridge("settings_getSetting", {key, defaults})
    return output
  }
  static async setSetting(key: string, value: any) {
    let output = await this.bridge("settings_setSetting", {key, value})
    return output
  }
  static async commitSettings() {
    let output = await this.bridge("settings_commit")
    return output
  }
  static async getPluginInfo(){
    let output = await this.bridge("plugin_info")
    return output as PluginInfo
  }
}