'use strict';

const MongoClient = require('mongodb').MongoClient;
const MONGO_URL = 'mongodb://user:polyhome@123.57.139.200:57017/polydb';
let mogo_db;

MongoClient.connect(MONGO_URL, function(err, db){
    if (err){
      console.log('Database connect Error');
      return;
    }
    console.log('Database connect Success');
    mogo_db = db;
});

exports.getDB = function () {
    return mogo_db;
};
