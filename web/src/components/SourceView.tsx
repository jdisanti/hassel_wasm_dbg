import * as React from 'react';

export interface SourceViewProps {
    sourceName: string,
    source: string,
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
                        {this.lines().map((line, index) => this.renderLine(line, index + 1))}
                    </ol>
                </div>
            </div>
        );
    }

    renderLine(line: string, lineNumber: number): JSX.Element {
        let isCurrent = this.props.currentLine === lineNumber;
        return (
            <li key={lineNumber}
                className={isCurrent ? "current" : ""}
                ref={(line) => this.currentLine = isCurrent ? line : this.currentLine}>
                <pre>{line === "" ? " " : line}</pre>
            </li>
        );
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

    private lines(): string[] {
        return this.props.source.split("\n");
    }
}