'use strict'

const tokenModels = require('../models/tokens');
const statesModels = require('../models/states');
const usersModels = require('../models/users');

/**
 * DiscoverAppliancesRequest技能处理
 */
exports.RequestHandler = function(postData, asyncClient){
    console.log("空调模式控制请求");
    let acc_token = postData.payload.accessToken;
    let message_id = postData.header.messageId;
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
            let type = postData.payload.mode.deviceType?postData.payload.mode.deviceType:"AIR_CONDITION";
            let mode = postData.payload.mode.value;
            if (entity_id.split('.')[0] == 'remote') {
                var content;
                switch (type){
                    case "AIR_CONDITION":
                        if (mode == "COOL"){
                            content = {'service': 'send_command', 'plugin': entity_id.split('.')[0],'data': {'entity_id': entity_id, "command": ["59"]}};
                        }else if (mode == "HEAT"){
                            content = {'service': 'send_command', 'plugin': entity_id.split('.')[0],'data': {'entity_id': entity_id, "command": ["57"]}};
                        }else if (mode == "AUTO"){
                            content = {'service': 'send_command', 'plugin': entity_id.split('.')[0],'data': {'entity_id': entity_id, "command": ["76"]}};
                        }
                        return asyncClient.publish('/v1/polyhome-ha/host/' + topic + '/user_id/99/services/', JSON.stringify(content));
                        break;
                    case "AIR_PURIFIER":
                        break;
                }
            } else {
                throw new Error("Not Support");
            }
            return asyncClient.publish('/v1/polyhome-ha/host/' + topic + '/user_id/99/services/', JSON.stringify(content));
        })
        .then(function(data){
            return {
                "header": {
                    "namespace": "DuerOS.ConnectedHome.Control",
                    "name": "SetModeConfirmation",
                    "messageId": message_id,
                    "payloadVersion": "1"
                },
                "payload": {
                    "previousState": {
                        "mode": {
                            "deviceType": equipment_type,
                            //设置前的模式
                            "value": ""
                        }
                    },
                    "mode": {
                        "deviceType": equipment_type,
                        "value": equipment_mode
                    }
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