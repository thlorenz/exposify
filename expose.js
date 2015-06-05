'use strict';

var mapObject = require('map-obj');
var replaceRequires = require('replace-requires');

module.exports = function expose (replacements, code) {
  replacements = mapObject(replacements, function (id, globalVar) {
    return [id, '(window.' + globalVar + ')']
  })
  return replaceRequires(code, replacements)
}
