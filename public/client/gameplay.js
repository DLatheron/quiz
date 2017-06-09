/* globals WebSocket, serverAddress, gameId */
'use strict';

// Create WebSocket connection.
const socket = new WebSocket(`ws://${serverAddress}`);

// Connection opened
socket.addEventListener('open', function (event) {
    socket.send(`Hello ${gameId}`);
});

// Listen for messages
socket.addEventListener('message', function (event) {
    console.log('Message from server', event.data);
});