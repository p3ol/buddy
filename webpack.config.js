const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    parent: './tests/index.js',
    child: './tests/child.js',
  },
  devtool: 'inline-source-map',
  mode: 'development',
  devServer: {
    contentBase: './tests',
    port: 64000,
    host: 'localhost',
    historyApiFallback: true,
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      debug: true,
    }),
    new HtmlWebpackPlugin({
      template: './tests/index.html',
      chunks: ['parent'],
      inject: true,
    }),
    new HtmlWebpackPlugin({
      filename: 'child.html',
      template: './tests/child.html',
      chunks: ['child'],
      inject: true,
    }),
  ],
  resolve: {
    extensions: ['.js'],
    alias: {
      '@poool/buddy': path.resolve('./src'),
    },
  },
  module: {
    rules: [{
      test: /\.js/,
      exclude: /node_modules/,
      use: [{
        loader: 'babel-loader',
      }],
    }],
  },
};
