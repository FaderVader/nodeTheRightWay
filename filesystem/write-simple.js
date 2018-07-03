'use strict';

const fs = require('fs');

fs.writeFile('textOut.txt', 'Hej Verden', (err) => {
    if (err) { throw err;}

    console.log('File saved');
})
