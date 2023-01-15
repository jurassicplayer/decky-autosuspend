import { Backend } from './Backend'

export class Settings {
  public static showToast: boolean = true
  public static playSound: boolean = true
  public static warningEnabled: boolean = true
  public static criticalEnabled: boolean = true
  public static overchargeEnabled: boolean = false
  public static warningLevel: number = 20
  public static criticalLevel: number = 10
  public static overchargeLevel: number = 80

  static async loadFromLocalStorage() {
    let settings = "[AutoSuspend] Loaded settings from storage"
    for (let key in this) {
      try {
        if (typeof this[key] == "boolean") this[key] = (await Backend.getSetting(key, this[key])) as boolean
        else if (typeof this[key] == "number") this[key] = (await Backend.getSetting(key, this[key])) as number
        else if (typeof this[key] == "string") this[key] = (await Backend.getSetting(key, this[key])) as string
        else if (this[key] instanceof Date) this[key] = new Date((await Backend.getSetting(key, this[key])).toString())
        settings += `\n\t${key}: ${this[key]}`
      } catch (error) {
        console.debug(`[AutoSuspend] Failed to load setting: ${key}`)
      }
    }
    console.debug(settings)
  }

  static async saveToLocalStorage() {
    let promises = Object.keys(this).map(key => {
      return Backend.setSetting(key, this[key])
    })
    Promise.all(promises).then(async () => {
      await Backend.commitSettings()
      console.debug("[AutoSuspend] Saved settings to storage")
    })
  }
}