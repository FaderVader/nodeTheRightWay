'use strict'

// const assert = require('assert');
const assert = require('chai').assert;
const EventEmitter = require('events').EventEmitter;
const ldjClient = require('../lib/ldj-client');

describe('NoArgForConstructor', () => {
    let client = null;

    it('should fail for an empty stream-argument', () => {        
            assert.throws(() => {
                client = new ldjClient();
            }, Error);             
    })
})


describe('LDJclient', () => {
    let stream = null;
    let client = null;

    beforeEach(() => {
        stream = new EventEmitter();
        client = new ldjClient(stream);
    });

    it('should emit a message event from a single data event', done => {
        client.on('message', message => {
            assert.deepEqual(message, {foo: 'bar'});
            done();
        });
        stream.emit('data', '{"foo":')
        process.nextTick(() => {
            stream.emit('data', '"bar"}\n');
        })
    });
});



// describe('BadJsonFormat', () => {
//     let stream = null;
//     let client = null;

//     beforeEach(() => {
//         stream = new EventEmitter();
//         client = new ldjClient(stream);
//     });

//     it('should fail for receiving badly formatted data', done => {
//         assert.throws(() => {
//             assert.isDefined(() => {  // doesNotThrow
//                 client.on('message', message => {
//                     // assert.hasAnyKeys(message, ['type'])
//                     let result = message.type;
//                     done();
//                 })
//             }, 'Not defined')
//         }, Error)
              
//         stream.emit('data', '{"notJson"}\n'); //'notJson\n' // {type: "test", message: "no data"}
//     })
// })