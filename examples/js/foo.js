snake.define('foo', function(require, exports, module) {
  exports.bar = function() {
    console.log('foo.bar');
  };
  var b = require('b');
  b.c();
});
