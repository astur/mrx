var tape = require('tape');
var mrx = require('../')();

tape.test('interface', function (t) {

    t.ok(typeof mrx === 'object', 'mrx is Object');

    t.ok(typeof mrx.clear === 'function', 'mrx has method "clear"');
    t.ok(typeof mrx.count === 'function', 'mrx has method "count"');
    t.ok(typeof mrx.add === 'function', 'mrx has method "add"');
    t.ok(typeof mrx.find === 'function', 'mrx has method "find"');
    t.ok(typeof mrx.check === 'function', 'mrx has method "check"');

    t.end();
});

tape.test('base', function (t) {

    t.same(mrx.count(), 0, 'new mrx is empty');
    t.throws(function(){mrx.add();},
        Error,
        'needs something to add');
    t.throws(function(){mrx.add(1);},
        Error,
        'adds only strings');

    mrx.add('http://yandex.ru/');
    mrx.add('http://rambler.ru/');

    t.same(mrx.count(), 2, 'count mrx items after 2 adds');
    t.same(mrx.find(/\.ru/).length, 2, 'find by regexp');

    mrx.add(['http://ferra.ru/', 'http://price.ru/'], 'http://ya.ru/');

    t.same(mrx.count(), 5, 'count mrx items after group add');
    t.ok(mrx.find('http://ya.ru/'), 'find by substring');

    mrx.clear();

    t.end();
});

tape.test('check', function (t) {

    mrx.add(
        ['https://sub.domain.com/bla/',
        'http://www.sub.domain.com/bla/index.html',
        'http://sub.domain.com/bla/?q=bla',
        'http://test.sub.domain.com/super/',
        'http://other.domain.com/path/?bla=bla',
        'https://domain.com/login/'],
        'http://www.domain.org/',
        ['http://domain2.com/',
        'https://sub.domain3.com/bla/index.html']
    );

    t.throws(function(){mrx.check('ftp://example.ru/');},
        Error,
        'checks only http(s) urls');

    t.same(mrx.count(), 9, 'count mrx items after group add');

    var res = mrx.check('http://sub.domain.com/bla/index.html');

    t.same(res.same, false, 'check same link');

    t.same(res.similar,
        [
        'https://sub.domain.com/bla/',
        'http://www.sub.domain.com/bla/index.html'
        ],
        'check similar links');

    t.same(res.neighbours,
        ['http://sub.domain.com/bla/?q=bla'],
        'check link neighbours');

    t.same(res.domains,
        {
            'sub.domain.com': 4,
            'domain.com': 6,
            'domain': 7
        },
        'check links on similar domains');

    mrx.add ('http://localhost/', 'https://localhost/test');

    t.same(mrx.check('http://localhost/').domains,
        {'localhost': 2},
        'check for domain w/o dots');

    mrx.clear();

    t.end();
});
