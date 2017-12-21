use std::rc::Rc;
use std::cell::RefCell;

extern crate hassel_emu;
use hassel_emu::emulator::Emulator;
use hassel_emu::bus::PlaceholderBus;

#[no_mangle]
pub fn emulator_new() -> *mut Emulator {
    let emulator = Box::new(Emulator::new(
        vec![0; 0x2000],
        Rc::new(RefCell::new(PlaceholderBus::new("test".into()))),
    ));
    Box::into_raw(emulator)
}

#[no_mangle]
pub fn emulator_delete(emulator_ptr: *mut Emulator) {
    let emulator: Box<Emulator> = unsafe { Box::from_raw(emulator_ptr) };
    drop(emulator);
}

#[no_mangle]
pub fn emulator_reset(emulator_ptr: *mut Emulator) {
    let mut emulator: Box<Emulator> = unsafe { Box::from_raw(emulator_ptr) };
    emulator.reset();
    std::mem::forget(emulator);
}

#[no_mangle]
pub fn emulator_step(emulator_ptr: *mut Emulator) {
    let mut emulator: Box<Emulator> = unsafe { Box::from_raw(emulator_ptr) };
    emulator.step();
    std::mem::forget(emulator);
}

#[no_mangle]
pub fn emulator_reg_pc(emulator_ptr: *mut Emulator) -> u16 {
    let emulator: Box<Emulator> = unsafe { Box::from_raw(emulator_ptr) };
    let result = emulator.cpu().reg_pc();
    std::mem::forget(emulator);
    result
}