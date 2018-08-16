var path = require('path')
var utils = require('./utils')
var config = require('../config')
var webpack = require('webpack')
var vueLoaderConfig = require('./vue-loader.conf')
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var webpack = require('webpack');

function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  entry: {
    vendor: './src/vendor.js',
    app: './src/main.js'
  },
  output: {
    path: config[process.env.NODE_ENV_SHORT].assetsRoot,
    filename: '[name].js',
    publicPath: config[process.env.NODE_ENV_SHORT].assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src'),
    }
  },
  module: {
    rules: [{
    //   test: /\.(js|vue)$/,
    //   loader: 'eslint-loader',
    //   enforce: "pre",
    //   include: [resolve('src'), resolve('test')],
    //   options: {
    //     formatter: require('eslint-friendly-formatter')
    //   }
    // }, {
      test: /\.vue$/,
      loader: 'vue-loader',
      options: vueLoaderConfig
    }, {
      test: /\.js$/,
      loader: 'babel-loader',
      include: [resolve('src'), resolve('test'), resolve('node_modules/vue-awesome')]
    }, {
      test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      loader: 'url-loader',
      query: {
        limit: 10000,
        name: utils.assetsPath('img/[name].[hash:7].[ext]')
      }
    }, {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      loader: 'url-loader',
      query: {
        limit: 10000,
        name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
      }
    }],
    loaders: [
    ]
  },
  plugins:[
    new ExtractTextPlugin({
      filename: utils.assetsPath('css/[name].[contenthash].css'),
      allChunks: true
    }),
    new webpack.ProvidePlugin({
      $:'jquery',
      jQuery:'jquery',
      Promise: 'es6-promise-promise'
    })
  ]
}
