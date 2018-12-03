const path = require('path');
const webpack = require("webpack");
const Uglify = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')


const plugins = [];
if (process.env.NODE_ENV.trim() == "development") {
    plugins.push(new HtmlWebpackPlugin({
        inject: 'head',
        hash: true,
        template: path.join(__dirname, 'index.html'),
        filename: 'index.html',
    }))
} else {
    plugins.push(new Uglify())
}


module.exports = {
    entry: {
        'monitor': './src/index.js',
        'vuePlugin': './src/vuePlugin.js'
    },
    output: {
        filename: "./lib/[name].js",
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
    plugins: plugins
};