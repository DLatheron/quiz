/* globals console,require,module,__dirname */
'use strict';
const express = require('express');
const path = require('path');
const argv = require('yargs').argv;
//const favicon = require('serve-favicon');
const engine = require('ejs-locals');
const morgan = require('morgan');
const nconf = require('nconf');
const logger = require('js-logging').console();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const index = require('./routes/index');
const users = require('./routes/users');
const question = require('./routes/question');
const Mongo = require('./src/Mongo');

const app = express();

if (!argv.config) {
    argv.config = 'config/config.json';
}

if (!argv.secretConfig) {
    argv.secretConfig = 'config/secret-config.json';
}

nconf.argv().env().file({ file: argv.config });
nconf.file('custom', argv.secretConfig);

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

const mongoUri = nconf.get('MongoUri')
    .replace('[USERNAME]', nconf.get('MongoUsername'))
    .replace('[PASSWORD]', nconf.get('MongoPassword'))
    .replace('[DATABASE]', nconf.get('MongoDatabase'));

let mongo;

app.use((req, res, next) => {
    if (mongo === undefined) {
        mongo = Mongo();
        mongo.connect(mongoUri, (error) => {
            if (error) {
                logger.error(error);
                throw error;
            }

            logger.info(`Connected to database: ${mongoUri}`);
            req.db = mongo;
            next();
        });
    } else {
        req.db = mongo;
        next();
    }
});

app.use('/', index);
app.use('/users', users);
app.use('/question', question);

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

app.get('/', function (req, res, next) {
    next();
});

module.exports = app;
