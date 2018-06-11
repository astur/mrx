const test = require('ava');
const m = require('.');

test('base', t => {
    t.pass();
    t.is(m, m);
});
