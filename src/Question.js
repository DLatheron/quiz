/* globals module */

const questionFactory = function(questionState) {
    const defaultState = {
        text: '',
        answers: []
    };

    const question = Object.assign({}, defaultState, questionState);

    return question;
};

module.exports = questionFactory;