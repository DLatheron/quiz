/* globals require, describe, it, beforeEach, afterEach */
'use strict';

const assert = require('assert');
const NetEvents = require('../../src/util/netEvents');
const sinon = require('sinon');

describe('#netEvents', () => {
    let sandbox;
    let netEventsUnderTest;
    let fakeConnection;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();

        fakeConnection = {
            on: () => {}
        };
    });

    afterEach(() => {
        sandbox.verify();
        sandbox.restore();
    });

    describe('#splitPhrases', () => {
        beforeEach(() => {
            netEventsUnderTest = new NetEvents(fakeConnection);
        });

        it('should split phrases by phrase separators', () => {
            assert.deepStrictEqual(
                netEventsUnderTest.splitPhrases('HELLO;SET param=12;MOVE left'),
                [
                    'HELLO',
                    'SET param=12',
                    'MOVE left'
                ]
            );
        });
    });

    describe('#splitWords', () => {
        beforeEach(() => {
            netEventsUnderTest = new NetEvents(fakeConnection);
        });

        it('should split words by word separators', () => {
            assert.deepStrictEqual(
                netEventsUnderTest.splitWords('   HELLO this is  a test\tof word  parsing '),
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
    });

    describe('#parse', () => {
        beforeEach(() => {
            netEventsUnderTest = new NetEvents(fakeConnection);
        });

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
    });

    describe('connection receiving a message', () => {
        it('should call each parse the received data');
    });
});