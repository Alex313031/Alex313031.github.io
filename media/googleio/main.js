WAGNER.vertexShadersPath = 'Wagner/vertex-shaders';
WAGNER.fragmentShadersPath = 'Wagner/fragment-shaders';
WAGNER.assetsPath = 'Wagner/assets/';

var composer, bloomPass;
var raycaster;
var mouse = new THREE.Vector2();
var intersection = {
	position: new THREE.Vector3(),
	normal: new THREE.Vector3()
}

var links = document.querySelectorAll( 'a[rel=external]' );
for( var j = 0; j < links.length; j++ ) {
	var a = links[ j ];
	/*a.addEventListener( 'click', function( e ) {
		window.open( this.href, '_blank' );
		e.preventDefault();
	}, false );*/
	a.setAttribute("target", "_blank");
}

var isMobile = ( window.orientation !== undefined );
var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor );

var camera, controls,
	scene, material,
	renderer, world;
var raycaster = new THREE.Raycaster();;

var container = document.getElementById( 'container' );

window.addEventListener( 'load', function(){
	if( isMobile ) {
		function preload( e ) {
      context.resume();
			document.getElementById( 'start-button' ).classList.add( 'hidden' );
			var elem = document.body
			if (elem.requestFullscreen) {
			  elem.requestFullscreen();
			} else if (elem.msRequestFullscreen) {
			  elem.msRequestFullscreen();
			} else if (elem.mozRequestFullScreen) {
			  elem.mozRequestFullScreen();
			} else if (elem.webkitRequestFullscreen) {
			  elem.webkitRequestFullscreen();
			}
			window.removeEventListener( 'click', preload );
			setTimeout( init, 0 );
			e.preventDefault();
		}
		window.addEventListener( 'click', preload );
	} else {
		function preload( e ) {
      context.resume();
			document.getElementById( 'start-button' ).classList.add( 'hidden' );
			window.removeEventListener( 'click', preload );
			setTimeout( init, 0 );
		}
	window.addEventListener( 'click', preload );
	}
} );

function setProgress( p ) {

	progress.style.width = p / 100 * ( progress.parentNode.clientWidth - 4 ) + 'px';

}

function showProgress( state ) {

	title.classList.toggle( 'visible', state );
	progress.parentNode.classList.toggle( 'visible', state );
	snapshotBtn.classList.toggle( 'visible', !state );

}

var room, floor, wallA, wallB, wallC, wallD, ceiling, boxI, boxSlash, cylinderO, floorPlane, wallAPlane, wallBPlane, wallCPlane, wallDPlane, ceilingPlane;
var dummy;

function createMaterial() {

	var material = new THREE.RawShaderMaterial( {
		uniforms: {

			type: { type: 'i', value: 0 },

			floorInverseMatrix: { type: 'm4', value: new THREE.Matrix4() },
			wallAInverseMatrix: { type: 'm4', value: new THREE.Matrix4() },
			wallBInverseMatrix: { type: 'm4', value: new THREE.Matrix4() },
			wallCInverseMatrix: { type: 'm4', value: new THREE.Matrix4() },
			wallDInverseMatrix: { type: 'm4', value: new THREE.Matrix4() },
			ceilingInverseMatrix: { type: 'm4', value: new THREE.Matrix4() },
			cylinderInverseMatrix: { type: 'm4', value: new THREE.Matrix4() },
			boxInverseMatrix: { type: 'm4', value: new THREE.Matrix4() },
			slashInverseMatrix: { type: 'm4', value: new THREE.Matrix4() },

			cylinderPosition: { type: 'v3', value: new THREE.Vector3() }

		},
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
		wireframe: false
	} );

	return material;

}

var bodies = {};

function addOimoShape( type, pos, size, rot, mesh, move ) {

	var obj = {};

	if( type === 1 ) obj = { type:'sphere', size:[size.x*0.5, size.x*0.5, size.x*0.5], move: move, world:world };
	if( type === 2 ) obj = { type:'box', size:[size.x,size.y,size.z], move: move, world:world };
	if( type === 3 ) obj = {
		type:'cylinder',
		size: [ size.x, size.y, size.x, size.x, size.y, size.x, size.x, size.y, size.x, size.x, size.y, size.x ],
		move: move,
		world: world
	};

	var body = new OIMO.Body(obj);
	body.currentContacts = 0;
	body.setQuaternion( rot );
	body.setPosition( pos );
	bodies[ mesh ] = body;

	return body;

}

var about = document.getElementById( 'about' );
document.getElementById( 'about-button' ).addEventListener( 'click', function( e ) {
	about.classList.toggle( 'hidden' );
	e.preventDefault();
	return false;
} );

var AudioContext = AudioContext || webkitAudioContext;

var context = new AudioContext();
var delayNode = context.createDelay( 1 );
var gainNode = context.createGain();
var mainGain = context.createGain();
gainNode.gain.value = .25;
delayNode.delayTime.value = .05;
delayNode.connect( gainNode );
gainNode.connect( delayNode );
delayNode.connect( mainGain );
mainGain.connect( context.destination );
mainGain.gain.exponentialRampToValueAtTime( 1, context.currentTime + 1 );

function loadSound( file, c ) {

	var request = new XMLHttpRequest();
	request.open( 'GET', file, true );
	request.responseType = 'arraybuffer';

	request.onload = function() {

		context.decodeAudioData( request.response, function( buffer ) {

			c( buffer );

		}, function() {
			console.log( 'error' );
		} );

	};

	request.send();

}

function loadBodySound( body, file ) {

	loadSound( file, function( b ) { body.audioBuffer = b } );

}

var gravity = 9.8;

function playSound( audioBuffer ) {

	if( !audioBuffer ) return;

	var source = context.createBufferSource();
	source.buffer = audioBuffer;
	source.playbackRate.value = .2 + Math.random() * .4;

	source.connect( delayNode );
	source.start( 0 );

}

function init() {

	loadSound( 'assets/RunAmok.mp3', function (b ) {
		var source = context.createBufferSource();
		source.buffer = b;
		source.loop = true;

		source.connect( delayNode );
		source.start( 0 );
	} );

	renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true} );
	var pixelRatio = window.devicePixelRatio;
	if ( isMobile ) pixelRatio *= .5;
	renderer.setPixelRatio( pixelRatio );

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, .1, 10 );
	camera.position.set( 0, 4, 1 );
	if( isMobile ) camera.position.set( 0, 6, .1 );
	camera.lookAt( scene.position );
	scene.add( camera );

	var timestep = 1/60;
	var boardphase = 2;
	var Iterations = 16;
	var noStat = false;
	world = new OIMO.World( timestep, boardphase, Iterations, noStat );
	world.gravity = new OIMO.Vec3(0, -gravity, 0);
	world.worldscale(1);

	var dummyMaterial = new THREE.MeshBasicMaterial( { side: THREE.BackSide } );

	room = new THREE.Mesh( new THREE.BoxGeometry( 4, 4, 4 ), dummyMaterial );
	dummy = new THREE.Mesh( new THREE.BoxGeometry( .1, .1, .1 ), new THREE.MeshNormalMaterial() );
	//scene.add( dummy );

	var s = 40;

	floor = new THREE.Mesh( new THREE.BoxGeometry( 6, 2, 6 ), dummyMaterial );
	floor.position.y = -3;
	floor.geometry.computeTangents();
	floor.updateMatrixWorld();

	addOimoShape( 2, floor.position, new THREE.Vector3( 6, 2, 6 ), floor.rotation, 'floor', false );

	floorPlane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 6, 6, s, s ), createMaterial() );
	floorPlane.material.uniforms.type.value = 1;
	floorPlane.position.y = -2;
	floorPlane.rotation.x = -Math.PI / 2;
	floorPlane.geometry.computeTangents();
	scene.add( floorPlane );

	ceiling = new THREE.Mesh( new THREE.BoxGeometry( 6, 2, 6 ), dummyMaterial );
	ceiling.position.y = 3;
	ceiling.geometry.computeTangents();
	ceiling.updateMatrixWorld();

	addOimoShape( 2, ceiling.position, new THREE.Vector3( 6, 2, 6 ), ceiling.rotation, 'ceiling', false );

	ceilingPlane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 6, 6, s, s ), createMaterial() );
	ceilingPlane.material.uniforms.type.value = 9;
	ceilingPlane.position.y = 2;
	ceilingPlane.rotation.x = Math.PI / 2;
	ceilingPlane.geometry.computeTangents();
	scene.add( ceilingPlane );

	wallA = new THREE.Mesh( new THREE.BoxGeometry( 2, 6, 6 ), dummyMaterial );
	wallA.position.x = -3;
	wallA.geometry.computeTangents();
	wallA.updateMatrixWorld();

	addOimoShape( 2, wallA.position, new THREE.Vector3( 2, 6, 6 ), wallA.rotation, 'wallA', false );

	wallAPlane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 6, 6, s, s ), createMaterial() );
	wallAPlane.material.uniforms.type.value = 5;
	wallAPlane.position.x = -2;
	wallAPlane.rotation.y = Math.PI / 2;
	wallAPlane.geometry.computeTangents();
	scene.add( wallAPlane );

	wallB = new THREE.Mesh( new THREE.BoxGeometry( 2, 6, 6 ), dummyMaterial );
	wallB.position.x = 3;
	wallB.geometry.computeTangents();
	wallB.updateMatrixWorld();

	addOimoShape( 2, wallB.position, new THREE.Vector3( 2, 6, 6 ), wallB.rotation, 'wallB', false );

	wallBPlane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 6, 6, s, s ), createMaterial() );
	wallBPlane.material.uniforms.type.value = 6;
	wallBPlane.position.x = 2;
	wallBPlane.rotation.y = -Math.PI / 2;
	wallBPlane.geometry.computeTangents();
	scene.add( wallBPlane );

	wallC = new THREE.Mesh( new THREE.BoxGeometry( 6, 6, 2 ), dummyMaterial );
	wallC.position.z = -3;
	wallC.geometry.computeTangents();
	wallC.updateMatrixWorld();

	addOimoShape( 2, wallC.position, new THREE.Vector3( 6, 6, 2 ), wallC.rotation, 'wallC', false );

	wallCPlane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 6, 6, s, s ), createMaterial() );
	wallCPlane.material.uniforms.type.value = 7;
	wallCPlane.position.z = -2;
	wallCPlane.geometry.computeTangents();
	scene.add( wallCPlane );

	wallD = new THREE.Mesh( new THREE.BoxGeometry( 6, 6, 2 ), dummyMaterial );
	wallD.position.z = 3;
	wallD.geometry.computeTangents();
	wallD.updateMatrixWorld();

	addOimoShape( 2, wallD.position, new THREE.Vector3( 6, 6, 2 ), wallD.rotation, 'wallD', false );

	wallDPlane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 6, 6, s, s ), createMaterial() );
	wallDPlane.material.uniforms.type.value = 8;
	wallDPlane.position.z = 2;
	wallDPlane.rotation.y = Math.PI;
	wallDPlane.geometry.computeTangents();
	scene.add( wallDPlane );

	cylinderO = new THREE.Mesh( new THREE.CylinderGeometry( .6, .6, .3, 36, 2 ), createMaterial() );
	cylinderO.material.uniforms.type.value = 2;
	cylinderO.geometry.computeTangents();
	scene.add( cylinderO );

	addOimoShape( 3, cylinderO.position, new THREE.Vector3( 1.2, .3, 0 ), cylinderO.quaternion, 'cylinderO', true );
	loadBodySound( bodies[ 'cylinderO' ], 'assets/wood_hit_wood_heavy_1.mp3' );

	boxI = new THREE.Mesh( new THREE.BoxGeometry( .3, 1.2, .3, 2, 10, 2 ), createMaterial() );
	boxI.material.uniforms.type.value = 3;
	boxI.geometry.computeTangents();
	scene.add( boxI );

	addOimoShape( 2, boxI.position, new THREE.Vector3( .3, 1.2, .3 ), boxI.quaternion, 'boxI', true );
	loadBodySound( bodies[ 'boxI' ], 'assets/wood_hit_brick_1.mp3' );

	boxSlash = new THREE.Mesh( new THREE.BoxGeometry( .144, 1.72, .6, 2, 10, 4 ), createMaterial() );
	boxSlash.material.uniforms.type.value = 4;
	boxSlash.geometry.computeTangents();
	scene.add( boxSlash );

	addOimoShape( 2, boxSlash.position, new THREE.Vector3( .144, 1.72, .6 ), boxSlash.quaternion, 'boxSlash', true );
	loadBodySound( bodies[ 'boxSlash' ], 'assets/wood_hit_plastic_1.mp3' );

	world.step();
	setPositions();

	setInterval(oimoLoop, timestep*1000);

	function onDocumentClick( e ) {

		if( e.touches && e.touches.length ) {
			mouse.x = ( e.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
			mouse.y = - ( e.touches[ 0 ].pageY / window.innerHeight ) * 2 + 1;
		} else {
			mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
			mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
		}

		raycaster.setFromCamera( mouse, camera );

		var intersects = raycaster.intersectObjects( [ room ] );

		if ( intersects.length > 0 ) {
			intersection.position.copy( intersects[ 0 ].point );
			intersection.normal.copy( intersects[ 0 ].face.normal );
			dummy.position.copy( intersection.position );
		}

		shootScene();

		e.preventDefault();

	}

	function jumbleScene() {

		randomizeAngularVelocity( bodies[ 'cylinderO' ].body );
		randomizeAngularVelocity( bodies[ 'boxSlash' ].body );
		randomizeAngularVelocity( bodies[ 'boxI' ].body );

	}

	var tmpDir = new THREE.Vector3();
	function shootObject( body, position, normal ) {

		tmpDir.set( body.position.x, body.position.y, body.position.z );
		tmpDir.sub( position );
		var length = tmpDir.length();
		tmpDir.normalize();
		var max = 2;
		if( length > max ) length = max;
		var strength = max - length;
		tmpDir.sub( normal );
		tmpDir.normalize();
		tmpDir.multiplyScalar( Math.sqrt( strength ) );
		tmpDir.multiplyScalar( 20 );

		body.linearVelocity.set( tmpDir.x, tmpDir.y, tmpDir.z );
		tmpDir.multiplyScalar( 4 );
		body.linearVelocity.set( tmpDir.x, tmpDir.y, tmpDir.z );

	}

	function shootScene() {

		shootObject( bodies[ 'cylinderO' ].body, intersection.position, intersection.normal );
		shootObject( bodies[ 'boxSlash' ].body, intersection.position, intersection.normal );
		shootObject( bodies[ 'boxI' ].body, intersection.position, intersection.normal );

	}

	function randomizeAngularVelocity( body ) {

		max = 40;
		body.angularVelocity.x = ( .5 - Math.random() ) * max;
		body.angularVelocity.y = Math.random() * max;
		body.angularVelocity.z = ( .5 - Math.random() ) * max;
		max = 40;
		body.linearVelocity.x = ( .5 - Math.random() ) * max;
		body.linearVelocity.y = ( .5 - Math.random() ) * max;
		body.linearVelocity.z = ( .5 - Math.random() ) * max;

	}

	function resetPositions() {

		function randomizeAngularVelocity( body ) {

			max = 10;
			body.angularVelocity.x = 10;// ( .5 - Math.random() ) * max;
			//body.angularVelocity.y = ( .5 - Math.random() ) * max;
			//body.angularVelocity.z = ( .5 - Math.random() ) * max;
			max = 10;
			body.linearVelocity.x = ( .5 - Math.random() ) * max;
			body.linearVelocity.y = ( .5 - Math.random() ) * max;
			body.linearVelocity.z = ( .5 - Math.random() ) * max;
		}

		var e = new THREE.Euler();
		e.set( Math.PI / 2, 0, 0 );
		var q = new THREE.Quaternion();
		q.setFromEuler( e );

		bodies[ 'cylinderO' ].resetPosition();
		bodies[ 'cylinderO' ].body.setQuaternion( q );
		bodies[ 'cylinderO' ].body.position.set( 1.3, 2, 0 );

		var e = new THREE.Euler();
		e.set( 0, 0, - 13 * Math.PI / 180 );
		var q = new THREE.Quaternion();
		q.setFromEuler( e );

		bodies[ 'boxSlash' ].resetPosition();
		bodies[ 'boxSlash' ].body.setQuaternion( q );
		bodies[ 'boxSlash' ].body.position.set( 0, 2, 0 );

		var e = new THREE.Euler();
		e.set( 0, 0, 0 );
		var q = new THREE.Quaternion();
		q.setFromEuler( e );

		bodies[ 'boxI' ].resetPosition();
		bodies[ 'boxI' ].body.setQuaternion( q );
		bodies[ 'boxI' ].body.position.set( -.5, 2, 0 );

		randomizeAngularVelocity( bodies[ 'cylinderO' ].body );
		randomizeAngularVelocity( bodies[ 'boxSlash' ].body );
		randomizeAngularVelocity( bodies[ 'boxI' ].body );

	}

	function setPositions() {

		var y = 1;

		var e = new THREE.Euler();
		e.set( 0, 0, 0);
		var q = new THREE.Quaternion();
		q.setFromEuler( e );

		bodies[ 'cylinderO' ].resetPosition();
		bodies[ 'cylinderO' ].body.setQuaternion( q );
		bodies[ 'cylinderO' ].body.position.set( .7, y, 0 );

		var e = new THREE.Euler();
		e.set( -Math.PI / 2, 0, - 13 * Math.PI / 180 );
		var q = new THREE.Quaternion();
		q.setFromEuler( e );

		bodies[ 'boxSlash' ].resetPosition();
		bodies[ 'boxSlash' ].body.setQuaternion( q );
		bodies[ 'boxSlash' ].body.position.set( -.3, y, 0 );

		var e = new THREE.Euler();
		e.set( -Math.PI / 2, 0, 0 );
		var q = new THREE.Quaternion();
		q.setFromEuler( e );

		bodies[ 'boxI' ].resetPosition();
		bodies[ 'boxI' ].body.setQuaternion( q );
		bodies[ 'boxI' ].body.position.set( -1., y, 0 );

	}

	var mute = false;
	document.getElementById( 'mute-button' ).addEventListener( 'click', function( e ) {

		mute = !mute;
		mainGain.gain.exponentialRampToValueAtTime( mute?0.001:1., context.currentTime + 1 )

		e.preventDefault();
		return false;
	} );

	document.getElementById( 'x-button' ).addEventListener( 'click', function( e ) {
		setPositions();
		e.preventDefault();
		return false;
	} );

	document.getElementById( 'c-button' ).addEventListener( 'click', function( e ) {
		nextCamera();
		e.preventDefault();
		return false;
	} );

	document.getElementById( 'space-button' ).addEventListener( 'click', function( e ) {
		jumbleScene();
		e.preventDefault();
		return false;
	} );

	document.addEventListener( 'keydown', function( e ) {

		if( e.keyCode === 32 ) {
			jumbleScene();
		}
		if( e.keyCode == 88 ) {
			setPositions();
		}
		if( e.keyCode == 67 ) {
			nextCamera();
		}
	} );

	window.addEventListener( 'deviceorientation', function(event) {

		if( event.gamma === null || event.beta === null ) return;

		var lr = event.gamma;
		var fb = event.beta - 45;
		var dir = event.alpha;

		var y = Math.sin( fb*Math.PI/180)*Math.cos( lr*Math.PI/180),
			x = Math.sin( lr*Math.PI/180),
			//ang = -Math.atan(x/y) + (y < 0? Math.PI : 0) + Math.PI/2,
			r = Math.sqrt(x*x+y*y);

		world.gravity.set( x * gravity, -gravity, y * gravity );

	}, true);

	function checkCollision( id ) {

		if( bodies[ id ].body.numContacts > bodies[ id ].currentContacts ) playSound( bodies[ id ].audioBuffer );
		bodies[ id ].currentContacts = bodies[ id ].body.numContacts;

	}

	function oimoLoop() {

		world.step();

		cylinderO.position.copy( bodies[ 'cylinderO' ].body.getPosition() );
		cylinderO.quaternion.copy( bodies[ 'cylinderO' ].body.getQuaternion() );

		boxI.position.copy( bodies[ 'boxI' ].body.getPosition() );
		boxI.quaternion.copy( bodies[ 'boxI' ].body.getQuaternion() );

		boxSlash.position.copy( bodies[ 'boxSlash' ].body.getPosition() );
		boxSlash.quaternion.copy( bodies[ 'boxSlash' ].body.getQuaternion() );

		checkCollision( 'cylinderO' );
		checkCollision( 'boxI' );
		checkCollision( 'boxSlash' );

		bodies[ 'boxI' ].body.sleepTime = 0;
		bodies[ 'boxSlash' ].body.sleepTime = 0;
		bodies[ 'cylinderO' ].body.sleepTime = 0;

	}

	composer = new WAGNER.Composer( renderer, { useRGBA: true } );
	bloomPass = new WAGNER.MultiPassBloomPass();
	bloomPass.params.blurAmount = 1;
	vignettePass = new WAGNER.VignettePass();
	vignettePass.params.amount = .5;
	chromaticAberrationPass = new WAGNER.ChromaticAberrationPass();
	fxaaPass = new WAGNER.FXAAPass();

	materials = [
		floorPlane.material,
		wallAPlane.material,
		wallBPlane.material,
		wallCPlane.material,
		wallDPlane.material,
		ceilingPlane.material,
		cylinderO.material,
		boxI.material,
		boxSlash.material
	];

	container.appendChild( renderer.domElement );

	//controls = new THREE.OrbitControls( camera, renderer.domElement );

	window.addEventListener( 'resize', onWindowResized );
	onWindowResized( null );

	container.addEventListener( 'mousedown', onDocumentClick, false );
	container.addEventListener( 'touchstart', onDocumentClick, false );

	animate();

}

function showMessage( msg ) {

	message.textContent = msg;

}

function onWindowResized( event ) {

	renderer.setSize( container.clientWidth, container.clientHeight );
	camera.aspect = container.clientWidth / container.clientHeight;
	camera.updateProjectionMatrix();
	composer.setSize( renderer.domElement.width, renderer.domElement.height );

}

function animate() {

	requestAnimationFrame( animate );
	render();

}

var tmpMatrix = new THREE.Matrix4();
var materials = [];

function applyMatricesToUniforms( uniform, matrix ) {

	tmpMatrix.getInverse( matrix );

	materials.forEach( function( m ) {
		m.uniforms[ uniform ].value.copy( tmpMatrix );
	} );

}

function render() {

	applyMatricesToUniforms( 'floorInverseMatrix', floor.matrixWorld );
	applyMatricesToUniforms( 'wallAInverseMatrix', wallA.matrixWorld );
	applyMatricesToUniforms( 'wallBInverseMatrix', wallB.matrixWorld );
	applyMatricesToUniforms( 'wallCInverseMatrix', wallC.matrixWorld );
	applyMatricesToUniforms( 'wallDInverseMatrix', wallD.matrixWorld );
	applyMatricesToUniforms( 'ceilingInverseMatrix', ceiling.matrixWorld );
	applyMatricesToUniforms( 'cylinderInverseMatrix', cylinderO.matrixWorld );
	applyMatricesToUniforms( 'boxInverseMatrix', boxI.matrixWorld );
	applyMatricesToUniforms( 'slashInverseMatrix', boxSlash.matrixWorld );

	materials.forEach( function( m ) {
		m.uniforms.cylinderPosition.value.copy( cylinderO.position );
	} );

	//controls.update();
	//renderer.render( scene, camera );

	composer.reset();
	composer.render( scene, camera );
	composer.pass( fxaaPass );
	composer.pass( vignettePass );
	composer.pass( bloomPass );
	//composer.pass( chromaticAberrationPass );
	composer.toScreen();

}

var cameraPositions = [
	{
		origin: new THREE.Vector3( 0, 4, 1 ),
		lookAt: new THREE.Vector3( 0 )
	},
	{
		origin: new THREE.Vector3( 2.847499589556643, -1.2095188299539308, 1.8409447284837344 ),
		lookAt: new THREE.Vector3( 0.1619272069957919, -1.5959034260063476, 0.10468800274180118 )
	},
	{
		origin: new THREE.Vector3( 2.964872902102171, -1.7758767680513818, -1.2313743912141708 ),
		lookAt: new THREE.Vector3( -0.2803237197592953, -0.6231859963261481, -0.18243679721304457 )
	},
	{
		origin: new THREE.Vector3( -1.3976412342700433, 2.4430671284433236, 1.702292235233202 ),
		lookAt: new THREE.Vector3( -0.2803237197592953, -0.6231859963261481, -0.18243679721304457 )
	},
	{
		origin: new THREE.Vector3( -2.9711787271833594, -1.7210012201454323, -0.17783452736692656 ),
		lookAt: new THREE.Vector3( -0.4714137271906491, -0.8527503525019438, -0.20078009650472955 )
	},
];

var currentCamera = 0;

function nextCamera() {

	currentCamera++;
	currentCamera %= cameraPositions.length;
	camera.position.copy( cameraPositions[ currentCamera ].origin );
	camera.lookAt( cameraPositions[ currentCamera ].lookAt );

}
