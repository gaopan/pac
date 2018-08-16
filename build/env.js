var argv = require('yargs').argv;

var env = argv.env || 'dev';

var map = {
  'production': 'prod',
  'testing': 'test',
  'development': 'dev',
}

process.env.NODE_ENV = env;
process.env.NODE_ENV_SHORT = map[env];

module.exports = {
	env: env,
	env_short: map[env],
	isDev: process.env.isDev = ['test', 'dev'].indexOf(env) > -1,
	isBuild: process.env.isBuild = ['prod'].indexOf(env) > -1
}