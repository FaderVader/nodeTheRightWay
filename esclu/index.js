const fs = require('fs');
const request = require('request');
const program = require('commander');
const pkg = require('./package.json');

const fullUrl = (path = '') => {
    let url = `http://${program.host}:${program.port}/`;
    if (program.index) {
        url += program.index + '/';
        if (program.type) {
            url += program.type + '/';
            if (program.id) {
                url += program.id + '/'
            }
        }
    }

    return url + path.replace(/^\/*/, '');
};

const handleResponse = (err, res, body) => {
    if (program.json) {
        console.log(JSON.stringify(err || body));
    } else {
        if (err) throw (err);
        console.log(body);
    }
};


program // config of available options for application
    .version(pkg.version)
    .description(pkg.description)
    .usage('[options] <command> [...]')
    .option('-o, --host <hostname>', 'hostname [linux]', '192.168.1.103')
    .option('-p, --port <number>', 'port number [9200]', '9200')
    .option('-j, --json', 'format output as json')
    .option('-i, --index <name>', 'which index to use')
    .option('-t, --type <type>', 'default type for bulk operations')
    .option('-f, --filter <filter>', 'source filter fra query results')
    .option('-d, --id <id>', 'id of entry')

program     // define command >url<
    .command('url [path]')
    .description('generate the URL for the options and path (default is /)')
    .action((path = '/') => console.log(fullUrl(path)));

program     // define command >get<
    .command('get [path]')
    .description('perform a HTTP GET request for path (default is /)')
    .action((path = '/') => {
        const options = {
            url: fullUrl(path),
            json: program.json,
        };
        request(options, (err, res, body) => {
            if (program.json) {
                console.log(JSON.stringify(err || body));
            } else {
                if (err) throw err;
                console.log(body);
            }
        });
    });

program     // define command >create-index< using REST PUT
    .command('create-index')
    .description('create an index')
    .action(() => {
        if (!program.index) {
            const msg = 'No index specified - use --index <name>';
            if (!program.json) throw Error(msg);
            console.log(JSON.stringify({ error: msg }));
            return;
        }
        request.put(fullUrl(), handleResponse);
    });

program     // define command >list-indices<
    .command('list-indices')
    .alias('li')
    .description('Get a list of indices in this cluster')
    .action(() => {
        const path = program.json ? '_all' : '_cat/indices?v';
        request({ url: fullUrl(path), json: program.json }, handleResponse);
    });

program
    .command('bulk <file>')
    .description('read and perform bulk options from the specified file')
    .action(file => {
        fs.stat(file, (err, stats) => {
            if (err) {
                if (program.json) {
                    console.log(JSON.stringify(err));
                    return;
                }
                throw err;
            }
            const options = {
                url: fullUrl('_bulk'),
                json: true,
                headers: {
                    'content-length': stats.size,
                    'content-type': 'application/json'
                }
            };
            const req = request.post(options); // assign the request-object to a variable
            const stream = fs.createReadStream(file); // acquire a stream of the file to send
            stream.pipe(req); // send the file-stream to the req-object
            req.pipe(process.stdout); // and recieve/pipe the answer back to console.
        });
    });

program
    .command('query [queries...]')
    .alias('q')
    .description('perform an ElasticSearch query')
    .action((queries = []) => {
        const options = {
            url: fullUrl('_search'),
            json: true,
            qs: {},
        };
        if (queries && queries.length) {
            options.qs.q = queries.join(' ');            
        }

        if (program.filter) {
            options.qs._source = program.filter
        }

        request(options, handleResponse);
    })

program
.command('delete <id>')
.alias('del')
.description('delete a record designated by it`s id.')
.action((id) => {
    if (!id) {
        msg = 'User must specify an id to delete';
        if (!program.json) throw new Error(msg);
        console.log(JSON.stringify({error: msg}));
    }

    options = {
        url: fullUrl(id),
        json: program.json,
    };
    request.del(options, handleResponse);
    // console.log(options);
})

program
    .command('put <file>')
    .alias('p')
    .description('send a single file to the database')
    .action(file => {
        if (!file) {
            const msg = 'User must specify a file to upload.'
            if (!program.json) throw new Error(msg);
            console.log(JSON.stringify({error : msg}));
            return;
        }

        fs.stat(file, (err, stats) => {
            if (err) {
                if (program.json) {
                    console.log(JSON.stringify(err));
                    return;
                }
                throw err;
            }
            const options = {
                url: fullUrl(),
                json: true,
                headers: {
                    'content-length' : stats.size,
                    'content-type' : 'application/json'
                }
            };

            // console.log(options);
            const req = request.put(options);
            const stream = fs.createReadStream(file);
            stream.pipe(req);
            req.pipe(process.stdout);
        })
    })


// invoked when run
program.parse(process.argv);

if (!program.args.filter(arg => typeof arg === 'object').length) {
    program.help();
}