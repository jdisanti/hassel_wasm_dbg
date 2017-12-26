import * as React from 'react';
import { formatHexWord, formatHexByte } from '../util/format';

export interface RegistersViewProps {
    registerA: number,
    registerS: number,
    registerX: number,
    registerY: number,
    registerPc: number,
    registerSp: number,
}

export default class RegistersView extends React.Component<RegistersViewProps, any> {
    render(): JSX.Element {
        return (
            <div className="card registers-view mb-2">
                <div className="card-header">
                    <strong>Registers</strong>
                </div>
                <div className="card-block p-2">
                    <table>
                        <tbody>
                            <tr>
                                <td><pre className="label">  PC: </pre></td>
                                <td><pre>{formatHexWord(this.props.registerPc)}</pre></td>
                                <td><pre className="label">  SP: </pre></td>
                                <td><pre>{formatHexByte(this.props.registerSp)}</pre></td>
                            </tr>
                            <tr>
                                <td><pre className="label">   A: </pre></td>
                                <td><pre>{formatHexByte(this.props.registerA)}</pre></td>
                                <td><pre className="label">   S: </pre></td>
                                <td><pre>{formatHexByte(this.props.registerS)}</pre></td>
                            </tr>
                            <tr>
                                <td><pre className="label">   X: </pre></td>
                                <td><pre>{formatHexByte(this.props.registerX)}</pre></td>
                                <td><pre className="label">   Y: </pre></td>
                                <td><pre>{formatHexByte(this.props.registerY)}</pre></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}