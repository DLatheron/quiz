/* globals module, require */
'use strict';

const shuffle = require('shuffle-array');
const _ = require('lodash');


class Question {
    constructor(options) {
        const properties = _.extend({
            text: '',
            correctAnswer: undefined,
            answers: []
        }, options);

        this._id = options._id;
        this.id = options.id;
        this.text = properties.text;
        this.answers = _.compact(_.concat(properties.correctAnswer, properties.answers));
    }

    correctAnswer() {
        return this.answers[0];
    }

    wrongAnswers() {
        return this.answers.slice(1);
    }

    shuffledAnswers() {
        return shuffle(this.answers);
    }

    isCorrectAnswer(answer) {
        return answer === this.correctAnswer();
    }

    convertToDBFormat() {
        return _.pick(this, [
            '_id',
            'id',
            'text',
            'answers'
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

module.exports = Question;
