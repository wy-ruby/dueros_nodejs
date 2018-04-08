'use strict'

var tokenModels = require('../models/tokens');
var statesModels = require('../models/states');
var usersModels = require('../models/users');

/**
 * TurnOnRequest技能处理
 */
exports.RequestHandler = function(postData, asyncClient){
    console.log("增加音量++");
    
    let acc_token = postData.payload.accessToken;
    let message_id = postData.header.messageId;
    if (acc_token == null){
        acc_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhNGI3MGQ5Mi00YzBjLTRhNzQtOWJlMS0zODE3ODhhMjU5YTUiLCJzdWIiOjU0NywiZXhwIjoxNTIyNjY3NDE4LCJpYXQiOjE1MjI2NjM4MTh9.Y6lZtHbNj-SEBHikuxvJoskic_BxBDEszvVCr1h_yoFCBhSqLNFAE_Wjs5tdgirF7TW9kEoMT7WnTTt5DhrTjZYY7eJS_4OYjEmE55FpGaeELBmX2io0rT7ATtsV-UgUvgH22fkqMGkFpGEY_llYpX3PcoE8rtC9e81YPXFb-Tp_YwvmyYSj5HbXQ5rBHQKHCtZ5vIzP1HJXTNXx1sKVfa8U8E8e9Ui--Wa-5rt0fNsQL3Rzc6T0JcUJGUjbnVtGUrT5LaOLsC_rLnwS3JY-uBtMsVkvPcvBICXIOSy3fZP4V6-7_7Ex0_gMNXGg6cWTUfgTxs9IdKBoqymLDYY8cA";
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
                let content = {'service': 'volume_up', 'plugin': entity_id.split('.')[0], 'data': {'entity_id': entity_id}};
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
                    "messageId":"917314cd-ca00-49ca-b75e-d6f65ac43503",
                    "payloadVersion":"1"
                },
                "payload":{}
            }
        });
}