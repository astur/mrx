var tape = require('tape');
var mrx = require('../')();

tape.test.skip('interface', function (t) {

    t.ok(typeof mrx === 'object', 'mrx is Object');

    t.ok(typeof mrx.clear === 'function', 'mrx has method "clear"');
    t.ok(typeof mrx.count === 'function', 'mrx has method "count"');
    t.ok(typeof mrx.add === 'function', 'mrx has method "add"');
    t.ok(typeof mrx.find === 'function', 'mrx has method "find"');
    t.ok(typeof mrx.check === 'function', 'mrx has method "check"');

    t.end();
});

tape.test('start', function (t) {
    t.plan(1);
    mrx.count(function(e, r){
        t.same([e, r], [null, 0], 'new mrx is empty');
    });
});

tape.test('add string', function (t) {
    t.plan(2);
    mrx.add('http://ya.ru', function(e, r){
        t.same([e, r], [null, 1], '1 url added');
        mrx.count(function(e, r){
            t.same([e, r], [null, 1], '1 item in mrx');
        });
    });
});

tape.test('add array', function (t) {
    var a = [
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
        'https://localhost/test'];
    t.plan(2);
    mrx.add(a, function(e, r){
        t.same([e, r], [null, 11], '11 urls added');
        mrx.count(function(e, r){
            t.same([e, r], [null, 12], '12 items in mrx');
        });
    });
});


tape.test('find and remove', function (t) {
    t.plan(4);
    mrx.find('http://ya.ru/', function(e, r){
        t.same([e, r], [null, true], 'find existing url');
        mrx.remove('http://ya.ru/', function(e, r){
            t.same([e, r], [null, true], '1 item removed');
            mrx.count(function(e, r){
                t.same([e, r], [null, 11], '11 items in mrx');
                mrx.find('http://ya.ru/', function(e, r){
                    t.same([e, r], [null, false], 'non existing url');
                });
            });
        });
    });
});

tape.test('check1', function (t) {
    t.plan(5);
    mrx.check('http://sub.domain.com/bla/index.html', function(e, r){
        t.same(e, null, 'check passed');
        t.same(r.same, false, 'no same urls');
        t.same(r.similar,
            [
            'https://sub.domain.com/bla/',
            'http://www.sub.domain.com/bla/index.html'
            ],
            'check similar links');
        t.same(r.neighbours,
            ['http://sub.domain.com/bla/?q=bla'],
            'check link neighbours');
        t.same(r.domains,
            {
                'sub.domain.com': 4,
                'domain.com': 6,
                'domain': 7
            },
            'check links on similar domains');
    });
});

tape.test('check2', function (t) {
    t.plan(3);
    mrx.check('http://localhost/', function(e, r){
        t.same(e, null, 'check passed');
        t.same(r.same, true, 'same url found');
        t.same(r.domains, {'localhost': 2}, 'check for domain w/o dots');
    });
});

tape.test('check2', function (t) {
    t.plan(2);
    mrx.clear(function(e){
        t.same(e, null, 'mrx cleared');
        mrx.count(function(e, r){
            t.same([e, r], [null, 0], 'mrx is empty');
        });
    });
});