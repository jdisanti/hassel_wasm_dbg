//
// Copyright 2017 hassel_wasm_dbg Developers
//
// Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
// http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
// http://opensource.org/licenses/MIT>, at your option. This file may not be
// copied, modified, or distributed except according to those terms.
//

var baseConfig = require('./base.config');
var rules = require('./rules');

const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

const extractSass = new ExtractTextPlugin({
    filename: "[name].[contenthash].css",
    disable: process.env.NODE_ENV === "development"
});

module.exports = {
    entry: baseConfig.entry,
    output: {
        ...baseConfig.output,
        filename: '[name].[hash].bundle.js',
    },
    resolve: baseConfig.resolve,
    module: {
        rules: [
            rules.staticContent,
            rules.awesomeTypeScriptLoader,
            rules.sourceMapLoader,

            // SASS
            {
                test: /\.scss$/,
                use: extractSass.extract({
                    use: [{
                        loader: "css-loader"
                    }, {
                        loader: "sass-loader"
                    }],
                    // use style-loader in development
                    fallback: "style-loader"
                })
            }
        ],
    },
    plugins: [
        extractSass,
        new HtmlWebpackPlugin({
            template: "static/index.template.html",
        })
    ]
};
