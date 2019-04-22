const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  target: 'web',
  entry: {
    options: './src/options.js',
    content_script: './src/content_script.js',
    background: './src/background.js'
  },
  output: {
    path: path.resolve(__dirname, '.build')
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
  plugins: [new CopyWebpackPlugin([{ from: 'src/static', to: '.' }])],
  devtool:
    process.env.NODE_ENV === 'production' ? false : 'cheap-module-source-map'
}
