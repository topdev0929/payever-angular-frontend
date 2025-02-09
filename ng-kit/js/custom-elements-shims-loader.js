(function (basePath) {
  // Load Custom Elements polyfills when needed
  // HACK: webpack's html plugin mangles the document.write calls if we don't trick it.
  // @see https://github.com/angular/angular/blob/7983f0a69b1cb8097762dc9ae355f5d083edcc7d/aio/src/index.html#L85-L107

  // detect if we have native CE support
  if (!window.customElements) {
    console.log('Loading custom elements polyfill');
    loadScript(basePath + 'custom-elements.min.js');
  } else if (isIE11()) {
    console.log('Loading custom elements ES5 shim');
    loadScript(basePath + 'src/native-shim.es5.js');
  } else {
    console.log('Loading custom elements shim');
    loadScript(basePath + 'src/native-shim.js');
  }

  // Dummy method to detect IE11
  function isIE11 () {
    return !!window.MSInputMethodContext && !!document.documentMode;
  }

  function loadScript (src) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    document.body.appendChild(script);
  }
})('[REPLACE_BASE_DIR]');
