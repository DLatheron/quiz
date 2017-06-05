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
};

// GET login page.
router.get('/', (req, res) => {
    if (req.user) {
        return res.redirect('/home');
    }
    
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

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// GET registration page.
router.get('/register', (req, res) => {
    res.render('register', { 
        title: 'Register',
        message: req.flash('message') 
    });
});

// Handle registration POST.
router.post('/register', passport.authenticate('register', {
    successRedirect: '/home',
    failureRedirect: '/register',
    failureFlash: true
}));

// GET home page.
router.get('/home', isAuthenticated, function(req, res) {
    res.render('index', { 
        title: 'Quiz',
        user: req.user });
});


module.exports = router;
