module.exports = () => {
    const $ = [];

    const _type = function(o){
        return Object.prototype.toString.call(o).split(' ')[1].slice(0, -1);
    };
    const pureUrl = function(url){
        if(/\/\/[^/]+$/i.test(url)){
            url += '/';
        }
        return url;
    };
    const urlParse = function(url){
        const re = /https?:\/\/(?:www\.)?([^/]+)\/([^?]+)?(\?[^#]*)?(#.*)?/i;
        url = url.match(re);
        if(url[2]){
            url[2] = url[2].replace('index.html', '');
        }
        return url;
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
            a.forEach(a => {
                if(_type(a) === 'String'){
                    a = pureUrl(a);
                    $.push(a);
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
        const u = urlParse(q);
        const res = {
            same: $.indexOf(q) !== -1,
            similar: $.filter(v => {
                v = urlParse(v);
                return v[1] === u[1] && v[2] === u[2] && v[3] === u[3];
            }),
            neighbours: $.filter(v => {
                v = urlParse(v);
                return v[1] === u[1] && v[2] === u[2] && v[3] !== u[3];
            }),
            domains: {},
        };

        u[1].split('.').forEach((v, i, a) => {
            let re;
            let key;
            if(a.length === 1){
                re = `:\\/\\/[^/]*${a[0]}(\\/.*|)$`;
                key = a[0];
            } else if(i === a.length - 1){
                re = `:\\/\\/[^/]*${a[i - 1]}\\.[^/.]+`;
                key = a[i - 1];
            } else {
                re = `:\\/\\/[^/]*${a.slice(i).join('\\.')}(\\/.*|)$`;
                key = a.slice(i).join('.');
            }
            re = new RegExp(re, 'i');
            res.domains[key] = $.filter(v => re.test(v)).length;
        });

        cb(null, res);
    };

    return {clear, count, add, remove, find, check};
};
