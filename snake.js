;(function(window, undefined) {
  var $DOC = window.document,
      snake = window.snake = {},
      $head = $DOC.head,
      moduleMap = {},
      appendedScripts = [],
      arrProto = window.Array.prototype,
      objProto = window.Object.prototype,
      isArray = window.Array.isArray,
      isFunction = function(obj) {
        return objProto.toString.call(obj) === '[object Function]';
      },
      each = function(arr, cbk) {
        if (arr.forEach) {
          return arr.forEach(cbk);
        }
        for (var i = 0, l = arr.length; i < l; i++) {
          cbk(arr[i], i);
        }
      },
      filter = function(arr, cbk) {
        if (arr.filter) {
          return arr.filter(cbk);
        }
        var acc = [];
        for (var i = 0, l = arr.length; i < l; i++) {
          if (cbk(arr[i])) {
            acc.push(arr[i]);
          }
        }
        return acc;
      },
      Observer = (function() {
        function Observer() {
          this._cbks = {};
        }
        var proto = Observer.prototype;
        proto.on = function(event, cbk) {
          var self = this;
          if (!self._cbks[event]) {
            self._cbks[event] = [];
          }
          self._cbks[event].push(cbk);
        };
        proto.off = function(event, cbk) {
          var self = this,
              _cbks;
          if (!cbk) {
            delete self._cbks[event];
            return;
          }
          _cbks = self._cbks[event];
          if (!_cbks) return;
          self._cbks[event] = filter(_cbks, function(_cbk) {
            return _cbk !== cbk;
          });
        };
        proto.emit = function(eventArr) {
          var self = this,
              cbks;
          if (!isArray(eventArr)) {
            eventArr = eventArr.split(' ');
          }
          each(eventArr, function(event) {
            cbks = self._cbks[event];
            if (!cbks) return;
            each(cbks, function(cbk) {
              cbk();
            });
          });
        };
        return Observer;
      })(),
      observer = new Observer(),
      timmerMap = {};
  if (!isArray) {
    isArray = function(obj) {
      return objProto.toString.call(obj) === '[object Array]';
    };
  }
  function emitId(id) {
    timmerMap[id] = window.setTimeout(function() {
      if (!moduleMap[id]) return emitId(id);
      window.clearTimeout(timmerMap[id]);
      observer.emit(id);
    });
  }
  function addOnload($node, id) {
    // TODO
    if ('onload' in $node) {
      return $node.onload = _onload;
    }
    function _onload() {
      $node.remove ? $node.remove() : $head.removeChild($node);
      emitId(id);
    }
  }
  function getSrcPath(src) {
    return src.substr(0, src.lastIndexOf('/') + 1);
  }
  function genSrc(path, id) {
    if (id.slice(id.length - 3) !== '.js') {
      id = id + '.js';
    }
    return path + id;
  }
  function appendScriptElement(src, id, $parent) {
    $parent = $parent || $head;
    var $node = $DOC.createElement('script');
    addOnload($node, id);
    $node.async = true;
    $node.src = src;
    appendedScripts.push($node);
    $parent.appendChild($node);
  }
  function define(id, arr, cbk) {
    if (isFunction(arr)) {
      cbk = arr;
      return _define();
    }
    use(arr, _define);
    function _define() {
      var module = moduleMap[id] = {},
          exports = {},
          args = [require, exports, module];
      module.exports = exports;
      arrProto.push.apply(args, arguments);
      cbk.apply(cbk, args);
    }
  }
  function use(arr, cbk) {
    var acc = [];
    var idxAcc = [];
    if (!isArray(arr)) {
      arr = arr.split(' ');
    }
    each(arr, _use);
    function _use(id, idx) {
      var $current = $DOC.currentScript;
      var path = getSrcPath($current.src);
      var src = genSrc(path, id);
      appendScriptElement(src, id);
      observer.on(id, function() {
        if (!moduleMap[id]) {
          console.log(id, arr);
          return;
        }
        acc[idx] = moduleMap[id].exports;
        idxAcc.push(idx);
        if (idxAcc.length === arr.length) {
          cbk.apply(cbk, acc);
        }
      });
    }
  }
  function require(id) {
    use(id);
    if (!moduleMap[id]) {
      throw Error('no module named "' + id + '"!');
    }
    return moduleMap[id].exports;
  }
  snake.define = define;
  snake.use = use;
  window.moduleMap = moduleMap;
})((new Function('return this;'))());
