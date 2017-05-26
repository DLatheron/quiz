/* globals require, describe, it */
'use strict';

const assert = require('assert');
//const proxyquire = require('proxyquire');
const Question = require('../src/Question.js');
const Round = require('../src/Round.js');
//const sinon = require('sinon');

describe('#Round', () => {
    const expectedQuestions = [
        new Question({
            _id: 'Question000',
            text: 'How are you today?',
            answers: [
                'Good thanks',
                'Ok',
                'So-so'
            ]
        }),
        new Question({
            _id: 'Question001',
            text: 'When will the train arrive?',
            answers: [
                'Today',
                'Tomorrow',
                'Never'
            ]
        }),
        new Question({
            _id: 'Question002',
            text: 'What is the answer to the ultimate question?',
            answers: [
                '42',
                '41.8',
                '37.5'
            ]
        })
    ];
    const unaddedQuestion = new Question({
        text: 'What happens if a question is not added to the database?',
        answers: [
            'Exception is thrown',
            'Program crashes'
        ]
    });

    it('should construct a question with appropriate parameters', () => {
        const round = new Round({
            name: 'Round 1',
            questions: [
                expectedQuestions[0],
                expectedQuestions[1],
                expectedQuestions[2]
            ]
        });

        assert.strictEqual(round._id, undefined);
        assert.strictEqual(round.name, 'Round 1');
        assert.deepStrictEqual(round.questions, [
            expectedQuestions[0],
            expectedQuestions[1],
            expectedQuestions[2]
        ]);
    });

    describe('#addQuestion', () => {
        it('should throw exception if question is not stored in the database', () => {
            const round = new Round({
                name: 'Round 1'
            });

            assert.throws(() => {
                round.addQuestion(unaddedQuestion);
            });
        });

        it('should add a question to an empty round', () => {
            const round = new Round({
                name: 'Round 1'
            });

            assert.strictEqual(round.questions.length, 0);
            round.addQuestion(expectedQuestions[0]);
            assert.strictEqual(round.questions.length, 1);
            assert.deepStrictEqual(round.questions[0], expectedQuestions[0]);
        });
        it('should append a question to the end of a round');
    });

    describe('#removeQuestion', () => {
        it('should remove only the requested question from a populated round');
        it('should remove only the requested question from a nearly empty round');
        it('should not remove a question if it is not in the round');
    });

    describe('#convertToDBFormat', () => {
        it('should return an object with only the fields required for database storage');
    });

    describe('#write', () => {
        it('should insert into the collection if not already added');
        it('should update the collection if already added');
    });
});