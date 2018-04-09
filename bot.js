'use strict'

const BaseBot = require('./bot-sdk/lib/Bot');
const asyncClient = require('./utils/poly_mqtt');
const tokenModels = require('./models/tokens');
const statesModels = require('./models/states');
const usersModels = require('./models/users');
const discoverSkill = require('./skills/skill_discovery');
const turnOnSkill = require('./skills/skill_turnon');
const turnOffSkill = require('./skills/skill_turnoff');
const tvControllerSkill = require('./skills/skill_tvcontroller');
const airConditionerTemperatureSkill = require('./skills/skill_airconditionertemperature');
const airConditionerSpeedSkill = require('./skills/skill_airconditionerspeed');
const airConditionerModeSkill = require('./skills/skill_airconditionermode');
const getStatusSkill = require('./skills/skill_getrunstatus');
const getPM25Skill = require('./skills/skill_pm25');
const getCO2Skill = require('./skills/skill_co2');
const getHumiditySkill = require('./skills/skill_gethumidity');

class Bot extends BaseBot {

    constructor(postData) {
        super(postData);
        // console.log(postData)

        this.addLaunchHandler(() => {
            return {
                outputSpeech: '智能家居!'
            };
        });

        this.addIntentHandler('sence_trigger', () => {
            let sence = this.getSlot('room');
            console.log('执行某情景');
            if (!sence) {
                this.nlu.ask('room');
                let card = new Bot.Card.TextCard('您要执行的情景名称是什么?');
                // 如果有异步操作，可以返回一个promise
                return new Promise(function (resolve, reject) {
                    resolve({
                        card: card,
                        outputSpeech: '您要执行的情景名称是什么呢?'
                    });
                });
            }
            var content = {'service': 'trigger_auto_by_name', 'plugin': 'gateway', 'data': {'name': sence}};
            tokenModels.generateGetTopicByAccessToken(postData.System.user.acessToken)
                .then(function (topic) {
                    console.log(topic)
                });
            mqttClient.publish('/v1/polyhome-ha/host/233690e739a64e58a1b9ce38b27e1f52/user_id/99/services/', JSON.stringify(content));
            let card = new Bot.Card.TextCard('正在为您执行该情景');
            return new Promise(function (resolve, reject) {
                resolve({
                    card: card,
                    outputSpeech: '正在为您执行该情景'
                });
            });
        });

        this.addIntentHandler('device_ctl_light', () => {
            let sence = this.getSlot('position');
            console.log('开灯调试');
            if (!sence) {
                this.nlu.ask('position');
                let card = new Bot.Card.TextCard('您要打开哪里的灯呢?');
                // 如果有异步操作，可以返回一个promise
                return new Promise(function (resolve, reject) {
                    resolve({
                        card: card,
                        outputSpeech: '您要打开哪里的灯呢?'
                    });
                });
            }
            var content = {
                'service': 'trigger_light_by_name',
                'plugin': 'gateway',
                'data': {'name': sence, 'action': 'turn_on'}
            };
            asyncClient.publish('/v1/polyhome-ha/host/233690e739a64e58a1b9ce38b27e1f52/user_id/99/services/', JSON.stringify(content));
            let card = new Bot.Card.TextCard('正在开灯');
            return new Promise(function (resolve, reject) {
                resolve({
                    card: card,
                    outputSpeech: '已为您打开灯'
                });
            });
        });

        this.addIntentHandler('close_light', () => {
            let sence = this.getSlot('position');
            console.log('关灯调试');
            if (!sence) {
                this.nlu.ask('position');
                let card = new Bot.Card.TextCard('您要关闭哪里的灯呢?');
                // 如果有异步操作，可以返回一个promise
                return new Promise(function (resolve, reject) {
                    resolve({
                        card: card,
                        outputSpeech: '您要关闭哪里的灯呢?'
                    });
                });
            }

            var content = {
                'service': 'trigger_light_by_name',
                'plugin': 'gateway',
                'data': {'name': sence, 'action': 'turn_off'}
            };
            asyncClient.publish('/v1/polyhome-ha/host/233690e739a64e58a1b9ce38b27e1f52/user_id/99/services/', JSON.stringify(content));
            let card = new Bot.Card.TextCard('正在关灯');
            return new Promise(function (resolve, reject) {
                resolve({
                    card: card,
                    outputSpeech: '已为您关灯'
                });
            });
        })

        /**
         * ===============这里开始处理智能家居的DCS协议细节================
         */
        if (!postData.header) return;
        console.log("payLoadVersion: " + postData.header.payloadVersion);
        console.log("token: " + postData.payload.accessToken);

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
            case "SetModeRequest":
                //对空调的控制之模式的调节
                return airConditionerModeSkill.RequestHandler(postData, asyncClient);
                break;
            case "IncrementTemperatureRequest":
                //对空调IncrementTVChannelRequest的控制之温度的调节
                return airConditionerTemperatureSkill.RequestHandler(postData, asyncClient);
                break;
            case "DecrementTemperatureRequest":
                //对空调IncrementTVChannelRequest的控制之温度的调节
                return airConditionerTemperatureSkill.RequestHandler(postData, asyncClient);
                break;
            case "IncrementTVChannelRequest":
                //对电视的上/下一频道，音量大小调节进行处理
                return tvControllerSkill.RequestHandler(postData, asyncClient);
                break;
            case "DecrementTVChannelRequest":
                //对电视的上/下一频道，音量大小调节进行处理
                return tvControllerSkill.RequestHandler(postData, asyncClient);
                break;
            case "IncrementVolumeRequest":
                //对电视的上/下一频道，音量大小调节进行处理
                return tvControllerSkill.RequestHandler(postData, asyncClient);
                break;
            case "DecrementVolumeRequest":
                //对电视的上/下一频道，音量大小调节进行处理
                return tvControllerSkill.RequestHandler(postData, asyncClient);
                break;
            default:
                console.log(postData.header.name);
        }
    }
}

module.exports = Bot;