const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = [
    new HtmlWebpackPlugin({
        title: "Тестовое задание",
        template: './index.html'
    })
];