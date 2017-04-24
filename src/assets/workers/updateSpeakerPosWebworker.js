
self.onmessage = function(e) {
  //console.log(`EVENT`);
  setTimeout(function(){ self.postMessage(e.data); }, 1);
};
