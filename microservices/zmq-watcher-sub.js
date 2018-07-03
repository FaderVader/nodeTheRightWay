'use strict'
const hostAddress = process.argv[2];

if (!hostAddress) {
    console.log('Error - no host address defined');
    process.exit();
}

const zmq = require('zeromq');
const subscriber = zmq.socket('sub');

subscriber.subscribe('');

subscriber.on('message', data => {
    const message = JSON.parse(data);
    const date = new Date(message.timestamp);
    console.log(`File "${message.file} changed at ${date}"`);
});

subscriber.connect(`tcp://${hostAddress}:60400`);