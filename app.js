'use strict'

const express = require('express');
const Bot = require('./bot');
const config = require('./config/index');

var app = express();

// DuerOS会定期发送探活请求到你的服务，确保你的服务正常运转
app.head('/', (req, res) => {
    res.sendStatus(204);
});

// 监听post请求，DuerOS以http POST的方式来请求你的服务
app.post('/', (req, res) => {
    req.rawBody = '';
    console.log(new Date().toLocaleString());
    req.setEncoding('utf-8');
    req.on('data', function(chunk) { 
        req.rawBody += chunk;
    });

    req.on('end', function() {
        var b = new Bot(JSON.parse(req.rawBody));
        b.then(function(data){
            res.send(data);
        });

        // 开启签名认证
        // 为了避免你的服务被非法请求，建议你验证请求是否来自于DuerOS
        // b.initCertificate(req.headers, req.rawBody).enableVerifyRequestSign();
    });

}).listen(config.app_config.port);

console.log('DuerOS Services Listen On ' + config.app_config.port);

