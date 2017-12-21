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
