/* globals require, module */
'use strict';

const EventEmitter = require('events');
const NetEvents = require('./common/NetEvents');
const ws = require('nodejs-websocket');

// TODO: Disable logging!!!

class GameServer extends EventEmitter {
    constructor(options) {
        super();

        options = Object.assign(
            {
                // IP address that this server can be contacted at.
                externalIPAddress: 'localhost',
                // The port on which to open the server on (falsy to open on 
                // random port).
                port: undefined,
                // Initial timeout (in ms) to keep the server open until a player
                // joins - or the server will be closed down.                
                initialTimeout: 60000,
                // Time (in ms) after which an empty server will be closed down.
                idleTimeout: 30000
            },
            options
        );

        this._options = options;
        this._netEvents = new NetEvents();

        this.server = ws.createServer({ /* secure: true */ }, (connection) => {
            this._clientConnected(connection);
        });

        this._startTimeoutIfNecessary(options.initialTimeout);
    }

    _clientConnected(connection) {
        connection.address = GameServer.BuildAddress(connection.socket.remoteAddress, connection.socket.remotePort);
        connection.name = connection.address;

        connection.sendText(`Welcome ${connection.name}\n`);
        this.broadcast(`${connection.name} joined the server\n`, connection);
        this._netEvents.add(connection);

        this._stopTimeoutIfNecessary();

        connection.on('close', (code, reason) => {
            this._clientDisconnected(connection, code, reason);
        });
        connection.on('error', (error) => {
            this.log('error', `${connection.name} generated error: ${error}`);
        });

        this.emit('clientConnected', connection);
    }

    _clientDisconnected(connection, code, reason) {
        this.broadcast(`${connection.name} left the server: ${code} - ${reason}\n`);
        this._netEvents.remove(connection);

        this._startTimeoutIfNecessary(this._options.idleTimeout);

        this.emit('clientDisconnected', connection);
    }

    get _serverEmpty() {
        return this.server.connections.length === 0;
    }

    _startTimeoutIfNecessary(timeoutInMs) {
        const self = this;

        function timeoutOccurred() {
            self.emit('IdleTimeout');
        }

        if (!this._timeout && this._serverEmpty) {
            this._timeout = setTimeout(timeoutOccurred, timeoutInMs);
        }
    }

    _stopTimeoutIfNecessary() {
        if (this._timeout && !this._serverEmpty) {
            clearTimeout(this._timeout);
            delete this._timeout;
        }
    }

    // 1) On start-up create a timer with the initial timeout.
    // 2) When connections fall to 0 start the idle timeout.

    // If a connection is made then stop 1 & 2.
    // 

    static BuildAddress(ipAddress, port) {
        return `${ipAddress}:${port}`;
    }

    get externalIPAddress() {
        return this._options.externalIPAddress;
    }

    get port() {
        return this._options.port;
    }

    get numConnections() {
        return this.server.connections.length;
    }

    get netEvents() {
        return this._netEvents;
    }

    start(callback) {
        this.server.on('listening', () => {
            this._options.port = this.server.socket.address().port;

            const address = GameServer.BuildAddress(
                this._options.externalIPAddress, 
                this._options.port
            );
        
            this.log('info', `Server listening on ${address}`);

            callback(null);
        });
        this.server.on('error', (error) => {
            this.log('error', `GameServer reported an error ${error.toString()}.`);

            callback(error);
        });

        this.server.listen(this._options.port);
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
