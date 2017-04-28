/* globals require, describe, it, context */
'use strict';

const assert = require('assert');
const Question = require('../src/Question');

describe('#Question', () => {
    it('should allow construction with an array of answers', () => {
        const question = new Question({
            text: 'How are you today?',
            answers: [
                'Good thanks',
                'Ok',
                'So-so'
            ]
        });

        assert.equal(question.text, 'How are you today?');
        assert.equal(question.correctAnswer(), 'Good thanks');
        assert.deepEqual(question.wrongAnswers(), [
            'Ok',
            'So-so'            
        ]);
    });
    
    it('should allow construction with a correct answer and an array of wrong answers', () => {
        const question = new Question({
            text: 'How are you today?',
            correctAnswer: 'Good thanks',
            answers: [
                'Ok',
                'So-so'
            ]
        });

        assert.equal(question.text, 'How are you today?');
        assert.equal(question.correctAnswer(), 'Good thanks');
        assert.deepEqual(question.wrongAnswers(), [
            'Ok',
            'So-so'            
        ]);        
    });

    context('', () => {
        const answers = [
            'Correct Answer',
            'Wrong Answer 1',
            'Wrong Answer 2',
            'Wrong Answer 3'
        ];
        const question = new Question({
            text: 'How are you today?',
            answers: answers
        });

        describe('#correctAnswer', () => {
            it('should return the correct answer', () => {
                assert.equal(question.correctAnswer(), 'Correct Answer');
            });
        });

        describe('#wrongAnswers', () => {
            it('should return all answers except the correct one', () => {
                assert.deepEqual(question.wrongAnswers(), [
                    'Wrong Answer 1',
                    'Wrong Answer 2',
                    'Wrong Answer 3'
                ]);
            });
        });

        describe('#shuffledAnsers', () => {
            it('should return all the answers', () => {
                assert.deepEqual(question.shuffledAnswers().sort(), answers.sort());
            });
        });

        describe('#isCorrectAnswer', () => {
            it('should return true if the answer is correct', () => {
                assert(question.isCorrectAnswer('Correct Answer'));                
            });

            it('should return false if the answer is incorrect', () => {
                assert(!question.isCorrectAnswer('Wrong Answer 1'));
            });
        });
    });
});