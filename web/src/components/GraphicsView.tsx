import * as React from 'react';
import { store } from '../store/store';
import { Keyboard, KeyboardEventType, KeyboardHandlerPriority, KeyboardHandlerResult } from '../util/keyboard';

export interface GraphicsViewProps {
}

export default class GraphicsView extends React.Component<GraphicsViewProps, any> {
    private canvas: HTMLCanvasElement | null;
    private graphicsContext: CanvasRenderingContext2D | null;
    private lastCycles: number = 0;

    componentDidMount() {
        this.graphicsContext = (this.canvas as HTMLCanvasElement).getContext("2d");
        store.subscribe(() => {
            let state = store.getState();
            if (state.emulator.instance) {
                if (state.emulator.cycles !== this.lastCycles) {
                    let imageData: ImageData = state.emulator.instance.getGraphicsData();
                    (this.graphicsContext as CanvasRenderingContext2D).putImageData(imageData, 0, 0);
                    this.lastCycles = state.emulator.cycles;
                }
            }
        });

        Keyboard.addKeyHandler(KeyboardHandlerPriority.GraphicsView, (type: KeyboardEventType, event: KeyboardEvent) => {
            if (document.querySelector('.graphics-view:hover') === null) {
                return KeyboardHandlerResult.Unhandled;
            }
            let state = store.getState();
            if (state.emulator.instance) {
                if (type === KeyboardEventType.Down) {
                    state.emulator.instance.keyDown(event.key);
                } else {
                    state.emulator.instance.keyUp(event.key);
                }
            }
            return KeyboardHandlerResult.Handled;
        });
    }

    render(): JSX.Element {
        return (
            <div className="graphics-view">
                <canvas ref={(canvas) => this.canvas = canvas}
                        width="640"
                        height="480" />
            </div>
        )
    }
}
