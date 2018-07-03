'use strict';
const serverAddres = process.argv[2];

if (!serverAddres) {
    console.log('Error: no server address specified');
    process.exit();
}

const net = require('net');
const client = net.connect({ port: 60300, host: serverAddres });  //'192.168.1.199'


client.on('data', data => {
    const message = JSON.parse(data);

    if (message.type === 'watching') {
        console.log(`Now watching ${message.file}`);
    } else if (message.type === 'changed') {
        const date = new Date(message.timestamp);
        console.log(`File changed: ${date}`)
    } else {
        console.log(`Unrecognized message type: ${message.type}`);
    }
})

client.on('error', (error) => {
    console.log(`Error while connecting to: ${serverAddres}`);
})