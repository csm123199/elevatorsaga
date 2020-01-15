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
})({"RBVc":[function(require,module,exports) {
/* Riot 1.0.2, @license MIT, (c) 2014 Muut Inc + contributors */
(function (riot) {
  "use strict";

  riot.observable = function (el) {
    var callbacks = {},
        slice = [].slice;

    el.on = function (events, fn) {
      if (typeof fn === "function") {
        events.replace(/[^\s]+/g, function (name, pos) {
          (callbacks[name] = callbacks[name] || []).push(fn);
          fn.typed = pos > 0;
        });
      }

      return el;
    };

    el.off = function (events, fn) {
      if (events === "*") callbacks = {};else if (fn) {
        var arr = callbacks[events];

        for (var i = 0, cb; cb = arr && arr[i]; ++i) {
          if (cb === fn) arr.splice(i, 1);
        }
      } else {
        events.replace(/[^\s]+/g, function (name) {
          callbacks[name] = [];
        });
      }
      return el;
    }; // only single event supported


    el.one = function (name, fn) {
      if (fn) fn.one = true;
      return el.on(name, fn);
    };

    el.trigger = function (name) {
      var args = slice.call(arguments, 1),
          fns = callbacks[name] || [];

      for (var i = 0, fn; fn = fns[i]; ++i) {
        if (!fn.busy) {
          fn.busy = true;
          fn.apply(el, fn.typed ? [name].concat(args) : args);

          if (fn.one) {
            fns.splice(i, 1);
            i--;
          } else if (fns[i] && fns[i] !== fn) {
            i--;
          } // Makes self-removal possible during iteration


          fn.busy = false;
        }
      }

      return el;
    };

    return el;
  };

  var FN = {},
      // Precompiled templates (JavaScript functions)
  template_escape = {
    "\\": "\\\\",
    "\n": "\\n",
    "\r": "\\r",
    "'": "\\'"
  },
      render_escape = {
    '&': '&amp;',
    '"': '&quot;',
    '<': '&lt;',
    '>': '&gt;'
  };

  function default_escape_fn(str, key) {
    return str == null ? '' : (str + '').replace(/[&\"<>]/g, function (char) {
      return render_escape[char];
    });
  }

  riot.render = function (tmpl, data, escape_fn) {
    if (escape_fn === true) escape_fn = default_escape_fn;
    tmpl = tmpl || '';
    return (FN[tmpl] = FN[tmpl] || new Function("_", "e", "return '" + tmpl.replace(/[\\\n\r']/g, function (char) {
      return template_escape[char];
    }).replace(/{\s*([\w\.]+)\s*}/g, "' + (e?e(_.$1,'$1'):_.$1||(_.$1==null?'':_.$1)) + '") + "'"))(data, escape_fn);
  };
  /* Cross browser popstate */


  (function () {
    // for browsers only
    if (typeof window === "undefined") return;
    var currentHash,
        pops = riot.observable({}),
        listen = window.addEventListener,
        doc = document;

    function pop(hash) {
      hash = hash.type ? location.hash : hash;
      if (hash !== currentHash) pops.trigger("pop", hash);
      currentHash = hash;
    }
    /* Always fire pop event upon page load (normalize behaviour across browsers) */
    // standard browsers


    if (listen) {
      listen("popstate", pop, false);
      doc.addEventListener("DOMContentLoaded", pop, false); // IE
    } else {
      doc.attachEvent("onreadystatechange", function () {
        if (doc.readyState === "complete") pop("");
      });
    }
    /* Change the browser URL or listen to changes on the URL */


    riot.route = function (to) {
      // listen
      if (typeof to === "function") return pops.on("pop", to); // fire

      if (history.pushState) history.pushState(0, 0, to);
      pop(to);
    };
  })();
})(typeof window !== "undefined" ? window.riot = {} : typeof exports !== "undefined" ? exports : self.riot = {});
},{}]},{},["RBVc"], null)
//# sourceMappingURL=/riot.82316cf3.js.map