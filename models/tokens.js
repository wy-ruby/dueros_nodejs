'use strict';

var db = require('./base.js');

/*
 * 存储accesstoken信息
 */
exports.generateSaveToken = function (tokeninfo) {
    return new Promise(function (resolve, reject) {
        db.getDB().collection('tokens', function (err, collection) {
            if (err) {
                reject(err);
            }
            collection.insert(tokeninfo, {safe: true}, function (err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    });
};

/*
 * 获取accesstoken
 */
exports.generateGetTokenById = function (id) {
    return new Promise(function (resolve, reject) {
        db.getDB().collection('tokens', function (err, collection) {
            if (err) {
                reject(err);
            }
            collection.findOne({"id": id}, {safe: true}, function (err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    });
};

/*
 * 获取accesstoken
 */
exports.generateGetTokenByUserId = function (user_id) {
    return new Promise(function (resolve, reject) {
        db.getDB().collection('tokens', function (err, collection) {
            if (err) {
                reject(err);
            }
            collection.findOne({"user_id": user_id}, {safe: true}, function (err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    });
};

/*
 * 更新gengaccesstoken信息
 */
exports.generateUpdateToken = function (tokeninfo) {
    return new Promise(function (resolve, reject) {
        db.getDB().collection('tokens', function (err, collection) {
            if (err) {
                reject(err);
            }
            collection.update({'user_id': tokeninfo.user_id}, {$set: {'token': tokeninfo.token}}, {safe: true}, function (err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    });
};

/*
 * 删除指定accesstoken
 */
exports.generateDeleteTokenById = function (id) {
    return new Promise(function (resolve, reject) {
        db.getDB().collection('tokens', function (err, collection) {
            if (err) {
                reject(err);
            }
            collection.remove({"id": id}, function (err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    });
};

/*
 * 通过accesstoken获取topic
 */
exports.generateGetTopicByAccessToken = function (access_token) {
    return new Promise(function (resolve, reject) {
        db.getDB().collection('tokens', function (err, collection) {
            if (err) {
                reject(err);
            }
            collection.findOne({"token": access_token}, function (err, result) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    });
};

