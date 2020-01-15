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
})({"ptXv":[function(require,module,exports) {
/*
Copyright (c) 2008-2014 Pivotal Labs

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
jasmineRequire.html = function (j$) {
  j$.ResultsNode = jasmineRequire.ResultsNode();
  j$.HtmlReporter = jasmineRequire.HtmlReporter(j$);
  j$.QueryString = jasmineRequire.QueryString();
  j$.HtmlSpecFilter = jasmineRequire.HtmlSpecFilter();
};

jasmineRequire.HtmlReporter = function (j$) {
  var noopTimer = {
    start: function () {},
    elapsed: function () {
      return 0;
    }
  };

  function HtmlReporter(options) {
    var env = options.env || {},
        getContainer = options.getContainer,
        createElement = options.createElement,
        createTextNode = options.createTextNode,
        onRaiseExceptionsClick = options.onRaiseExceptionsClick || function () {},
        timer = options.timer || noopTimer,
        results = [],
        specsExecuted = 0,
        failureCount = 0,
        pendingSpecCount = 0,
        htmlReporterMain,
        symbols;

    this.initialize = function () {
      clearPrior();
      htmlReporterMain = createDom('div', {
        className: 'jasmine_html-reporter'
      }, createDom('div', {
        className: 'banner'
      }, createDom('a', {
        className: 'title',
        href: 'http://jasmine.github.io/',
        target: '_blank'
      }), createDom('span', {
        className: 'version'
      }, j$.version)), createDom('ul', {
        className: 'symbol-summary'
      }), createDom('div', {
        className: 'alert'
      }), createDom('div', {
        className: 'results'
      }, createDom('div', {
        className: 'failures'
      })));
      getContainer().appendChild(htmlReporterMain);
      symbols = find('.symbol-summary');
    };

    var totalSpecsDefined;

    this.jasmineStarted = function (options) {
      totalSpecsDefined = options.totalSpecsDefined || 0;
      timer.start();
    };

    var summary = createDom('div', {
      className: 'summary'
    });
    var topResults = new j$.ResultsNode({}, '', null),
        currentParent = topResults;

    this.suiteStarted = function (result) {
      currentParent.addChild(result, 'suite');
      currentParent = currentParent.last();
    };

    this.suiteDone = function (result) {
      if (currentParent == topResults) {
        return;
      }

      currentParent = currentParent.parent;
    };

    this.specStarted = function (result) {
      currentParent.addChild(result, 'spec');
    };

    var failures = [];

    this.specDone = function (result) {
      if (noExpectations(result) && console && console.error) {
        console.error('Spec \'' + result.fullName + '\' has no expectations.');
      }

      if (result.status != 'disabled') {
        specsExecuted++;
      }

      symbols.appendChild(createDom('li', {
        className: noExpectations(result) ? 'empty' : result.status,
        id: 'spec_' + result.id,
        title: result.fullName
      }));

      if (result.status == 'failed') {
        failureCount++;
        var failure = createDom('div', {
          className: 'spec-detail failed'
        }, createDom('div', {
          className: 'description'
        }, createDom('a', {
          title: result.fullName,
          href: specHref(result)
        }, result.fullName)), createDom('div', {
          className: 'messages'
        }));
        var messages = failure.childNodes[1];

        for (var i = 0; i < result.failedExpectations.length; i++) {
          var expectation = result.failedExpectations[i];
          messages.appendChild(createDom('div', {
            className: 'result-message'
          }, expectation.message));
          messages.appendChild(createDom('div', {
            className: 'stack-trace'
          }, expectation.stack));
        }

        failures.push(failure);
      }

      if (result.status == 'pending') {
        pendingSpecCount++;
      }
    };

    this.jasmineDone = function () {
      var banner = find('.banner');
      banner.appendChild(createDom('span', {
        className: 'duration'
      }, 'finished in ' + timer.elapsed() / 1000 + 's'));
      var alert = find('.alert');
      alert.appendChild(createDom('span', {
        className: 'exceptions'
      }, createDom('label', {
        className: 'label',
        'for': 'raise-exceptions'
      }, 'raise exceptions'), createDom('input', {
        className: 'raise',
        id: 'raise-exceptions',
        type: 'checkbox'
      })));
      var checkbox = find('#raise-exceptions');
      checkbox.checked = !env.catchingExceptions();
      checkbox.onclick = onRaiseExceptionsClick;

      if (specsExecuted < totalSpecsDefined) {
        var skippedMessage = 'Ran ' + specsExecuted + ' of ' + totalSpecsDefined + ' specs - run all';
        alert.appendChild(createDom('span', {
          className: 'bar skipped'
        }, createDom('a', {
          href: '?',
          title: 'Run all specs'
        }, skippedMessage)));
      }

      var statusBarMessage = '';
      var statusBarClassName = 'bar ';

      if (totalSpecsDefined > 0) {
        statusBarMessage += pluralize('spec', specsExecuted) + ', ' + pluralize('failure', failureCount);

        if (pendingSpecCount) {
          statusBarMessage += ', ' + pluralize('pending spec', pendingSpecCount);
        }

        statusBarClassName += failureCount > 0 ? 'failed' : 'passed';
      } else {
        statusBarClassName += 'skipped';
        statusBarMessage += 'No specs found';
      }

      alert.appendChild(createDom('span', {
        className: statusBarClassName
      }, statusBarMessage));
      var results = find('.results');
      results.appendChild(summary);
      summaryList(topResults, summary);

      function summaryList(resultsTree, domParent) {
        var specListNode;

        for (var i = 0; i < resultsTree.children.length; i++) {
          var resultNode = resultsTree.children[i];

          if (resultNode.type == 'suite') {
            var suiteListNode = createDom('ul', {
              className: 'suite',
              id: 'suite-' + resultNode.result.id
            }, createDom('li', {
              className: 'suite-detail'
            }, createDom('a', {
              href: specHref(resultNode.result)
            }, resultNode.result.description)));
            summaryList(resultNode, suiteListNode);
            domParent.appendChild(suiteListNode);
          }

          if (resultNode.type == 'spec') {
            if (domParent.getAttribute('class') != 'specs') {
              specListNode = createDom('ul', {
                className: 'specs'
              });
              domParent.appendChild(specListNode);
            }

            var specDescription = resultNode.result.description;

            if (noExpectations(resultNode.result)) {
              specDescription = 'SPEC HAS NO EXPECTATIONS ' + specDescription;
            }

            specListNode.appendChild(createDom('li', {
              className: resultNode.result.status,
              id: 'spec-' + resultNode.result.id
            }, createDom('a', {
              href: specHref(resultNode.result)
            }, specDescription)));
          }
        }
      }

      if (failures.length) {
        alert.appendChild(createDom('span', {
          className: 'menu bar spec-list'
        }, createDom('span', {}, 'Spec List | '), createDom('a', {
          className: 'failures-menu',
          href: '#'
        }, 'Failures')));
        alert.appendChild(createDom('span', {
          className: 'menu bar failure-list'
        }, createDom('a', {
          className: 'spec-list-menu',
          href: '#'
        }, 'Spec List'), createDom('span', {}, ' | Failures ')));

        find('.failures-menu').onclick = function () {
          setMenuModeTo('failure-list');
        };

        find('.spec-list-menu').onclick = function () {
          setMenuModeTo('spec-list');
        };

        setMenuModeTo('failure-list');
        var failureNode = find('.failures');

        for (var i = 0; i < failures.length; i++) {
          failureNode.appendChild(failures[i]);
        }
      }
    };

    return this;

    function find(selector) {
      return getContainer().querySelector('.jasmine_html-reporter ' + selector);
    }

    function clearPrior() {
      // return the reporter
      var oldReporter = find('');

      if (oldReporter) {
        getContainer().removeChild(oldReporter);
      }
    }

    function createDom(type, attrs, childrenVarArgs) {
      var el = createElement(type);

      for (var i = 2; i < arguments.length; i++) {
        var child = arguments[i];

        if (typeof child === 'string') {
          el.appendChild(createTextNode(child));
        } else {
          if (child) {
            el.appendChild(child);
          }
        }
      }

      for (var attr in attrs) {
        if (attr == 'className') {
          el[attr] = attrs[attr];
        } else {
          el.setAttribute(attr, attrs[attr]);
        }
      }

      return el;
    }

    function pluralize(singular, count) {
      var word = count == 1 ? singular : singular + 's';
      return '' + count + ' ' + word;
    }

    function specHref(result) {
      return '?spec=' + encodeURIComponent(result.fullName);
    }

    function setMenuModeTo(mode) {
      htmlReporterMain.setAttribute('class', 'jasmine_html-reporter ' + mode);
    }

    function noExpectations(result) {
      return result.failedExpectations.length + result.passedExpectations.length === 0 && result.status === 'passed';
    }
  }

  return HtmlReporter;
};

jasmineRequire.HtmlSpecFilter = function () {
  function HtmlSpecFilter(options) {
    var filterString = options && options.filterString() && options.filterString().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    var filterPattern = new RegExp(filterString);

    this.matches = function (specName) {
      return filterPattern.test(specName);
    };
  }

  return HtmlSpecFilter;
};

jasmineRequire.ResultsNode = function () {
  function ResultsNode(result, type, parent) {
    this.result = result;
    this.type = type;
    this.parent = parent;
    this.children = [];

    this.addChild = function (result, type) {
      this.children.push(new ResultsNode(result, type, this));
    };

    this.last = function () {
      return this.children[this.children.length - 1];
    };
  }

  return ResultsNode;
};

jasmineRequire.QueryString = function () {
  function QueryString(options) {
    this.setParam = function (key, value) {
      var paramMap = queryStringToParamMap();
      paramMap[key] = value;
      options.getWindowLocation().search = toQueryString(paramMap);
    };

    this.getParam = function (key) {
      return queryStringToParamMap()[key];
    };

    return this;

    function toQueryString(paramMap) {
      var qStrPairs = [];

      for (var prop in paramMap) {
        qStrPairs.push(encodeURIComponent(prop) + '=' + encodeURIComponent(paramMap[prop]));
      }

      return '?' + qStrPairs.join('&');
    }

    function queryStringToParamMap() {
      var paramStr = options.getWindowLocation().search.substring(1),
          params = [],
          paramMap = {};

      if (paramStr.length > 0) {
        params = paramStr.split('&');

        for (var i = 0; i < params.length; i++) {
          var p = params[i].split('=');
          var value = decodeURIComponent(p[1]);

          if (value === 'true' || value === 'false') {
            value = JSON.parse(value);
          }

          paramMap[decodeURIComponent(p[0])] = value;
        }
      }

      return paramMap;
    }
  }

  return QueryString;
};
},{}]},{},["ptXv"], null)
//# sourceMappingURL=/jasmine-html.70ef9927.js.map