//
// Copyright 2017 hassel_wasm_dbg Developers
//
// Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
// http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
// http://opensource.org/licenses/MIT>, at your option. This file may not be
// copied, modified, or distributed except according to those terms.
//

extern crate hassel_emu;

mod debug;
use debug::{DebuggingEmulator, StepResult};

use std::os::raw::c_void;
use std::mem;

#[no_mangle]
pub fn alloc(len: usize) -> *mut c_void {
    let mut memory = Vec::with_capacity(len);
    let ptr = memory.as_mut_ptr();
    mem::forget(memory);
    ptr as *mut c_void
}

#[no_mangle]
pub fn dealloc(ptr: *mut c_void, len: usize) {
    unsafe {
        Vec::from_raw_parts(ptr, 0, len);
    }
}

#[no_mangle]
pub fn emulator_new(rom_ptr: *mut u8, rom_length: usize) -> *mut DebuggingEmulator {
    let rom = if rom_length == 0x2000 {
        unsafe { Vec::from_raw_parts(rom_ptr, rom_length, rom_length) }
    } else {
        vec![0; 0x2000]
    };
    let emulator = Box::new(DebuggingEmulator::new(rom));
    Box::into_raw(emulator)
}

#[no_mangle]
pub fn emulator_delete(emulator_ptr: *mut DebuggingEmulator) {
    let emulator: Box<DebuggingEmulator> = unsafe { Box::from_raw(emulator_ptr) };
    drop(emulator);
}

fn with_emu<F, R>(emulator_ptr: *mut DebuggingEmulator, func: F) -> R
where
    F: Fn(&mut DebuggingEmulator) -> R,
{
    let mut emulator: Box<DebuggingEmulator> = unsafe { Box::from_raw(emulator_ptr) };
    let result = func(&mut *emulator);
    mem::forget(emulator);
    return result;
}

#[no_mangle]
pub fn emulator_reset(emulator_ptr: *mut DebuggingEmulator) {
    with_emu(emulator_ptr, &|emulator: &mut DebuggingEmulator| {
        emulator.reset();
    });
}

#[no_mangle]
pub fn emulator_step(emulator_ptr: *mut DebuggingEmulator) -> usize {
    with_emu(
        emulator_ptr,
        &|emulator: &mut DebuggingEmulator| match emulator.step() {
            StepResult::Ok(cycles) => cycles,
            StepResult::HitBreakpoint(cycles, _) => cycles,
        },
    )
}

#[no_mangle]
pub fn emulator_key_down(emulator_ptr: &mut DebuggingEmulator, key_code: u8) {
    with_emu(emulator_ptr, &|emulator: &mut DebuggingEmulator| {
        emulator.key_down(key_code);
    });
}

#[no_mangle]
pub fn emulator_key_up(emulator_ptr: &mut DebuggingEmulator, key_code: u8) {
    with_emu(emulator_ptr, &|emulator: &mut DebuggingEmulator| {
        emulator.key_up(key_code);
    });
}

#[no_mangle]
pub fn emulator_add_breakpoint(emulator_ptr: *mut DebuggingEmulator, address: u16) {
    with_emu(emulator_ptr, &|emulator: &mut DebuggingEmulator| {
        emulator.add_breakpoint(address);
    });
}

#[no_mangle]
pub fn emulator_remove_breakpoint(emulator_ptr: *mut DebuggingEmulator, address: u16) {
    with_emu(emulator_ptr, &|emulator: &mut DebuggingEmulator| {
        emulator.remove_breakpoint(address);
    });
}

#[no_mangle]
pub fn emulator_remove_all_breakpoints(emulator_ptr: *mut DebuggingEmulator) {
    with_emu(emulator_ptr, &|emulator: &mut DebuggingEmulator| {
        emulator.remove_all_breakpoints();
    });
}

#[no_mangle]
pub fn emulator_play(emulator_ptr: *mut DebuggingEmulator, cycles: usize) -> usize {
    with_emu(emulator_ptr, &|emulator: &mut DebuggingEmulator| {
        let mut cycles_run = 0;
        // Always want to go slightly over the requested cycles so that
        // the frontend doesn't think we hit a breakpoint since it's doing
        // a naive cycles run vs. requested comparison to determine that
        while cycles_run <= cycles {
            cycles_run += match emulator.step() {
                StepResult::Ok(cycles) => cycles,
                StepResult::HitBreakpoint(cycles, _pc) => {
                    cycles_run += cycles;
                    return cycles_run;
                }
            }
        }
        cycles_run
    })
}

#[no_mangle]
pub fn emulator_reg_a(emulator_ptr: *mut DebuggingEmulator) -> u8 {
    with_emu(emulator_ptr, &|emulator: &mut DebuggingEmulator| {
        emulator.cpu().registers().a
    })
}

#[no_mangle]
pub fn emulator_reg_x(emulator_ptr: *mut DebuggingEmulator) -> u8 {
    with_emu(emulator_ptr, &|emulator: &mut DebuggingEmulator| {
        emulator.cpu().registers().x
    })
}

#[no_mangle]
pub fn emulator_reg_y(emulator_ptr: *mut DebuggingEmulator) -> u8 {
    with_emu(emulator_ptr, &|emulator: &mut DebuggingEmulator| {
        emulator.cpu().registers().y
    })
}

#[no_mangle]
pub fn emulator_reg_status(emulator_ptr: *mut DebuggingEmulator) -> u8 {
    with_emu(emulator_ptr, &|emulator: &mut DebuggingEmulator| {
        emulator.cpu().registers().status.value()
    })
}

#[no_mangle]
pub fn emulator_reg_sp(emulator_ptr: *mut DebuggingEmulator) -> u8 {
    with_emu(emulator_ptr, &|emulator: &mut DebuggingEmulator| {
        emulator.cpu().registers().sp
    })
}

#[no_mangle]
pub fn emulator_reg_pc(emulator_ptr: *mut DebuggingEmulator) -> u16 {
    with_emu(emulator_ptr, &|emulator: &mut DebuggingEmulator| {
        emulator.cpu().registers().pc
    })
}

#[no_mangle]
pub fn emulator_get_memory(emulator_ptr: *mut DebuggingEmulator, buffer_ptr: *mut u8) {
    let buffer_size: usize = 0x10000;
    let emulator: Box<DebuggingEmulator> = unsafe { Box::from_raw(emulator_ptr) };
    let mut buffer = unsafe { Vec::from_raw_parts(buffer_ptr, buffer_size, buffer_size) };

    {
        let debug_read = emulator.cpu().memory().debug_read();
        for i in 0..buffer_size {
            buffer[i] = debug_read.byte(i as u16);
        }
    }

    mem::forget(buffer);
    mem::forget(emulator);
}

#[no_mangle]
pub fn emulator_get_graphics_data(emulator_ptr: *mut DebuggingEmulator, buffer_ptr: *mut u32) {
    let buffer_size = 640 * 480;
    let emulator: Box<DebuggingEmulator> = unsafe { Box::from_raw(emulator_ptr) };
    let mut buffer = unsafe { Vec::from_raw_parts(buffer_ptr, buffer_size, buffer_size) };

    {
        let graphics = emulator.graphics();
        let frame_buffer = graphics.frame_buffer();
        for i in 0..buffer_size {
            buffer[i] = frame_buffer[i];
        }
    }

    mem::forget(buffer);
    mem::forget(emulator);
}
