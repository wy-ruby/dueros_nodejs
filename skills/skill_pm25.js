'use strict'

var tokenModels = require('../models/tokens');
var statesModels = require('../models/states');
var usersModels = require('../models/users');

/**
 * DiscoverAppliancesRequest技能处理
 */
exports.RequestHandler = function(postData, asyncClient){
    console.log("==查询PM2.5==");

    let acc_token = postData.payload.accessToken;
    let message_id = postData.header.messageId;
    if (acc_token == null){
        acc_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhNGI3MGQ5Mi00YzBjLTRhNzQtOWJlMS0zODE3ODhhMjU5YTUiLCJzdWIiOjU0NywiZXhwIjoxNTIyNjY3NDE4LCJpYXQiOjE1MjI2NjM4MTh9.Y6lZtHbNj-SEBHikuxvJoskic_BxBDEszvVCr1h_yoFCBhSqLNFAE_Wjs5tdgirF7TW9kEoMT7WnTTt5DhrTjZYY7eJS_4OYjEmE55FpGaeELBmX2io0rT7ATtsV-UgUvgH22fkqMGkFpGEY_llYpX3PcoE8rtC9e81YPXFb-Tp_YwvmyYSj5HbXQ5rBHQKHCtZ5vIzP1HJXTNXx1sKVfa8U8E8e9Ui--Wa-5rt0fNsQL3Rzc6T0JcUJGUjbnVtGUrT5LaOLsC_rLnwS3JY-uBtMsVkvPcvBICXIOSy3fZP4V6-7_7Ex0_gMNXGg6cWTUfgTxs9IdKBoqymLDYY8cA";
    }
    let _this = this;
    let dev_entity_id = postData.payload.appliance.applianceId;
    tokenModels.generateGetTopicByAccessToken(acc_token)
        .then(function(data){
            return usersModels.getUserById(data.user_id);
        })
        .then(function(data){
            return data.family[0].device_id;
        })
        .then(function(gw_sn){
            return asyncClient.subscribe("/v1/polyhome-ha/host/" + gw_sn + "/ack/")
                .then(function(){
                    return gw_sn;
                });
        })
        .then(function(gw_sn){
            let content = {'service': 'get_states', 'plugin': 'gateway','data': {}};
            asyncClient.publish("/v1/polyhome-ha/host/" + gw_sn + "/user_id/99/services/", JSON.stringify(content))
                .then(function(){
                    let content = {'service': 'get_all_automation', 'plugin': 'gateway','data': {}};
                    return asyncClient.publish("/v1/polyhome-ha/host/" + gw_sn + "/user_id/99/services/", JSON.stringify(content))
                });
        });

    return tokenModels.generateGetTopicByAccessToken(acc_token)
        .then(function(data){
            return usersModels.getUserById(data.user_id);
        })
        .then(function(data){
            return data.family[0].device_id;
        })
        .then(function(gateway_sn){
            return statesModels.generateGetStatesBySn(gateway_sn);
        })
        .then(function(data){
            let result = null;
            data.states.forEach(state => {
                if (state.entity_id.split('.')[0] == 'sensor' && dev_entity_id == state.entity_id){
                    result = {
                        "header": {
                            "namespace": "DuerOS.ConnectedHome.Query",
                            "name": "GetAirPM25Response",
                            "messageId": message_id,
                            "payloadVersion": "1"
                        },
                        "payload": {
                            "PM25": {
                                "value": state.state
                            }
                        }
                    };
                }
            });
            if (result == null){
                return {
                    "header":{
                        "namespace":"DuerOS.ConnectedHome.Control",
                        "name":"UnsupportedTargetSettingError",
                        "messageId": message_id,
                        "payloadVersion":"1"
                    },
                    "payload":{}
                }
            }else {
                return result
            }
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