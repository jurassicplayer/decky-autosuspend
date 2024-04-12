import {IObjectKeys} from "../../Plugin/Common.h"

export interface BatteryState extends IObjectKeys {
  bHasBattery: boolean,
  bShutdownRequested: boolean,
  eACState: number,
  flLevel: number,
  nSecondsRemaining: number,
}

export class BatteryStateEvent extends CustomEvent<BatteryState> {}