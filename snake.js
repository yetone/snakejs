;(function(window, undefined) {
  var $DOC = window.document,
      snake = window.snake = {},
      $head = $DOC.head,
      cbkMap = {},
      moduleMap = {},
      appendedScripts = [];
  function addOnload($node, cbk) {
    // TODO
    if ('onload' in $node) {
      return $node.onload = onload;
    }
    function onload() {
      $node.remove ? $node.remove() : $head.removeChild($node);
      cbk();
    }
  }
  function getSrcPath(src) {
    return src.substr(0, src.lastIndexOf('/') + 1);
  }
  function appendScriptElement(src, cbk, $parent) {
    $parent = $parent || $head;
    var $node = $DOC.createElement('script');
    addOnload($node, cbk);
    $node.async = true;
    $node.src = src;
    appendedScripts.push($node);
    $parent.appendChild($node);
  }
  function define(str, cbk) {
    cbkMap[str] = cbk;
    var module = moduleMap[str] = {},
        exports = {};
    module.exports = exports;
    cbk(require, exports, module);
  }
  function use(str, cbk) {
    var $current = $DOC.currentScript;
    var path = getSrcPath($current.src);
    var src = path + str;
    if (str.slice(str.length - 3) !== '.js') {
      src = path + str + '.js';
    }
    appendScriptElement(src, function() {
      cbk && cbk(moduleMap[str].exports);
    });
  }
  function require(str) {
    use(str);
    if (!moduleMap[str]) {
      throw Error('no module named "' + str + '"!');
    }
    return moduleMap[str].exports;
  }
  snake.define = define;
  snake.use = use;
})((new Function('return this;'))());
