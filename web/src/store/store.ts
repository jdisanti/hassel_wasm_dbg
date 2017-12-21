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
}

export interface SrcUnit {
    id: number,
    name: string,
    source: string,
}

export interface SrcStore {
    isLoading: boolean,
    units: SrcUnit[],
    srcMap?: object,
    current?: string,
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
        }
    },
    src: {
        isLoading: true,
        units: [],
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
        case ACTION_UPDATE_REGISTERS:
        case ACTION_PLAY:
        case ACTION_PAUSE:
        case ACTION_STOP:
        case ACTION_STEP:
            return { ...state, emulator: emulatorReducer(state.emulator, action) };
        case ACTION_SET_SRC:
            return { ...state, src: srcReducer(state.src, action) };
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
        case ACTION_STEP: {
                setTimeout(() => {
                    if (state.instance) {
                        state.instance.step()
                    }
                }, 0);
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
            let srcMap = action.srcMap;
            let current = units.length > 0 ? units[0].source : undefined;
            return {
                ...state,
                isLoading: false,
                units: units,
                srcMap: srcMap,
                current: current,
            }
        }
        default:
            return state;
    }
}

store.dispatch({ type: ACTION_INIT });

store.subscribe(() => {
    console.log(store.getState());
});