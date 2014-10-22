snake.use('foo b', function(foo, b) {
  console.log('*** in a.js ***');
  foo.bar();
  b.c();
  console.log('*** out a.js ***');
});
