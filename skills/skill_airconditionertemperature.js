'use strict'

const tokenModels = require('../models/tokens');
const statesModels = require('../models/states');
const usersModels = require('../models/users');

/**
 * DiscoverAppliancesRequest技能处理
 */
exports.RequestHandler = function(postData, asyncClient){
    console.log("空调温度控制请求");
    let acc_token = postData.payload.accessToken;
    let message_id = postData.header.messageId;
    //要调整的温度的值
    let temperature_num = postData.payload.deltaValue.value;
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
            let command_num = ((parseInt(temperature_num)-16)+42)+"";
            if(action_name == "IncrementTemperatureRequest"){
                return_name = "IncrementTemperatureConfirmation";
                if (entity_id.split('.')[0] == 'remote') {
                    var content = {'service': 'send_command', 'plugin': entity_id.split('.')[0], 'data': {'entity_id': entity_id, 'command': [command_num]}};
                }
            }else if(action_name == "DecrementTemperatureRequest"){
                return_name = "DecrementTemperatureConfirmation";
                if (entity_id.split('.')[0] == 'remote') {
                    var content = {'service': 'send_command', 'plugin': entity_id.split('.')[0], 'data': {'entity_id': entity_id, 'command': [command_num]}};
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
                        "temperature": {
                            //调整温度变化之前的温度
                            "value": 25.0
                        }
                    },
                    "temperature": {
                        "value": temperature_num
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