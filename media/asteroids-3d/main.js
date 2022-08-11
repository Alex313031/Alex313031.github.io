var DEFAULT_OBJECT = window.location.hash.length > 1 ?
    window.location.hash.substr(1) : getParameterByName('obj') || 'toutatis';

var container, stats;

var camera, scene, renderer, manager, controls;
var directionalLight;
var asteroidMaterials;
var autoScale = true;

// In embedded mode, we hide controls.
var embeddedMode = isIFrame();

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

init();
animate();

function initSelect() {
  for (var i=0; i < FILES.length; i++) {
    $('<option>').html(FILES[i].replace('.txt', '')).appendTo($('#asteroid'));
  }

  $('#asteroid').val(DEFAULT_OBJECT);
  $('#asteroid').change(function() {
    scene.remove(window.obj);
    var name = $(this).val();
    loadModel(name);
    window.location.hash = '#' + name;
  });
}


function loadModel(name) {
  var loader = new THREE.OBJLoader(manager);
  asteroidMaterials = [];
  loader.load('data/' + name + '.txt', function(object) {
    object.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        var material = new THREE.MeshLambertMaterial({color: 0xcccccc});
        child.material = material;
        child.geometry.computeFaceNormals();
        child.geometry.computeVertexNormals();
        child.geometry.computeBoundingBox();
        asteroidMaterials.push(material);
      }
    });
    object.rotation.x = 20 * Math.PI / 180;
    object.rotation.z = 20 * Math.PI / 180;
    scene.add(object);
    window.obj = object; // TODO just make this a var

    if (autoScale) {
      zoomToFitObject();
    }
  });
}

function zoomToFitObject() {
  var boundingBox = obj.children[0].geometry.boundingBox;
  camera.position.x = boundingBox.max.x * 3.7;
  camera.position.y = boundingBox.max.y * 3.7;
  camera.position.z = boundingBox.max.z * 3.7;
}

function createGui() {
  // No gui for mobile
  if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    return;
  }

  var gui = new dat.GUI();
  uiOptions = {
    'Wireframe': false,
    'Autoscale': true,
    'Zoom to fit': zoomToFitObject,
  };
  window.uiOptions = uiOptions;
  gui.add(uiOptions, 'Wireframe').onChange(function(value) {
    asteroidMaterials.map(function(mat) {
      mat.wireframe = value;
    });
  });
  gui.add(uiOptions, 'Autoscale').onChange(function(value) {
    autoScale = value;
  });
  gui.add(uiOptions, 'Zoom to fit');
}

function init() {
  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.z = 1300;

  // scene
  scene = new THREE.Scene();

  // add subtle ambient lighting
  var ambientLight = new THREE.AmbientLight(0x333333);
  scene.add(ambientLight);

  // directional lighting
  //var directionalLight = new THREE.DirectionalLight(0x855E42);
  //directionalLight = new THREE.DirectionalLight(0xeeeec4);
  directionalLight = new THREE.DirectionalLight(0xE8E8F0);
  directionalLight.position.set(10000, 10000, 10000).normalize();
  scene.add(directionalLight);

  var directionalLight2 = new THREE.DirectionalLight(0x333333);
  directionalLight2.position.set(-10000, -10000, -10000).normalize();
  scene.add(directionalLight2);

  // loaders
  manager = new THREE.LoadingManager();
  manager.onProgress = function(item, loaded, total) {
    console.log(item, loaded, total);
  };

  // UI stuff
  if (!embeddedMode) {
    initSelect();
    createGui();
    document.getElementById('info').style.display = 'block';
  }

  // asteroid texture
  var texture = new THREE.Texture();
  var loader = new THREE.ImageLoader(manager);

  // model
  loadModel(DEFAULT_OBJECT);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  controls = new THREE.TrackballControls(camera, renderer.domElement);
  controls.rotateSpeed = 0.5;
  controls.dynamicDampingFactor = 0.5;

  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update(camera);
  render();
}

function render() {
  if (typeof obj !== 'undefined') {
    obj.rotation.x += (0.2*(Math.PI / 180));
    obj.rotation.x %= 360;
  }

  camera.lookAt(scene.position);

  renderer.render(scene, camera);
}

function isIFrame() {
  if (!!getParameterByName('iframe')) {
    return true;
  }
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
