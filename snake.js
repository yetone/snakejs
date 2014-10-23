;(function(window, undefined) {
  var $DOC = window.document,
      snake = window.snake = {},
      $head = $DOC.head,
      baseUrl = '',
      commentRe = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
      requireRe = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,
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
              cbk.apply(cbk, arrProto.slice.call(arguments, 1));
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
    $node.onreadystatechange = function() {
      if (/loaded|complete/.test($node.readyState)) {
        _onload()
      }
    };
    function _onload() {
      $node.remove ? $node.remove() : $head.removeChild($node);
      emitId(id);
    }
  }
  function getCurrentScript() {
    return $DOC.currentScript;
  }
  function getCurrentId() {
    var src = getCurrentScript().src;
    return src.slice(src.indexOf(baseUrl) + baseUrl.length, src.lastIndexOf('.js'));
  }
  function genCurrentSrc(id) {
    return genSrc(getCurrentSrcPath(), id);
  }
  function getCurrentSrcPath() {
    var src = getCurrentScript().src;
    return src.slice(0, src.lastIndexOf('/') + 1);
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
    var _id = id,
        _arr = arr,
        _cbk = cbk;
    if (isFunction(id)) {
      _id = getCurrentId();
      _arr = [];
      _cbk = id;
    } else if (isArray(id)) {
      _id = getCurrentId();
      _arr = id;
      _cbk = arr;
    } else if (isFunction(arr)) {
      _arr = [];
      _cbk = arr;
    }
    _cbk.toString()
        .replace(commentRe, '')
        .replace(requireRe, function (match, dep) {
          _arr.indexOf(dep) < 0 && _arr.push(dep);
        });
    if (!_arr.length) {
      return _define();
    }
    use(_arr, _define);
    function _define() {
      var module = moduleMap[_id] = {
            exports: {}
          },
          args = [require, module.exports, module];
      arrProto.push.apply(args, arguments);
      _cbk.apply(_cbk, args);
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
      var src = genCurrentSrc(id);
      appendScriptElement(src, id);
      observer.on(id, function() {
        if (!moduleMap[id]) {
          throw Error('no module named: "' + id + '"');
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
    if (!moduleMap[id]) {
      throw Error('no module named: "' + id + '"');
    }
    return moduleMap[id].exports;
  }
  snake.define = define;
  snake.use = use;
  snake.config = function(opt) {
    if (opt.baseUrl) {
      baseUrl = opt.baseUrl;
      if (baseUrl.charAt(0) !== '/') {
        baseUrl = '/' + baseUrl;
      }
      if (baseUrl.charAt(baseUrl.length - 1) !== '/') {
        baseUrl += '/';
      }
    }
  };
})((new Function('return this;'))());
