const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.base');

module.exports = merge(baseConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: '9001', // 默认是8080
    compress: true, // 是否启用 gzip 压缩
    hot: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:7001/',
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  },
  output: {
    path: path.resolve(__dirname, 'dist'), // 输出目录
    filename: '[name].[hash:6].js', // 输出文件名
    chunkFilename: '[name].[hash:8].js'
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[hash:6].css',
      chunkFilename: 'css/[name].[hash:8].css'
    }),
    new webpack.HotModuleReplacementPlugin() // 热更新插件
  ]
});