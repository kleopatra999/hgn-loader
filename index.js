'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _hoganJs = require('hogan.js');

var _hoganJs2 = _interopRequireDefault(_hoganJs);

var _loaderUtils = require('loader-utils');

var _loaderUtils2 = _interopRequireDefault(_loaderUtils);

var isPath = /\//;
var isDefinite = /^\w/;

function hgn(source) {
  var _loaderUtils$parseQuery = _loaderUtils2['default'].parseQuery(this.query);

  var root = _loaderUtils$parseQuery.root;

  this.cacheable();

  var _Hogan$compile = _hoganJs2['default'].compile(source);

  var text = _Hogan$compile.text;
  var partials = _Hogan$compile.partials;

  var partialNames = {};

  // using object map to eliminate duplicates
  (function recurse(partialNames, partials) {
    for (var p in partials) {
      var _name = partials[p].name;

      // skip if not a path
      if (!isPath.test(_name)) {
        continue;
      }

      // skip if it's not a request
      if (!_loaderUtils2['default'].isUrlRequest(_name, root)) {
        continue;
      }

      // definite names (no prefixed metadata) are prefixed
      partialNames[_name] = isDefinite.test(_name) ? '' + (hgn.prefix || '') + _name : _name;

      if (!isDefinite.test(partialNames[_name])) {
        partialNames[_name] = _loaderUtils2['default'].urlToRequest(_name, root);
      }

      if (partials[p].partials) {
        recurse(partialNames, partials[p].partials);
      }
    }
  })(partialNames, partials);

  var loaders = this.loaders.slice(this.loaderIndex).map(function (obj) {
    return obj.request;
  });

  var toLoad = Object.keys(partialNames).map(function (name) {
    return '"' + name + '": require("-!' + loaders.join('!') + '!' + partialNames[name] + '").template';
  });

  return 'var Hogan = require("hogan.js"),\n  preloads = {' + toLoad.join(',') + '},\n  template = new Hogan.Template(' + _hoganJs2['default'].compile(source, { asString: true }) + ', ' + JSON.stringify(text) + ', Hogan);\n  function extend(target, source) { return Object.keys(source).reduce(function(t, p) { t[p] = source[p]; return t; }, target); }\n  template.ri = function(context, partials, indent) {\n    if (Hogan.helpers) context.unshift(Hogan.helpers);\n    return this.r(context, extend(preloads, partials), indent);\n  };\n  module.exports = template.render.bind(template);\n  module.exports.template = template;';
}

exports['default'] = hgn;
module.exports = exports['default'];
