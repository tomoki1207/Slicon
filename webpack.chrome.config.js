const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const commonConfig = require('./webpack.config')

const chromeConfig = Object.assign({}, commonConfig)

chromeConfig.output = {
  path: path.resolve(__dirname, 'build-chrome')
}
chromeConfig.plugins.push(
  new CopyWebpackPlugin([
    { from: 'src/static/*.css', to: '.', flatten: true },
    { from: 'src/static/images/icon-*.png', to: './icons', flatten: true },
    {
      from: 'src/static/manifest.json',
      to: '.',
      flatten: true,
      transform: (_, path) => JSON.stringify(Object.assign(require(path), require('./src/static/manifest-chrome.json')))
    }
  ])
)

module.exports = chromeConfig
