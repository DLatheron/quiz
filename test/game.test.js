/* globals require, describe, it, beforeEach */
'use strict';

const assert = require('assert');
const game = require('../src/game');

describe('#game', () => {
    const minPlayers = 2;
    const maxPlayers = 4;

    let gameUnderTest;

    beforeEach(() => {
        gameUnderTest = game({
            minPlayers: minPlayers,
            maxPlayers: maxPlayers
        });
    });

    describe('#minPlayers', () => {
        it('should assign a minimum number of players', () => {
            assert.strictEqual(gameUnderTest.minPlayers, minPlayers);
        });
    });

    describe('#maxPlayers', () => {
        it('should assign a maximum number of players', () => {
            assert.strictEqual(gameUnderTest.maxPlayers, maxPlayers);
        });
    });

    describe('#gameId', () => {
        it('should assign a game id', () => {
            assert.strictEqual(typeof gameUnderTest.gameId, 'string');
        });

        it('should check to ensure database to ensure that the game id is unique');
        it('should write the game to the database');
    });

    describe('#gameStatus', () => {
        it('should start with the status "lobby"');
    });

    describe('#canStart', () => {
        it('should return false if minimum players are not present');
        it('should return true once minimum players are present');
    });

    describe('#addPlayer', () => {
        it('should add a player to the game');
        it('should not add a player if the maximum players count would be exceeded');
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