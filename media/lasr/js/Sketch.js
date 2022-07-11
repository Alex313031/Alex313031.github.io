
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
  backgroundColor: 0x000000,
  attenuation: 0.999,
  noddleCount: 10,
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
    maxPolarAngle: HALF_PI,
    minPolarAngle: 0
  },
  light: {
    position: new THREE.Vector3(0,4,0),
    distance: 32
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


var mipBlurPass = post.addPass({
  fragmentShader: glslify(`

    #pragma glslify: luma = require(glsl-luma)
    #pragma glslify: random = require(glsl-random)

    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float opacity;
    varying vec2 vUv;

    #ifndef TAU
      #define TAU 6.28318530718
    #endif

    #define iterations 13

    vec2 mult(inout vec2 r) {
      r = fract(r * vec2(12.9898,78.233));
      return r * 2.0 - 1.0;
    }

    vec4 blur(vec2 uv, float radius, float aspect) {

      vec2 circle = vec2(radius);

      circle.x *= aspect;

      vec2 rnd = vec2(random( uv ));

      vec4 acc = vec4(0.0);

      for (int i = 0; i < iterations; i++) {

        vec2 uv_coord = vUv + circle * mult(rnd);
        vec2 uv_coord2 = vUv + circle * mult(rnd);

        acc += texture2D(tDiffuse, uv_coord);
        acc += texture2D(tDiffuse, uv_coord2, 1.0);
        // acc += texture2D(tDiffuse, uv_coord, 4.0);
      }

      return acc / (2.0 * float(iterations));
    }


    void main() {

      vec4 c = texture2D(tDiffuse, vUv, 0.0);
      gl_FragColor = vec4( c.xyz, 1.0);

      float aspect = resolution.x / resolution.y;
      float radius = 0.05;

      vec3 bloom = blur(vUv, radius, aspect).xyz;

      gl_FragColor.xyz += max( bloom, vec3(0.0));
    }

    `),
  uniforms: {
    grain: {type: 'f', value: 0},
    colorScale: {type: 'f', value: 1.05}
  }
})



var glowPost = new PostProcess({
  width: 512,
  height: 512
})

var floorGlow = glowPost.addPass({
  fragmentShader: glslify(`

    vec3 tex(vec2 uv);

    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float opacity;
    uniform vec3 floorPos;
    varying vec2 vUv;

    #pragma glslify: random = require(glsl-random)

    #define iterations 11

    vec2 mult(inout vec2 r) {
      r = fract(r * vec2(12.9898,78.233));
      return r * 2.0 - 1.0;
    }

    vec4 blur(vec2 uv, float radius, float aspect) {

      vec2 circle = vec2(radius);

      circle.x *= aspect;

      vec2 rnd = vec2( random( uv + floorPos.xz * 0.01 ) );

      vec4 acc = vec4(0.0);

      for (int i = 0; i < iterations; i++) {
        acc += texture2D(tDiffuse, vUv + circle * mult(rnd));
      }

      return acc / float(iterations);
    }

    void main() {

      float radius = 0.0125;

      vec4 c = texture2D( tDiffuse, vUv );

      gl_FragColor = c;//


      float aspect = resolution.x / resolution.y;
      gl_FragColor = blur(vUv, radius, aspect);

    }

    `),
  uniforms: {
    grain: {type: 'f', value: 0},
    colorScale: {type: 'f', value: 1.05},
    floorPos: {type: 'v3', value: new THREE.Vector3() }
  }
})




// TONE

var limiter = new Tone.Limiter(-10).toMaster();

var volume = new Tone.Volume(0).connect(limiter)

var distVol = new Tone.Volume(0).connect(volume)

var vibrato = new Tone.Vibrato(2, 0.75).connect(distVol)

var chorus = new Tone.Chorus(0.5, 16, 0.125).connect(distVol)

var pingPong = new Tone.PingPongDelay('4n', 0.1).connect( distVol )

var pp = new Tone.PingPongDelay('1n', 0.01).connect( distVol )

if(MOBILE) {
  console.log( 'MOBILE' );
  pingPong = vibrato
}

var osc = new Tone.Oscillator(44, "sine")
  .connect( volume )
  .set('volume', -100)
  .start();

// OUR SKETCH
var Sketch = () => {

  var clock = new THREE.Clock()

  // scene
  var scene = new THREE.Scene()
  scene.fog = new THREE.Fog( config.backgroundColor, config.camera.near, config.camera.far * 0.5 );

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
  renderer.autoClear = false;


  // orbit controls
  var controls = new THREE.OrbitControls( camera, renderer.domElement );
  Object.assign(controls, config.controls || {})


  // lighting... I don't think we'll end up using it though
  var light = new THREE.PointLight(0xFFFFFF, 1, config.light.distance)
  light.position.copy(config.light.position)
  config.light.position = light.position
  scene.add(light)


  var box = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshNormalMaterial({
      wireframe: false
    }))
  box.scale.multiplyScalar( 1.75 );

  var vel = new CANNON.Vec3()
  var cw = new CannonWrapper({
    gravity: new CANNON.Vec3(0, -20, 0),
  });
  var skinMan = new SkinManager(cw, {
    debug: false
  })
  skinMan.frustumCulled = false
  scene.add( skinMan.group )


  var groundPlaneBody = cw.addPlane({ mass: 0 });
  groundPlaneBody.quaternion.setFromAxisAngle(new CANNON.Vec3( 1, 0, 0 ), Math.PI * -0.5);
  groundPlaneBody.position.y = -4 ;

  var groundMat = new CustomMaterial({
    metalness: 0,
    roughness: 1,
    map: makePaletteTexture('https://coolors.co/ffffff-ffffff'),
    fragmentShader: glslify('./groundShader.frag')
  })

  var groundPlane = new THREE.Mesh( new THREE.PlaneGeometry(3000, 3000), groundMat )
  groundPlane.rotation.x = -HALF_PI
  groundPlane.position.copy(groundPlaneBody.position)
  scene.add(groundPlane)

  var ceilPlane = groundPlane.clone()

  ceilPlane.position.y = 30
  ceilPlane.rotation.x *= -1
  scene.add( ceilPlane )



  var spit = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshBasicMaterial({
      color: 'red',
    }))

  spit.scale.set(10, 1, 1)

  spit.body = cw.addBoxMesh(spit, {
    mass: 0
  })
  // scene.add(spit)

  var camSphere = cw.addSphere(1, {
    mass: 0
  })



  var glowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1,1),
    new THREE.MeshBasicMaterial({
      // opacity: 0.5,
      transparent: true,
      map: glowPost.readBuffer,
      blending: 1
    }))
  glowPlane.position.y = groundPlane.position.y + 0.1
  glowPlane.scale.multiplyScalar( 50 )
  glowPlane.rotation.x = -HALF_PI
  scene.add( glowPlane )


  var ortho = new THREE.OrthographicCamera( -25, 25, 25, -25, -30, 20 );
  ortho.lookAt( new THREE.Vector3(0, -100, 0));
  scene.add( ortho );
  ortho.position.y = -10




  var debugCube = box.clone()

  var velWeight = 0
  var possibleNotes = [ 'C2', 'E2', 'G2', 'C3', 'E3', 'G3', 'C3' ]

  var synth, synthToo;

  if(MOBILE) {
    synth = new Tone.PolySynth(3, Tone.Synth)
      // .connect(distVol)
      .chain(vibrato, pp)

    synthToo = new Tone.PolySynth(3, Tone.Synth)
      // .connect(chorus)
      .fan( distVol, pingPong )
  }

  var addCollisionEvent = b => {

    b.collideInfo = {
      last: -100,
      onCollide: (e) => {

        velWeight = mapLinear(abs(e.contact.bj.velocity.y), 0, 20, 0, 1)
        velWeight = clamp(velWeight, 0, 1)

        b.synth.triggerAttackRelease(
          randomElement( possibleNotes ),
          '16n',
          undefined,
          velWeight );

        b.synthToo.triggerAttackRelease(
          'E1',
          '8n',
          undefined,
          velWeight );

        b.skin.material.emissiveIntensity = max(b.skin.material.emissiveIntensity, velWeight * 2 )

      }
    }


    b.addEventListener("collide",(e) => {

      if(e.body === groundPlaneBody) {

        if(b.collideInfo.last + 100 < frame) {

          b.collideInfo.onCollide( e )

          b.collideInfo.last = frame

        }

      }
    });

  }

  var skins = []
  jsonLoader.load('assets/tube.json', json => {

    var count = config.noddleCount

    var endBody

    for(let i=0; i<count; i++) {
      var offsetMat = new THREE.Matrix4().makeTranslation( i - count * 0.5, -i * 2, 0 )
      let s = skinMan.buildSkin( json, {
        offset: offsetMat,
        constraintUp: Vec3.UNIT_X,
        fragmentShader: glslify('./NoodleShader.frag')
        // fragmentShader: THREE.ShaderLib['physical'].fragmentShader
      })

      // s.material.emissive.setRGB(randf(0.5,1),randf(0.5,1),randf(0.5,1))
      s.material.emissive.copy( randomElement(config.colors) )
      s.material.emissiveIntensity = 0
      s.material.metalness = 0.4
      s.material.roughness = 1

      skins.push( s )


      var b0 = spit.body
      var b1 = s.bodyMap['bulletRigidBodyShape' + (10 - i)]

      cw.addLockConstraint(b0, b1)


      let e0 = s.bodyMap['bulletRigidBodyShape10']
      let e1 = s.bodyMap['bulletRigidBodyShape1']

      e0.skin = s
      e1.skin = s

      if(!MOBILE) {

        synth = new Tone.PolySynth(3, Tone.Synth)
          // .connect(distVol)
          .chain(vibrato, pp)

        synthToo = new Tone.PolySynth(3, Tone.Synth)
          // .connect(chorus)
          .fan( distVol, pingPong )
      }


      e0.synth = synth
      e1.synth = synth
      e0.synthToo = synthToo
      e1.synthToo = synthToo

      addCollisionEvent( e0 )
      addCollisionEvent( e1 )

    }


  })

  // animation drivers
  var p0 = new THREE.Vector3(0,0,0)
  var p1 = new THREE.Vector3(0,0,400)
  var duration = 40
  var lastU = -1

  // update function called once per rAf loop
  var update = () => {

    frame++

    elapsedTime = clock.getElapsedTime()

    controls.update();

    cw.update( elapsedTime )

    skinMan.update()

    spit.rotation.x = spit.body.position.z * 0.4

    spit.body.quaternion.copy( spit.quaternion )

    var u = elapsedTime % duration / duration

    if(u < lastU) {
      var swap = p0
      p0 = p1
      p1 = swap
    }
    lastU = u

    u = smoothStep(u)

    spit.body.position.copy( p0.clone().lerp( p1, u ) )

    var deltaZ = abs(spit.body.position.z - spit.position.z)

    controls.target.copy(spit.body.position)

    camSphere.position.copy(camera.position)


    var sd = camera.position.distanceTo( spit.position )
    sd = mapLinear( sd, 0, 200, 1, 0 )
    distVol.set('volume', lerp( -30, 0, soundEase(sd)) )

    osc.set('volume', lerp( -50, 0, smoothStep(sd * min(1.0, deltaZ * 10)) ) )

    light.color.setRGB(0,0,0)
    var totIntens = 0
    skins.forEach( ( s ) => {
      s.material.emissiveIntensity *= 0.98
      // s.material.emissive.multiplyScalar( 0.99 );

      totIntens += s.material.emissiveIntensity

      light.color.r += s.material.emissive.r * s.material.emissiveIntensity
      light.color.g += s.material.emissive.g * s.material.emissiveIntensity
      light.color.b += s.material.emissive.b * s.material.emissiveIntensity

    });

    light.color.r /= 8.0;
    light.color.g /= 8.0;
    light.color.b /= 8.0;

    light.color.r += 0.13;
    light.color.g += 0.13;
    light.color.b += 0.13;

    totIntens /= skins.length

    light.distance = lerp(25, 35, totIntens)

    // light
    light.position.x = spit.position.x
    light.position.z = spit.position.z


    glowPlane.position.x = spit.position.x
    glowPlane.position.z = spit.position.z

    ortho.position.x = spit.position.x
    ortho.position.z = spit.position.z

    glowPlane.material.map = glowPost.readBuffer.texture

    floorGlow.uniforms.floorPos.value.copy( glowPlane.position )

  }



  // draw function called once per rAf loop
  var draw = () => {

    // renderer.render( scene, camera, null, true )

    groundPlane.visible = false
    ceilPlane.visible = false
    glowPlane.visible = false

    glowPost.render(renderer, scene, ortho, false )

    groundPlane.visible = true
    ceilPlane.visible = true
    glowPlane.visible = true

    post.render(renderer, scene, camera, null, false )

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

