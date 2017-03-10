const express = require('express');
const router = express.Router();
const shuffle = require('shuffle-array');
const Mongo = require('../src/Mongo');

/* GET home page. */
router.get('/', function (req, res, next) {
    const myMongo = Mongo();

    myMongo.connect((error, db) => {
        myMongo.getQuestion((question) => {
            res.render('question', {
                title: 'Question',
                number: 1,
                of: 4,
                text: 'What is the capital of Sweden?',
                answers: shuffle([
                    'Berlin',
                    'Paris',
                    'Copenhagen',
                    'Stockholm',
                    'London',
                    'Cardiff'
                ])
            });
        });
    });

});

module.exports = router;
