/* globals module, require */
'use strict';

const attempt = require('attempt');
const nconf = require('nconf');
const randomString = require('./util/randomString');
const _ = require('lodash');

class Game {
    constructor(db, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        options = options || {};

        this.db = db;
        this.externalIPAddress = options.externalIPAddress || 'localhost';
        this.port = options.port || 0;
        this.maxRetries = (options.maxRetries !== undefined) ? options.maxRetries : 10;
        this.maxPlayers = options.maxPlayers || 32;
        this.minPlayers = options.minPlayers || 1;
        this.players = [];

        this.status = 'lobby';

        const gameIdGenerator = randomString({
            format: 'AA9A-AA9A'
        });

        const game = this;

        attempt(
            { retries: this.maxRetries },
            function(attempt) {
                const staticGameId = nconf.get('StaticGameId');
                const gameId = staticGameId || gameIdGenerator.generate();

                game.db.newGame(gameId, staticGameId, (error) => this(error, gameId));
            },
            (error, gameId) => {
                if (error) {
                    return callback(error);
                }

                this.gameId = gameId;

                this.db.storeGame(this.convertToDBFormat(), (error) => {
                    if (error) {
                        callback(error);
                    }
                    callback(null, game);
                });
            }
        );        
    }

    get _id() {
        return this.gameId;
    }

    start(done) {
        if (!this.canStart) {
            throw new Error('Unable to start game');
        }

        this.status = 'playing';

    }

    stop(callback) {
        this.status = 'stopped';

        this.db.removeGame(this.gameId, callback);
    }

    get canStart() {
        return this.players.length >= this.minPlayers;
    }

    get numPlayers() {
        return this.players.length;
    }

    addPlayer(player) {
        if (this.players.length < this.maxPlayers) {
            if (this.players.find((p) => p.id === player.id)) {
                return false;
            }
            this.players.push(player);
            return true;
        } else {
            return false;
        }
    }

    getPlayer(playerId) {
        return this.players.find((player) => player.id === playerId);
    }

    removePlayer(player) {
        const playerId = player.id || player;
        const index = this.players.findIndex((player) => player.id === playerId);
        if (index !== -1) {
            this.players.splice(index, 1);
            return true;
        } else {
            return false;
        }
    }

    convertToDBFormat() {
        return _.pick(this, [
            '_id',
            'externalIPAddress',
            'port',
            'status',
        ]);
    }
}

/*
function game(db, options, done) {
    if (typeof options === 'function') {
        done = options;
        options = {};
    }

    const serverAddress = options.serverAddress;
    const maxRetries = options.maxRetries || 10;
    const maxPlayers = options.maxPlayers || 32;
    const minPlayers = options.minPlayers || 1;
    const players = [];
    let status = 'lobby';

    function start() {
        if (!canStart()) {
            throw new Error('Unable to start game');
        }

        status = 'playing';

        // TODO: Do whatever is necessary to start the game...
    }

    function stop() {
        // TODO: Do whatever is necessary to stop the game.
        status = 'lobby';
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

    function getPlayer(playerId) {
        return players.find((player) => player.id === playerId);
    }

    function removePlayer(player) {
        const playerId = player.id || player;
        const index = players.findIndex((player) => player.id === playerId);
        if (index !== -1) {
            players.splice(index, 1);
            return true;
        } else {
            return false;
        }
    }

    function convertToDBFormat(gameToStore) {
        return _.pick(gameToStore, [
            '_id',
            'externalIPAddress',
            'port',
            'status',
        ]);
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
    const gameIdGenerator = randomString({
        format: 'AA9A-AA9A'
    });

    attempt(
        { retries: maxRetries },
        function(attempt) {
            const gameId = gameIdGenerator.generate();

            db.newGame(gameId, (error) => this(error, gameId));
        },
        (error, gameId) => {
            if (error) {
                return done(error);
            }

            // TODO: Now that we have reached here we can update the game record - because
            //       we were the one who inserted it...
            const newGame = {
                get _id() {
                    return gameId;
                },
                get serverAddress() {
                    return serverAddress;
                },
                get minPlayers() {
                    return minPlayers;
                },
                get maxPlayers() {
                    return maxPlayers;
                },
                get status() {
                    return status;
                },
                get canStart() {
                    return canStart();
                },
                get numPlayers() {
                    return players.length;
                },
                start,
                stop,
                addPlayer,
                removePlayer,
                getPlayer
            };

            db.storeGame(convertToDBFormat(newGame), (error) => {
                if (error) {
                    done(error);
                }
                done(null, newGame);
            });
        }
    );
}
*/

module.exports = Game;
