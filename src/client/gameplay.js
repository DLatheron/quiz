/* globals WebSocket, gameServerAddress, gameServerPort, gameId */
'use strict';

const NetEvents = require('../common/NetEvents');

const ws = new WebSocket(`ws://${gameServerAddress}:${gameServerPort}`);

const netEvents = new NetEvents();

ws.on = (type, data) => { 
    console.log(`[${type}] ${data}`);
};

ws.onopen = (event) => {
    console.log('WebSocket connection opened');

    netEvents.add(ws);

    ws.send(`JOIN ${gameId}`);    
};

ws.onmessage = (event) => {
    console.log(event.data);
    ws.on('text', event.data);
};

ws.onerror = (event) => {
    console.log(`WebSocket connection error: ${event.error}`);
    ws.on('error', event.error);
};

ws.onclose = (event) => {
    console.log('WebSocket connection closed');
};
