/* globals describe, it, beforeEach, afterEach */
'use strict';

const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const ws = require('nodejs-websocket');

describe('#GameServer', () => {
    let sandbox;
    let GameServer;
    let gameServer;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        GameServer = proxyquire('../src/GameServer', {
            'nodejs-websocket': ws
        });
    });

    afterEach(() => {
        sandbox.verify();
        sandbox.restore();
    });

    describe('#constructor', () => {
        it('should default the external IP address to localhost', () => {
            gameServer = new GameServer();

            assert.strictEqual(gameServer.externalIPAddress, 'localhost');
        });

        it('should override the external IP address if supplied', () => {
            const expectedAddress = 'someIPAddressOrHost';
            gameServer = new GameServer({ externalIPAddress: expectedAddress });

            assert.strictEqual(gameServer.externalIPAddress, expectedAddress);
        });

        it('should default the port to 0', () => {
            gameServer = new GameServer();

            assert.strictEqual(gameServer.port, undefined);
        });

        it('should override the port if supplied', () => {
            const expectedPort = 28432;
            gameServer = new GameServer({ port: expectedPort});

            assert.strictEqual(gameServer.port, expectedPort);
        });

        it('should create the net events handler', () => {
            gameServer = new GameServer();

            assert(gameServer.netEvents);
        });

        it('should create a web socket server', () => {
            sandbox.mock(ws)
                .expects('createServer')
                .once()
                .withExactArgs(sinon.match.object, sinon.match.func);
            gameServer = new GameServer();
        });
    });

    describe('#buildAddress', () => {
        it('should build an address from a hostname and port', () => {
            const expectedAddress = 'ipAddress';
            const expectedPort = 34691;
            
            assert.strictEqual(
                GameServer.buildAddress(expectedAddress, expectedPort),
                `${expectedAddress}:${expectedPort}`
            );
        });
    });

    describe('#start', () => {
        it('should set the server listening', () => {
            const expectedPort = 52683;
            gameServer = new GameServer({ port: expectedPort });
            sandbox.mock(gameServer.server)
                .expects('listen')
                .once()
                .withExactArgs(expectedPort);
            
            gameServer.start();
        });

        it('should callback when the server starts listening', (done) => {
            const expectedPort = 52683;
            gameServer = new GameServer({ port: expectedPort });
            sandbox.mock(gameServer.server)
                .expects('listen')
                .once()
                .withExactArgs(expectedPort);
            sandbox.stub(gameServer.server, 'socket')
                .returns({
                    address: () => { 
                        return { port: expectedPort }; 
                    }
                });
            
            gameServer.start(done);

            gameServer.server.emit('listening');
        });

        it('should report an error if there is a failure');
        it('should register connections with the net events handler');
        it('should deregister closed connections from the net events handler');
    });

    describe('#stop', () => {
        it('should close the server');
    });

    describe('#broadcast', () => {
        it('should send a message to all connections');
        it('should not send a message to an excluded connection');
    });
    
    describe('#send', () => {
        it('should send a text message via the connection');
    });
});
