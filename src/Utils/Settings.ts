import { Backend } from './Backend'

export class Settings {
  public static notificationEnabled: boolean = true
  public static soundEnabled: boolean = true
  public static warningLevel: number = 20
  public static criticalLevel: number = 10

  static async loadFromLocalStorage() {
    for (let key in this) {
      if (typeof this[key] == "boolean") this[key] = (await Backend.getSetting(key, this[key])) as boolean
      else if (typeof this[key] == "number") this[key] = (await Backend.getSetting(key, this[key])) as number
      else if (typeof this[key] == "string") this[key] = (await Backend.getSetting(key, this[key])) as string
      else if (this[key] instanceof Date) this[key] = (await Backend.getSetting(key, this[key])) as Date
    }
  }

  static async saveToLocalStorage() {
    let promises = Object.keys(this).map(key => {
      return Backend.setSetting(key, this[key])
    })
    Promise.all(promises).then(async () => {
      await Backend.commitSettings()
    })
  }
}