'use strict';

const db = require('./base.js');

/*
 * 存储accesstoken信息
 */
exports.generateSaveToken = (tokeninfo) => {
    return new Promise( (resolve, reject) => {
        db.getDB().collection('tokens',  (err, collection) => {
            if (err) {
                reject(err);
            }
            collection.insert(tokeninfo, {safe: true},  (err, result) => {
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
exports.generateGetTokenById =  (id) => {
    return new Promise( (resolve, reject) => {
        db.getDB().collection('tokens',  (err, collection) => {
            if (err) {
                reject(err);
            }
            collection.findOne({"id": id}, {safe: true},  (err, result) => {
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
exports.generateGetTokenByUserId =  (user_id) => {
    return new Promise( (resolve, reject) => {
        db.getDB().collection('tokens',  (err, collection) => {
            if (err) {
                reject(err);
            }
            collection.findOne({"user_id": user_id}, {safe: true},  (err, result) => {
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
exports.generateUpdateToken =  (tokeninfo) => {
    return new Promise( (resolve, reject) => {
        db.getDB().collection('tokens',  (err, collection) => {
            if (err) {
                reject(err);
            }
            collection.update({'user_id': tokeninfo.user_id}, {$set: {'token': tokeninfo.token}}, {safe: true},  (err, result) => {
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
exports.generateDeleteTokenById =  (id) => {
    return new Promise( (resolve, reject) => {
        db.getDB().collection('tokens',  (err, collection) => {
            if (err) {
                reject(err);
            }
            collection.remove({"id": id},  (err, result) => {
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
exports.generateGetTopicByAccessToken =  (access_token) => {
    return new Promise( (resolve, reject) => {
        db.getDB().collection('tokens', (err, collection) => {
            if(err) {
                reject(err);
            }
            collection.findOne({"token": access_token}, (err, result) => {
                if(err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    });
};

