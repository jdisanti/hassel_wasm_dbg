import * as React from 'react';
import { formatHexByte, formatHexWord } from '../util/format';
import { ACTION_UPDATE_MEMORY } from '../store/actions';
import { store } from '../store/store';

export interface MemoryViewProps {
    index: number,
    memory: number[],
    startAddress: number,
}

type MemoryViewState = {
    enteredPage: string,
    error: string,
}

type ByteLine = {
    address: string,
    bytes: string,
    ascii: string,
}

export default class MemoryView extends React.Component<MemoryViewProps, any> {
    constructor(props: MemoryViewProps) {
        super(props);
        this.state = {
            enteredPage: formatHexWord(this.props.startAddress, false).substring(0, 2),
            error: "",
        };
    }

    render(): JSX.Element {
        return (
            <div className="card memory-view mb-2">
                <div className="card-header">
                    <strong>Memory Page at 0x{formatHexWord(this.props.startAddress, false)}</strong>
                </div>
                <div className="card-block p-2">
                    <div>
                        <label htmlFor="page" className="mr-2">Page:</label>
                        <input type="text"
                               name="page"
                               className="mr-2"
                               size={2}
                               maxLength={2}
                               value={this.state.enteredPage}
                               onChange={this.pageChanged.bind(this)} />
                        <span className="error">{this.state.error}</span>
                    </div>
                    <div className="memory">
                        {this.renderBytes()}
                    </div>
                </div>
            </div>
        );
    }

    pageChanged(event) {
        let value = event.target.value;
        this.setState({
            enteredPage: value,
            error: "",
        });

        let desiredPage: string = value + "00";
        if (desiredPage.match(/[A-Fa-f0-9]{4}/)) {
            store.dispatch({
                type: ACTION_UPDATE_MEMORY,
                page: this.props.index,
                startAddress: parseInt(desiredPage, 16),
                bytes: [],
                kickoffEmulatorUpdate: true,
            });
        } else {
            this.setState({ error: "Invalid page value. Must be a hex byte." });
        }
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
                <pre>{line.bytes}  {line.ascii}</pre>
            </li>
        );
    }

    arrangeBytes(width: number = 16): ByteLine[] {
        let memory = this.props.memory;
        let lines: ByteLine[] = [];

        let hexLine = "", asciiLine = "";
        let address = this.props.startAddress;
        for (let i = 0; i < memory.length; i++) {
            hexLine += formatHexByte(memory[i], false);
            if (memory[i] >= 0x20 && memory[i] <= 0x7E) {
                asciiLine += String.fromCharCode(memory[i]);
            } else {
                asciiLine += '.';
            }
            if ((i + 1) % width === 0) {
                lines.push({
                    address: formatHexWord(address),
                    bytes: hexLine,
                    ascii: asciiLine,
                });
                asciiLine = hexLine = "";
                address += width;
            } else {
                hexLine += ' ';
            }
        }
        return lines;
    }
}