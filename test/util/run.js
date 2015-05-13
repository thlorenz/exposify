'use strict';

var browserify     = require('browserify')
  , vm             = require('vm')
  , exposify       = require('../../')

module.exports = function run(map, file, window, cb) {
  exposify.config = map;

  var ctx = { window: window };
  var fullPath = require.resolve('../fixtures/' + file);

  // If five arguments are provided, fourth one is an object for browserify
  // options.
  var opts = {};
  if (arguments.length === 5) {
    opts = cb;
    cb = arguments[4];
  }

  // If ignoreMissing is true, set ctx.require to a no-op
  if ('ignoreMissing' in opts) {
    ctx.require = function() {};
  }

  browserify(opts)
    .require(fullPath)
    .transform(exposify)
    .bundle(function (err, res) {
      if (err) return cb(err);
      try {
        var require_ = vm.runInNewContext(res, ctx);
        cb(null, require_(fullPath));
      } catch (e) {
        cb(e);
      }
    });
}

