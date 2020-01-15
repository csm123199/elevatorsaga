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
})({"qzqG":[function(require,module,exports) {
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
  comments: {
    lineComment: '#'
  },
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
    open: '"""',
    close: '"""',
    notIn: ['string', 'comment']
  }, {
    open: '"',
    close: '"',
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
    open: '"""',
    close: '"""'
  }, {
    open: '"',
    close: '"'
  }],
  folding: {
    offSide: true
  }
};
exports.conf = conf;
var language = {
  // Set defaultToken to invalid to see what you do not tokenize yet
  defaultToken: 'invalid',
  tokenPostfix: '.gql',
  keywords: ['null', 'true', 'false', 'query', 'mutation', 'subscription', 'extend', 'schema', 'directive', 'scalar', 'type', 'interface', 'union', 'enum', 'input', 'implements', 'fragment', 'on'],
  typeKeywords: ['Int', 'Float', 'String', 'Boolean', 'ID'],
  directiveLocations: ['SCHEMA', 'SCALAR', 'OBJECT', 'FIELD_DEFINITION', 'ARGUMENT_DEFINITION', 'INTERFACE', 'UNION', 'ENUM', 'ENUM_VALUE', 'INPUT_OBJECT', 'INPUT_FIELD_DEFINITION', 'QUERY', 'MUTATION', 'SUBSCRIPTION', 'FIELD', 'FRAGMENT_DEFINITION', 'FRAGMENT_SPREAD', 'INLINE_FRAGMENT', 'VARIABLE_DEFINITION'],
  operators: ['=', '!', '?', ':', '&', '|'],
  // we include these common regular expressions
  symbols: /[=!?:&|]+/,
  // https://facebook.github.io/graphql/draft/#sec-String-Value
  escapes: /\\(?:["\\\/bfnrt]|u[0-9A-Fa-f]{4})/,
  // The main tokenizer for our languages
  tokenizer: {
    root: [// identifiers and keywords
    [/[a-z_$][\w$]*/, {
      cases: {
        '@keywords': 'keyword',
        '@default': 'identifier'
      }
    }], [/[A-Z][\w\$]*/, {
      cases: {
        '@typeKeywords': 'keyword',
        '@default': 'type.identifier'
      }
    }], // whitespace
    {
      include: '@whitespace'
    }, // delimiters and operators
    [/[{}()\[\]]/, '@brackets'], [/@symbols/, {
      cases: {
        '@operators': 'operator',
        '@default': ''
      }
    }], // @ annotations.
    // As an example, we emit a debugging log message on these tokens.
    // Note: message are supressed during the first load -- change some lines to see them.
    [/@\s*[a-zA-Z_\$][\w\$]*/, {
      token: 'annotation',
      log: 'annotation token: $0'
    }], // numbers
    [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'], [/0[xX][0-9a-fA-F]+/, 'number.hex'], [/\d+/, 'number'], // delimiter: after number because of .\d floats
    [/[;,.]/, 'delimiter'], [/"""/, {
      token: 'string',
      next: '@mlstring',
      nextEmbedded: 'markdown'
    }], // strings
    [/"([^"\\]|\\.)*$/, 'string.invalid'], [/"/, {
      token: 'string.quote',
      bracket: '@open',
      next: '@string'
    }]],
    mlstring: [[/[^"]+/, 'string'], ['"""', {
      token: 'string',
      next: '@pop',
      nextEmbedded: '@pop'
    }]],
    string: [[/[^\\"]+/, 'string'], [/@escapes/, 'string.escape'], [/\\./, 'string.escape.invalid'], [/"/, {
      token: 'string.quote',
      bracket: '@close',
      next: '@pop'
    }]],
    whitespace: [[/[ \t\r\n]+/, ''], [/#.*$/, 'comment']]
  }
};
exports.language = language;
},{}]},{},["qzqG"], null)
//# sourceMappingURL=/graphql.5f90ae20.js.map