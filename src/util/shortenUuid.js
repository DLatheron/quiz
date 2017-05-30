/* globals require, module */
'use strict';

const _ = require('lodash');


function shortenUuid(uuid) {
    if (typeof uuid !== 'string') {
        uuid = uuid.toString();
    }
    uuid = uuid.toUpperCase();
    uuid = uuid.replace(/-/g, '');

    //const upper = uuid.toUpperCase();

    const inputCharSet = '0123456789ABCDEF';
    const inputCharBits = 4;
    //const inputBase = 16;
    const outputCharSet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    //const outputBase = 26 + 26 + 10;
    const outputCharBits = 6;

    let binaryStream = '';

    // Convert the input stream into a array of 0 and 1 values.
    for (let index = 0; index < uuid.length; ++index) {
        const ch = uuid[index];
        const inputIndex = inputCharSet.indexOf(ch);
        const binary = _.padStart(inputIndex.toString(2), inputCharBits, '0');
        binaryStream += binary;
    }

    //console.log(`Input Binary Stream: ${binaryStream}`);

    let writeBuffer = 0;
    let bitsWritten = 0;
    let outputStream = '';
    let index = 0;
    
    while (index < binaryStream.length) {
        const bit = binaryStream[index] === '1' ? 1 : 0;

        writeBuffer <<= 1;
        writeBuffer += bit;
        ++bitsWritten;

        if (bitsWritten === outputCharBits) {
            const outputCh = outputCharSet[writeBuffer];
            outputStream += outputCh;
            bitsWritten = 0;
            writeBuffer = 0;
        }

        ++index;
    }

    //console.log(`Output: ${outputStream}`);

    return outputStream;
}


module.exports = shortenUuid;