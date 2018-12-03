const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin') // 复制静态资源的插件
const CleanWebpackPlugin = require('clean-webpack-plugin') // 清空打包目录的插件
const HtmlWebpackPlugin = require('html-webpack-plugin') // 生成html的插件
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require('webpack')
const HappyPack = require('happypack')
const os = require('os') //获取电脑的处理器有几个核心，作为配置传入
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })
const htmlList = require('./src/viewsList.json')
const devMode = process.env.NODE_ENV !== 'prod'


let entry ={}
let htmlTemplate=[]
htmlList.forEach(pages => {
    let page = Object.entries(pages)
    // console.log(page)
    let name =page[0][1]
    let title=page[1][1]
    let chunks= page[2][1]
    entry[name]= `./src/views/${name}/index.js`
   htmlTemplate.push(// 动态遍历THML模板
    new HtmlWebpackPlugin({
        template: `src/views/${name}/index.html`,
        title:title,
        showErrors: true,
        filename: path.resolve(__dirname, `./dist/${name}.html`),
        chunks: chunks,
        // hash: true, //防止缓存
        minify: {
            removeAttributeQuotes: true //压缩 去掉引号
        }
    }),
   )

});


 const config = {
    entry:entry,
    output: {
        // publicPath: './',
        filename: './js/[name][hash].js',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.js', '.css', '.json', 'scss'],
        alias: {}
    },
    module: {
        rules: [{
                test: /\.(sa|sc|c)ss$/,
                use: [devMode ? 'style-loader' : MiniCssExtractPlugin.loader, 'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [
                                require("autoprefixer")("last 4 versions") /*在这里添加*/
                            ]
                        }
                    },
                    {
                        loader: 'sass-loader'
                    }
                ],
                include: path.join(__dirname, 'src'), //限制范围，提高打包速度
            }, {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            },
            {
                test: /\.(png|jpg|gif|svg)$/i,
                loaders: [
                    'url-loader?limit=6&name=assets/[name]-[hash:5].[ext]',
                    'image-webpack-loader'
                ],
                exclude: path.resolve(__dirname, '/node_modules'),
                include: path.resolve(__dirname, 'src')
            }
        ]
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        // publicPath: '',
        port: 1314,
        host: 'localhost',
        overlay: true,
        hot: true,
        compress: false // 服务器返回浏览器的时候是否启动gzip压缩

    },
    plugins:[
        new webpack.HotModuleReplacementPlugin(),
        new CleanWebpackPlugin([path.resolve(__dirname, 'dist')]),
        new MiniCssExtractPlugin({
            filename: "./css/[name].[chunkhash:8].css",
            chunkFilename: "[id].css"
        }),
        new CopyWebpackPlugin([{
            from: path.resolve(__dirname, 'static'),
            to: path.resolve(__dirname, 'dist/static'),
            ignore: ['.*']
        }]),
        new HappyPack({ //开启多线程打包
            id: 'happy-babel-js',
            loaders: ['babel-loader?cacheDirectory=true'],
            threadPool: happyThreadPool
        }),   
        // new HtmlWebpackPlugin({
        //     template: 'src/views/index/index.html',
        //     filename: 'index.html',
        //     chunks: ['index', 'vendor'],
        //     // hash: true, //防止缓存
        //     minify: {
        //         removeAttributeQuotes: true //压缩 去掉引号
        //     }
        // }),
    ].concat(htmlTemplate)
}

module.exports  = config
