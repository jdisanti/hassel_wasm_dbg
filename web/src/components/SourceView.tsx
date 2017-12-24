import * as React from 'react';
import { Line } from '../store/store';

export interface SourceViewProps {
    sourceName: string,
    lines: Line[],
    currentLine?: number,
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
                {this.renderAddress(line.address)}
                <pre>{line.text === "" ? " " : line.text}</pre>
            </li>
        );
    }

    renderAddress(address?: number): JSX.Element {
        if (address === undefined) {
            return (<pre className="address">     : </pre>);
        } else {
            let formatted = (address + 0x10000).toString(16).substr(-4).toUpperCase();
            return (<pre className="address">${formatted}: </pre>);
        }
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