/* globals require, module */
'use strict';

module.exports = (mongodb) => {
    return {
        disconnect: () => {
            mongodb.close();
        },
        getQuestion: (callback) => {
            const questions = mongodb.collection('questions');
            questions.findOne({}, (error, question) => {
                callback(error, question);
            });
        }
    };
};
