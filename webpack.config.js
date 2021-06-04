var path = require('path')
var webpack = require('webpack')

var HtmlWebpackPlugin = require('html-webpack-plugin')
var HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin')
var htmlReplaceConfig = require('./src/conf/html-replace')

module.exports = {
  mode: 'production',
  entry: {
    none: path.resolve(__dirname, 'src/conf/webpack-entry.js')
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Readme',
      filename: 'index.html',
      template: 'src/index.html',
      inject: false,
      minify: false,
      chunks: 'all',
      chunksSortMode: 'auto'
    }),
    new HtmlReplaceWebpackPlugin(htmlReplaceConfig)
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'test')],
        exclude: [path.resolve(__dirname, 'node_modules')],
        options: {}
      }
    ]
  }
}