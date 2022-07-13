// See LICENSE

async function getScreens() {
  const screens = await self.getScreens();
  console.log("getScreens returned " + screens.length + " screens:");
  for (const screen of screens) {
    console.log(`'${screen.name}' ${screen.left},${screen.top} ${screen.width}x${screen.height} ` +
                `scaleFactor:${screen.scaleFactor}, colorDepth:${screen.colorDepth} ` +
                `primary:${screen.primary}, internal:${screen.internal}`);
  }
  return screens;
}

// TOOD(msw): Improve layout, handles various screen arrangements.
async function getBounds(count) {
  var w = screen.width / count;
  var l = 0; // TODO(msw): screen.left;

  // Use the Screen Enumeration API to place windows across all displays.
  // TODO(msw): Fix postMessage call; controller is undefined?
  // const screens = await self.getScreens();
  // if (screens && screens.length > 1) {
  //   var lastScreen = screens[screens.length - 1];
  //   w = lastScreen.left + lastScreen.width;
  //   l = screens[0].left;
  // }

  var bounds = [];
  for (i = 0; i < count; ++i)
    bounds.push({ left:l+w*i, top:0, width:w, height:500 });
  console.log("MSW getWindowBounds: " + count + " -> " + bounds);
  return bounds;
}

async function openWindow(url, bounds) {
  console.log("Please enable to Window Placement API: " +
              "https://github.com/spark008/window-placement");
  var options = "left=" + bounds.left + ",top=" + bounds.top +
                ",width=" + bounds.width + ",height=" + bounds.height;
  console.log("MSW calling window.open with options: " + options);
  var newWindow = window.open(url, "_blank", options);
  return;

  // TODO(msw): Fix postMessage call; controller is undefined?
  // if ('serviceWorker' in navigator && 'controller' in navigator.serviceWorker) {
  //   navigator.serviceWorker.controller.postMessage({sender:"open-window", url:url, bounds:bounds});
  // }
}

async function openWindows(urls) {
  var bounds = await getBounds(urls.length);
  console.log("MSW openWindows bounds: " + bounds);
  for (i = 0; i < urls.length; ++i) {
    openWindow(urls[i], bounds[i]);
  }
}

async function windowButton() {
  urls = [ "./?svg=FOO", "./?svg=BAR" ];
  openWindows(urls)
}