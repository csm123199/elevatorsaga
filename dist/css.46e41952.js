// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"cSTX":[function(require,module,exports) {
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.language = exports.conf = void 0;
var conf = {
  wordPattern: /(#?-?\d*\.\d\w*%?)|((::|[@#.!:])?[\w-?]+%?)|::|[@#.!:]/g,
  comments: {
    blockComment: ['/*', '*/']
  },
  brackets: [['{', '}'], ['[', ']'], ['(', ')']],
  autoClosingPairs: [{
    open: '{',
    close: '}',
    notIn: ['string', 'comment']
  }, {
    open: '[',
    close: ']',
    notIn: ['string', 'comment']
  }, {
    open: '(',
    close: ')',
    notIn: ['string', 'comment']
  }, {
    open: '"',
    close: '"',
    notIn: ['string', 'comment']
  }, {
    open: '\'',
    close: '\'',
    notIn: ['string', 'comment']
  }],
  surroundingPairs: [{
    open: '{',
    close: '}'
  }, {
    open: '[',
    close: ']'
  }, {
    open: '(',
    close: ')'
  }, {
    open: '"',
    close: '"'
  }, {
    open: '\'',
    close: '\''
  }],
  folding: {
    markers: {
      start: new RegExp("^\\s*\\/\\*\\s*#region\\b\\s*(.*?)\\s*\\*\\/"),
      end: new RegExp("^\\s*\\/\\*\\s*#endregion\\b.*\\*\\/")
    }
  }
};
exports.conf = conf;
var language = {
  defaultToken: '',
  tokenPostfix: '.css',
  ws: '[ \t\n\r\f]*',
  identifier: '-?-?([a-zA-Z]|(\\\\(([0-9a-fA-F]{1,6}\\s?)|[^[0-9a-fA-F])))([\\w\\-]|(\\\\(([0-9a-fA-F]{1,6}\\s?)|[^[0-9a-fA-F])))*',
  brackets: [{
    open: '{',
    close: '}',
    token: 'delimiter.bracket'
  }, {
    open: '[',
    close: ']',
    token: 'delimiter.bracket'
  }, {
    open: '(',
    close: ')',
    token: 'delimiter.parenthesis'
  }, {
    open: '<',
    close: '>',
    token: 'delimiter.angle'
  }],
  tokenizer: {
    root: [{
      include: '@selector'
    }],
    selector: [{
      include: '@comments'
    }, {
      include: '@import'
    }, {
      include: '@strings'
    }, ['[@](keyframes|-webkit-keyframes|-moz-keyframes|-o-keyframes)', {
      token: 'keyword',
      next: '@keyframedeclaration'
    }], ['[@](page|content|font-face|-moz-document)', {
      token: 'keyword'
    }], ['[@](charset|namespace)', {
      token: 'keyword',
      next: '@declarationbody'
    }], ['(url-prefix)(\\()', ['attribute.value', {
      token: 'delimiter.parenthesis',
      next: '@urldeclaration'
    }]], ['(url)(\\()', ['attribute.value', {
      token: 'delimiter.parenthesis',
      next: '@urldeclaration'
    }]], {
      include: '@selectorname'
    }, ['[\\*]', 'tag'], ['[>\\+,]', 'delimiter'], ['\\[', {
      token: 'delimiter.bracket',
      next: '@selectorattribute'
    }], ['{', {
      token: 'delimiter.bracket',
      next: '@selectorbody'
    }]],
    selectorbody: [{
      include: '@comments'
    }, ['[*_]?@identifier@ws:(?=(\\s|\\d|[^{;}]*[;}]))', 'attribute.name', '@rulevalue'], ['}', {
      token: 'delimiter.bracket',
      next: '@pop'
    }]],
    selectorname: [['(\\.|#(?=[^{])|%|(@identifier)|:)+', 'tag']],
    selectorattribute: [{
      include: '@term'
    }, [']', {
      token: 'delimiter.bracket',
      next: '@pop'
    }]],
    term: [{
      include: '@comments'
    }, ['(url-prefix)(\\()', ['attribute.value', {
      token: 'delimiter.parenthesis',
      next: '@urldeclaration'
    }]], ['(url)(\\()', ['attribute.value', {
      token: 'delimiter.parenthesis',
      next: '@urldeclaration'
    }]], {
      include: '@functioninvocation'
    }, {
      include: '@numbers'
    }, {
      include: '@name'
    }, ['([<>=\\+\\-\\*\\/\\^\\|\\~,])', 'delimiter'], [',', 'delimiter']],
    rulevalue: [{
      include: '@comments'
    }, {
      include: '@strings'
    }, {
      include: '@term'
    }, ['!important', 'keyword'], [';', 'delimiter', '@pop'], ['(?=})', {
      token: '',
      next: '@pop'
    }] // missing semicolon
    ],
    warndebug: [['[@](warn|debug)', {
      token: 'keyword',
      next: '@declarationbody'
    }]],
    import: [['[@](import)', {
      token: 'keyword',
      next: '@declarationbody'
    }]],
    urldeclaration: [{
      include: '@strings'
    }, ['[^)\r\n]+', 'string'], ['\\)', {
      token: 'delimiter.parenthesis',
      next: '@pop'
    }]],
    parenthizedterm: [{
      include: '@term'
    }, ['\\)', {
      token: 'delimiter.parenthesis',
      next: '@pop'
    }]],
    declarationbody: [{
      include: '@term'
    }, [';', 'delimiter', '@pop'], ['(?=})', {
      token: '',
      next: '@pop'
    }] // missing semicolon
    ],
    comments: [['\\/\\*', 'comment', '@comment'], ['\\/\\/+.*', 'comment']],
    comment: [['\\*\\/', 'comment', '@pop'], [/[^*/]+/, 'comment'], [/./, 'comment']],
    name: [['@identifier', 'attribute.value']],
    numbers: [['-?(\\d*\\.)?\\d+([eE][\\-+]?\\d+)?', {
      token: 'attribute.value.number',
      next: '@units'
    }], ['#[0-9a-fA-F_]+(?!\\w)', 'attribute.value.hex']],
    units: [['(em|ex|ch|rem|vmin|vmax|vw|vh|vm|cm|mm|in|px|pt|pc|deg|grad|rad|turn|s|ms|Hz|kHz|%)?', 'attribute.value.unit', '@pop']],
    keyframedeclaration: [['@identifier', 'attribute.value'], ['{', {
      token: 'delimiter.bracket',
      switchTo: '@keyframebody'
    }]],
    keyframebody: [{
      include: '@term'
    }, ['{', {
      token: 'delimiter.bracket',
      next: '@selectorbody'
    }], ['}', {
      token: 'delimiter.bracket',
      next: '@pop'
    }]],
    functioninvocation: [['@identifier\\(', {
      token: 'attribute.value',
      next: '@functionarguments'
    }]],
    functionarguments: [['\\$@identifier@ws:', 'attribute.name'], ['[,]', 'delimiter'], {
      include: '@term'
    }, ['\\)', {
      token: 'attribute.value',
      next: '@pop'
    }]],
    strings: [['~?"', {
      token: 'string',
      next: '@stringenddoublequote'
    }], ['~?\'', {
      token: 'string',
      next: '@stringendquote'
    }]],
    stringenddoublequote: [['\\\\.', 'string'], ['"', {
      token: 'string',
      next: '@pop'
    }], [/[^\\"]+/, 'string'], ['.', 'string']],
    stringendquote: [['\\\\.', 'string'], ['\'', {
      token: 'string',
      next: '@pop'
    }], [/[^\\']+/, 'string'], ['.', 'string']]
  }
};
exports.language = language;
},{}]},{},["cSTX"], null)
//# sourceMappingURL=/css.46e41952.js.map