/* globals require, module */
'use strict';

const EventEmitter = require('events');

class NetEvents extends EventEmitter {
    constructor(connection) {
        super();

        this._connections = [];
        this.connection = connection;

        connection.on('text', (text) => {
            this.parse(text);
        });
    }

    get connections() {
        return this._connections;
    }

    add(connection) {
        if (!this._connections.find((conn) => conn === connection)) {
            connection.on('text', (text) => {
                this.parse(text);
            });
            this._connections.push(connection);
            return true;
        } else {
            return false;
        }
    }

    remove(connection) {
        const index = this._connections.findIndex((conn) => conn === connection);
        console.info(index);
        if (index !== -1) {
            this._connections.splice(index, 1);
            return true;
        } else {
            return false;
        }
    }

    splitPhrases(str) {
        return str.split(/\s*;\s*/);
    }

    splitWords(str) {
        return str.match(/\S+/g);        
    }

    parse(str) {
        this.splitPhrases(str).forEach((phrase) => {
            const words = this.splitWords(phrase);

            if (words.length >= 1) {
                this.emit.apply(this.connection, words);
            }
        });
    }
}


module.exports = NetEvents;
