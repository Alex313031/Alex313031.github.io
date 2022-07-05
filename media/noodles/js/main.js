
'use strict'


console.log('%c ' + Date.now() + ' ', 'background: #001122; color: #AADDFF');

import saveAs from 'save-as'
import CannonWrapper from './LaserCannonWrapper.js'
import geometryFromJSON from './geometryFromJSON.js'
import AnimationCurve from './AnimationCurve.js'
import SkinAndBones from './SkinAndBones.js'
import isMobile from 'ismobilejs'

import FRFrag from './FRFrag.js'

import debugStats from './addStatsOnDebug.js'

import makePalette from './makePaletteTexture.js'

var glslify = require('glslify');

import Tone from 'Tone'


import PostProcess from './PostProcess.js'

import ThreeView from './ThreeView.js'



var volume = new Tone.Volume(-10).connect(Tone.Master)

console.log( 'volume', volume );



var randf = THREE.Math.randFloat;

var randi = THREE.Math.randInt;

var lerp = THREE.Math.lerp;

var mapLinear = THREE.Math.mapLinear;

var clamp = THREE.Math.clamp;

var sin = Math.sin;

var cos = Math.cos;

var Vec3 = CANNON.Vec3;

var PI = Math.PI;

var TWO_PI = Math.PI * 2;

var HALF_PI = Math.PI * 0.5;




var config = {

  debug: false,

  attenuation: 0.999,

  bodySmoothing: 0.5,

  gravity: new Vec3(0,-66,0)

}

debugStats(config.debug);



// window.Tween = TWEEN.Tween

var loadingManager = new THREE.LoadingManager();


loadingManager.onLoad = () => {
}

loadingManager.onProgress = (asset, count, total) => {
  console.log( 'onProgress: ', asset, count, total );
}

var textureLoader = new THREE.TextureLoader(loadingManager);

var jsonLoader = new THREE.FileLoader(loadingManager);
jsonLoader.setResponseType('json');


var MOBILE = isMobile.any;




var cc = CannonWrapper({
  gravity: config.gravity,
  maxSubSteps: 10,
});

var skins = []

var frictionMaterial = new CANNON.Material("groundMaterial");





var Sketch = function(container){

  // three
  var view = new ThreeView(container);
  var renderer = view.setupRenderer();

  var clock = new THREE.Clock();
  var elapsedTime = 0;

  var scene = new THREE.Scene();

  var camera = new THREE.PerspectiveCamera(60, view.aspect, 1, 500);
  camera.position.y = 10;
  camera.position.z = -30;

  var controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.enableZoom = true;
  controls.enableRotate = true;
  controls.enablePan = false
  controls.enableDamping = true;
  controls.dampingFactor = 0.5;
  controls.rotateSpeed = 0.5;

  controls.maxPolarAngle = HALF_PI;

  console.log( 'controls', controls );

  controls.target.set(0,5,0);


  var pointLight = new THREE.PointLight();

  scene.add(pointLight);



  var blurRad = 3;
  var post = new PostProcess();

  // var fxaaPass = post.addPass({
  //   fragmentShader: glslify('./PostMaterials/fxaaPass.frag'),
  //   uniforms: {
  //     // direction: {type: 'v2', value: new THREE.Vector2( blurRad, 0 )}
  //   }
  // })

  var horizontalBlurPass = post.addPass({
    fragmentShader: glslify('./PostMaterials/vignetteBlurPass.frag'),
    uniforms: {
      direction: {type: 'v2', value: new THREE.Vector2( blurRad, 0 )},
      grain: {type: 'f', value: 0},
      colorScale: {type: 'f', value: 1}
    }
  })

  var verticalBlurPass = post.addPass({
    fragmentShader: glslify('./PostMaterials/vignetteBlurPass.frag'),
    uniforms: {
      direction: {type: 'v2', value: new THREE.Vector2( 0, blurRad )},
      grain: {type: 'f', value: 0.005},
      colorScale: {type: 'f', value: 1}
    }
  })



  var groundPost = new PostProcess({
    width: 128,
    height: 128,
  });

  var groundBlur = 5.5;
  var gpbw = groundPost.addPass({
      fragmentShader: glslify('./PostMaterials/directionalBlurPass.frag'),
      uniforms: {
        direction: {type: 'v2', value: new THREE.Vector2( groundBlur, 0 )},
        grain: {type: 'f', value: -0.0125},
        colorScale: {type: 'f', value: 1.1}
      }
    })
  var gpbh = groundPost.addPass({
      fragmentShader: glslify('./PostMaterials/directionalBlurPass.frag'),
      uniforms: {
        direction: {type: 'v2', value: new THREE.Vector2( 0, groundBlur )},
        grain: {type: 'f', value: -0.0125},
      colorScale: {type: 'f', value: 1.1}
      }
    })

  groundPost.addPass(gpbw);
  groundPost.addPass(gpbh);
  // groundPost.addPass(gpbw);
  // groundPost.addPass(gpbh);


  var ortho = new THREE.OrthographicCamera( -50, 50, 50, -50, -10, 100 );
  ortho.lookAt( new THREE.Vector3(0, -100, 0));
  scene.add( ortho );

  var groundRT = new THREE.WebGLRenderTarget( 512, 512 );

  var groundMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(100,100),
    new THREE.MeshBasicMaterial({
          side: 2,
          map: groundRT.texture
        }));

  groundMesh.position.y = -0.33;
  groundMesh.rotation.x =- HALF_PI;
  scene.add(groundMesh);



  var skinUpdate = (skin) => {

  }



  view.setup = () => {

    var groundPlane = cc.addPlane({
      mass: 0,
      material: frictionMaterial
    });
    groundPlane.quaternion.setFromAxisAngle(new Vec3( 1, 0, 0 ), Math.PI * -0.5);




    jsonLoader.load('assets/hextubeSkin.json', json => {

      let g;

      let count = isMobile ? 7 : 5;

      let invCount = 1/count;

      let offsetMatrix = new THREE.Matrix4();

      for(let i=0; i<count; i++) {

        offsetMatrix
        .multiply( new THREE.Matrix4().makeRotationY( randf(-PI, PI) ) )
        .makeTranslation(
          10 * sin( TWO_PI * i * invCount),
          100 + 10 * i,
          10 * cos( TWO_PI * i * invCount));

        var s = new SkinAndBones(json, {
          debug: false, //config.debug,
          cannonWorld: cc.world,
          cannonMaterial: frictionMaterial,
          attenuation: config.attenuation,
          bodySmoothing: config.bodySmoothing,
          offset: offsetMatrix,
          onUpdate: skinUpdate,
          geometry: g,
          fragmentShader: THREE.ShaderLib['physical']['fragmentShader'],
        });

        let map = makePalette("https://coolors.co/app/7bccc8-0799b3-fd0167-ff4d33-ee1652-ffffff", true);



        s.material.map = map;
        s.material.emissive.setRGB(0.5,0.5,0.5)
        s.material.emissiveMap = s.material.map


        s.constraints.forEach( ( c ) => {
          c.angle = 0.5;
        });

        g = s.geometry;


        skins.push(s);
      }


      cc.update(0);

      skins.forEach( ( s ) => {

        s.updateSkin(elapsedTime + 1);

        scene.add(s);


        // AMOscillator
        // FMOscillator
        // FatOscillator
        // OmniOscillator
        // PWMOscillator
        // PulseOscillator

        s.osc = new Tone.FMOscillator()
          .connect(volume)
          .start();

      });

    });

  }



  view.update = () => {

    controls.update();

    elapsedTime = clock.getElapsedTime();

    pointLight.position.copy(camera.position);



    cc.update(elapsedTime);

    skins.forEach( (skin, i) => {

      skin.updateSkin(elapsedTime, i);


      let index = Math.floor( (elapsedTime * 2 + i * 3) % skins[i].bones.length );

      skins[i].bones[ index ].body.velocity.y += 10;

      skins[i].bones[ index ].body.velocity.x -= skins[i].bones[ index ].body.position.x * 0.05;
      skins[i].bones[ index ].body.velocity.z -= skins[i].bones[ index ].body.position.z * 0.05;

      skin.osc.set('frequency', mapLinear(
        skins[i].bones[ index ].body.position.y,
        0, 16,
        20, 90));

      skin.material.color
        .setRGB(1,1,1)
        .multiplyScalar( mapLinear( skins[i].bones[ index ].body.position.y,
        2, 8,
        1.5, 0));

    });



    var v = clamp(mapLinear(camera.position.length(), 2, 100, 0, -20), -40, -18);

    volume.volume.value = v;


  };


  view.draw = () => {

    groundMesh.visible = false;
    renderer.render(scene, ortho, groundRT, true);

    groundPost.render( renderer, scene, ortho, groundRT );


    groundMesh.visible = true;
    // renderer.render(scene, camera, null, true);

    post.render( renderer, scene, camera );

  };



  view.onResize = (w, h) => {

    camera.aspect = view.aspect;
    camera.updateProjectionMatrix();

    post.setSize(w, h);

  };






  return {
    begin: () => {
      view.begin();
    }
  };

};



window.onload = function() {

  var sketch = new Sketch($("#container"));

  sketch.begin();

};



// uglifyjs sketches/20170404_chillNastyNate/bundle.js  --compress --mangle --output /Users/laserstorm/2016_sketchbook/sketches/20170404_chillNastyNate/bundle.min.js

