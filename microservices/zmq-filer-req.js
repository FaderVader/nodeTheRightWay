'use strict';

const hostAddress = process.argv[2];
if (!hostAddress) {
    console.log('Error - no host specified');
    process.exit();
}

const zmq = require('zeromq');
const fileName = process.argv[3];

const requester = zmq.socket('req');

requester.on('message', data => {
    // console.log(`Raw data: ${data}`);
    const response = JSON.parse(data);
    console.log(`Recieved response: ${response.content}`);
});

requester.connect(`tcp://${hostAddress}:60401`); //'tcp://localhost:60401'

console.log(`Sending a request for: ${fileName}`);
requester.send(JSON.stringify({ path: fileName}));

