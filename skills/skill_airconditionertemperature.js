'use strict'

var tokenModels = require('../models/tokens');
var statesModels = require('../models/states');
var usersModels = require('../models/users');

/**
 * DiscoverAppliancesRequest技能处理
 */
exports.AirConditionerTemperatureHandler = function(postData, asyncClient){
    console.log("控制关闭");
    let acc_token = postData.payload.accessToken;
    let message_id = postData.header.messageId;
    //要调整的温度的值
    let temperature_num = postData.payload.deltaValue.value;
    let action_name = postData.header.name;
    let return_name = "";
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
            if(action_name == "IncrementTemperatureRequest"){
                return_name = "IncrementTemperatureConfirmation";
                if (entity_id.split('.')[0] == 'light') {
                    var content = {'service': 'turn_off', 'plugin': entity_id.split('.')[0],'data': {'entity_id': entity_id}};
                } else if (entity_id.split('.')[0] == 'cover') {
                    var content = {'service': 'turn_off', 'plugin': entity_id.split('.')[0],'data': {'entity_id': entity_id}};
                }
            }else if(action_name == "DecrementTemperatureRequest"){
                return_name = "IncrementTemperatureConfirmation";
                if (entity_id.split('.')[0] == 'light') {
                    var content = {'service': 'turn_off', 'plugin': entity_id.split('.')[0],'data': {'entity_id': entity_id}};
                } else if (entity_id.split('.')[0] == 'cover') {
                    var content = {'service': 'turn_off', 'plugin': entity_id.split('.')[0],'data': {'entity_id': entity_id}};
                }
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