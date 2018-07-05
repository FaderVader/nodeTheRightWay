'use strict';

const hostAddress = process.argv[2];
const fileName = process.argv[3];
if (!(hostAddress && fileName)) {
    console.log('Error - no host or target-file specified ');
    process.exit();
}

const zmq = require('zeromq');
const requester = zmq.socket('req');

requester.on('message', data => {    
    const response = JSON.parse(data);
    console.log(`Recieved response: ${response.content}`);
});

requester.connect(`tcp://${hostAddress}:60401`);

console.log(`Sending a request for: ${fileName}`);
requester.send(JSON.stringify({ path: fileName}));

