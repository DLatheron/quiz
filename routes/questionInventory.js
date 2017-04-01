/* globals mongo,module,require */
const express = require('express');
const router = express.Router();
const shuffle = require('shuffle-array');

router.get('/', (req, res) => {
    const inventory = [
        {
            id: '000001',
            text: 'How many things are there',
            answers: [
                '1',
                '2',
                '3',
                '4'                
            ],
            author: 'fredBloggs',
            date: new Date(),
        },
        {
            id: '000002',
            text: 'How many things are were there',
            answers: [
                '1',
                '2',
                '3',
                '4'                
            ],
            author: 'fredBloggs',
            date: new Date(),
        },
        {
            id: '000003',
            text: 'What is the capital of France?',
            answers: [
                'F',
                'R',
                'A',
                'Paris'                
            ],
            author: 'fredBloggs',
            date: new Date(),
        }        
    ];

    res.render('questionInventory', {
        title: 'Inventory',
        inventory: inventory
    });
});

router.post('/questionInventory/', (req, res, next) => {
});

module.exports = router;
