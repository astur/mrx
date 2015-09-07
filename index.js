function MRX(){

    if(!(this instanceof MRX)) {return new MRX();}

    var $ = [];
    var _type = function(o){
        return Object.prototype.toString.call(o).split(' ')[1].slice(0,-1);
    };
    var pureUrl = function(url){
        if(/\/\/[^/]+$/i.test(url)){
            url = url + '/';
        }
        return url;
    };
    var urlParse = function(url){
        var re = /https?:\/\/(?:www\.)?([^/]+)\/([^?]+)?(\?[^#]*)?(#.*)?/i;
        url = url.match(re);
        if(url[2]) {
            url[2] = url[2].replace('index.html', '');
        }
        return url;
    };

    this.clear = function(cb){
        $ = [];
        if(cb){cb(null);}
    };

    this.count = function(cb){
        if(cb){cb(null, $.length);}
    };

    this.add = function(a, cb){
        if (_type(a) === 'String') {
            a = [a];
        }
        if (_type(a) === 'Array') {
            a.forEach(function(a) {
                if (_type(a) === 'String') {
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

    this.remove = function(q, cb){
        var i = $.indexOf(q);
        if (i > -1) {
            $.splice(i, 1);
            if(cb){cb(null, true);}
        } else {
            if(cb){cb(null, false);}
        }
    };

    this.find = function(q, cb){
        if (_type(q) === 'String') {
            cb(null, $.indexOf(q) !== -1);
        } else {
            cb(new Error('Bad query'));
        }
    };

    this.check = function(q, cb){
        if (_type(q) !== 'String' || !/http/i.test(q)) {
            cb(new Error('Bad URL for check'));
            return;
        }
        var u = urlParse(q);
        //console.log(q);////////
        var res = {
            same: $.indexOf(q) !== -1,
            similar: $.filter(function(v) {
                v = urlParse(v);
                return v[1] === u[1] && v[2] === u[2] && v[3] === u[3];
            }),
            neighbours: $.filter(function(v) {
                v = urlParse(v);
                return v[1] === u[1] && v[2] === u[2] && v[3] !== u[3];
            }),
            domains: {}
        };

        var a = u[1].split('.');
        var re, key;
        function dCheck(v) {return re.test(v);}

        for(var i = 0; i < a.length; i++) {
            if (a.length === 1) {
                re = ':\\/\\/[^/]*' + a[0] + '(\\/.*|)$';
                key = a[0];
            } else if (i === a.length - 1) {
                re = ':\\/\\/[^/]*' + a[i-1] + '\\.[^/.]+';
                key = a[i-1];
            } else {
                re = a.slice(i).join('\\.');
                re = ':\\/\\/[^/]*' + re + '(\\/.*|)$';
                key = a.slice(i).join('.');
            }
            re = new RegExp(re, 'i');
            res.domains[key] = $.filter(dCheck).length;
        }

        cb(null, res);
    };

}

module.exports = MRX;