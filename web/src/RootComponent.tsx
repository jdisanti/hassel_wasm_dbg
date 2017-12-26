import * as React from 'react';
import { connect } from 'react-redux';
import { Store } from 'redux';
import { RootStore } from './store/store';
import SourceView from './components/SourceView';
import DebugToolbar from './components/DebugToolbar';
import RegistersView from './components/RegistersView';
import MemoryView from './components/MemoryView';
import RomSelect from './components/RomSelect';

export interface RootComponentProps {
    store?: Store<RootStore>,
}

class RootComponent extends React.Component<RootComponentProps, any> {
    render(): JSX.Element {
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
                        <div className="row">
                            <div className="col-7">
                                <RomSelect />
                                {sourceView}
                                <DebugToolbar isPaused={state.emulator.isPaused} />
                            </div>
                            <div className="col">
                                <RegistersView
                                    registerA={state.emulator.registers.registerA}
                                    registerS={state.emulator.registers.registerS}
                                    registerX={state.emulator.registers.registerX}
                                    registerY={state.emulator.registers.registerY}
                                    registerSp={state.emulator.registers.registerSp}
                                    registerPc={state.emulator.registers.registerPc} />
                                <MemoryView
                                    startAddress={state.emulator.memoryPages[0].startAddress}
                                    memory={state.emulator.memoryPages[0].bytes} />
                                <MemoryView
                                    startAddress={state.emulator.memoryPages[1].startAddress}
                                    memory={state.emulator.memoryPages[1].bytes} />
                            </div>
                        </div>
                    </div>
                );
            }
        }
        return (<p></p>);
    }
}

const mapStateToProps = (state: RootStore) => state;

const RootComponentConnected = connect(mapStateToProps, {
})(RootComponent);

export default RootComponentConnected;