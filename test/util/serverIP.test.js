/* globals describe, it, beforeEach, afterEach */
'use strict';

const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const externalIPNamespace = {
    externalIP: require('external-ip')
};


describe('#serverIP', () => {
    let sandbox;
    let serverIP;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.verify();
        sandbox.restore();
    });

    it('should attempt to resolve the external IP address', (done) => {
        const getIPMock = sandbox.mock()
            .once()
            .yields();
        sandbox.stub(externalIPNamespace, 'externalIP')
            .returns(getIPMock);

        serverIP = proxyquire('../../src/util/serverIP', {
            'external-ip': externalIPNamespace.externalIP
        });
            
        serverIP(() => {
            done();
        });
    });

    it('should report an error if resolving the external IP address fails', (done) => {
        const expectedError = {
            error: 'An error occurred'
        };
        sandbox.stub(externalIPNamespace, 'externalIP')
            .returns(sandbox.stub().yields(expectedError));

        serverIP = proxyquire('../../src/util/serverIP', {
            'external-ip': externalIPNamespace.externalIP
        });
            
        serverIP((error) => {
            assert.strictEqual(error, expectedError);
            done();
        });
    });

    it('should resolve the address based on it\'s external IP address', (done) => {
        const expectedIPAddress = '123.456.789.012';
        sandbox.stub(externalIPNamespace, 'externalIP')
            .returns(sandbox.stub().yields(null, expectedIPAddress));

        serverIP = proxyquire('../../src/util/serverIP', {
            'external-ip': externalIPNamespace.externalIP
        });
            
        serverIP((error, externalIP) => {
            assert(!error);
            assert.strictEqual(externalIP, expectedIPAddress);
            done();
        });
    });
});
