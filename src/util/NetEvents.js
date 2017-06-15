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
            connection.on('text', this._connectionListener);
            this._connections.push(connection);
            return true;
        } else {
            return false;
        }
    }

    remove(connection) {
        const index = this._connections.findIndex((conn) => conn === connection);

        if (index !== -1) {
            connection.removeListener('text', this._connectionListener);
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
        // Match quoted string or individual words.
        const regex = /'(.*)'|"(.*)"|(\S+)/g;

        let words = [];
        let match = regex.exec(str);

        while (match !== null) {
            const word = match[1] || match[2] || match[3];
            words.push(word);
            match = regex.exec(str);
        }        

        return words;
    }

    parse(str) {
        this.splitPhrases(str).forEach((phrase) => {
            const words = this.splitWords(phrase);

            if (words.length >= 1) {
                this.emit.apply(this.connection, words);
            }
        });
    }

    _connectionListener(text) {
        this.parse(text);
    }
}


module.exports = NetEvents;
