
/**
 * API endpoint prefix
 */

var PREFIX = '/api/v1';

/**
 * Initialize api actions
 *
 * @api public
 * @param {Object} app
 * @param {Function} done
 */

module.exports = function api (app, done) {
  var agent = app.agent;
  app.api = api;
  done();

  /**
   * Creates a scoped agent for api request
   *
   * @api public
   * @param {String} ns
   */

  function api (ns) {
    // normalize `ns'
    if (!ns) {
      ns = '';
    } else if ('/' != ns[0]) {
      ns = '/'+ ns;
    }

    /**
     * Normalize `uri' with `PREFIX' and `ns' removing
     * extras slashes and whitespace
     *
     * @api private
     * @param {String} uri
     */

    function url (uri) {
      return (
        '/'+
        [PREFIX, ns, uri]
        .join('/')
        .split('/')
        .filter(Boolean)
        .map(function (s) { return s.trim(); })
        .join('/')
      );
    }

    /**
     * Wraps `fn' returning `err' if
     * an error occured or `res.body'
     * if available
     *
     * @api private
     * @param {Function} fn
     */

    function callback (fn) {
      return function (err, res) {
        if (err) { fn(err); }
        else { fn(null, res.body); }
      };
    }

    return {

      /**
       * Request agent
       *
       * @api private
       */

      _agent: agent,

      /**
       * Read data from a uri in given namespace
       *
       * @api public
       * @param {String} uri
       * @param {Function} fn
       */

      read: function (uri, fn) {
        this._agent.get(url(uri), callback(fn));
        return this;
      },

      /**
       * Write data to `uri' with optional `data'
       *
       * @api public
       * @param {String} uri
       * @param {Object} data - optional
       * @param {Function} fn
       */

      write: function (uri, data, fn) {
        if (2 == arguments.length) {
          fn = data;
          data = null;
        }
        this._agent.post(url(uri), data || {}, callback(fn));
        return this;
      }
    };
  }
};
