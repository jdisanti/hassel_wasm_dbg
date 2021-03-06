//
// Copyright 2017 hassel_wasm_dbg Developers
//
// Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
// http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
// http://opensource.org/licenses/MIT>, at your option. This file may not be
// copied, modified, or distributed except according to those terms.
//

import { Emulator } from '../emulator';

export const ACTION_INIT = "INIT";
export interface ActionInit {
    type: "INIT";
}

export const ACTION_INIT_EMULATOR = "ACTION_INIT_EMULATOR";
export class ActionInitEmulator {
    type: "ACTION_INIT_EMULATOR";
    instance: Emulator;
}

export const ACTION_UPDATE_CYCLES = "ACTION_UPDATE_CYCLES";
export class ActionUpdateCycles {
    type: "ACTION_UPDATE_CYCLES";
    addCycles: number;
}

export const ACTION_UPDATE_REGISTERS = "ACTION_UPDATE_REGISTERS";
export class ActionUpdateRegisters {
    type: "ACTION_UPDATE_REGISTERS";
    registerA: number;
    registerS: number;
    registerX: number;
    registerY: number;
    registerPc: number;
    registerSp: number;
}

export const ACTION_SET_SRC = "ACTION_SET_SRC";
export class ActionSetSrc {
    type: "ACTION_SET_SRC";
    units: object;
    addressToUnit: {[key:string]:number};
}

export const ACTION_PLAY = "ACTION_PLAY";
export class ActionPlay {
    type: "ACTION_PLAY";
}

export const ACTION_PAUSE = "ACTION_PAUSE";
export class ActionPause {
    type: "ACTION_PAUSE";
}

export const ACTION_STOP = "ACTION_STOP";
export class ActionStop {
    type: "ACTION_STOP";
}

export const ACTION_STEP = "ACTION_STEP";
export class ActionStep {
    type: "ACTION_STEP";
}

export const ACTION_SET_BREAKPOINT = "ACTION_SET_BREAKPOINT";
export class ActionSetBreakpoint {
    type: "ACTION_SET_BREAKPOINT";
    address: number;
}

export const ACTION_CLEAR_BREAKPOINT = "ACTION_CLEAR_BREAKPOINT";
export class ActionClearBreakpoint {
    type: "ACTION_CLEAR_BREAKPOINT";
    address: number;
}

export const ACTION_UPDATE_MEMORY = "ACTION_UPDATE_MEMORY";
export class ActionUpdateMemory {
    type: "ACTION_UPDATE_MEMORY";
    page: number;
    startAddress: number;
    bytes: number[];
    kickoffEmulatorUpdate: boolean;
}

export type Action =
    ActionInit |
    ActionInitEmulator |
    ActionUpdateCycles |
    ActionUpdateRegisters |
    ActionSetSrc |
    ActionPlay |
    ActionPause |
    ActionStop |
    ActionStep |
    ActionSetBreakpoint |
    ActionClearBreakpoint |
    ActionUpdateMemory;