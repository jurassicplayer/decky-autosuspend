import { ServerAPI, findModuleChild, Module } from "decky-frontend-lib";

const findModule = (property: string) => {
  return findModuleChild((m: Module) => {
    if (typeof m !== "object") return undefined;
    for (let prop in m)
      try {
        if (m[prop][property])
          return m[prop];
      } catch (e) {
        console.log(`Unable to findModuleChild for '${property}'`)
        return undefined;
      }
  });
}

const AudioParent = findModule("GamepadUIAudio");
const SleepParent = findModule("InitiateSleep");
const NavSoundMap = findModule("ToastMisc");

export class Backend {
  private serverAPI: ServerAPI;

  constructor(serverAPI: ServerAPI) {
    this.serverAPI = serverAPI;
  }

  async suspend() {
    SleepParent.OnSuspendRequest()
  }
  async notify(title: string, msg: string, notificationEnabled?: boolean, soundEnabled?: boolean, toast_ms?: number) {
    let duration = 8000
    if (toast_ms) {
      duration = toast_ms
    }
    if(notificationEnabled){
      this.toast(title, msg, duration);
    } else if(soundEnabled){
      AudioParent.GamepadUIAudio.PlayNavSound(NavSoundMap.ToastMisc)
    }
  }
  async toast(title: string, message: string, duration: number) {
    return (() => {
      try {
        return this.serverAPI.toaster.toast({
          title: title,
          body: message,
          duration: duration
        });
      } catch (e) {
        console.log("Toaster Error: "+e);
      }
    })();
  }
}
