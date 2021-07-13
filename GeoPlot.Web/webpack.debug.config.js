const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        'app': [
            './obj/js/GeoPlot/GeoPlot.Web/Scripts/index.js'
        ]
    },
    mode: 'production',
    target: 'web',
    devtool: false,
    optimization: {
        minimize: false,
        usedExports: true
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
            'Templates': path.resolve(__dirname, '../../Eusoft/WebApp/src/Eusoft.WebApp/Templates'),
            'webapp-core': path.resolve(__dirname, '../../Eusoft/WebApp/src/Eusoft.WebApp/obj/js'),

        },
        extensions: [".js"]
    },
    externals: {
        "hammerjs": "Hammer",
        "desmos": "Desmos",
        "chart.js": "Chart"
    },
    plugins: [
        new webpack.SourceMapDevToolPlugin({
            filename: '[name].map',
            fallbackModuleFilenameTemplate: '[resource-path]',
            moduleFilenameTemplate: module => {
                console.log(module.resource);
                if (module.resource.substr(0, 10) == '../Eusoft/') {
                    return '../../../' + module.resource;
                }
                return '../../' + module.resource;
            }
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