var cacheName = 'vector-icon-app';
var filesToCache = [
  'index.html',
  'style.css',
  'main.js',
  'vector_icon.js',
  'vector-icon-512.png',
];

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function(e) {
  console.log("INFO: service worker install");
  e.waitUntil(caches.open(cacheName).then(function(cache) {
    return cache.addAll(filesToCache);
  }));
});

/* Serve cached content when offline */
self.addEventListener('fetch', function(e) {
  // console.log("INFO: service worker fetch");
  e.respondWith(caches.match(e.request).then(function(response) {
    return response || fetch(e.request);
  }));
});

self.addEventListener('message', function(event){
  console.log("INFO: service worker message: " + event.data);
  if (event.data.sender === "open")
    openWindow(event.data.url, event.data.bounds);
});

// NOTE: clients.openWindow will clobber the existing window.
async function openWindow(url, bounds) {
  // Use runtime feature detection for the Window Placement API.
  if (clients.openWindow.length == 1) {
    console.log("Please enable to Window Placement API: " +
                "https://github.com/webscreens/window-placement");
    var options = "left=" + bounds.left + ",top=" + bounds.top +
                  ",width=" + bounds.width + ",height=" + bounds.height;
    console.log("MSW calling window.open with options: " + options);
    var newWindow = window.open(url, "_blank", options);
    return;
  }

  var options = { x:bounds.left,
                  y:bounds.top,
                  width:bounds.width,
                  height:bounds.height,
                  type:"window"};
  console.log("INFO: Calling clients.openWindow(" + url + "," + JSON.stringify(options) + ")");
  const promise = clients.openWindow(event.data.url, event.data.options);
  // TODO: event.waitUntil(promise); ? 
}