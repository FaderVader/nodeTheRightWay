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
        }
    }
    return url +path.replace(/^\/*/, '');
}

const handleResponse = (err, res, body) => {
    if (program.json) {
        console.log(JSON.stringify(err || body));
    } else {
        if (err) throw (err);
        console.log(body);
    }
}


program // config of available options for application
.version(pkg.version)
.description(pkg.description)
.usage('[options] <command> [...]')
.option('-o, --host <hostname>', 'hostname [localhost]', 'localhost')
.option('-p, --port <number>', 'port number [9200]', '9200')
.option('-j, --json', 'format output as json')
.option('-i, --index <name>', 'which index to use')
.option('-t, --type <type>', 'default type for bulk operations');

program     // define command >url<
.command('url [path]')
.description('generate the URL for the options and path (default is /)')
.action((path = '/') =>  console.log(fullUrl(path)))

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
    })
})

program     // define command >create-index< using REST PUT
.command('create-index')
.description('create an index')
.action(() => {
    if (!program.index) {
        const msg = 'No index specified - use --index <name>';
        if (!program.json) throw Error(msg);
        console.log(JSON.stringify({error: msg}));
        return;
    }
    request.put(fullUrl(), handleResponse);
})

program     // define command >list-indices<
.command('list-indices')
.alias('li')
.description('Get a list of indices in this cluster')
.action(() => {
    const path = program.json ? '_all' : '_cat/indices?v';
    request({url: fullUrl(path), json: program.json}, handleResponse);
})

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
        }
        const req = request.post(options);
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