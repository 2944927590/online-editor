const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const isProduction = process.env.NODE_ENV == 'production';
const config = require('./public/config')[isProduction ? 'build' : 'dev'];

// [ 'index-entry.js', 'preview-entry.js' ]
function entryFileList(dirPath = 'src/') {
  const fileList = fs.readdirSync(path.resolve(__dirname, dirPath));
  return fileList.filter(file => {
    return /entry.(js|ts)/.test(file);
  });
}
 
function buildEntry(dirPath = 'src/') {
  const fileList = entryFileList(dirPath);
  const entry = fileList.reduce((res, next) => {
    const entryName = next.split('.')[0].replace('-entry', '');
    res[entryName] = path.resolve(__dirname, dirPath + next);
    return res;
  }, {});
  return entry;
}

function buildHtml() {
  const fileList = entryFileList();
  return fileList.map(file => {
    const entryName = file.split('.')[0].replace('-entry', '');
    return new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/'+ entryName +'.html'), // 指定模板文件，不指定会生成默认的 index.html 文件
      filename: entryName + '.html', // 打包后的文件名
      chunks: [entryName],
      minify: {
        removeAttributeQuotes: false, // 是否删除属性的双引号
        collapseWhitespace: isProduction, // 是否折叠空白
      },
      config: config.template
    }) 
  });
}

module.exports = {
  entry: buildEntry(),
  output: {
    path: path.resolve(__dirname, 'dist'), // 输出目录
    filename: isProduction ? '[name].[chunkhash:6].js' : '[name].[hash:6].js', // 输出文件名
    chunkFilename: isProduction ? '[name].[chunkhash:8].js' : '[name].[hash:8]-chunk.js'
  },
  resolve: {
    modules: ['./src/components', 'node_modules'], // 从左到右依次查找
    alias: {
      '@src': path.resolve(__dirname, 'src'), // 为src目录添加别名
      'vue$': 'vue/dist/vue.esm.js' // compiler model
    },
    extensions: ['.ts', '.tsx', '.js', '.json'], // 从左往右
    mainFields: ['browser', 'main']
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: ['babel-loader']
      },
      { 
        test: /\.tsx?$/,
        use: ['ts-loader']
      },
      {
        test: /\.(c|le)ss$/,
        oneOf: [
          // `<style>` in Vue components
          {
            resourceQuery: /^\?vue/,
            loader: [
              { loader: 'style-loader' },
              { loader: 'css-loader' },
              { loader: 'postcss-loader' },
              { loader: 'less-loader' }
            ]
          },
          {
            loader: [
              !isProduction ? { loader: 'style-loader' } : MiniCssExtractPlugin.loader,
              { loader: 'css-loader' },
              { loader: 'postcss-loader' },
              { loader: 'less-loader' }
            ]
          }
        ]
      },
      {
        test: /\.s(c|a)ss$/,
        oneOf: [
          // `<style>` in Vue components
          {
            resourceQuery: /^\?vue/,
            loader: [
              { loader: 'style-loader' },
              { loader: 'css-loader' },
              { loader: 'postcss-loader' },
              { loader: 'sass-loader' }
            ]
          },
          {
            loader: [
              !isProduction ? { loader: 'style-loader' } : MiniCssExtractPlugin.loader,
              { loader: 'css-loader' },
              { loader: 'postcss-loader' },
              { loader: 'sass-loader' }
            ]
          }
        ]
      },
      {
        test: /\.vue$/,
        use: ['vue-loader']
      },
      {
        test: /\.(jpe?g|png|gif|webp|svg|eot|ttf|woff|woff2)$/i,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 10240, // 10K 资源大小小于 10K 时，将资源转换为 base64，超过 10K，将图片拷贝到 dist 目录
            name: '[name]_[hash:6].[ext]', // 设置文件名，默认情况下，生成的文件的文件名就是文件内容的 MD5 哈希值并会保留所引用资源的原始扩展名
            outputPath: 'assets', // 输出目录
            esModule: false // 表示是否使用es6模块的导出，默认是启用的
          }
        }]
      }
    ]
  },
  optimization: {
    splitChunks: { //分割代码块
      cacheGroups: {
        vendor: {
          // 第三方依赖
          priority: 1, //设置优先级，首先抽离第三方模块
          name: 'vendor',
          test: /node_modules/,
          chunks: 'initial',
          minSize: 100, //大小超过100个字节
          minChunks: 1 //最少引入了1次
        },
        // 缓存组
        common: {
          //公共模块
          chunks: 'initial',
          name: 'common',
          minSize: 100, //大小超过100个字节
          minChunks: 1 //最少引入了1次
        }
      }
    }
  },
  plugins: [
    ...buildHtml(),
    new VueLoaderPlugin(),
    // 打包前自动清除dist目录
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:6].css',
      chunkFilename: 'css/[name].[hash:8].css'
    }),
    new OptimizeCssPlugin(),
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, 'images'),
      to: path.resolve(__dirname, 'dist/images')
    }]),
    new MonacoWebpackPlugin({
      languages: ['html'],
      features: ['coreCommands', 'find']
    })
  ]
}
