'use strict';
/**
  var config = require('../config/index.js');
  var mongoskin = require('mongoskin');
  var db = mongoskin.db(config.mongo_url, {native_parser: true});
  exports.getCollection = function (collectionName) {
    return db.collection(collectionName);
  };
  exports.ObjectID = mongoskin.ObjectID;
*/

var MongoClient = require('mongodb').MongoClient;
var MONGO_URL = 'mongodb://localhost:27017/gomall';
var mogo_db;

MongoClient.connect(MONGO_URL, function(err, db){
    if (err){
      console.log('Database connect Error');
      return
    }
    console.log('Database connect Success');
    mogo_db = db;
});

exports.getDB = function(){
    return mogo_db
};
