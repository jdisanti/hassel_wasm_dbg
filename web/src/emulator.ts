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
    alloc: (number) => any;
    dealloc: (any, number) => void;

    emulator_new: (any, number) => WasmEmulatorInstance;
    emulator_delete: (WasmEmulatorInstance) => void;

    emulator_reset: (WasmEmulatorInstance) => void;
    emulator_step: (WasmEmulatorInstance) => void;

    emulator_add_breakpoint: (WasmEmulatorInstance, number) => void;
    emulator_remove_breakpoint: (WasmEmulatorInstance, number) => void;
    emulator_remove_all_breakpoints: (WasmEmulatorInstance) => void;
    emulator_play: (WasmEmulatorInstance, number) => boolean;

    emulator_reg_a: (WasmEmulatorInstance) => number;
    emulator_reg_x: (WasmEmulatorInstance) => number;
    emulator_reg_y: (WasmEmulatorInstance) => number;
    emulator_reg_status: (WasmEmulatorInstance) => number;
    emulator_reg_pc: (WasmEmulatorInstance) => number;
}

export class Emulator {
    private assembly_instance: WebAssembly.Instance;
    private assembly_exports: WasmExports;
    private emulator: WasmEmulatorInstance;

    constructor(instance: WebAssembly.Instance, rom: ArrayBuffer) {
        this.assembly_instance = instance;
        this.assembly_exports = this.assembly_instance.exports;

        let romView = new Uint8Array(rom);

        // Don't need to dealloc because emulator_new takes ownership of it
        let romPtr = this.assembly_exports.alloc(rom.byteLength);
        let memView = new Uint8Array(this.assembly_instance.exports.memory.buffer);
        for (let i = 0; i < rom.byteLength; i++) {
            memView[romPtr + i] = romView[i];
        }

        this.emulator = this.assembly_exports.emulator_new(romPtr, rom.byteLength);
    }

    public reset() {
        this.assembly_exports.emulator_reset(this.emulator);
        this.send_update();
    }

    public step() {
        this.assembly_exports.emulator_step(this.emulator);
        this.send_update();
    }

    public reg_a(): number {
        return this.assembly_exports.emulator_reg_a(this.emulator);
    }

    public reg_x(): number {
        return this.assembly_exports.emulator_reg_x(this.emulator);
    }

    public reg_y(): number {
        return this.assembly_exports.emulator_reg_y(this.emulator);
    }

    public reg_status(): number {
        return this.assembly_exports.emulator_reg_status(this.emulator);
    }

    public reg_pc(): number {
        return this.assembly_exports.emulator_reg_pc(this.emulator);
    }

    public send_update() {
        store.dispatch({
            type: ACTION_UPDATE_REGISTERS,
            registerA: this.reg_a(),
            registerS: this.reg_status(),
            registerX: this.reg_x(),
            registerY: this.reg_y(),
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

            fetch(initial_src_map_url)
                .then(response => response.json())
                .then(srcMap => {
                    let units = srcMap['src_units']['units'];
                    let addressToUnit: {[key:string]: number} = {};

                    let entries = srcMap['entries'];
                    for (let entry of entries) {
                        units[entry.unit].addressToLine = units[entry.unit].addressToLine || {};
                        units[entry.unit].lineToAddress = units[entry.unit].lineToAddress || {};

                        units[entry.unit].addressToLine["" + entry.address] = entry.line;
                        units[entry.unit].lineToAddress["" + entry.line] = entry.address;

                        addressToUnit["" + entry.address] = entry.unit;
                    }

                    store.dispatch({
                        type: ACTION_SET_SRC,
                        units: units,
                        addressToUnit: addressToUnit,
                    });

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
                });
        });
}