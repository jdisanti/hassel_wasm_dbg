use std::rc::Rc;
use std::cell::RefCell;
extern crate hassel_emu;
use hassel_emu::emulator::Emulator;
use hassel_emu::bus::PlaceholderBus;

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
pub fn emulator_new(rom_ptr: *mut u8, rom_length: usize) -> *mut Emulator {
    let rom = if rom_length == 0x2000 {
        unsafe { Vec::from_raw_parts(rom_ptr, rom_length, rom_length) }
    } else {
        vec![0; 0x2000]
    };
    let emulator = Box::new(Emulator::new(
        rom,
        Rc::new(RefCell::new(PlaceholderBus::new("test".into()))),
    ));
    Box::into_raw(emulator)
}

#[no_mangle]
pub fn emulator_delete(emulator_ptr: *mut Emulator) {
    let emulator: Box<Emulator> = unsafe { Box::from_raw(emulator_ptr) };
    drop(emulator);
}

macro_rules! with_emu_return {
    ( mut $emulator:ident, $emulator_ptr:ident, $func:expr )  => {
        let mut $emulator: Box<Emulator> = unsafe { Box::from_raw($emulator_ptr) };
        let result = $func();
        mem::forget($emulator);
        return result;
    };
    ( $emulator:ident, $emulator_ptr:ident, $func:expr )  => {
        let $emulator: Box<Emulator> = unsafe { Box::from_raw($emulator_ptr) };
        let result = $func();
        mem::forget($emulator);
        return result;
    };
}

#[no_mangle]
pub fn emulator_reset(emulator_ptr: *mut Emulator) {
    with_emu_return!(mut emulator, emulator_ptr, &mut || {
        emulator.reset();
        ()
    });
}

#[no_mangle]
pub fn emulator_step(emulator_ptr: *mut Emulator) {
    with_emu_return!(mut emulator, emulator_ptr, &mut || {
        emulator.step();
        ()
    });
}

#[no_mangle]
pub fn emulator_reg_a(emulator_ptr: *mut Emulator) -> u8 {
    with_emu_return!(emulator, emulator_ptr, &mut || {
        emulator.cpu().registers().a
    });
}

#[no_mangle]
pub fn emulator_reg_x(emulator_ptr: *mut Emulator) -> u8 {
    with_emu_return!(emulator, emulator_ptr, &mut || {
        emulator.cpu().registers().x
    });
}

#[no_mangle]
pub fn emulator_reg_y(emulator_ptr: *mut Emulator) -> u8 {
    with_emu_return!(emulator, emulator_ptr, &mut || {
        emulator.cpu().registers().y
    });
}

#[no_mangle]
pub fn emulator_reg_status(emulator_ptr: *mut Emulator) -> u8 {
    with_emu_return!(emulator, emulator_ptr, &mut || {
        emulator.cpu().registers().status.value()
    });
}

#[no_mangle]
pub fn emulator_reg_pc(emulator_ptr: *mut Emulator) -> u16 {
    with_emu_return!(emulator, emulator_ptr, &mut || {
        emulator.cpu().reg_pc()
    });
}
