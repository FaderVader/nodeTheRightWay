'use strict'

const fs = require('fs');
const zmq = require('zeromq');
const responder = zmq.socket('rep');

responder.on('message', data => {
    readAndReturn(data).then(response => {
        responder.send(response);
    })
    .catch(err => {
        console.log(`Got error: ${err.message}`)
        responder.send(JSON.stringify({
            content: 'Error while accessing file'
        }));
    })
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

            readFile(request.path)
            .then(response => { resolve(response)})
            .catch(err => { reject(err)})
    });
}

function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, content) => {
            if (err) { return reject(err)}

            let response = JSON.stringify({
                content: content.toString(),
                timestamp: Date.now(),
                pid: process.pid
            });
            resolve(response)
        })
    })
}