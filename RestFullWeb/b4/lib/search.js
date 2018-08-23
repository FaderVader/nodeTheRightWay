// Provides API endpoints for searching the books index (ES).

'use strict';

const request = require('request');

// the app variable is supplied at the consumer (b4/server.js) when the module is required 
// = module injection
module.exports = (app, es) => {

    const url = `http://${es.host}:${es.port}/${es.books_index}/book/_search`;
    
    // Search for books by matching a particular field value.
    // Example: api/search/books/author/Twain
    app.get('/api/search/books/:field/:query', (req, res) => {

        console.log(url);

        const esReqBody = {
            size: 10,
            query: {
                match: {
                    [req.params.field]: req.params.query
                }
            }
        };

        const options = { url, json: true, body: esReqBody };

        request.get(options, (err, esRes, esResBody) => {
            if (err) {
                res.statusCode(502).json({
                    error: 'bad gateway',
                    reason: err.code
                });
                return;
            }
            if (esRes.statusCode !== 200) {
                res.status(esRes.statusCode).json(esResBody);
                return;
            }

            res.status(200).json(esResBody.hits.hits.map(({ _source }) => _source));

            // The expression in json() above is identical to:
            //
            // resBody.hits.hits.map(hit => {
            //  const {_source} = hit;
            //  return _source;
            // )};
        });
    });
};



