
/**
 * Initializes user actions
 *
 * @api public
 * @param {Object} app
 * @param {Function} done
 */

module.exports = function user (app, done) {
  var user = app.user = app.api('user');

  /**
   * Fetch user data if possible
   *
   * @api public
   * @param {Function} fn
   */

  user.fetch = function (fn) {
    return this.read('/', function (err, res) {
      if (err) { return fn(err); }
      fn(null, User(res));
    });
  };

  /**
   * Check if user is authenticated
   *
   * @api public
   * @param {Function} fn
   */

  user.verify = function (fn) {
    return this.read('/verify', fn);
  };

  /**
   * Logout user
   *
   * @api public
   * @param {Function}
   */

  user.logout = function (fn) {
    return this.write('/logout', fn);
  };

  /**
   * User playlist api
   *
   * @api public
   */

  user.playlist = app.api('user/playlist');

  /**
   * Recently added playlist api
   *
   * @api public
   */

  user.playlist.recent = app.api('user/playlist/recently_added');

  /**
   * Triggers an update or creation of a
   * playlist
   *
   * @api public
   * @param {Function} fn
   */

  user.playlist.recent.trigger = function (fn) {
    return this.write('/trigger', fn);
  };

  /**
   * Enables a dynamic playlist for the
   * user
   *
   * @api public
   * @param {Function} fn
   */

  user.playlist.recent.enable = function (fn) {
    return this.write('/enable', fn);
  };

  /**
   * Diables a dynamic playlist for the
   * user
   *
   * @api public
   * @param {Function} fn
   */

  user.playlist.recent.disable = function (fn) {
    return this.write('/disable', fn);
  };

  /**
   * Lists all recently added playlists
   *
   * @api public
   * @param {Function} fn
   */

  user.playlist.recent.list = function (fn) {
    return this.read('/list', fn);
  };

  /**
   * Get status on dynamic playlist
   *
   * @api public
   * @param {Function} fn
   */

  user.playlist.recent.status = function (fn) {
    return this.read('/status', fn);
  };

  // return
  done();
};

/**
 * `User' constructor
 *
 * @api public
 * @param {Object} data
 */

module.exports.User = User;
function User (data) {
  // ensure instance
  if (!(this instanceof User)) { return new User(data); }
  this._data = data;
}

