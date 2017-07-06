/* globals require, module */
'use strict';

const EventEmitter = require('events');

class NetEvents extends EventEmitter {
    constructor() {
        super();

        this._connections = [];
    }

    get connections() {
        return this._connections;
    }

    add(connection) {
        if (!this._connections.find((conn) => conn === connection)) {
            this._registerConnection(connection);
            return true;
        } else {
            return false;
        }
    }

    remove(connection) {
        const index = this._connections.findIndex((conn) => conn === connection);

        if (index !== -1) {
            this._unregisterConnection(connection, index);
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
            // Choose whichever matcher succeeds in extracting something.
            const word = match[1] || match[2] || match[3];
            words.push(word);
            match = regex.exec(str);
        }        

        return words;
    }

    parse(connection, str) {
        this.splitPhrases(str).forEach((phrase) => {
            const words = this.splitWords(phrase);

            if (words.length >= 1) {
                // Insert the connection as the first command argument.
                words.splice(1, 0, connection);
                this.emit.apply(this, words);
            }
        });
    }

    _registerConnection(connection) {
        const self = this;
        connection._netEventListener = (text) => {
            //console.info(`Parsing ${text}...`);
            self.parse(connection, text);
        };
        connection.on('text', connection._netEventListener);
        this._connections.push(connection);
    }

    _unregisterConnection(connection, index) {
        connection.removeListener('text', connection._netEventListener);
        delete connection._netEventListener;
        this._connections.splice(index, 1);
    }    
}


module.exports = NetEvents;
