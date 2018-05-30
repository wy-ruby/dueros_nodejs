'use strict'

const tokenModels = require('../models/tokens');
const statesModels = require('../models/states');
const usersModels = require('../models/users');
const rcCodeModels = require('../models/rc_codes');
const httpRequest = require('../utils/apiUtil');
/**
 * TurnOnRequest技能处理
 */
exports.RequestHandler = function(postData, asyncClient){
    console.log("打开请求");
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
            return data.family[0];
        })
        .then(function(topic){
            let entity_id = postData.payload.appliance.applianceId;
            let sn = postData.payload.appliance.additionalApplianceDetails.sn;
            let res_content = topic;
            if(sn == undefined){
                if(res_content.device_id.indexOf(":") > 0){
                    let productname = postData.payload.appliance.additionalApplianceDetails.producname;
                    let way = postData.payload.appliance.additionalApplianceDetails.way;
                    let topic = "/polyhome/v1/house/" + res_content.family_id + "/host/";
                    let sn = entity_id.substr(0, entity_id.indexOf("-"))
                    if(productname == "lnlight" || productname == "light" || productname == "sccurtain" || productname == "curtain" || productname == "socket"){
                        var content = {'method': 'ControlDevCmd', 'param': {'way': way, 'status':"on", 'sn': sn, 'productname': productname}};
                    }else if(productname == "walllight"){
                        var content = {"method": 'ControlDevCmd', "param": {'status': "on", 'sn': entity_id, "productname": productname}};
                    }else if (productname == "commonsence"){
                        var content = {"param": {"senceid": entity_id},"method": "OnClickSence"};
                    }
                    return asyncClient.publish(topic, JSON.stringify(content) + "\n");
                }else{
                    if (entity_id.split('.')[0] == 'automation'){
                        let content = {'service': 'trigger', 'plugin': entity_id.split('.')[0], 'data': {'entity_id': entity_id}};
                        return asyncClient.publish('/v1/polyhome-ha/host/' + topic.device_id + '/user_id/99/services/', JSON.stringify(content));
                    } else if (entity_id.split('.')[0] == 'light') {
                        let content = {'service': 'turn_on', 'plugin': entity_id.split('.')[0], 'data': {'entity_id': entity_id}};
                        return asyncClient.publish('/v1/polyhome-ha/host/' + topic.device_id + '/user_id/99/services/', JSON.stringify(content));
                    } else if (entity_id.split('.')[0] == 'cover') {
                        let content = {'service': 'open_cover', 'plugin': entity_id.split('.')[0], 'data': {'entity_id': entity_id}};
                        return asyncClient.publish('/v1/polyhome-ha/host/' + topic.device_id + '/user_id/99/services/', JSON.stringify(content));
                    } else if (entity_id.split('.')[0] == 'switch') {
                        let content = {'service': 'turn_on', 'plugin': entity_id.split('.')[0], 'data': {'entity_id': entity_id}};
                        return asyncClient.publish('/v1/polyhome-ha/host/' + topic.device_id + '/user_id/99/services/', JSON.stringify(content));
                    }
                }
            }else{
                let family_id = res_content.family_id;
                let kid = entity_id.split("_")[2];
                let tid = entity_id.split("_")[0];
                return rcCodeModels.generateGetKeycodeByParams(family_id, sn).then(function(code){
                    let remote_list = code.devices[0].remotes;
                    let keywords = "";
                    remote_list.forEach(item => {
                        if (item.keycode.id == kid) {
                            item.keycode.list.forEach(list => {
                                if(tid == 7){
                                    //tid等于7代表是空调设备的
                                    if(list.kn == "power"){
                                        keywords = list.srccode;
                                    }
                                }else if(tid == 2){
                                    //tid等于2代表是电视机,而电视机的kn的开关机指令不一定都是power，以后需要在这里加
                                    if(list.kn == "power"){
                                        keywords = list.srccode;
                                    }
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
                })
            }
        })
        .then(function(data){
            console.log(data)
            if(data.code == 0){
                return {
                    "header": {
                        "namespace": "DuerOS.ConnectedHome.Control",
                        "name": "TurnOnConfirmation",
                        "messageId": message_id,
                        "payloadVersion": "1"
                    },
                    "payload": {}
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