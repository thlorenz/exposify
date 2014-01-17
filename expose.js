'use strict';

var detective = require('detective');

function rangeComparator(a, b) {
  return a.from > b.from ? 1 : -1;
}

function getReplacements(id, globalVar, requires) {
  if (!~requires.strings.indexOf(id)) return [];

  var ranges = requires.strings
    .reduce(function (acc, s, index) {
      var node;
      if (s === id) { 
        node = requires.nodes[index]
        acc.push({ from: node.range[0], to: node.range[1], id: id, code: 'window.' + globalVar });
      }
      return acc;
    }, [])

  return ranges;
}

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

var go = module.exports = 

function (map, origSrc) {
  var regex, keys, id;
  var src = origSrc;

  keys = Object.keys(map);

  // ensure that at least one of the require statements we want to replace is in the code
  // before we perform the expensive operation of finding them by creating an AST
  var hasMatchingRequires = keys.some(function (id) {
    regex = new RegExp('require\\([\'"]' + id + '[\'"]\\)');
    return regex.test(src)
  });
  if (!hasMatchingRequires) return src;

  var requires = detective.find(src, { nodes: true, parse: { range: true } });
  if (!requires.strings.length) return src;

  var replacements = keys
    .reduce(function (acc, id) {
      var r = getReplacements(id, map[id], requires);
      return acc.concat(r);
    }, [])
    .sort(rangeComparator);

  var offset = 0;
  return replacements
    .reduce(function(acc, replacement) {
      var from = replacement.from
        , to   = replacement.to
        , code = replacement.code;

      // all ranges will be invalidated since we are changing the code
      // therefore keep track of the offset to adjust them in case we replace multiple requires
      offset += (to - from) - code.length;
      return src.slice(0, from) + code + src.slice(to);
    }, src);
}

// Test
var fs = require('fs');

if (!module.parent && typeof window === 'undefined') {
  var src = fs.readFileSync(__dirname + '/test/fixtures/jquery-only.js', 'utf8');

  var res = go({ 'jquery': '$' }, src);
  console.log(src);
  console.log('----');
  console.log(res);
}
