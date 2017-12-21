import * as React from 'react';

export interface RegistersViewProps {
    registerA: number,
    registerS: number,
    registerX: number,
    registerY: number,
    registerPc: number,
}

export default class RegistersView extends React.Component<RegistersViewProps, any> {
    render(): JSX.Element {
        return (
            <table>
                <tbody>
                    <tr>
                        <td><pre>PC: </pre></td>
                        <td><pre>{this.word(this.props.registerPc)}</pre></td>
                        <td colSpan={2}></td>
                    </tr>
                    <tr>
                        <td><pre> A: </pre></td>
                        <td><pre>{this.byte(this.props.registerA)}</pre></td>
                        <td><pre> S: </pre></td>
                        <td><pre>{this.byte(this.props.registerS)}</pre></td>
                    </tr>
                    <tr>
                        <td><pre> X: </pre></td>
                        <td><pre>{this.byte(this.props.registerX)}</pre></td>
                        <td><pre> Y: </pre></td>
                        <td><pre>{this.byte(this.props.registerY)}</pre></td>
                    </tr>
                </tbody>
            </table>
        )
    }

    word(val): string {
        return "$" + (val + 0x10000).toString(16).substr(-4).toUpperCase();
    }

    byte(val): string {
        return "$" + (val + 0x100).toString(16).substr(-2).toUpperCase();
    }
}