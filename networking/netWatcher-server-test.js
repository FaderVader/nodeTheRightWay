'use strict';

const server = require('net').createServer(connection => {
    console.log('Client connected');


    const firstChunk = '{"type": "changed", "timesta';
    const secondChunk = 'mp": 1450694370094}\n';

    connection.write(firstChunk);    

    const timer = setTimeout(() => {
        connection.write(secondChunk);        
        connection.end;
    }, 200);    

    connection.on('end', () => {
        console.log('Client disconnected');
    });
});

server.listen(60300, function() {
    console.log('Test server is listening for you!');
});