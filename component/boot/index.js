
/**
 * Module dependencies
 */

var Debug = require('debug')
  , Batch = require('batch')
  , ready = require('domready')
  , dom = require('dom')
  , agent = require('superagent')
  , dialog = require('dialog')
  , Popover = require('popover')
  , tip = require('tip')

/**
 * Boot loaders
 */

var header = require('header')
  , home = require('home')
  , user = require('user')
  , api = require('api')
  , dashboard = require('dashboard')


/**
 * Debuggers
 */

Debug.enable('boot');
debug = Debug('boot');

/**
 * Application object
 *
 * @api public
 */

var app = module.exports = Object.create(null, {

  /**
   * Binds function for when dom is ready
   *
   * @api public
   * @param {Function} fn
   */

  ready: {value: ready},

  /**
   * Easy DOM travseral
   *
   * @api public
   * @param {String} str
   * @param {Mixed} ...args - optional
   */

  dom: {value: dom},

  /**
   * HTTP request agent
   *
   * @api public
   */

  agent: {value: agent},

  /**
   * Show message dialog
   *
   * @api public
   * @param {String} title - optional
   * @param {String} message
   */

  dialog: {value: function (title, message) {
    return (
      (2 == arguments.length ? dialog(title, message) : dialog(message))
      .overlay()
      .escapable()
      .closable()
      .show()
    );
  }},

  /**
   * Show error message
   *
   * @api public
   * @param {String} err
   */

  error: {value: error},

  /**
   *
   */

  tip: {value: tip},

  /**
   *
   */

  Popover: {value: Popover},

});

/**
 * Boot tasks
 */

var tasks = new Batch().concurrency(1);

/**
 * Bootstrap
 *
 * @api private
 * @param {Object} app
 * @param {Function} done
 */

function init (app, done) {
  debug('init');
  app.root = document.querySelector('#main');
  done();
}

/**
 * Runtime routines
 *
 * @api private
 * @param {Object} app
 * @param {Function} done
 */

function runtime (app, done) {
  app.user.verify(function (err, res) {
    if (err) { return done(err); }

    // handle signin/sigout links
    if (false == res.status) {
      dom('.auth-link').css('display', 'block');
    } else {
      dom('.logout-link')
      .css('display', 'block')
      .on('click', function (e) {
        e.preventDefault();
        app.user.logout(function (err, res) {
          if (err) { return console.error(err.stack || err); }
          if (true == res.status) {
            window.location.href = '/';
          }
        });
      });
    }
    done();
  });
}

/**
 * Shows error dialog
 *
 * @api public
 * @param {String} message
 */

function error (message) {
  return (
    dialog("Error", message)
    .addClass('error')
    .closable()
    .overlay()
    .escapable()
    .show()
  );
}

// Push tasks to boot loader
[
  init,
  api,
  user,
  header,
  home,
  dashboard,
  runtime
].forEach(function (fn) {
  debug('task push %s', fn.name);
  tasks.push(fn.bind(null, app));
});

// run when DOM is ready
ready(function () {
  debug('dom ready');
  // run tasks
  tasks.end(function (err) {
    if (err) {
      app.error(err.message);
      console.error(err.stack || err);
      return;
    }

  });
});

