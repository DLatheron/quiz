/* globals require, describe, it, context, beforeEach */
'use strict';

const assert = require('assert');
const Question = require('../src/Question');
const sinon = require('sinon');

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

        assert.strictEqual(question._id, undefined);
        assert.strictEqual(question.text, 'How are you today?');
        assert.strictEqual(question.correctAnswer(), 'Good thanks');
        assert.deepStrictEqual(question.wrongAnswers(), [
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

        assert.strictEqual(question.text, 'How are you today?');
        assert.strictEqual(question.correctAnswer(), 'Good thanks');
        assert.deepStrictEqual(question.wrongAnswers(), [
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
                assert.strictEqual(question.correctAnswer(), 'Correct Answer');
            });
        });

        describe('#wrongAnswers', () => {
            it('should return all answers except the correct one', () => {
                assert.deepStrictEqual(question.wrongAnswers(), [
                    'Wrong Answer 1',
                    'Wrong Answer 2',
                    'Wrong Answer 3'
                ]);
            });
        });

        describe('#shuffledAnsers', () => {
            it('should return all the answers', () => {
                assert.deepStrictEqual(question.shuffledAnswers().sort(), answers.sort());
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

    describe('#convertToDBFormat', () => {
        it('should return an object with only the fields required for database storage', () => {
            const text = 'How are you today?';
            const answers = [
                'Good thanks',
                'Ok',
                'So-so'
            ];
            const question = new Question({
                text: text,
                answers: answers
            });

            const dbQuestion = question.convertToDBFormat();

            assert.strictEqual(dbQuestion._id, undefined);
            assert.strictEqual(dbQuestion.text, text);
            assert.deepStrictEqual(dbQuestion.answers, answers);
        });
    });

    describe('#write', () => {
        let collection;
        let collectionMock;
        let question;

        beforeEach(() => {
            collection = {
                insert: () => {},
                update: () => {}
            };
            collectionMock = sinon.mock(collection);

            question = new Question({
                text: 'How are you today?',
                answers: [
                    'Good thanks',
                    'Ok',
                    'So-so'
                ]
            });
        });

        it('should insert into the collection if not already added', () => {
            collectionMock.expects('insert')
                .once()
                .withArgs(
                    {},
                    sinon.match(question.convertToDBFormat())
                );
            collectionMock.expects('update').never();

            question.write(collection);

            collectionMock.verify();
        });

        it('should update the collection if already added', () => {
            question._id = 'AlreadyExistsInTheDatabase';
            collectionMock.expects('insert').never();
            collectionMock.expects('update')
                .once()
                .withArgs(
                    {},
                    sinon.match(question.convertToDBFormat())
                );

            question.write(collection);

            collectionMock.verify();
        });
    });
});