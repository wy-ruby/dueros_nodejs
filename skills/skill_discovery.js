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
        acc_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhNGI3MGQ5Mi00YzBjLTRhNzQtOWJlMS0zODE3ODhhMjU5YTUiLCJzdWIiOjU0NywiZXhwIjoxNTIyNjY3NDE4LCJpYXQiOjE1MjI2NjM4MTh9.Y6lZtHbNj-SEBHikuxvJoskic_BxBDEszvVCr1h_yoFCBhSqLNFAE_Wjs5tdgirF7TW9kEoMT7WnTTt5DhrTjZYY7eJS_4OYjEmE55FpGaeELBmX2io0rT7ATtsV-UgUvgH22fkqMGkFpGEY_llYpX3PcoE8rtC9e81YPXFb-Tp_YwvmyYSj5HbXQ5rBHQKHCtZ5vIzP1HJXTNXx1sKVfa8U8E8e9Ui--Wa-5rt0fNsQL3Rzc6T0JcUJGUjbnVtGUrT5LaOLsC_rLnwS3JY-uBtMsVkvPcvBICXIOSy3fZP4V6-7_7Ex0_gMNXGg6cWTUfgTxs9IdKBoqymLDYY8cA";
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

var builtData = function builtData(msg_id, data) {
    let data_header = {
　　    "namespace": "DuerOS.ConnectedHome.Discovery",
　　    "name": "DiscoverAppliancesResponse",
　　    "messageId": msg_id,
　　    "payloadVersion": "1"  　　
    }
    let discovered_appliances = []
    data.states.forEach(state => {
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
        }
    });
    data.automations.forEach(data => {
        let dev_state = {
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