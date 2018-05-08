module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // First application
    {
      name      : 'poly_dueros',
      script    : 'app.js'
    },
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy : {
    pro : {
      user : 'live',
      host : '123.57.139.200',
      ref  : 'origin/master',
      repo : 'git@git.ourjujia.com:zhangxuesong/duer-node.git',
      path : '/home/live/poly_dueros',
      'post-deploy' : 'git pull && cnpm install --registry=https://registry.npm.taobao.org && pm2 startOrRestart ecosystem.config.js',
      env  : {
        NODE_ENV: 'pro'
      }
    },
    dev : {
      user : 'live',
      host : '60.205.151.71',
      ref  : 'origin/master',
      repo : 'git@git.ourjujia.com:zhangxuesong/duer-node.git',
      path : '/home/live/poly_dueros',
      'post-deploy' : 'git pull && npm install --registry=https://registry.npm.taobao.org && pm2 startOrRestart ecosystem.config.js',
      env  : {
        NODE_ENV: 'dev'
      }
    }
  }
};
