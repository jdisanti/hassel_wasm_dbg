//
// Copyright 2017 hassel_wasm_dbg Developers
//
// Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
// http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
// http://opensource.org/licenses/MIT>, at your option. This file may not be
// copied, modified, or distributed except according to those terms.
//

var baseConfig = require('./base.config');
var hotConfig = require('./hot.config');
var rules = require('./rules');

module.exports = {
    entry: baseConfig.entry,
    output: baseConfig.output,
    resolve: baseConfig.resolve,
    module: {
        rules: [
            rules.staticContent,
            rules.awesomeTypeScriptLoader,
            rules.sourceMapLoader,

            // SASS
            {
                test: /\.scss$/,
                use: [{
                    loader: "style-loader" // creates style nodes from JS strings
                }, {
                    loader: "css-loader" // translates CSS into CommonJS
                }, {
                    loader: "sass-loader" // compiles Sass to CSS
                }]
            }
        ],
    },
    devtool: hotConfig.devtool,
    devServer: Object.assign({}, hotConfig.devServer, {
        hot: false
    })
};
