/**
 * Legacy Browser Polyfills
 * JavaScript polyfills for older browsers (IE11, older Safari, Firefox)
 * Ensures modern JavaScript features work across all target browsers
 */

(function() {
  'use strict';

  // ===== CSS CUSTOM PROPERTIES DETECTION AND FALLBACK =====
  
  function supportsCSSVariables() {
    try {
      return CSS.supports('--css', 'variables');
    } catch (e) {
      return false;
    }
  }

  function applyCSSVariablesFallback() {
    if (!supportsCSSVariables()) {
      document.documentElement.classList.add('no-css-variables', 'no-css-vars');
      
      // Apply fallback styles programmatically
      var fallbackStyles = {
       // '--color-primary': '#2563eb',
     //   '--color-background': '#ffffff',
      //  '--color-text-primary': '#0f172a',
        '--space-4': '1rem',
        '--border-radius-base': '4px',
        '--font-family-sans': 'Inter, system-ui, sans-serif',
        '--font-family-mono': 'JetBrains Mono, Consolas, monospace'
      };
      
      // Create a style element with fallback values
      var style = document.createElement('style');
      var css = '.no-css-variables { ';
      for (var prop in fallbackStyles) {
        css += prop.replace('--', '') + ': ' + fallbackStyles[prop] + '; ';
      }
      css += '}';
      style.textContent = css;
      document.head.appendChild(style);
    }
  }

  // ===== CSS GRID DETECTION AND FALLBACK =====
  
  function supportsGrid() {
    try {
      return CSS.supports('display', 'grid');
    } catch (e) {
      return false;
    }
  }

  function applyGridFallback() {
    if (!supportsGrid()) {
      document.documentElement.classList.add('no-grid');
      
      // Convert grid layouts to flexbox
      var gridElements = document.querySelectorAll('.grid, .card-grid, .project-grid');
      for (var i = 0; i < gridElements.length; i++) {
        var element = gridElements[i];
        element.style.display = 'flex';
        element.style.flexWrap = 'wrap';
        element.style.margin = '-0.5rem';
        
        var children = element.children;
        for (var j = 0; j < children.length; j++) {
          children[j].style.flex = '1 1 300px';
          children[j].style.margin = '0.5rem';
        }
      }
    }
  }

  // ===== FLEXBOX DETECTION AND FALLBACK =====
  
  function supportsFlexbox() {
    try {
      return CSS.supports('display', 'flex');
    } catch (e) {
      return false;
    }
  }

  function applyFlexboxFallback() {
    if (!supportsFlexbox()) {
      document.documentElement.classList.add('no-flex');
      
      // Convert flexbox layouts to table display
      var flexElements = document.querySelectorAll('.flex, .layout-with-sidebar');
      for (var i = 0; i < flexElements.length; i++) {
        var element = flexElements[i];
        element.style.display = 'table';
        element.style.width = '100%';
        
        var children = element.children;
        for (var j = 0; j < children.length; j++) {
          children[j].style.display = 'table-cell';
          children[j].style.verticalAlign = 'top';
        }
      }
    }
  }

  // ===== OBJECT-FIT POLYFILL =====
  
  function supportsObjectFit() {
    try {
      return CSS.supports('object-fit', 'cover');
    } catch (e) {
      return false;
    }
  }

  function applyObjectFitPolyfill() {
    if (!supportsObjectFit()) {
      var images = document.querySelectorAll('.object-fit-cover');
      for (var i = 0; i < images.length; i++) {
        var img = images[i];
        var parent = img.parentNode;
        
        // Create wrapper if it doesn't exist
        if (!parent.classList.contains('object-fit-container')) {
          var wrapper = document.createElement('div');
          wrapper.className = 'object-fit-container';
          wrapper.style.position = 'relative';
          wrapper.style.overflow = 'hidden';
          
          parent.insertBefore(wrapper, img);
          wrapper.appendChild(img);
        }
        
        // Apply positioning styles
        img.style.position = 'absolute';
        img.style.top = '50%';
        img.style.left = '50%';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.transform = 'translate(-50%, -50%)';
      }
    }
  }

  // ===== STICKY POSITIONING POLYFILL =====
  
  function supportsSticky() {
    try {
      return CSS.supports('position', 'sticky');
    } catch (e) {
      return false;
    }
  }

  function applyStickyPolyfill() {
    if (!supportsSticky()) {
      var stickyElements = document.querySelectorAll('.sticky');
      
      function updateStickyElements() {
        for (var i = 0; i < stickyElements.length; i++) {
          var element = stickyElements[i];
          var rect = element.getBoundingClientRect();
          var parent = element.parentNode;
          var parentRect = parent.getBoundingClientRect();
          
          if (parentRect.top <= 0 && parentRect.bottom > element.offsetHeight) {
            element.style.position = 'fixed';
            element.style.top = '0';
            element.style.zIndex = '1100';
          } else {
            element.style.position = 'static';
          }
        }
      }
      
      window.addEventListener('scroll', updateStickyElements);
      window.addEventListener('resize', updateStickyElements);
      updateStickyElements();
    }
  }

  // ===== INTERSECTION OBSERVER POLYFILL =====
  
  function supportsIntersectionObserver() {
    return 'IntersectionObserver' in window;
  }

  function createIntersectionObserverPolyfill() {
    if (!supportsIntersectionObserver()) {
      // Simple polyfill for basic intersection detection
      window.IntersectionObserver = function(callback, options) {
        this.callback = callback;
        this.options = options || {};
        this.elements = [];
      };
      
      window.IntersectionObserver.prototype.observe = function(element) {
        this.elements.push(element);
        this.checkIntersection();
      };
      
      window.IntersectionObserver.prototype.unobserve = function(element) {
        var index = this.elements.indexOf(element);
        if (index > -1) {
          this.elements.splice(index, 1);
        }
      };
      
      window.IntersectionObserver.prototype.checkIntersection = function() {
        var self = this;
        var entries = [];
        
        for (var i = 0; i < this.elements.length; i++) {
          var element = this.elements[i];
          var rect = element.getBoundingClientRect();
          var isIntersecting = rect.top < window.innerHeight && rect.bottom > 0;
          
          entries.push({
            target: element,
            isIntersecting: isIntersecting,
            intersectionRatio: isIntersecting ? 1 : 0
          });
        }
        
        this.callback(entries);
        
        // Check again on scroll and resize
        setTimeout(function() {
          self.checkIntersection();
        }, 100);
      };
    }
  }

  // ===== ARRAY POLYFILLS =====
  
  function addArrayPolyfills() {
    // Array.from polyfill
    if (!Array.from) {
      Array.from = function(arrayLike, mapFn, thisArg) {
        var result = [];
        var length = arrayLike.length;
        for (var i = 0; i < length; i++) {
          var value = arrayLike[i];
          if (mapFn) {
            value = mapFn.call(thisArg, value, i);
          }
          result.push(value);
        }
        return result;
      };
    }
    
    // Array.includes polyfill
    if (!Array.prototype.includes) {
      Array.prototype.includes = function(searchElement, fromIndex) {
        var O = Object(this);
        var len = parseInt(O.length) || 0;
        if (len === 0) return false;
        var n = parseInt(fromIndex) || 0;
        var k;
        if (n >= 0) {
          k = n;
        } else {
          k = len + n;
          if (k < 0) k = 0;
        }
        for (; k < len; k++) {
          if (O[k] === searchElement) return true;
        }
        return false;
      };
    }
    
    // Array.find polyfill
    if (!Array.prototype.find) {
      Array.prototype.find = function(predicate, thisArg) {
        var O = Object(this);
        var len = parseInt(O.length) || 0;
        if (typeof predicate !== 'function') {
          throw new TypeError('predicate must be a function');
        }
        var k = 0;
        while (k < len) {
          var kValue = O[k];
          if (predicate.call(thisArg, kValue, k, O)) {
            return kValue;
          }
          k++;
        }
        return undefined;
      };
    }
  }

  // ===== OBJECT POLYFILLS =====
  
  function addObjectPolyfills() {
    // Object.assign polyfill
    if (!Object.assign) {
      Object.assign = function(target) {
        if (target == null) {
          throw new TypeError('Cannot convert undefined or null to object');
        }
        var to = Object(target);
        for (var index = 1; index < arguments.length; index++) {
          var nextSource = arguments[index];
          if (nextSource != null) {
            for (var nextKey in nextSource) {
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
        return to;
      };
    }
    
    // Object.keys polyfill
    if (!Object.keys) {
      Object.keys = function(obj) {
        var keys = [];
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            keys.push(key);
          }
        }
        return keys;
      };
    }
  }

  // ===== STRING POLYFILLS =====
  
  function addStringPolyfills() {
    // String.includes polyfill
    if (!String.prototype.includes) {
      String.prototype.includes = function(search, start) {
        if (typeof start !== 'number') {
          start = 0;
        }
        if (start + search.length > this.length) {
          return false;
        } else {
          return this.indexOf(search, start) !== -1;
        }
      };
    }
    
    // String.startsWith polyfill
    if (!String.prototype.startsWith) {
      String.prototype.startsWith = function(searchString, position) {
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
      };
    }
    
    // String.endsWith polyfill
    if (!String.prototype.endsWith) {
      String.prototype.endsWith = function(searchString, length) {
        if (length === undefined || length > this.length) {
          length = this.length;
        }
        return this.substring(length - searchString.length, length) === searchString;
      };
    }
  }

  // ===== PROMISE POLYFILL =====
  
  function addPromisePolyfill() {
    if (!window.Promise) {
      window.Promise = function(executor) {
        var self = this;
        this.state = 'pending';
        this.value = undefined;
        this.handlers = [];
        
        function resolve(result) {
          if (self.state === 'pending') {
            self.state = 'fulfilled';
            self.value = result;
            self.handlers.forEach(handle);
            self.handlers = null;
          }
        }
        
        function reject(error) {
          if (self.state === 'pending') {
            self.state = 'rejected';
            self.value = error;
            self.handlers.forEach(handle);
            self.handlers = null;
          }
        }
        
        function handle(handler) {
          if (self.state === 'pending') {
            self.handlers.push(handler);
          } else {
            if (self.state === 'fulfilled' && typeof handler.onFulfilled === 'function') {
              handler.onFulfilled(self.value);
            }
            if (self.state === 'rejected' && typeof handler.onRejected === 'function') {
              handler.onRejected(self.value);
            }
          }
        }
        
        this.then = function(onFulfilled, onRejected) {
          return new Promise(function(resolve, reject) {
            handle({
              onFulfilled: function(result) {
                try {
                  resolve(onFulfilled ? onFulfilled(result) : result);
                } catch (ex) {
                  reject(ex);
                }
              },
              onRejected: function(error) {
                try {
                  resolve(onRejected ? onRejected(error) : error);
                } catch (ex) {
                  reject(ex);
                }
              }
            });
          });
        };
        
        executor(resolve, reject);
      };
    }
  }

  // ===== FETCH POLYFILL =====
  
  function addFetchPolyfill() {
    if (!window.fetch) {
      window.fetch = function(url, options) {
        return new Promise(function(resolve, reject) {
          var xhr = new XMLHttpRequest();
          options = options || {};
          
          xhr.open(options.method || 'GET', url);
          
          if (options.headers) {
            for (var header in options.headers) {
              xhr.setRequestHeader(header, options.headers[header]);
            }
          }
          
          xhr.onload = function() {
            resolve({
              ok: xhr.status >= 200 && xhr.status < 300,
              status: xhr.status,
              statusText: xhr.statusText,
              text: function() {
                return Promise.resolve(xhr.responseText);
              },
              json: function() {
                return Promise.resolve(JSON.parse(xhr.responseText));
              }
            });
          };
          
          xhr.onerror = function() {
            reject(new Error('Network error'));
          };
          
          xhr.send(options.body);
        });
      };
    }
  }

  // ===== ELEMENT POLYFILLS =====
  
  function addElementPolyfills() {
    // Element.matches polyfill
    if (!Element.prototype.matches) {
      Element.prototype.matches = 
        Element.prototype.matchesSelector || 
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector || 
        Element.prototype.oMatchesSelector || 
        Element.prototype.webkitMatchesSelector ||
        function(s) {
          var matches = (this.document || this.ownerDocument).querySelectorAll(s);
          var i = matches.length;
          while (--i >= 0 && matches.item(i) !== this) {}
          return i > -1;
        };
    }
    
    // Element.closest polyfill
    if (!Element.prototype.closest) {
      Element.prototype.closest = function(s) {
        var el = this;
        do {
          if (el.matches(s)) return el;
          el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
      };
    }
    
    // Element.classList polyfill for IE9
    if (!('classList' in document.createElement('_'))) {
      (function(view) {
        if (!('Element' in view)) return;
        
        var classListProp = 'classList',
            protoProp = 'prototype',
            elemCtrProto = view.Element[protoProp],
            objCtr = Object,
            strTrim = String[protoProp].trim || function() {
              return this.replace(/^\s+|\s+$/g, '');
            },
            arrIndexOf = Array[protoProp].indexOf || function(item) {
              var i = 0, len = this.length;
              for (; i < len; i++) {
                if (i in this && this[i] === item) {
                  return i;
                }
              }
              return -1;
            },
            DOMTokenList = function(el) {
              this.el = el;
              var classes = el.className.replace(/^\s+|\s+$/g, '').split(/\s+/);
              for (var i = 0; i < classes.length; i++) {
                this.push(classes[i]);
              }
              this._updateClassName = function() {
                el.className = this.toString();
              };
            },
            testEl = document.createElement('div');
        
        DOMTokenList[protoProp] = [];
        
        if (testEl.classList) {
          return;
        }
        
        DOMTokenList[protoProp].item = function(i) {
          return this[i] || null;
        };
        
        DOMTokenList[protoProp].contains = function(token) {
          token += '';
          return arrIndexOf.call(this, token) !== -1;
        };
        
        DOMTokenList[protoProp].add = function() {
          var tokens = arguments,
              i = 0,
              l = tokens.length,
              token,
              updated = false;
          do {
            token = tokens[i] + '';
            if (arrIndexOf.call(this, token) === -1) {
              this.push(token);
              updated = true;
            }
          }
          while (++i < l);
          
          if (updated) {
            this._updateClassName();
          }
        };
        
        DOMTokenList[protoProp].remove = function() {
          var tokens = arguments,
              i = 0,
              l = tokens.length,
              token,
              updated = false,
              index;
          do {
            token = tokens[i] + '';
            index = arrIndexOf.call(this, token);
            while (index !== -1) {
              this.splice(index, 1);
              updated = true;
              index = arrIndexOf.call(this, token);
            }
          }
          while (++i < l);
          
          if (updated) {
            this._updateClassName();
          }
        };
        
        DOMTokenList[protoProp].toggle = function(token, force) {
          token += '';
          
          var result = this.contains(token),
              method = result ?
                force !== true && 'remove' :
                force !== false && 'add';
          
          if (method) {
            this[method](token);
          }
          
          if (force === true || force === false) {
            return force;
          } else {
            return !result;
          }
        };
        
        DOMTokenList[protoProp].toString = function() {
          return this.join(' ');
        };
        
        if (objCtr.defineProperty) {
          var classListPropDesc = {
            get: function() {
              return new DOMTokenList(this);
            },
            enumerable: true,
            configurable: false
          };
          try {
            objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
          } catch (ex) {
            if (ex.number === -0x7FF5EC54) {
              classListPropDesc.enumerable = false;
              objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
            }
          }
        } else if (objCtr[protoProp].__defineGetter__) {
          elemCtrProto.__defineGetter__(classListProp, classListPropDesc.get);
        }
      }(window));
    }
  }

  // ===== INITIALIZATION =====
  
  function initializePolyfills() {
    // Apply CSS-related polyfills immediately
    applyCSSVariablesFallback();
    
    // Apply other polyfills when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        applyGridFallback();
        applyFlexboxFallback();
        applyObjectFitPolyfill();
        applyStickyPolyfill();
      });
    } else {
      applyGridFallback();
      applyFlexboxFallback();
      applyObjectFitPolyfill();
      applyStickyPolyfill();
    }
    
    // Add JavaScript polyfills
    createIntersectionObserverPolyfill();
    addArrayPolyfills();
    addObjectPolyfills();
    addStringPolyfills();
    addPromisePolyfill();
    addFetchPolyfill();
    addElementPolyfills();
  }

  // ===== BROWSER DETECTION =====
  
  function detectBrowser() {
    var ua = navigator.userAgent;
    var browser = {
      ie: /MSIE|Trident/.test(ua),
      ie11: /Trident.*rv[ :]*11\./.test(ua),
      edge: /Edge/.test(ua),
      chrome: /Chrome/.test(ua) && !/Edge/.test(ua),
      firefox: /Firefox/.test(ua),
      safari: /Safari/.test(ua) && !/Chrome/.test(ua),
      ios: /iPad|iPhone|iPod/.test(ua),
      android: /Android/.test(ua)
    };
    
    // Add browser classes to document
    for (var key in browser) {
      if (browser[key]) {
        document.documentElement.classList.add('browser-' + key);
      }
    }
    
    return browser;
  }

  // ===== FEATURE DETECTION =====
  
  function detectFeatures() {
    var features = {
      cssVariables: supportsCSSVariables(),
      grid: supportsGrid(),
      flexbox: supportsFlexbox(),
      objectFit: supportsObjectFit(),
      sticky: supportsSticky(),
      intersectionObserver: supportsIntersectionObserver()
    };
    
    // Add feature classes to document
    for (var key in features) {
      var className = features[key] ? 'supports-' + key : 'no-' + key;
      document.documentElement.classList.add(className);
    }
    
    return features;
  }

  // ===== MAIN INITIALIZATION =====
  
  // Initialize immediately
  detectBrowser();
  detectFeatures();
  initializePolyfills();
  
  // Expose utilities globally for debugging
  window.LegacySupport = {
    detectBrowser: detectBrowser,
    detectFeatures: detectFeatures,
    supportsCSSVariables: supportsCSSVariables,
    supportsGrid: supportsGrid,
    supportsFlexbox: supportsFlexbox,
    supportsObjectFit: supportsObjectFit,
    supportsSticky: supportsSticky
  };

})();