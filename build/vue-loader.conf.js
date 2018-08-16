var utils = require('./utils')
var config = require('../config')
var isBuild = process.env.isBuild

module.exports = {
  loaders: utils.cssLoaders({
    sourceMap: isBuild
      ? config[process.env.NODE_ENV_SHORT].productionSourceMap
      : config[process.env.NODE_ENV_SHORT].cssSourceMap,
    extract: isBuild
  })
}
