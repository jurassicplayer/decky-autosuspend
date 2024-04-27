import {IObjectKeys} from "../../Plugin/Common.h"

export interface IBatteryStateChange extends IObjectKeys {
  bHasBattery: boolean,
  bShutdownRequested: boolean,
  eACState: number,
  flLevel: number,
  nSecondsRemaining: number,
}

export class BatteryStateChangeEvent extends CustomEvent<IBatteryStateChange> {}