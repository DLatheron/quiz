/* global require,module */
'use strict';

const express = require('express');
const passport = require('passport');
const router = express.Router();

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

// GET login page.
router.get('/', (req, res) => {
    res.render('login', { 
        title: 'Home',
        message: req.flash('message') 
    });
});

// Handle login POST.
router.post('/login', passport.authenticate('localLogin', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true
}));

router.get('/signout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// GET registration page.
router.get('/signup', (req, res) => {
    res.render('register', { 
        title: 'Register',
        message: req.flash('message') 
    });
});

// Handle registration POST.
router.post('/signup', passport.authenticate('signup', {
    successRedirect: '/home',
    failureRedirect: '/signup',
    failureFlash: true
}));

// GET home page.
router.get('/home', isAuthenticated, function(req, res) {
    res.render('index', { 
        title: 'Quiz',
        user: req.user });
});


module.exports = router;
