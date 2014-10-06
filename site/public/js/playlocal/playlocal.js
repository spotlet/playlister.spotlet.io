var request = require('visionmedia/superagent');

function Playlocal(xhr) {
    this.config = {
        spotilocal: {
            base: 'https://epixbsxgua.spotilocal.com',
            port: 4371,
            csrf: false,
            oauth: false
        },
        spotiproxy: {
            base: 'http://localhost',
            port: 4567
        }
    };
    this.xhr = xhr;
};

Playlocal.prototype.init = function () {
    this._csrf()
        ._token()
    ;
};

Playlocal.prototype.status = function () {
    this.spotilocal('get', 'remote/status.json')
        .end(function (error, res) {
            console.log(res.body);
        })
    ;
};

Playlocal.prototype._csrf = function () {
    var $this = this;

    this.spotiproxy('get', 'player/csrf').end(function (error, res) {
        if (res.body.data.token) {
            $this.config.spotilocal.csrf = res.body.data.token;
        }
    });

    return $this;
};

Playlocal.prototype._token = function () {
    var $this = this;

    this.spotiproxy('get', 'player/token').end(function (error, res) {
        if (res.body.data.t) {
            $this.config.spotilocal.oauth = res.body.data.t;
        }
    });

    return $this;
};

Playlocal.prototype.spotiproxy = function (method, endpoint, callback) {
    var url = this.config.spotiproxy.base
            + ':'
            + this.config.spotiproxy.port
            + '/'
            + endpoint
    ;

    return this.xhr.call(method.toLowerCase, url);
};

Playlocal.prototype.spotilocal = function (method, endpoint, callback) {
    var url = this.config.spotilocal.base
            + ':'
            + this.config.spotilocal.port
            + '/'
            + endpoint
    ;

    var request = this.xhr.call(method.toLowerCase, url);

    if (this.config.spotilocal.csrf && this.config.spotilocal.oauth) {
        request.query({csrf: this.config.spotilocal.csrf, oauth: this.config.spotilocal.oauth});
    }

    return request;
};

window.playlocal = new Playlocal(request);
window.playlocal.init();
