import {
    ACTION_INIT_EMULATOR,
    ACTION_SET_SRC,
    ACTION_UPDATE_REGISTERS,
    ACTION_PAUSE,
} from './store/actions';
import { store } from './store/store';

const wasm_url: string = require('../static/hassel_wasm_dbg.wasm');
const initial_rom_url: string = require('../static/os.rom');
const initial_src_map_url: string = require('../static/os.rom.s.map');

interface WasmEmulatorInstance { }

interface WasmExports {
    alloc: (len: number) => number;
    dealloc: (ptr: number, len: number) => void;

    emulator_new: (rom_ptr: number, rom_len: number) => WasmEmulatorInstance;
    emulator_delete: (emulator_ptr: WasmEmulatorInstance) => void;

    emulator_reset: (emulator_ptr: WasmEmulatorInstance) => void;
    emulator_step: (emulator_ptr: WasmEmulatorInstance) => void;

    emulator_add_breakpoint: (emulator_ptr: WasmEmulatorInstance, address: number) => void;
    emulator_remove_breakpoint: (emulator_ptr: WasmEmulatorInstance, address: number) => void;
    emulator_remove_all_breakpoints: (emulator_ptr: WasmEmulatorInstance) => void;
    emulator_play: (emulator_ptr: WasmEmulatorInstance, cycles: number) => boolean;

    emulator_reg_a: (emulator_ptr: WasmEmulatorInstance) => number;
    emulator_reg_x: (emulator_ptr: WasmEmulatorInstance) => number;
    emulator_reg_y: (emulator_ptr: WasmEmulatorInstance) => number;
    emulator_reg_status: (emulator_ptr: WasmEmulatorInstance) => number;
    emulator_reg_sp: (emulator_ptr: WasmEmulatorInstance) => number;
    emulator_reg_pc: (emulator_ptr: WasmEmulatorInstance) => number;

    emulator_get_memory: (emulator_ptr: WasmEmulatorInstance, buffer_ptr: number) => void;
}

export class Emulator {
    private assembly_instance: WebAssembly.Instance;
    private assembly_exports: WasmExports;
    private emulator: WasmEmulatorInstance;
    private playbackInterval: number | null = null;
    private playing: boolean = false;
    private memoryPtr: number;

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
        this.memoryPtr = this.assembly_exports.alloc(0x10000);
    }

    public getMemorySlice(start: number, end: number): number[] {
        let memory: number[] = [];
        if (start < end) {
            this.assembly_exports.emulator_get_memory(this.emulator, this.memoryPtr);
            let memoryView = new Uint8Array(this.assembly_instance.exports.memory.buffer);
            for (let i = start; i < end; i++) {
                memory.push(memoryView[this.memoryPtr + i]);
            }
        }
        return memory;
    }

    public reset() {
        if (!this.playing) {
            this.assembly_exports.emulator_reset(this.emulator);
            this.sendUpdate();
        }
    }

    public step() {
        if (!this.playing) {
            this.assembly_exports.emulator_step(this.emulator);
            this.sendUpdate();
        }
    }

    public addBreakpoint(address: number) {
        this.assembly_exports.emulator_add_breakpoint(this.emulator, address);
    }

    public removeBreakpoint(address: number) {
        this.assembly_exports.emulator_remove_breakpoint(this.emulator, address);
    }

    public removeAllBreakpoints() {
        this.assembly_exports.emulator_remove_all_breakpoints(this.emulator);
    }

    private play(cycles: number): boolean {
        return this.assembly_exports.emulator_play(this.emulator, cycles);
    }

    public startPlayback() {
        if (!this.playing) {
            this.playing = true;

            // 60,000 cycles should execute in 10 milliseconds for semi-accurate timing
            let cyclesPerInterval = 60000;
            let interval = 10;

            let timeoutMethod = () => {
                if (this.playing) {
                    if (this.play(cyclesPerInterval)) {
                        store.dispatch({ type: ACTION_PAUSE });
                    } else {
                        setTimeout(timeoutMethod, interval);
                    }
                } else {
                    this.sendUpdate();
                }
            }
            setTimeout(timeoutMethod, interval);
        }
    }

    public stopPlayback() {
        this.playing = false;
        this.sendUpdate();
    }

    public regA(): number {
        return this.assembly_exports.emulator_reg_a(this.emulator);
    }

    public regX(): number {
        return this.assembly_exports.emulator_reg_x(this.emulator);
    }

    public regY(): number {
        return this.assembly_exports.emulator_reg_y(this.emulator);
    }

    public regStatus(): number {
        return this.assembly_exports.emulator_reg_status(this.emulator);
    }

    public regSp(): number {
        return this.assembly_exports.emulator_reg_sp(this.emulator);
    }

    public regPc(): number {
        return this.assembly_exports.emulator_reg_pc(this.emulator);
    }

    public sendUpdate() {
        store.dispatch({
            type: ACTION_UPDATE_REGISTERS,
            registerA: this.regA(),
            registerS: this.regStatus(),
            registerX: this.regX(),
            registerY: this.regY(),
            registerSp: this.regSp(),
            registerPc: this.regPc(),
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