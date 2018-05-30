'use strict';

const db = require('./base.js');

/*
 * 存储all_states
 */
exports.generateSaveStates = function (states) {
    return new Promise(function (resolve, reject) {
        db.getDB().collection('states', function (err, collection) {
            if (err) {
                reject(err);
            }
            collection.update({"gw_sn": states.gw_sn}, {"$set": {"states": states.states}}, {upsert: true}, function (err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    });
};

/*
 * 存储all_automations
 */
exports.generateSaveAutomations = function (automations) {
    return new Promise(function (resolve, reject) {
        db.getDB().collection('states', function (err, collection) {
            if (err) {
                reject(err);
            }
            collection.update({"gw_sn": automations.gw_sn}, {"$set": {"automations": automations.automations}}, {upsert: true}, function (err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    });
};


/*
 * 存储all_AirState
 */
exports.generateSaveAirStates = function (automations) {
    return new Promise(function (resolve, reject) {
        db.getDB().collection('equ_infos', function (err, collection) {
            if (err) {
                reject(err);
            }
            collection.update({"gw_sn": automations.gw_sn}, {"$set": {"times":automations.times,"infos": automations.infos}}, {upsert: true}, function (err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    });
};


/*
 * 根据网关SN获取所有状态
 */
exports.generateGetStatesBySn = function (sn) {
    return new Promise(function (resolve, reject) {
        db.getDB().collection('states', function (err, collection) {
            if (err) {
                reject(err);
            }
            collection.findOne({"gw_sn": sn}, function (err, result) {
                if (err) {
                    resolve({});
                }
                resolve(result);
            });
        });
    });
};


/*
 * 根据网关SN获取空气净化仪的信息
 */
exports.generateGetAirStatesBySn = function (sn) {
    return new Promise(function (resolve, reject) {
        db.getDB().collection('equ_infos', function (err, collection) {
            if (err) {
                reject(err);
            }
            collection.findOne({"gw_sn": sn}, function (err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    });
};