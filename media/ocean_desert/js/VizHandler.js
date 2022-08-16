var VizHandler = function () {

    var camera, scene, renderer, controls, fullscreen = false;
    var mobile;
    var directionalLight;
    var lights = [];
    var usePointLights = false;
    var useDirectionalLights = !usePointLights;
    var resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
    var postEnabled = false//!isMobile.any;
    var vizParams = {intensity: 0, lightHue: 0, lightMod: 0, tint: 0}
    var timeAddon = 0;
    var sunrise = {y: 1};
    var mod = 0;
    var number, ambient

    var target = {offset: 70, multiplier: 0}

    var baseFBO, shiftFBO, tiltShiftFBO, shiftShader, tiltShiftShader, finalShader, orthoScene, orthoCamera, orthoQuad;
    var mode = 1;

    var oceanAudio = document.getElementById("ocean")
    var desertAudio = document.getElementById("desert")

    var fog;
    var transitioning = false;

    var firstIntro = true;
    var introCamMod = 0;

    function init() {

        var id = parseInt(window.location.hash.substr(1))
        if (!id)
            id = 1

        events.on("update", update);
        // var container = document.getElementById('viz')
        //document.body.appendChild(container);

        container = document.createElement('div');
        document.body.appendChild(container);
        //RENDERER

        renderer = new THREE.WebGLRenderer({antialias: true});
        //if (isMobile.any)
        //    renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0xFFFFFF)
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap //BasicShadowMap // default THREE.PCFShadowMap
        document.body.appendChild(renderer.domElement);
        //renderer.sortObjects = false;
        container.appendChild(renderer.domElement);
        scene = new THREE.Scene();
        //3D SCENE
        //camera = new THREE.PerspectiveCamera( 70, 800 / 600, 50, 30000 );
        camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 100, 5000);
        camera.position.z = 1060;
        camera.position.y = 350;
        //scene.add(camera);

        //controls = new THREE.TrackballControls(camera);
        controls = new THREE.OrbitControls(camera);
        controls.target.set(0, 0, 0);
        //controls.enabled = false;
        controls.autoRotate = true;
        controls.enablePan = false;
        controls.enableZoom = false;
        //controls.minZoom = 2
        //controls.maxZoom = 2
        //controls.enableRotate = false
        controls.enableDamping = true;
        controls.dampingFactor = .2;
        controls.rotateSpeed = .15;
        controls.autoRotateSpeed = .05;
        //controls.minDistance = 3;
        //controls.maxDistance = 3;
        controls.minPolarAngle = Math.PI / 2 - 1
        //controls.maxPolarAngle = Math.PI;
        controls.maxPolarAngle = Math.PI / 2 - 0.5;
        //Assets.init();
        var hue = Math.random()
        fog = new THREE.Fog(new THREE.Color().setHSL(hue, .5, 1), -500, 500)
        fog.hue = hue;
        fog.saturation = .5;
        fog.lightness = 1;
        scene.fog = fog

        var lightsNum = 1
        var lightness = 1
        /*if (isMobile.any) {
         lightsNum = 1
         lightness = 2
         }*/
        ambient = new THREE.AmbientLight(0xaaaaaa)
        scene.add(ambient)

        if (useDirectionalLights) {
            var c = new THREE.Color()
            //c.setHSL(i / 10, 1, .7)
            directionalLight = new THREE.DirectionalLight(new THREE.Color().setHSL(Math.random(), .7, .5), lightness);
            directionalLight.position.x = -.6
            directionalLight.position.z = .3
            directionalLight.position.y = 1
            directionalLightOrg.copy(directionalLight.position)
            directionalLight.hue = hue;
            directionalLight.saturation = .5;
            directionalLight.lightness = 1;

            directionalLight.castShadow = true;
            //directionalLight.shadowDarkness = .1
            var roz = 200
            directionalLight.shadow.camera.near = -roz * 2
            directionalLight.shadow.camera.far = roz * 20
            directionalLight.shadow.camera.left = -roz * 2
            directionalLight.shadow.camera.right = roz * 2
            directionalLight.shadow.camera.top = roz * 2
            directionalLight.shadow.camera.bottom = -roz * 2
            directionalLight.shadow.mapSize.width = 1024;
            directionalLight.shadow.mapSize.height = 1024;
            directionalLight.shadow.bias = 0//-0.0001
            scene.add(directionalLight);
            lights.push(directionalLight)

            //var helper=new THREE.CameraHelper( directionalLight.shadow.camera )
            //scene.add(helper)

        }
        if (usePointLights) {
            var geom = new THREE.BoxGeometry(1, 1, 1)
            for (var i = 0; i < 2; i++) {
                var c = new THREE.Color()
                var light = new THREE.PointLight(c, 1, 7000);
                light.castShadow = true;
                light.shadow.bias = 0.1;
                light.shadow.mapSize.width = 1024;
                light.shadow.mapSize.height = 1024;
                //scene.add(light);

                var sphere = new THREE.Mesh(geom, new THREE.MeshBasicMaterial({color: c}))
                sphere.add(light)
                scene.add(sphere)

                lights.push(sphere)
            }
        }
        //scene.add(new THREE.CameraHelper(directionalLight.shadow.camera))

        //scene.add(new THREE.AmbientLight(0x333126));

        //var hemiLight = new THREE.HemisphereLight(0, 0xffffff, .3);
        //hemiLight.color.setHSL(0.6, 1, 0.6);
        //hemiLight.groundColor.setHSL(0.095, 1, 0.75);
        //scene.add(hemiLight);

        //var helper = new THREE.CameraHelper(directionalLight.shadow.camera);
        //scene.add(helper);

        activeViz = [Shards, Mecha, Birds, Forest]//MechaMerged,, MechaMerged,//Shards, Titles,  Mecha, SequencerVisual, Forest

        activeVizCount = activeViz.length;
        for (var j = 0; j < activeVizCount; j++) {
            activeViz[j].init(mode);
        }


        //window.addEventListener('deviceorientation', setOrientationControls, true);

        if (postEnabled)
            initPostprocessing()

        window.requestAnimationFrame(dayNight);
    }

    function show(name) {
        number = {random: new Math.seedrandom(name)};
        mod = number.random()
    }

    function initPostprocessing() {
        /*// Setup render pass
         var renderPass = new THREE.RenderPass(scene, camera);
         effectComposer = new THREE.EffectComposer(renderer);
         
         // Setup depth pass
         depthMaterial = new THREE.MeshDepthMaterial();
         depthMaterial.depthPacking = THREE.RGBADepthPacking;
         depthMaterial.side = THREE.DoubleSide
         depthMaterial.blending = THREE.NoBlending;
         depthMaterial.skinning = true
         
         var pars = {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false};
         depthRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, pars);
         
         // Setup Anti Aliasing pass
         //msaaRenderPass = new THREE.ManualMSAARenderPass(scene, camera);
         //msaaRenderPass.unbiased = false;
         //msaaRenderPass.sampleLevel = 2;
         
         // Setup Ambient Occlusion pass
         ssaoPass = new THREE.ShaderPass(THREE.SSAOShader);
         ssaoPass.renderToScreen = true;
         ssaoPass.uniforms[ 'tDepth' ].value = depthRenderTarget.texture;
         ssaoPass.uniforms[ 'size' ].value.set(window.innerWidth, window.innerHeight);
         ssaoPass.uniforms[ 'cameraNear' ].value = camera.near;
         ssaoPass.uniforms[ 'cameraFar' ].value = camera.far;
         ssaoPass.uniforms[ 'onlyAO' ].value = false;
         ssaoPass.uniforms[ 'aoClamp' ].value = 1.0;
         ssaoPass.uniforms[ 'lumInfluence' ].value = 0.7;
         
         effectComposer.addPass(renderPass);
         // effectComposer.addPass(msaaRenderPass);
         effectComposer.addPass(ssaoPass);*/

        baseFBO = createRenderTarget();
        shiftFBO = createRenderTarget();
        tiltShiftFBO = createRenderTarget();
        shiftShader = new THREE.RawShaderMaterial({
            uniforms: {
                inputTexture: {type: 't', value: baseFBO.texture},
                pixelRatio: {type: 'f', value: window.devicePixelRatio},
                resolution: {type: 'v2', value: resolution},
            },
            vertexShader: document.getElementById('ortho-vs').textContent,
            fragmentShader: document.getElementById('shift-fs').textContent,
        });
        tiltShiftShader = new THREE.RawShaderMaterial({
            uniforms: {
                inputTexture: {type: 't', value: shiftFBO.texture},
                resolution: {type: 'v2', value: new THREE.Vector2()},
                blur: {type: 'f', value: 1},
            },
            vertexShader: document.getElementById('ortho-vs').textContent,
            fragmentShader: document.getElementById('tilt-shift-fs').textContent,
        });
        finalShader = new THREE.RawShaderMaterial({
            uniforms: {
                inputTexture: {type: 't', value: tiltShiftFBO.texture},
                resolution: {type: 'v2', value: resolution},
                pixelRatio: {type: 'f', value: window.devicePixelRatio},
                boost: {type: 'f', value: 1.3},
                reduction: {type: 'f', value: .9},
                amount: {type: 'f', value: .05},
                time: {type: 'f', value: 0}
            },
            vertexShader: document.getElementById('ortho-vs').textContent,
            fragmentShader: document.getElementById('final-fs').textContent,
        });
        orthoScene = new THREE.Scene();
        orthoCamera = new THREE.OrthographicCamera(1 / -2, 1 / 2, 1 / 2, 1 / -2, .00001, 1000);
        orthoQuad = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1), finalShader);
        orthoScene.add(orthoQuad);
    }
    function createRenderTarget() {

        return new THREE.WebGLRenderTarget(1, 1, {
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping,
            format: THREE.RGBAFormat,
            stencilBuffer: false,
            depthBuffer: true
        });
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

    function animateCamera(up) {
        if (up) {
//TweenLite.to(targetAddon, .5 * 60, {y: 600, useFrames: true})
//TweenLite.to(camera.position, .5 * 60, {x: 0, z: 760, y: 250, useFrames: true})
            TweenLite.to(lights[0], .45, {delay: .4, intensity: 0})
            if (lights[1])
                TweenLite.to(lights[1], .45, {delay: .4, intensity: 0})
            TweenLite.to(sunrise, .9, {y: 0, intensity: 0})
        } else {
//TweenLite.to(targetAddon, .5 * 60, {y: 0, useFrames: true})
//TweenLite.to(camera.position, .5 * 60, {x: 0, z: 760, y: 250, useFrames: true})
            TweenLite.to(lights[0], 1 * 60, {intensity: 1, useFrames: true})
            if (lights[1])
                TweenLite.to(lights[1], 1 * 60, {intensity: 1, useFrames: true})
            TweenLite.to(sunrise, .85 * 60, {y: 1, useFrames: true})
        }
    }

    function zoomOut() {
        //console.log(camera)
        //var time = 0
        ///TweenLite.to(camera.position, time, {delay: 1, z: 1060, y: 350, ease: Expo.easeInOut, onComplete: function () {
        //        controls.enabled = true
        //    }})
        //TweenLite.to(controls, time, {delay: 1, maxPolarAngle: Math.PI / 2 - 0.2, ease: Expo.easeInOut})
    }

    function dayNight() {

        if (transitioning)
            return;
        transitioning = true;
        //TweenLite.to(directionalLight.color, 1, {r: .2, g: .2, b: 1})
        //TweenLite.to(crystal.scale, .3, {x: 0.01, y: 0.01, z: 0.01, ease: Back.easeIn})
        /*var num = Math.floor(Math.random() * 5) + 1
         var place = "desert";
         if (VizHandler.getMode() == 1)
         place = "underwater"
         var sound = new Audio('music/pling_' + place + num + '.mp3');
         sound.play();*/

        Mecha.hideCrystals();
        //TweenLite.to(directionalLight, 1, {intensity: 0})
        TweenLite.to(ambient, 1, {intensity: 0})
        TweenLite.to(directionalLight.position, 1, {x: -.7, z: .4})
        TweenLite.delayedCall(1, regenerate)
        TweenLite.to(fog, 1, {near: -500, far: 500, hue: Math.random(), onUpdate: updateFog})
        //console.log(fog)
    }

    function updateFog() {
        fog.color = new THREE.Color().setHSL(fog.hue, fog.saturation, fog.lightness)
    }

    function regenerate() {

        number = {random: new Math.seedrandom(track)};
        var track = Math.random();
        Forest.rebuild(number.random());
        Shards.reload(ground, ground2);
        var faunaPerc = Math.random()

        Birds.initBoids(1 - faunaPerc);
        Mecha.removeAll();
        var ground = number.random();
        var ground2 = number.random();
        Mecha.setColors(ground, ground2);

        var max = 60 * faunaPerc
        if (isMobile.phone)
            max = 45 * faunaPerc

        for (var i = 0; i < max; i++) {
            var roz = 700
            var id = number.random()
            Mecha.spawn((number.random() - .5) * roz, 0, (number.random() - .5) * roz, id);
        }
        VizHandler.show(track);
        VizHandler.zoomOut();

        if (oceanAudio.paused && location.hash.substr(1)=="") {
            introCamMod = 130;
        } else {
            introCamMod = 0;
        }

        mode = 1 - mode;

        window.requestAnimationFrame(animateOut);
    }

    function animateOut() {
        var delay = 0;
        if (firstIntro) {
            delay = 1;
        }

        directionalLightMod.x = 0
        directionalLightMod.z = 0

        var perc = mode;
        TweenLite.to(oceanAudio, 1, {volume: perc})
        TweenLite.to(desertAudio, 1, {volume: 1 - perc})
        TweenLite.to(ambient, 1, {intensity: 1})
        if (!oceanAudio.paused || !firstIntro || location.hash.substr(1)!="") {
            if (mode == 1) {
                TweenLite.to(target, .1, {multiplier: 1})
                TweenLite.to(directionalLight, 1, {intensity: 1, hue: Math.random(), saturation: .7, lightness: .5, onUpdate: updateLight})
                TweenLite.to(directionalLightOrg, 1, {x: -.7, z: .4})
                TweenLite.to(fog, 1, {near: 900, far: 2000, hue: Math.random(), saturation: .5, lightness: .7, onUpdate: updateFog, onComplete: function () {
                        transitioning = false
                    }})
            } else {
                TweenLite.to(target, .1, {multiplier: .3})
                TweenLite.to(directionalLight, 1 + delay, {intensity: 1, hue: Math.random(), saturation: .5, lightness: .8, onUpdate: updateLight})
                TweenLite.to(directionalLightOrg, 1 + delay, {x: -.6, z: .3})
                TweenLite.to(fog, 1 + delay * 2, {delay: delay, near: 1000, far: 2200, hue: Math.random(), saturation: .5, lightness: .7, onUpdate: updateFog, onComplete: function () {
                        transitioning = false
                    }})
            }
        } else {
            transitioning = false
            mode = 1 - mode;
        }

        firstIntro = false;
    }

    function updateLight() {
        directionalLight.color = new THREE.Color().setHSL(directionalLight.hue, directionalLight.saturation, directionalLight.lightness)
        //console.log(directionalLight.color)
    }

    var directionalLightMod = new THREE.Vector3();
    var directionalLightOrg = new THREE.Vector3();

    function update() {
        var time = Date.now() * 0.0001

        directionalLight.position.copy(directionalLightOrg)
        if (mode == 1) {
            directionalLightMod.x = Math.sin(time * 5 + 2.4) * .3;
            directionalLightMod.z = Math.sin(time * 5 * 1.3) * .3;
            directionalLight.position.x += Math.floor(256 * directionalLightMod.x) / 256
            directionalLight.position.z += Math.floor(256 * directionalLightMod.z) / 256
        }


//camera.position.z = 560 * (.6 + .40 * Math.sin(time * 2.7));
//camera.position.y = 480 * (.7 + .30 * Math.sin(time * 4.5));

//controls.target.y = -80 * (.7 + .30 * Math.sin(time * 4.5));

        controls.autoRotateSpeed = Math.sin(time) / 40 * target.multiplier;
        controls.target.set(Math.sin(time) * 10 * target.multiplier, Math.sin(time * 2.12) * 10 * target.multiplier + 20 - 70 + introCamMod, Math.sin(time * 1.245 + 2) * 10 * target.multiplier)
        camera.lookAt(controls.target)
        controls.update();
        /*if (Math.random() < vizParams.intensity * .15) {
         timeAddon = Math.random()
         TweenLite.to(vizParams, 0, {lightMod: Math.random()})
         TweenLite.to(vizParams, 1, {lightMod: 0})
         }*/

        /*var s = .9 * (1 - vizParams.intensity) + .1 * vizParams.tint
         var l = .8 - .05 * vizParams.tint
         l *= 1 - vizParams.intensity * vizParams.lightMod;
         
         lights[0].color.setHSL(vizParams.lightHue, s, l)
         if (lights[1])
         lights[1].color.setHSL(vizParams.lightHue - .1, s, l)*/

        if (postEnabled) {
            tiltShiftShader.uniforms.blur.value = 1 + vizParams.tint;
            finalShader.uniforms.amount.value = 0.05 + vizParams.intensity * .05
            finalShader.uniforms.boost.value = 1.3 + vizParams.intensity * .6
            finalShader.uniforms.reduction.value = 1.3 + vizParams.intensity * 1
        }


        var time = Date.now() * 0.0001// + timeAddon * Math.PI * 2;
        var pos = camera.position.clone().normalize()
        //pos.x = 0
        //pos.z/=2
        for (var i = 0; i < lights.length; i++) {
            var light = lights[i]
            //light.position.copy(pos)

        }


        if (!postEnabled) {
            renderer.render(scene, camera);
            /*scene.overrideMaterial = depthMaterial;
             renderer.render(scene, camera, depthRenderTarget, true);
             scene.overrideMaterial = null;
             effectComposer.render();*/
        } else {
            renderer.render(scene, camera, baseFBO);
            orthoQuad.material = shiftShader;
            renderer.render(orthoScene, orthoCamera, shiftFBO);
            orthoQuad.material = tiltShiftShader;
            renderer.render(orthoScene, orthoCamera, tiltShiftFBO);
            finalShader.uniforms.time.value = 0.00001 * performance.now();
            orthoQuad.material = finalShader;
            renderer.render(orthoScene, orthoCamera);
        }
        /*if (useDirectionalLights) {
         
         var roz = camera.position.distanceTo(scene.position) * .15;
         directionalLight.shadow.camera.near = -roz * 2
         directionalLight.shadow.camera.far = roz * 2
         directionalLight.shadow.camera.left = -roz
         directionalLight.shadow.camera.right = roz
         directionalLight.shadow.camera.top = roz
         directionalLight.shadow.camera.bottom = -roz
         directionalLight.shadow.camera.updateProjectionMatrix()
         }*/

        /*var screenNum=3;
         var width=window.innerWidth
         var height=window.innerHeight
         for (var i = 0; i < screenNum; i++) {
         renderer.setViewport(i * width / screenNum, 0, width / screenNum + 1, height);
         
         //camera.position.set(cameraPosition.x + cameraDiff.x, cameraPosition.y + cameraDiff.y, cameraPosition.z + cameraDiff.z)
         
         renderer.render(scene, camera);
         
         }*/

//renderer.render(scene, camera);
    }


    function onResize() {

        /*camera.aspect = window.innerWidth / window.innerHeight;
         camera.updateProjectionMatrix();
         
         renderer.setSize(window.innerWidth, window.innerHeight);*/

        var w = window.innerWidth;
        var h = window.innerHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        if (postEnabled) {
            var dPR = window.devicePixelRatio;
            resolution.set(w * dPR, h * dPR);
            baseFBO.setSize(w * dPR, h * dPR);
            shiftFBO.setSize(w * dPR, h * dPR);
            tiltShiftFBO.setSize(w * dPR, h * dPR);
            orthoQuad.scale.set(w, h, 1);
            orthoCamera.left = -w / 2;
            orthoCamera.right = w / 2;
            orthoCamera.top = h / 2;
            orthoCamera.bottom = -h / 2;
            orthoCamera.updateProjectionMatrix();
        }
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
        },
        setLightColors: function (r) {
            TweenLite.to(vizParams, 0, {lightHue: r})
        },
        setIntensity: function (r) {
            TweenLite.to(vizParams, 0, {intensity: r})
        },
        setColors: function (r) {
            TweenLite.to(vizParams, 0, {tint: r})
        },
        animateCamera: animateCamera,
        show: show,
        zoomOut: zoomOut,
        dayNight: dayNight,
        getMode: function () {
            return mode;
        },
        playMusic: function () {
            oceanAudio.play();
            desertAudio.play();
        }
    };
}();