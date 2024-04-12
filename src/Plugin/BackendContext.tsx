import { ServerAPI } from "decky-frontend-lib"
import { IPluginInfo } from "./AppContext.h"


export class Backend {
  static serverAPI: ServerAPI
  static pluginName: string
  static initialize = (serverAPI: ServerAPI) => {
    this.serverAPI = serverAPI
    this.getPluginInfo().then((pluginInfo: IPluginInfo) => {
      this.pluginName = pluginInfo.pluginName
    })
  }
  static bridge = async (functionName: string, namedArgs?: any) => {
    namedArgs = (namedArgs) ? namedArgs : {}
    console.debug(`[${this.pluginName}] Calling backend function: ${functionName}`)
    let output = await this.serverAPI.callPluginMethod(functionName, namedArgs)
    return output.result
  }
  static getSetting = async (key: string, defaults: any) => {
    let output = await this.bridge("settings_getSetting", {key, defaults})
    return output
  }
  static setSetting = async (key: string, value: any) => {
    let output = await this.bridge("settings_setSetting", {key, value})
    return output
  }
  static commitSettings = async () => {
    let output = await this.bridge("settings_commit")
    return output
  }
  static getPluginInfo = async () => {
    let output = await this.bridge("plugin_info")
    let pluginInfo = output as IPluginInfo
    return pluginInfo
  }
}