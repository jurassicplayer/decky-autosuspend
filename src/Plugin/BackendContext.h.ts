import { ServerAPI } from "decky-frontend-lib"
import { IObjectKeys } from "./Common.h"
import { IPluginInfo } from "./AppContext.h"

export interface IBackend extends IObjectKeys {
  serverAPI: ServerAPI
  pluginName: string
  bridge: (functionName: string, namedArgs?: any) => Promise<string | {}>
  getSetting: (key: string, defaults: any) => Promise<string | {}>
  setSetting: (key: string, value: any) => Promise<string | {}>
  commitSettings: () => Promise<string | {}>
  getPluginInfo: () => Promise<IPluginInfo>
}


import { IBatteryState, IControllerInputMessage, IDownloadItems, IBaseGameAction, IGameAction, ISteamSettings } from "../SteamUtils/SteamClient.interfaces"



//#region AppStateEvent
//#endregion

//#region TimeStateEvent
export interface ITimeState extends IObjectKeys {
  millisEpoch: number
}
//#endregion

export namespace events {
  export enum map {
    AppState                = 'AppState',
    SettingsChange          = 'SettingsChange',
    BatteryState            = 'BatteryState',
    TimeState               = 'TimeState',
    Suspend                 = 'Suspend',
    Shutdown                = 'Shutdown',
    Resume                  = 'Resume',
    ControllerInputMessage  = 'ControllerInputMessage',
    DownloadItems           = 'DownloadItems',
    GameActionStart         = 'GameActionStart',
    GameActionTaskChange    = 'GameActionTaskChange',
    GameActionEnd           = 'GameActionEnd'
  }
  export class AppStateEvent extends CustomEvent<ISteamSettings> {}
  export class SettingsChangeEvent extends CustomEvent<ISteamSettings> {}
  export class BatteryStateEvent extends CustomEvent<IBatteryState> {}
  export class TimeStateEvent extends CustomEvent<ITimeState> {}
  export class SuspendEvent extends CustomEvent<{}> {}
  export class ShutdownEvent extends CustomEvent<{}> {}
  export class ResumeEvent extends CustomEvent<{}> {}
  export class ControllerInputMessagesEvent extends CustomEvent<IControllerInputMessage[]> {}
  export class DownloadItemsEvent extends CustomEvent<IDownloadItems> {}
  export class GameActionStartEvent extends CustomEvent<IGameAction> {}
  export class GameActionTaskChangeEvent extends CustomEvent<IGameAction> {}
  export class GameActionEndEvent extends CustomEvent<IBaseGameAction> {}
}



// let eventBus = new EventTarget()

// eventBus.addEventListener(events.map.ControllerInputMessage, (evt: Event) => {
//   let detail:IBatteryState = (evt as CustomEvent).detail
//   console.log(detail.flLevel)
// })
// eventBus.addEventListener(events.map.GameActionStart, (evt: Event) => {
//   let detail:IGameAction = (evt as CustomEvent).detail
//   console.log(detail.appId)
// })

// eventBus.dispatchEvent(new events.BatteryStateEvent(events.map.BatteryState, {detail: {bHasBattery: false, bShutdownRequested: false, eACState: 100, flLevel: 200, nSecondsRemaining: 300}}))