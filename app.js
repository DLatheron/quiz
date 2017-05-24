/* globals require, module, __dirname */
'use strict';

const express = require('express');
const path = require('path');
//const favicon = require('serve-favicon');
const engine = require('ejs-locals');
const morgan = require('morgan');
//const logger = require('js-logging').console();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const index = require('./routes/index');
const users = require('./routes/users');
const question = require('./routes/question');
const questionInventory = require('./routes/questionInventory');
const game = require('./routes/game');
const { argv } = require('yargs');
const nconf = require('nconf');
const authentication = require('./src/Authentication');
const flash = require('req-flash');
const MongoDB = require('./src/MongoDB');
const passport = require('passport');
const expressSession = require('express-session');
const MongoStore = require('connect-mongo')(expressSession);

const app = express();
const maxCookieAge = 2628000000;    // TODO: Check this.
const sessionExpirationTime = 24 * 60 * 60; // = 1 day
const sessionCollection = 'sessions';


argv.config = argv.config || 'config/config.json';
argv.secretConfig = argv.secretConfig || 'config/secret-config.json';

nconf.argv().env().file({ file: argv.config });
nconf.file('custom', argv.secretConfig);
const mongoDB = new MongoDB(
    nconf.get('MongoUri'),
    nconf.get('MongoDatabase'),
    nconf.get('MongoUsername'),
    nconf.get('MongoPassword')
);
const sessionSecret = nconf.get('ExpressSessionSecret');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', engine);
app.set('view engine', 'ejs');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function (req, res, next) {
    next();
});
app.setRouting = function() {
    app.use('/', index);
    app.use('/users', users);
    app.use('/question', question);
    app.use('/questionInventory', questionInventory);
    app.use('/game', game);
};
app.setErrorHandling = function() {
    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handler
    app.use(function (err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
        next();
    });
};
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
// flash - no not that flash
app.use(flash());

app.start = (callback) => {
    mongoDB.connect((error) => {
        if (error) {
            throw error;
        }

        authentication(mongoDB);

        app.use((req, res, next) => {
            req.db = mongoDB;
            next();
        });

        app.setRouting();
        app.setErrorHandling();

        callback(mongoDB);
    });
};


module.exports = app;
