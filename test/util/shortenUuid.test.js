/* globals require, describe, it */
const shortenUuid = require('../../src/util/shortenUuid');
//const uuid = require('uuid');

describe('#shortenUuid', () => {
    it('should handle an empty input string', () => {
        const id = 'a1d04f03-67ca-430d-af90-070922de1ce6';
        shortenUuid(id);
    });
});
