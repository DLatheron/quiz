/* globals module, require */
const express = require('express');
const router = express.Router();
const shuffle = require('shuffle-array');

router.get('/', (req, res) => {
    req.db.getQuestion({}, (error, question) => {
        if (error) {
            return;
        }

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
