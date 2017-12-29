import * as React from 'react';
import {
    ACTION_PLAY,
    ACTION_PAUSE,
    ACTION_STOP,
    ACTION_STEP,
} from "../store/actions";
import { store } from '../store/store';
import { Keyboard, KeyboardEventType, KeyboardHandlerPriority, KeyboardHandlerResult } from '../util/keyboard';

export interface DebugToolbarProps {
    isPaused: boolean,
}

export default class DebugToolbar extends React.Component<DebugToolbarProps, any> {
    render(): JSX.Element {
        return (
            <div className="debug-toolbar btn-toolbar">
                <div className="btn-group mr-2" role="group">
                    <button type="button"
                            className="btn btn-secondary"
                            onClick={this.playPauseClick.bind(this)}>
                        <div className={this.props.isPaused ? 'play' : 'pause'}></div>
                    </button>
                    <button type="button"
                            className="btn btn-secondary"
                            onClick={this.stopClick.bind(this)}>
                        <div className="stop"></div>
                    </button>
                </div>
                <div className="btn-group mr-2" role="group">
                    <button type="button"
                            className="btn btn-secondary"
                            onClick={this.stepClick.bind(this)}>
                        <div className="step"></div>
                    </button>
                </div>
            </div>
        );
    }

    componentDidMount() {
        Keyboard.addKeyHandler(KeyboardHandlerPriority.GlobalHotkey, (type: KeyboardEventType, event: KeyboardEvent) => {
            switch (event.code) {
                case "F10":
                    if (type == KeyboardEventType.Up) {
                        this.playPauseClick();
                    }
                    return KeyboardHandlerResult.Handled;
                case "F11":
                    if (type == KeyboardEventType.Up) {
                        this.stopClick();
                    }
                    return KeyboardHandlerResult.Handled;
                case "F12":
                    if (type == KeyboardEventType.Up) {
                        this.stepClick();
                    }
                    return KeyboardHandlerResult.Handled;
                default:
                    return KeyboardHandlerResult.Unhandled;
            }
        });
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
