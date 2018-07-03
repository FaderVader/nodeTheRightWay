'use strict';
const serverAddress = process.argv[2];

if (!serverAddress) {
    console.log('Error - no host specified');
    process.exit();
}

const netClient = require('net').connect({port:60300, host: serverAddress});
const ldjClient = require('./lib/ldj-client').connect(netClient);

ldjClient.on('message', message => {
    if (message.type === "watching") {
        console.log(`Now watching: ${message.file}`);
    } else if (message.type === 'changed') {
        console.log(`File changed: ${new Date(message.timestamp)}`);
    } else {
        throw Error(`Unrecognized message type: ${message.type}`);
    }
})

ldjClient.on('error', error => {
    console.log(`Error: ${error.message}`);
})