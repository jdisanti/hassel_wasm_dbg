import * as React from 'react';
import { connect } from 'react-redux';
import { Store } from 'redux';
import { RootStore } from './store/store';
import SourceView from './components/SourceView';
import DebugToolbar from './components/DebugToolbar';
import RegistersView from './components/RegistersView';

export interface RootComponentProps {
    store?: Store<RootStore>,
}

class RootComponent extends React.Component<RootComponentProps, any> {
    render() {
        let store = this.props.store;
        if (store) {
            let state = store.getState();
            if (state.emulator.isLoading) {
                return (<p>Loading...</p>);
            } else {
                let sourceView = state.src.isLoading ? (<div>Loading...</div>) : (
                    <SourceView lines={state.src.currentSrc.lines}
                        sourceName={state.src.currentSrc.name}
                        currentLine={state.src.currentSrc.currentLine}
                        breakpoints={state.src.breakpoints} />
                );
                return (
                    <div className="container-fluid">
                        <input type="file" id="rom-select" name="rom-select" onChange={this.onRomSelected} />
                        <div className="row">
                            <div className="col-7">
                                {sourceView}
                            </div>
                            <div className="col">
                                <RegistersView
                                    registerA={state.emulator.registers.registerA}
                                    registerS={state.emulator.registers.registerS}
                                    registerX={state.emulator.registers.registerX}
                                    registerY={state.emulator.registers.registerY}
                                    registerSp={state.emulator.registers.registerSp}
                                    registerPc={state.emulator.registers.registerPc} />
                            </div>
                        </div>
                        <div className="row">
                            <DebugToolbar isPaused={state.emulator.isPaused} />
                        </div>
                    </div>
                );
            }
        }
        return (<p></p>);
    }

    onRomSelected(event) {
        let files = event.target.files;
        if (files.length == 1) {
            let romFile = files[0];
            let reader = new FileReader();
            reader.onload = (loadEvent) => {
                let fileContents = (loadEvent.target as any).result;
                console.log("Rom size: ", fileContents.length);
            };
            reader.readAsBinaryString(romFile);
        }
    }
}

const mapStateToProps = (state: RootStore) => state;

const RootComponentConnected = connect(mapStateToProps, {
})(RootComponent);

export default RootComponentConnected;