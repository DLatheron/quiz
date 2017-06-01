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
            name: 'Player 1'
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

            it('should return false if a player could not be added to the game');
            it('should not add a player if the maximum players count would be exceeded');
        });

        describe('#canStart', () => {
            it('should return false if minimum players are not present');
            it('should return true once minimum players are present');
        });

        describe('#removePlayer', () => {
            it('should remove the requested player');
            it('should leave players unchanged if the player does not exist');
        });

        describe('#start', () => {
            it('should not allow a game to start if there are insufficient players');
            it('should start a game if there are at least the minimum number of players');
        });

        describe('#stop', () => {
            it('should remove the game from the database');
        });
    });
});