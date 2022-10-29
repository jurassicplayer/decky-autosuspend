import { ServerAPI } from "decky-frontend-lib";
import { warnAudioData } from "./assets";

export class Backend {
  private serverAPI: ServerAPI;
  private warnAudio: HTMLAudioElement;

  constructor(serverAPI: ServerAPI) {
    this.serverAPI = serverAPI;
    this.warnAudio = new Audio(warnAudioData); // "/sounds_custom/low-battery-sound.mp3");
  }

  async suspend() {
    this.serverAPI.callPluginMethod("suspend", {});
  }
  async notify(title: string, msg: string, audioEnabled?: boolean, toast_ms?: number) {
    let duration = 8000
    if (toast_ms) {
      duration = toast_ms
    }
    this.toast(title, msg, duration);
    if(audioEnabled){
      this.warnAudio.play();
    }
  }
  async toast(title: string, message: string, duration: number) {
    return (() => {
      try {
        return this.serverAPI.toaster.toast({
          title: title,
          body: message,
          duration: duration,
        });
      } catch (e) {
        console.log("Toaster Error: "+e);
      }
    })();
  }
}
