/* globals require, module */

const app = require('../app');
const passport = require('passport');
const expressSession = require('express-session');
const LocalStrategy = require('passport-local');
const bCrypt = require('bcrypt');
const User = require('../src/User');
const { ObjectId } = require('mongodb');
const MongoStore = require('connect-mongo')(expressSession);

function authentication(
    mongoDB, 
    sessionSecret = 'mySecretKey'
) {
    const numberOfSaltRounds = 10;
    const maxCookieAge = 2628000000;    // TODO: Check this.
    const sessionExpirationTime = 24 * 60 * 60; // = 1 day
    const sessionCollection = 'sessions';

    function validatePassword(user, password, callback) {
        bCrypt.compare(password, user.passwordHash, callback);
    }

    function createHash(password, callback) {
        bCrypt.hash(password, numberOfSaltRounds, callback);
    }    

    app.use(expressSession({
        secret: sessionSecret,
        cookie: { maxAge: maxCookieAge },
        store: new MongoStore({
            url: mongoDB.url,
            collection: sessionCollection,
            expire: sessionExpirationTime
        })
    }));
    app.use(passport.initialize());
    app.use(passport.session());

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
    passport.use('login', 
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
    passport.use('signup', 
        new LocalStrategy({
            passReqToCallback: true
        },
        (req, username, password, done) => {
            const findOrCreateUser = () => {
                mongoDB.getUser(
                    { username: username },
                    (error, user) => {
                        if (error) {
                            console.error(`Error during signup: ${error}`);
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