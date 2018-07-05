'use strict'

const fs = require('fs');
const zmq = require('zeromq');
const responder = zmq.socket('rep');

responder.on('message', data => {
    readAndReturn(data).then(response => {
        responder.send(response);
    });
});

responder.bind('tcp://*:60401', err => {
    console.log('Listening for ZMQ requesters');
});

process.on('SIGINT', () => {
    console.log('Shuttting down');
    responder.close();
});


function readAndReturn(data) {
    return new Promise((resolve, reject) => {
        const request = JSON.parse(data);
        console.log(`got request for: ${request.path}`)

        fs.readFile(request.path, (err, content) => {
            let response = JSON.stringify({
                content: content.toString(),
                timestamp: Date.now(),
                pid: process.pid
            })
            console.log(`sending response: ${response}`);
            resolve(response);
        });
    });
}