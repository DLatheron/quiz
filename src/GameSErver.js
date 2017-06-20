/* globals require, module */
'use strict';

const NetEvents = require('./common/NetEvents');
const ws = require('nodejs-websocket');
const _ = require('lodash');

// TODO: Disable logging!!!

class GameServer {
    constructor(options) {
        this.externalIPAddress = _.get(options, 'externalIPAddress') || 'localhost';
        this.port = _.get(options, 'port') || undefined;
        this.netEvents = new NetEvents();
        this.server = ws.createServer({ /* secure: true */ }, (connection) => {
            connection.name = GameServer.BuildAddress(connection.socket.remoteAddress, connection.socket.remotePort);

            connection.sendText(`Welcome ${connection.name}\n`);
            this.broadcast(`${connection.name} joined the server\n`, connection);

            this.netEvents.add(connection);

            // connection.on('text', (str) => {
            //     this.broadcast(`${connection.name}> ${str}`, connection);
            // });

            connection.on('close', (code, reason) => {
                this.broadcast(`${connection.name} left the server: ${code} - ${reason}\n`);
                this.netEvents.remove(connection);
            });
        });
    }

    static BuildAddress(ipAddress, port) {
        return `${ipAddress}:${port}`;
    }     

    start(callback) {
        this.server.on('listening', () => {
            this.port = this.server.socket.address().port;

            const address = GameServer.BuildAddress(this.externalIPAddress, this.port);
        
            this.log('info', `Server listening on ${address}`);

            callback(null);
        });
        this.server.on('error', (error) => {
            this.log('error', `GameServer reported an error ${error.toString()}.`);

            callback(error);
        });

        this.server.listen(this.port || 0);
    }

    stop() {
        this.server.close();
    }

    broadcast(message, sender) {
        this.server.connections.forEach((connection) => {
            if (connection === sender) { return; }
            connection.sendText(message);
        });
    }

    send(connection, message) {
        connection.sendText(message);
    }

    log(type) {
        console[type].call(Array.prototype.slice.call(arguments, 1));
    }
}


// module.exports = gameServer;
module.exports = GameServer;
