
/**
 * Module dependencies
 */

var tpl = require('./template.html')

/**
 * Initialize home view
 *
 * @api public
 * @param {Object} app
 * @param {Function} fn
 */

module.exports = function (app, done) {
  var node = app.dom(tpl)[0];

  app.user.verify(function (err, res) {
    if (err) { return done(err); }
    if (true == res.status) { return done(); }
    // render
    app.root.appendChild(node);
    done();
  });

};
