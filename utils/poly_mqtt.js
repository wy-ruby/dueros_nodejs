'use strict'

/**
 * Polyhome Mqtt通信
 */
const AsyncClient = require("async-mqtt");
const statesModels = require('../models/states');
const usersModels = require('../models/users');
const config = require('../config/index');

var asyncClient = AsyncClient.connect(config.mqtt_config.url, {
    username: config.mqtt_config.username,
    password: config.mqtt_config.password,
    clientId: config.mqtt_config.clinet_id
});

asyncClient.on('connect', function () {
    console.log('mqtt success connect');
});

// 这里接收mqtt的消息
asyncClient.on('message', function (topic, message){
    console.log("打印mqtt日志");
    console.log(topic);
    console.log(message.toString());
    var gateway_sn = topic.split('/')[4];
    var json_data = JSON.parse(message.toString());
    //根据topic判断是圆盘还是平板，topic的值是clien的话就是指的平板
    if(topic.split('/')[5] == "client"){
        //根据gateway_sn去查询对应的devic_id
        usersModels.findFamilyIdByUsers(gateway_sn).then(function(users){
            if (json_data.msg == 'GetDbDevListSuccess'){
                let gw_states = {
                    "gw_sn": users.family[0].device_id,
                    "states": json_data.data.list
                }
                statesModels.generateSaveStates(gw_states)
                    .then(function(data){
                        // console.log(data);
                    });
            }else if (json_data.msg == "GetSenceListSuccess"){
                let gw_automations = {
                    "gw_sn": users.family[0].device_id,
                    "automations": json_data.data.senceList
                }
                statesModels.generateSaveAutomations(gw_automations)
                    .then(function(data){
                        // console.log(data);
                    });
            }
        });
    }else if(topic.split('/')[5] == "ack"){
        if (json_data.type == 'all_states'){
            let gw_states = {
                "gw_sn": gateway_sn,
                "states": json_data.data
            }
            statesModels.generateSaveStates(gw_states)
                .then(function(data){
                    // console.log(data);
                });
        } else if (json_data.type == 'all_automations'){
            let gw_automations = {
                "gw_sn": gateway_sn,
                "automations": json_data.data
            }
            statesModels.generateSaveAutomations(gw_automations)
                .then(function(data){
                    // console.log(data);
                });
        }
    }else {
        throw new Error('error');
    }
});

module.exports = asyncClient;
