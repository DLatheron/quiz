/* globals require, describe, it, beforeEach */
'use strict';

const assert = require('assert');
const randomString = require('../../src/util/randomString');
const sinon = require('sinon');

describe('#randomString', () => {
    const alphaNumericCharSet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const numericCharSet = '0123456789';
    const alphaCharSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

    beforeEach(() => {
    });

    it('should call the generator once per character', () => {
        const options = {
            format: 'XX9X-XX9X',
            generator: (chSet) => {}
        };
        const generatorMock = sinon.mock(options)
            .expects('generator')
            .exactly(8);

        const rsUnderTest = randomString(options);
        rsUnderTest.generate();

        generatorMock.verify();
    });

    it('should call the generator with appropriate arguments', () => {
        const options = {
            format: 'A9X',
            generator: (chSet) => {}
        };
        const generatorMock = sinon.mock(options);
        generatorMock.expects('generator').once().withExactArgs(alphaNumericCharSet);
        generatorMock.expects('generator').once().withExactArgs(numericCharSet);
        generatorMock.expects('generator').once().withExactArgs(alphaCharSet);

        const rsUnderTest = randomString(options);
        rsUnderTest.generate();

        generatorMock.verify();
    });

    it('should return a string of the specified length', () => {
        const rsUnderTest = randomString({
            format: 'A9XA9XA9XA9X'
        });

        assert.strictEqual(rsUnderTest.generate().length, 12);
    });

    it('should return a string containing only upper case letters', () => {
        const generatorStub = sinon.stub();
        const rsUnderTest = randomString({
            format: 'AXAXAXAXAXAXAXAX',
            upperCase: true,
            generator: generatorStub
        });
        generatorStub.returns('a');

        const result = rsUnderTest.generate();

        assert.strictEqual(result, result.toUpperCase());        
    });

    it('should return a string containing only lower case letters', () => {
        const generatorStub = sinon.stub();
        const rsUnderTest = randomString({
            format: 'AXAXAXAXAXAXAXAX',
            lowerCase: true,
            generator: generatorStub
        });
        generatorStub.returns('A');

        const result = rsUnderTest.generate();

        assert.strictEqual(result, result.toLowerCase());            
    });

    it('should return a string containing mixed case letters', () => {
        const generatorStub = sinon.stub();
        const rsUnderTest = randomString({
            format: 'AXAXAXAX',
            lowerCase: true,
            upperCase: true,
            generator: generatorStub
        });
        generatorStub.onCall(0).returns('A');
        generatorStub.onCall(1).returns('a');
        generatorStub.onCall(2).returns('A');
        generatorStub.onCall(3).returns('a');
        generatorStub.onCall(4).returns('A');
        generatorStub.onCall(5).returns('a');
        generatorStub.onCall(6).returns('A');
        generatorStub.onCall(7).returns('a');

        const result = rsUnderTest.generate();

        assert.strictEqual(result, 'AaAaAaAa');   
    });

    it('should return a string matching the requested format', () => {
        const generatorStub = sinon.stub();
        const rsUnderTest = randomString({
            format: 'A9XA9XA9XA9X',
            generator: generatorStub,
            charactersAlpha: 'Alpha',
            charactersNumeric: 'Numeric',
            charactersAlphaNumeric: 'AlphaNumeric'
        });
        generatorStub.withArgs('Alpha').returns('A');
        generatorStub.withArgs('Numeric').returns('9');
        generatorStub.withArgs('AlphaNumeric').returns('X');

        assert.strictEqual(rsUnderTest.generate(), 'A9XA9XA9XA9X');
    });

    it('should group the string accordingly', () => {
        const generatorStub = sinon.stub();
        const rsUnderTest = randomString({
            format: 'AAA-AAA/AAA+AAA',
            generator: generatorStub
        });
        generatorStub.returns('A');

        const result = rsUnderTest.generate();

        assert.strictEqual(result, 'AAA-AAA/AAA+AAA');         
    });
});