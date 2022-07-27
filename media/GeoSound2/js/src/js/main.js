  var scene, camera, renderer;
  var objectControls;
  var objects = [];
  var mesh = [];
  var speed = [];

  var counter = 0;
  speed.push(Math.random()/14, Math.random()/12,
    Math.random()/14,Math.random()/12,Math.random()/14,
    Math.random()/12,Math.random()/12,Math.random()/12,
    Math.random()/12);
  var intersectionPlane;
  var collidableMeshList = [];
  var newMat = new THREE.MeshNormalMaterial();
  var planeMaterial = new THREE.MeshBasicMaterial({color: 0x717282});
  var planeGeo = new THREE.PlaneBufferGeometry(20, 23);
  var plane2 = new THREE.Mesh(planeGeo, planeMaterial);
  plane2.rotation.x = -Math.PI * 8/24;
  plane2.rotation.z = Math.PI * 5/16;
  plane2.position.x = 30;
  plane2.position.y = -8;
  plane2.receiveShadow = true;

  var CylinderGeo = new THREE.CylinderGeometry(0.15,0.15,25);
  var cylinderMat = new THREE.MeshBasicMaterial({color: 0xa65c68});
  var cylinder1 = new THREE.Mesh(CylinderGeo, cylinderMat);
  cylinder1.position.x = -20;
  cylinder1.position.y = 18;

  var cylinder2 = new THREE.Mesh(CylinderGeo, cylinderMat);
  cylinder2.position.x = 30;
  cylinder2.position.y = 0;

  var cylinder3 = new THREE.Mesh(CylinderGeo, cylinderMat);
  cylinder3.position.x = 80;
  cylinder3.position.y = -17;

  var cylinder4 = new THREE.Mesh(CylinderGeo, cylinderMat);
  cylinder4.position.x = 130;
  cylinder4.position.y = -34;

  var synth1 = new Tone.Synth({
      "portamento" : 0.01,
      "oscillator" : {
        "type" : "square"
      },
      "envelope" : {
        "attack" : 0.005,
        "decay" : 0.2,
        "sustain" : 0.4,
        "release" : 1.4,
      },
      "filterEnvelope" : {
        "attack" : 0.005,
        "decay" : 0.1,
        "sustain" : 0.05,
        "release" : 0.8,
        "baseFrequency" : 300,
        "octaves" : 4
      }
    }).toMaster();

  var synth2 = new Tone.Synth({
    "portamento" : 0.01,
    "oscillator" : {
      "type" : "sine10"
    },
    "envelope" : {
      "attack" : 0.005,
      "decay" : 0.2,
      "sustain" : 0.4,
      "release" : 1.4,
    }
  }).toMaster();

  var synth3 = new Tone.FMSynth({
			"modulationIndex" : 12.22,
			"envelope" : {
				"attack" : 0.01,
				"decay" : 0.2
			},
			"modulation" : {
				"type" : "sine10"
			},
			"modulationEnvelope" : {
				"attack" : 0.2,
				"decay" : 0.01
			}
		}).toMaster();

var synth4 = new Tone.MonoSynth({
  			"portamento" : 0.01,
  			"oscillator" : {
  				"type" : "sawtooth"
  			},
  			"envelope" : {
  				"attack" : 0.005,
  				"decay" : 0.2,
  				"sustain" : 0.4,
  				"release" : 1.4,
  			}
  		});

var volume3 = new Tone.Volume(15);
synth3.chain(volume3, Tone.Master);
var volume4 = new Tone.Volume(-10);
synth4.chain(volume4, Tone.Master);

Tone.Master.mute = true;

// var btn = document.getElementById("button");
//   btn.addEventListener("click", function() {
//    window.location.href = "www.google.com";
//  //  navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
//   // destinationType: Camera.DestinationType.FILE_URI
// // });
// });



init();
animate();

function init(){
  scene = new THREE.Scene();

  var ar = window.innerWidth / window.innerHeight;

  camera = new THREE.PerspectiveCamera( 30, ar , 1, 1000 );
  camera.position.z = 400;

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setClearColor(0x20252d);
  renderer.shadowMapEnabled = true;
  renderer.shadowMapSoft = true;

  document.body.appendChild( renderer.domElement );

  var SpotLight1 = new THREE.SpotLight( 0x000000, 0.75 );
	SpotLight1.position.set( -10,80,20 );
	SpotLight1.target.position.set( -200,88,10);
	SpotLight1.castShadow = true;
  SpotLight1.shadowDarkness = 0.2;
  SpotLight1.shadowBias = 0.00001;
	helper = new THREE.SpotLightHelper( SpotLight1);
  SpotLight1.shadowMapWidth = 2048;
	SpotLight1.shadowMapHeight = 2048;

	var SpotLight2 = new THREE.SpotLight( 0x000000, 0.95 );
	SpotLight2.position.set( 40,80,30 );
  // SpotLight2.position.y = 100;
	SpotLight2.target.position.set( 0,-20,-30);
	SpotLight2.castShadow = true;
  SpotLight2.shadowDarkness = 0.2;
  SpotLight1.shadowBias = 0.001;
	var helper2 = new THREE.SpotLightHelper( SpotLight2 );
	SpotLight2.shadowMapWidth = 2048;
	SpotLight2.shadowMapHeight = 2048;

	var directionalLight = new THREE.DirectionalLight( 'rgb(255,255,255)', 1 );
  directionalLight.castShadow = true;
  directionalLight.shadowDarkness = 0.2;
  directionalLight.shadowMapWidth = 2048;
	directionalLight.shadowMapHeight = 2048;
  var dirhelper = new THREE.DirectionalLightHelper(directionalLight, 1);

	var pointLight1 = new THREE.PointLight( 0xa52b3d, 0.7, 100 );
	pointLight1.position.set( 110, -5, 10 );
  pointLight1.shadowDarkness = 0.4;
  pointLight1.shadowColor = 0x7a5955;

  var helper3 = new THREE.PointLightHelper(pointLight1);

	var pointLight2 = new THREE.PointLight( 0xa52b3d, 0.7, 100 );
	pointLight2.position.set( 0, 30, 10 );
  var helper4 = new THREE.PointLightHelper(pointLight2);

  var ambient = new THREE.AmbientLight( 0x706060, 3 );
  ambient.shadowDarkness = 0.08;
  ambient.shadowColor = 0x37cc7f;

  var planeMaterial = new THREE.MeshBasicMaterial({color: 0x717282});
  var planeGeo = new THREE.PlaneBufferGeometry(20, 23);

  var plane1 = new THREE.Mesh(planeGeo, planeMaterial);
  plane1.rotation.x = -Math.PI * 8/24;
  plane1.rotation.z = Math.PI * 5/16;
  plane1.position.x = -20;
  plane1.position.y = 10;
  plane1.receiveShadow = true;

  var plane2 = new THREE.Mesh(planeGeo, planeMaterial);
  plane2.rotation.x = -Math.PI * 8/24;
  plane2.rotation.z = Math.PI * 5/16;
  plane2.position.x = 30;
  plane2.position.y = -8;
  plane2.receiveShadow = true;

  var plane3 = new THREE.Mesh(planeGeo, planeMaterial);
  plane3.rotation.x = -Math.PI * 8/24;
  plane3.rotation.z = Math.PI * 5/16;
  plane3.position.x = 80;
  plane3.position.y = -26;
  plane3.receiveShadow = true;

  var plane4 = new THREE.Mesh(planeGeo, planeMaterial);
  plane4.rotation.x = -Math.PI * 8/24;
  plane4.rotation.z = Math.PI * 5/16;
  plane4.position.x = 130;
  plane4.position.y = -43;
  plane4.receiveShadow = true;

  var dashMaterial = new THREE.LineDashedMaterial( { color: 0xa65c68, dashSize: 1*Math.PI*10/40, gapSize: 1*Math.PI*10/40, linewidth:1  } ),
  circGeom = new THREE.CircleGeometry( 10, 50 );

  circGeom.vertices.shift();
  circGeom.computeLineDistances();

  var circ1 = new THREE.Line( circGeom, dashMaterial);
  circ1.position.set(-20,38,0);
  circ1.rotation.x = Math.PI/9;
  circ1.rotation.y = -Math.PI/7;
  circ1.scale.set(1.5,1.5,1.5);

  var circ2 = new THREE.Line( circGeom, dashMaterial);
  circ2.position.set(31,20,0);
  circ2.rotation.x = Math.PI/9;
  circ2.rotation.y = -Math.PI/6;
  circ2.scale.set(1.5,1.64,1.5);

  var circ3 = new THREE.Line( circGeom, dashMaterial);
  circ3.position.set(81,2,0);
  circ3.rotation.x = Math.PI/9;
  circ3.rotation.y = -Math.PI/5;
  circ3.scale.set(1.6,1.7,1.5);

  var circ4 = new THREE.Line( circGeom, dashMaterial);
  circ4.position.set(131,-14,0);
  circ4.rotation.x = Math.PI/9;
  circ4.rotation.y = -Math.PI/4;
  circ4.scale.set(1.65,1.75,1.5);

  scene.add(directionalLight);
  // scene.add(SpotLight1);
  scene.add(SpotLight2);
  scene.add(pointLight1);
  scene.add(pointLight2);
  scene.add(ambient);

  scene.add(plane1);
  scene.add(plane2);
  scene.add(plane3);
  scene.add(plane4);

  scene.add(cylinder1);
  scene.add(cylinder2);
  scene.add(cylinder3);
  scene.add(cylinder4);

  scene.add(circ1);
  scene.add(circ2);
  scene.add(circ3);
  scene.add(circ4);



  /*

     Object Control stuff!!!!

  */

  objectControls = new ObjectControls( camera );

  var geo = new THREE.PlaneBufferGeometry( 100000 , 100000 );
  var mat = new THREE.MeshLambertMaterial({color: 0xb2b2b2});
  intersectionPlane = new THREE.Mesh( geo , mat );
  intersectionPlane.visible = false;
  scene.add( intersectionPlane );

  var mesh1 = new THREE.Mesh(new createMergedGeometry().geometry, mat);
  mesh1.position.x = -140;
  mesh1.position.y = 20;
  mesh1.castShadow = true;
  mesh1.receiveShadow = true;

  var mesh2 = new THREE.Mesh(new createMergedGeometry().geometry, mat);
  mesh2.position.x = -113;
  mesh2.position.y = 20;
  mesh2.castShadow = true;
  mesh2.receiveShadow = true;

  var mesh3 = new THREE.Mesh(new createMergedGeometry().geometry, mat);
  mesh3.position.x = -86;
  mesh3.position.y = 20;
  mesh3.castShadow = true;
  mesh3.receiveShadow = true;

  var mesh4 = new THREE.Mesh(new createMergedGeometry().geometry, mat);
  mesh4.position.x = -140;
  mesh4.position.y = -7;
  mesh4.castShadow = true;
  mesh4.receiveShadow = true;

  var mesh5 = new THREE.Mesh(new createMergedGeometry().geometry, mat);
  mesh5.position.x = -113;
  mesh5.position.y = -7;
  mesh5.castShadow = true;
  mesh5.receiveShadow = true;

  var mesh6 = new THREE.Mesh(new createMergedGeometry().geometry, mat);
  mesh6.position.x = -86;
  mesh6.position.y = -7;
  mesh6.castShadow = true;
  mesh6.receiveShadow = true;

  var mesh7 = new THREE.Mesh(new createMergedGeometry().geometry, mat);
  mesh7.position.x = -140;
  mesh7.position.y = -34;
  mesh7.castShadow = true;
  mesh7.receiveShadow = true;

  var mesh8 = new THREE.Mesh(new createMergedGeometry().geometry, mat);
  mesh8.position.x = -113;
  mesh8.position.y = -34;
  mesh8.castShadow = true;
  mesh8.receiveShadow = true;

  var mesh9 = new THREE.Mesh(new createMergedGeometry().geometry, mat);
  mesh9.position.x = -86;
  mesh9.position.y = -34;
  mesh9.castShadow = true;
  mesh9.receiveShadow = true;

  mesh.push(mesh1,mesh2,mesh3,mesh4,mesh5,mesh6,mesh7,mesh8,mesh9);

  for (var i = 0; i < mesh.length; i ++){
    collidableMeshList.push(mesh[i]);
  }


  for( var i = 0; i < mesh.length; i++ ){
  mesh[i].scale.set(0.26,0.26,0.26);
  mesh[i].castShadow = true;
  mesh[i].receiveShadow = true;
  mesh[i].selected = false;
  mesh[i].select = function(){
    this.selected = true;
    intersectionPlane.position.copy( this.position );
    }

  mesh[i].deselect = function(){
    this.selected = false;
    }

  mesh[i].update = function(){
    var raycaster = objectControls.raycaster;
    var i = raycaster.intersectObject( intersectionPlane );
      if( !i[0] ){
        console.log( 'something is terribly wrong' );
      }else{
        this.position.copy( i[0].point );
      }
    }
  scene.add( mesh[i] );
  objectControls.add( mesh[i] );
  }
  window.addEventListener( 'resize', onWindowResize, false );
  console.log("%c www.yaninma.com ","background: #355493; color: #fff");
  window.addEventListener( 'load', function(){
  	var loadingPage = document.getElementById("loadingPage");
  	loadingPage.style.display = "none";
  });

}




function createMergedGeometry(){
	this.geometry = new THREE.Geometry();
	for (var i = 0; i < 5; i++) {
	var cubeGeometry = new THREE.BoxGeometry(
	  65*Math.random(),
	  65*Math.random(),
		65*Math.random());
	var transformation = new THREE.Matrix4().makeTranslation(Math.random()*10, Math.random()*10, Math.random()*10).makeRotationX(Math.random() * Math.PI);
		cubeGeometry.applyMatrix(transformation);
		this.geometry.merge(cubeGeometry);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate(){
  requestAnimationFrame( animate );
  objectControls.update();
  update();
  generateSound();
  changeGeoColor();
  renderer.render( scene , camera );
}

function update(){
  counter ++;
  if (counter > 20){
    Tone.Master.mute = false;
  }

  for(var i = 0; i < mesh.length; i ++){
		mesh[i].rotation.x += slider1.value/1500;
	}
	for (var i = 0; i < mesh.length; i ++){
		mesh[i].rotation.z += slider2.value/2000;
	}
	for (var i = 0; i < mesh.length; i ++){
		mesh[i].rotation.y += speed[i];
	}
}

function generateSound(){
  var contact1 = document.getElementById('contact1');
  contact1.innerHTML = "contact1:" + " " + " " + " " + 0;
  var contact2 = document.getElementById('contact2');
  contact2.innerHTML = "contact2:" + " " + " " + " " + 0;
  var contact3 = document.getElementById('contact3');
  contact3.innerHTML = "contact3:" + " " + " " + " " + 0;
  var contact4 = document.getElementById('contact4');
  contact4.innerHTML = "contact4:" + " " + " " + " " + 0;


  var originPoint1 = cylinder1.position.clone();
  for (var vertexIndex1 = 0; vertexIndex1 < cylinder1.geometry.vertices.length; vertexIndex1++){
    var localVertex1 = cylinder1.geometry.vertices[vertexIndex1].clone();
    var globalVertex1 = localVertex1.applyMatrix4( cylinder1.matrix );
    var directionVector1 = globalVertex1.sub( cylinder1.position );
    var ray1 = new THREE.Raycaster( originPoint1, directionVector1.clone().normalize() );
    var collisionResults1 = ray1.intersectObjects( collidableMeshList );
    // console.log(collisionResults1);
    if ( collisionResults1.length > 0 && collisionResults1[0].distance < directionVector1.length() ){
    //  console.log(collisionResults1[0].distance);
     contact1.innerHTML = "contact1:" + " " + " " +collisionResults1[0].distance;
      plane2.material = new THREE.MeshLambertMaterial({color: 0xd3263d});
      switch(Math.floor(collisionResults1[0].distance)){
      case 7:note2 = "E4";break;case 8:note2 = "D2";break;case 9:note2 = "D2";break;case 10:note2 = "D2";break;
      case 11:note2 = "E2";break;case 12:note2 = "E2";break;case 13:note2 = "E2";break;default:note2 = "E2";
   }
    synth2.triggerAttack(note2);
  }else{
    synth2.triggerRelease();
  }
}
  //////////////////
  var originPoint2 = cylinder2.position.clone();
  for (var vertexIndex2 = 0; vertexIndex2 < cylinder2.geometry.vertices.length; vertexIndex2++)
  {
    var localVertex2 = cylinder2.geometry.vertices[vertexIndex2].clone();
    var globalVertex2 = localVertex2.applyMatrix4( cylinder2.matrix );
    var directionVector2 = globalVertex2.sub( cylinder2.position );

    var ray2 = new THREE.Raycaster( originPoint2, directionVector2.clone().normalize() );
    var collisionResults2 = ray2.intersectObjects( collidableMeshList );
    // console.log(collisionResults1);
    if ( collisionResults2.length > 0 && collisionResults2[0].distance < directionVector2.length() ){

     // console.log(" Hit ");
       contact2.innerHTML = "contact2:" + " " + " " +collisionResults2[0].distance;
       switch(Math.floor(collisionResults2[0].distance)){
       case 5:note1 = "C6";break;case 6:note1 = "C6";break;case 7:note1 = "C6";break;case 8:note1 = "D6";break;
       case 9:note1 = "D6";break;case 10:note1 = "D6";break;case 11:note1 = "E6";break;case 12:note1 = "E6";break;
       case 13:note1 = "E6";break;case 14:note1 = "A6";break;case 15:note1 = "C6";break;case 16:note1 = "C6";break;
       case 17:note1 = "C6";break;case 18:note1 = "G6";break;case 19:note1 = "G6";break;case 20:note1 = "A6";break;
       case 21:note1 = "A6";break;default:note1 = "A6";
       }
       synth1.triggerAttack(note1);
         }else{
           synth1.triggerRelease();
         }
  }
//////////////////////////////////////////////////////////
  var originPoint3 = cylinder3.position.clone();
  for (var vertexIndex3 = 0; vertexIndex3 < cylinder2.geometry.vertices.length; vertexIndex3++)
  {
   var localVertex3 = cylinder3.geometry.vertices[vertexIndex3].clone();
   var globalVertex3 = localVertex3.applyMatrix4( cylinder3.matrix );
   var directionVector3 = globalVertex3.sub( cylinder3.position );

   var ray3 = new THREE.Raycaster( originPoint3, directionVector3.clone().normalize() );
   var collisionResults3 = ray3.intersectObjects( collidableMeshList );
   // console.log(collisionResults1);
   if ( collisionResults3.length > 0 && collisionResults3[0].distance < directionVector3.length() ){

    //  console.log(" Hit ");
       contact3.innerHTML = "contact3:" + " " + " " +collisionResults3[0].distance;
       switch(Math.floor(collisionResults3[0].distance)){
       case 5:note3 = "C3";break;case 6:note3 = "C3";break;case 7:note3 = "C3";break;case 8:note3 = "D3";break;
       case 9:note3 = "D4";break;case 10:note3 = "D3";break;case 11:note3 = "E3";break;case 12:note3 = "E4";break;
       case 13:note3 = "E3";break;case 14:note3 = "A3";break;case 15:note3 = "C3";break;case 16:note3 = "C3";break;
       case 17:note3 = "C3";break;case 18:note3 = "G3";break;case 19:note3 = "G3";break;case 20:note3 = "A4";break;
       case 21:note3 = "A4";break;default:note3 = "F3";
    }
  synth3.triggerAttack(note3);
      }else{
    synth3.triggerRelease();
        // mesh1.material = new THREE.MeshLambertMaterial({color: 0x9e8684});
      }
}
///////////////////////////////////////
  var originPoint4 = cylinder4.position.clone();
  for (var vertexIndex4 = 0; vertexIndex4 < cylinder4.geometry.vertices.length; vertexIndex4++){
    var localVertex4 = cylinder4.geometry.vertices[vertexIndex4].clone();
    var globalVertex4 = localVertex4.applyMatrix4( cylinder4.matrix );
    var directionVector4 = globalVertex4.sub( cylinder4.position );

    var ray4 = new THREE.Raycaster( originPoint4, directionVector4.clone().normalize() );
    var collisionResults4 = ray4.intersectObjects( collidableMeshList );
   // console.log(collisionResults1);
    if ( collisionResults4.length > 0 && collisionResults4[0].distance>4 && collisionResults4[0].distance < directionVector4.length() ){

      // console.log(collisionResults4[0].distance);
      contact4.innerHTML = "contact4:" + " " + " " +collisionResults4[0].distance;
      switch(Math.floor(collisionResults4[0].distance)){
      case 5:note4 = "C3";break;case 6:note4 = "C4";break;case 7:note4 = "C5";break;case 8:note4 = "D4";break;
      case 9:note4 = "D4";break;case 10:note4 = "D3";break;case 11:note4 = "E3";break;case 12:note4 = "E4";break;
      case 13:note4 = "E4";break;case 14:note4 = "A4";break;case 15:note4 = "C3";break;case 16:note4 = "C4";break;
      case 17:note4 = "C5";break;case 18:note4 = "G4";break;case 19:note4 = "G4";break;case 20:note4 = "A4";break;
      case 21:note4 = "A4";break;default:note4 = "C3";
    }
    synth4.triggerAttack(note4);
      }else{
      synth4.triggerRelease();
    }
  }
}

function changeGeoColor(){
  for (var i = 0; i < mesh.length; i++){
  if((Math.abs(mesh[i].position.y - cylinder1.position.y) < 80 && Math.abs(mesh[i].position.x - cylinder1.position.x) < 30)
    ||(Math.abs(mesh[i].position.y - cylinder2.position.y) < 80 && Math.abs(mesh[i].position.x - cylinder2.position.x) < 30)
    ||(Math.abs(mesh[i].position.y - cylinder3.position.y) < 80 && Math.abs(mesh[i].position.x - cylinder3.position.x) < 30)
    ||(Math.abs(mesh[i].position.y - cylinder4.position.y) < 180 && Math.abs(mesh[i].position.x - cylinder4.position.x) < 30)
   ){
    // mesh[i].material = new THREE.MeshLambertMaterial({color: 0x2184ff});//blue
    mesh[i].material = new THREE.MeshLambertMaterial({color: 0xc66f19});//red
  }else{
    mesh[i].material = new THREE.MeshLambertMaterial({color: 0x9e8684});
    }
  }
}
