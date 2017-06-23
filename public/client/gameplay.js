/* globals WebSocket, gameServerAddress, gameServerPort, gameId */
'use strict';

// const wsMain = require('../../node_modules/json-websockets/lib/main');

// const ws = wsMain.client({ host: gameServerAddress, port: gameServerPort, verbose: true });

// ws.connect.on('connect', () => {
//     ws.send('hello', 'client here');
// });

// ws.connect.on('welcome', (id, callback) => {
//     callback(id);
// });

const ws = new WebSocket(`ws://${gameServerAddress}:${gameServerPort}`);

ws.onopen = (event) => {
    console.log('WebSocket connection opened');

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

/*


const WebSocketClient = require('websocket').client;

// Create WebSocket connection.
const wsClient = new WebSocketClient();

wsClient.on('connectFailed', (error) => {
    console.log('Connect Error: ' + error.toString());
});

// Connected.
wsClient.addEventListener('connect', (connection) => {
    console.log('WebSocket Client Connected');
    connection.on('error', (error) => {
        console.log(`Connection Error: ${error.toString()}`);
    });
    connection.on('close', () => {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', (message) => {
        if (message.type === 'utf8') {
            console.log(`Received: '${message.utf8Data}'`);
            // TODO: Process using netEvents.
        }
    });

    wsClient.send(`JOIN ${gameId}`);
});

// Open the connection.
wsClient.connect(`ws://${gameServerAddress}:${gameServerPort}`, 'echo-protocol');
*/