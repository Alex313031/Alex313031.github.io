function paintIcons() {
  var input = document.getElementById("input");
  var previews = document.getElementsByClassName("preview");
  paintVectorIcon(input.value, previews);
};

function checkFileHandlingSupport() {
  if ('launchQueue' in window)
    return true;
  console.error("Please enable chrome://flags/#file-handling-api");
  return false;
}

function checkNativeFileSystemSupport() {
  if ('chooseFileSystemEntries' in window)
    return true;
  document.getElementById("enable-native-file-system").hidden = false;
  console.error("Please enable chrome://flags/#native-file-system-api");
  return false;
}

let fileHandle_;

async function setIconContent(contents) {
  var input = document.getElementById("input");
  input.value = contents;
  paintIcons();
}

async function readFile(fileHandle) {
  if (!fileHandle)
    return;
  const file = await fileHandle.getFile();
  const contents = await file.text();
  return contents;
}

async function setFile(fileHandle) {
  fileHandle_ = fileHandle;
  var fileContent = await readFile(fileHandle_);
  setIconContent(fileContent);
}

async function openFileHandles(fileHandles) {
  if (fileHandles.length > 1) {
    // TODO(msw): Reuse the existing window for the first file?
    // setFile(fileHandles.shift());
    // TODO(msw): FileHandle persistence and transferability would help here.
    var urls = [];
    for (fileHandle of fileHandles) {
      var fileContent = await readFile(fileHandle);
      var encodedData = window.btoa(fileContent);
      urls.push("./?base64=" + encodedData);
    }
    openWindows(urls);
  } else if (fileHandles.length == 1) {
    setFile(fileHandles[0]);
  }
}

async function openFile(e) {
  if (!checkNativeFileSystemSupport())
    return;

  var options = {
    type: "openFile",
    multiple: true,
    accepts: [{
      description: 'Vector icon file',
      extensions: ['icon'],
      mimeTypes: ['text/plain'],
    }],
  };
  fileHandles = await window.chooseFileSystemEntries(options);
  openFileHandles(fileHandles);
}

async function saveFile(e) {
  if (!checkNativeFileSystemSupport())
    return;

  if (!fileHandle) {
    const options = {
      type: 'saveFile',
      accepts: [{
        description: 'Vector icon file',
        extensions: ['icon'],
        mimeTypes: ['text/plain'],
      }],
    };
    fileHandle = await window.chooseFileSystemEntries(options);
  }
  if (!fileHandle)
    return;
  const writer = await fileHandle.createWriter();
  await writer.truncate(0);
  await writer.write(0, document.getElementById("input").value);
  await writer.close();
}

window.onload = () => {
  'use strict';

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./sw.js');
  }

  // File Handling API, please enable chrome://flags/#file-handling-api
  if (checkFileHandlingSupport()) {
    window.launchQueue.setConsumer(async launchParams => {
      openFileHandles(launchParams.files);
    });
  }
  checkNativeFileSystemSupport();

  var urlParams = new URLSearchParams(window.location.search);
  if (!fileHandle_ && urlParams.has("base64")) {
    var encodedData = urlParams.get("base64");
    var decodedData = window.atob(encodedData);
    setIconContent(decodedData);
  }

  // Handle open/save button clicks and input events.
  document.getElementById("open").addEventListener('click', openFile);
  document.getElementById("window").addEventListener('click', windowButton);
  document.getElementById("save").addEventListener('click', saveFile);
  document.getElementById("input").addEventListener('input', paintIcons);

  // Catch "Ctrl/Meta + S" to save the icon file.
  document.addEventListener("keydown", function(e) {
    if (window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) {
      if (String.fromCharCode(event.keyCode).toLowerCase() == 's') {
        e.preventDefault();
        saveFile();
      } else if (String.fromCharCode(event.keyCode).toLowerCase() == 'o') {
        e.preventDefault();
        openFile();
      }
    }
  }, false);

  // Paint the initial icon content.
  paintIcons();
}
