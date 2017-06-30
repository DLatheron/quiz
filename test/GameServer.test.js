/* globals describe, it, beforeEach, afterEach */
'use strict';

const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const ws = require('nodejs-websocket');

describe('#GameServer', () => {
    let sandbox;
    let GameServer;
    let gameServer; // Avoids warnings about assignment only for side-effects.
    let fakeServer;
    let fakeConnection;
    let fakeConnection2;
    let fakeConnection3;
    let fakeTimer;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();

        fakeServer = {
            listen: () => {},
            on: () => {},
            connections: []
        };

        fakeTimer = {
        };

        fakeConnection = {
            on: () => {},
            socket: {
                remoteAddress: '127.0.0.1',
                remotePort: 45298
            },
            sendText: () => {}
        };

        fakeConnection2 = {
            on: () => {},
            socket: {
                remoteAddress: '127.0.0.1',
                remotePort: 63427
            },
            sendText: () => {}
        };

        fakeConnection3 = {
            on: () => {},
            socket: {
                remoteAddress: '127.0.0.1',
                remotePort: 34722
            },
            sendText: () => {}
        };

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
            sandbox.stub(ws, 'createServer').returns(fakeServer);

            gameServer = new GameServer();

            assert.strictEqual(gameServer.options.externalIPAddress, 'localhost');
        });

        it('should override the external IP address if supplied', () => {
            const expectedAddress = 'someIPAddressOrHost';
            sandbox.stub(ws, 'createServer').returns(fakeServer);

            gameServer = new GameServer({ externalIPAddress: expectedAddress });

            assert.strictEqual(gameServer.options.externalIPAddress, expectedAddress);
        });

        it('should default the port to undefined', () => {
            sandbox.stub(ws, 'createServer').returns(fakeServer);

            gameServer = new GameServer();

            assert.strictEqual(gameServer.options.port, undefined);
        });

        it('should override the port if supplied', () => {
            const expectedPort = 28432;
            sandbox.stub(ws, 'createServer').returns(fakeServer);

            gameServer = new GameServer({ port: expectedPort });

            assert.strictEqual(gameServer.options.port, expectedPort);
        });

        it('should default the initial timeout to 60 seconds', () => {
            sandbox.stub(ws, 'createServer').returns(fakeServer);

            gameServer = new GameServer();

            assert.strictEqual(gameServer.options.initialTimeout, 60000);
        });

        it('should override the initial timeout if supplied', () => {
            const expectedTimeout = 45273;
            sandbox.stub(ws, 'createServer').returns(fakeServer);

            gameServer = new GameServer({ initialTimeout: expectedTimeout });

            assert.strictEqual(gameServer.options.initialTimeout, expectedTimeout);
        });

        it('should default the idle timeout to 30 seconds', () => {
            sandbox.stub(ws, 'createServer').returns(fakeServer);

            gameServer = new GameServer();

            assert.strictEqual(gameServer.options.idleTimeout, 30000);
        });

        it('should override the idle timeout if supplied', () => {
            const expectedTimeout = 85276;
            sandbox.stub(ws, 'createServer').returns(fakeServer);

            gameServer = new GameServer({ idleTimeout: expectedTimeout });

            assert.strictEqual(gameServer.options.idleTimeout, expectedTimeout);
        });

        it('should create the net events handler', () => {
            sandbox.stub(ws, 'createServer').returns(fakeServer);

            gameServer = new GameServer();

            assert(gameServer.netEvents);
        });

        it('should create a web socket server', () => {
            sandbox.mock(ws)
                .expects('createServer')
                .once()
                .withExactArgs(sinon.match.object, sinon.match.func)
                .returns(fakeServer);

            gameServer = new GameServer();
        });

        it('should start a timer with the value of the initial timeout', () => {
            const expectedTimeout = 87653;
            sandbox.stub(ws, 'createServer').returns(fakeServer);
            sandbox.mock(global)
                .expects('setTimeout')
                .withExactArgs(
                    sinon.match.func,
                    expectedTimeout
                )
                .once();
            
            gameServer = new GameServer({ initialTimeout: expectedTimeout });
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
            sandbox.stub(gameServer, 'log');
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

    describe('#_clientConnected', () => {
        const expectedPort = 52683;

        let createServerStub;
        let gameServer;

        beforeEach((done) => {
            createServerStub = sandbox.stub(ws, 'createServer')
                 .returns(fakeServer);
            sandbox.stub(global, 'setTimeout')
                .returns(fakeTimer);

            gameServer = new GameServer({ port: expectedPort });
            gameServer.server.socket = {
                address: () => { 
                    return { port: expectedPort }; 
                }
            };

            sandbox.stub(gameServer.server, 'on')
                .withArgs('listening')
                .yields();

            gameServer.start(done);
        });

        function simulateFakeConnection(connection) {
            fakeServer.connections.push(connection);
            createServerStub.yield(connection);
        }

        it('should set the connection\'s address', () => {
            sandbox.stub(gameServer, 'broadcast');            
            
            simulateFakeConnection(fakeConnection);

            assert.strictEqual(fakeConnection.address, '127.0.0.1:45298');
        });

        it('should set the connection\'s default name', () => {
            sandbox.stub(gameServer, 'broadcast');            

            simulateFakeConnection(fakeConnection);

            assert.strictEqual(fakeConnection.name, '127.0.0.1:45298');
        });

        it('should cancel any timeouts if this is the first connection', () => {
            sandbox.stub(gameServer, 'broadcast');            

            sandbox.mock(global)
                .expects('clearTimeout')
                .withExactArgs(gameServer._timeout)
                .once();

            simulateFakeConnection(fakeConnection);

            assert.strictEqual(gameServer._timeout, undefined);
        });

        it('should not have any timeouts to cancel if there are other connections', () => {
            sandbox.stub(gameServer, 'broadcast');            
            simulateFakeConnection(fakeConnection);
            sandbox.mock(global)
                .expects('clearTimeout')
                .never();

            simulateFakeConnection(fakeConnection2);

            assert(!gameServer._timeout);
        });

        it('should notify other connections', () => {
            simulateFakeConnection(fakeConnection);
            simulateFakeConnection(fakeConnection2);
            sandbox.mock(gameServer)
                .expects('broadcast')
                .withExactArgs(
                    sinon.match.string,
                    fakeConnection3
                )
                .once();

            simulateFakeConnection(fakeConnection3);
        });

        it('should register the connection with the net events handler', () => {
            sandbox.mock(gameServer.netEvents)
                .expects('add')
                .once();
            
            createServerStub.yield(fakeConnection);
        });

        it('should raise a \'clientConnected\' event', () => {
            sandbox.mock(gameServer)
                .expects('emit')
                .withArgs(
                    'clientConnected',
                    fakeConnection
                )
                .once();

            createServerStub.yield(fakeConnection);
        });
    });

    describe('when a client disconnected', () => {
        beforeEach(() => {
            // TODO: Set up a number of fake connections.
        });

        // it('should deregister closed connections from the net events handler', () => {
        //     sandbox.mock(gameServer.netEvents)
        //         .expects('remove')
        //         .once();
        //     sandbox.stub(fakeConnection, 'on')
        //         .withArgs('close')
        //         .yields();

        //     createServerStub.yield(fakeConnection);
        // });


        it('should inform other clients');
        it('should deregister the connection from events');
        it('should raise a \'clientDisconnected\' event');
    });

    describe('#stop', () => {
        it('should close the server', () => {
            const gameServer = new GameServer();

            sandbox.mock(gameServer.server)
                .expects('close')
                .once();

            gameServer.stop();
        });
    });

    describe('#broadcast', () => {
        const expectedMessage = 'This is a message';
        let fakeConnections;
        let gameServer;

        beforeEach(() => {
            gameServer = new GameServer();

            fakeConnections = [
                { sendText: () => {} },
                { sendText: () => {} },
                { sendText: () => {} },
                { sendText: () => {} }
            ];

            gameServer.server.connections = fakeConnections;                
        });

        it('should send a message to all connections', () => {
            fakeConnections.forEach((connection) => {
            sandbox.mock(connection)
                .expects('sendText')
                .once()
                .withExactArgs(expectedMessage);
            });

            gameServer.broadcast(expectedMessage);
        });

        it('should not send a message to an excluded connection', () => {
            [0, 1, 3].forEach((index) => {
                sandbox.mock(fakeConnections[index])
                    .expects('sendText')
                    .once()
                    .withExactArgs(expectedMessage);
            });

            gameServer.broadcast(expectedMessage, fakeConnections[2]);            
        });
    });
    
    describe('#send', () => {
        const expectedMessage = 'This is a message';
        let fakeConnection;
        let gameServer;

        beforeEach(() => {
            gameServer = new GameServer();
            fakeConnection = { sendText: () => {} };
        });
        
        it('should send a text message via the connection', () => {
            sandbox.mock(fakeConnection)
                .expects('sendText')
                .once()
                .withExactArgs(expectedMessage);

            gameServer.send(fakeConnection, expectedMessage);
        });
    });
});
