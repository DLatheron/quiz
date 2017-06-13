/* globals require, describe, it, beforeEach, afterEach */
'use strict';

const assert = require('assert');
const netEvents = require('../../src/util/netEvents');
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
            netEventsUnderTest = netEvents(fakeConnection);
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
        it('should call the command associated with the first word in each phrase');
    });
});