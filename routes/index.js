/* global require,module */
'use strict';

const express = require('express');
const passport = require('passport');
const router = express.Router();

// GET loging page.
router.get('/', (req, res) => {
    res.render('index', { message: req.flash('message') });
});

// Handle login POST.
router.post('/login', passport.authenticate('login', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true
}));

// GET registration page.
router.get('/signup', (req, res) => {
    res.render('register', { message: req.flash('message') });
});

// Handle registration POST.
router.post('/signup', passport.authenticate('signup', {
    successRedirect: '/home',
    failureRedirect: '/signup',
    failureFlash: true
}));

/* GET home page. */
// router.get('/', function(req, res) {
//     res.render('index', { title: 'Quiz' });
// });


module.exports = router;
