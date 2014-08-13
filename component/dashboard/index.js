
/**
 * Module dependencies
 */

var tpl = require('./template.html')
  , moment = require('moment')
  , Search = require('search')

/**
 * Initialize dashboard
 *
 * @api public
 * @param {Object} app
 * @param {Function} done
 */

module.exports = function dashboard (app, done) {
  var dash = {};
  var node = null;

  app.user.verify(function (err, res) {
    if (err) { return done(err); }
    else if (false == res.status) { return done(); }
    // attach dashboard if user is logged in
    app.dash = dash;
    app.root.appendChild(node);
    done();
    render();
  });

  // render
  node = app.dom(tpl)[0];
  function render () {
    var recent = app.dom(node).find('.module.recently-added ul');
    var control = app.dom(node).find('.control');

    app.tip(control.find('.trigger')[0],
            {value: "Trigger a dynamic update", delay: 5});

    app.tip(control.find('.enable')[0],
            {value: "Enable dynamic updates", delay: 5});

    // control
    control.find('.trigger').on('click', function (e) {
      app.user.playlist.recent.trigger(function (err, res) {
        if (err) { return app.error(err.message); }
        if (false == res.status) {
          app.error(
            "Something went wrong triggering a dynamic update for your playlist"
          );
        }
      });
    });

    var input = new Search(control.find('.search')[0]);

    app.user.playlist.recent.status(function (err, res) {
      if (err) { return app.error(err.message); }
      if (true == res.status && true == res.data.enabled) {
        control.find('.enable input').attr('checked', 'checked');
      }
    });

    control.find('.enable input').on('change', function (e) {
      var enabled = Boolean(this.getAttribute('checked'));
      if (true == enabled) {
        app.user.playlist.recent.disable(function (err, res) {
          if (err) { return app.error(err.message); }
          if (false == res.status) {
            app.error(
              "Something went wrong disabling automatic updates");
          }
        });
      } else {
        app.user.playlist.recent.enable(function (err, res) {
          if (err) { return app.error(err.message); }
          if (false == res.status) {
            app.error(
              "Something went wrong enabling automatic updates");
          }
        });
      }
    });

    // recently added
    app.user.playlist.recent.list(function (err, res) {
      if (err) { return app.error(err); }
      else if (false == res.status) {
        recent.html('<li class="item empty">Nothing added recently</li>');
        return;
      }

      var list = res.data;
      var nodes = list.map(function (datum) {
        return (
          app.dom('<li class="animated fadeIn"/>')
          .append(
            app.dom('<a/>')
            // image
            .append(
              app.dom('<img class="animated fadeIn"/>')
              .attr('src', datum.track.album.images[2].url)
            )
            //name
            .append(app.dom('<span/>').html(
              datum.track.artists[0].name +' - '+ datum.track.name
            ))
            .attr('href', datum.track.uri)
          )
          .append(
            app.dom('<span class="added"/>')
            .html(moment(datum.added_at).format('ddd, hA'))
          )
        )[0];
      });

      setTimeout(function () {
        recent.html('');
        nodes.forEach(function (node) {
          recent.append(node);
        });
        input.add(recent[0]);
      }, 500);
    });
  }
};

