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
})({"BC91":[function(require,module,exports) {
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
  // the default separators except `@$`
  wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
  comments: {
    lineComment: '//',
    blockComment: ['{', '}']
  },
  brackets: [['{', '}'], ['[', ']'], ['(', ')'], ['<', '>']],
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
    open: '<',
    close: '>'
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
    open: '<',
    close: '>'
  }, {
    open: '\'',
    close: '\''
  }],
  folding: {
    markers: {
      start: new RegExp("^\\s*\\{\\$REGION(\\s\\'.*\\')?\\}"),
      end: new RegExp("^\\s*\\{\\$ENDREGION\\}")
    }
  }
};
exports.conf = conf;
var language = {
  defaultToken: '',
  tokenPostfix: '.pascal',
  ignoreCase: true,
  brackets: [{
    open: '{',
    close: '}',
    token: 'delimiter.curly'
  }, {
    open: '[',
    close: ']',
    token: 'delimiter.square'
  }, {
    open: '(',
    close: ')',
    token: 'delimiter.parenthesis'
  }, {
    open: '<',
    close: '>',
    token: 'delimiter.angle'
  }],
  keywords: ['absolute', 'abstract', 'all', 'and_then', 'array', 'as', 'asm', 'attribute', 'begin', 'bindable', 'case', 'class', 'const', 'contains', 'default', 'div', 'else', 'end', 'except', 'exports', 'external', 'far', 'file', 'finalization', 'finally', 'forward', 'generic', 'goto', 'if', 'implements', 'import', 'in', 'index', 'inherited', 'initialization', 'interrupt', 'is', 'label', 'library', 'mod', 'module', 'name', 'near', 'not', 'object', 'of', 'on', 'only', 'operator', 'or_else', 'otherwise', 'override', 'package', 'packed', 'pow', 'private', 'program', 'protected', 'public', 'published', 'interface', 'implementation', 'qualified', 'read', 'record', 'resident', 'requires', 'resourcestring', 'restricted', 'segment', 'set', 'shl', 'shr', 'specialize', 'stored', 'then', 'threadvar', 'to', 'try', 'type', 'unit', 'uses', 'var', 'view', 'virtual', 'dynamic', 'overload', 'reintroduce', 'with', 'write', 'xor', 'true', 'false', 'procedure', 'function', 'constructor', 'destructor', 'property', 'break', 'continue', 'exit', 'abort', 'while', 'do', 'for', 'raise', 'repeat', 'until'],
  typeKeywords: ['boolean', 'double', 'byte', 'integer', 'shortint', 'char', 'longint', 'float', 'string'],
  operators: ['=', '>', '<', '<=', '>=', '<>', ':', ':=', 'and', 'or', '+', '-', '*', '/', '@', '&', '^', '%'],
  // we include these common regular expressions
  symbols: /[=><:@\^&|+\-*\/\^%]+/,
  // The main tokenizer for our languages
  tokenizer: {
    root: [// identifiers and keywords
    [/[a-zA-Z_][\w]*/, {
      cases: {
        '@keywords': {
          token: 'keyword.$0'
        },
        '@default': 'identifier'
      }
    }], // whitespace
    {
      include: '@whitespace'
    }, // delimiters and operators
    [/[{}()\[\]]/, '@brackets'], [/[<>](?!@symbols)/, '@brackets'], [/@symbols/, {
      cases: {
        '@operators': 'delimiter',
        '@default': ''
      }
    }], // numbers
    [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'], [/\$[0-9a-fA-F]{1,16}/, 'number.hex'], [/\d+/, 'number'], // delimiter: after number because of .\d floats
    [/[;,.]/, 'delimiter'], // strings
    [/'([^'\\]|\\.)*$/, 'string.invalid'], [/'/, 'string', '@string'], // characters
    [/'[^\\']'/, 'string'], [/'/, 'string.invalid'], [/\#\d+/, 'string']],
    comment: [[/[^\*\}]+/, 'comment'], //[/\(\*/,    'comment', '@push' ],    // nested comment  not allowed :-(
    [/\}/, 'comment', '@pop'], [/[\{]/, 'comment']],
    string: [[/[^\\']+/, 'string'], [/\\./, 'string.escape.invalid'], [/'/, {
      token: 'string.quote',
      bracket: '@close',
      next: '@pop'
    }]],
    whitespace: [[/[ \t\r\n]+/, 'white'], [/\{/, 'comment', '@comment'], [/\/\/.*$/, 'comment']]
  }
};
exports.language = language;
},{}]},{},["BC91"], null)
//# sourceMappingURL=/pascal.80b58eda.js.map