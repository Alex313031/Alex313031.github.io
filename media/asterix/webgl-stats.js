const avgElem = document.querySelector("#fps");

const frameTimes = [];
let   frameCursor = 0;
let   numFrames = 0;   
const maxFrames = 20;
let   totalFPS = 0;

let then = 0;
function render(now) {
  now *= 0.001;                          // convert to seconds
  const deltaTime = now - then;          // compute time since last frame
  then = now;                            // remember time for next frame
  const fps = 1 / deltaTime;             // compute frames per second
  
  // add the current fps and remove the oldest fps
  totalFPS += fps - (frameTimes[frameCursor] || 0);
  
  // record the newest fps
  frameTimes[frameCursor++] = fps;
  
  // needed so the first N frames, before we have maxFrames, is correct.
  numFrames = Math.max(numFrames, frameCursor);
  
  // wrap the cursor
  frameCursor %= maxFrames;
    
  const averageFPS = totalFPS / numFrames;

  avgElem.textContent = averageFPS.toFixed(1);  // update avg display
  
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
