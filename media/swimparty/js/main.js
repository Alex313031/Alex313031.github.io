// index.js

import Sketch from './Sketch.js'



var hideLoadingDiv = () => {
  document.getElementById('loading_message').style.display = 'none'
}


window.onload = (e) => {

  Sketch()

  hideLoadingDiv()


};
