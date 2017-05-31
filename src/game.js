/* globals module, require */
'use strict';

const randomString = require('./util/randomString');

function game(options) {
    const maxPlayers = options.maxPlayers || 32;
    const minPlayers = options.minPlayers || 1;
    const players = [];
    const gameId = generateUniqueGameId();

    function generateUniqueGameId() {
        const gameId = randomString({
            format: 'AA9A-AA9A'
        }).generate();

        return gameId;
    }

    function start() {
        if (canStart) {
            throw new Error('Unable to start game');
        }
    }

    function stop() {

    }

    function canStart() {
        return players.length >= minPlayers;
    }

    function addPlayer(player) {
        if (players.length < maxPlayers) {
            players.push(player);
            return true;
        } else {
            return false;
        }
    }

    function removePlayer(playerId) {
        const index = players.find((player) => player.id === playerId);
        if (index !== -1) {
            players.split(index, 1);
            return true;
        } else {
            return false;
        }
    }

    // How do we manage games - they need to be handled by sticky sessions.
    // We will need to 'spawn' a handling thread which deals with the timeouts etc.
    // That bit is going to be tricky!

    // Joining a game will involve looking up the gameId and then contacting the
    // appropriate server to join that game (direct IP address?). Load balanced via
    // sessions then direct connection to a game server's IP.

    // Player is an IP address, a uniquely generated ID (a Guid) and some other
    // transistory information about them - i.e. player name etc. We will allow
    // the changing of the name at any point.

    // Effectively the game is just the lobby portion of the game, once it becomes
    // status 'playing' then it will be handled via real-time comms...

    return {
        get minPlayers() {
            return minPlayers;
        },
        get maxPlayers() {
            return maxPlayers;
        },
        get gameId() {
            return gameId;
        },
        get status() {
            return 'lobby';
        },
        start,
        stop,
        canStart,
        addPlayer,
        removePlayer
    };
}

module.exports = game;
