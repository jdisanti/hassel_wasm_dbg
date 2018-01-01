//
// Copyright 2017 hassel_wasm_dbg Developers
//
// Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
// http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
// http://opensource.org/licenses/MIT>, at your option. This file may not be
// copied, modified, or distributed except according to those terms.
//

export function formatHexWord(val: number, prefix: boolean = true): string {
    let formatted = (val + 0x10000).toString(16).substr(-4).toUpperCase();
    return prefix ? "$" + formatted : formatted;
}

export function formatHexByte(val: number, prefix: boolean = true): string {
    let formatted = (val + 0x100).toString(16).substr(-2).toUpperCase();
    return prefix ? "$" + formatted : formatted;
}
