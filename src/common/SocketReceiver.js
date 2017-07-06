/* globals module, WebSocket */
'use strict';

const EventEmitter = require('events');
const NetEvents = require('./NetEvents');


class SocketReceiver extends EventEmitter {
    constructor(options) {
        super();

        options = Object.assign(
            {},
            options
        );
        this._options = options;
        this._netEvents = new NetEvents();
    }

    start() {
        this._ws = new WebSocket(
            `ws://${this._options.gameServerAddress}:${this._options.gameServerPort}`
        );
        this._ws.onopen = this._onOpen.bind(this);
        this._ws.onmessage = this._onMessage.bind(this);
        this._ws.onerror = this._onError.bind(this);
        this._ws.onclose = this._onClose.bind(this);
    }

    send(message) {
        this._ws.send(message);
    }

    _onOpen(event) {
        this.log('log', 'WebSocket connection opened');

        this._netEvents.add(this);

        this._netEvents.on('JOINED', (connection) => {
            this.log('log', 'NET EVENTS FIRED!!!');
            const playerName = `Player_${connection.name}`;
            this.send(`NAME ${playerName}`);
        });

        this.send(`JOIN ${this._options.gameId}`);

        this.emit('open');
    }

    _onMessage(event) {
        this.log('log', `ws.onmessage ${event.data}`);
        this.emit('text', event.data);
    }

    _onError(event) {
        this._ws.onerror = (event) => {
            this.log('log', `WebSocket connection error: ${event.error}`);
            this.emit('error', event.error);
        };
    }

    _onClose(event) {
        this._ws.onclose = (event) => {
            this.log('log', 'WebSocket connection closed');
            this.emit('closed');
        };    
    }

    log(type) {
        console[type].call(Array.prototype.slice.call(arguments, 1));
    }    
}

module.exports = SocketReceiver;
