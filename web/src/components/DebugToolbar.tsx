import * as React from 'react';
import {
    ACTION_PLAY,
    ACTION_PAUSE,
    ACTION_STOP,
    ACTION_STEP,
} from "../store/actions";
import { store } from '../store/store';

export interface DebugToolbarProps {
    isPaused: boolean,
}

export default class DebugToolbar extends React.Component<DebugToolbarProps, any> {
    render(): JSX.Element {
        return (
            <div className="btn-toolbar">
                <div className="btn-group mr-2" role="group">
                    <button type="button" className="btn btn-secondary" onClick={this.playPauseClick.bind(this)}>
                        {this.props.isPaused ? "\u25BA" : "\u23F8"}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={this.stopClick.bind(this)}>
                        {"\u25A0"}
                    </button>
                </div>
                <div className="btn-group mr-2" role="group">
                    <button type="button" className="btn btn-secondary" onClick={this.stepClick.bind(this)}>
                        {"\u21e8"}
                    </button>
                </div>
            </div>
        );
    }

    playPauseClick() {
        store.dispatch({
            type: this.props.isPaused ? ACTION_PLAY : ACTION_PAUSE
        });
    }

    stopClick() {
        store.dispatch({ type: ACTION_STOP });
    }

    stepClick() {
        store.dispatch({ type: ACTION_STEP });
    }
}
