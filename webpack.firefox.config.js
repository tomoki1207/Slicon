const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const commonConfig = require('./webpack.config')

const firefoxConfig = Object.assign({}, commonConfig)

firefoxConfig.output = {
  path: path.resolve(__dirname, 'build-firefox')
}
firefoxConfig.plugins.push(
  new CopyWebpackPlugin([
    { from: 'src/static/*.css', to: '.', flatten: true },
    { from: 'src/static/images/icon.svg', to: '.', flatten: true },
    {
      from: 'src/static/manifest.json',
      to: '.',
      flatten: true,
      transform: (_, path) =>
        JSON.stringify(Object.assign(require(path), require('./src/static/manifest-firefox.json')))
    }
  ])
)

module.exports = firefoxConfig
