let oldXHROpen = window.XMLHttpRequest.prototype.open

window.XMLHttpRequest.prototype.open = function(
  method,
  url,
  async,
  user,
  password
) {
  // do something with the method, url and etc.
  this.addEventListener('load', function() {
    // do something with the response text
    console.log('load: ' + this.responseText)
  })

  return oldXHROpen.apply(this, arguments)
}
console.log('hello')
