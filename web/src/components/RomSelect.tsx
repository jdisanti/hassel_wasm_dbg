import * as React from 'react';
import { loadRom } from '../emulator';

export interface RomSelectProps {
}

interface RomSelectState {
    error: string;
}

export default class RomSelect extends React.Component<RomSelectProps, RomSelectState> {
    private uploadInput: HTMLInputElement | null = null;

    constructor(props: RomSelectProps) {
        super(props);
        this.state = {
            error: "",
        };
    }

    render(): JSX.Element {
        return (
            <div className="card mb-2">
                <p>
                    To change the loaded ROM, click the <em>Select .ROM and .MAP</em> button
                    below, and be sure to select both a <em>.rom</em> and a <em>.map</em> file.
                    Both are necessary for debugging.
                </p>
                <input type="button"
                       onClick={this.selectClicked.bind(this)}
                       value="Select .ROM and .MAP" />
                <div style={{"display":"none"}}>
                    <input type="file"
                           ref={(input) => this.uploadInput = input}
                           accept=".rom,.map"
                           id="rom-select"
                           name="rom-select"
                           multiple
                           onChange={this.onRomSelected.bind(this)} />
                </div>
                <p className="error">{this.state.error}</p>
            </div>
        );
    }

    selectClicked() {
        if (this.uploadInput) {
            this.uploadInput.click();
        }
    }

    onRomSelected(event) {
        this.setState({ error: "" });

        let files = event.target.files;
        if (files.length === 2) {
            let romFile: File | null = null, mapFile: File | null = null;
            for (let i = 0; i < files.length; i++) {
                let fileName = files[i].name.toLowerCase();
                if (fileName.endsWith('.rom')) {
                    romFile = files[i];
                } else if (fileName.endsWith('.map')) {
                    mapFile = files[i];
                }
            }
            if (romFile === null) {
                this.setState({ error: "Must select a .ROM file in addition to a .MAP file." });
            } else if (mapFile === null) {
                this.setState({ error: "Must select a .MAP file in addition to a .ROM file." });
            } else {
                Promise.all([
                    this.loadFile(romFile, true),
                    this.loadFile(mapFile, false)
                        .then(contents => JSON.parse(contents as string)),
                ]).then(values => loadRom(values[0] as ArrayBuffer, values[1]));
            }
        } else {
            this.setState({
                error: "Both a .ROM and .MAP file are required."
            });
        }
    }

    loadFile(file: File, binary: boolean): Promise<ArrayBuffer | string> {
        return new Promise<any>((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = (loadEvent) => {
                let fileContents = (loadEvent.target as any).result;
                resolve(fileContents);
            };
            if (binary) {
                reader.readAsArrayBuffer(file);
            } else {
                reader.readAsText(file);
            }
        });
    }
}