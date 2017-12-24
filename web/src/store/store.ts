import { createStore } from 'redux';
import {
    Action,
    ACTION_INIT,
    ACTION_INIT_EMULATOR,
    ACTION_SET_SRC,
    ACTION_UPDATE_REGISTERS,
    ACTION_PLAY,
    ACTION_PAUSE,
    ACTION_STEP,
    ACTION_STOP,
    ACTION_SET_BREAKPOINT,
    ACTION_CLEAR_BREAKPOINT,
} from './actions';
import { Emulator } from '../emulator';

export interface RegisterStore {
    registerA: number,
    registerS: number,
    registerX: number,
    registerY: number,
    registerPc: number,
}

export interface EmulatorStore {
    isLoading: boolean,
    instance?: Emulator,
    registers: RegisterStore,
    isPaused: boolean,
}

export interface SrcUnit {
    id: number,
    name: string,
    source: string,
    addressToLine: object,
    lineToAddress: object,
}

export interface Line {
    address?: number,
    text: string,
}

export interface CurrentSrc {
    name: string,
    lines: Line[],
    currentLine?: number,
}

export interface SrcStore {
    isLoading: boolean,
    units: SrcUnit[],
    addressToUnit: {[key:string]: number},
    currentSrc: CurrentSrc,
    breakpoints: number[],
}

export interface RootStore {
    emulator: EmulatorStore,
    src: SrcStore,
}

const initialState: RootStore = {
    emulator: {
        isLoading: true,
        registers: {
            registerA: 0,
            registerS: 0,
            registerX: 0,
            registerY: 0,
            registerPc: 0,
        },
        isPaused: true,
    },
    src: {
        isLoading: true,
        units: [],
        addressToUnit: {},
        currentSrc: {
            name: "",
            lines: [],
        },
        breakpoints: [],
    }
};

let reduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__;
export const store = createStore(
    rootReducer,
    reduxDevTools && reduxDevTools()
);

function rootReducer(state: RootStore = initialState, action: Action): RootStore {
    switch (action.type) {
        case ACTION_INIT_EMULATOR:
        case ACTION_PLAY:
        case ACTION_PAUSE:
        case ACTION_STOP:
        case ACTION_STEP:
            return { ...state, emulator: emulatorReducer(state.emulator, action) };
        case ACTION_SET_SRC:
            return { ...state, src: srcReducer(state.src, action) };
        case ACTION_UPDATE_REGISTERS:
        case ACTION_SET_BREAKPOINT:
        case ACTION_CLEAR_BREAKPOINT:
            return {
                ...state,
                emulator: emulatorReducer(state.emulator, action),
                src: srcReducer(state.src, action),
            };
        default:
            return state;
    }
}

function emulatorReducer(state: EmulatorStore, action: Action): EmulatorStore {
    switch (action.type) {
        case ACTION_INIT_EMULATOR:
            return { ...state, isLoading: false, instance: action.instance };
        case ACTION_UPDATE_REGISTERS:
            return {
                ...state,
                registers: {
                    registerA: action.registerA,
                    registerS: action.registerS,
                    registerX: action.registerX,
                    registerY: action.registerY,
                    registerPc: action.registerPc,
                }
            };
        case ACTION_PLAY: {
            setTimeout(() => {
                if (state.instance) {
                    state.instance.startPlayback();
                }
            }, 0);
            return { ...state, isPaused: false };
        }
        case ACTION_PAUSE: {
            setTimeout(() => {
                if (state.instance) {
                    state.instance.stopPlayback();
                }
            }, 0);
            return { ...state, isPaused: true };
        }
        case ACTION_STEP: {
            setTimeout(() => {
                if (state.instance) {
                    state.instance.step()
                }
            }, 0);
            return state;
        }
        case ACTION_STOP: {
            setTimeout(() => {
                if (state.instance) {
                    state.instance.reset();
                }
            }, 0);
            return state;
        }
        case ACTION_SET_BREAKPOINT: {
            if (state.instance) {
                state.instance.addBreakpoint(action.address);
            }
            return state;
        }
        case ACTION_CLEAR_BREAKPOINT: {
            if (state.instance) {
                state.instance.removeBreakpoint(action.address);
            }
            return state;
        }
        default:
            return state;
    }
}

function srcReducer(state: SrcStore, action: Action): SrcStore {
    switch (action.type) {
        case ACTION_SET_SRC: {
            let units = action.units as SrcUnit[];
            let current = units.length > 0 ? createCurrentSrc(units, 0) : { name: "", lines: [] };
            return {
                ...state,
                isLoading: false,
                units: units,
                currentSrc: current,
                addressToUnit: action.addressToUnit,
            };
        }
        case ACTION_UPDATE_REGISTERS: {
            let address = action.registerPc;
            let unit = state.addressToUnit[address];
            if (unit !== undefined) {
                return {
                    ...state,
                    currentSrc: createCurrentSrc(state.units, unit, address),
                };
            }
            return state;
        }
        case ACTION_SET_BREAKPOINT: {
            let breakpoints: number[] = [];
            state.breakpoints.forEach(address => breakpoints.push(address));
            breakpoints.push(action.address);
            return {
                ...state,
                breakpoints: breakpoints,
            };
        }
        case ACTION_CLEAR_BREAKPOINT: {
            let breakpoints = state.breakpoints.filter(address => address !== action.address);
            return {
                ...state,
                breakpoints: breakpoints,
            };
        }
        default:
            return state;
    }
}

function createCurrentSrc(units: SrcUnit[], unit: number, address?: number): CurrentSrc {
    let lineStrings = units[unit].source.split("\n");
    let lines: Line[] = lineStrings.map((lineString, index) => {
        return {
            address: units[unit].lineToAddress["" + (1 + index)],
            text: lineString,
        };
    });

    return {
        name: units[unit].name,
        lines: lines,
        currentLine: address !== undefined ? units[unit].addressToLine[address] : undefined,
    };
}

store.dispatch({ type: ACTION_INIT });
