'use strict'

const BaseBot = require('./bot-sdk/lib/Bot');
const asyncClient = require('./utils/poly_mqtt');
const tokenModels = require('./models/tokens');
const statesModels = require('./models/states');
const usersModels = require('./models/users');
const discoverSkill = require('./skills/skill_discovery');
const turnOnSkill = require('./skills/skill_turnon');
const turnOffSkill = require('./skills/skill_turnoff');
const getStatusSkill = require('./skills/skill_getrunstatus');
const getPM25Skill = require('./skills/skill_pm25');
const getCO2Skill = require('./skills/skill_co2');
const getHumiditySkill = require('./skills/skill_gethumidity');

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
            asyncClient.publish('/v1/polyhome-ha/host/233690e739a64e58a1b9ce38b27e1f52/user_id/99/services/', JSON.stringify(content));
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
            asyncClient.publish('/v1/polyhome-ha/host/233690e739a64e58a1b9ce38b27e1f52/user_id/99/services/', JSON.stringify(content));
            let card = new Bot.Card.TextCard('正在关灯');
            return new Promise(function(resolve, reject){
                resolve({
                    card: card,
                    outputSpeech : '已为您关灯'
                });
            });
        })

        /**
         * ===============这里开始处理智能家居的DCS协议细节================
         */
        if (!postData.header) return;
        console.log("payLoadVersion: " + postData.header.payloadVersion);
        console.log("token: "          + postData.payload.accessToken);

        // 处理协议类型
        switch (postData.header.name) {
            case "DiscoverAppliancesRequest":
            return discoverSkill.RequestHandler(postData, asyncClient);
            break;
            case "TurnOnRequest":
            return turnOnSkill.RequestHandler(postData, asyncClient);
            break;
            case "TurnOffRequest":
            return turnOffSkill.RequestHandler(postData, asyncClient);
            break;
            case "GetAirPM25Request":
            return getPM25Skill.RequestHandler(postData, asyncClient);
            break;
            case "GetHumidityRequest":
            return getHumiditySkill.RequestHandler(postData, asyncClient);
            break;
            default:
            console.log(postData.header.name);
        }
    }
<<<<<<< HEAD
=======

    builtData(msg_id, data) {
        let data_header = {
    　　    "namespace": "DuerOS.ConnectedHome.Discovery",
    　　    "name": "DiscoverAppliancesResponse",
    　　    "messageId": msg_id,
    　　    "payloadVersion": "1"  　　
        }
        let discovered_appliances = []
        //对设备的处理
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
        //对场景的处理
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
        //包装成百度那里要求的格式的内容
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
>>>>>>> 5e7ffa5bef964d4373c5790e9b6a302d32f7b182
}

module.exports = Bot;