
'use strict'

import Joint from './Joint.js';

import skinDataToGeometry from './skinDataToGeometry.js'

import CannonController from './CannonController.js'

import JointMaterial from './JointMaterial.js'

import randomElement from './randomElement.js'



const isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0 || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification);

StartAudioContext(Tone.context, '#container', ()=>{
  // if(isSafari)  alert('StartAudioContext')
});



var randf = THREE.Math.randFloat;

var Sketch = function(options){

  options = options || {};
  
  var debug = false;

  var elapsedTime = 0;

  var container = options.container || $("#container");

  var globeRad = 10;
  
  var goalPos = new THREE.Vector3( 0, 0, 0 );
  
  var attenuation = 0.99;
  
  var hingeRange = 60;
  
  var shadowRes = 2048;



  var gain = new Tone.Volume( 0 ).toMaster();
  gain.set( 'volume',  -15 );


  // tone
  var synth = new Tone.PolySynth(3, Tone.Synth).toMaster();
  synth.volume.value = -10;
  synth.set("detune", -1200);


  var dist = new Tone.Chorus(1, 100, 0.5).toMaster();
  var chorus = new Tone.PingPongDelay("4n", 0.05).connect(dist);//.toMaster();
  var duoSynth = new Tone.DuoSynth().connect(chorus);
  duoSynth.toMaster();
  duoSynth.volume.value = -10;
  

  var notes = ['A1','A2','A3','A4','C1','C2','C3','C4','E1','E2','E3','E4']
  var playNote = () => {
    duoSynth.triggerAttackRelease(randomElement(notes), "16n");
  }


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

  var camera = new THREE.PerspectiveCamera(60, view.aspect, 1, 1000);
  camera.position.y = -5;
  camera.position.z = 40;
  camera.lookAt( new THREE.Vector3(camera.position.x, camera.position.y, 0) );
  
  var makeSpot = () => {
    var spot = new THREE.SpotLight();

    spot.castShadow = true;
    spot.shadow.mapSize.width = shadowRes;
    spot.shadow.mapSize.height = shadowRes;
    spot.shadow.camera.near = 0.1;
    spot.shadow.camera.far = 100;
    spot.shadow.camera.fov = 60;
    spot.shadow.bias = 0.000001;
    // scene.add( spot );

    return spot
  }

  var spot = makeSpot();
  spot.color.set(0xBBFFEE).multiplyScalar( 0.66 );
  spot.position.lerp(camera.position, 0.75);
  spot.position.y += 10;
  spot.lookAt(new THREE.Vector3( 0, 0, 0 ));
  scene.add(spot);


  var hemi = new THREE.HemisphereLight( 0x555834, 0x181844, 1 );
  scene.add( hemi );



  let box = new THREE.Mesh(new THREE.BoxGeometry(10,10,10), new THREE.MeshBasicMaterial({
    color: 'white',
    wireframe: true,
    side: 2
  }))


  // var oc = new OimoWrapper();
  // oc.gravity.set(0, 0, 0);

  var cc = CannonController({
    gravity: new CANNON.Vec3(0,-100,0),
    maxSubSteps: isSafari ? 1 : 4
  });


  var debugSphere = new THREE.Mesh(new THREE.SphereGeometry(10), new THREE.MeshBasicMaterial({
    color: 'red',
    wireframe: true
  }))
  debugSphere.visible = debug;
  debugSphere.position.z = -100;
  scene.add(debugSphere)
  debugSphere.body = cc.addSphere(10, {mass: 0});

  var dragPlane = new THREE.Mesh(new THREE.PlaneGeometry( 300, 300, 10, 10), new THREE.MeshBasicMaterial( {
    color: 'magenta',
    wireframe: true
  } ));
  dragPlane.visible = false;

  scene.add(dragPlane)




  var dataTex = new THREE.DataTexture( new Uint8Array([255,0,255, 0,255,255]), 2, 1, THREE.RGBFormat/*, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy */)
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
      mesh: null
    }

    var skinObj = skin.skinObj;
    scene.add(skinObj);

    // create the joints
    let jointMap = {}
    let jointMatrices = [];

    json['joints'].forEach( function( j ){
      
      let joint = new Joint({
        name: j.name,
        transform: new THREE.Matrix4().fromArray(j['transform']),
        rigidBody: j.rigidBody
      })

      skin.joints.push(joint);

      jointMap[j.name] = joint;

      jointMatrices.push(joint.transform);


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
      b.add(c)

      // make the rigid body
      b.body = cc.addBoxMesh( c, {
        position: b.position,
        mass: data.mass
      });


      if ( i === 'bulletRigidBodyShape4' ) {

        b.body.addEventListener( 'collide', e => {

          skin.mesh.material.uniforms.hitVal.value = 2;

          playNote();

        });

      }



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
      
      // TODO: local axis in rigid bodies..? 
      let constraintPos = new THREE.Vector3().fromArray(c['translate']);

      let invA = new THREE.Matrix4().getInverse(a.matrixWorld)
      let invB = new THREE.Matrix4().getInverse(b.matrixWorld)

      let pointInA = constraintPos.clone().applyMatrix4(invA);
      let pointInB = constraintPos.clone().applyMatrix4(invB);

      
      let constraint = cc.addConeConstraint( 

        a.body,
        pointInA,
        CANNON.Vec3.UNIT_Z,
        
        b.body,
        pointInB,
        CANNON.Vec3.UNIT_Z,

        Infinity);


      constraint.angle = .5
      constraint.twistAngle = 1

      skin.constraints.push(constraint)
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

    var jointMaterial = new JointMaterial(jointTransforms, {
      map: dataTex
    });

    
    let mesh = new THREE.Mesh(geometry, jointMaterial);
    mesh.castShadow = true;
    mesh.receiveShadow = true;



    mesh.customDepthMaterial = new THREE.ShaderMaterial({
        
        vertexShader: [

        "uniform mat4 joints[4];",

        "attribute vec3 jointWeights;",

        "attribute vec3 jointIndices;",

        'void main() {',


        "mat4 jointMatrix = mat4( 0.0 );",

        "for(int i=0; i<3; i++){",

          'jointMatrix += jointWeights[i] * joints[ int(jointIndices[i]) ];',

        "}",

        'vec3 transformed = vec3( position );',

        'vec4 worldPosition = modelMatrix * jointMatrix * vec4( transformed, 1.0 );',
        
        "gl_Position = projectionMatrix * viewMatrix * worldPosition;",

        '}',

        ].join('\n'),
        
        fragmentShader: [

        THREE.ShaderChunk['common'],
        THREE.ShaderChunk['packing'],
        THREE.ShaderChunk['uv_pars_fragment'],
        THREE.ShaderChunk['map_pars_fragment'],
        THREE.ShaderChunk['alphamap_pars_fragment'],
        THREE.ShaderChunk['logdepthbuf_pars_fragment'],
        THREE.ShaderChunk['clipping_planes_pars_fragment'],

        'void main() {',

          THREE.ShaderChunk['clipping_planes_fragment'],

          'vec4 diffuseColor = vec4( 1.0 );',

          THREE.ShaderChunk['map_fragment'],
          THREE.ShaderChunk['alphamap_fragment'],
          THREE.ShaderChunk['alphatest_fragment'],

          THREE.ShaderChunk['logdepthbuf_fragment'],

          'gl_FragColor = packDepthToRGBA( gl_FragCoord.z );',

        '}',
        ].join('\n'),
        
        uniforms: jointMaterial.uniforms
    });


    skinObj.add(mesh);
    skin.geometry = geometry;
    skin.material = jointMaterial;
    skin.material = jointMaterial;
    skin.mesh = mesh;

    skin.rigidBodies.forEach( function( rb ){

      // console.log( rb );
    
      if (rb.name ===  'bulletRigidBodyShape4') {
        rb.body.mesh = skin.mesh;
      }
    
    });


    skin.loaded = true;

    intersectables = intersectables.concat(skin.raycastIntersects);

    return skin;
  }

  var tempPhong = new THREE.MeshPhongMaterial();
  var tempMesh = new THREE.Mesh(new THREE.BoxGeometry(5,5,0.01), tempPhong);
  scene.add(tempMesh);

  tempMesh.position.z = -10;


  skinLoader.load('assets/mesh.json', json => {

    let geometry = skinDataToGeometry(json);
    geometry.computeVertexNormals();
    geometry.computeFaceNormals();
    geometry['attributes']['position'].dynamic = true;

    let step = 10;
    let countX = 8;
    let countY = 9;

    let q = new THREE.Quaternion();
    q.setFromEuler(new THREE.Euler( 0, 0, Math.PI * 0.25));
    let q1 = new THREE.Quaternion();
    q1.setFromEuler(new THREE.Euler( 0, 0, -Math.PI * 0.25));

    for(let i=0; i<countX; i++) {
      for(let j=0; j<countY; j++) {
        let skin = createSkin(json, geometry);
        skins.push(skin); 
        
        skin.rigidBodies.forEach( function( rb ){
          rb.body.position.x += ((i) - countX * 0.5 + (j%2) * 0.5) * step * 1.44;
          rb.body.position.y += (j - countY * 0.5) * step * 0.72;

          rb.body.quaternion.copy(i%2 ? q : q1);
        });
      }
    }

    for(var i=0; i<1; i++) {
      view.update()
    }
  });


  var updateSkin = skin => {

    if (skin.loaded) {

      skin.joints.forEach( j => {
        j.updateTransform();
      });

      // rigid bodiy transforms
      skin.rigidBodies.forEach( (b, i)=>{

        if(b.body){

          if(b.body.orig_pos) {
          //   b.body.position.copy(b.body.orig_pos);
          }

          b.body.velocity.x *= attenuation;
          b.body.velocity.y *= attenuation;
          b.body.velocity.z *= attenuation;

          b.body.angularVelocity.x *= attenuation;
          b.body.angularVelocity.y *= attenuation;
          b.body.angularVelocity.z *= attenuation;
          
          b.position.copy(b.body.position);
          b.quaternion.copy(b.body.quaternion);
        }

        if(b.body.mesh) {

          b.body.mesh.material.uniforms.hitVal.value = Math.max(b.body.mesh.material.uniforms.hitVal.value - 0.05, 0.0);
        }

      });


      // skin.geometry['attributes']['normal'].needsUpdate = true;
    }
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

    cc.update(elapsedTime);

    // controls.update();
    
    skins.forEach( function( skin ){
    
      updateSkin(skin);
    
    });


    debugSphere.body.velocity.copy( debugSphere.position );
    debugSphere.body.velocity.vsub(debugSphere.body.position);
    debugSphere.body.velocity.z += 30;
    debugSphere.body.velocity.scale(10);

    debugSphere.body.position.x = debugSphere.position.x;
    debugSphere.body.position.y = debugSphere.position.y;
    debugSphere.body.position.z = debugSphere.position.z;

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
  }

  var onRelease = e => {
    mousedown = false;

    debugSphere.position.z = -50;
  }

  var onDrag = e => {
    
    if(mousedown){

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

        debugSphere.position.z = 10;
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



window.onload = function() {

  var sketch = new Sketch();

  sketch.begin();

};
