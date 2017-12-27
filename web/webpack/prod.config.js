var baseConfig = require('./base.config');
var rules = require('./rules');

const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

const extractSass = new ExtractTextPlugin({
    filename: "[name].[contenthash].css",
    disable: process.env.NODE_ENV === "development"
});

module.exports = {
};

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

