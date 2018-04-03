'use strict'

var BaseBot = require('./bot-sdk/lib/Bot');
// var mqttClient = require('./poly_mqtt');
var tokenModels = require('./models/tokens');
var statesModels = require('./models/states');

class Bot extends BaseBot {

    constructor (postData) {
        super(postData);
        // console.log(postData)

        this.addLaunchHandler(()=>{
            return {
                outputSpeech: '智能家居!'
            };
        });

        this.addIntentHandler('sence_trigger', ()=>{
            let sence = this.getSlot('room');
            console.log('执行某情景');
            if(!sence) {
                this.nlu.ask('room');
                let card = new Bot.Card.TextCard('您要执行的情景名称是什么?');
                // 如果有异步操作，可以返回一个promise
                return new Promise(function(resolve, reject){
                    resolve({
                        card : card,
                        outputSpeech : '您要执行的情景名称是什么呢?'
                    });
                });
            }
            var content = {'service': 'trigger_auto_by_name', 'plugin': 'gateway','data': {'name': sence}};
            tokenModels.generateGetTopicByAccessToken(postData.System.user.acessToken)
                .then(function(topic){
                    console.log(topic)
                });			
            mqttClient.publish('/v1/polyhome-ha/host/233690e739a64e58a1b9ce38b27e1f52/user_id/99/services/', JSON.stringify(content));
            let card = new Bot.Card.TextCard('正在为您执行该情景');
            return new Promise(function(resolve, reject){
                resolve({
                    card: card,
                    outputSpeech : '正在为您执行该情景'
                });
            });
        });

        this.addIntentHandler('device_ctl_light', ()=>{
            let sence = this.getSlot('position');
            console.log('开灯调试');
            if(!sence) {
                this.nlu.ask('position');
                let card = new Bot.Card.TextCard('您要打开哪里的灯呢?');
                // 如果有异步操作，可以返回一个promise
                return new Promise(function(resolve, reject){
                    resolve({
                        card : card,
                        outputSpeech : '您要打开哪里的灯呢?'
                    });
                });
            }
            var content = {'service': 'trigger_light_by_name', 'plugin': 'gateway','data': {'name': sence, 'action': 'turn_on'}};
            mqttClient.publish('/v1/polyhome-ha/host/233690e739a64e58a1b9ce38b27e1f52/user_id/99/services/', JSON.stringify(content));
            let card = new Bot.Card.TextCard('正在开灯');
            return new Promise(function(resolve, reject){
                    resolve({
                        card: card,
                        outputSpeech : '已为您打开灯'
                    });
            });
        });

        this.addIntentHandler('close_light', ()=>{
            let sence = this.getSlot('position');
            console.log('关灯调试');
            if(!sence) {
                this.nlu.ask('position');
                let card = new Bot.Card.TextCard('您要关闭哪里的灯呢?');
                // 如果有异步操作，可以返回一个promise
                return new Promise(function(resolve, reject){
                    resolve({
                        card : card,
                        outputSpeech : '您要关闭哪里的灯呢?'
                    });
                });
            }

            var content = {'service': 'trigger_light_by_name', 'plugin': 'gateway','data': {'name': sence, 'action': 'turn_off'}};
            mqttClient.publish('/v1/polyhome-ha/host/233690e739a64e58a1b9ce38b27e1f52/user_id/99/services/', JSON.stringify(content));
            let card = new Bot.Card.TextCard('正在关灯');
            return new Promise(function(resolve, reject){
                resolve({
                    card: card,
                    outputSpeech : '已为您关灯'
                });
            });
        })

        /**
         * 这里开始处理智能家居的DCS协议细节
         */
        if (!postData.header) return;
        console.log("payLoadVersion: " + postData.header.payloadVersion);
        console.log("token: "          + postData.payload.accessToken);
        // 这里接收mqtt回来的消息
        asyncClient.on('message', function (topic, message){
            // console.log(topic);
            // console.log(message.toString());
            var gateway_sn = topic.split('/')[4];
            var json_data = JSON.parse(message.toString());
            if (json_data.type == 'all_states'){
                var gw_states = {
                    "gw_sn": gateway_sn,
                    "states": json_data.data
                }
                statesModels.generateSaveStates(gw_states)
                    .then(function(data){
                        // console.log(data);
                    });
            }
        });
        // 处理协议类型
        if (postData.header.name == "DiscoverAppliancesRequest"){
            console.log("==发现设备==");
            var content = {'service': 'get_states', 'plugin': 'gateway','data': {}};
            asyncClient.subscribe("/v1/polyhome-ha/host/601e5c44a4064d0c9b8e4ef49145ee10/ack/")
                .then(function(topic){
                    console.log(topic);
                    return asyncClient.publish("/v1/polyhome-ha/host/601e5c44a4064d0c9b8e4ef49145ee10/user_id/99/services/", JSON.stringify(content))
                })
                .then(function(){
                    console.log("Publish Data");
                });
            // return builtData(message.toString());
            var _this = this
            return statesModels.generateGetStatesBySn("601e5c44a4064d0c9b8e4ef49145ee10")
                    .then(function(data){
                        console.log(data);
                        // return test_data;
                        return _this.builtData(postData.header.messageId, data)
                    });
        }
        if (postData.header.name == "TurnOnRequest"){
            console.log("控制打开");
            return new Promise(function(resolve, reject){
                resolve(test_data);
            });
        }
        if (postData.header.name == "TurnOffRequest"){
            console.log("控制关闭");
            return new Promise(function(resolve, reject){
                resolve(test_data);
            });
        }
    }

    builtData(msg_id, data) {
        let data_header = {
            "header": {
                　　    "namespace": "DuerOS.ConnectedHome.Discovery",
                　　    "name": "DiscoverAppliancesResponse",
                　　    "messageId": msg_id,
                　　    "payloadVersion": "1"
                　　},
        }
        let discovered_appliances = []
        data.states.forEach(state => {
            console.log(state)
        });
        let data_payload = {
            "discoveredAppliances": [],
            "discoveredGroups": []
        }
        return new Promise(function(resolve, reject){
            resolve({
                data_header,
                data_payload
            })
        });
    };

    builtSocketPayload(data) {
        
    }

    builtLightPayload(data) {

    }

}

let test_data = {
    　　"header": {
    　　    "namespace": "DuerOS.ConnectedHome.Discovery",
    　　    "name": "DiscoverAppliancesResponse",
    　　    "messageId": "64ddf1a9eb0144c6a05b2ae97248f2e7_0_Smarthome_5ac32fd04debe0.76117120",
    　　    "payloadVersion": "1"
    　　},
    　　"payload": {
    　　  　"discoveredAppliances": [
    　　  　  　{
    　　  　  　  　"actions": [
    　　  　  　  　  　"turnOn",
    　　  　  　  　  　"turnOff",
    　　  　  　  　  　"incrementBrightnessPercentage",
    　　  　  　  　  　"decrementBrightnessPercentage"
    　　  　  　  　],
    　　  　  　  　"applianceTypes": [
    　　  　  　  　  　"LIGHT"
    　　  　  　  　],
    　　  　  　  　"additionalApplianceDetails": {
    　　  　  　  　  　"extraDetail1": "optionalDetailForSkillAdapterToReferenceThisDevice",
    　　  　  　  　  　"extraDetail2": "There can be multiple entries",
    　　  　  　  　  　"extraDetail3": "but they should only be used for reference purposes.",
    　　  　  　  　  　"extraDetail4": "This is not a suitable place to maintain current device state"
    　　  　  　  　},
    　　  　  　  　"applianceId": "light.light3046",
    　　  　  　  　"friendlyDescription": "PolyHome智能零火灯",
    　　  　  　  　"friendlyName": "主卧的灯",
    　　  　  　  　"isReachable": true,
    　　  　  　  　"manufacturerName": "PolyHome",
    　　  　  　  　"modelName": "LnLight",
    　　  　  　  　"version": "your software version number here."
    　　  　  　},
    　　  　  　{
    　　  　  　  　"actions": [
    　　  　  　  　  　"turnOn",
    　　  　  　  　  　"turnOff"
    　　  　  　  　],
    　　  　  　  　"applianceTypes": [
    　　  　  　  　  　"CURTAIN"
    　　  　  　  　],
    　　  　  　  　"additionalApplianceDetails": {
    　　  　  　  　  　"extraDetail1": "optionalDetailForSkillAdapterToReferenceThisDevice",
    　　  　  　  　  　"extraDetail2": "There can be multiple entries",
    　　  　  　  　  　"extraDetail3": "but they should only be used for reference purposes.",
    　　  　  　  　  　"extraDetail4": "This is not a suitable place to maintain current device state"
    　　  　  　  　},
    　　  　  　  　"applianceId": "uniqueSwitchDeviceId",
    　　  　  　  　"friendlyDescription": "展现给用户的详细介绍",
    　　  　  　  　"friendlyName": "卧室的窗帘",
    　　  　  　  　"isReachable": true,
    　　  　  　  　"manufacturerName": "设备制造商的名称",
    　　  　  　  　"modelName": "fancyCurtain",
    　　  　  　  　"version": "your software version number here."
    　　  　  　},
    　　  　  　{
    　　  　  　  　"actions": [
    　　  　  　  　  　"turnOn",
    　　  　  　  　  　"turnOff"
    　　  　  　  　],
    　　  　  　  　"applianceTypes": [
    　　  　  　  　  　"SCENE_TRIGGER"
    　　  　  　  　],
    　　  　  　  　"additionalApplianceDetails": {
    　　  　  　  　  　"extraDetail1": "detail about the scene",
    　　  　  　  　  　"extraDetail2": "another detail about scene",
    　　  　  　  　  　"extraDetail3": "only be used for reference purposes."
    　　  　  　  　},
    　　  　  　  　"applianceId": "uniqueDeviceId",
    　　  　  　  　"friendlyDescription": "来自设备商的场景",
    　　  　  　  　"friendlyName": "回家模式",
    　　  　  　  　"isReachable": true,
    　　  　  　  　"manufacturerName": "yourManufacturerName",
    　　  　  　  　"modelName": "提供场景的设备型号",
    　　  　  　  　"version": "your software version number here."
    　　  　  　}
    　　  　],
    　　    "discoveredGroups": [
                {
                    "groupName": "客厅",
                    "applianceIds": [
                        "001",
                        "002",
                        "003"
                    ],
                    "groupNotes": "客厅照明分组控制",
                    "additionalGroupDetails": {
                        "extraDetail1": "detail about the group",
                        "extraDetail2": "another detail about group",
                        "extraDetail3": "only be used for reference group."
                     }
                },
                {
                    "groupName": "卧室",
                    "applianceIds": [
                        "004",
                        "005",
                        "006"
                    ],
                    "groupNotes": "卧室空调的分组控制",
                    "additionalGroupDetails": {
                        "extraDetail1": "detail about the group",
                        "extraDetail2": "another detail about group",
                        "extraDetail3": "only be used for reference group."
                    }
                }
             ]
    　　}
    };

// var mqtt = require('mqtt');
var AsyncClient = require("async-mqtt");

var asyncClient = AsyncClient.connect('mqtt://123.57.139.200', {
    username: 'polyhome',
    password: '123',
    clientId: 'dueros_polyhome_service_01'
});

asyncClient.on('connect', function () {
    console.log('mqtt success connect');
});

// var asyncClient = new AsyncClient(client);

// client.on('connect', function () {
//     console.log('mqtt success connect');
// });

// var client = mqtt.connect('mqtt://123.57.139.200', {
//     username: 'polyhome',
//     password: '123',
//     clientId: 'dueros_polyhome_service'
// });

// client.on('connect', function () {
//     console.log('mqtt success connect');
// });

// client.on('message', function (topic, message) {
//     // message is Buffer
//     console.log(message.toString());
// });

module.exports = Bot;
