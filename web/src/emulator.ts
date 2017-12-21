import {
    ACTION_INIT_EMULATOR,
    ACTION_SET_SRC,
    ACTION_UPDATE_REGISTERS,
} from './store/actions';
import { store } from './store/store';

const wasm_url: string = require('../static/hassel_wasm_dbg.wasm');
const initial_rom_url: string = require('../static/os.rom');
const initial_src_map_url: string = require('../static/os.rom.s.map');

interface WasmEmulatorInstance { }

interface WasmExports {
    emulator_new: () => WasmEmulatorInstance;
    emulator_delete: (WasmEmulatorInstance) => void;
    emulator_reset: (WasmEmulatorInstance) => void;
    emulator_step: (WasmEmulatorInstance) => void;
    emulator_reg_pc: (WasmEmulatorInstance) => number;
}

export class Emulator {
    private assembly_instance: WebAssembly.Instance;
    private assembly_exports: WasmExports;
    private emulator: WasmEmulatorInstance;

    constructor(instance: WebAssembly.Instance, rom: ArrayBuffer) {
        this.assembly_instance = instance;
        this.assembly_exports = this.assembly_instance.exports;
        this.emulator = this.assembly_exports.emulator_new();
    }

    public reset() {
        this.assembly_exports.emulator_reset(this.emulator);
        this.send_update();
    }

    public step() {
        this.assembly_exports.emulator_step(this.emulator);
        this.send_update();
    }

    public reg_pc(): number {
        return this.assembly_exports.emulator_reg_pc(this.emulator);
    }

    public send_update() {
        store.dispatch({
            type: ACTION_UPDATE_REGISTERS,
            registerA: 0,
            registerS: 0,
            registerX: 0,
            registerY: 0,
            registerPc: this.reg_pc(),
        })
    }
}

export function initEmulator() {
    fetch(wasm_url)
        .then(response => response.arrayBuffer())
        .then(bytes => WebAssembly.instantiate(bytes, {
            env: {
            }
        }))
        .then(results => {
            let instance = results.instance;

            fetch(initial_rom_url)
                .then(response => response.arrayBuffer())
                .then(rom => {
                    let emulator = new Emulator(instance, rom);
                    store.dispatch({
                        type: ACTION_INIT_EMULATOR,
                        instance: emulator,
                    });
                    emulator.reset();
                });
            
            fetch(initial_src_map_url)
                .then(response => response.json())
                .then(srcMap => {
                    let units = srcMap['src_units']['units'];
                    let map = srcMap['pc_to_src'];
                    store.dispatch({
                        type: ACTION_SET_SRC,
                        units: units,
                        srcMap: map,
                    });
                });
        });

}