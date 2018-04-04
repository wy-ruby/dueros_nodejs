'use strict'

var BaseBot = require('./bot-sdk/lib/Bot');
// var mqttClient = require('./poly_mqtt');
var tokenModels = require('./models/tokens');
var statesModels = require('./models/states');
var usersModels = require('./models/users');

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
        // 处理协议类型
        if (postData.header.name == "DiscoverAppliancesRequest"){
            console.log("==发现设备==");
            let acc_token = postData.payload.accessToken;
            if (acc_token == null){ 
                acc_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhNGI3MGQ5Mi00YzBjLTRhNzQtOWJlMS0zODE3ODhhMjU5YTUiLCJzdWIiOjU0NywiZXhwIjoxNTIyNjY3NDE4LCJpYXQiOjE1MjI2NjM4MTh9.Y6lZtHbNj-SEBHikuxvJoskic_BxBDEszvVCr1h_yoFCBhSqLNFAE_Wjs5tdgirF7TW9kEoMT7WnTTt5DhrTjZYY7eJS_4OYjEmE55FpGaeELBmX2io0rT7ATtsV-UgUvgH22fkqMGkFpGEY_llYpX3PcoE8rtC9e81YPXFb-Tp_YwvmyYSj5HbXQ5rBHQKHCtZ5vIzP1HJXTNXx1sKVfa8U8E8e9Ui--Wa-5rt0fNsQL3Rzc6T0JcUJGUjbnVtGUrT5LaOLsC_rLnwS3JY-uBtMsVkvPcvBICXIOSy3fZP4V6-7_7Ex0_gMNXGg6cWTUfgTxs9IdKBoqymLDYY8cA";
            }
            let _this = this;
            tokenModels.generateGetTopicByAccessToken(acc_token)
                .then(function(data){
                    return usersModels.getUserById(data.user_id);
                })
                .then(function(data){
                    return data.family[0].device_id;
                })
                .then(function(gw_sn){
                    return asyncClient.subscribe("/v1/polyhome-ha/host/" + gw_sn + "/ack/")
                        .then(function(){
                            return gw_sn;
                        });
                })
                .then(function(gw_sn){
                    let content = {'service': 'get_states', 'plugin': 'gateway','data': {}};
                    asyncClient.publish("/v1/polyhome-ha/host/" + gw_sn + "/user_id/99/services/", JSON.stringify(content))
                        .then(function(){
                            let content = {'service': 'get_all_automation', 'plugin': 'gateway','data': {}};
                            return asyncClient.publish("/v1/polyhome-ha/host/" + gw_sn + "/user_id/99/services/", JSON.stringify(content))
                        });
                });

            return tokenModels.generateGetTopicByAccessToken(acc_token)
                .then(function(data){
                    return usersModels.getUserById(data.user_id);
                })
                .then(function(data){
                    return data.family[0].device_id;
                })
                .then(function(gateway_sn){
                    return statesModels.generateGetStatesBySn(gateway_sn);
                })
                .then(function(data){
                    return _this.builtData(postData.header.messageId, data);
                })
                .catch(function(err){
                    return {
                        "header":{
                            "namespace":"DuerOS.ConnectedHome.Control",
                            "name":"UnsupportedTargetSettingError",
                            "messageId":"917314cd-ca00-49ca-b75e-d6f65ac43503",
                            "payloadVersion":"1"
                        },
                        "payload":{
                        }
                    }
                });
        }
        if (postData.header.name == "TurnOnRequest"){
            console.log("控制打开");
            let acc_token = postData.payload.accessToken;
            let message_id = postData.payload.message_id;
            if (acc_token == null){
                acc_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhNGI3MGQ5Mi00YzBjLTRhNzQtOWJlMS0zODE3ODhhMjU5YTUiLCJzdWIiOjU0NywiZXhwIjoxNTIyNjY3NDE4LCJpYXQiOjE1MjI2NjM4MTh9.Y6lZtHbNj-SEBHikuxvJoskic_BxBDEszvVCr1h_yoFCBhSqLNFAE_Wjs5tdgirF7TW9kEoMT7WnTTt5DhrTjZYY7eJS_4OYjEmE55FpGaeELBmX2io0rT7ATtsV-UgUvgH22fkqMGkFpGEY_llYpX3PcoE8rtC9e81YPXFb-Tp_YwvmyYSj5HbXQ5rBHQKHCtZ5vIzP1HJXTNXx1sKVfa8U8E8e9Ui--Wa-5rt0fNsQL3Rzc6T0JcUJGUjbnVtGUrT5LaOLsC_rLnwS3JY-uBtMsVkvPcvBICXIOSy3fZP4V6-7_7Ex0_gMNXGg6cWTUfgTxs9IdKBoqymLDYY8cA";
            }
            return tokenModels.generateGetTopicByAccessToken(acc_token)
                .then(function(data){
                    return usersModels.getUserById(data.user_id);
                })
                .then(function(data){
                    return data.family[0].device_id;
                })
                .then(function(topic){
                    let entity_id = postData.payload.appliance.applianceId;
                    if (entity_id.split('.')[0] == 'automation'){
                        let content = {'service': 'trigger', 'plugin': entity_id.split('.')[0], 'data': {'entity_id': entity_id}};
                        return asyncClient.publish('/v1/polyhome-ha/host/' + topic + '/user_id/99/services/', JSON.stringify(content));
                    } else if (entity_id.split('.')[0] == 'light') {
                        let content = {'service': 'turn_on', 'plugin': entity_id.split('.')[0], 'data': {'entity_id': entity_id}};
                        return asyncClient.publish('/v1/polyhome-ha/host/' + topic + '/user_id/99/services/', JSON.stringify(content));
                    } else if (entity_id.split('.')[0] == 'cover') {
                        let content = {'service': 'open_cover', 'plugin': entity_id.split('.')[0], 'data': {'entity_id': entity_id}};
                        return asyncClient.publish('/v1/polyhome-ha/host/' + topic + '/user_id/99/services/', JSON.stringify(content));
                    }
                })
                .then(function(data){
                    return {
                        "header": {
                            "namespace": "DuerOS.ConnectedHome.Control",
                            "name": "TurnOnConfirmation",
                            "messageId": message_id,
                            "payloadVersion": "1"
                        },
                        "payload": {}
                    };
                })
                .catch(function(err){
                    return {
                        "header":{
                            "namespace":"DuerOS.ConnectedHome.Control",
                            "name":"UnsupportedTargetSettingError",
                            "messageId":"917314cd-ca00-49ca-b75e-d6f65ac43503",
                            "payloadVersion":"1"
                        },
                        "payload":{
                        }
                    }
                });
        }
        if (postData.header.name == "TurnOffRequest"){
            console.log("控制关闭");
            let acc_token = postData.payload.accessToken;
            let message_id = postData.payload.message_id;
            if (acc_token == null){
                acc_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhNGI3MGQ5Mi00YzBjLTRhNzQtOWJlMS0zODE3ODhhMjU5YTUiLCJzdWIiOjU0NywiZXhwIjoxNTIyNjY3NDE4LCJpYXQiOjE1MjI2NjM4MTh9.Y6lZtHbNj-SEBHikuxvJoskic_BxBDEszvVCr1h_yoFCBhSqLNFAE_Wjs5tdgirF7TW9kEoMT7WnTTt5DhrTjZYY7eJS_4OYjEmE55FpGaeELBmX2io0rT7ATtsV-UgUvgH22fkqMGkFpGEY_llYpX3PcoE8rtC9e81YPXFb-Tp_YwvmyYSj5HbXQ5rBHQKHCtZ5vIzP1HJXTNXx1sKVfa8U8E8e9Ui--Wa-5rt0fNsQL3Rzc6T0JcUJGUjbnVtGUrT5LaOLsC_rLnwS3JY-uBtMsVkvPcvBICXIOSy3fZP4V6-7_7Ex0_gMNXGg6cWTUfgTxs9IdKBoqymLDYY8cA";
            }
            return tokenModels.generateGetTopicByAccessToken(acc_token)
                .then(function(data){
                    return usersModels.getUserById(data.user_id);
                })
                .then(function(data){
                    return data.family[0].device_id;
                })
                .then(function(topic){
                    console.log(topic);
                    let entity_id = postData.payload.appliance.applianceId;
                    if (entity_id.split('.')[0] == 'light') {
                        let content = {'service': 'turn_off', 'plugin': entity_id.split('.')[0],'data': {'entity_id': entity_id}};
                        return asyncClient.publish('/v1/polyhome-ha/host/' + topic + '/user_id/99/services/', JSON.stringify(content));
                    } else if (entity_id.split('.')[0] == 'cover') {
                        let content = {'service': 'close_cover', 'plugin': entity_id.split('.')[0], 'data': {'entity_id': entity_id}};
                        return asyncClient.publish('/v1/polyhome-ha/host/' + topic + '/user_id/99/services/', JSON.stringify(content));
                    }
                })
                .then(function(data){
                    return {
                        "header": {
                            "namespace": "DuerOS.ConnectedHome.Control",
                            "name": "TurnOffConfirmation",
                            "messageId": message_id,
                            "payloadVersion": "1"
                        },
                        "payload": {}
                    };
                })
                .catch(function(err){
                    return {
                        "header":{
                            "namespace":"DuerOS.ConnectedHome.Control",
                            "name":"UnsupportedTargetSettingError",
                            "messageId":"917314cd-ca00-49ca-b75e-d6f65ac43503",
                            "payloadVersion":"1"
                        },
                        "payload":{
                        }
                    }
                });
        }
    }

    builtData(msg_id, data) {
        let data_header = {
    　　    "namespace": "DuerOS.ConnectedHome.Discovery",
    　　    "name": "DiscoverAppliancesResponse",
    　　    "messageId": msg_id,
    　　    "payloadVersion": "1"  　　
        }
        let discovered_appliances = []
        data.states.forEach(state => {
            if (state.entity_id.split('.')[0] == 'light'){
                let dev_state = {
                    "actions": ["turnOn", "turnOff"],
                    "applianceTypes": ["SWITCH"],
                    "additionalApplianceDetails": {},
                    "applianceId": state.entity_id,
                    "friendlyDescription": "PolyHome智能灯控开关",
                    "friendlyName": state.attributes.friendly_name,
                    "isReachable": true,
                    "manufacturerName": "PolyHome",
                    "modelName": state.attributes.platform,
                    "version": "0.1"
                };
                discovered_appliances.push(dev_state);
            } else if (state.entity_id.split('.')[0] == 'switch'){
                let dev_state = {
                    "actions": ["turnOn", "turnOff"],
                    "applianceTypes": ["SOCKET"],
                    "additionalApplianceDetails": {},
                    "applianceId": state.entity_id,
                    "friendlyDescription": "PolyHome智能灯控开关",
                    "friendlyName": state.attributes.friendly_name,
                    "isReachable": true,
                    "manufacturerName": "PolyHome",
                    "modelName": state.attributes.platform,
                    "version": "0.1"
                };
                discovered_appliances.push(dev_state);
            } else if (state.entity_id.split('.')[0] == 'cover'){
                let dev_state = {
                    "actions": ["turnOn", "turnOff"],
                    "applianceTypes": ["SOCKET"],
                    "additionalApplianceDetails": {},
                    "applianceId": state.entity_id,
                    "friendlyDescription": "PolyHome智能灯控开关",
                    "friendlyName": state.attributes.friendly_name,
                    "isReachable": true,
                    "manufacturerName": "PolyHome",
                    "modelName": state.attributes.platform,
                    "version": "0.1"
                };
                discovered_appliances.push(dev_state);
            }
        });
        data.automations.forEach(data => {
            let dev_state = {
                "actions": ["turnOn", "turnOff"],
                "applianceTypes": ["SCENE_TRIGGER"],
                "additionalApplianceDetails": {},
                "applianceId": data.entity_id,
                "friendlyDescription": "PolyHome智能情景",
                "friendlyName": data.attributes.friendly_name,
                "isReachable": true,
                "manufacturerName": "PolyHome",
                "modelName": data.attributes.id,
                "version": "0.1"
            };
            discovered_appliances.push(dev_state);
        })
        let data_payload = {
            "discoveredAppliances": discovered_appliances,
            "discoveredGroups": [{
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
            }]
        }
        return new Promise(function(resolve, reject){
            resolve({
                "header": data_header,
                "payload": data_payload
            })
        });
    };

    builtSocketPayload(data) {

    }

    builtLightPayload(data) {

    }

}

var AsyncClient = require("async-mqtt");

var asyncClient = AsyncClient.connect('mqtt://123.57.139.200', {
    username: 'polyhome',
    password: '123',
    clientId: 'dueros_polyhome_service_01'
});

asyncClient.on('connect', function () {
    console.log('mqtt success connect');
});

module.exports = Bot;


let test_data = {
    　　"header": {
    　　    "namespace": "DuerOS.ConnectedHome.Discovery",
    　　    "name": "DiscoverAppliancesResponse",
    　　    "messageId": "64ddf1a9eb0144c6a05b2ae97248f2e7_0_Smarthome_5ac32fd04debe0.76117120",
    　　    "payloadVersion": "1"
    　　},
    　　"payload": {
    　　  　"discoveredAppliances": [],
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
                }
             ]
    　　}
    };
