/* globals require, describe, it, context, beforeEach, afterEach */
'use strict';

// Game
// - registers automatically - as before...
//   - this needs a rewrite...
//   - cannot addPlayer, but can removePlayer.


const assert = require('assert');
//const proxyquire = require('proxyquire');
const sinon = require('sinon');

describe('#game', () => {
    const minPlayers = 2;
    const maxPlayers = 4;
    const player1 = { 
        id: 'p1',
        name: 'Player 1'
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
            storeGame: () => assert.fail()
        };

        Game = require('../src/Game');
    });

    afterEach(() => {
        sandbox.verify();
        sandbox.restore();
    });

    describe('#minPlayers', () => {
        it('should assign a minimum number of players', () => {
            sandbox.stub(fakeDb, 'newGame').yields(null, 'insert successful');
            sandbox.stub(fakeDb, 'storeGame').callsFake((game, callback) => callback(null, game));

            game = new Game(fakeDb, {
                minPlayers: minPlayers,
            });
            
            assert.strictEqual(game.minPlayers, minPlayers);
        });
    });

    describe('#maxPlayers', (done) => {
        it('should assign a maximum number of players', () => {
            sandbox.stub(fakeDb, 'newGame').yields(null, 'insert successful');
            sandbox.stub(fakeDb, 'storeGame').callsFake((game, callback) => callback(null, game));

            game = new Game(fakeDb, {
                maxPlayers: maxPlayers
            });

            assert.strictEqual(game.maxPlayers, maxPlayers);
        });
    });

    describe('#start', () => {
        beforeEach(() => {
            game = new Game(fakeDb, {
                maxRetries: 3
            });
            game.addPlayer(player1);
        });

        it('should check that the game can be created in the database', (done) => {
            sandbox.mock(fakeDb).expects('newGame').once().yields();
            sandbox.stub(fakeDb, 'storeGame').callsFake((game, callback) => callback(null, game));

            game.start(done);
        });

        it('should create a game', (done) => {
            sandbox.stub(fakeDb, 'newGame').yields();
            sandbox.stub(fakeDb, 'storeGame').callsFake((game, callback) => callback(null, game));

            game.start((error, game) => {
                assert(game, 'game not created');
                done(error);
            });
        });

        it('should assign a game id', (done) => {
            sandbox.stub(fakeDb, 'newGame').yields(null, 'gameId');
            sandbox.stub(fakeDb, 'storeGame').callsFake((game, callback) => callback(null, game));

            game.start((error, game) => {
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

            game.start((error, game) => {
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

            game.start((error, game) => {
                assert.strictEqual(error, 'game already exists');
                done(!error);
            });            
        });

        it('should write the built game to the database', (done) => {
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

            game.start(done);
        });
    });

    context('game created', () => {
        beforeEach(() => {
            sandbox.stub(fakeDb, 'newGame').yields();
            sandbox.stub(fakeDb, 'storeGame').callsFake((game, callback) => callback(null, game));

            game = new Game(fakeDb, {
                minPlayers: 2,
                maxPlayers: 4
            });           
        });

        describe('#gameStatus', () => {
            it('should report undefined when initially created', () => {
                assert.strictEqual(game.status, undefined);
            });

            it('should report "lobby" once started', (done) => {
                game.start(() => {
                    assert.strictEqual(game.status, 'lobby');
                    done();
                });
            });

            it('should report "ended" once stopped', (done) => {
                game.start(() => {
                    game.stop();
                    assert.strictEqual(game.status, 'ended');
                    done();
                });
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

            it('should return false if a player.id is added more than once');
            it('should rnot add the player if the player.id added more than once');

            context('with a full game', () => {
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

            it('should set the status to "playing" if the game can start', () => {
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

            it('should set the status to "lobby"', () => {
                game.stop();
                assert.strictEqual(game.status, 'lobby');
            });

            it('should remove the game from the database');
        });
    });
});