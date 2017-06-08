/* globals describe, it, beforeEach, afterEach */
'use strict';

//const assert = require('assert');
//const proxyquire = require('proxyquire');
const sinon = require('sinon');

describe('#gameServer', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.verify();
        sandbox.restore();
    });

    it('should create a server');
    it('should callback when the server is listening');
    it('should report errors during start-up');
    it('should accept client connections');
});
