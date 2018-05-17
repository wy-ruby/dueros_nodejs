'use strict'

var tokenModels = require('../models/tokens');
var statesModels = require('../models/states');
var usersModels = require('../models/users');

/**
 * DiscoverAppliancesRequest技能处理
 */
exports.RequestHandler = function(postData, asyncClient){
    console.log("CO2查询请求");

    let acc_token = postData.payload.accessToken;
    let message_id = postData.header.messageId;
    if (acc_token == null){
        acc_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MGRlMDdlZi1lNmE5LTQ1OWYtYTE0Ni05YjFkZTE0N2RlMDAiLCJzdWIiOjgwMSwiZXhwIjoxNTIzNDM1MDc5LCJpYXQiOjE1MjM0MzE0Nzl9.7pdTGyBDIeuhkV_pfV5jXCgCaEYt47-xy24w6v_UZNY";
    }
    let _this = this;
    let dev_entity_id = postData.payload.appliance.applianceId;
    tokenModels.generateGetTopicByAccessToken(acc_token)
        .then(function(data){
            return usersModels.getUserById(data.user_id);
        })
        .then(function(data){
            return data.family[0];
        })
        .then(function(gw_sn){
            if(gw_sn.device_id.indexOf(":") > 0){
                return asyncClient.subscribe("/polyhome/v1/house/" + gw_sn.family_id + "/client/")
                    .then(function(){
                        return gw_sn;
                    });
            }else{
                return asyncClient.subscribe("/v1/polyhome-ha/host/" + gw_sn.device_id + "/ack/")
                    .then(function(){
                        return gw_sn;
                    });
            }

        })
        .then(function(gw_sn){
            //这样如果匹配到了话说明是mac地址的方式的，这样的要发平板
            if(gw_sn.device_id.indexOf(":") > 0){
                var content = {"param":{},"method":"GetAirStateDataCmd"};
                var topic = "/polyhome/v1/house/" + gw_sn.family_id + "/host/";
            }else{
                var content = {'service': 'get_states', 'plugin': 'gateway','data': {}};
                var topic = "/v1/polyhome-ha/host/" + gw_sn.device_id + "/user_id/99/services/";
            }
            asyncClient.publish(topic, JSON.stringify(content) + '\n')
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
            if (data.gw_sn.indexOf(':') > 0) {
                data.states.forEach(state => {
                    if(dev_entity_id == state.sn){
                        result = {
                            "sn": data.gw_sn,
                            "entity_id": dev_entity_id,
                            "value": null
                        }
                    }
                });
            } else {
                let result = null;
                data.states.forEach(state => {
                    if (state.entity_id && state.entity_id.split('.')[0] == 'sensor' && dev_entity_id == state.entity_id){
                        result = {
                            "sn": data.gw_sn,
                            "entity_id": state.entity_id,
                            "value": state.state
                        };
                    }
                });
            }
            return result;
        })
        .then((data) => {
            if (data.value) {
                return data;
            } else {
                return delay(2000, data);
            }
        })
        .then((data) => {
            if (data.value) {
                // 新主机
                result = {
                    "header": {
                        "namespace": "DuerOS.ConnectedHome.Query",
                        "name": "GetAirPM25Response",
                        "messageId": message_id,
                        "payloadVersion": "1"
                    },
                    "payload": {
                        "ppm": {
                            "value": data.value
                        }
                    }
                };
                return result;
            } else {
                let entity_id = data.entity_id;
                return statesModels.generateGetAirStatesBySn(data.sn)
                    .then((data) => {
                        let times = (Date.parse(new Date()) / 1000);
                        let state = null
                        let air_num = null
                        data['infos'].forEach((info,index) => {
                            if(info.sn == entity_id && (times - parseInt(data['times']) < 60)){
                                state = 1;
                                air_num = index;
                            }
                        });
                        if (state == null){
                            return null
                        }else{
                            return data['infos'][air_num]['data']['CO2'];
                        }
                    })
                    .then((value) => {
                        // 老主机
                        if(value){
                            return {
                                "header": {
                                    "namespace": "DuerOS.ConnectedHome.Query",
                                    "name": "GetAirPM25Response",
                                    "messageId": message_id,
                                    "payloadVersion": "1"
                                },
                                "payload": {
                                    "ppm": {
                                        "value": value
                                    }
                                }
                            }
                        }else{
                            return {
                                "header": {
                                    "namespace": "DuerOS.ConnectedHome.Control",
                                    "name": "TargetHardwareMalfunctionError",
                                    "messageId": message_id,
                                    "payloadVersion": "1"
                                },
                                "payload": {}
                            }
                        }

                    })
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

    function delay(time, data) {
        return new Promise((resolve , reject) => {
            setTimeout(() => {
                resolve(data);
            }, time);
        })

    }
}