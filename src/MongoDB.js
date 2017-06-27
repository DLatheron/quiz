/* globals module */
'use strict';

const MongoClient = require('mongodb').MongoClient;
const _ = require('lodash');

function getNextSequence(db, name, callback) {
    db.collection('counters').findAndModify(
        { '_id': name },
        [['_id', 'asc']],
        { '$inc': { counterValue: 1 } },
        { 'new': true },
        (error, document) => {
            callback(error, document.value.counterValue);
        }
    );    
}

function formatQuestionId(db, callback) {
    getNextSequence(db, 'questionId', (error, counterValue) => {
        if (error) { callback(error); }

        const questionPrefix = 'Q';
        const questionIdLength = 8;
        const questionId = questionPrefix + _.padStart(
            counterValue.toString(), 
            questionIdLength, 
            '0'
        );
        callback(null, questionId);
    });
}


class MongoDB {
    constructor(url, database, username, password) {
        this.url = url
            .replace('[DATABASE]', database)
            .replace('[USERNAME]', username)
            .replace('[PASSWORD]', password);
        this.options = {};
        this.database = null;
    }

    connect(callback) {
        MongoClient.connect(
            this.url, 
            this.options,
            (error, database) => {
                if (error) { 
                    return callback(error);
                }

                this.database = database;
                this.questionCollection = database.collection('questions');
                this.userCollection = database.collection('users');

                callback(null, database);
            }
        );
    }

    disconnect(callback) {
        if (this.database) {
            this.database.close((error) => {
                this.database = null;
                callback(error);
            });
        }
    }

    isConnected() {
        return this.database !== null;
    }

    getQuestion(searchCriteria, callback) {
        this.questionCollection.findOne(searchCriteria, (error, question) => {
            callback(error, question);
        });
    }

    addQuestion(question, callback) {
        formatQuestionId(this.database, (error, questionId) => {
            if (error) { callback(error); }

            this.questionCollection.insert(
                {
                    id: questionId,
                    text: question.text,
                    answers: question.answers,
                    author: question.author,
                    date: question.date
                }, callback
            );
        });
    }

    getQuestions(searchCriteria, callback) {
        // TODO: What does 'find' return? It looks like a cursor, in which
        // case how do we use it to return the items we want... and is it
        // an efficient way to retrieve things.
        // We really want to get the n-th to n-th + qty questions based on
        // a particular search query
        this.questionCollection.find(searchCriteria).toArray((error, questions) => {
            if (error) {
                return callback(error);
            }

            callback(null, questions);
        });        
    }

    getUser(searchCriteria, callback) {
        this.database.collection('users').findOne(searchCriteria, (error, user) => {
            if (error) {
                return callback(error);
            }

            callback(null, user);
        });        
    }

    storeUser(user, callback) {
        this.database.collection('users').insert(user, callback);
    }

    newGame(gameId, forceUpdate, callback) {
        if (typeof forceUpdate === 'function') {
            callback = forceUpdate;
            forceUpdate = false;
        }

        const options = forceUpdate ? { upsert: true } : {};

        this.database.collection('games').update({ _id: gameId }, { _id: gameId }, options, callback);
    }

    storeGame(game, callback) {
        this.database.collection('games').update({ _id: game._id }, game, { upsert: true }, callback);
    }

    retrieveGame(gameId, callback) {
        this.database.collection('games').findOne({ _id: gameId }, callback);
    }

    removeGame(gameId, callback) {
        this.database.collection('games').deleteOne({ _id: gameId }, callback);
    }
}


module.exports = MongoDB;
