import path from 'node:path';

import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import 'webpack-dev-server';

const config: webpack.Configuration = {
  entry: {
    index: './examples/index.ts',
    child: './examples/child.ts',
    alternate: './examples/alternate.ts',
    alternateChild: './examples/alternate-child.ts',
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
    new webpack.DefinePlugin({
      'process.env.WS_PORT': JSON.stringify(process.env.WS_PORT || 64001),
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

export default config;
