export enum HookType {
  RegisterForBatteryStateChangesPseudo  = 'RegisterForBatteryStateChangesPseudo',
  RegisterForTimeStateChangePseudo      = 'RegisterForTimeStateChangePseudo',
  RegisterForSettingsChanges            = 'RegisterForSettingsChanges',
  RegisterForOnSuspendRequest           = 'RegisterForOnSuspendRequest',
  RegisterForOnResumeFromSuspend        = 'RegisterForOnResumeFromSuspend',
  RegisterForShutdownDone               = 'RegisterForShutdownDone',
  RegisterForControllerInputMessages    = 'RegisterForControllerInputMessages',
  RegisterForDownloadItems              = 'RegisterForDownloadItems',
  RegisterForGameActionStart            = 'RegisterForGameActionStart',
  RegisterForGameActionTaskChange       = 'RegisterForGameActionTaskChange',
  RegisterForGameActionEnd              = 'RegisterForGameActionEnd'
}

export enum SteamSubsystem {
  RegisterForBatteryStateChangesPseudo  = 'None',
  RegisterForTimeStateChangePseudo      = 'None',
  RegisterForSettingsChanges            = 'Settings',
  RegisterForOnSuspendRequest           = 'System',
  RegisterForOnResumeFromSuspend        = 'System',
  RegisterForShutdownDone               = 'User',
  RegisterForControllerInputMessages    = 'Input',
  RegisterForDownloadItems              = 'Downloads',
  RegisterForGameActionStart            = 'Apps',
  RegisterForGameActionTaskChange       = 'Apps',
  RegisterForGameActionEnd              = 'Apps'
}

export interface IHook {
  hooktype: HookType
  subsystem: string
  register: string
  unregister: CallableFunction | null
}

export function toHook(hookType: HookType): IHook {
  let hook: IHook = {
    hooktype: hookType,
    subsystem: SteamSubsystem[hookType],
    register: hookType,
    unregister: null
  }
  return hook
}

// export function registerHook(hookType: HookType): IHook {
//   let hook: IHook = toHook(hookType)
//   let context = {}
//   switch (hookType) {
//     case HookType.RegisterForBatteryStateChangesPseudo:
//       // Pass context
//       hook.unregister = CreatePseudoBatteryStateChangeRegistry(context)
//       break;
//     case HookType.RegisterForTimeStateChangePseudo:
//       // Pass context
//       hook.unregister = CreatePseudoBatteryStateChangeRegistry(context)
//       break;
//     case HookType.RegisterForSettingsChanges:
//       //hook.unregister = SteamClient[hook.subsystem][hook.register]((evt: Event)=> { context.eventBus.dispatchEvent(new SettingsChangeEvent(events.map.SettingsChange, { detail: evt })) })
//       break;
//   }
//   return hook
// }

// import { BatteryStateChangeEvent } from "./../Alarms/Battery/Battery.interfaces"
// import { events } from "./BackendContext.h"
// function CreatePseudoBatteryStateChangeRegistry(context: any) {
//   // Set context.batteryIntervalID
//   context.intervalID = setInterval(() => {
//     // @ts-ignore
//     let currentState = window.SystemPowerStore.batteryState
//     if (context.batteryState == currentState) return
//     context.batteryState = currentState
//     context.eventBus.dispatchEvent(new BatteryStateChangeEvent(events.map.BatteryStateChange, { detail: context.batteryState }))
//   }, 1000)
//   return () => clearInterval(context.intervalID)

// }