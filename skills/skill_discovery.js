'use strict'

var tokenModels = require('../models/tokens');
var statesModels = require('../models/states');
var usersModels = require('../models/users');

/**
 * DiscoverAppliancesRequest技能处理
 */
exports.RequestHandler = function(postData, asyncClient){
    console.log("==发现设备==");

    let acc_token = postData.payload.accessToken;
    let message_id = postData.header.messageId;
    if (acc_token == null){
        acc_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MGRlMDdlZi1lNmE5LTQ1OWYtYTE0Ni05YjFkZTE0N2RlMDAiLCJzdWIiOjgwMSwiZXhwIjoxNTIzNDM1MDc5LCJpYXQiOjE1MjM0MzE0Nzl9.7pdTGyBDIeuhkV_pfV5jXCgCaEYt47-xy24w6v_UZNY";
    }
    let _this = this;
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
                var content = {"param":{},"method":"GetDbDevList"};
                var topic = "/polyhome/v1/house/" + gw_sn.family_id + "/host/";
            }else{
                var content = {'service': 'get_states', 'plugin': 'gateway','data': {}};
                var topic = "/v1/polyhome-ha/host/" + gw_sn.device_id + "/user_id/99/services/";
            }
            asyncClient.publish(topic, JSON.stringify(content) + '\n')
                .then(function(){
                    if(gw_sn.device_id.indexOf(":") > 0){
                        var content_scene = {"param":{},"method":"GetSenceList"};
                    }else{
                        var content_scene = {'service': 'get_all_automation', 'plugin': 'gateway','data': {}};
                    }
                    return asyncClient.publish(topic, JSON.stringify(content_scene))
                });
        });

    return tokenModels.generateGetTopicByAccessToken(acc_token)
        .then(function(data){
            return usersModels.getUserById(data.user_id);
        })
        .then(function(data){
            return data.family[0].device_id;
        })
        .then(function(data){
            return delay(1000, data);
        })
        .then(function(gateway_sn){
            return statesModels.generateGetStatesBySn(gateway_sn);
        })
        .then(function(data){
            console.log(data)
            return builtData(postData.header.messageId, data);
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

function delay(time, data) {
    return new Promise((resolve , reject) => {
        setTimeout(() => {
            resolve(data);
        }, time);
    })

}

var builtData = function builtData(msg_id, data) {
    let data_header = {
　　    "namespace": "DuerOS.ConnectedHome.Discovery",
　　    "name": "DiscoverAppliancesResponse",
　　    "messageId": msg_id,
　　    "payloadVersion": "1"  　　
    }
    let discovered_appliances = []
    data.states.forEach(state => {
        if(state.entity_id != null){
            if (state.entity_id.split('.')[0] == 'light'){
                let dev_state = {
                    "actions": ["turnOn", "turnOff"],
                    "applianceTypes": ["SWITCH"],
                    "additionalApplianceDetails": {},
                    "applianceId": state.entity_id,
                    "friendlyDescription": "PolyHome智能灯控开关",
                    "friendlyName": state.attributes.friendly_name,
                    "isReachable": true,
                    "manufacturerName": "PolyHome",
                    "modelName": state.attributes.platform,
                    "version": "0.1"
                };
                discovered_appliances.push(dev_state);
            } else if (state.entity_id.split('.')[0] == 'switch'){
                let dev_state = {
                    "actions": ["turnOn", "turnOff"],
                    "applianceTypes": ["SOCKET"],
                    "additionalApplianceDetails": {},
                    "applianceId": state.entity_id,
                    "friendlyDescription": "PolyHome智能灯控开关",
                    "friendlyName": state.attributes.friendly_name,
                    "isReachable": true,
                    "manufacturerName": "PolyHome",
                    "modelName": state.attributes.platform,
                    "version": "0.1"
                };
                discovered_appliances.push(dev_state);
            } else if (state.entity_id.split('.')[0] == 'cover'){
                let dev_state = {
                    "actions": ["turnOn", "turnOff"],
                    "applianceTypes": ["CURTAIN"],
                    "additionalApplianceDetails": {},
                    "applianceId": state.entity_id,
                    "friendlyDescription": "PolyHome智能窗帘",
                    "friendlyName": state.attributes.friendly_name,
                    "isReachable": true,
                    "manufacturerName": "PolyHome",
                    "modelName": state.attributes.platform,
                    "version": "0.1"
                };
                discovered_appliances.push(dev_state);
            } else if (state.entity_id.split('.')[0] == 'binary_sensor'){
                let dev_state = {
                    "actions": [""],
                    "applianceTypes": ["SWITCH"],
                    "additionalApplianceDetails": {},
                    "applianceId": state.entity_id,
                    "friendlyDescription": "PolyHome智能感应器",
                    "friendlyName": state.attributes.friendly_name,
                    "isReachable": true,
                    "manufacturerName": "PolyHome",
                    "modelName": state.attributes.platform,
                    "version": "0.1"
                };
                discovered_appliances.push(dev_state);
            } else if (state.entity_id.split('.')[0] == 'sensor'){
                if (state.attributes.platform == 'weiguoair'){
                    let actions = [""];
                    switch (state.attributes.unit_of_measurement){
                        case "\u00b0C":
                            actions.push("getTemperatureReading");
                            break;
                        case "%":
                            actions.push("getHumidity");
                            break;
                        case "\u03bcg/m3":
                            actions.push("getAirPM25");
                            break;
                    }
                    let dev_state = {
                        "actions": actions,
                        "applianceTypes": ["AIR_PURIFIER"],
                        "additionalApplianceDetails": {},
                        "applianceId": state.entity_id,
                        "friendlyDescription": "PolyHome智能探测器",
                        "friendlyName": state.attributes.friendly_name,
                        "isReachable": true,
                        "manufacturerName": "PolyHome",
                        "modelName": state.attributes.platform,
                        "version": "0.1"
                    };
                    discovered_appliances.push(dev_state);
                }
            }else if (state.entity_id.split('.')[0] == 'remote'){
                let dev_state = {
                    "actions": ["incrementVolume", "decrementVolume", "setVolume", "incrementTemperature"
                        , "decrementTemperature", "setTemperature", "decrementTVChannel", "incrementTVChannel", "setMode", "turnOn", "turnOff"],
                    "applianceTypes": ["TV_SET", "AIR_CONDITION"],
                    "additionalApplianceDetails": {},
                    "applianceId": state.entity_id,
                    "friendlyDescription": "PolyHome红外转发",
                    "friendlyName": state.attributes.friendly_name,
                    "isReachable": true,
                    "manufacturerName": "PolyHome",
                    "modelName": state.attributes.platform,
                    "version": "0.1"
                };
                discovered_appliances.push(dev_state);
            }
        }else {
            if(state.productname == 'lnlight'  || state.productname == 'light' || state.productname == 'walllight'){
                let dev_state = {
                    "actions": ["turnOn", "turnOff"],
                    "applianceTypes": ["LIGHT"],
                    "additionalApplianceDetails": {'way':state.way, 'producname': state.productname},
                    "applianceId": state.sn + '-' + state.way,
                    "friendlyDescription": "PolyHome智能灯控开关",
                    "friendlyName": state.name,
                    "isReachable": true,
                    "manufacturerName": "PolyHome",
                    "modelName": state.productname,
                    "version": "0.1"
                };
                discovered_appliances.push(dev_state);
            }else if(state.productname == 'sccurtain' || state.productname == 'curtain'){
                let dev_state = {
                    "actions": ["turnOn", "turnOff"],
                    "applianceTypes": ["CURTAIN"],
                    "additionalApplianceDetails": {'way':state.way,'producname':state.productname},
                    "applianceId": state.sn + '-' + state.way,
                    "friendlyDescription": "PolyHome智能灯控开关",
                    "friendlyName": state.name,
                    "isReachable": true,
                    "manufacturerName": "PolyHome",
                    "modelName": state.productname,
                    "version": "0.1"
                };
                discovered_appliances.push(dev_state);
            }else if(state.productname == 'socket'){
                let dev_state = {
                    "actions": ["turnOn", "turnOff"],
                    "applianceTypes": ["SOCKET"],
                    "additionalApplianceDetails": {'way':state.way,'producname':state.productname},
                    "applianceId": state.sn + '-' + state.way,
                    "friendlyDescription": "PolyHome智能灯控开关",
                    "friendlyName": state.name,
                    "isReachable": true,
                    "manufacturerName": "PolyHome",
                    "modelName": state.productname,
                    "version": "0.1"
                };
                discovered_appliances.push(dev_state);
            }else if(state.productname == 'temandhumsensor'){
                let dev_state = {
                    "actions": ["getAirPM25", "getTemperatureReading", "getHumidity"],
                    "applianceTypes": ["AIR_PURIFIER"],
                    "additionalApplianceDetails": {'producname':state.productname},
                    "applianceId": state.sn,
                    "friendlyDescription": "PolyHome智能探测器",
                    "friendlyName": state.name,
                    "isReachable": true,
                    "manufacturerName": "PolyHome",
                    "modelName": state.productname,
                    "version": "0.1"
                };
                discovered_appliances.push(dev_state);
            }else if(state.productname == 'remote'){
                let dev_state = {
                    "actions": ["incrementVolume", "decrementVolume", "setVolume", "incrementTemperature"
                        , "decrementTemperature", "setTemperature", "decrementTVChannel", "incrementTVChannel", "setMode", "turnOn", "turnOff"],
                    "applianceTypes": ["TV_SET", "AIR_CONDITION"],
                    "additionalApplianceDetails": {'producname':state.productname},
                    "applianceId": state.sn,
                    "friendlyDescription": "PolyHome智能探测器",
                    "friendlyName": state.name,
                    "isReachable": true,
                    "manufacturerName": "PolyHome",
                    "modelName": state.productname,
                    "version": "0.1"
                };
                discovered_appliances.push(dev_state);
            }
        }

    });
    data.automations.forEach(data => {
        if(data.entity_id != null){
            var dev_state = {
                "actions": ["turnOn", "turnOff"],
                "applianceTypes": ["SCENE_TRIGGER"],
                "additionalApplianceDetails": {},
                "applianceId": data.entity_id,
                "friendlyDescription": "PolyHome智能情景",
                "friendlyName": data.attributes.friendly_name,
                "isReachable": true,
                "manufacturerName": "PolyHome",
                "modelName": data.attributes.id,
                "version": "0.1"
            };
        }else{
            var dev_state = {
                "actions": ["turnOn", "turnOff"],
                "applianceTypes": ["SCENE_TRIGGER"],
                "additionalApplianceDetails": {"producname":data.type},
                "applianceId": data.senceid,
                "friendlyDescription": "PolyHome智能情景",
                "friendlyName": data.name,
                "isReachable": true,
                "manufacturerName": "PolyHome",
                "modelName": data.type,
                "version": "0.1"
            };
        }
        discovered_appliances.push(dev_state);
    })
    let data_payload = {
        "discoveredAppliances": discovered_appliances,
        "discoveredGroups": [{
            "groupName": "卧室",
            "applianceIds": [
                "004",
                "005",
                "006"
            ],
            "groupNotes": "卧室空调的分组控制",
            "additionalGroupDetails": {
                "extraDetail1": "detail about the group",
                "extraDetail2": "another detail about group",
                "extraDetail3": "only be used for reference group."
            }
        }]
    }
    return new Promise(function(resolve, reject){
        resolve({
            "header": data_header,
            "payload": data_payload
        })
    });
};