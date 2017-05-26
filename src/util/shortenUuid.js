/* globals module */


function shortenUuid(uuid) {
    if (typeof uuid !== 'string') {
        uuid = uuid.toString();
    }

    const upper = uuid.toUpperCase();

    const inputCharSet = '0123456789ABCDEF';
    const inputBase = 16;
    const outoutCharSet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const outputBase = 26 + 26 + 10;

    // Convert the input stream into a array of 0 and 1 values.
    




    

    return {
    };
};


exports.module = shortenUuid;