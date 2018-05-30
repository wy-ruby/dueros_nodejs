'use strict'

const tokenModels = require('../models/tokens');
const statesModels = require('../models/states');
const usersModels = require('../models/users');
const rcCodeModels = require('../models/rc_codes');
const httpRequest = require('../utils/apiUtil');

/**
 * DiscoverAppliancesRequest技能处理
 */
exports.RequestHandler = function(postData, asyncClient){
    console.log("空调风速控制请求");
    let acc_token = postData.payload.accessToken;
    let message_id = postData.header.messageId;
    let action_name = postData.header.name;
    if (acc_token == null){
        acc_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MGRlMDdlZi1lNmE5LTQ1OWYtYTE0Ni05YjFkZTE0N2RlMDAiLCJzdWIiOjgwMSwiZXhwIjoxNTIzNDM1MDc5LCJpYXQiOjE1MjM0MzE0Nzl9.7pdTGyBDIeuhkV_pfV5jXCgCaEYt47-xy24w6v_UZNY";
    }
    return tokenModels.generateGetTopicByAccessToken(acc_token)
        .then(function(data){
            return usersModels.getUserById(data.user_id);
        })
        .then(function(data){
            return data.family[0];
        })
        .then(function(topic){
            let entity_id = postData.payload.appliance.applianceId;
            let sn = postData.payload.appliance.additionalApplianceDetails.sn;

            //这里处理空调遥看设备的模式的调整
            let family_id = topic.family_id;
            let kid = entity_id.split("_")[2];
            return rcCodeModels.generateGetKeycodeByParams(family_id, sn).then(function(code){
                let remote_list = code.devices[0].remotes;
                let keywords = "";
                remote_list.forEach(item => {
                    if (item.keycode.id == kid) {
                        item.keycode.list.forEach(list => {
                            if(list.kn == "speed"){
                                keywords = list.srccode;
                            }
                        })
                    }
                });
                if (keywords == ""){
                    let data = { code: -404, message: '没有找到该指令！' };
                    return data;
                }else{
                    let data = {"f":sn, "zip": 1, "ir_device_type": 1, "rc_command_type": 1, "rc_command": keywords};
                    let result = httpRequest.addRemoteTask(data);
                    return result;
                }
            });
        })
        .then(function(data){
            console.log(data);
            if(data.code == 0){
                if (action_name == "IncrementFanSpeedRequest"){
                    var return_name = "IncrementFanSpeedConfirmation";
                } else if (action_name == "DecrementFanSpeedRequest"){
                    var return_name = "DecrementFanSpeedConfirmation";
                }
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
                            "value": 2
                        },
                    }
                };
            }else{
                return {
                    "header":{
                        "namespace":"DuerOS.ConnectedHome.Control",
                        "name":"DriverInternalError",
                        "messageId":message_id,
                        "payloadVersion":"1"
                    },
                    "payload":{}
                }
            }
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