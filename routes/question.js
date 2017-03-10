const express = require('express');
const router = express.Router();
const shuffle = require('shuffle-array');

/* GET home page. */
router.get('/', function (req, res, next) {
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

module.exports = router;
