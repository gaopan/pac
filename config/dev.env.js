var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  baseUrl: '"http://ec2-18-179-5-224.ap-northeast-1.compute.amazonaws.com:8080"'
  // baseUrl: '"http://15.107.19.73:8090"'
  // baseUrl: '"http://ec2-18-179-5-224.ap-northeast-1.compute.amazonaws.com:8080"'
})
