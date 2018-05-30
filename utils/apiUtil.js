'use strict'

const request = require('request');
const crypto = require('crypto');

const yaokan_config = {
    "url": "https://api.yaokongyun.cn/cloudlink/m.php",
    "app_id": "15004523417334"
}

/**
 * 发送遥控任务
 */
exports.addRemoteTask = function(commandinfo) {
    console.log(commandinfo)
    return new Promise(function(resolve, reject){
        let client = getSignature(commandinfo);
        let options = {
            url: yaokan_config.url,
            method: 'POST',
            timeout: 5000,
            gzip: true,
            headers: {
                'User-Agent': 'android 1.1',
                'client': client
            },
            form: {
                c: 's1',
                app_id: yaokan_config.app_id,
                f: commandinfo.f,
                zip: commandinfo.zip,
                ir_device_type: commandinfo.ir_device_type,
                rc_command_type: commandinfo.rc_command_type,
                rc_command: commandinfo.rc_command
            }
        };
        request(options, function (err, res, body) {
            if (!err && res.statusCode == 200){
                resolve(JSON.parse(body));
            } else {
                reject(err);
            }
        });
    });
};

/**
 * 签名计算
 */
function getSignature(data){
    let returnValue = "";
    let curr_code = "";
    let time = parseInt(Date.now() / 1000);
    delete data['c'];
    delete data['app_id'];
    data['time'] = time;
    for(let k in data){
        returnValue += data[k];
    }
    let md5sum = crypto.createHash('md5');
    md5sum.update(returnValue);
    let md5str = md5sum.digest('hex');
    for(let i = 0; i < 5; i++){
		let _pow = 2 << i;
		curr_code += md5str[_pow - 1]; //取字符串下标1,3,7,15,31的字符，拼起来
	}	
    returnValue = `${time}_${curr_code}`;

    return returnValue;
}

/*
 * WebHook通知 倍恰
 */
exports.NotifyDingDing = (content) => {
    return new Promise(function(resolve, reject){
        let options = {
            url:  "https://hook.bearychat.com/=bwA9F/incoming/f717b4d701c674028fc6f97b165ac0f0",
            method: 'POST',
            timeout: 5000,
            json: true,
            body: {
                "text": content
            }
        };
        request(options, function (err, res, body) {
            if (!err && res.statusCode == 200){
                resolve(body);
            } else {
                reject(err);
            }
        });
    });
}

