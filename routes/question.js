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

router.post('/', (req, res, next) => {
    // TODO: Stop hard-coding this.
    req.user = {
        _id: new ObjectId('59228a6b0f13d25aa824c09f')
    };

    if (!req.user) { return res.send(httpStatus.UNAUTHORIZED); }

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
