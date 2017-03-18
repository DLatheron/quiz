/* globals require, module */
'use strict';

const MongoClient = require('mongodb').MongoClient;

module.exports = () => {
    return {
        connect: (uri, callback) => {
            this.mongoUri = uri;
            MongoClient.connect(uri, (error, db) => {
                if (error) {
                    return callback(error);
                }
                this.mongoDb = db;
            });
        },
        disconnect: () => {
            this.mongoDb.close();
        },
        getQuestion: (callback) => {
            const questions = this.mongoDb.collection('questions');
            questions.findOne({}, (error, question) => {
                callback(question);
            });
        }
    };
};
