
'use strict'

import Joint from './Joint.js';

import skinDataToGeometry from './skinDataToGeometry.js'

import OimoWrapper from './LaserOimoWrapper.js'

import CannonController from './CannonController.js'

import JointMaterial from './JointMaterial.js'

import randomElement from './randomElement.js'

import getCustomDepthMaterial from './getCustomDepthMaterial.js'

import TWEEN from 'tween.js'

import JointTexture from './JointTexture.js'



const isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0 || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification);

StartAudioContext(Tone.context, '#container', ()=>{
  // if(isSafari)  alert('StartAudioContext')
});



var randf = THREE.Math.randFloat;

var Sketch = function(options){

  options = options || {};
  
  var debug = false;

  console.log( '20161111_winding' );

  var updateVertexPositions = false;

  var elapsedTime = 0;

  var container = options.container || $("#container");

  var globeRad = 10;
  
  var goalPos = new THREE.Vector3( 0, 0, 0 );
  
  var attenuation = 0.999;
  
  var hingeRange = 60;

  var wigglyness = 1.5;
  
  var wigglySpeed = 6;
  
  var orig_wigglySpeed = wigglySpeed;
  
  var orig_wigglyness = wigglyness;
  
  var shadowRes = 2048;

  var attraction = 0.5;


  var gain = new Tone.Volume( 0 ).toMaster();
  gain.set( 'volume',  0 );


  // tone
  var synth = new Tone.PolySynth(3, Tone.Synth).toMaster();
  synth.volume.value = -10;
  synth.set("detune", -1200);

  var dist = new Tone.Chorus(1, 10, 0.9).connect(gain);
  var pingPong = new Tone.PingPongDelay("8n", 0.3).connect(gain);

  

  var notes = ['A1','A2','A3','A4','C1','C2','C3','C4','E1','E2','E3','E4']
  var playNote = () => {
    duoSynth.triggerAttackRelease(randomElement(notes), "16n");
  }


  var audioEventFuncs = {
    bass: () => {},
    kick: () => {},
    snare: () => {}
  }


  var bass = new Tone.MonoSynth({
    "volume" : -10,
    "envelope" : {
      "attack" : 0.01,
      "decay" : 0.3,
      "release" : 2,
    },
    "filterEnvelope" : {
      "attack" : 0.001,
      "decay" : 0.01,
      "sustain" : 0.5,
      "baseFrequency" : 200,
      "octaves" : 2.6
    }
  })
  .connect(pingPong)
  .connect(dist)


  var bassPart = new Tone.Part(function(time, chord, note){
    bass.triggerAttackRelease(chord, note || "32n", time);

    switch (chord){
      case 'B6':
      case 'A6':
      case 'F6':
      case 'D6':
        audioEventFuncs['snare']()
        break;
      default:
        audioEventFuncs['bass']()
        break;
    }

  }, [
  ["0:0", "G1", '8n'], ["0:2", "B6", '8n'],
  ["1:0", "G2", '8n'], ["1:2", "B6", '8n'],
  ["2:0", "G1", '8n'], ["2:2", "B6", '8n'],
  ["3:0", "G2", '8n'], ["3:2", "B6", '8n'],
  ["4:0", "B2", '8n'], ["4:2", "B6", '8n'],
  ["5:0", "A2", '8n'], ["5:2", "A6", '8n'],
  ["6:0", "F2", '8n'], ["6:2", "F6", '8n'],
  ["7:0", "D2", '8n'], ["7:2", "D6", '8n'],
  ]).start();

  bassPart.loop = true;
  bassPart.loopEnd = "8m";
  bassPart.humanize = true;
  bassPart.probability = 0.66;


  var kick = new Tone.MembraneSynth({
    "envelope" : {
      "sustain" : 0,
      "attack" : 0.02,
      "decay" : 0.8
    },
    "octaves" : 10
  }).connect(gain);

  var kickPart = new Tone.Part(function(time, note){
    kick.triggerAttackRelease(note || "C2", "8n", time);
    audioEventFuncs['kick']()
  }, [
  ["0:0"],
  ["1:0"], 
  ["2:0"],
  ["3:0"], 
  ["4:0"],
  ["4:2", 'C1'],
  ["5:0"], 
  ["5:2", 'C1'],
  ["6:0"],
  ["6:2", 'C1'],
  ["7:0"], 
  ["7:2", 'C1'],
  ]).start('0m');

  kickPart.loop = true;
  kickPart.loopEnd = "8m";
  kickPart.humanize = true;
  kickPart.probability = 0.5;


  //set the transport 
  Tone.Transport.bpm.value = 240;
  Tone.Transport.start("+0.1");



  // colors
  var c0 = new THREE.Color(0xffffff);
  var c1 = new THREE.Color(0xedff00);
  var orig_c0 = c0.clone();
  var orig_c1 = c1.clone();

  // three
  var view = new ThreeView(container);// boiler plate... couldn't this be passed in? then we could do a player...

  var renderer = view.setupRenderer();

  if(!isSafari) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  renderer.setClearColor(0x333333, 0.1)

  var clock = new THREE.Clock();

  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog( 0x000000, 60, 150 );

  var camera = new THREE.PerspectiveCamera(60, view.aspect, 1, 1000);
  camera.position.y = 10;
  camera.position.z = 35;
  camera.lookAt( new THREE.Vector3(camera.position.x, camera.position.y-20, 0) );


  var controls = new THREE.OrbitControls( camera, renderer.domElement );
  // controls.enabled = false;
  controls.enableZoom = true;
  controls.enableRotate = true;
  controls.enablePan = true
  controls.enableDamping = true;
  controls.dampingFactor = 0.5;
  controls.rotateSpeed = 0.5;
  controls.minDistance = 10;
  controls.maxDistance = 50;


  
  var makeSpot = () => {
    var spot = new THREE.SpotLight();

    spot.castShadow = true;
    spot.shadow.mapSize.width = shadowRes;
    spot.shadow.mapSize.height = shadowRes;
    spot.shadow.camera.near = 0.1;
    spot.shadow.camera.far = 100;
    spot.shadow.camera.fov = 10;

    // spot.penumbra = 1
    // spot.shadow.bias = 0.000001;

    return spot
  }

  var spot = makeSpot();
  spot.color.set(0xBBFFEE).multiplyScalar( 0.66 );
  spot.position.lerp(camera.position, 0.5);
  spot.position.y += 10;
  spot.lookAt(new THREE.Vector3( 0, 0, 0 ));
  scene.add(spot);


  var hemi = new THREE.HemisphereLight( 0x6688BB, 0x181844, 1 );
  scene.add( hemi );



  let box = new THREE.Mesh(new THREE.BoxGeometry(10,10,10), new THREE.MeshBasicMaterial({
    color: 'white',
    wireframe: true,
    side: 2
  }))



  var cc = CannonController({
    gravity: new CANNON.Vec3(0,0,0),
    maxSubSteps: isSafari ? 1 : 2
  });


  var debugSphere = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshBasicMaterial({
    color: 'red',
    wireframe: true
  }))
  debugSphere.visible = debug;
  debugSphere.position.z = 100;
  debugSphere.body = cc.addSphere(1, {mass: 0});
  scene.add(debugSphere)



  var dragPlane = new THREE.Mesh(new THREE.PlaneGeometry( 300, 300, 10, 10), new THREE.MeshBasicMaterial( {
    color: 'magenta',
    wireframe: true
  } ));
  dragPlane.visible = false;

  scene.add(dragPlane)




  var dataTex = new THREE.DataTexture( new Uint8Array([255,0,255, 0,255,255]), 2, 1, THREE.RGBFormat)
  var updateDataTex = ()=>{

    let colorVals = c0.toArray().concat(c1.toArray());

    for(var i=0; i<colorVals.length; i++) {
      dataTex.image.data[i] = colorVals[i] * 255;
    }
    dataTex.needsUpdate = true;
  }
  updateDataTex();


  var skinLoader = new THREE.XHRLoader();
  skinLoader.setResponseType('json');
  

  // debug meshes
  let cube = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshBasicMaterial({
    color: 'cyan',
    wireframe: true
  }));

  let jointCube = new THREE.Mesh(cube.geometry, new THREE.MeshBasicMaterial( {
    color: 'red',
    wireframe: true
  } ) );
  jointCube.scale.multiplyScalar(2);

  var skins = [];
  var intersectables = [];

  var createSkin = (json, geometry) => {
    var skin = {
      skinObj: new THREE.Object3D(),
      raycastIntersects: [],
      rigidBodies: [],
      constraints: [],
      loaded: false,
      joints: [],
      geometry: null,
      material: null,
      mesh: null,
      jointTexture: null
    }

    var skinObj = skin.skinObj;
    scene.add(skinObj);

    // create the joints
    let jointMap = {}

    json['joints'].forEach( function( j ){
      
      let joint = new Joint({
        name: j.name,
        transform: new THREE.Matrix4().fromArray(j['transform']),
        rigidBody: j.rigidBody
      })

      skin.joints.push(joint);

      jointMap[j.name] = joint;

      // DEBUG
      if(debug)  joint.add(jointCube.clone());
    });


    // create the rigid bodies
    for(let i in json['rigidBodies']) {

      let data = json['rigidBodies'][i];
      
      let b = new THREE.Object3D();
      b.name = i
      b.applyMatrix(new THREE.Matrix4().fromArray(data['transform']))
      b.updateMatrixWorld(true);
      skinObj.add(b)
      skin.rigidBodies.push(b)
      
      let inv = new THREE.Matrix4().getInverse(b.matrixWorld)

      data.joints.forEach((j)=>{
        jointMap[j].applyMatrix(inv);
        b.add(jointMap[j])
      })

      // debug rigid body bounds
      let c = cube.clone();
      c.scale.multiply( new THREE.Vector3().fromArray(data['extents']) );
      c.visible = debug;
      b.add(c);


      b.body = cc.addBoxMesh( c, {
        position: b.position,
        mass: data.mass,
        restitution: data.restitution
      });


      b.body.skin = skin;


      c.body = b.body;
      skin.raycastIntersects.push(c)
    }


    // create the constraints
    for(var i in json['constraints']) {

      let c = json["constraints"][i]
      let a = skinObj.getObjectByName(c['rigidBodyA']);
      let b = skinObj.getObjectByName(c['rigidBodyB'])
      
      let dataA = json['rigidBodies'][c['rigidBodyA']]
      let dataB = json['rigidBodies'][c['rigidBodyB']]
      
      let constraintPos = new THREE.Vector3().fromArray(c['translate']);
      
      // local axis in rigid bodies
      let invA = new THREE.Matrix4().getInverse(a.matrixWorld)
      let invB = new THREE.Matrix4().getInverse(b.matrixWorld)

      let pointInA = constraintPos.clone().applyMatrix4(invA);
      let pointInB = constraintPos.clone().applyMatrix4(invB);

      let constraint = cc.addConeConstraint( 

        a.body,
        pointInA,
        CANNON.Vec3.UNIT_Y,
        
        b.body,
        pointInB,
        CANNON.Vec3.UNIT_Y,

        Infinity);


      constraint.angle = .5;
      constraint.twistAngle = 1;

      skin.constraints.push(constraint);
    }


    // set the initial joint offsets
    skinObj.updateMatrixWorld(true);

    skin.joints.forEach( j => {
      j.setOffset();
    });


    // put together the mesh
    let jointTransforms = skin.joints.map(j => {
      return j.transform
    })


    let jointTexture = new JointTexture(jointTransforms);
    var jointMaterial = new JointMaterial(jointTransforms);

    jointMaterial.uniforms.map.value = dataTex;
    jointMaterial.uniforms.jointTexture.value = jointTexture.texture;
    jointMaterial.uniforms.jointTextureDim.value.set( jointTexture.texture.image.width, jointTexture.texture.image.height)

    
    let mesh = new THREE.Mesh(geometry, jointMaterial);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.customDepthMaterial = getCustomDepthMaterial(jointMaterial, jointTransforms)


    skinObj.add(mesh);
    skin.geometry = geometry;
    skin.material = jointMaterial;
    skin.material = jointMaterial;
    skin.mesh = mesh;
    skin.jointTexture = jointTexture;

    skin.loaded = true;

    intersectables = intersectables.concat(skin.raycastIntersects);

    return skin;
  }


  skinLoader.load('assets/mesh.json', json => {

    let geometry = skinDataToGeometry(json);

    let count = 3;

    for (var i=0; i<count; i++) {

      let skin = createSkin(json, geometry);
      skins.push(skin);  
    }

    skins[0].hitValAttenuation = 0.9;
    audioEventFuncs['bass'] = () =>{
      
      skins[0].mesh.material.uniforms.hitVal.value = 1.5;
      
      if(skins[0].hitTween){
      
        skins[0].hitTween.start()
      
      } else {

        skins[0].hitTween = new TWEEN.Tween(skins[0].mesh.material.uniforms.hitVal)
        .easing(TWEEN.Easing.Cubic.Out)
        .to({value: 0}, 1000)
        .start() 
      }
    }

    skins[1].mesh.material.uniforms.hitColor.value.set(0xFFFFFF); //0x22BBFF
    skins[1].hitValAttenuation = 0.9;
    audioEventFuncs['kick'] = () =>{
      skins[1].mesh.material.uniforms.hitVal.value = 1.5;

      if(skins[1].hitTween){
      
        skins[1].hitTween.start()
      
      } else {

        skins[1].hitTween = new TWEEN.Tween(skins[1].mesh.material.uniforms.hitVal)
        .easing(TWEEN.Easing.Cubic.Out)
        .to({value: 0}, 750)
        .start() 
      }
    }

    skins[2].mesh.material.uniforms.hitColor.value.set(0x22AAFF);
    skins[2].hitValAttenuation = 0.9;
    audioEventFuncs['snare'] = () =>{
      
      skins[2].mesh.material.uniforms.hitVal.value = 2;

      if(skins[2].hitTween){
      
        skins[2].hitTween.start()
      
      } else {

        skins[2].hitTween = new TWEEN.Tween(skins[2].mesh.material.uniforms.hitVal)
        .easing(TWEEN.Easing.Cubic.Out)
        .to({value: 0}, 500)
        .start() 
      }


    }
    
  });


  var updateSkin = skin => {

    if (skin.loaded) {


      skin.jointTexture.update();

      // if(skin.mesh) {
      //   skin.mesh.material.uniforms.hitVal.value *= skin.hitValAttenuation;
      // }



      let delta = new THREE.Vector3();

      let hitVal = skin.mesh.material.uniforms.hitVal.value;
      let scl = 100 * hitVal;
      skin.constraints.forEach((c, i)=>{

        let b1 = skin.constraints[i].bodyA
        let b2 = skin.constraints[i].bodyB

        if (elapsedTime < 1 && i === 1) {
          // console.log( b2.velocity );
        }


        delta.copy(b1.position);
        delta.sub(b2.position);

        delta.normalize();
        delta.multiplyScalar( scl );

        delta.lerp(b2.velocity, 0.5);

        b2.velocity.copy(delta)
      })


      skin.joints.forEach( j => {
        j.updateTransform();
      });

      // rigid bodiy transforms
      skin.rigidBodies.forEach( (b, i)=>{

        if(b.body){

          b.body.velocity.x *= attenuation;
          b.body.velocity.y *= attenuation;
          b.body.velocity.z *= attenuation; 
          
          b.body.angularVelocity.x *= attenuation;
          b.body.angularVelocity.y *= attenuation;
          b.body.angularVelocity.z *= attenuation;

          b.body.velocity.x -= b.body.position.x * attraction;
          b.body.velocity.y -= b.body.position.y * attraction;
          b.body.velocity.z -= b.body.position.z * attraction;
          
          b.position.copy(b.body.position);
          b.quaternion.copy(b.body.quaternion);
        }

      });
    }

    if(updateVertexPositions) updateSkinVertices(skin);

  }

  view.update = function(){

    if(Tone.context.state && Tone.context.state === "suspended") {
      Tone.context.resume().then(function() {
        console.log("AudioContext resumed!");
        // fire your callback here
      });
    }

    elapsedTime = clock.getElapsedTime();
    
    TWEEN.update();

    // oc.update();

    cc.update(elapsedTime);

    controls.update();
    
    skins.forEach( function( skin ){
    
      updateSkin(skin);
    
    });


  };


  view.draw = function(){

    renderer.render(scene, camera, null, true);

  };


  view.onResize = function(){

    camera.aspect = view.aspect;
    camera.updateProjectionMatrix();

  };


  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();
  var mousedown = false;
  var grabbed = false;
  var draggedBody, dragConstraint;



  var onPress = e => {

    mousedown = true;

    if(e.type === 'touchmove') {
      mouse.x = ( e.touches[0].pageX / window.innerWidth ) * 2 - 1;
      mouse.y = - ( e.touches[0].pageY / window.innerHeight ) * 2 + 1;
    } else {
      mouse.x = ( e.pageX / window.innerWidth ) * 2 - 1;
      mouse.y = - ( e.pageY / window.innerHeight ) * 2 + 1;
    }

    raycaster.setFromCamera( mouse, camera );

    intersectables.forEach( function( m ){
      m.visible = true;
    });
    
    let intersects = raycaster.intersectObjects( intersectables );
    
    intersectables.forEach( function( m ){
      m.visible = debug;
    });

    if(intersects.length){

      grabbed = true;

      if(e.type === 'touchstart')  controls.enabled = false;
      controls.enableRotate = false;

      let skin = intersects[0].object.body.skin;

      let p = intersects[0].point;

      dragPlane.position.copy(p);
      dragPlane.lookAt(camera.position);

      debugSphere.position.copy(p)
      debugSphere.body.position.copy(debugSphere.position);

      dragConstraint = cc.addPointConstraint(
        intersects[0].object.body,
        new THREE.Vector3( 0, 0, 0 ),
        debugSphere.body,
        new THREE.Vector3( 0, 0, 0 ));
    }
  }

  var onRelease = e => {

    if(grabbed){
      cc.removeConstraint(dragConstraint)
    }

    if(!controls.enableRotate) {
      controls.enabled = true;
      controls.enableRotate = true;
    }
    
    mousedown = false;
    
    grabbed = false;

    dragPlane.visible = false;
  }

  var onDrag = e => {

    if(grabbed){

      if(e.type === 'touchmove') {
        mouse.x = ( e.touches[0].pageX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( e.touches[0].pageY / window.innerHeight ) * 2 + 1;
      } else {
        mouse.x = ( e.pageX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( e.pageY / window.innerHeight ) * 2 + 1;
      }

      raycaster.setFromCamera( mouse, camera );

      dragPlane.visible = true;
      let intersects = raycaster.intersectObject( dragPlane );
      dragPlane.visible = false;


      if(intersects.length){

        let p = intersects[0].point;

        debugSphere.position.copy(p)
        debugSphere.body.position.copy(p);
      }
    }

  }


  $(window).on('mousedown', onPress)
  $(window).on('mouseup', onRelease)
  $(window).on('mousemove', onDrag)

  container.on('touchstart', onPress);
  container.on('touchend', onRelease);
  container.on('touchmove', onDrag);


  return {
    begin: function(){
      view.begin();
    }
  };

};



window.onload = () => {

  var sketch = new Sketch();

  sketch.begin();

};


