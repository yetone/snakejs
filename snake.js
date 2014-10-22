;(function(window, undefined) {
  var $DOC = window.document,
      snake = window.snake = {},
      $head = $DOC.head,
      scriptMap = {},
      appendedScripts = [];
  function addOnload($node, cbk) {
    if ('onload' in $node) {
      $node.onload = cbk;
    }
  }
  function appendScriptElement(src, cbk, $parent) {
    $parent = $parent || $head;
    var $node = $DOC.createElement('script');
    addOnload($node, cbk);
    $node.async = true;
    $node.src = src;
    appendedScript.push($node);
    $parent.appendChild($node);
  }
  function define(str, func) {
    scriptMap[str] = func;
  }
  function require(str, func) {
    var src = str;
    if (str.slice(str.length - 3) !== '.js') {
      src = str + '.js';
    }
    appendScriptElement(src, func);
  }
})((new Function('return this;'))());
