'use strict'

var tokenModels = require('../models/tokens');
var statesModels = require('../models/states');
var usersModels = require('../models/users');

/**
 * DiscoverAppliancesRequest技能处理
 */
exports.RequestHandler = function(postData, asyncClient){
    console.log("==查询设备状态==");

    let acc_token = postData.payload.accessToken;
    let message_id = postData.header.messageId;
    if (acc_token == null) {
        acc_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MGRlMDdlZi1lNmE5LTQ1OWYtYTE0Ni05YjFkZTE0N2RlMDAiLCJzdWIiOjgwMSwiZXhwIjoxNTIzNDM1MDc5LCJpYXQiOjE1MjM0MzE0Nzl9.7pdTGyBDIeuhkV_pfV5jXCgCaEYt47-xy24w6v_UZNY"
    }
    let _this = this;
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
            data.states.forEach(state => {
                if (state.entity_id.split('.')[0] == 'binary_sensor' && postData.payload.appliance.applianceId == state.entity_id){
                    console.log(state.state);
                }
            });
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