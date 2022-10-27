import { ServerAPI } from "decky-frontend-lib";
import { warnAudioData } from "./assets";

export class Backend {
  private serverAPI: ServerAPI;
  private warnAudio: HTMLAudioElement;

  constructor(serverAPI: ServerAPI) {
    this.serverAPI = serverAPI;
    this.warnAudio = new Audio(warnAudioData);
  }

  async log(msg: any) {
    this.serverAPI.callPluginMethod("log", { "msg" : msg });
  }
  async suspend() {
    this.serverAPI.callPluginMethod("suspend", {});
  }
  async getValue(key: string) {
    return this.serverAPI.callPluginMethod("get_value", { "key" : key });
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
        this.log("Toaster Error: "+e);
      }
    })();
  }
}
