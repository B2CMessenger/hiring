const path = require('path');
const rules = require('../webpack/rules');
const WebpackTapeRun = require('webpack-tape-run');

const mode = process.env.NODE_ENV == 'production' ? 'production' : 'development';

module.exports = {
    mode,
    context: path.resolve(__dirname, '.'),
    entry: {
        main: path.resolve(__dirname, './tests/index.js')
    },
    output: {
        path: path.resolve(__dirname, '.'),
        filename: 'tests.js'
    },
    devtool: 'source-map',
    module: { rules },
    plugins:[
        new WebpackTapeRun({
            tapeRun: {},
            reporter: 'tap-spec'
        })
    ],
    node: {
        fs: 'empty'
    },
    stats: "errors-only",
    watch: mode == "development"
}
