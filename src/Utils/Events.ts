import { BatteryState } from "../lib/SteamClient"
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
}