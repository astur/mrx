const test = require('ava');
const pify = require('pify');
const mrx = pify(require('.')());

test('base', async t => {
    t.is(await mrx.count(), 0);
    t.is(await mrx.add('http://ya.ru'), 1);
    t.is(await mrx.count(), 1);
    t.is(await mrx.add([
        'https://sub.domain.com/bla/',
        'http://www.sub.domain.com/bla/index.html',
        'http://sub.domain.com/bla/?q=bla',
        'http://test.sub.domain.com/super/',
        'http://other.domain.com/path/?bla=bla',
        'https://domain.com/login/',
        'http://www.domain.org/',
        'http://domain2.com/',
        'https://sub.domain3.com/bla/index.html',
        'http://localhost/',
        'https://localhost/test',
    ]), 11);
    t.is(await mrx.count(), 12);
    await t.throws(mrx.add(1));
    await t.throws(mrx.add([1]));
    t.true(await mrx.find('http://ya.ru/'));
    t.true(await mrx.remove('http://ya.ru/'));
    t.false(await mrx.remove('http://ya.ru/'));
    t.is(await mrx.count(), 11);
    t.false(await mrx.find('http://ya.ru/'));
    await t.throws(mrx.find(1));
    t.deepEqual(await mrx.check('http://sub.domain.com/bla/index.html'), {
        same: false,
        similar: [
            'https://sub.domain.com/bla/',
            'http://www.sub.domain.com/bla/index.html',
        ],
        neighbours: ['http://sub.domain.com/bla/?q=bla'],
        domains: {
            'sub.domain.com': 4,
            'domain.com': 6,
            domain: 7,
        },
    });
    t.deepEqual(await mrx.check('http://localhost/'), {
        same: true,
        similar: ['http://localhost/'],
        neighbours: [],
        domains: {localhost: 2},
    });
    await t.throws(mrx.check(1));
    await t.throws(mrx.check('1'));
    await mrx.clear();
    t.is(await mrx.count(), 0);
});
