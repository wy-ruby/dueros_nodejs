'use strict'

/**
 * Polyhome Mqtt通信
 */
var AsyncClient = require("async-mqtt");

var asyncClient = AsyncClient.connect('mqtt://123.57.139.200', {
    username: 'polyhome',
    password: '123',
    clientId: 'dueros_polyhome_service_01'
});

asyncClient.on('connect', function () {
    console.log('mqtt success connect');
});

module.exports = asyncClient;
