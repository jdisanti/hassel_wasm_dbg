//
// Copyright 2017 hassel_wasm_dbg Developers
//
// Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
// http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
// http://opensource.org/licenses/MIT>, at your option. This file may not be
// copied, modified, or distributed except according to those terms.
//

import * as React from 'react';
import { connect } from 'react-redux';
import { Store } from 'redux';
import { RootStore } from './store/store';
import SourceView from './components/SourceView';
import DebugToolbar from './components/DebugToolbar';
import RegistersView from './components/RegistersView';
import MemoryView from './components/MemoryView';
import RomSelect from './components/RomSelect';
import GraphicsView from './components/GraphicsView';
import MoreInfo from './components/MoreInfo';

export interface RootComponentProps {
    store?: Store<RootStore>,
}

class RootComponent extends React.Component<RootComponentProps, any> {
    render(): JSX.Element {
        let store = this.props.store;
        if (store) {
            let heading = (
                <div>
                    <h1>Hasseldorf Computer Debugger Emulator</h1>
                    <p>
                        The Hasseldorf Computer is a hobbyist 8-bit MOS 6502 computer.
                        This program can emulate and debug its ROMs with source maps.{' '}
                        <MoreInfo />
                    </p>
                </div>
            );

            let state = store.getState();
            if (state.emulator.isLoading) {
                return (
                    <div>
                        {heading}
                        <p>Loading...</p>
                    </div>
                );
            } else {
                let debugToolbar = (<DebugToolbar isPaused={state.emulator.isPaused} />);
                let registersView = (
                    <RegistersView
                        registerA={state.emulator.registers.registerA}
                        registerS={state.emulator.registers.registerS}
                        registerX={state.emulator.registers.registerX}
                        registerY={state.emulator.registers.registerY}
                        registerSp={state.emulator.registers.registerSp}
                        registerPc={state.emulator.registers.registerPc}
                        cycles={state.emulator.cycles} />
                );
                let sourceView = state.src.isLoading ? (<div>Loading...</div>) : (
                    <SourceView lines={state.src.currentSrc.lines}
                        registersBar={registersView}
                        headerToolbar={debugToolbar}
                        sourceName={state.src.currentSrc.name}
                        currentLine={state.src.currentSrc.currentLine}
                        breakpoints={state.src.breakpoints} />
                );
                return (
                    <div className="hassel-wasm-dbg container-fluid">
                        <div className="row">
                            <div className="col col-7">
                                {heading}
                                <RomSelect />
                                {sourceView}
                            </div>
                            <div className="col">
                                <div className="row">
                                    <div className="col">
                                        <GraphicsView />
                                    </div>
                                    <div className="col">
                                <MemoryView
                                    index={0}
                                    startAddress={state.emulator.memoryPages[0].startAddress}
                                    memory={state.emulator.memoryPages[0].bytes} />
                                    </div>
                                    <div className="col">
                                <MemoryView
                                    index={1}
                                    startAddress={state.emulator.memoryPages[1].startAddress}
                                    memory={state.emulator.memoryPages[1].bytes} />
                                    </div>
                                </div>
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