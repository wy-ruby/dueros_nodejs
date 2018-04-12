'use strict'

var tokenModels = require('../models/tokens');
var statesModels = require('../models/states');
var usersModels = require('../models/users');

/**
 * TurnOnRequest技能处理
 */
exports.RequestHandler = function(postData, asyncClient){
    console.log("控制关闭");
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
            console.log(topic)
            let res_content = topic
            let entity_id = postData.payload.appliance.applianceId;
            if(res_content.device_id.indexOf(":") > 0){
                console.log(1231221)
                let productname = postData.payload.appliance.additionalApplianceDetails.producname;
                let way = postData.payload.appliance.additionalApplianceDetails.way;
                let topic = "/polyhome/v1/house/" + res_content.family_id + "/host/";
                if(productname == "lnlight" || productname == "light" || productname == "sccurtain" || productname == "curtain" || productname == "socket"){
                    var content = {'method': 'ControlDevCmd', 'param': {'way': way,'status':"off",'sn':entity_id,'productname':productname}};
                }else if(productname == "walllight"){
                    var content = {'method': 'ControlDevCmd', 'param': {'status':"off",'sn':entity_id,'productname':productname}};
                }
                // console.log(topic);
                // console.log(JSON.stringify(content));
                return asyncClient.publish(topic, JSON.stringify(content) + "\n");
            }else{
                if (entity_id.split('.')[0] == 'light') {
                    let content = {'service': 'turn_off', 'plugin': entity_id.split('.')[0],'data': {'entity_id': entity_id}};
                    return asyncClient.publish('/v1/polyhome-ha/host/' + topic + '/user_id/99/services/', JSON.stringify(content));
                } else if (entity_id.split('.')[0] == 'cover') {
                    let content = {'service': 'close_cover', 'plugin': entity_id.split('.')[0], 'data': {'entity_id': entity_id}};
                    return asyncClient.publish('/v1/polyhome-ha/host/' + topic + '/user_id/99/services/', JSON.stringify(content));
                } else if (entity_id.split('.')[0] == 'switch') {
                    let content = {'service': 'turn_off', 'plugin': entity_id.split('.')[0], 'data': {'entity_id': entity_id}};
                    return asyncClient.publish('/v1/polyhome-ha/host/' + topic + '/user_id/99/services/', JSON.stringify(content));
                }
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
                    "messageId": message_id,
                    "payloadVersion":"1"
                },
                "payload":{}
            }
        });
}