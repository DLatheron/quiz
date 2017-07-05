/* globals module, require */
'use strict';

const express = require('express');
const Game = require('../src/Game');
const GameServer = require('../src/GameServer');
const httpStatus = require('http-status-codes');
const nconf = require('nconf');
const tcpPortUsed = require('tcp-port-used');

const router = express.Router();

function createServer(db, externalIP, port, callback) {
    const server = new GameServer({
        externalIPAddress: externalIP,
        port: port
    });

    server.start((error) => {
        if (error) {
            return callback(httpStatus.INTERNAL_SERVER_ERROR);
        }

        return new Game(db, {
            externalIPAddress: server.externalIPAddress,
            port: server.port,
            minPlayers: 1,
            maxPlayers: 32,
        }, (error, newGame) => {
            if (error) {
                return callback(httpStatus.INTERNAL_SERVER_ERROR);
            }

            newGame.server = server;
            server.game = newGame;

            console.info(`Game id: ${newGame._id}`);

            callback(null, server);
        });
    });

    server.on('clientConnected', (connection) => {
        console.info(`Client ${connection.name} connected...`);
    });

    server.on('clientDisconnected', (connection) => {
        console.info(`...client ${connection.name} disconnected`);
        
        function stopGameNow() {
            server.stop();
            server.game.stop(() => {
                console.log(`Game ${server.game._id} stopped`);
            });
        }

        if (server.numConnections === 0) {
            const idleGameTimeout = nconf.get('IdleGameTimeout');

            if (idleGameTimeout <= 0) {
                stopGameNow();
            } else {
                setTimeout(stopGameNow, idleGameTimeout);
            }
        }
    });

    server.netEvents.on('JOIN', (connection, gameIdToJoin) => {
        console.log(`Connection ${connection.name} asked to JOIN(${gameIdToJoin})`);
        if (!connection.gameState) {
            if (gameIdToJoin === server.game._id) {
                console.log(`Connection from ${connection.name} accepted`);
                connection.gameState = 'joined';
                server.broadcast(`JOINED ${connection.name}`);
            } else {
                console.error(`Connection from ${connection.name} rejected`);
                connection.close();
            }
        } else {
            console.warn(`Connection from ${connection.name} sent unexpected JOIN(${gameIdToJoin}) message`);
        }
    });

    server.netEvents.on('NAME', (connection, name) => {
        if (!connection.gameState) {
            connection.close();
        }
        console.log(`Connection ${connection.name} set it's name to '${name}'`);
        server.broadcast(`${connection.name} NAMED '${name}'`);
        connection.name = name;
    });

    server.netEvents.on('SAY', (connection, message) => {
        if (!connection.gameState) {
            connection.close();
        }
        console.log(`Connection ${connection.name} said '${message}'`);
        server.broadcast(`${connection.name} SAID '${message}'`, connection);
    });

    server.netEvents.on('LEAVE', (connection) => {
        connection.close();
        connection.gameState = 'exited';
    });
}

function createServerOnPort(req, res, port) {
    createServer(
        req.db,
        req.app.locals.externalIP,
        port,
        (error, server) => {
            if (error) { return res.sendStatus(error); }

            res.render('newGame', {
                title: 'Create Game',
                gameId: server.game._id,
                gameServerPort: server.port,
                gameServerAddress: `${server.externalIPAddress}`
            });
        }
    );  
}

function createServerOnAvailablePort(req, res, port) {
    if (port) {
        tcpPortUsed.check(port)
            .then((inUse) => {
                if (inUse) {
                    return createServerOnAvailablePort(req, res, port + 1);
                }
              
                createServerOnPort(req, res, port);
            });
    } else {
        createServerOnPort(req, res, port);
    }
}


router.get('/', (req, res) => {

});

router.get('/create', (req, res) => {
    if (!req.user) {
        return res.sendStatus(httpStatus.UNAUTHORIZED);
    }

    const port = nconf.get('StaticGamePort', 0);

    createServerOnAvailablePort(req, res, port);
});

router.get('/join', (req, res) => {
    // Authorization is irrelevant...
    res.render('joinGame', {
        title: 'Join Game'
    });
});

router.post('/join', (req, res) => {
    //req.checkBody('gameId', 'no game id specified').notEmpty();
    //req.sanitize('gameId').escape().trim();

    //const errors = req.validationErrors();
    const errors = null;

    if (errors) {
        return res.sendStatus(httpStatus.BAD_REQUEST);
    }

    res.redirect(`/game/join/${req.body.gameId}`);
});

router.get('/join/:gameId', (req, res) => {
    // Authorization is irrelevant...
    const gameId = req.params.gameId;

    req.db.retrieveGame(gameId, (error, game) => {
        if (error) { 
            return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
        }

        if (!game) {
            return res.sendStatus(httpStatus.NOT_FOUND);
        }

        res.render('playGame', {
            title: 'Play Game',
            gameId: gameId,
            gameServerAddress: game.externalIPAddress,
            gameServerPort: game.port
        });
    });
    // TODO: 
    // - Lookup this game id in the database.
    // - Generate a page which includes a link to the server address.
});

router.post('/quit', (req, res) => {
    res.redirect(`/game/quit/${req.body.gameId}`);
});

router.post('/quit/:gameId', (req, res) => {
    if (!req.user) {
        return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    
    const gameId = req.params.gameId;

    req.db.retrieveGame(gameId, (error, game) => {
        if (error) {
            return res.sendStatus(httpStatus.NOT_FOUND);
        }

        // TODO: Protect the game from arbitary close down.
        //       Probably we should close down games when their players fall to 0 and they timeout...

        if (game) {
            //req.db.deleteGame(gameId);
        }
    });
});

module.exports = router;
