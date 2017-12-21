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
