use hassel_emu::hassel::{GraphicsDevice, HasselSystemBuilder, IODevice, Key};
use hassel_emu::Cpu;
use std::cell::{Ref, RefCell};
use std::collections::HashSet;
use std::rc::Rc;

pub enum StepResult {
    Ok(usize),
    HitBreakpoint(usize, u16),
}

pub struct DebuggingEmulator {
    emulator: Cpu,
    graphics_device: Rc<RefCell<GraphicsDevice>>,
    io_device: Rc<RefCell<IODevice>>,
    breakpoints: HashSet<u16>,
}

impl DebuggingEmulator {
    pub fn new(rom: Vec<u8>) -> DebuggingEmulator {
        let (memory, graphics, io) = HasselSystemBuilder::new().rom(rom).build();
        DebuggingEmulator {
            emulator: Cpu::new(memory),
            graphics_device: graphics,
            io_device: io,
            breakpoints: HashSet::new(),
        }
    }

    pub fn cpu(&self) -> &Cpu {
        &self.emulator
    }

    pub fn graphics(&self) -> Ref<GraphicsDevice> {
        self.graphics_device.borrow()
    }

    pub fn reset(&mut self) {
        self.emulator.reset();
    }

    pub fn key_down(&mut self, key_code: u8) {
        self.io_device.borrow_mut().key_down(Key::from(key_code));
    }

    pub fn key_up(&mut self, key_code: u8) {
        self.io_device.borrow_mut().key_up(Key::from(key_code));
    }

    pub fn step(&mut self) -> StepResult {
        let cycles = self.emulator.step();
        let pc = self.emulator.registers().pc;
        if self.breakpoints.contains(&pc) {
            StepResult::HitBreakpoint(cycles, pc)
        } else {
            StepResult::Ok(cycles)
        }
    }

    pub fn add_breakpoint(&mut self, pc: u16) {
        self.breakpoints.insert(pc);
    }

    pub fn remove_breakpoint(&mut self, pc: u16) {
        self.breakpoints.remove(&pc);
    }

    pub fn remove_all_breakpoints(&mut self) {
        self.breakpoints.clear();
    }
}
