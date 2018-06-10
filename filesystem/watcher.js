'use strict';
const fs = require('fs');
const spawn = require('child_process').spawn;
const fileName = process.argv[2] //'target.txt'
const appName = process.argv[3];
const pingTarget = process.argv[4];

if (!fileName) {
    console.log('Error: no filename was provided as argument.');
}

fs.watch(fileName, () => {
    let prc ;

    if (appName) {
        prc = spawn(appName, [pingTarget]);
        console.log(`Now pinging ${pingTarget}`);
    } else {
        prc = spawn('ls', ['-l', '-h', fileName]);
        console.log(`Now watching ${fileName}`);
    }
    prc.stdout.pipe(process.stdout);
});

console.log(`Now watching ${fileName}`);





// () => console.log(`File ${fileName} was changed`)