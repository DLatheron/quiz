/* globals module, require */
'use strict';

const _ = require('lodash');
const shuffle = require('shuffle-array');

class Question {
    constructor(options) {
        var properties = _.extend({
            text: '',
            correctAnswer: undefined,
            answers: []
        }, options);

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
}

// const questionFactory = function(questionState) {
//     const defaultState = {
//         text: '',
//         answers: []
//     };

//     const question = Object.assign({}, defaultState, questionState);

//     return question;
// };

module.exports = Question;