import * as React from 'react';
import { formatHexByte, formatHexWord } from '../util/format';

export interface MemoryViewProps {
    memory: number[],
    startAddress: number,
}

type ByteLine = {
    address: string,
    bytes: string,
}

export default class MemoryView extends React.Component<MemoryViewProps, any> {
    render(): JSX.Element {
        return (
            <div className="card memory-view mb-2">
                <div className="card-header">
                    <strong>Memory Page at 0x{formatHexWord(this.props.startAddress, false)}</strong>
                </div>
                <div className="card-block p-2">
                    {this.renderBytes()}
                </div>
            </div>
        );
    }

    renderBytes(): JSX.Element {
        return (
            <ol>
                {this.arrangeBytes().map(line => this.renderByteLine(line))}
            </ol>
        );
    }

    renderByteLine(line: ByteLine): JSX.Element {
        return (
            <li key={line.address}>
                <pre className="address">{line.address}: </pre>
                <pre>{line.bytes}</pre>
            </li>
        );
    }

    arrangeBytes(width: number = 16): ByteLine[] {
        let memory = this.props.memory;
        let lines: ByteLine[] = [];

        let line = "";
        let address = this.props.startAddress;
        for (let i = 0; i < memory.length; i++) {
            line += formatHexByte(memory[i], false);
            if ((i + 1) % width === 0) {
                lines.push({
                    address: formatHexWord(address),
                    bytes: line,
                });
                line = "";
                address += width;
            } else {
                line += ' ';
            }
        }
        return lines;
    }
}