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
})({"Bf1E":[function(require,module,exports) {
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
  // the default separators except `$-`
  wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#%\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
  comments: {
    lineComment: '#',
    blockComment: ['<#', '#>']
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
    open: '"',
    close: '"',
    notIn: ['string']
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
      start: new RegExp("^\\s*#region\\b"),
      end: new RegExp("^\\s*#endregion\\b")
    }
  }
};
exports.conf = conf;
var language = {
  defaultToken: '',
  ignoreCase: true,
  tokenPostfix: '.ps1',
  brackets: [{
    token: 'delimiter.curly',
    open: '{',
    close: '}'
  }, {
    token: 'delimiter.square',
    open: '[',
    close: ']'
  }, {
    token: 'delimiter.parenthesis',
    open: '(',
    close: ')'
  }],
  keywords: ['begin', 'break', 'catch', 'class', 'continue', 'data', 'define', 'do', 'dynamicparam', 'else', 'elseif', 'end', 'exit', 'filter', 'finally', 'for', 'foreach', 'from', 'function', 'if', 'in', 'param', 'process', 'return', 'switch', 'throw', 'trap', 'try', 'until', 'using', 'var', 'while', 'workflow', 'parallel', 'sequence', 'inlinescript', 'configuration'],
  helpKeywords: /SYNOPSIS|DESCRIPTION|PARAMETER|EXAMPLE|INPUTS|OUTPUTS|NOTES|LINK|COMPONENT|ROLE|FUNCTIONALITY|FORWARDHELPTARGETNAME|FORWARDHELPCATEGORY|REMOTEHELPRUNSPACE|EXTERNALHELP/,
  // we include these common regular expressions
  symbols: /[=><!~?&%|+\-*\/\^;\.,]+/,
  escapes: /`(?:[abfnrtv\\"'$]|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
  // The main tokenizer for our languages
  tokenizer: {
    root: [// commands and keywords
    [/[a-zA-Z_][\w-]*/, {
      cases: {
        '@keywords': {
          token: 'keyword.$0'
        },
        '@default': ''
      }
    }], // whitespace
    [/[ \t\r\n]+/, ''], // labels
    [/^:\w*/, 'metatag'], // variables
    [/\$(\{((global|local|private|script|using):)?[\w]+\}|((global|local|private|script|using):)?[\w]+)/, 'variable'], // Comments
    [/<#/, 'comment', '@comment'], [/#.*$/, 'comment'], // delimiters
    [/[{}()\[\]]/, '@brackets'], [/@symbols/, 'delimiter'], // numbers
    [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'], [/0[xX][0-9a-fA-F_]*[0-9a-fA-F]/, 'number.hex'], [/\d+?/, 'number'], // delimiter: after number because of .\d floats
    [/[;,.]/, 'delimiter'], // strings:
    [/\@"/, 'string', '@herestring."'], [/\@'/, 'string', '@herestring.\''], [/"/, {
      cases: {
        '@eos': 'string',
        '@default': {
          token: 'string',
          next: '@string."'
        }
      }
    }], [/'/, {
      cases: {
        '@eos': 'string',
        '@default': {
          token: 'string',
          next: '@string.\''
        }
      }
    }]],
    string: [[/[^"'\$`]+/, {
      cases: {
        '@eos': {
          token: 'string',
          next: '@popall'
        },
        '@default': 'string'
      }
    }], [/@escapes/, {
      cases: {
        '@eos': {
          token: 'string.escape',
          next: '@popall'
        },
        '@default': 'string.escape'
      }
    }], [/`./, {
      cases: {
        '@eos': {
          token: 'string.escape.invalid',
          next: '@popall'
        },
        '@default': 'string.escape.invalid'
      }
    }], [/\$[\w]+$/, {
      cases: {
        '$S2=="': {
          token: 'variable',
          next: '@popall'
        },
        '@default': {
          token: 'string',
          next: '@popall'
        }
      }
    }], [/\$[\w]+/, {
      cases: {
        '$S2=="': 'variable',
        '@default': 'string'
      }
    }], [/["']/, {
      cases: {
        '$#==$S2': {
          token: 'string',
          next: '@pop'
        },
        '@default': {
          cases: {
            '@eos': {
              token: 'string',
              next: '@popall'
            },
            '@default': 'string'
          }
        }
      }
    }]],
    herestring: [[/^\s*(["'])@/, {
      cases: {
        '$1==$S2': {
          token: 'string',
          next: '@pop'
        },
        '@default': 'string'
      }
    }], [/[^\$`]+/, 'string'], [/@escapes/, 'string.escape'], [/`./, 'string.escape.invalid'], [/\$[\w]+/, {
      cases: {
        '$S2=="': 'variable',
        '@default': 'string'
      }
    }]],
    comment: [[/[^#\.]+/, 'comment'], [/#>/, 'comment', '@pop'], [/(\.)(@helpKeywords)(?!\w)/, {
      token: 'comment.keyword.$2'
    }], [/[\.#]/, 'comment']]
  }
};
exports.language = language;
},{}]},{},["Bf1E"], null)
//# sourceMappingURL=/powershell.a68ebd05.js.map