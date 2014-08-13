
/**
 * Module dependencies
 */

var tpl = require('./template.html')
  , debug = require('debug')('header')

/**
 * Initialize header
 *
 * @api public
 * @param {Object} app
 */

module.exports = function header (app, done) {
  var root = app.root;
  var node = app.dom(tpl)[0];

  // render
  root.appendChild(node);
  done();
};
