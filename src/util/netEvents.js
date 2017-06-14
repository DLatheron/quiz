/* globals require, module */
'use strict';

const EventEmitter = require('events');

class NetEvents extends EventEmitter {
    constructor(connection) {
        super();

        this.connection = connection;

        connection.on('text', this.parse);
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
