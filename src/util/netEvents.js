/* globals module */
'use strict';

function netEvents(connection) {

    function splitPhrases(str) {
        return str.split(/\s*;\s*/);
    }

    function splitWords(str) {
        return str.split(/\s*\s/);        
    }

    function parse(str) {
        splitPhrases(str).forEach((phrase) => {
            const words = splitWords(phrase);

            if (words.length >= 1) {
                console.log(words[0]);
            }
        });
    }

    connection.on('text', (text) => {
        parse(text);
    });

    return {
        splitPhrases,
        splitWords,
        parse
    };
}


module.exports = netEvents;
