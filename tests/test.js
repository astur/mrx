var tape = require('tape');
var MRX = require('../');
var mrx = MRX();

tape.test.skip('interface', function (t) {

    t.ok(typeof MRX === 'function', 'MRX is Function');
    t.ok(typeof mrx === 'object', 'mrx is Object');

    t.ok(typeof mrx.clear === 'function', 'mrx has method "clear"');
    t.ok(typeof mrx.count === 'function', 'mrx has method "count"');
    t.ok(typeof mrx.add === 'function', 'mrx has method "add"');
    t.ok(typeof mrx.get === 'function', 'mrx has method "get"');
    t.ok(typeof mrx.last === 'function', 'mrx has method "last"');
    t.ok(typeof mrx.find === 'function', 'mrx has method "find"');
    t.ok(typeof mrx.load === 'function', 'mrx has method "load"');
    t.ok(typeof mrx.save === 'function', 'mrx has method "save"');

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
    t.same(mrx.find('.ru').length, 2, 'find by substring');

    mrx.add(['http://ferra.ru/', 'http://price.ru/'], 'http://ya.ru/');

    t.same(mrx.count(), 5, 'count mrx items after group add');
    t.same(mrx.last(), 'http://ya.ru/', 'get last item');
    t.same(mrx.get(0), 'http://yandex.ru/', 'get first item');

    mrx.save(__dirname + '/links.raw');

    mrx.clear();
    t.same(mrx.count(), 0, 'empty mrx');
    
    mrx.load(__dirname + '/links.raw');

    t.same(mrx.count(), 5, 'loaded from file');

    require('fs').unlinkSync(__dirname + '/links.raw');

    t.end();
});
