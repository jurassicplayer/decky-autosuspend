import { findModuleChild, Module, ToastData } from "decky-frontend-lib";
import { BackendCtx } from "./Backend"
import { Settings } from "./Settings"
import { Logger } from "./Logger"

const findModule = (property: string) => {
  return findModuleChild((m: Module) => {
    if (typeof m !== "object") return undefined;
    for (let prop in m) {
      try {
        if (m[prop][property]) {
          return m[prop];
        }
      } catch (e) {
        return undefined;
      }
    }
  });
}

const SleepParent = findModule("InitiateSleep")
export const NavSoundMap = findModule("ToastMisc")

export class SteamUtils {
  static async suspend() {
    await Logger.debug('Sending suspend request to SteamOS')
    SleepParent.OnSuspendRequest()
  }

  //#region Notification Wrapper
  static async notify(title: string, message: string, showToast?: boolean, playSound?: boolean, sound?: number, duration?: number) {
    if (sound === undefined ) sound = NavSoundMap?.ToastMisc // Not important, could pass the actual number instead (6)
    if (playSound === undefined ) playSound = Settings.playSound
    if (showToast === undefined ) showToast = Settings.showToast
    let toastData: ToastData = {
      title: title,
      body: message,
      duration: duration,
      sound: sound,
      playSound: playSound,
      showToast: showToast
    }
    BackendCtx.serverAPI.toaster.toast(toastData)
  }
  //#endregion
}
