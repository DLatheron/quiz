/* globals require, describe, it, beforeEach, afterEach */
'use strict';

// Game
// - registers automatically - as before...
//   - this needs a rewrite...
//   - cannot addPlayer, but can removePlayer.


const assert = require('assert');
const attemptWrapper = { attempt: require('attempt') };
const proxyquire = require('proxyquire');
const sinon = require('sinon');

describe('#game', () => {
    const minPlayers = 2;
    const maxPlayers = 4;
    const externalIPAddress = 'external IP address';
    const port = 49652;
    const maxRetries = 4;
    const player1 = { 
        id: 'p1',
        name: 'Player 1'
    };
    const playerWithPlayer1sId = {
        id: 'p1',
        name: 'Player with the same id as Player 1'
    };
    const player2 = { 
        id: 'p2',
        name: 'Player 2'
    };
    const player3 = { 
        id: 'p3',
        name: 'Player 3'
    };     
    const player4 = { 
        id: 'p4',
        name: 'Player 4'
    };
    const player5 = { 
        id: 'p5',
        name: 'Player 5'
    };    

    let sandbox;
    let fakeDb;
    let Game;
    let game;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        fakeDb = {
            newGame: () => assert.fail(),
            storeGame: () => assert.fail(),
            removeGame: () => assert.fail()
        };

        Game = proxyquire('../src/Game', {
            attempt: (opts, func, done) => attemptWrapper.attempt(opts, func, done)
        });        
    });

    afterEach(() => {
        sandbox.verify();
        sandbox.restore();
    });

    describe('#constructor', () => {
        describe('before starting a game', () => {
            beforeEach(() => {
                sandbox.stub(attemptWrapper, 'attempt');
            });

            it('should assign a minimum number of players', () => {
                game = new Game(fakeDb, {
                    minPlayers: minPlayers,
                });
                
                assert.strictEqual(game.minPlayers, minPlayers);
            });

            it('should assign a maximum number of players', () => {
                game = new Game(fakeDb, {
                    maxPlayers: maxPlayers
                });

                assert.strictEqual(game.maxPlayers, maxPlayers);
            });

            it('should assign an external IP address', () => {
                game = new Game(fakeDb, {
                    externalIPAddress: externalIPAddress
                });

                assert.strictEqual(game.externalIPAddress, externalIPAddress);
            });

            it('should assign a port', () => {
                game = new Game(fakeDb, {
                    port: port
                });

                assert.strictEqual(game.port, port);
            });

            it('should assign the number of retries', () => {
                game = new Game(fakeDb, {
                    maxRetries: maxRetries
                });

                assert.strictEqual(game.maxRetries, maxRetries);
            });

            it('should start with no players', () => {
                game = new Game(fakeDb);

                assert.strictEqual(game.numPlayers, 0);
            });
        });

        describe('starting game', () => {
            it('should check that the game can be created in the database', (done) => {
                sandbox.mock(fakeDb).expects('newGame').once().yields();
                sandbox.stub(fakeDb, 'storeGame').callsFake((game, callback) => callback(null, game));

                game = new Game(fakeDb, done);
            });

            it('should create a game', (done) => {
                sandbox.stub(fakeDb, 'newGame').yields();
                sandbox.stub(fakeDb, 'storeGame').callsFake((game, callback) => callback(null, game));

                game = new Game(fakeDb, (error, game) => {
                    assert(game, 'game not created');
                    done(error);
                });
            });

            it('should assign a game id', (done) => {
                sandbox.stub(fakeDb, 'newGame').yields(null, 'gameId');
                sandbox.stub(fakeDb, 'storeGame').callsFake((game, callback) => callback(null, game));

                game = new Game(fakeDb, (error, game) => {
                    assert.strictEqual(typeof game._id, 'string');
                    done(error);
                });
            });

            it('should retry until it gets a unique id', (done) => {
                sandbox.stub(fakeDb, 'newGame')
                    .onCall(0).yields('game already exists')
                    .onCall(1).yields('game already exists')
                    .onCall(2).yields('game already exists')
                    .onCall(3).yields(null, 'newGameId');
                sandbox.stub(fakeDb, 'storeGame').callsFake((game, callback) => callback(null, game));

                game = new Game(fakeDb, {
                    maxRetries: 3
                }, (error, game) => {
                    assert.strictEqual(typeof game._id, 'string');
                    done(error);
                });
            });

            it('should report an error if the game cannot be created', (done) => {
                sandbox.stub(fakeDb, 'newGame')
                    .onCall(0).yields('game already exists')
                    .onCall(1).yields('game already exists')
                    .onCall(2).yields('game already exists')
                    .onCall(3).yields('game already exists');
                sandbox.stub(fakeDb, 'storeGame').callsFake((game, callback) => callback(null, game));

                game = new Game(fakeDb, {
                    maxRetries: 3
                }, (error, game) => {
                    assert.strictEqual(error, 'game already exists');
                    done(!error);
                });            
            });

            it('should write the game into the database', (done) => {
                sandbox.stub(fakeDb, 'newGame').yields();
                sandbox.mock(fakeDb)
                    .expects('storeGame')
                    .once()
                    .withExactArgs(sinon.match(
                        { 
                            _id: sinon.match.string, 
                            externalIPAddress: 'localhost', 
                            port: 0,
                            status: 'lobby' 
                        }), 
                        sinon.match.func
                    )
                    .callsFake((game, callback) => callback(null, game));

                game = new Game(fakeDb, done);
            });
        });
    });

    describe('game created', () => {
        beforeEach((done) => {
            sandbox.stub(fakeDb, 'newGame').yields();
            sandbox.stub(fakeDb, 'storeGame').callsFake((game, callback) => callback(null, game));

            game = new Game(fakeDb, {
                minPlayers: 2,
                maxPlayers: 4
            }, done);      
        });

        describe('#gameStatus', () => {
            it('should report \'lobby\' when initially created', () => {
                assert.strictEqual(game.status, 'lobby');
            });
        });

        describe('#addPlayer', () => {
            it('should start with zero players', () => {
                assert.strictEqual(game.numPlayers, 0);
            });

            it('should return true if a player was added to the game', () => {
                assert(game.addPlayer(player1), 'player could not be added to the game');
            });

            it('should add a player to the game', () => {
                game.addPlayer(player1);
                assert.strictEqual(game.numPlayers, 1);
            });

            it('should return false if a player.id is added more than once', () => {
                game.addPlayer(player1);
                assert.strictEqual(game.addPlayer(playerWithPlayer1sId), false);
            });

            it('should not add the player if the player.id added more than once', () => {
                game.addPlayer(player1);
                game.addPlayer(playerWithPlayer1sId);
                assert.strictEqual(game.numPlayers, 1);
            });

            describe('with a full game', () => {
                beforeEach(() => {
                    game.addPlayer(player1);
                    game.addPlayer(player2);
                    game.addPlayer(player3);
                    game.addPlayer(player4);
                });

                it('should return false if a player could not be added to the game', () => {
                    assert.strictEqual(game.addPlayer(player5), false);
                });

                it('should not add a player if the maximum players count would be exceeded', () => {
                    game.addPlayer(player5);
                    assert.strictEqual(game.numPlayers, 4);
                });
            });
        });

        describe('#getPlayer', () => {
            beforeEach(() => {
                game.addPlayer(player1);
                game.addPlayer(player2);
                game.addPlayer(player3);
                game.addPlayer(player4);
            });
            
            it('should return the player if they are present', () => {
                assert.deepStrictEqual(game.getPlayer(player3.id), player3);
            });

            it('should return undefined if the player is not found', () => {
                assert.deepStrictEqual(game.getPlayer(player5.id), undefined);
            });
        });

        describe('#canStart', () => {
            it('should return false if there are no player present', () => {
                assert.strictEqual(game.canStart, false);
            });

            it('should return false if minimum players are not present', () => {
                game.addPlayer(player1);
                assert.strictEqual(game.canStart, false);
            });

            it('should return true once minimum players are present', () => {
                game.addPlayer(player1);
                game.addPlayer(player2);
                assert.strictEqual(game.canStart, true);
            });
        });

        describe('#removePlayer', () => {
            beforeEach(() => {
                game.addPlayer(player1);
                game.addPlayer(player2);
                game.addPlayer(player3);
                game.addPlayer(player4);
            });

            it('should return true if it removes the requested player', () => {
                assert.strictEqual(game.removePlayer(player3), true);
            });

            it('should remove the requested player', () => {
                game.removePlayer(player3.id);
                assert.strictEqual(game.getPlayer(player3.id, undefined));
            });

            it('should return false if the player cannot be removed', () => {
                assert.strictEqual(game.removePlayer(player5), false);
            });

            it('should leave players unchanged if the player does not exist', () => {
                game.removePlayer(player5);
                assert.strictEqual(game.numPlayers, 4);
            });
        });

        describe('#start', () => {
            it('should throw if the game cannot start', () => {
                game.addPlayer(player1);
                assert.throws(() => {
                    game.start();
                });
            });

            it('should set the status to \'playing\' if the game can start', () => {
                game.addPlayer(player1);
                game.addPlayer(player2);
                game.start();
                assert.strictEqual(game.status, 'playing');
            });
        });

        describe('#stop', () => {
            beforeEach(() => {
                game.addPlayer(player1);
                game.addPlayer(player2);
                game.start();
            });

            it('should remove the game from the database', (done) => {
                sandbox.mock(game.db)
                    .expects('removeGame')
                    .once()
                    .withExactArgs(
                        game.gameId,
                        sinon.match.func
                    )
                    .yields();

                game.stop(done);
            });

            it('should report any database errors', (done) => {
                const expectedError = 'An error occurred';

                sandbox.stub(game.db, 'removeGame').yields(expectedError);

                game.stop((error) => {
                    assert.strictEqual(error, expectedError);
                    done();
                });
            });

            it('should report \'stopped\' once stopped', (done) => {
                sandbox.stub(game.db, 'removeGame').yields();

                game.stop(() => {
                    assert.strictEqual(game.status, 'stopped');
                    done();
                });
            });            
        });
    });
});