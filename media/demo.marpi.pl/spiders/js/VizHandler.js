//VizHandler
//Handle 3D world
var VizHandler = function () {

    var rendertime = 0; //constantly incrementing value public
    var camera, scene, renderer, controls, fullscreen = false;
    var cubeCameraRead, cubeCameraWrite;
    var debugCube;
    var renderToggle = true;
    var mobile

    var FIXED_SIZE_W = 1280;
    var FIXED_SIZE_H = 800;

    var BG_COLOR = 0xFFFFFF;
    var directionalLight;

    function init() {

        var id = parseInt(window.location.hash.substr(1))
        if (!id)
            id = 1
        ControlsHandler.fxParams.song = id;

        //EVENT HANDLERS
        events.on("update", update);

        // var container = document.getElementById('viz')
        //document.body.appendChild(container);

        container = document.createElement('div');
        document.body.appendChild(container);

        //RENDERER
        renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        renderer.setSize(FIXED_SIZE_W, FIXED_SIZE_H);
        renderer.setClearColor(BG_COLOR);
        renderer.shadowMap.enabled = true;
        //renderer.shadowMap.autoUpdate = false;
        //renderer.shadowMap.needsUpdate = true;
        //renderer.autoClear = false;

        //renderer.shadowMap.type = THREE.PCFShadowMap;
        renderer.gammaInput = true;
        renderer.gammaOutput = true;
        //renderer.sortObjects = false;
        container.appendChild(renderer.domElement);

        scene = new THREE.Scene();
        //3D SCENE
        //camera = new THREE.PerspectiveCamera( 70, 800 / 600, 50, 30000 );
        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, .1, 2000);
        camera.position.z = 200;
        camera.position.y = 200;
        //scene.add(camera);

        //scene.fog = new THREE.Fog(BG_COLOR, 1, 3);

        //controls = new THREE.TrackballControls(camera);
        controls = new THREE.OrbitControls(camera);
        controls.target.set(0, 0, 0);
        controls.update();
        controls.autoRotate = false;
        controls.enablePan = false
        //controls.enableZoom = false
        controls.enableRotate = true
        controls.enableDamping = true;
        controls.dampingFactor = .2;
        controls.rotateSpeed = .15;
        //controls.autoRotateSpeed = (Math.random() * .5 - .25) / 7;
        //controls.minDistance = 3;
        //controls.maxDistance = 3;
        //controls.maxPolarAngle = Math.PI / 2 + .4;
        controls.maxPolarAngle = Math.PI / 2;

        Assets.init();

        directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
        directionalLight.position.x = -.1
        directionalLight.position.z = -.3
        directionalLight.position.y = 1
        //directionalLight.shadowCameraVisible=true
        directionalLight.castShadow = true;
        //directionalLight.shadowDarkness = .1
        var roz = 170
        directionalLight.shadow.camera.near = -roz * 2
        directionalLight.shadow.camera.far = roz * 2
        directionalLight.shadow.camera.left = -roz
        directionalLight.shadow.camera.right = roz
        directionalLight.shadow.camera.top = roz
        directionalLight.shadow.camera.bottom = -roz
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.bias = 0//-0.001//0//-0.001

        //scene.add(new THREE.CameraHelper(directionalLight.shadow.camera))

        //scene.add(new THREE.AmbientLight(0x777777));

        hemiLight = new THREE.HemisphereLight(0xffffff, 0x666666, 0.6);
        hemiLight.color.setHSL(0.6, 1, 0.8);
        hemiLight.groundColor.setHSL(0.095, 1, 0.9);
        hemiLight.position.set(0, 10, 0);
        //scene.add(hemiLight);

        var helper = new THREE.CameraHelper(directionalLight.shadow.camera);
        //scene.add(helper);

        //directionalLight.position.set(1, 1, .65);
        scene.add(directionalLight);

        activeViz = [Mecha];

        activeVizCount = activeViz.length;
        for (var j = 0; j < activeVizCount; j++) {
            activeViz[j].init();
        }

        //window.addEventListener('deviceorientation', setOrientationControls, true);

    }

    function remake() {
        for (var j = 0; j < activeVizCount; j++) {
            activeViz[j].reload();
        }
        controls.autoRotateSpeed = Math.random() * .5 - .25
        TweenMax.delayedCall(5, remake)
    }

    function setOrientationControls(e) {
        if (!e.alpha) {
            return;
        }

        controls.enabled = false
        controls = new THREE.DeviceOrientationControls(camera, true);
        controls.connect();
        controls.update();

        window.removeEventListener('deviceorientation', setOrientationControls, true);

        if (renderer.domElement) {
            renderer.domElement.addEventListener('click', function () {

                if (this.requestFullscreen) {
                    this.requestFullscreen();
                } else if (this.msRequestFullscreen) {
                    this.msRequestFullscreen();
                } else if (this.mozRequestFullScreen) {
                    this.mozRequestFullScreen();
                } else if (this.webkitRequestFullscreen) {
                    this.webkitRequestFullscreen();
                }
                fullscreen = true;

            });

            mobile = true;

        }
    }

    function update() {
        controls.update();

        if (mobile) {
            camera.position.set(0, 0, 0)
            camera.translateZ(1.8);
        }
    }


    function onResize() {

        var renderW = FIXED_SIZE_W;
        var renderH = FIXED_SIZE_H;

        if (ControlsHandler.vizParams.fullSize) {
            var renderW = window.innerWidth;
            var renderH = window.innerHeight;

            if (ControlsHandler.vizParams.showControls) {
                renderW -= 250;
            }
            $('#viz').css({position: 'relative', top: 0});

        } else {
            //vertically center viz output
            $('#viz').css({position: 'relative', top: window.innerHeight / 2 - FIXED_SIZE_H / 2});
        }

        camera.aspect = renderW / renderH;
        camera.updateProjectionMatrix();
        renderer.setSize(renderW, renderH);

    }

    return {
        init: init,
        update: update,
        getCamera: function () {
            return camera;
        },
        getScene: function () {
            return scene;
        },
        getLight: function () {
            return directionalLight;
        },
        getRenderer: function () {
            return renderer;
        },
        getCubeCameras: function () {
            return [cubeCameraRead, cubeCameraWrite]
        },
        getControls: function () {
            return controls;
        },
        onResize: onResize,
        isFullscreen: function () {
            return fullscreen;
        },
        isMobile: function () {
            return mobile;
        }
    };

}();