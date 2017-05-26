/* globals module, require */
'use strict';

const express = require('express');
const httpStatus = require('http-status-codes');
const Question = require('../src/Question');
const router = express.Router();
const shuffle = require('shuffle-array');
const { ObjectId } = require('mongodb');

router.get('/', (req, res) => {
    if (!req.user) { return res.send(httpStatus.UNAUTHORIZED); }

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

router.get('/add', (req, res) => {
    if (!req.user) { return res.send(httpStatus.UNAUTHORIZED); }

    res.render('addQuestion', {
        title: 'Add Question'
    });
});

router.post('/add', (req, res, next) => {
    // TODO: Stop hard-coding this.
    req.user = {
        _id: new ObjectId('59228a6b0f13d25aa824c09f')
    };

    if (!req.user) { return res.send(httpStatus.UNAUTHORIZED); }

    req.checkBody('text', 'question text required').notEmpty();
    req.checkBody('answers', 'answers required').notEmpty();

    req.sanitize('text').escape();
    req.sanitize('text').trim();

    const errors = req.validationErrors();

    if (errors) {
        return res.send(httpStatus.BAD_REQUEST);
    }

    // TODO: Validation of passed question parameters.

    const question = new Question(req.body);

    question.author = req.user._id;
    question.date = new Date();

    // TODO: Generate the unique question 'id' field.

    req.db.addQuestion(question.convertToDBFormat(), (error) => {
        if (error) { next(error); }

        res.send(httpStatus.OK);
    });
});


module.exports = router;
