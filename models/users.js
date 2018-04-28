'use strict';

const mongodb = require('./base.js');
const db = require('./base.js');

/*
 * 获取用户数据
 */
exports.getUserById = (id) => {
    return new Promise((resolve, reject) => {
        db.getDB().collection('users', (err, collection) => {
            if (err) {
                reject(err);
            }
            collection.findOne({'id': id}, (err, result) => {
                if (err) {
                    reject(err);
                }
                if (result == null) {
                    resolve(result);
                }
                resolve(result);
            });
        });
    });
};

/*
 * 根据用户名获取用户
 */
exports.findUserByName= (username) => {
    return new Promise((resolve, reject) => {
        db.getDB().collection('users', (err, collection) => {
            if(err) {
                reject(err);
            }
            collection.findOne({'mobile': username}, (err, result) => {
                if(err) {
                    reject(err);
                }
                if(result == null) {
                    resolve(result);
                }
                resolve(result);
            });
        });
    });
};

/*
 * 根据家庭id获取用户的信息
 */
exports.findFamilyIdByUsers = (family_id) => {
    return new Promise((resolve, reject) => {
        db.getDB().collection('users', (err, collection) => {
            if(err) {
                reject(err);
            }
            collection.findOne({'family': { $elemMatch: {"family_id": family_id}}}, (err, result) => {
                if(err) {
                    reject(err);
                }
                if(result == null) {
                    resolve(result);
                }
                resolve(result);
            });
        });
    });
};

/*
 * 插入数据到user集合中
 */
exports.generateSaveUser = (user) => {
    return new Promise((resolve, reject) => {
      db.getDB().collection('users', (err, collection) => {
        if (err) {
            return reject(err);
        }
        collection.update({'id': user.id}, {$set: user}, {upsert: true}, (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(user);
        });
      });
    })
};

/*
 * 根据user_id更新家庭
 */
exports.generateUpdateFamilyByUser = (user_id, device_id) => {
    return new Promise((resolve, reject) => {
      db.getDB().collection('users', (err, collection) => {
        if(err) {
            return reject(err);
        }
        collection.update({'id': parseInt(user_id)}, {$set: {'family': [{'device_id': device_id}]}}, (err, result) => {
            if(err) {
                reject(err)
            }
            resolve(result);
        });
      });
    })
};

/*
 * 插入数据到user集合中
 */
exports.saveUser = (user) => {
    db.getDB().collection('users', (err, collection) => {
        if(err) {
            return err;
        }
        collection.insert(user, {safe: true}, (err, result) => {
            if(err) {
                return err
            }
            console.log(result)
            return result;
        });
    });
};

/*
 * 通过电话号获取用户
 */
exports.getUsersByUserName = (body) => {
    return new Promise((resolve, reject) => {
        db.getDB().collection('users', (err, collection) => {
            if(err) {
                reject(err);
            }
            collection.findOne({'mobile': body.mobile}, (err, result) => {
                if(err) {
                    reject(err)
                }
                if(result == null) {
                    resolve({'find':false, 'result': body});
                }
                resolve({'find':true, 'result': body});
            });
        });
    });
};
