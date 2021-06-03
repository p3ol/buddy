const path = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    index: './examples/index.js',
    child: './examples/child.js',
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
    contentBase: './examples',
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
      'fixed-sinon': require.resolve('sinon/pkg/sinon.js'),
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
