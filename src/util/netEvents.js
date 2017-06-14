/* globals require, module */
'use strict';

const EventEmitter = require('events');

class NetEvents extends EventEmitter {
    constructor(connection) {
        super();

        // TODO: Make a function call.
        connection.on('text', (text) => {
            this.parse(text);
        });
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
                this.emit.apply(this, words);
            }
        });
    }
}


module.exports = NetEvents;
