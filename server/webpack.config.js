const path = require('path');
const WebpackTapeRun = require('webpack-tape-run');

const mode = process.env.NODE_ENV == 'production' ? 'production' : 'development';

module.exports = {
    mode,
    context: path.resolve(__dirname, '.'),
    entry: {
        main: path.resolve(__dirname, './src/index.js')
    },
    output: {
        path: path.resolve(__dirname, '.'),
        filename: 'tests.js'
    },
    devtool: 'source-map',
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules)/,
            use: [
                {
                    loader: 'babel-loader',
                    options: {
                        presets: [['@babel/preset-env']],
                        plugins: [
                            ['@babel/plugin-transform-runtime', {
                                regenerator: false,
                                useESModules: true
                            }]
                        ],
                    }
                }
            ]
        }]
    },
    plugins: [],
    node: {
        fs: 'empty'
    },
    watch: mode == "development"
}
