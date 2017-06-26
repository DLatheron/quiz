/* globals require, describe, it, context, beforeEach, afterEach */
'use strict';

const assert = require('assert');
//const MongoClient = require('mongodb').MongoClient;
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

    let sandbox;
    let MongoDB;
    let mongoDB;
    let MongoClient;
    let fakeCollection;
    let fakeDatabase;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();

        MongoClient = {
            connect: () => assert.fail()
        };

        MongoDB = proxyquire('../src/MongoDB.js', {
            mongodb: { MongoClient: MongoClient }
        });

        fakeCollection = {
            find: () => assert.fail(),
            findOne: () => assert.fail(),
            insert: () => assert.fail(),
            replace: () => assert.fail()
        };

        fakeDatabase = {
            collection: () => { return fakeCollection; },
            close: () => assert.fail()
        };        
    });

    afterEach(() => {
        sandbox.verify();
        sandbox.restore();
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
        beforeEach(() => {
            mongoDB = new MongoDB(
                url,
                database,
                username,
                password
            );
        });

        describe('#connect', () => {
            it('should attempt to connect to the Mongo database', () => {
                const connectMock = sandbox.mock(MongoClient)
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
                sandbox.stub(MongoClient, 'connect').yields(expectedError);

                mongoDB.connect((error, database) => {
                    assert.strictEqual(error, expectedError);
                    assert(!database);
                    done();
                });
            });

            it('should callback with database if it succeeds', (done) => {
                sandbox.stub(MongoClient, 'connect').yields(null, fakeDatabase);

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
                sandbox.stub(MongoClient, 'connect').yields(null, fakeDatabase);
                closeMock = sandbox.mock(fakeDatabase)
                    .expects('close')
                    .once();
            });

            it('should callback with an error if disconnection fails', (done) => {
                closeMock.yields(expectedError);

                mongoDB.connect(() => {
                    mongoDB.disconnect((error) => {
                        assert.strictEqual(error, expectedError);
                        closeMock.verify();
                        done(); 
                    });
                });                
            });

            it('should callback if disconnection succeeds', (done) => {
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
            it('should return false before connect is called', () => {
                assert(!mongoDB.isConnected());
            });

            it('should return true after connect completes successfully', (done) => {
                sandbox.stub(MongoClient, 'connect').yields(null, fakeDatabase);

                mongoDB.connect(() => {
                    assert(mongoDB.isConnected());
                    done();
                });
            });

            it('should return false if connect fails', (done) => {
                sandbox.stub(MongoClient, 'connect').yields(expectedError);

                mongoDB.connect(() => {
                    assert(!mongoDB.isConnected());
                    done();
                });
            });

            it('should return false after disconnect is called', (done) => {
                sandbox.stub(MongoClient, 'connect').yields(null, fakeDatabase);
                sandbox.stub(fakeDatabase, 'close').yields();

                mongoDB.connect(() => {
                    mongoDB.disconnect(() => {
                        assert(!mongoDB.isConnected());
                        done();
                    });
                });
            });
        });
    });

    context('', () => {
        beforeEach(() => {
            sinon.stub(MongoClient, 'connect').yields(null, fakeDatabase);
            sinon.stub(fakeDatabase, 'collection').returns(fakeCollection);

            mongoDB = new MongoDB(
                url,
                database,
                username,
                password
            );                
        });

        describe('#getQuestion', () => {
            const expectedQuestion = {
                text: 'How are you?',
                answers: [
                    'Good',
                    'Bad'
                ]
            };

            beforeEach((done) => {
                sinon.stub(fakeCollection, 'findOne')
                    .withArgs('an error occurred').yields(expectedError)
                    .withArgs('no question found').yields(null, null)
                    .withArgs('one question').yields(null, expectedQuestion);

                mongoDB.connect(done);
            });

            it('should callback with an error if an error occurs', (done) => {
                mongoDB.getQuestion('an error occurred', (error) => {
                    assert.strictEqual(error, expectedError);
                    done();
                });
            });

            it('should callback with null if no question was found', (done) => {
                mongoDB.getQuestion('no question found', (error, question) => {
                    assert(!error);
                    assert.equal(question, null);
                    done();
                });
            });

            it('should callback with the a question if a question is found', (done) => {
                mongoDB.getQuestion('one question', (error, question) => {
                    assert(!error);
                    assert.strictEqual(question, expectedQuestion);
                    done();
                });
            });
        });

        describe('#getQuestions', () => {
            const expectedQuestions = [{
                text: 'How are you?',
                answers: [
                    'Good',
                    'Bad'
                ]
            },{
                text: 'What happened?',
                answers: [
                    'Something',
                    'Nothing'
                ]
            }];
            let arrayStub;
                        
            beforeEach((done) => {
                arrayStub = {
                    toArray: () => {}
                };

                sandbox.stub(fakeCollection, 'find')
                    .returns(arrayStub);

                mongoDB.connect(done);
            });

            it('should callback with an error if an error occurs', (done) => {
                sandbox.stub(arrayStub, 'toArray')
                    .yields(expectedError);
                
                mongoDB.getQuestions('an error occurred', (error) => {
                    assert.strictEqual(error, expectedError);
                    done();
                });
            });

            it('should callback with null if no question were found', (done) => {
                sandbox.stub(arrayStub, 'toArray')
                    .yields(null, null);
                
                mongoDB.getQuestions('no questions found', (error, questions) => {
                    assert(!error);
                    assert.equal(questions, null);
                    done();
                });
            });

            it('should callback with an array of questions if any where found', (done) => {
                sandbox.stub(arrayStub, 'toArray')
                    .yields(null, expectedQuestions);
                
                mongoDB.getQuestions('questions found', (error, questions) => {
                    assert(!error);
                    assert.deepStrictEqual(questions, expectedQuestions);
                    done();
                });
            });
        });

        describe('#getUser', () => {
            // TODO:
        });

        describe('#storeUser', () => {
            // TODO:
        });

        describe('#newGame', () => {
            beforeEach((done) => {
                mongoDB.connect(done);
            });

            it('should call insert on the database if not forced', (done) => {
                sandbox.mock(fakeCollection)
                    .expects('insert')
                    .once()
                    .yields(null);
                mongoDB.newGame('AAA9-AAA9', done);
            });

            it('should call insert on the database if not forced', (done) => {
                sandbox.mock(fakeCollection)
                    .expects('insert')
                    .once()
                    .yields(null);
                mongoDB.newGame('AAA9-AAA9', false, done);
            });

            it('should call replace on the database if forced', (done) => {
                sandbox.mock(fakeCollection)
                    .expects('replace')
                    .once()
                    .yields(null);
                mongoDB.newGame('AAA9-AAA9', true, done);
            });

            it('should add a unique game to the database', (done) => {
                sandbox.stub(fakeCollection, 'insert').yields(null);
                mongoDB.newGame('AAA9-AAA9', (error) => {
                    done(error);
                }); 
            });

            it('should emit an error if the game already exists', (done) => {
                sandbox.stub(fakeCollection, 'insert').yields(expectedError);
                mongoDB.newGame('AAA9-AAA9', (error) => {
                    assert.strictEqual(error, expectedError);
                    done(!error);
                }); 
            });
        });
    });
});