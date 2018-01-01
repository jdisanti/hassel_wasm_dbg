//
// Copyright 2017 hassel_wasm_dbg Developers
//
// Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
// http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
// http://opensource.org/licenses/MIT>, at your option. This file may not be
// copied, modified, or distributed except according to those terms.
//

// This is file for module.rules of webpack config.
module.exports = {
    staticContent: {
        test: /\.(wasm|gif|png|rom|map)$/,
        loaders: ['file-loader']
    },

    // base loader
    awesomeTypeScriptLoader: {
        test: /\.tsx?$/,
        use: ['awesome-typescript-loader'],
        exclude: /node_modules/
    },

    // base loader
    sourceMapLoader: {
        // source-map-loader will extract from any JavaScript file,
        // including those in the node_modules directory.
        // Be mindful in setting include and exclude rule conditions
        // to maximize bundling performance.
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader'
    },

    // for hot-reload
    reactHotLoader: {
        // https://git.io/vHMJO (Glavin001/react-hot-ts)
        test: /\.tsx$/,
        use: [
            'react-hot-loader/webpack',
            'wasmLoader',
            'awesome-typescript-loader'
        ],
        exclude: /node_modules/
    },

    // for karma tests
    istanbulInstrumenterLoader: {
        // Based on https://git.io/vHNuc (marcules/karma-remap-istanbul),
        // but with a fashion loader.
        test: /src(\/|\\).+\.tsx$/,
        // exclude *.spec.tsx files ↓ from reports for coverage
        exclude: /(node_modules|\.spec\.tsx$)/,
        loader: 'istanbul-instrumenter-loader',
        enforce: 'post',
        options: {
            esModules: true
        }
    }
};
