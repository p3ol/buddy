const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    index: './examples/index.js',
    child: './examples/child.js',
  },
  devtool: 'inline-source-map',
  mode: 'development',
  devServer: {
    contentBase: './examples',
    port: 64000,
    host: 'localhost',
    historyApiFallback: true,
    open: true,
    hot: true,
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      debug: true,
    }),
    new HtmlWebpackPlugin({
      template: './examples/index.html',
      chunks: ['index'],
      inject: true,
    }),
    new HtmlWebpackPlugin({
      filename: 'child.html',
      template: './examples/child.html',
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
