/* globals require, module */
'use strict';

const net = require('net');


function gameServer(game, options, done) {
    const externalIPAddress = options.externalIPAddress || 'localhost';
    const clients = [];

    function broadcast(message, sender) {
        clients.forEach((client) => {
            if (client === sender) {
                return;
            }
            client.write(message);
        });
        console.log(message);
    }

    const server = net.createServer((socket) => {
        socket.name = socket.remoteAddress + ':' + socket.remotePort;

        clients.push(socket);

        socket.write(`Welcome ${socket.name}\n`);
        broadcast(`${socket.name} joined the server\n`, socket);

        socket.on('data', (data) => {
            broadcast(`${socket.name}> ${data}`, socket);
        });

        socket.on('end', () => {
            clients.splice(clients.indexOf(socket), 1);
            broadcast(`${socket.name} left the server\n`);
        });
    });

    server.on('error', done);
    server.on('listening', () => {
        console.info(`Server listening on ${server.address().address} ${server.address().port}`);

        done(null, {
            address: `${externalIPAddress}:${server.port}`,
            close() {
                server.close();
            }
        });
    });

    server.listen();
}


module.exports = gameServer;
