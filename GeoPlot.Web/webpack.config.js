const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    entry: {
        'app': [
            './obj/js/GeoPlot/GeoPlot.Web/Scripts/index.js'
        ]
    },
    mode: 'production',
    devtool: false,
    target: 'web',
    optimization: {
        minimize: true,
        usedExports: true,
        minimizer: [new TerserPlugin({
            extractComments: false,
        })]
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                enforce: "pre",
                use: ["source-map-loader"],
            },
            {
                test: /\.html/,
                use: [
                    path.resolve(__dirname, '../../Eusoft/WebApp/src/Eusoft.WebApp/Tools/template-loader.js')
                ]
            },
        ]
    },
    resolve: {
        alias: {
            'Templates': path.resolve(__dirname, '../../Eusoft/WebApp/src/Eusoft.WebApp/Templates')

        },
        extensions: [".js"]
    },
    externals: {
        "webapp-core": "webapp-core",
        "hammerjs": "Hammer",
        "desmos": "Desmos",
        "chart.js": "Chart"
    },
    plugins: [
        new webpack.SourceMapDevToolPlugin({
            filename: '[name].map',
            fallbackModuleFilenameTemplate: '[resource-path]',
            moduleFilenameTemplate: '../../[resource-path]'
        }),
    ],
    output: {
        filename: '[name].js',
        library: 'GeoPlot',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        path: path.resolve(__dirname, 'wwwroot/js'),
    }
};