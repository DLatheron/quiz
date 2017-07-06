/* globals gameServerAddress, gameServerPort, gameId */
'use strict';

const SocketReceiver = require('../common/SocketReceiver');

const socketReceiver = new SocketReceiver({
    gameServerAddress,
    gameServerPort,
    gameId
});

socketReceiver.start();

socketReceiver.on('open', () => {
    console.log('SocketReceiver is open');
});

socketReceiver.on('closed', () => {
    console.log('SocketReceiver is closed');
});

socketReceiver.on('error', (error) => {
    console.log(`SocketReceiver has errored ${error}`);
});

socketReceiver.on('text', (text) => {
    console.log(`SocketReceiver received message '${text}'`);
});

/*

// Wrapper to allow use of NetEvents on the client and server.
ws.on = (type, data) => { 
    console.log(`ws.on [${type}] ${data}`);
};

ws.onopen = (event) => {
    console.log('WebSocket connection opened');

    netEvents.add(ws);

    netEvents.on('JOINED', (connection) => {
        console.log('NET EVENTS FIRED!!!');
        const playerName = `Player_${connection.name}`;
        connection.send(`NAME ${playerName}`);
    });

    ws.send(`JOIN ${gameId}`);
};

ws.onmessage = (event) => {
    console.log(`ws.onmessage ${event.data}`);
    ws.on('text', event.data);
};

ws.onerror = (event) => {
    console.log(`WebSocket connection error: ${event.error}`);
    ws.on('error', event.error);
};

ws.onclose = (event) => {
    console.log('WebSocket connection closed');
};
*/