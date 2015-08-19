var tape = require('tape');
var mrx = require('../');

tape.test('base', function (t) {

    t.ok(typeof mrx === 'function', 'mrx is Function');

    t.end();
});