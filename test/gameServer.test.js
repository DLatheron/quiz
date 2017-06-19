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
                GameServer.BuildAddress(expectedAddress, expectedPort),
                `${expectedAddress}:${expectedPort}`
            );
        });
    });

    describe('#start', () => {
        const expectedError = {
            message: 'An error occurred'
        };
        const expectedPort = 52683;

        let gameServer;

        beforeEach(() => {
            gameServer = new GameServer({ port: expectedPort });
            gameServer.server.socket = {
                address: () => { 
                    return { port: expectedPort }; 
                }
            };
        });
        
        it('should set the server listening', () => {
            sandbox.mock(gameServer.server)
                .expects('listen')
                .once()
                .withExactArgs(expectedPort);
            
            gameServer.start();
        });

        it('should callback when the server starts listening', (done) => {
            sandbox.mock(gameServer.server)
                .expects('listen')
                .once()
                .withExactArgs(expectedPort);
            gameServer.start(done);

            gameServer.server.emit('listening');
        });

        it('should report an error if there is a failure', (done) => {
            sandbox.stub(gameServer.server, 'listen');

            gameServer.start((error) => {
                assert.strictEqual(error, expectedError);
                done();
            });

            gameServer.server.emit('error', expectedError);
        });
    });

    describe('when a client connects', () => {
        const expectedPort = 52683;

        let fakeConnection;
        let fakeServer;
        let createServerStub;
        let gameServer;

        beforeEach((done) => {
            fakeConnection = {
                on: () => {},
                socket: {
                    remoteAddress: '127.0.0.1',
                    remotePort: 45298
                },
                sendText: () => {}
            };

            fakeServer = {
                listen: () => {},
                on: () => {}
            };  

            createServerStub = sandbox.stub(ws, 'createServer')
                 .returns(fakeServer);

            gameServer = new GameServer({ port: expectedPort });
            gameServer.server.socket = {
                address: () => { 
                    return { port: expectedPort }; 
                }
            };

            sandbox.stub(gameServer.server, 'on')
                .withArgs('listening')
                .yields();
            sandbox.stub(gameServer, 'broadcast');            

            gameServer.start(done);
        });        
        
        it('should register connections with the net events handler', () => {
            sandbox.mock(gameServer.netEvents)
                .expects('add')
                .once();
            
            createServerStub.yield(fakeConnection);
        });

        it('should deregister closed connections from the net events handler', () => {
            sandbox.mock(gameServer.netEvents)
                .expects('remove')
                .once();
            sandbox.stub(fakeConnection, 'on')
                .withArgs('close')
                .yields();

            createServerStub.yield(fakeConnection);
        });
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
