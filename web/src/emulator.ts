import {
    ACTION_INIT_EMULATOR,
    ACTION_SET_SRC,
    ACTION_UPDATE_REGISTERS,
    ACTION_UPDATE_MEMORY,
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
    emulator_get_graphics_data: (emulator_ptr: WasmEmulatorInstance, buffer_ptr: number) => void;
}

const GRAPHICS_WIDTH = 640;
const GRAPHICS_HEIGHT = 480;
const GRAPHICS_BUFFER_SIZE = GRAPHICS_WIDTH * GRAPHICS_HEIGHT * 4;
const MEMORY_VIEW_BUFFER_SIZE = 0x10000;

export class Emulator {
    private assembly_instance: WebAssembly.Instance;
    private assembly_exports: WasmExports;
    private emulator: WasmEmulatorInstance;
    private playbackInterval: number | null = null;
    private playing: boolean = false;
    private memoryPtr: number;

    private graphicsPtr: number;

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
        this.memoryPtr = this.assembly_exports.alloc(MEMORY_VIEW_BUFFER_SIZE);

        this.graphicsPtr = this.assembly_exports.alloc(GRAPHICS_BUFFER_SIZE);
    }

    public destroy() {
        this.assembly_exports.dealloc(this.memoryPtr, MEMORY_VIEW_BUFFER_SIZE);
        this.assembly_exports.dealloc(this.graphicsPtr, GRAPHICS_BUFFER_SIZE);
        this.assembly_exports.emulator_delete(this.emulator);
    }

    public getGraphicsData(): ImageData {
        return new ImageData(new Uint8ClampedArray(
            this.assembly_instance.exports.memory.buffer,
            this.graphicsPtr,
            GRAPHICS_BUFFER_SIZE
        ), GRAPHICS_WIDTH, GRAPHICS_HEIGHT);
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

    public updateGraphics() {
        this.assembly_exports.emulator_get_graphics_data(this.emulator, this.graphicsPtr);
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

            // 600,000 cycles should execute in 100 milliseconds for semi-accurate timing
            let cyclesPerInterval = 600000;
            let interval = 100;

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
        this.updateGraphics();

        let state = store.getState();
        state.emulator.memoryPages.forEach((page, index) => {
            let bytes = this.getMemorySlice(page.startAddress, page.startAddress + 0x100);
            store.dispatch({
                type: ACTION_UPDATE_MEMORY,
                page: index,
                startAddress: page.startAddress,
                bytes: bytes,
                kickoffEmulatorUpdate: false,
            });
        });

        store.dispatch({
            type: ACTION_UPDATE_REGISTERS,
            registerA: this.regA(),
            registerS: this.regStatus(),
            registerX: this.regX(),
            registerY: this.regY(),
            registerSp: this.regSp(),
            registerPc: this.regPc(),
        });
    }
}

let wasmInstance: WebAssembly.Instance | null = null;

export function loadRom(romContents: ArrayBuffer, mapContents: object) {
    let units = mapContents['src_units']['units'];
    let addressToUnit: {[key:string]: number} = {};

    let entries = mapContents['entries'];
    for (let entry of entries) {
        units[entry.unit].addressToLine = units[entry.unit].addressToLine || {};
        units[entry.unit].lineToAddress = units[entry.unit].lineToAddress || {};

        units[entry.unit].addressToLine["" + entry.address] = entry.line;
        units[entry.unit].lineToAddress["" + entry.line] = entry.address;

        addressToUnit["" + entry.address] = entry.unit;
    }

    let state = store.getState();
    if (state.emulator.instance !== undefined) {
        state.emulator.instance.destroy();
    }

    store.dispatch({
        type: ACTION_SET_SRC,
        units: units,
        addressToUnit: addressToUnit,
    });

    let emulator = new Emulator(wasmInstance as WebAssembly.Instance, romContents);
    store.dispatch({
        type: ACTION_INIT_EMULATOR,
        instance: emulator,
    });
    emulator.reset();
}

export function initEmulator() {
    fetch(wasm_url)
        .then(response => response.arrayBuffer())
        .then(bytes => WebAssembly.instantiate(bytes, { env: { } }))
        .then(results => {
            wasmInstance = results.instance;

            fetch(initial_src_map_url)
                .then(response => response.json())
                .then(srcMap => {
                    fetch(initial_rom_url)
                        .then(response => response.arrayBuffer())
                        .then(rom => {
                            loadRom(rom, srcMap);
                        });
                });
        });
}