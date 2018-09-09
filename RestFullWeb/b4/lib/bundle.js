// Provides API endpoints for working with bundles.

'use strict';

const rp = require('request-promise');

module.exports = (app, es) => {
    const url = `http://${es.host}:${es.port}/${es.bundles_index}/bundle`;


    // Create a new bundle with the specified name (p. 169)
    // curl -X POST http://<host>:<port>/api/bundle?name=<name>

    app.post('/api/bundle', (req, res) => {
        const bundle = {
            name: req.query.name || '',
            books: [],
        };

        rp.post({ url, body: bundle, json: true })
            .then(esResBody => res.status(201).json(esResBody))
            .catch(({ error }) => res.status(error.status || 502).json(error));
    });



    // Retrieve a given bundle. (p. 172)
    // curl http://<host>:<port>/api/bundle/<id>

    app.get('/api/bundle/:id', async (req, res) => {
        const options = {
            url: `${url}/${req.params.id}`,
            json: true
        };

        try {
            const esResBody = await rp(options);
            res.status(200).json(esResBody);
        } catch (esResErr) {
            res.status(esResErr.statusCode || 502).json(esResErr.error);
        }
    });


    // Retrieve a bundle based on name (jvh)
    // curl http://<host>:<port>/api/bundle/name/<name>

    app.get('/api/bundle/name/:name', async (req, res) => {
        const options = {
            url: `${url}/_search/?q=${req.params.name}&_source=name`,
            json: true
        };

        console.log(`URL: ${options.url}`);

        try {
            const esResBody = await rp(options);
            res.status(200).json(esResBody);
        } catch (esResErr) {
            res.status(esResErr.statusCode || 502).json(esResErr.error);
        }
    });



    // Update the specified bundle's name with the new name (p. 175)
    // curl -X PUT http://<host>:<port>/api/bundle/<id>/name/<name>

    app.put('/api/bundle/:id/name/:name', async (req, res) => {
        const bundleUrl = `${url}/${req.params.id}`;

        try {
            const bundle = (await rp({url: bundleUrl, json: true}))._source;
            bundle.name = req.params.name;

            const esResBody = await rp.put({url: bundleUrl, body: bundle, json: true});
            res.status(200).json(esResBody);
            // res.status(200).json('Found it.');
        } catch (esResErr) {
            res.status(esResErr || 502).json(esResErr.error);
        }
    });


    // Add a book to a bundle based on ID (p. 177 )
    // curl -s -X PUT http://<host>:<port>/api/bundle/<id>/book/<pgid>

    app.put('/api/bundle/:id/book/:pgid', async (req, res) => {
        const bundleUrl = `${url}/${req.params.id}`;
        const bookUrl = `hhtp://${es.host}:${es.port}/${es.books_index}/book/${req.params.pgid}`;

        try {
            // request the bundle and the book in parallel
            const [bundleRes, bookRes] = await Promise.all([
                rp({url: bundleUrl, json: true}),
                rp({url: bookUrl, json: true}),
            ]);

            // extract the bundle and book info from responses
            const {_source: bundle, _version: version} = bundleRes;
            const {_source: book} = bookRes;

            const idx = bundle.books.findIndex(book => book.id === req.params.pgid);
            if (idx === -1) {
                bundle.books.push({
                    id: req.params.pgid,
                    title: book.title,
                });
            }

            // put the updated bundle back in the index
            const esResBody = await rp.put({
                url: bundleUrl,
                qs: { version },
                body: bundle,
                json: true,
            });
            res.status(200).json(esResBody);

        } catch (esResErr) {
            res.status(esResErr.statusCode || 502).json(esResErr.error);
        }


    });
};