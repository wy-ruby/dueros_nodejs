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
      path : '/home/live/dueros-wangyun',
      'post-deploy' : 'cnpm install && pm2 startOrRestart ecosystem.config.js --watch',
      env  : {
        NODE_ENV: 'pro'
      }
    },
    dev : {
      user : 'live',
      host : '123.57.139.200',
      ref  : 'origin/master',
      repo : 'git@git.ourjujia.com:zhangxuesong/duer-node.git',
      path : '/home/live/dueros-wangyun',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --watch',
      env  : {
        NODE_ENV: 'dev'
      }
    }
  }
};
