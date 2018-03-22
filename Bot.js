var BaseBot = require('bot-sdk');
var mqtt = require('mqtt');

class Bot extends BaseBot{
    constructor (postData) {
        super(postData);
	
        this.addLaunchHandler(()=>{
            return {
                outputSpeech : '智能家居!'
            };
        });

        this.addIntentHandler('personal_income_tax.inquiry', ()=>{
            let loc = this.getSlot('location');    
            let monthlySalary = this.getSlot('monthlysalary');
	    console.log('个税意图识别');
            if(!monthlySalary) {
                this.nlu.ask('monthlySalary');
                let card = new Bot.Card.TextCard('你工资多少呢');

                // 如果有异步操作，可以返回一个promise
                return new Promise(function(resolve, reject){
                    resolve({
                        card : card,
                        outputSpeech : '你工资多少呢'
                    });
                });
            }

            if(!loc) {
                let card = new Bot.Card.TextCard('你在哪呢');
                this.nlu.ask('location');
                return {
                    card : card,
                    outputSpeech : '你在哪呢'
                };

            }
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
	    client.publish('/v1/polyhome-ha/host/233690e739a64e58a1b9ce38b27e1f52/user_id/99/services/', JSON.stringify(content));
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
            client.publish('/v1/polyhome-ha/host/233690e739a64e58a1b9ce38b27e1f52/user_id/99/services/', JSON.stringify(content));
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
            client.publish('/v1/polyhome-ha/host/233690e739a64e58a1b9ce38b27e1f52/user_id/99/services/', JSON.stringify(content));
            let card = new Bot.Card.TextCard('正在关灯');
            return new Promise(function(resolve, reject){
                    resolve({
                        card: card,
                        outputSpeech : '已为您关灯'
                    });
            });
        });	
    }
}


	var client  = mqtt.connect('mqtt://123.57.139.200',{
          username:'polyhome',
          password:'123',
          clientId:'dueros_client_002'
        });

	client.on('connect', function () {
          console.log('mqtt is connected');
        });

	client.on('message', function (topic, message) {
          // message is Buffer
          console.log(message.toString());
          //client.end();
        });

module.exports = Bot;
