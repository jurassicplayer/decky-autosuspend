import { BatteryState, DownloadItems, SteamSettings } from "./Interfaces"
export namespace events {
  export class AppStateEvent extends Event {
    public static eType: string = 'AppStateEvent'
    public appState: number
    constructor(appState: number, eventInitDict?: EventInit) {
      super(AppStateEvent.eType, eventInitDict)
      this.appState = appState
    }
  }
  export class BatteryStateEvent extends Event {
    public static eType: string = 'BatteryStateEvent'
    public batteryState: BatteryState
    constructor(batteryState: BatteryState, eventInitDict?: EventInit) {
      super(BatteryStateEvent.eType, eventInitDict)
      this.batteryState = batteryState
    }
  }
  export class SettingsChangeEvent extends Event {
    public static eType: string = 'SettingsChangeEvent'
    public settingsChanges: SteamSettings
    constructor(settingsChanges: SteamSettings, eventInitDict?: EventInit) {
      super(SettingsChangeEvent.eType, eventInitDict)
      this.settingsChanges = settingsChanges
    }
  }
  export class ResumeEvent extends Event {
    public static eType: string = 'ResumeEvent'
    constructor(eventInitDict?: EventInit) {
      super(ResumeEvent.eType, eventInitDict)
    }
  }
  export class SuspendEvent extends Event {
    public static eType: string = 'SuspendEvent'
    constructor(eventInitDict?: EventInit) {
      super(SuspendEvent.eType, eventInitDict)
    }
  }
  export class ShutdownEvent extends Event {
    public static eType: string = 'ShutdownEvent'
    constructor(eventInitDict?: EventInit) {
      super(ShutdownEvent.eType, eventInitDict)
    }
  }
  export class DownloadItemsEvent extends Event {
    public static eType: string = 'DownloadItemsEvent'
    public downloadItems: DownloadItems
    constructor(downloadItems: DownloadItems, eventInitDict?: EventInit) {
      super(DownloadItemsEvent.eType, eventInitDict)
      this.downloadItems = downloadItems
    }
  }
  export class ControllerInputEvent extends Event {
    public static eType: string = 'ControllerInputEvent'
    constructor(eventInitDict?: EventInit) {
      super(ControllerInputEvent.eType, eventInitDict)
    }
  }
}