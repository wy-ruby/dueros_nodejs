'use strict';

const db = require('./base.js');

/*
 * 存储all_states
 */
exports.generateGetCodesByFamilyId = function (family_id) {
    return new Promise(function (resolve, reject) {
        db.getDB().collection('rc_codes', function (err, collection) {
            if (err) {
                reject(err);
            }
            collection.findOne({"family_id": family_id}, function (err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    });
};


/*
 * 查询红外码
 */

exports.generateGetKeycodeByParams = function (family_id, sn) {
    return new Promise(function (resolve, reject) {
        db.getDB().collection('rc_codes', function (err, collection) {
            if (err) {
                reject(err);
            }
            collection.findOne({"family_id": family_id}, {"devices":{$elemMatch:{"sn": sn}}}, function (err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    });
};