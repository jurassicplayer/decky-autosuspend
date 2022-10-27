import { JsonObject, JsonProperty, JsonSerializer } from 'typescript-json-serializer';
// import { Backend } from "./utils";

const SETTINGS_KEY = "AutoSuspend";

const serializer = new JsonSerializer();

@JsonObject()
export class Settings {
  @JsonProperty()
  audioEnabled: boolean = false;
  @JsonProperty()
  warningLevel: number = 20;
  @JsonProperty()
  criticalLevel: number = 15;
}

export function loadSettingsFromLocalStorage( /*backend: Backend*/ ): Settings {
  const settingsString = localStorage.getItem(SETTINGS_KEY) || "{}";
  const settingsJson = JSON.parse(settingsString);
  const settings = serializer.deserializeObject(settingsJson, Settings);
  // backend.log('Read from local storage: '+settingsString);
  return settings || new Settings();
}

export function saveSettingsToLocalStorage(settings: Settings /*, backend: Backend */ ) {
  const settingsJson = serializer.serializeObject(settings) || {};
  const settingsString = JSON.stringify(settingsJson);
  localStorage.setItem(SETTINGS_KEY, settingsString);
  // backend.log('Wrote to local storage: '+settingsString);
}


