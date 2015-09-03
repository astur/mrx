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
            if (a.type || a.type === 'folder') {
                self.add(a.children);
            } else if (a.url) {
                self.add(a.url);
            } else if (a.href) {
                self.add(a.href);
            } else {
                throw new Error('Can add this');
            }
            return;
        }
        if (_type(a) !== 'String') {
            throw new Error('Can add this');
        }
        //url correctoins
        //other magic
        $.push(a);
    };

    this.get = function(i){
        return $[i];
    };

    this.last = function(){
        return $[this.count()-1];
    };

    this.find = function(q){
        // there will be magic
        // String, Object, RegEx or (mb) Number
        return $.filter(function(v) {return v.indexOf(q) !== -1;});
    };

    this.load = function(filename, enc){
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

    this.save = function(filename){
        fs.writeFileSync(filename, $.join('\n'));
        //save to file (json, html, ...)
        //.bak, ~file or kind of...
    };

}

module.exports = MRX;