import * as React from 'react';
import * as ReactDOM from 'react-dom';
import RootComponent from './RootComponent';
import { store } from './store/store';
import { initEmulator } from './emulator';

require('./index.scss');

initEmulator();

let AppContainer: ({ children }: { children?: any }) => JSX.Element | JSX.Element;
if (module.hot) {
    // When hot ednabled AppContainer from 'react-hot-loader'
    AppContainer = (require as any)('react-hot-loader').AppContainer;
} else {
    // When hot disabled AppContainer simple div
    AppContainer = ({ children }) => (
        <div>{children}</div>
    );
}

const rootEl = document.getElementById('root');
ReactDOM.render(
    <AppContainer>
        <RootComponent store={store} />
    </AppContainer>,
    rootEl
);

// Hot Module Replacement API
if (module.hot) {
    module.hot.accept('./RootComponent', () => {
        const NextRootComponent = (require as any)(
            './RootComponent'
        ).default;
        ReactDOM.render(
            <AppContainer>
                <NextRootComponent store={store} />
            </AppContainer>,
            rootEl
        );
    });
}
