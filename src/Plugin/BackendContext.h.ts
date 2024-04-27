import { IObjectKeys } from "./Common.h"

import { IBatteryStateChange, IControllerInputMessage, IDownloadItems, IBaseGameAction, IGameAction, ISteamSettings } from "../SteamUtils/SteamClient.interfaces"



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
    BatteryStateChange      = 'BatteryStateChange',
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
  export class BatteryStateChangeEvent extends CustomEvent<IBatteryStateChange> {}
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
//   let detail:IBatteryStateChange = (evt as CustomEvent).detail
//   console.log(detail.flLevel)
// })
// eventBus.addEventListener(events.map.GameActionStart, (evt: Event) => {
//   let detail:IGameAction = (evt as CustomEvent).detail
//   console.log(detail.appId)
// })

// eventBus.dispatchEvent(new events.BatteryStateEvent(events.map.BatteryState, {detail: {bHasBattery: false, bShutdownRequested: false, eACState: 100, flLevel: 200, nSecondsRemaining: 300}}))