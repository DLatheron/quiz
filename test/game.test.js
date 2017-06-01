/* globals require, describe, it, context, beforeEach, afterEach */
'use strict';

const assert = require('assert');
const game = require('../src/game');
const sinon = require('sinon');

describe('#game', () => {
    const minPlayers = 2;
    const maxPlayers = 4;

    let sandbox;
    let fakeDb;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();

        fakeDb = {
            newGame: () => assert.fail() //(gameId, callback) => callback(null, gameId)
        };
    });

    afterEach(() => {
        sandbox.verify();
        sandbox.restore();
    });

    describe('#minPlayers', (done) => {
        it('should assign a minimum number of players', (done) => {
            sinon.stub(fakeDb, 'newGame').yields(null, 'gameId');

            game(fakeDb, {
                minPlayers: minPlayers,
            }, (error, game) => {
                assert.strictEqual(game.minPlayers, minPlayers);
                done(error);
            });
        });
    });

    describe('#maxPlayers', (done) => {
        it('should assign a maximum number of players', (done) => {
            sinon.stub(fakeDb, 'newGame').yields(null, 'gameId');

            game(fakeDb, {
                maxPlayers: maxPlayers
            }, (error, game) => {
                assert.strictEqual(game.maxPlayers, maxPlayers);
                done(error);
            });
        });
    });

    describe('#gameId', (done) => {
        it('should create a game', (done) => {
            sinon.stub(fakeDb, 'newGame').yields();

            game(fakeDb, (error, game) => {
                assert(game, 'game not created');
                done(error);
            });
        });

        it('should assign a game id', (done) => {
            sinon.stub(fakeDb, 'newGame').yields(null, 'gameId');

            game(fakeDb, (error, game) => {
                assert.strictEqual(game.gameId, 'gameId');
                done(error);
            });
        });

        it('should retry until it gets a unique id', (done) => {
            sinon.stub(fakeDb, 'newGame')
                .onCall(0).yields('game already exists')
                .onCall(1).yields('game already exists')
                .onCall(2).yields('game already exists')
                .onCall(3).yields(null, 'newGameId');

            game(fakeDb, {
                maxRetries: 3
            }, (error, game) => {
                assert.strictEqual(game.gameId, 'newGameId');
                done(error);
            });
        });

        it('should report an error if the game cannot be created', (done) => {
            sinon.stub(fakeDb, 'newGame')
                .onCall(0).yields('game already exists')
                .onCall(1).yields('game already exists')
                .onCall(2).yields('game already exists');

            game(fakeDb, {
                maxRetries: 2
            }, (error, game) => {
                assert.strictEqual(error, 'game already exists');
                done(!error);
            });            
        });

        it('should check to ensure database to ensure that the game id is unique');
        it('should write the game to the database');
    });

    context('game created', () => {
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

        let gameUnderTest;

        beforeEach((done) => {
            sinon.stub(fakeDb, 'newGame').yields();

            game(fakeDb, {
                minPlayers: 2,
                maxPlayers: 4
            }, (error, game) => {
                gameUnderTest = game;
                done(error);
            });            
        });

        describe('#gameStatus', () => {
            it('should start with the status "lobby"', () => {
                assert.strictEqual(gameUnderTest.status, 'lobby');
            });
        });

        describe('#addPlayer', () => {
            it('should start with zero players', () => {
                assert.strictEqual(gameUnderTest.numPlayers, 0);
            });

            it('should return true if a player was added to the game', () => {
                assert(gameUnderTest.addPlayer(player1), 'player could not be added to the game');
            });

            it('should add a player to the game', () => {
                gameUnderTest.addPlayer(player1);
                assert.strictEqual(gameUnderTest.numPlayers, 1);
            });

            it('should return false if a player.id is added more than once');
            it('should rnot add the player if the player.id added more than once');

            context('with a full game', () => {
                beforeEach(() => {
                    gameUnderTest.addPlayer(player1);
                    gameUnderTest.addPlayer(player2);
                    gameUnderTest.addPlayer(player3);
                    gameUnderTest.addPlayer(player4);
                });

                it('should return false if a player could not be added to the game', () => {
                    assert.strictEqual(gameUnderTest.addPlayer(player5), false);
                });

                it('should not add a player if the maximum players count would be exceeded', () => {
                    gameUnderTest.addPlayer(player5);
                    assert.strictEqual(gameUnderTest.numPlayers, 4);
                });
            });
        });

        describe('#getPlayer', () => {
            beforeEach(() => {
                gameUnderTest.addPlayer(player1);
                gameUnderTest.addPlayer(player2);
                gameUnderTest.addPlayer(player3);
                gameUnderTest.addPlayer(player4);
            });
            
            it('should return the player if they are present', () => {
                assert.deepStrictEqual(gameUnderTest.getPlayer(player3.id), player3);
            });

            it('should return undefined if the player is not found', () => {
                assert.deepStrictEqual(gameUnderTest.getPlayer(player5.id), undefined);
            });
        });

        describe('#canStart', () => {
            it('should return false if there are no player present', () => {
                assert.strictEqual(gameUnderTest.canStart, false);
            });

            it('should return false if minimum players are not present', () => {
                gameUnderTest.addPlayer(player1);
                assert.strictEqual(gameUnderTest.canStart, false);
            });

            it('should return true once minimum players are present', () => {
                gameUnderTest.addPlayer(player1);
                gameUnderTest.addPlayer(player2);
                assert.strictEqual(gameUnderTest.canStart, true);
            });
        });

        describe('#removePlayer', () => {
            beforeEach(() => {
                gameUnderTest.addPlayer(player1);
                gameUnderTest.addPlayer(player2);
                gameUnderTest.addPlayer(player3);
                gameUnderTest.addPlayer(player4);
            });

            it('should return true if it removes the requested player', () => {
                assert.strictEqual(gameUnderTest.removePlayer(player3), true);
            });

            it('should remove the requested player', () => {
                gameUnderTest.removePlayer(player3.id);
                assert.strictEqual(gameUnderTest.getPlayer(player3.id, undefined));
            });

            it('should return false if the player cannot be removed', () => {
                assert.strictEqual(gameUnderTest.removePlayer(player5), false);
            });

            it('should leave players unchanged if the player does not exist', () => {
                gameUnderTest.removePlayer(player5);
                assert.strictEqual(gameUnderTest.numPlayers, 4);
            });
        });

        describe('#start', () => {
            it('should throw if the game cannot start', () => {
                gameUnderTest.addPlayer(player1);
                assert.throws(() => {
                    gameUnderTest.start();
                });
            });

            it('should set the status to "playing" if the game can start', () => {
                gameUnderTest.addPlayer(player1);
                gameUnderTest.addPlayer(player2);
                gameUnderTest.start();
                assert.strictEqual(gameUnderTest.status, 'playing');
            });
        });

        describe('#stop', () => {
            beforeEach(() => {
                gameUnderTest.addPlayer(player1);
                gameUnderTest.addPlayer(player2);
                gameUnderTest.start();
            });

            it('should set the status to "lobby"', () => {
                gameUnderTest.stop();
                assert.strictEqual(gameUnderTest.status, 'lobby');
            });

            it('should remove the game from the database');
        });
    });
});