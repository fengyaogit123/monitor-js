const path = require('path');
const webpack = require("webpack");
const Uglify = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
    entry: {
        '/lib/monitor': './src/index.js',
        '/lib/vuePlugin': './src/vuePlugin.js'
    },
    output: {
        filename: "[name].js",
        libraryTarget: 'umd'
    },
    externals: {
        vue: "Vue"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: [{ loader: "babel-loader" }],
            }
        ]
    },
    devServer: {
        historyApiFallback: true,
        hot: true,
        progress: true,
        inline: true
    },
    plugins: [
        new Uglify(),
        new HtmlWebpackPlugin({
            inject: 'head',
            hash: true,
            template: path.join(__dirname, 'index.html'),
            filename: 'index.html',
        })
    ]
};