'use strict'

var mqtt = require('mqtt');

var client;

client = mqtt.connect('mqtt://123.57.139.200',{
    username: 'polyhome',
    password: '123',
    clientId: 'dueros_polyhome_service'
});

client.on('connect', function () {
    console.log('mqtt is connected');
});

client.on('message', function (topic, message) {
    // message is Buffer
    console.log(message.toString());
});

exports.mqttClient = client;
