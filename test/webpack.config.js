const path = require('path');
const jsRule = require('../webpack/jsRule');
const pugRule = require('../webpack/pugRule');
const autoprefixer = require('autoprefixer');
const WebpackTapeRun = require('webpack-tape-run');

const mode = process.env.NODE_ENV == 'production' ? 'production' : 'development';

module.exports = (env, argv) => ({
    mode,
    entry: {
        main: argv['acceptance'] ?
            path.resolve(__dirname, './tests/acceptance.js') :
            path.resolve(__dirname, './tests/index.js')
    },
    output: {
        path: path.resolve(__dirname, '.'),
        filename: 'tests.js'
    },
    devtool: 'source-map',
    module: {
        rules: [jsRule, pugRule, {
            test: /\.scss$/,
            use: [
                'style-loader',
                'css-loader',
                {
                    loader: 'postcss-loader',
                    options: {
                        plugins: [autoprefixer({ browsers: ['iOS >=10', 'ChromeAndroid >= 53'] })],
                        sourceMap: mode == 'development'
                    }
                },
                'sass-loader'
            ]
        }]
    },
    plugins: [
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
});
