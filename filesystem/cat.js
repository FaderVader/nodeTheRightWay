#!/usr/bin/env node
'use strict';
// require('fs').createReadStream(process.argv[2]).pipe(process.stdout);
require('fs').createReadStream(process.argv[2])
.on('data', chunk => process.stdout.write(`${chunk}\n`))
.on('error', err => process.stderr.write(`Error: ${err.message}\n`))

console.log("At end of code.");