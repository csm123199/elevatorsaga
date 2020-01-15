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
})({"hj9y":[function(require,module,exports) {
/**
 Starting with version 2.0, this file "boots" Jasmine, performing all of the necessary initialization before executing the loaded environment and all of a project's specs. This file should be loaded after `jasmine.js`, but before any project source files or spec files are loaded. Thus this file can also be used to customize Jasmine for a project.

 If a project is using Jasmine via the standalone distribution, this file can be customized directly. If a project is using Jasmine via the [Ruby gem][jasmine-gem], this file can be copied into the support directory via `jasmine copy_boot_js`. Other environments (e.g., Python) will have different mechanisms.

 The location of `boot.js` can be specified and/or overridden in `jasmine.yml`.

 [jasmine-gem]: http://github.com/pivotal/jasmine-gem
 */
(function () {
  /**
   * ## Require &amp; Instantiate
   *
   * Require Jasmine's core files. Specifically, this requires and attaches all of Jasmine's code to the `jasmine` reference.
   */
  window.jasmine = jasmineRequire.core(jasmineRequire);
  /**
   * Since this is being run in a browser and the results should populate to an HTML page, require the HTML-specific Jasmine code, injecting the same reference.
   */

  jasmineRequire.html(jasmine);
  /**
   * Create the Jasmine environment. This is used to run all specs in a project.
   */

  var env = jasmine.getEnv();
  /**
   * ## The Global Interface
   *
   * Build up the functions that will be exposed as the Jasmine public interface. A project can customize, rename or alias any of these functions as desired, provided the implementation remains unchanged.
   */

  var jasmineInterface = jasmineRequire.interface(jasmine, env);
  /**
   * Add all of the Jasmine global/public interface to the proper global, so a project can use the public interface directly. For example, calling `describe` in specs instead of `jasmine.getEnv().describe`.
   */

  if (typeof window == "undefined" && typeof exports == "object") {
    extend(exports, jasmineInterface);
  } else {
    extend(window, jasmineInterface);
  }
  /**
   * ## Runner Parameters
   *
   * More browser specific code - wrap the query string in an object and to allow for getting/setting parameters from the runner user interface.
   */


  var queryString = new jasmine.QueryString({
    getWindowLocation: function () {
      return window.location;
    }
  });
  var catchingExceptions = queryString.getParam("catch");
  env.catchExceptions(typeof catchingExceptions === "undefined" ? true : catchingExceptions);
  /**
   * ## Reporters
   * The `HtmlReporter` builds all of the HTML UI for the runner page. This reporter paints the dots, stars, and x's for specs, as well as all spec names and all failures (if any).
   */

  var htmlReporter = new jasmine.HtmlReporter({
    env: env,
    onRaiseExceptionsClick: function () {
      queryString.setParam("catch", !env.catchingExceptions());
    },
    getContainer: function () {
      return document.body;
    },
    createElement: function () {
      return document.createElement.apply(document, arguments);
    },
    createTextNode: function () {
      return document.createTextNode.apply(document, arguments);
    },
    timer: new jasmine.Timer()
  });
  /**
   * The `jsApiReporter` also receives spec results, and is used by any environment that needs to extract the results  from JavaScript.
   */

  env.addReporter(jasmineInterface.jsApiReporter);
  env.addReporter(htmlReporter);
  /**
   * Filter which specs will be run by matching the start of the full name against the `spec` query param.
   */

  var specFilter = new jasmine.HtmlSpecFilter({
    filterString: function () {
      return queryString.getParam("spec");
    }
  });

  env.specFilter = function (spec) {
    return specFilter.matches(spec.getFullName());
  };
  /**
   * Setting up timing functions to be able to be overridden. Certain browsers (Safari, IE 8, phantomjs) require this hack.
   */


  window.setTimeout = window.setTimeout;
  window.setInterval = window.setInterval;
  window.clearTimeout = window.clearTimeout;
  window.clearInterval = window.clearInterval;
  /**
   * ## Execution
   *
   * Replace the browser window's `onload`, ensure it's called, and then run all of the loaded specs. This includes initializing the `HtmlReporter` instance and then executing the loaded Jasmine environment. All of this will happen after all of the specs are loaded.
   */

  var currentWindowOnload = window.onload;

  window.onload = function () {
    if (currentWindowOnload) {
      currentWindowOnload();
    }

    htmlReporter.initialize();
    env.execute();
  };
  /**
   * Helper function for readability above.
   */


  function extend(destination, source) {
    for (var property in source) destination[property] = source[property];

    return destination;
  }
})();
},{}]},{},["hj9y"], null)
//# sourceMappingURL=/boot.0c944974.js.map