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
})({"kISi":[function(require,module,exports) {
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
  brackets: [['{', '}'], ['[', ']'], ['(', ')']],
  autoClosingPairs: [{
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
  }]
};
exports.conf = conf;
var language = {
  tokenPostfix: '.tcl',
  specialFunctions: ['set', 'unset', 'rename', 'variable', 'proc', 'coroutine', 'foreach', 'incr', 'append', 'lappend', 'linsert', 'lreplace'],
  mainFunctions: ['if', 'then', 'elseif', 'else', 'case', 'switch', 'while', 'for', 'break', 'continue', 'return', 'package', 'namespace', 'catch', 'exit', 'eval', 'expr', 'uplevel', 'upvar'],
  builtinFunctions: ['file', 'info', 'concat', 'join', 'lindex', 'list', 'llength', 'lrange', 'lsearch', 'lsort', 'split', 'array', 'parray', 'binary', 'format', 'regexp', 'regsub', 'scan', 'string', 'subst', 'dict', 'cd', 'clock', 'exec', 'glob', 'pid', 'pwd', 'close', 'eof', 'fblocked', 'fconfigure', 'fcopy', 'fileevent', 'flush', 'gets', 'open', 'puts', 'read', 'seek', 'socket', 'tell', 'interp', 'after', 'auto_execok', 'auto_load', 'auto_mkindex', 'auto_reset', 'bgerror', 'error', 'global', 'history', 'load', 'source', 'time', 'trace', 'unknown', 'unset', 'update', 'vwait', 'winfo', 'wm', 'bind', 'event', 'pack', 'place', 'grid', 'font', 'bell', 'clipboard', 'destroy', 'focus', 'grab', 'lower', 'option', 'raise', 'selection', 'send', 'tk', 'tkwait', 'tk_bisque', 'tk_focusNext', 'tk_focusPrev', 'tk_focusFollowsMouse', 'tk_popup', 'tk_setPalette'],
  symbols: /[=><!~?:&|+\-*\/\^%]+/,
  brackets: [{
    open: '(',
    close: ')',
    token: 'delimiter.parenthesis'
  }, {
    open: '{',
    close: '}',
    token: 'delimiter.curly'
  }, {
    open: '[',
    close: ']',
    token: 'delimiter.square'
  }],
  escapes: /\\(?:[abfnrtv\\"'\[\]\{\};\$]|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
  variables: /(?:\$+(?:(?:\:\:?)?[a-zA-Z_]\w*)+)/,
  tokenizer: {
    root: [// identifiers and keywords
    [/[a-zA-Z_]\w*/, {
      cases: {
        '@specialFunctions': {
          token: 'keyword.flow',
          next: '@specialFunc'
        },
        '@mainFunctions': 'keyword',
        '@builtinFunctions': 'variable',
        '@default': 'operator.scss'
      }
    }], [/\s+\-+(?!\d|\.)\w*|{\*}/, 'metatag'], // whitespace
    {
      include: '@whitespace'
    }, // delimiters and operators
    [/[{}()\[\]]/, '@brackets'], [/@symbols/, 'operator'], [/\$+(?:\:\:)?\{/, {
      token: 'identifier',
      next: '@nestedVariable'
    }], [/@variables/, 'type.identifier'], [/\.(?!\d|\.)[\w\-]*/, 'operator.sql'], // numbers
    [/\d+(\.\d+)?/, 'number'], [/\d+/, 'number'], // delimiter
    [/;/, 'delimiter'], // strings
    [/"/, {
      token: 'string.quote',
      bracket: '@open',
      next: '@dstring'
    }], [/'/, {
      token: 'string.quote',
      bracket: '@open',
      next: '@sstring'
    }]],
    dstring: [[/\[/, {
      token: '@brackets',
      next: '@nestedCall'
    }], [/\$+(?:\:\:)?\{/, {
      token: 'identifier',
      next: '@nestedVariable'
    }], [/@variables/, 'type.identifier'], [/[^\\$\[\]"]+/, 'string'], [/@escapes/, 'string.escape'], [/"/, {
      token: 'string.quote',
      bracket: '@close',
      next: '@pop'
    }]],
    sstring: [[/\[/, {
      token: '@brackets',
      next: '@nestedCall'
    }], [/\$+(?:\:\:)?\{/, {
      token: 'identifier',
      next: '@nestedVariable'
    }], [/@variables/, 'type.identifier'], [/[^\\$\[\]']+/, 'string'], [/@escapes/, 'string.escape'], [/'/, {
      token: 'string.quote',
      bracket: '@close',
      next: '@pop'
    }]],
    whitespace: [[/[ \t\r\n]+/, 'white'], [/#.*\\$/, {
      token: 'comment',
      next: '@newlineComment'
    }], [/#.*(?!\\)$/, 'comment']],
    newlineComment: [[/.*\\$/, 'comment'], [/.*(?!\\)$/, {
      token: 'comment',
      next: '@pop'
    }]],
    nestedVariable: [[/[^\{\}\$]+/, 'type.identifier'], [/\}/, {
      token: 'identifier',
      next: '@pop'
    }]],
    nestedCall: [[/\[/, {
      token: '@brackets',
      next: '@nestedCall'
    }], [/\]/, {
      token: '@brackets',
      next: '@pop'
    }], {
      include: 'root'
    }],
    specialFunc: [[/"/, {
      token: 'string',
      next: '@dstring'
    }], [/'/, {
      token: 'string',
      next: '@sstring'
    }], [/(?:(?:\:\:?)?[a-zA-Z_]\w*)+/, {
      token: 'type',
      next: '@pop'
    }]]
  }
};
exports.language = language;
},{}]},{},["kISi"], null)
//# sourceMappingURL=/tcl.7ca84ab6.js.map