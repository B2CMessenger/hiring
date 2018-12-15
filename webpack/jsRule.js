const mode = process.env.NODE_ENV == 'production' ? 'production' : 'development';

module.exports = {
    test: /\.js$/,
    exclude: /(node_modules)/,
    use: [
        {
            loader: 'babel-loader',
            options: {
                presets: [['@babel/preset-env', {
                    targets: {
                        chrome: 70,
                    },
                    modules: false,
                    debug: mode == 'development',
                }]],
                plugins: [
                    ['@babel/plugin-transform-runtime', {
                        regenerator: false,
                        useESModules: true
                    }],
                    ["@babel/plugin-proposal-decorators", { legacy: true }]
                ],
            }
        }
    ]
};