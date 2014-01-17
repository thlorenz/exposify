'use strict';
var transformify = require('transformify')
  , through = require('through2')
  , expose = require('./expose');

exports = module.exports = function (file) {
 if (!exports.filePattern.test(file)) return through();  

 var tx = transformify(expose.bind(null, exports.config));
 return tx(file);
}

exports.config = (function () {
  if (process.env.EXPOSIFY_CONFIG) {
    try {
      return JSON.parse(process.env.EXPOSIFY_CONFIG);
    } catch (err) {
      console.error('Invalid exposify config!');
      console.error(err.stack);
    }
  }
})();

exports.filePattern = /\.js$/;
exports.expose = expose;
