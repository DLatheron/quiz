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

    function newGameServerNoLogging(options) {
        const gameServer = new GameServer(options);
        sandbox.stub(gameServer, 'log');
        return gameServer;
    }

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
            on: sandbox.stub(),
            socket: {
                remoteAddress: '127.0.0.1',
                remotePort: 45298
            },
            sendText: () => {},
            removeListener: () => {}
        };

        fakeConnection2 = {
            on: sandbox.stub(),
            socket: {
                remoteAddress: '127.0.0.1',
                remotePort: 63427
            },
            sendText: () => {},
            removeListener: () => {}
        };

        fakeConnection3 = {
            on: sandbox.stub(),
            socket: {
                remoteAddress: '127.0.0.1',
                remotePort: 34722
            },
            sendText: () => {},
            removeListener: () => {}
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

            gameServer = newGameServerNoLogging();

            assert.strictEqual(gameServer.options.externalIPAddress, 'localhost');
        });

        it('should override the external IP address if supplied', () => {
            const expectedAddress = 'someIPAddressOrHost';
            sandbox.stub(ws, 'createServer').returns(fakeServer);

            gameServer = newGameServerNoLogging({ externalIPAddress: expectedAddress });

            assert.strictEqual(gameServer.options.externalIPAddress, expectedAddress);
        });

        it('should default the port to undefined', () => {
            sandbox.stub(ws, 'createServer').returns(fakeServer);

            gameServer = newGameServerNoLogging();

            assert.strictEqual(gameServer.options.port, undefined);
        });

        it('should override the port if supplied', () => {
            const expectedPort = 28432;
            sandbox.stub(ws, 'createServer').returns(fakeServer);

            gameServer = newGameServerNoLogging({ port: expectedPort });

            assert.strictEqual(gameServer.options.port, expectedPort);
        });

        it('should default the initial timeout to 60 seconds', () => {
            sandbox.stub(ws, 'createServer').returns(fakeServer);

            gameServer = newGameServerNoLogging();

            assert.strictEqual(gameServer.options.initialTimeout, 60000);
        });

        it('should override the initial timeout if supplied', () => {
            const expectedTimeout = 45273;
            sandbox.stub(ws, 'createServer').returns(fakeServer);

            gameServer = newGameServerNoLogging({ initialTimeout: expectedTimeout });

            assert.strictEqual(gameServer.options.initialTimeout, expectedTimeout);
        });

        it('should default the idle timeout to 30 seconds', () => {
            sandbox.stub(ws, 'createServer').returns(fakeServer);

            gameServer = newGameServerNoLogging();

            assert.strictEqual(gameServer.options.idleTimeout, 30000);
        });

        it('should override the idle timeout if supplied', () => {
            const expectedTimeout = 85276;
            sandbox.stub(ws, 'createServer').returns(fakeServer);

            gameServer = newGameServerNoLogging({ idleTimeout: expectedTimeout });

            assert.strictEqual(gameServer.options.idleTimeout, expectedTimeout);
        });

        it('should create the net events handler', () => {
            sandbox.stub(ws, 'createServer').returns(fakeServer);

            gameServer = newGameServerNoLogging();

            assert(gameServer.netEvents);
        });

        it('should create a web socket server', () => {
            sandbox.mock(ws)
                .expects('createServer')
                .once()
                .withExactArgs(sinon.match.object, sinon.match.func)
                .returns(fakeServer);

            gameServer = newGameServerNoLogging();
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
            
            gameServer = newGameServerNoLogging({ initialTimeout: expectedTimeout });
        });        
    });

    describe('#BuildAddress', () => {
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
            gameServer = newGameServerNoLogging({ port: expectedPort });

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

    describe('connection', () => {
        const expectedPort = 52683;
        const idleTimeout = 32514;

        let createServerStub;
        let gameServer;

        function simulateFakeConnection(connection) {
            fakeServer.connections.push(connection);
            createServerStub.yield(connection);
        }

        function simulateFakeDisconnection(connection) {
            const index = fakeServer.connections.indexOf(connection);
            fakeServer.connections.splice(index, 1);
            connection.on.yield('close');
        }

        beforeEach((done) => {
            createServerStub = sandbox.stub(ws, 'createServer')
                .returns(fakeServer);
            sandbox.stub(global, 'setTimeout')
                .callsFake((func, timeout) => { 
                    fakeTimer.callback = func;
                    fakeTimer.timeout = timeout;
                    return fakeTimer; 
                });

            gameServer = newGameServerNoLogging({ 
                port: expectedPort,
                idleTimeout: idleTimeout
            });

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

        describe('#_clientConnected', () => {
            beforeEach(() => {
            });

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
                simulateFakeConnection(fakeConnection);
                simulateFakeConnection(fakeConnection2);
                simulateFakeConnection(fakeConnection3);
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

            it('should inform other clients', () => {
                sandbox.mock(gameServer)
                    .expects('broadcast')
                    .withExactArgs(sinon.match.string)
                    .once();

                simulateFakeDisconnection(fakeConnection2);
            });

            it('should deregister the connection from events', () => {
                sandbox.mock(gameServer._netEvents)
                    .expects('remove')
                    .withExactArgs(fakeConnection3)
                    .once();

                simulateFakeDisconnection(fakeConnection3);
            });

            it('should raise a \'clientDisconnected\' event', () => {
                sandbox.mock(gameServer)
                    .expects('emit')
                    .withExactArgs(
                        'clientDisconnected',
                        fakeConnection
                    )
                    .once();

                simulateFakeDisconnection(fakeConnection);
            });

            it('should start the idle timeout if there are no more connections', () => {
                simulateFakeDisconnection(fakeConnection2);
                simulateFakeDisconnection(fakeConnection3);

                assert(!gameServer._timeout);
                simulateFakeDisconnection(fakeConnection);
                assert(gameServer._timeout);
                assert.strictEqual(gameServer._timeout.timeout, idleTimeout);
            });
        });

        describe('timeouts', () => {
            const initialTimeout = 10000;
            const idleTimeout = 5000;

            let clock;

            beforeEach(() => {
                clock = sinon.useFakeTimers();

                gameServer = newGameServerNoLogging({ 
                    initialTimeout: initialTimeout,
                    idleTimeout: idleTimeout
                });
            });

            afterEach(() => {
                clock.restore();
            });

            it('should raise an idle timeout event if no connections are made before the initial timeout expires', () => {
                sandbox.mock(gameServer)
                    .expects('emit')
                    .withExactArgs('IdleTimeout')
                    .once();

                clock.tick(initialTimeout);

                assert.strictEqual(clock.now, initialTimeout);
            });

            it('should raise an idle timeout event after connections have been lost and not remade within the idle timeout period', () => {
                simulateFakeConnection(fakeConnection);
                simulateFakeDisconnection(fakeConnection);

                sandbox.mock(gameServer)
                    .expects('emit')
                    .once();

                clock.tick(idleTimeout); 

                assert.strictEqual(clock.now, idleTimeout);
            });
        });        
    });

    describe('#stop', () => {
        it('should close the server', () => {
            const gameServer = newGameServerNoLogging();

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
            gameServer = newGameServerNoLogging();

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
            gameServer = newGameServerNoLogging();
            
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
