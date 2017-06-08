/* globals module, require */
'use strict';

const express = require('express');
const game = require('../src/game');
const gameServer = require('../src/gameServer');
const httpStatus = require('http-status-codes');
const router = express.Router();


router.get('/', (req, res) => {

});

router.get('/newGame', (req, res) => {
    if (!req.user) {
        return res.send(httpStatus.UNAUTHORIZED);
    }

    game(req.db, (error, newGame) => {
        if (error) {
            return res.send(httpStatus.INTERNAL_SERVER_ERROR);
        }

        console.info(`Game id: ${newGame._id}`);

        const server = gameServer(newGame);

        res.render('newGame', {
            title: 'Create Game',
            gameId: newGame._id,
            gameServerAddress: `${server.address.address}:${server.address.port}`
        });
    });
});

router.get('/joinGame/:gameId', (req, res) => {
    // Authorization is irrelevant...
    const gameId = req.params.gameId;

    req.db.retrieveGame(gameId, (error, game) => {
        if (error) { 
            return res.send(httpStatus.NOT_FOUND);
        }

        res.render('playGame', {
            title: 'Play Game',
            gameId: gameId,
            gameServerAddress: 'TODO'
        });
    });
    // TODO: 
    // - Lookup this game id in the database.
    // - Generate a page which includes a link to the server address.

});


module.exports = router;
