const {format, parse} = require('url');

module.exports = () => {
    const $ = [];

    const _type = function(o){
        return Object.prototype.toString.call(o).split(' ')[1].slice(0, -1);
    };

    const compareUrl = (uu, vv, strict) => {
        const u = parse(uu);
        const v = parse(vv);
        if(v.host.replace(/^www./, '') !== u.host.replace(/^www./, '')) return false;
        if(v.pathname.replace(/index.html$/, '') !== u.pathname.replace(/index.html$/, '')) return false;
        if(v.query === u.query) return strict;
        return !strict;
    };

    const clear = function(cb){
        $.splice(0, $.length);
        cb(null);
    };

    const count = function(cb){
        cb(null, $.length);
    };

    const add = function(a, cb){
        if(_type(a) === 'String'){
            a = [a];
        }
        if(_type(a) === 'Array'){
            a.forEach(v => {
                if(_type(v) === 'String'){
                    v = parse(v);
                    v.auth = null;
                    v = format(v);
                    $.push(v);
                } else {
                    cb(new Error('Bad data'));
                }
            });
            cb(null, a.length);
        } else {
            cb(new Error('Bad data'));
        }
    };

    const remove = function(q, cb){
        const i = $.indexOf(q);
        if(i > -1){
            $.splice(i, 1);
            cb(null, true);
        } else cb(null, false);
    };

    const find = function(q, cb){
        if(_type(q) === 'String'){
            cb(null, $.indexOf(q) !== -1);
        } else {
            cb(new Error('Bad query'));
        }
    };

    const check = function(q, cb){
        if(_type(q) !== 'String' || !/http/i.test(q)){
            cb(new Error('Bad URL for check'));
            return;
        }
        const res = {
            same: $.indexOf(q) !== -1,
            similar: $.filter(v => compareUrl(q, v, true)),
            neighbours: $.filter(v => compareUrl(q, v, false)),
            domains: {},
        };
        parse(q).hostname.split('.').forEach((v, i, a) => {
            const [key, re] = a.length === 1 ?
                [a[0], new RegExp(`:\\/\\/[^/]*${a[0]}(\\/.*|)$`, 'i')] :
                i === a.length - 1 ?
                    [a[i - 1], new RegExp(`:\\/\\/[^/]*${a[i - 1]}\\.[^/.]+`, 'i')] :
                    [a.slice(i).join('.'), new RegExp(`:\\/\\/[^/]*${a.slice(i).join('\\.')}(\\/.*|)$`, 'i')];
            res.domains[key] = $.filter(v => re.test(v)).length;
        });

        cb(null, res);
    };

    return {clear, count, add, remove, find, check};
};
