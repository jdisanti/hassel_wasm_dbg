import * as React from 'react';
import { Line, store } from '../store/store';
import { ACTION_SET_BREAKPOINT, ACTION_CLEAR_BREAKPOINT } from '../store/actions';
import { formatHexWord } from '../util/format';

export interface SourceViewProps {
    sourceName: string,
    lines: Line[],
    currentLine?: number,
    breakpoints: number[],
    registersBar?: JSX.Element,
    headerToolbar?: JSX.Element,
}

export default class SourceView extends React.Component<SourceViewProps, any> {
    private scrollRegion: HTMLDivElement | null = null;
    private currentLine: HTMLLIElement | null = null;

    render(): JSX.Element {
        return (
            <div className="card source-viewport mb-2">
                <div className="card-header">
                    <div className="row justify-content-between">
                        <div className="col">
                            <strong>Code:</strong> {this.props.sourceName}
                        </div>
                        <div className="col-xs">
                            {this.props.headerToolbar}
                        </div>
                    </div>
                </div>
                <div className="card-block">
                    {this.props.registersBar}
                    <div ref={(elem) => this.scrollRegion = elem} className="scroll-region">
                        <ol>
                            {this.props.lines.map((line, index) => this.renderLine(line, index + 1))}
                        </ol>
                    </div>
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
            return (<pre className="address">{formatHexWord(address)}: </pre>);
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
        if (this.props.currentLine !== previousProps.currentLine && this.currentLine && this.scrollRegion) {
            this.scrollIntoView(this.scrollRegion, this.currentLine);
        }
    }

    private scrollIntoView(container: HTMLElement, element: HTMLElement) {
        let elemRect = element.getBoundingClientRect();
        let containerRect = container.getBoundingClientRect();
        if (elemRect.bottom >= containerRect.bottom) {
            element.scrollIntoView(false);
        }
        if (elemRect.top < 0) {
            element.scrollIntoView();
        }
    }
}