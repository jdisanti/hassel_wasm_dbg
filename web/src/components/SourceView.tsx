import * as React from 'react';

export interface SourceViewProps {
    source: string,
    currentLine?: number,
}

export default class SourceView extends React.Component<SourceViewProps, any> {
    render(): JSX.Element {
        return (
            <div className="card source-viewport">
                <ol>
                    {this.lines().map((line, index) => this.renderLine(line, index + 1))}
                </ol>
            </div>
        );
    }

    renderLine(line: string, lineNumber: number): JSX.Element {
        return (
            <li key={lineNumber} className={this.props.currentLine === lineNumber ? "current" : ""}>
                <pre>{line === "" ? " " : line}</pre>
            </li>
        );
    }

    private lines(): string[] {
        return this.props.source.split("\n");
    }
}