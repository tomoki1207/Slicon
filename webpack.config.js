const CleanWebpackPlugin = require('clean-webpack-plugin')

const plugins = []
if (process.env.NODE_ENV === 'production') {
  plugins.push(new CleanWebpackPlugin())
}

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  target: 'web',
  node: false,
  entry: {
    background: './src/background.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.jsx$/,
        use: [
          {
            loader: 'babel-loader',
            options: { presets: ['@babel/env'] }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  },
  plugins,
  devtool: process.env.NODE_ENV === 'production' ? false : 'cheap-module-source-map'
}
