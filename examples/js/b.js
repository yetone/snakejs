snake.define('b', ['c'], function(require, exports, module, c) {
  module.exports = {
    c: function() {
      console.log('b.c');
    }
  };
  c.d();
});
