'use strict';
const fs = require('fs');
const spawn = require('child_process').spawn;
const fileName = process.argv[2] //'target.txt'


if (!fileName) {
    console.log('Error: no filename was provided as argument.');
}

fs.watch(fileName, () => {
    const ls = spawn('ls', ['-l', '-h', fileName]);
    let output = '';

    // 'chunck' references the buffer-object in the 'data' event 
    ls.stdout.on('data', chunk => output += chunk);

    ls.on('close', () => {
        const parts = output.split(/\s+/);
        output = parts.reduce((acc, value) => {
            if (value) 
                return acc += value + ' ';            
            return acc;
        })
        console.log(output);
    })
});

console.log(`Now watching ${fileName}`);