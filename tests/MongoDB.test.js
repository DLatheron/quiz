/* globals require, describe, it, context, beforeEach, afterEach */
'use strict';

const assert = require('assert');
const MongoClient = require('mongodb').MongoClient;
const proxyquire = require('proxyquire');
const sinon = require('sinon');

describe('#MongoDB', () => {
    const url = '[DATABASE]/[USERNAME]/[PASSWORD]';
    const database = 'database';
    const username = 'username';
    const password = 'password';
    const expectedUrl = `${database}/${username}/${password}`;
    const expectedError = {
        message: 'An error occurred'
    };

    let MongoDB;
    // let MongoClient;

    beforeEach(() => {
        // MongoClient = {
        //     connect: () => {},
        //     disconnect: () => {}
        // };

        MongoDB = proxyquire('../src/MongoDB.js', {
            MongoClient: MongoClient
        });
    });

    describe('#constructor', () => {
        it('should build the connection string', () => {
            const mongoDB = new MongoDB(
                url,
                database,
                username,
                password
            );

            assert.strictEqual(mongoDB.url, expectedUrl);
        });
    });

    context('', () => {
        let mongoDB;
        let fakeDatabase;

        beforeEach(() => {
            mongoDB = new MongoDB(
                url,
                database,
                username,
                password
            );

            fakeDatabase = {
                collection: () => {},
                close: () => {}
            };
        });

        afterEach(() => {
            MongoClient.connect.restore();
        });

        describe('#connect', () => {
            it('should attempt to connect to the Mongo database', () => {
                const connectMock = sinon.mock(MongoClient)
                    .expects('connect')
                    .once()
                    .withArgs(
                        sinon.match(expectedUrl),
                        sinon.match.object,
                        sinon.match.func
                    );
                
                mongoDB.connect();

                connectMock.verify();
            });            
            
            it('should callback with an error if an error occurs', (done) => {
                sinon.stub(MongoClient, 'connect').yields(expectedError);

                mongoDB.connect((error, database) => {
                    assert.strictEqual(error, expectedError);
                    assert(!database);
                    done();
                });
            });

            it('should callback with database if it succeeds', (done) => {
                sinon.stub(MongoClient, 'connect').yields(null, fakeDatabase);

                mongoDB.connect((error, database) => {
                    assert(!error);
                    assert.strictEqual(database, fakeDatabase);
                    done(); 
                });
            });
        });

        describe('#disconnect', () => {
            let closeMock;

            beforeEach(() => {
                sinon.stub(MongoClient, 'connect').yields(null, fakeDatabase);
                closeMock = sinon.mock(fakeDatabase)
                    .expects('close')
                    .once();
            });

            it('should callback with an error is disconnection fails', (done) => {
                closeMock.yields(expectedError);

                mongoDB.connect(() => {
                    mongoDB.disconnect((error) => {
                        assert.strictEqual(error, expectedError);
                        closeMock.verify();
                        done(); 
                    });
                });                
            });

            it('should callback if disconnection succeedsf', (done) => {
                closeMock.yields();

                mongoDB.connect(() => {
                    mongoDB.disconnect((error) => {
                        assert(!error);
                        closeMock.verify();
                        done(); 
                    });
                });                
            });            
        });

        describe('#isConnected', () => {
            it('should return false before connect is called');
            it('should return true after connect completes successfully');
            it('should return false if connect fails');
            it('should return false after disconnect is called');
        });

        describe('#getQuestion', () => {
            it('should callback with an error if an error occurs');
            it('should callback with the a question if a question is found');
        });

        describe('#getQuestions', () => {
            it('should callback with an error if an error occurs');
            it('should callback with an array of questions if any are found');
        });
    });
});