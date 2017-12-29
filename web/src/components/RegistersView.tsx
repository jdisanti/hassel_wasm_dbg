import * as React from 'react';
import { formatHexWord, formatHexByte } from '../util/format';

export interface RegistersViewProps {
    registerA: number,
    registerS: number,
    registerX: number,
    registerY: number,
    registerPc: number,
    registerSp: number,
    cycles: number,
}

export default class RegistersView extends React.Component<RegistersViewProps, any> {
    render(): JSX.Element {
        return (
            <div className="registers-view">
                <pre className="label">PC: </pre>
                <pre>{formatHexWord(this.props.registerPc)}  </pre>
                <pre className="label">SP: </pre>
                <pre>{formatHexByte(this.props.registerSp)}  </pre>
                <pre className="label">S: </pre>
                <pre>{formatHexByte(this.props.registerS)}      </pre>
                <pre className="label">A: </pre>
                <pre>{formatHexByte(this.props.registerA)}  </pre>
                <pre className="label">X: </pre>
                <pre>{formatHexByte(this.props.registerX)}  </pre>
                <pre className="label">Y: </pre>
                <pre>{formatHexByte(this.props.registerY)}      </pre>
                <pre className="label">Cycles: </pre>
                <pre>{this.props.cycles}</pre>
            </div>
        )
    }
}