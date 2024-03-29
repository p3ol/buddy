const path = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    index: './examples/index.js',
    child: './examples/child.js',
    alternate: './examples/alternate.js',
    alternateChild: './examples/alternate-child.js',
  },
  devtool: 'source-map',
  ...(process.env.NODE_ENV === 'tests' ? {
    mode: 'production',
    optimization: {
      minimize: false,
    },
  } : {
    mode: 'development',
  }),
  target: 'web',
  devServer: {
    port: process.env.TEST_PORT || 64000,
    host: 'localhost',
    historyApiFallback: true,
    ...(process.env.NODE_ENV === 'tests' ? {
      liveReload: false,
    } : {
      hot: true,
      open: true,
    }),
  },
  output: {
    path: path.join(__dirname, 'build'),
    chunkFilename: '[name].js',
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      debug: true,
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
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
    new HtmlWebpackPlugin({
      filename: 'alternate.html',
      template: './examples/alternate.html',
      chunks: ['alternate'],
      inject: true,
    }),
    new HtmlWebpackPlugin({
      filename: 'alternate-child.html',
      template: './examples/alternate-child.html',
      chunks: ['alternateChild'],
      inject: true,
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts'],
    alias: {
      '@poool/buddy': path.resolve('./src'),
    },
  },
  module: {
    rules: [{
      test: /\.(j|t)sx?$/,
      exclude: /node_modules/,
      use: [{
        loader: 'swc-loader',
      }],
    }],
  },
};
