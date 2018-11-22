const autoprefixer = require('autoprefixer');
const jsRule = require('./jsRule');
const pugRule = require('./pugRule');
const mode = process.env.NODE_ENV == 'production' ? 'production' : 'development';

module.exports = [jsRule, pugRule,
    {
        test: /\.scss$/,
        use: [{
            loader: 'style-loader',
            options: { sourceMap: mode == 'development' }
        }, {
            loader: 'sass-sourcemap-path-fixer-loader',
            options: {
                sourceMap: mode == 'development',
            }
        }, {
            loader: 'css-loader',
            options: {
                sourceMap: mode == 'development'
            }
        }, {
            loader: 'postcss-loader',
            options: {
                plugins: [autoprefixer({ browsers: ['iOS >=10', 'ChromeAndroid >= 53'] })],
                sourceMap: mode == 'development'
            }
        }, {
            loader: 'sass-loader',
            options: {
                sourceMap: mode == 'development'
            }
        }],
    }
];