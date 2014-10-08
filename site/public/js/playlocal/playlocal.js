
function Playlocal(xhr, q) {
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
    this.q   = q;
};

// window.Playlocal = Playlocal;
module.exports = Playlocal;

Playlocal.prototype.init = function () {
    var $this = this;
    var d = this.q.defer();

    this._csrf().then(function () {
        $this._token().then(function () {
            d.resolve();
        });
    });

    return d.promise;
};

Playlocal.prototype.status = function () {
    return this.spotilocal('get', 'remote/status.json');
};

Playlocal.prototype.play = function (uri) {
    this.spotilocal('get', 'remote/play.json')
        .query({uri: uri})
        .end(function (error, res) {
            console.log(res.body);
        })
    ;
};

Playlocal.prototype.pause = function () {
    this.spotilocal('get', 'remote/pause.json')
        .query({pause: true})
        .end(function (error, res) {
            console.log(res.body);
        })
    ;
};

Playlocal.prototype.queue = function (uri) {
    this.spotilocal('get', 'remote/queue.json')
        .query({uri: uri})
        .end(function (error, res) {
            console.log(res.body);
        })
    ;
};

Playlocal.prototype.open = function () {
    this.spotilocal('get', 'remote/open.json')
        .end(function (error, res) {
            console.log(res.body);
        })
    ;
};

Playlocal.prototype._csrf = function () {
    var $this = this;
    var d = this.q.defer();

    this.spotiproxy('get', 'player/csrf').end(function (error, res) {
        if (res.body.data.token) {
            $this.config.spotilocal.csrf = res.body.data.token;
        }
        d.resolve();
    });

    return d.promise;
};

Playlocal.prototype._token = function () {
    var $this = this;
    var d = this.q.defer();

    this.spotiproxy('get', 'player/token').end(function (error, res) {
        if (res.body.data.t) {
            $this.config.spotilocal.oauth = res.body.data.t;
        }
        d.resolve();
    });

    return d.promise;
};

Playlocal.prototype.spotiproxy = function (method, endpoint) {
    var url = this.config.spotiproxy.base
            + ':'
            + this.config.spotiproxy.port
            + '/'
            + endpoint
    ;

    return this.xhr.call(method.toLowerCase, url);
};

Playlocal.prototype.spotilocal = function (method, endpoint) {
    var url = this.config.spotilocal.base
            + ':'
            + this.config.spotilocal.port
            + '/'
            + endpoint
    ;

    var request = this.xhr.call(method.toLowerCase, url);

    // Add the csrf/oauth if it is available
    if (this.config.spotilocal.csrf && this.config.spotilocal.oauth) {
        request.query({csrf: this.config.spotilocal.csrf, oauth: this.config.spotilocal.oauth});
    }

    return request;
};
