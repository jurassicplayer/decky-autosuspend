import { Backend } from './Backend'

export class logger {
  static async info(msg: string) {
    await Backend.bridge("logger", {logLevel:'info', msg})
  }
  static async debug(msg: string) {
    await Backend.bridge("logger", {logLevel:'debug', msg})
  }
  static async warning(msg: string) {
    await Backend.bridge("logger", {logLevel:'warning', msg})
  }
  static async error(msg: string) {
    await Backend.bridge("logger", {logLevel:'error', msg})
  }
  static async critical(msg: string) {
    await Backend.bridge("logger", {logLevel:'critical', msg})
  }
}