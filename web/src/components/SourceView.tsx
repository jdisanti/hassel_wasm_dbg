import * as React from 'react';
import { Line, store } from '../store/store';
import { ACTION_SET_BREAKPOINT, ACTION_CLEAR_BREAKPOINT } from '../store/actions';

export interface SourceViewProps {
    sourceName: string,
    lines: Line[],
    currentLine?: number,
    breakpoints: number[],
}

export default class SourceView extends React.Component<SourceViewProps, any> {
    private currentLine: HTMLLIElement | null = null;

    render(): JSX.Element {
        return (
            <div className="card source-viewport">
                <div className="card-header">
                    {this.props.sourceName}
                </div>
                <div className="card-block">
                    <ol>
                        {this.props.lines.map((line, index) => this.renderLine(line, index + 1))}
                    </ol>
                </div>
            </div>
        );
    }

    renderLine(line: Line, lineNumber: number): JSX.Element {
        let isCurrent = this.props.currentLine === lineNumber;
        return (
            <li key={lineNumber}
                className={isCurrent ? "current" : ""}
                ref={(line) => this.currentLine = isCurrent ? line : this.currentLine}>
                {this.renderBreakpoint(line.address)}
                {this.renderAddress(line.address)}
                <pre>{line.text === "" ? " " : line.text}</pre>
            </li>
        );
    }

    renderBreakpoint(address?: number): JSX.Element | null {
        if (address === undefined) {
            return null;
        } else {
            let classes = "breakpoint";
            if (this.props.breakpoints.indexOf(address) !== -1) {
                classes += " set";
            }
            return (
                <div className={classes}
                     onClick={this.breakpointClicked.bind(this, address)}>&#9679;</div>
            );
        }
    }

    renderAddress(address?: number): JSX.Element {
        if (address === undefined) {
            return (<pre className="address">     : </pre>);
        } else {
            let formatted = (address + 0x10000).toString(16).substr(-4).toUpperCase();
            return (<pre className="address">${formatted}: </pre>);
        }
    }

    breakpointClicked(address: number) {
        let set = this.props.breakpoints.indexOf(address) === -1;
        store.dispatch({
            type: set ? ACTION_SET_BREAKPOINT : ACTION_CLEAR_BREAKPOINT,
            address: address,
        });
    }

    componentDidUpdate(previousProps) {
        if (this.props.currentLine !== previousProps.currentLine && this.currentLine) {
            this.currentLine.scrollIntoView({
                behavior: "instant",
                block: "nearest",
                inline: "nearest",
            });
        }
    }
}