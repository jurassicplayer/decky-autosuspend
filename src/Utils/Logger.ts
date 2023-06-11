import { BackendCtx } from './Backend'

export class Logger {
  static async info(msg: string) {
    await BackendCtx.bridge("logger", {logLevel:'info', msg})
  }
  static async debug(msg: string) {
    await BackendCtx.bridge("logger", {logLevel:'debug', msg})
  }
  static async warning(msg: string) {
    await BackendCtx.bridge("logger", {logLevel:'warning', msg})
  }
  static async error(msg: string) {
    await BackendCtx.bridge("logger", {logLevel:'error', msg})
  }
  static async critical(msg: string) {
    await BackendCtx.bridge("logger", {logLevel:'critical', msg})
  }
}