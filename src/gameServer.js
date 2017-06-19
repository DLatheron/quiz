/* globals require, module */
'use strict';

const NetEvents = require('./common/NetEvents');
const ws = require('nodejs-websocket');
const _ = require('lodash');

class GameServer {
    constructor(options) {
        this.externalIPAddress = _.get(options, 'externalIPAddress') || 'localhost';
        this.port = _.get(options, 'port') || undefined;
        this.netEvents = new NetEvents();
        this.server = ws.createServer({ /* secure: true */ }, (connection) => {
            connection.name = this.buildAddress(connection.socket.remoteAddress, connection.socket.remotePort);

            connection.sendText(`Welcome ${connection.name}\n`);
            this.broadcast(`${connection.name} joined the server\n`, connection);

            this.netEvents.add(connection);

            // connection.on('text', (str) => {
            //     this.broadcast(`${connection.name}> ${str}`, connection);
            // });

            connection.on('close', (code, reason) => {
                this.broadcast(`${connection.name} left the server: ${code} - ${reason}\n`);
                this.netEvents.remove(connection);
            });
        });
    }

    static buildAddress(ipAddress, port) {
        return `${ipAddress}:${port}`;
    }     

    start(callback) {
        this.server.on('listening', () => {
            this.port = this.server.socket.address().port;

            const address = this.buildAddress(this.externalIPAddress, this.port);
        
            console.info(`Server listening on ${address}`);

            callback(null);
        });
        this.server.on('error', (error) => {
            console.error(`GameServer reported an error ${error}.`);
        });

        this.server.listen(this.port);
    }

    stop() {
        this.server.close();
    }

    broadcast(message, sender) {
        this.server.connections.forEach((connection) => {
            if (connection === sender) { return; }
            connection.sendText(message);
        });
    }

    send(connection, message) {
        connection.sendText(message);
    }
}

// function gameServer(options, done) {
//     let externalIPAddress = options.externalIPAddress || 'localhost';
//     let server = {};
//     let netEvents = new NetEvents();

//     function broadcast(message, sender) {
//         server.connections.forEach((client) => {
//             if (client === sender) {
//                 return;
//             }
//             client.sendText(message);
//         });
//         console.log(message);
//     }

//     function buildAddress(ipAddress, port) {
//         return `${externalIPAddress}:${port}`;
//     }    

//     server = ws.createServer({ /* secure: true */ }, (connection) => {
//         connection.name = buildAddress(connection.socket.remoteAddress, connection.socket.remotePort);

//         connection.sendText(`Welcome ${connection.name}\n`);
//         broadcast(`${connection.name} joined the server\n`, connection);

//         netEvents.add(connection);

//         connection.on('text', (str) => {
//             broadcast(`${connection.name}> ${str}`, connection);
//         });

//         connection.on('close', (code, reason) => {
//             broadcast(`${connection.name} left the server: ${code} - ${reason}\n`);
//             netEvents.remove(connection);
//         });
//     });

//     server.on('error', done);
//     server.on('listening', () => {
//         const port = server.socket.address().port;

//         // TODO: Force externalIPAddress to localhost to allow work on the train.
//         externalIPAddress = 'localhost';

//         console.info(`Server listening on ${buildAddress(externalIPAddress, port)}`);

//         done(null, {
//             address: buildAddress(externalIPAddress, port),
//             ipAddress: externalIPAddress,            
//             port: port,
//             game: null,
//             netEvents,
//             broadcast,
//             close() {
//                 server.close();
//             }
//         });
//     });

//     server.listen(0);

//     return server;
// }


// module.exports = gameServer;
module.exports = GameServer;
