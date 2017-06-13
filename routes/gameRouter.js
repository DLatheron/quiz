/* globals module, require */
'use strict';

const express = require('express');
const game = require('../src/game');
const gameServer = require('../src/gameServer');
const httpStatus = require('http-status-codes');
const router = express.Router();


router.get('/', (req, res) => {

});

router.get('/create', (req, res) => {
    if (!req.user) {
        return res.send(httpStatus.UNAUTHORIZED);
    }

    gameServer({
        externalIPAddress: req.app.locals.externalIP
    }, (error, server) => {
        if (error) {
            return res.send(httpStatus.INTERNAL_SERVER_ERROR);
        }

        game(req.db, {
            serverAddress: server.address
        }, (error, newGame) => {
            if (error) {
                return res.send(httpStatus.INTERNAL_SERVER_ERROR);
            }

            server.game = newGame;

            console.info(`Game id: ${newGame._id}`);

            res.render('newGame', {
                title: 'Create Game',
                gameId: newGame._id,
                gameServerPort: server.port,
                gameServerAddress: `${server.address}`
            });
        });
    });
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
        return res.send(httpStatus.BAD_REQUEST);
    }

    res.redirect(`/game/join/${req.body.gameId}`);
});

router.get('/join/:gameId', (req, res) => {
    // Authorization is irrelevant...
    const gameId = req.params.gameId;

    req.db.retrieveGame(gameId, (error, game) => {
        if (error) { 
            return res.send(httpStatus.NOT_FOUND);
        }

        if (game) {
            // TODO: Not found.
        }

        res.render('playGame', {
            title: 'Play Game',
            gameId: gameId,
            gameServerAddress: game.serverAddress
        });
    });
    // TODO: 
    // - Lookup this game id in the database.
    // - Generate a page which includes a link to the server address.

});


module.exports = router;
