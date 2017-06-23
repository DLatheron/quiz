/* globals WebSocket, NetEvents, gameServerAddress, gameServerPort, gameId */
'use strict';

const ws = new WebSocket(`ws://${gameServerAddress}:${gameServerPort}`);
//const netEvents = new NetEvents();

ws.onopen = (event) => {
    console.log('WebSocket connection opened');

    //netEvents.add(event);

    ws.send(`JOIN ${gameId}`);    
};

ws.onmessage = (event) => {
    console.log(event.data);
};

ws.onerror = (event) => {
    console.log(`WebSocket connection error: ${event.error}`);
};

ws.onclose = (event) => {
    console.log('WebSocket connection closed');
};
