use hassel_emu::bus::Bus;
use hassel_emu::cpu::Cpu;
use hassel_emu::emulator::Emulator;
use std::cell::RefCell;
use std::collections::HashSet;
use std::rc::Rc;

pub enum StepResult {
    Ok(usize),
    HitBreakpoint(usize, u16)
}

pub struct DebuggingEmulator {
    emulator: Emulator,
    breakpoints: HashSet<u16>,
}

impl DebuggingEmulator {
    pub fn new(rom: Vec<u8>, peripheral_bus: Rc<RefCell<Bus>>) -> DebuggingEmulator {
        DebuggingEmulator {
            emulator: Emulator::new(rom, peripheral_bus),
            breakpoints: HashSet::new(),
        }
    }

    pub fn cpu(&self) -> &Cpu {
        self.emulator.cpu()
    }

    pub fn reset(&mut self) {
        self.emulator.reset();
    }

    pub fn step(&mut self) -> StepResult {
        let cycles = self.emulator.step();
        let pc = self.emulator.cpu().reg_pc();
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