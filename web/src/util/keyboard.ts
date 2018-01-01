//
// Copyright 2017 hassel_wasm_dbg Developers
//
// Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
// http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
// http://opensource.org/licenses/MIT>, at your option. This file may not be
// copied, modified, or distributed except according to those terms.
//

export enum KeyboardHandlerPriority {
    GraphicsView = 0,
    GlobalHotkey,
}

export enum KeyboardEventType {
    Up,
    Down,
}

export enum KeyboardHandlerResult {
    Unhandled = 0,
    Handled = 1,
}

type KeyboardHandlerMethod = (KeyboardEventType, KeyboardEvent) => KeyboardHandlerResult;

type KeyboardHandler = {
    priority: KeyboardHandlerPriority;
    handler: KeyboardHandlerMethod;
}

function compareHandlers(lhs: KeyboardHandler, rhs: KeyboardHandler): number {
    if (lhs.priority < rhs.priority) {
        return -1;
    }
    if (lhs.priority > rhs.priority) {
        return 1;
    }
    return 0;
}

export class KeyboardManager {
    private keyHandlers: KeyboardHandler[] = [];

    constructor() {
        document.addEventListener("keydown", (e) => this.onKeyDown(e), false);
        document.addEventListener("keyup", (e) => this.onKeyUp(e), false);
    }

    public addKeyHandler(priority: KeyboardHandlerPriority, handler: KeyboardHandlerMethod) {
        this.keyHandlers.push({
            priority: priority,
            handler: handler,
        });
        this.keyHandlers.sort(compareHandlers);
    }

    private onKeyDown(event: KeyboardEvent) {
        for (let handler of this.keyHandlers) {
            if (handler.handler(KeyboardEventType.Down, event) === KeyboardHandlerResult.Handled) {
                event.preventDefault();
                break;
            }
        }
    }

    private onKeyUp(event: KeyboardEvent) {
        for (let handler of this.keyHandlers) {
            if (handler.handler(KeyboardEventType.Up, event) === KeyboardHandlerResult.Handled) {
                event.preventDefault();
                break;
            }
        }
    }
}

export const Keyboard: KeyboardManager = new KeyboardManager();