/* globals require, describe, it, beforeEach, afterEach */
'use strict';

const sinon = require('sinon');

describe('#SocketReceiver', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();

        // TODO: Disable logging.
    });

    afterEach(() => {
        sandbox.verify();
        sandbox.restore();
    });

    describe('#constructor', () => {
        it('should configure the game server\'s address');
        it('should configure the game server\'s port');
        it('should configure the game\'s id');
    });

    describe('#start', () => {
        it('should attempt to establish a web socket connection');
        it('should attempt to estbalish a web socket connection with the configured server');
    });

    describe('#send', () => {
        it('should attempt to send the message over the web socket');
    });

    describe('#_onOpen', () => {
        it('should register the net event handler on the connection');
        it('should send a "JOIN" message');
        it('should raise an "open" event');
    });

    describe('when joining', () => {
        it('should send a "NAME" message when joined');
    });

    describe('#_onMessage', () => {
        it('should raise a "text" event on receiving a message');
    });

    describe('#_onError', () => {
        it('should raise an "error" event on the connection erroring');
    });

    describe('#_onClose', () => {
        it('should raise a "close" event on the connection closing');
    });
});
