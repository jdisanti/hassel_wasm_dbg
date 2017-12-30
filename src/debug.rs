use hassel_emu::bus::{GraphicsBus, IOBus, Key, PeripheralBus};
use hassel_emu::cpu::Cpu;
use hassel_emu::emulator::Emulator;
use std::cell::{Ref, RefCell};
use std::collections::HashSet;
use std::rc::Rc;

pub enum StepResult {
    Ok(usize),
    HitBreakpoint(usize, u16)
}

pub struct DebuggingEmulator {
    emulator: Emulator,
    graphics_bus: Rc<RefCell<GraphicsBus>>,
    io_bus: Rc<RefCell<IOBus>>,
    breakpoints: HashSet<u16>,
}

impl DebuggingEmulator {
    pub fn new(rom: Vec<u8>) -> DebuggingEmulator {
        let graphics_bus = Rc::new(RefCell::new(GraphicsBus::new()));
        let io_bus = Rc::new(RefCell::new(IOBus::new()));
        let peripheral_bus = Rc::new(RefCell::new(PeripheralBus::new(
            Rc::clone(&graphics_bus),
            Rc::clone(&io_bus),
        )));
        DebuggingEmulator {
            emulator: Emulator::new(rom, peripheral_bus),
            graphics_bus: graphics_bus,
            io_bus: io_bus,
            breakpoints: HashSet::new(),
        }
    }

    pub fn cpu(&self) -> &Cpu {
        self.emulator.cpu()
    }

    pub fn graphics_bus(&self) -> Ref<GraphicsBus> {
        self.graphics_bus.borrow()
    }

    pub fn reset(&mut self) {
        self.emulator.reset();
    }

    pub fn key_down(&mut self, key_code: u8) {
        self.io_bus.borrow_mut().key_down(Key::from(key_code));
    }

    pub fn key_up(&mut self, key_code: u8) {
        self.io_bus.borrow_mut().key_up(Key::from(key_code));
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