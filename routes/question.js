﻿/* globals mongo,module,require */
const express = require('express');
const router = express.Router();
const shuffle = require('shuffle-array');

router.get('/', (req, res) => {
    req.db.getQuestion((question) => {
        res.render('question', {
            title: 'Question',
            number: 1,
            of: 4,
            text: question.text,
            answers: shuffle(question.answers)
        });
    });
});

router.post('/question/', (req, res, next) => {
});

module.exports = router;
