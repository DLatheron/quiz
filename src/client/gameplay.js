/* globals WebSocket, serverAddress, gameId */
'use strict';

const wsMain = require('../../node_modules/json-websockets/lib/main');

const ws = wsMain.client({ host: 'localhost', port: 8080, verbose: true });

ws.connect.on('connect', () => {
    ws.send('hello', 'client here');
});

ws.connect.on('welcome', (id, callback) => {
    callback(id);
});

// // Create WebSocket connection.
// const socket = new WebSocket(`ws://${serverAddress}`);

// // Connection opened
// socket.addEventListener('open', function (event) {
//     socket.send(`Hello ${gameId}`);
// });

// // Listen for messages
// socket.addEventListener('message', function (event) {
//     console.log('Message from server', event.data);
// });