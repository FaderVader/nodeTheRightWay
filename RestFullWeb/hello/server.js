'use strict'

const morgan = require('morgan');
const port = 6000;

const express = require('express');
const app = express(); // instantiate the functional component from express

app.use(morgan('dev')); // insert morgan into the req/res chain

app.get('/hello/:name', (req, res) => {
    res.status(200).json({'Hello:': req.params.name})
});

app.listen(port, () => { console.log(`Server ready on port: ${port}`)});
