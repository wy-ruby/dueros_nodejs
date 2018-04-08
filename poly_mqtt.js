'use strict'

/**
 * Polyhome Mqtt通信
 */
const AsyncClient = require("async-mqtt");
const statesModels = require('./models/states');

var asyncClient = AsyncClient.connect('mqtt://123.57.139.200', {
    username: 'polyhome',
    password: '123',
    clientId: 'dueros_polyhome_service_01'
});

asyncClient.on('connect', function () {
    console.log('mqtt success connect');
});

// 这里接收mqtt的消息
asyncClient.on('message', function (topic, message){
    // console.log(topic);
    // console.log(message.toString());
    var gateway_sn = topic.split('/')[4];
    var json_data = JSON.parse(message.toString());
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
});

module.exports = asyncClient;
