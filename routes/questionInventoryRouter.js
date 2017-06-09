/* globals module, require */
'use strict';

const async = require('async');
const express = require('express');
const moment = require('moment');
const router = express.Router();

router.get('/', (req, res) => {
    req.db.getQuestions(
        {
            // orderBy: 'text',
            // limit: 10
        }, 
        (error, questions) => {
            async.map(questions, (question, callback) => {
                // Remap the author.
                req.db.getUser({ _id: question.author }, (error, author) => {
                    question.author = `${author.firstName} ${author.lastName}`;
                    callback(null, question);
                });
            }, (error, updatedQuestions) => {
                res.render('questionInventory', {
                    title: 'Question Inventory',
                    inventory: updatedQuestions,
                    moment: moment,
                    timeFormat: 'h:mma, D MMM YYYY z'
                });
            });
        }
    );
});

router.post('/questionInventory/', (req, res, next) => {
});


module.exports = router;
