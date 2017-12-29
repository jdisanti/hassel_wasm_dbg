import * as React from 'react';
import { store } from '../store/store';

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
