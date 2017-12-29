import * as React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

export interface MoreInfoProps {
}

interface MoreInfoState {
    show: boolean;
}

export default class MoreInfo extends React.Component<MoreInfoProps, any> {
    constructor(props: MoreInfoProps) {
        super(props);
        this.state = {
            show: false
        };
    }

    render(): JSX.Element[] {
        return [
            <a key="1" href="#" onClick={this.toggle.bind(this)}>More Info</a>,
            <Modal key="2" isOpen={this.state.show} toggle={this.toggle.bind(this)} size="lg">
                <ModalHeader toggle={this.toggle.bind(this)}>Hasseldorf Computer Debugger Emulator</ModalHeader>
                <ModalBody>
                    <h4>Debugger Usage Instructions</h4>

                    <p>To send keyboard input to the running program,
                    move your mouse over the graphics view and then use your
                    keyboard. While your mouse is over the graphics view, all keyboard
                    input will be sent to the emulator.</p>

                    <strong>Hotkeys</strong>
                    <ul>
                        <li><strong>Ctrl+O or Cmd+O:</strong> Load .ROM and .MAP</li>
                        <li><strong>F10</strong> Pause/Play</li>
                        <li><strong>F11</strong> Reset</li>
                        <li><strong>F12</strong> Step</li>
                    </ul>

                    <h4>Graphics Hardware Registers</h4>

                    <p>Address <code>0xDFFE</code> is the only register for the graphics hardware. Commands can be sent
                    to it by writing a command byte followed by the required parameter bytes. Commands
                    are summarized below:</p>

                    <ul>
                        <li><code>&lt;0x01&gt;:</code> Clear screen</li>
                        <li><code>&lt;0x02&gt; &lt;mode&gt;:</code> Set graphics mode. Currently, there is only mode 0, which
                            is an ASCII text-based mode that uses the VGA font with 71x30 characters.</li>
                        <li><code>&lt;0x03&gt; &lt;x&gt; &lt;y&gt;:</code> Sets the cursor position to the given coordinates.
                            If the given coordinates are off-screen, then the behavior is undefined.</li>
                        <li><code>&lt;0x04&gt; &lt;color&gt;:</code> Not yet designed or emulated.</li>
                        <li><code>&lt;0x05&gt; &lt;value&gt;:</code> Sets the ASCII character value at the current cursor position.
                            Passing in '\n' or '\r' modifies the cursor position rather than placing a character.</li>
                        <li><code>&lt;0x06&gt; &lt;hi&gt; &lt;lo&gt; &lt;len&gt;:</code> Uses DMA to copy the given
                            length of characters from RAM to the current cursor position. This is equivalent to writing <code>0x05</code>{' '}
                            over and over again, but much faster.</li>
                    </ul>

                    Example of writing a character:
                    <pre>{'LDA #$05\nSTA $DFFE ; Send the "set value" command\nLDA #$41 ; ASCII "A"\nSTA $DFFE ; Send the value to set'}</pre>
                    <p><strong>GitHub Repository:</strong> Coming soon...</p>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={this.toggle.bind(this)}>OK</Button>
                </ModalFooter>
            </Modal>
        ];
    }

    toggle() {
        this.setState({
            show: !this.state.show,
        });
    }
}