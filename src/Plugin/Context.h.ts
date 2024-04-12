import { IObjectKeys } from "./Common.h"
export interface IContext extends IObjectKeys {}

export interface IContextState extends IObjectKeys {
  context: IContext
  setContext: (context: any) => void
}