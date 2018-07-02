'use strict'

/**
 * 应用程序 配置参数
 */

exports.app_config = {
    "port": 2019
}

exports.mqtt_config = {
    "url": 'mqtt://60.205.151.71',
    "port": 1883,
    "client_id": "dueros_polyhome_service_"+Date.now(),
    "username": "polyhome",
    "password": "123"
}