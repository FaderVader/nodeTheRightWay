'use strict';
const fs = require('fs');
const net = require('net');
const fileName = process.argv[2];

if (!fileName) {
    throw Error('Error: no filename provided.');
}

net.createServer(connection => {
    console.log('Subscriber connected');
    connection.write(`Now watching "${fileName}" for changes...\n`);

    const watcher =
        fs.watch(fileName, () => connection.write(`File changed: ${new Date()}\n`));

    connection.on('close', () => {
        console.log('Client disconnected.')
        watcher.close();
    })
}).listen(60300, () => console.log('Now listening for clients.'));