'use strict'

const dev_config = require('./dev/index');
const pro_config = require('./pro/index');

let env = process.env.NODE_ENV || 'dev';

let config = {};

if (env == 'pro'){
    config = pro_config;
}else {
    config = dev_config;
}

module.exports = config;
