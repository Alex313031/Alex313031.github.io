
var glslify = require('glslify')

import isMobile from 'ismobilejs'

const MOBILE = isMobile.any;

import ThreeView from './ThreeView.js'

import CustomMaterial from './CustomMaterial.js'

import TouchEvents from './touchEvents.js'

import SimpleSettings from './SimpleSettings.js'

import CannonWrapper from './CannonWrapper.js'

import SkinManager from './SkinManager.js'

import PostProcess from './PostProcess.js'

import posEase from 'eases/circ-in-out'

import soundEase from 'eases/cubic-in-out'

import Tone from 'tone'

import StartAudioContext from 'startaudiocontext'

StartAudioContext(Tone.context, "#container", () => {
  console.log( 'started audio context' );
})


import {
  appendTo,
  randomElement,
  smoothStep,
  makeDataTexture,
  makePaletteTexture
} from './LaserUtils.js'



// this needs dome work...
var getUpVec = v => {

  var upVec = new Vec3();
  v.cross( Vec3.UNIT_X, upVec )
  return upVec;

}



var elapsedTime = 0
var frame = 0

var abs = Math.abs;
var max = Math.max;
var min = Math.min;
var sin = Math.sin;
var cos = Math.cos;
var pow = Math.pow;
var PI = Math.PI;
var TWO_PI = Math.PI * 2;
var HALF_PI = Math.PI * 0.5;
var random = Math.random;
var randf = THREE.Math.randFloat;
var randi = THREE.Math.randInt;
var lerp = THREE.Math.lerp;
var mapLinear = THREE.Math.mapLinear;
var clamp = THREE.Math.clamp;
var Vec3 = CANNON.Vec3

var loadingManager = new THREE.LoadingManager;
var textureLoader = new THREE.TextureLoader(loadingManager);
var jsonLoader = new THREE.FileLoader(loadingManager);
jsonLoader.setResponseType('json');

var colUrl = randomElement([
  'https://coolors.co/app/05668d-427aa1-ebf2fa-679436-a5be00', // <- nice
  'https://coolors.co/2b2d42-8d99ae-edf2f4-ef233c-d90429',
  'https://coolors.co/1a535c-4ecdc4-f7fff7-ff6b6b-ffe66d',
  'https://coolors.co/247ba0-70c1b3-b2dbbf-f3ffbd-ff1654',
  'https://coolors.co/app/25ced1-ffffff-fceade-e43f6f-ff8a5b'
])

// console.log( 'colUrl: ' + colUrl );

var config = {
  version: '0.0.1',
  backgroundColor: 0xFFFFFF,
  attenuation: 0.999,
  camera: {
    fov: 60,
    near: 1,
    far: 1000,
    position: new THREE.Vector3(0, 40, 40)
  },
  controls: {
    enableZoom: true,
    enableRotate: true,
    enablePan: true,
    enableDamping: true,
    dampingFactor: 0.5,
    rotateSpeed: 0.5,
    target: new THREE.Vector3(0, 0, 0),
    maxPolarAngle: PI,
    minPolarAngle: 0
  },
  light: {
    position: new THREE.Vector3(0,50,0),
    // distance: 32
  },
  colors: colUrl.split('/').pop().split('-').map( str => {
    return new THREE.Color().setStyle('#' + str)
  })
}


// load settings
var settings = new SimpleSettings( loadingManager );
settings.setConfig( require('../config.json'), config )
// settings.load('config.json', config)


// POST
var post = new PostProcess()




// TONE
var limiter = new Tone.Limiter(-3).toMaster();
var volume = new Tone.Volume( 5 ).connect(limiter)
var dist = new Tone.Distortion(0.2).connect(volume)

var rollVolume = new Tone.Volume( -50 ).connect(volume)
var pingPong = new Tone.PingPongDelay("8n", 0.2).connect(rollVolume)
var panner = new Tone.Panner(1).connect(rollVolume).connect(pingPong)

var rollSynth = new Tone.NoiseSynth({
    noise  : {
      type  : 'pink'
    },
    envelope: {
      attack: 0.125,
      decay: 0.1,
      sustain: 0.01
    }
  })
  .connect(panner)

var phaser = new Tone.Phaser({
  "frequency" : 15,
  "octaves" : 5,
  "baseFrequency" : 1000
}).connect(volume)

var bassSynth = new Tone.MembraneSynth({
  pitchDecay:0.05,
  octaves:2,
  oscillator:{
    type:"sine",
  },
  envelope:{
    attack:0.01,
    decay:0.9,
    sustain:0.1,
    release:2.4,
    attackCurve:"exponential",
  }
})
.connect( volume )
.set('volume', -10)



var lowSynth = new Tone.PolySynth({
  pitchDecay:0.05,
  // octaves:2,
  oscillator:{
    type:"sine",
  },
  envelope:{
    attack:0.01,
    decay:0.9,
    sustain:0.1,
    release:2.4,
    attackCurve:"exponential",
  }
})
.chain( pingPong, volume )
.set('volume', -10)


if(MOBILE) {
  console.log( 'MOBILE' );
}


// OUR SKETCH
var Sketch = () => {

  var clock = new THREE.Clock()

  // scene
  var scene = new THREE.Scene()
  // scene.fog = new THREE.Fog( config.backgroundColor, config.camera.near, config.camera.far * 0.5 );

  // camera
  var camera = new THREE.PerspectiveCamera(
    config.camera.fov,
    window.innerWidth / window.innerHeight, //aspect
    config.camera.near,
    config.camera.far);
  camera.position.copy( config.camera.position )
  config.camera.position = camera.position

  // view - convenience object to setup the renderer
  var view = new ThreeView({
    container: 'container'
  })

  var renderer = view.renderer
  renderer.setClearColor(new THREE.Color(config.backgroundColor), 1.0);
  renderer.autoClear = true;

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;


  // orbit controls
  var controls = new THREE.OrbitControls( camera, renderer.domElement );
  Object.assign(controls, config.controls || {})


  var hemi_light = new THREE.HemisphereLight( 0xeeeeff, 0xaaaaab, 0.75 );
  scene.add( hemi_light );

  // var light = new THREE.SpotLight(0xFFFFFF)
  // light.castShadow = true;
  // light.shadow.mapSize.width = 1024
  // light.shadow.mapSize.height = 1024
  // light.position.set(0, 100, 80)


  var light = new THREE.DirectionalLight(0xFFFFFF)

  light.castShadow = true;
  light.shadow.bias = 0.0001
  light.shadow.mapSize.width = 1024
  light.shadow.mapSize.height = 1024
  light.shadow.camera.near = 10
  light.shadow.camera.far = 300
  light.shadow.camera.left = -20
  light.shadow.camera.right = 20
  light.shadow.camera.bottom = -20
  light.shadow.camera.top = 20

  light.position.set(0, 100, 80)

  scene.add( light )
  scene.add( light.target )


  var cw = new CannonWrapper({
    gravity: new CANNON.Vec3(0, -25, 0),
  });


  let sphereBody = cw.addSphere(4, {
    mass: 0
  })



  var skinMan = new SkinManager(cw, {
    debug: false
  })
  skinMan.frustumCulled = false
  scene.add( skinMan.group )

  let vel = new Vec3()
  var q = new THREE.Quaternion()
  var qlerp = new THREE.Quaternion()
  cw.onUpdate = () => {

    cw.world.bodies.forEach( ( b, i ) => {


      vel.copy(b.position)
      vel.scale( mapLinear(sin( elapsedTime * 2.0 + i ), -1, 1, -1, 0.7 ), vel );

      vel.z -= sin(elapsedTime + i) * 0.01;

      b.applyImpulse( vel, b.position )

      if(b.hardPosition) {
        b.position.copy( b.hardPosition )
        b.velocity.set(0,0,0)
        b.angularVelocity.scale( 0.9, b.angularVelocity)

        qlerp.copy(b.quaternion)
        qlerp.slerp( q, 0.025 );
        b.quaternion.copy(qlerp);

        b.mesh.material.emissiveIntensity = Math.max(b.mesh.material.emissiveIntensity - .01, 0)
      }

    });
  }

  var skins = []

  var bumpNotes = [
  // 'e2', 'f2', 'g2', 'a2', 'b2',
  'e3', 'f3', 'g3', 'a3', 'b3',
  'e4', 'f4', 'g4', 'a4', 'b4']

  jsonLoader.load('assets/songWorm.json', json => {

    var count = MOBILE ? 7 : 10;

    var p = new THREE.Vector3(0, -17, 0)

    for(let i=0; i<count; i++) {

      p.x = sin( i * TWO_PI / count) * 10;
      p.z = cos( i * TWO_PI / count) * 10;


      var offsetMat = new THREE.Matrix4().makeTranslation( p.x, p.y, p.z )
      let s = skinMan.buildSkin( json, {
        constraintUp: Vec3.UNIT_Z,
        offset: offsetMat,
        // fragmentShader: glslify('./NoodleShader.frag')
        fragmentShader: THREE.ShaderLib['standard'].fragmentShader
      })

      // s.material.wireframe = true

      skins.push( s )


      s.customDepthMaterial = new THREE.ShaderMaterial({
        side: 1,
        uniforms: {
          jointTexture: s.material.uniforms.jointTexture,
          jointTextureDim: s.material.uniforms.jointTextureDim,
          jointOffset: s.material.uniforms.jointOffset,
        },
        fragmentShader: '#define DEPTH_PACKING ' + 3201 + ' \n' + THREE.ShaderLib['depth']['fragmentShader'],
        vertexShader: glslify('./SkinDepth.vert')//
      });
      s.castShadow = true;
      s.receiveShadow = false;
      s.frustumCulled = false;


      [
        'bulletRigidBodyShape1',
        'bulletRigidBodyShape28'
      ].forEach( bName => {

        let b = s.bodyMap[ bName ]
        b.addEventListener("collide", ({body}) => {

          if(body.hardPosition) {

            body.mesh.material.emissiveIntensity = 1.5

            lowSynth.triggerAttackRelease( body.note, '8n' )
            bassSynth.triggerAttackRelease( body.note, '16n' )

          }
        })
      });
    }


  })


  // create some static bodies
  let tileSize = 7;
  var button = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshNormalMaterial() )
  button.scale.set(tileSize * 0.9,1,tileSize * 0.9);

  button.castShadow = true;
  button.receiveShadow = true;

  let dim = 5;
  for(var x=0, y=0; x<dim; x++) {
    for(y=0; y<dim; y++) {

      let b = button.clone()

      b.position.x = (x + 0.5 - dim * 0.5) * tileSize
      b.position.y = -20
      b.position.z = (y + 0.5 - dim * 0.5) * tileSize

      b.material = new THREE.MeshStandardMaterial({
        emissiveIntensity: 0,
        emissive: new THREE.Color().setRGB(
          mapLinear(x, 0, dim-1, 0,1),
          mapLinear(y, 0, dim-1, 0,1),
          1)
      })

      scene.add(b)

      b.body = cw.addBoxMesh(b, {mass: 10})

      b.body.hardPosition = b.position;

      b.body.note = randomElement(bumpNotes)


    }
  }




  // update function called once per rAf loop
  var update = () => {

    frame++

    elapsedTime = clock.getElapsedTime()

    controls.update();

    cw.update( elapsedTime )

    skinMan.update()

  }



  // draw function called once per rAf loop
  var draw = () => {

    renderer.render( scene, camera, null, true )

    // post.render(renderer, scene, camera, null, false )

  }



  // events
  view.onResize = (e, w, h) => {

    camera.aspect = view.aspect

    camera.updateProjectionMatrix();

    post.setSize(w, h);

  }


  var onScroll = e => {
    // console.log( e.type );
  }

  var trackedTouches = null
  var touches = new TouchEvents({

    element: view.container,

    onTouchStart: e => {
      // console.log( e.type, e );
      trackedTouches = e.touches
    },

    onTouchMove: e => {

      if(!trackedTouches) return

      onScroll( {
        type: e.type,
        deltaX: (trackedTouches[0].pageX - e.touches[0].pageX),
        deltaY: (trackedTouches[0].pageY - e.touches[0].pageY)
      })

      trackedTouches = e.touches
    },

    onTouchEnd: e => {
      // console.log( e.type, e );
    }

  })


  window.addEventListener('wheel', onScroll )

  // keyboard inputs
  window.addEventListener('keypress', e => {

    switch( e.key ) {

      case 's':

        settings.save(config)

        break;

      case 'c':

        // print the camera target and position
        console.log( 'camera: ', config.camera.position.toArray().map( u => {
          return +u.toFixed(3);
        } ) );

        console.log( 'target: ', config.cameraSettings.target.toArray().map( u => {
          return +u.toFixed(3);
        } ) );

      default:
        return
    }

  })


  // rAf loop
  function animate() {
    requestAnimationFrame( animate )
    update()
    draw()
  }

  animate()

}


module.exports = Sketch

