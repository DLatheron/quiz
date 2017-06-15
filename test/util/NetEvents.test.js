/* globals require, describe, it, beforeEach, afterEach */
'use strict';

const assert = require('assert');
const EventEmitter = require('events');
const NetEvents = require('../../src/util/netEvents');
const sinon = require('sinon');

describe('#netEvents', () => {
    class FakeConnection extends EventEmitter {
        constructor() {
            super();
        }

        emitText(str) {
            this.emit('text', str);
        }

        on() {}
    }

    let sandbox;
    let netEventsUnderTest;
    let fakeConnection;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();

        fakeConnection = new FakeConnection();

        netEventsUnderTest = new NetEvents(fakeConnection);
    });

    afterEach(() => {
        sandbox.verify();
        sandbox.restore();
    });

    describe('#add', () => {
        it('should add the connection', () => {
            netEventsUnderTest.add(fakeConnection);
            
            assert.deepStrictEqual(netEventsUnderTest.connections[0], fakeConnection);
        });

        it('should return true if the connection was added', () => {
            assert.strictEqual(netEventsUnderTest.add(fakeConnection), true);
        });

        it('should register a listener on the connection', () => {
            sandbox.mock(fakeConnection)
                .expects('on')
                .once()
                .withExactArgs('text', sinon.match.func);

            netEventsUnderTest.add(fakeConnection);
        });

        it('should not add a connection if it has already been added', () => {
            netEventsUnderTest.add(fakeConnection);
            netEventsUnderTest.add(fakeConnection);

            assert.strictEqual(netEventsUnderTest.connections.length, 1);
        });

        it('should return false if the connection was not added', () => {
            netEventsUnderTest.add(fakeConnection);
            assert.strictEqual(netEventsUnderTest.add(fakeConnection), false);
        });
    });

    describe('#remove', () => {
        let fakeConnectionToRemove = new FakeConnection();
        let fakeConnectionOther = new FakeConnection();
        let fakeConnectionNotAdded = new FakeConnection();

        beforeEach(() => {
            netEventsUnderTest.add(fakeConnection);
            netEventsUnderTest.add(fakeConnectionToRemove);
            netEventsUnderTest.add(fakeConnectionOther);
        });
        
        it('should remove the connection', () => {

            netEventsUnderTest.remove(fakeConnectionToRemove);

            assert.deepStrictEqual(netEventsUnderTest.connections[0], fakeConnection);
            assert.deepStrictEqual(netEventsUnderTest.connections[1], fakeConnectionToRemove);
            assert.strictEqual(netEventsUnderTest.connections.length, 2);
        });

        it('should return true if the connection was removed', () => {
            assert.strictEqual(netEventsUnderTest.remove(fakeConnectionToRemove), true);
        });

        it('should unregister the listener on the connection', () => {
            sandbox.mock(fakeConnectionToRemove)
                .expects('removeListener')
                .once()
                .withExactArgs('text', sinon.match.func);

            netEventsUnderTest.remove(fakeConnectionToRemove);
        });

        it('should not remove the connection if it has not been added', () => {
            netEventsUnderTest.remove(fakeConnectionNotAdded);

            assert.strictEqual(netEventsUnderTest.connections.length, 3);
        });

        it('should return false if the connection was not removed', () => {
            assert.strictEqual(netEventsUnderTest.remove(fakeConnectionNotAdded), false);
        });
    });

    describe('#splitPhrases', () => {
        it('should split phrases by phrase separators', () => {
            const stringToParse = 'HELLO;SET param=12;MOVE left';

            assert.deepStrictEqual(
                netEventsUnderTest.splitPhrases(stringToParse),
                [
                    'HELLO',
                    'SET param=12',
                    'MOVE left'
                ]
            );
        });
    });

    describe('#splitWords', () => {
        it('should split words by word separators', () => {
            const stringToParse = '   HELLO this is  a test\tof word  parsing ';

            assert.deepStrictEqual(
                netEventsUnderTest.splitWords(stringToParse),
                [
                    'HELLO',
                    'this',
                    'is',
                    'a',
                    'test',
                    'of',
                    'word',
                    'parsing'
                ]
            );
        });

        it('should respect single-quoted strings as single parameters', () => {
            const stringToParse = 'HELLO \'A single-quoted string\'';

            assert.deepStrictEqual(
                netEventsUnderTest.splitWords(stringToParse),
                [
                    'HELLO',
                    'A single-quoted string'
                ]
            );
        });

        it.skip('should respect double-quoted strings as single parameters', () => {
            const stringToParse = 'HELLO "A double-quoted string"';

            assert.deepStrictEqual(
                netEventsUnderTest.splitWords(stringToParse),
                [
                    'HELLO',
                    'A double-quoted string'
                ]
            );
        });
    });

    describe('#parse', () => {
        it('should call splitPhrases', () => {
            const stringToParse = 'A command string';

            sandbox.mock(netEventsUnderTest)
                .expects('splitPhrases')
                .once()
                .withExactArgs(stringToParse)
                .returns([ stringToParse ]);

            netEventsUnderTest.parse(stringToParse);
        });

        it('should call splitWords on each split phrase', () => {
            const stringToParse = 'Command 1; Command 2';
            const splitWordsMock = sandbox.mock(netEventsUnderTest);

            splitWordsMock.expects('splitWords')
                .once()
                .withExactArgs('Command 1')
                .returns(['Command', '1']);
            splitWordsMock.expects('splitWords')
                .once()
                .withExactArgs('Command 2')
                .returns(['Command', '2']);

            netEventsUnderTest.parse(stringToParse);
        });

        it('should generate events based on the first word of each phrase', () => {
            const stringToParse = 'Command1; Command2; Command3';
            const eventMock = sandbox.mock(netEventsUnderTest);

            eventMock.expects('emit')
                .once()
                .withArgs('Command1');
            eventMock.expects('emit')
                .once()
                .withArgs('Command2');
            eventMock.expects('emit')
                .once()
                .withArgs('Command3');

            netEventsUnderTest.parse(stringToParse);
        });

        it('should pass arguments to each event', () => {
            const stringToParse = 'Command1 arguments; Command2 otherArgument1 otherArgument2';
            const eventMock = sandbox.mock(netEventsUnderTest);

            eventMock.expects('emit')
                .once()
                .withExactArgs('Command1', 'arguments');
            eventMock.expects('emit')
                .once()
                .withExactArgs('Command2', 'otherArgument1', 'otherArgument2');

            netEventsUnderTest.parse(stringToParse);
        });   

        it('should call commands with the context of the connection', () => {
            const stringToParse = 'Command';

            sandbox.mock(netEventsUnderTest)
                .expects('emit')
                .once()
                .on(fakeConnection);

            netEventsUnderTest.parse(stringToParse);
        });   
    });

    describe('on connection text event', () => {
        it.skip('should call parse on the received data', () => {
            const receivedMsg = 'Command argument otherArgument';

            sandbox.mock(netEventsUnderTest)
                .expects('parse')
                .once()
                .withExactArgs(receivedMsg);

            fakeConnection.emitText(receivedMsg);
        });
    });
});