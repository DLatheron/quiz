/* globals require, describe, it, beforeEach, afterEach */
'use strict';

const assert = require('assert');
const sinon = require('sinon');

describe('#SocketReceiver', () => {
    const address = 'gameServerAddress';
    const port = 45678;
    const gameId = 'ABCD-EFGH';

    let sandbox;
    let SocketReceiver;
    let socketReceiver;
    let fakeWebSocket;
    let fakeConnection;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();

        SocketReceiver = require('../../src/Common/SocketReceiver');

        socketReceiver = new SocketReceiver({
            address,
            port,
            gameId
        });

        fakeWebSocket = {
            send: () => {},
            onopen: () => {},
            onmessage: () => {},
            onerror: () => {},
            onclose: () => {}
        };

        fakeConnection = {
            name: 'MyFakeConnectionName'
        };

        sandbox.stub(socketReceiver, 'log');
    });

    afterEach(() => {
        sandbox.verify();
        sandbox.restore();
    });

    describe('#constructor', () => {
        it('should configure the game server\'s address', () => {
            assert.strictEqual(socketReceiver._options.address, address);
        });

        it('should configure the game server\'s port', () => {
            assert.strictEqual(socketReceiver._options.port, port);
        });

        it('should configure the game\'s id', () => {
            assert.strictEqual(socketReceiver._options.gameId, gameId);
        });
    });

    describe('#start', () => {
        it('should attempt to establish a web socket connection with the configured server', () => {
            sandbox.mock(socketReceiver)
                .expects('_newWebSocket')
                .withExactArgs(`ws://${address}:${port}`)
                .once()
                .returns(fakeWebSocket);

            socketReceiver.start();
        });
    });

    describe('#send', () => {
        beforeEach(() => {
            sandbox.stub(socketReceiver, '_newWebSocket')
                .returns(fakeWebSocket);

            socketReceiver.start();
        });

        it('should attempt to send the message over the web socket', () => {
            const expectedMessage = 'This is my message';
            sandbox.mock(fakeWebSocket)
                .expects('send')
                .once()
                .withExactArgs(expectedMessage);

            socketReceiver.send(expectedMessage);
        });
    });

    describe('#_onOpen', () => {
        it('should register the net event handler on the connection', () => {
            sandbox.stub(socketReceiver, 'send');
            sandbox.mock(socketReceiver._netEvents)
                .expects('add')
                .withExactArgs(socketReceiver)
                .once();

            socketReceiver._onOpen();
        });

        it('should send a "JOIN" message', () => {
            sandbox.mock(socketReceiver)
                .expects('send')
                .withExactArgs(`JOIN ${gameId}`)
                .once();

            socketReceiver._onOpen();
        });

        it('should raise an "open" event', (done) => {
            sandbox.stub(socketReceiver, 'send');

            socketReceiver.on('open', () => {
                done();
            });

            socketReceiver._onOpen();
        });
    });

    describe('when joined', () => {        
        it('should send a "NAME" message when joined', () => {
            const receiverMock = sandbox.mock(socketReceiver);

            receiverMock
                .expects('send')
                .withExactArgs(`JOIN ${gameId}`)
                .once();
            receiverMock
                .expects('send')
                .withExactArgs(`NAME Player_${fakeConnection.name}`)
                .once();

            socketReceiver._onOpen();

            socketReceiver._netEvents.emit('JOINED', fakeConnection);
        });
    });

    describe('#_onMessage', () => {
        beforeEach(() => {
            sandbox.stub(socketReceiver, '_newWebSocket')
                .returns(fakeWebSocket);

            socketReceiver.start();
        });
        
        it('should raise a "text" event on receiving a message', (done) => {
            const expectedMessage = 'This is an incoming message';

            socketReceiver.on('text', (message) => {
                assert.strictEqual(message, expectedMessage);
                done();
            });

            socketReceiver._ws.onmessage({ data: expectedMessage });
        });
    });

    describe('#_onError', () => {
        beforeEach(() => {
            sandbox.stub(socketReceiver, '_newWebSocket')
                .returns(fakeWebSocket);

            socketReceiver.start();
        });
        
        it.only('should raise an "error" event on the connection erroring', (done) => {
            const expectedError = 'This is an error';

            socketReceiver.on('error', (error) => {
                assert.strictEqual(error, expectedError);
                done();
            });

            socketReceiver._ws.onerror({ error: expectedError });
        });
    });

    describe('#_onClose', () => {
        it('should raise a "close" event on the connection closing');
    });
});
