'use strict'

var tokenModels = require('../models/tokens');
var statesModels = require('../models/states');
var usersModels = require('../models/users');

/**
 * TurnOnRequest技能处理
 */
exports.RequestHandler = function(postData, asyncClient){
    console.log("减少音量--");

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
            if (entity_id.split('.')[0] == 'media_player'){
                let content = {'service': 'volume_down', 'plugin': entity_id.split('.')[0], 'data': {'entity_id': entity_id}};
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
                    "messageId": message_id,
                    "payloadVersion":"1"
                },
                "payload":{}
            }
        });
}