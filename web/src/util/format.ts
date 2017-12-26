export function formatHexWord(val: number, prefix: boolean = true): string {
    let formatted = (val + 0x10000).toString(16).substr(-4).toUpperCase();
    return prefix ? "$" + formatted : formatted;
}

export function formatHexByte(val: number, prefix: boolean = true): string {
    let formatted = (val + 0x100).toString(16).substr(-2).toUpperCase();
    return prefix ? "$" + formatted : formatted;
}
