const path = require('path');
const rules = require('./rules');
const plugins = require('./plugins');

const mode = process.env.NODE_ENV == 'production' ? 'production' : 'development';

module.exports = {
    mode,
    context: path.resolve('src'),
    entry: {
        main: ['./index.js']
    },
    output: {
        path: path.resolve('www'),
        filename: 'index.js'
    },
    watchOptions: {
        aggregateTimeout: 100
    },
    devtool: 'source-map',
    resolveLoader: {
        alias: {
            'sass-sourcemap-path-fixer-loader':
                path.resolve(__dirname, './sass-sourcemap-path-fixer-loader')
        }
    },
    module: { rules },
    plugins,
    devServer: {
        host: '0.0.0.0',
        port: 56666,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
        hot: true,
        historyApiFallback: true,
        contentBase: "www",
    }
}
