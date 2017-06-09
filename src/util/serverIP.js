/* globals require, module */
'use strict';

const externalIP = require('external-ip');

module.exports = (callback) => {
    const getIP = externalIP({
        replace: true,
        services: ['http://ifconfig.co/x-real-ip', 'http://ifconfig.io/ip'],
        timeout: 6000,
        getIP: 'parallel'
    });
    
    getIP(callback);
};
