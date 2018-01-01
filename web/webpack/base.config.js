//
// Copyright 2017 hassel_wasm_dbg Developers
//
// Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
// http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
// http://opensource.org/licenses/MIT>, at your option. This file may not be
// copied, modified, or distributed except according to those terms.
//

var project = require('../project.config');
var path = require('path');

module.exports = {
    entry: {
        index: './src/'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(project.root, 'dist')
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.json']
    },
};
