/* globals require, module */
'use strict';

const _ = require('lodash');


class Round {
    constructor(options) {
        const properties = _.extend({
            name: '',
            questions: []
        }, options);

        this._id = options._id;
        this.name = properties.name;
        this.questions = properties.questions;
    }

    addQuestion(question) {
        if (!question._id) { 
            throw new Error('Cannot add a question that has not been saved to the database');
        }
        this.questions.push(question);
    }

    removeQuestion(question) {
        this.questions = this.questions.filter((filterQuestion) => {
            return filterQuestion._id !== question._id;             
        });
    }

    convertToDBFormat() {
        return _.pick(this, [
            '_id',
            'name',
            'questions'
        ]);
    }

    write(collection) {
        if (typeof this._id === 'undefined') {
            collection.insert({}, this.convertToDBFormat());
        } else {
            collection.update({}, this.convertToDBFormat());
        }
    }    
}


module.exports = Round;
