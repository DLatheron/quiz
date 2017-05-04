/* globals module */
'use strict';

const MongoClient = require('mongodb').MongoClient;


class MongoDB {
    constructor(url, database, username, password) {
        this.url = url
            .replace('[USERNAME]', username)
            .replace('[PASSWORD]', password)
            .replace('[DATABASE]', database);
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

                callback(null, database);
            }
        );
    }

    disconnect() {
        MongoClient.disconnect();
        this.database = null;
    }

    isConnected() {
        return this.database !== null;
    }

    getQuestion(searchCriteria, callback) {
        this.questionCollection.findOne(searchCriteria, (error, question) => {
            if (error) {
                return callback(error);
            }

            callback(null, question);
        });
    }

    getQuestions(searchCriteria, callback) {
        // TODO: What does 'find' return? It looks like a cursor, in which
        // case how do we use it to return the items we want... and is it
        // an efficient way to retrieve things.
        // We really want to get the n-th to n-th + qty questions based on
        // a particular search query
        this.questionCollection.find(searchCriteria, (error, questions) => {
            if (error) {
                return callback(error);
            }

            callback(null, questions);
        });        
    }
}


module.exports = MongoDB;
