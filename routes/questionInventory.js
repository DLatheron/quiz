/* globals module, require */
'use strict';

const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
    req.db.getQuestions(
        {
            // orderBy: 'text',
            // limit: 10
        }, 
        (error, questions) => {
            res.render('questionInventory', {
                title: 'Inventory',
                inventory: questions
        });
    });
});

router.post('/questionInventory/', (req, res, next) => {
});


module.exports = router;
