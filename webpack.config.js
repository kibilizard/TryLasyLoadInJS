var path = require('path');
const autoprefixer = require('autoprefixer');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');
module.exports = {
    entry: {
        'polyfills': './src/polyfills.ts',
        'app': './src/main.ts'
    },
    output: {
        path: path.resolve(__dirname, './distrib'),
        publicPath: '/distrib',
        filename: "[name].js"
    },
    devServer: {
        historyApiFallback: true,
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'awesome-typescript-loader',
                        options: {
                            configFileName: path.resolve(__dirname, 'tsconfig.json')
                        }
                    }
                ]
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.css$/,
                include: path.resolve(__dirname, 'src/assets'),
                use:[
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options:{
                            plugins:[
                                autoprefixer({
                                    browsers:['last 2 versions']
                                })
                            ],
                            sourceMap: true
                        }
                    }
                ]
            },
            {
                test: /\.less$/,
                include: path.resolve(__dirname, 'src'),
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'file-loader?name=/[path][name].[hash].[ext]'
            }
        ]
    },
    plugins: [
        new UglifyJSPlugin()
    ]
}