/* globals require, module */
'use strict';

const NetEvents = require('./util/NetEvents');
const ws = require('nodejs-websocket');


function gameServer(options, done) {
    let externalIPAddress = options.externalIPAddress || 'localhost';
    let server = {};
    let netEvents = new NetEvents();

    function broadcast(message, sender) {
        server.connections.forEach((client) => {
            if (client === sender) {
                return;
            }
            client.sendText(message);
        });
        console.log(message);
    }

    function buildAddress(ipAddress, port) {
        return `${externalIPAddress}:${port}`;
    }    

    server = ws.createServer({ /* secure: true */ }, (connection) => {
        connection.name = buildAddress(connection.socket.remoteAddress, connection.socket.remotePort);

        connection.sendText(`Welcome ${connection.name}\n`);
        broadcast(`${connection.name} joined the server\n`, connection);

        netEvents.add(connection);

        connection.on('text', (str) => {
            broadcast(`${connection.name}> ${str}`, connection);
        });

        connection.on('close', (code, reason) => {
            broadcast(`${connection.name} left the server: ${code} - ${reason}\n`);
            netEvents.remove(connection);
        });
    });

    server.on('error', done);
    server.on('listening', () => {
        const port = server.socket.address().port;

        // TODO: Force externalIPAddress to localhost to allow work on the train.
        externalIPAddress = 'localhost';

        console.info(`Server listening on ${buildAddress(externalIPAddress, port)}`);

        done(null, {
            address: buildAddress(externalIPAddress, port),
            ipAddress: externalIPAddress,            
            port: port,
            game: null,
            netEvents,
            close() {
                server.close();
            }
        });
    });

    server.listen(0);
}


module.exports = gameServer;
