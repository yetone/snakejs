snake.define('foo', ['b'], function(require, exports, module, b) {
  exports.bar = function() {
    console.log('foo.bar');
  };
  b.c();
});
