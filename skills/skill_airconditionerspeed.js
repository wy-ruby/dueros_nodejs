'use strict'

var tokenModels = require('../models/tokens');
var statesModels = require('../models/states');
var usersModels = require('../models/users');

/**
 * DiscoverAppliancesRequest技能处理
 */
exports.RequestHandler = function(postData, asyncClient){
    console.log("控制关闭");
    let acc_token = postData.payload.accessToken;
    let message_id = postData.header.messageId;
    //风速增加的具体值
    let speed_num = postData.payload.deltaValue.value;
    let action_name = postData.header.name;
    let return_name = "";
    if (acc_token == null){
        acc_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MGRlMDdlZi1lNmE5LTQ1OWYtYTE0Ni05YjFkZTE0N2RlMDAiLCJzdWIiOjgwMSwiZXhwIjoxNTIzNDM1MDc5LCJpYXQiOjE1MjM0MzE0Nzl9.7pdTGyBDIeuhkV_pfV5jXCgCaEYt47-xy24w6v_UZNY";
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

            if(action_name == "IncrementFanSpeedRequest"){
                return_name = "IncrementFanSpeedConfirmation";
                if (entity_id.split('.')[0] == 'light') {
                    var content = {'service': 'turn_off', 'plugin': entity_id.split('.')[0],'data': {'entity_id': entity_id}};
                } else if (entity_id.split('.')[0] == 'cover') {
                    var content = {'service': 'turn_off', 'plugin': entity_id.split('.')[0],'data': {'entity_id': entity_id}};
                }
            }else if(action_name == "DecrementFanSpeedRequest"){
                return_name = "DecrementFanSpeedConfirmation";
                if (entity_id.split('.')[0] == 'light') {
                    var content = {'service': 'turn_off', 'plugin': entity_id.split('.')[0],'data': {'entity_id': entity_id}};
                } else if (entity_id.split('.')[0] == 'cover') {
                    var content = {'service': 'turn_off', 'plugin': entity_id.split('.')[0],'data': {'entity_id': entity_id}};
                }
            }else{
                throw new Error("Not Support");
            }
            return asyncClient.publish('/v1/polyhome-ha/host/' + topic + '/user_id/99/services/', JSON.stringify(content));
        })
        .then(function(data){
            return {
                "header": {
                    "namespace": "DuerOS.ConnectedHome.Control",
                    "name": return_name,
                    "messageId": message_id,
                    "payloadVersion": "1"
                },
                "payload": {
                    "previousState": {
                        "fanSpeed": {
                            //调整风速前的风速的值
                            "value": 1
                        }
                    },
                    "fanSpeed": {
                        "value": speed_num
                    },
                }
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
                "payload":{}
            }
        });
}