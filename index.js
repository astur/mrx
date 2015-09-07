var fs = require('fs');

function MRX(){

    if(!(this instanceof MRX)) {return new MRX();}

    var $ = [];
    var self = this;
    var _type = function(o) {
        return Object.prototype.toString.call(o).split(' ')[1].slice(0,-1);
    };

    this.clear = function(){
        $ = [];
    };

    this.count = function(){
        return $.length;
    };

    this.add = function(a){
        if (arguments.length === 0) {
            throw new Error('Nothing to add');
        }
        if (arguments.length > 1) {
            [].slice.call(arguments).forEach(function(a) {
                self.add(a);
            });
            return;
        }
        if (_type(a) === 'Array') {
            a.forEach(function(a) {
                self.add(a);
            });
            return;
        }
        if (_type(a) === 'Object') {
            if (a.type && a.children) {
                self.add(a.children);
            } else if (a.url) {
                self.add(a.url);
            } else if (a.href) {
                self.add(a.href);
            } else {
                throw new Error('Can\'t add this');
            }
            return;
        }
        if (_type(a) !== 'String') {
            throw new Error('Can\'t add this');
        }
        //url correctoins
        //other magic
        $.push(a);
    };

    this.get = function(i){ //TEST
        return $[i];
    };

    this.last = function(){ //TEST
        return $[this.count()-1];
    };

    this.find = function(q){
        if (_type(q) === 'String') {
            return $.indexOf(q) !== -1;
        }
        if (_type(q) === 'RegExp') {
            return $.filter(function(v) {return q.test(v);});
        }
        throw new Error('Bad query for find');
    };

    this.check = function(q){
        if (_type(q) !== 'String' || !/http/i.test(q)) {
            throw new Error('Bad URL for check');
        }
        var re = /https?:\/\/(?:www\.)?([^/]+)\/([^?]+)?(\?[^#]*)?(#.*)?/i;
        var u = q.match(re);
        if(u[2]) {
            u[2] = u[2].replace('index.html', '');
        }
        var res = {};
        res.same = $.indexOf(q) !== -1;
        res.similar = $.filter(function(v) {
            v = v.match(re);
            if(v[2]) {
                v[2] = v[2].replace('index.html', '');
            }
            return v[1] === u[1] && v[2] === u[2] && v[3] === u[3];
        });
        res.neighbours = $.filter(function(v) {
            v = v.match(re);
            if(v[2]) {
                v[2] = v[2].replace('index.html', '');
            }
            return v[1] === u[1] && v[2] === u[2] && v[3] !== u[3];
        });

        res.domains = {};
        var a = u[1].split('.');
        var key;
        var dCheck = function(v) {return re.test(v);};
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

        return res;
    };

    this.load = function(filename, enc){ //TEST
        enc = enc || 'utf-8';

        var mre = /<a\s[^>]*(href\s*=\s*(\")?htt)[^>]*>/gi;
        var rre = /<a.*?href\s*=\s*(\")?(http[^"]+?)\1\s[^>]*>/ig;

        var src = fs.readFileSync(filename, enc);

        try {
            src = JSON.parse(src);
        } catch (e) {
            if (mre.test(src)) {
                src = src.match(mre);
                for(var i = 0, l = src.length; i<l; i++) {
                    src[i] = src[i].replace(rre, '$2');
                    src[i] = src[i].replace('&amp;', '&');
                }
            } else {
                src = src.split(/\s*\n\s*/);
            }
        }
        this.add(src);
    };

    this.save = function(filename){ //TEST
        fs.writeFileSync(filename, $.join('\n'));
        //save to file (json, html, ...)
        //.bak, ~file or kind of...
    };

}

module.exports = MRX;