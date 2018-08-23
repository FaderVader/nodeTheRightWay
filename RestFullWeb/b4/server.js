'use strict';

const express = require('express');
const morgan = require('morgan');
const nconf = require('nconf');
const pkg = require('../package.json');

nconf.argv().env('__'); // determines settings hierachy: arg overrides environment overrides nconf-setttings.
// = 'earlier ones stick'

nconf.defaults({conf: `${__dirname}/config.json`});
nconf.file(nconf.get('conf'));

const app = express();
app.use(morgan('dev'));
app.get('/api/version', (req, res) => {
    res.status(200).send(pkg.version);
});

// the app instance is passed to the required module (search.js)
require('./lib/search.js')(app, nconf.get('es'));

app.listen(nconf.get('port'), () => {
    console.log(`Ready @ port ${nconf.get('port')}`);
});