'use strict';
const fs = require('fs');
fs.readFile('target.txt', (err, file) => {
    if (err) throw err;

    console.log(file.toString());
})