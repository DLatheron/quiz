/* globals require, module */
'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local');
const bCrypt = require('bcrypt');
const User = require('../src/User');
const { ObjectId } = require('mongodb');

function authentication(mongoDB) {
    const numberOfSaltRounds = 10;

    function validatePassword(user, password, callback) {
        bCrypt.compare(password, user.passwordHash, callback);
    }

    function createHash(password, callback) {
        bCrypt.hash(password, numberOfSaltRounds, callback);
    }    


    passport.serializeUser((user, done) => {
        done(null, user._id);
    });
    passport.deserializeUser((id, done) => {
        mongoDB.getUser(
            { _id: new ObjectId(id) }, 
            (error, user) => {
                done(error, user);
        });
    });
    passport.use('localLogin', 
        new LocalStrategy({
            passReqToCallback: true
        },
        (req, username, password, done) => {
            mongoDB.getUser(
                { email: username },
                (error, user) => {
                    if (error) {
                        return done(error);
                    }

                    if (!user) {
                        console.error(`Username '${username}' not found`);
                        return done(null, false, req.flash('message', 'User not found'));
                    }

                    validatePassword(user, password, (error, isValid) => {
                        if (error) {
                            return done(error);
                        }

                        if (!isValid) {
                            console.error('Invalid password');
                            return done(null, false, req.flash('message', 'Invalid password'));
                        }

                        return done(null, user);
                    });
                }
            );
        })
    );
    passport.use('register', 
        new LocalStrategy({
            passReqToCallback: true
        },
        (req, username, password, done) => {
            const findOrCreateUser = () => {
                mongoDB.getUser(
                    { username: username },
                    (error, user) => {
                        if (error) {
                            console.error(`Error during registration: ${error}`);
                            return done(error);
                        }
                        if (user) {
                            console.error(`User '${username}' already exists`);
                            return done(null, false, req.flash('message', 'User already exists'));
                        } else {
                            createHash(password, (error, hash) => {
                                if (error) {
                                    return done(error);
                                }

                                const newUser = new User({
                                    email: username,
                                    passwordHash: hash
                                });

                                mongoDB.storeUser(newUser, (error) => {
                                    if (error) {
                                        return done(error);
                                    }
                                    done(null, newUser);
                                });
                            });
                        }
                    }
                );
            };

            process.nextTick(findOrCreateUser);
        })
    );
}

module.exports = authentication;