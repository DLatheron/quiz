/* globals describe, it, beforeEach, afterEach */
'use strict';

//const assert = require('assert');
//const proxyquire = require('proxyquire');
const sinon = require('sinon');

describe('#GameServer', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.verify();
        sandbox.restore();
    });

    describe('#buildAddress', () => {
        it('should build an address from a hostname and port');
    });

    describe('#start', () => {
        it('should set the server listening');
        it('should callback if successful');
        it('should report an error if there is a failure');
    });

    describe('#broadcast', () => {
        it('should send a message to all connections');
        it('should not send a message to an excluded connection');
    });
    it('should create a server');
    it('should callback when the server is listening');
    it('should report errors during start-up');
    it('should accept client connections');
    it('should register a new client for network events');
    it('should unregister a new client from network events');
});
