/* globals require, module */
'use strict';

const externalIP = require('external-ip');
const nconf = require('nconf');

module.exports = (callback) => {
    const localhostAddress = '127.0.0.1';

    if (nconf.get('ResolveExternalIP')) {
        const getIP = externalIP({
            replace: true,
            services: ['http://ifconfig.co/x-real-ip', 'http://ifconfig.io/ip'],
            timeout: 6000,
            getIP: 'parallel'
        });
        
        getIP(callback);
    } else {
        callback(null, localhostAddress);
    }
};
