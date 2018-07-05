'use strict';

const zmq = require('zeromq');
const fileName = process.argv[2];

const requester = zmq.socket('req');

requester.on('message', data => {
    // console.log(`Raw data: ${data}`);
    const response = JSON.parse(data);
    console.log(`Recieved response: ${response.content}`);
});

requester.connect('tcp://localhost:60401');

console.log(`Sending a request for: ${fileName}`);
requester.send(JSON.stringify({ path: fileName}));

