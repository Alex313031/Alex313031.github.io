var FXHandler = function () {

    var shaderTime = 0;
    var screenW = 1280;
    var screenH = 720;
    var blurriness = 3;
    var effects = false;
    var nuts = false;
    var bloomPass;
    var hblurPass = null;
    var vblurPass = null;
    var copyPass = null;
    var renderTarget2 = null;
    var glowComposer = null;
    var composer = null;
    var blendPass = null;
    var badTVPass = null;
    var mirrorPass = null;
    var dotScreenPass = null;
    var rgbPass = null;
    var smaaPass = null;
    var depthMaterial, depthRenderTarget;
    var msaaPass = null
    var effect;
    var scene, renderer, camera, controls, vrControls
    var controller1, controller2, material, geom, bubbles = []
    var material, geoms = []
    var group = new THREE.Group()

    function init() {
        controls = VizHandler.getControls();
        scene = VizHandler.getScene();
        renderer = VizHandler.getRenderer();
        camera = VizHandler.getCamera();

        //EVENT HANDLERS
        events.on("update", update);
        events.on("onBeat", onBeat);

        setup()
        initPostprocessing()
    }

    function setup() {
        /*renderTarget = null;
         renderComposer = null;
         renderPass = null;
         copyPass = null;
         bloomPass = null;
         hblurPass = null;
         vblurPass = null;
         copyPass = null;
         renderTarget2 = null;
         glowComposer = null;
         composer = null;
         blendPass = null;
         badTVPass = null;
         mirrorPass = null;
         dotScreenPass = null;
         rgbPass = null;
         smaaPass = null;
         msaaPass = null;
         
         effects = null;
         nuts = null;
         
         effects = ControlsHandler.fxParams.effects;
         nuts = ControlsHandler.fxParams.nuts;
         // POST PROCESSING
         //common render target params
         var renderTargetParameters = {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBufer: false};
         
         //BLEND COMP - COMBINE 1st 2 PASSES
         composer = new THREE.EffectComposer(renderer, new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
         minFilter: THREE.LinearFilter,
         magFilter: THREE.LinearFilter,
         format: THREE.RGBAFormat,
         stencilBuffer: false
         }));
         renderPass = new THREE.RenderPass(scene, camera);
         composer.addPass(renderPass);
         
         // Setup depth pass
         depthMaterial = new THREE.MeshDepthMaterial();
         depthMaterial.depthPacking = THREE.RGBADepthPacking;
         depthMaterial.blending = THREE.NoBlending;
         depthMaterial.skinning = true;
         
         var pars = {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter};
         depthRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, pars);
         
         // Setup SSAO pass
         var ssaoPass = new THREE.ShaderPass(THREE.SSAOShader);
         //ssaoPass.renderToScreen = true;
         //ssaoPass.uniforms[ "tDiffuse" ].value will be set by ShaderPass
         ssaoPass.uniforms[ "tDepth" ].value = depthRenderTarget.texture;
         ssaoPass.uniforms[ 'size' ].value.set(window.innerWidth, window.innerHeight);
         ssaoPass.uniforms[ 'cameraNear' ].value = .1;
         ssaoPass.uniforms[ 'cameraFar' ].value = 2000;
         ssaoPass.uniforms[ 'onlyAO' ].value = false;
         ssaoPass.uniforms[ 'aoClamp' ].value = 0.3;
         ssaoPass.uniforms[ 'lumInfluence' ].value = 0.5;
         
         var tiltShiftPass = new THREE.ShaderPass(THREE.VerticalTiltShiftShader);
         tiltShiftPass.uniforms.focusPos.value = 0.5;
         tiltShiftPass.uniforms.amount.value = 0.0032;
         tiltShiftPass.uniforms.brightness.value = 0.65 * 0.9;
         
         smaaPass = new THREE.SMAAPass(window.innerWidth, window.innerHeight);
         
         msaaPass = new THREE.ManualMSAARenderPass(VizHandler.getScene(), VizHandler.getCamera());
         msaaPass.unbiased = false;
         msaaPass.sampleLevel = 2;
         
         rgbPass = new THREE.ShaderPass(THREE.RGBShiftShader);
         
         rgbPass.uniforms[ "angle" ].value = Math.PI * 2;
         rgbPass.uniforms[ "amount" ].value = 0.01;
         
         if (effects) {
         //composer.addPass(msaaPass);
         
         if (ControlsHandler.fxParams.ssao)
         composer.addPass(ssaoPass);
         
         
         if (ControlsHandler.fxParams.tilt)
         composer.addPass(tiltShiftPass)
         
         //composer.addPass(rgbPass);
         composer.addPass(smaaPass);
         }
         
         composer.passes[composer.passes.length - 1].renderToScreen = true;
         
         
         effect = new THREE.VREffect(renderer);
         
         vrControls = new THREE.VRControls(camera);
         vrControls.standing = true;
         
         if (WEBVR.isAvailable() === true) {
         document.body.appendChild(WEBVR.getButton(effect, switchControls));
         }*/

    }

    function initPostprocessing() {
        // Setup render pass
        var renderPass = new THREE.RenderPass(scene, camera);
        effectComposer = new THREE.EffectComposer(renderer);

        // Setup depth pass
        depthMaterial = new THREE.MeshDepthMaterial();
        depthMaterial.depthPacking = THREE.RGBADepthPacking;
        depthMaterial.blending = THREE.NoBlending;
        depthMaterial.skinning = true

        var pars = {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false};
        depthRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, pars);

        // Setup Anti Aliasing pass
        // Setup Ambient Occlusion pass
        ssaoPass = new THREE.ShaderPass(THREE.SSAOShader);
        ssaoPass.renderToScreen = true;
        ssaoPass.uniforms[ 'tDepth' ].value = depthRenderTarget.texture;
        ssaoPass.uniforms[ 'size' ].value.set(window.innerWidth, window.innerHeight);
        ssaoPass.uniforms[ 'cameraNear' ].value = camera.near;
        ssaoPass.uniforms[ 'cameraFar' ].value = camera.far;
        ssaoPass.uniforms[ 'onlyAO' ].value = true;
        ssaoPass.uniforms[ 'aoClamp' ].value = 1.0;
        ssaoPass.uniforms[ 'lumInfluence' ].value = 0.7;

        effectComposer.addPass(renderPass);
        // effectComposer.addPass(msaaRenderPass);
        effectComposer.addPass(ssaoPass);
    }

    function switchControls() {

        controls.autoRotate = false;
        controls.enabled = false;

        scene.add(group)
        group.position.y = -1.5

        controller1 = new THREE.ViveController(0);
        controller1.standingMatrix = vrControls.getStandingMatrix();
        controller1.userData.points = [new THREE.Vector3(), new THREE.Vector3()];
        controller1.userData.matrices = [new THREE.Matrix4(), new THREE.Matrix4()];
        controller1.prevPosition = new THREE.Vector3();
        controller1.prevPositionStatic = new THREE.Vector3();
        group.add(controller1);

        controller2 = new THREE.ViveController(1);
        controller2.standingMatrix = vrControls.getStandingMatrix();
        controller2.userData.points = [new THREE.Vector3(), new THREE.Vector3()];
        controller2.userData.matrices = [new THREE.Matrix4(), new THREE.Matrix4()];
        controller2.prevPosition = new THREE.Vector3();
        controller2.prevPositionStatic = new THREE.Vector3();
        group.add(controller2);


        /*var roz = 4
         var directionalLight=VizHandler.getLight()
         directionalLight.shadow.camera.near = -roz
         directionalLight.shadow.camera.far = roz * 5
         directionalLight.shadow.camera.left = -roz
         directionalLight.shadow.camera.right = roz
         directionalLight.shadow.camera.top = roz
         directionalLight.shadow.camera.bottom = -roz
         directionalLight.shadow.mapSize.width = 2048;
         directionalLight.shadow.mapSize.height = 2048;
         directionalLight.shadow.bias = 0//.001
         VizHandler.getRenderer().shadowMap.autoUpdate = true;*/

        var reflectionCube = Assets.getCubeMap(12)
        reflectionCube.format = THREE.RGBFormat;
        geom = new THREE.BoxGeometry(.2, .2, .2, 1, 1, 1)

        var shininess = 50, specular = 0xffffff, bumpScale = .055, shading = THREE.SmoothShading;
        var reflectionCube = Assets.getCubeMap(31)
        reflectionCube.format = THREE.RGBFormat;
        var roughness = .4;
        var metalness = .7;
        var diffuseColor = new THREE.Color(1, 1, 1);
        material = new THREE.MeshStandardMaterial({
            //skinning: true,
            bumpScale: bumpScale,
            color: diffuseColor,
            metalness: metalness,
            //fog: false,
            roughness: roughness,
            shading: THREE.FlatShading,
            envMap: reflectionCube,
            side: THREE.DoubleSide,
            //depthWrite:false,
            //depthTest:false,
            //blendEquation:THREE.MinEquation
        })

        var loader = new THREE.OBJLoader();
        loader.load('vr_controller_vive_1_5.obj', function (object) {

            var loader = new THREE.TextureLoader();

            var controller = object.children[ 0 ];
            controller.material = material
            controller.castShadow = true;
            controller.receiveShadow = true;

            controller1.add(controller);

            var controllerC = controller.clone()
            controllerC.material = material
            controllerC.castShadow = true;
            controllerC.receiveShadow = true;
            controller2.add(controllerC.clone());

        });

        onResize();
        effectUpdate()
        mobile = false;
    }

    function handleController(controller, id) {

        controller.update();

        if (controller.getButtonState('thumbpad')) {
        }

        if (controller.getButtonState('trigger')) {
            if (controller.prevPosition.distanceTo(controller.position) > .02) {
                var geo = geom.clone()
                if (true) {
                    var mod = .3
                    for (var i = 0; i < geo.vertices.length; i++) {
                        var v = geo.vertices[i]
                        v.x += (Math.random() - .5) * mod
                        v.y += (Math.random() - .5) * mod
                        v.z += (Math.random() - .5) * mod
                    }

                    geo.computeFaceNormals();
                    geo.computeVertexNormals();
                }
                bubble = new THREE.Mesh(geo, material);
                bubble.scale.set(.001, .001, .001)
                TweenMax.to(bubble.scale, .3, {x: Math.random() * 1, y: Math.random() * 1, z: Math.random() * 1})
                bubble.matrix = controller.matrix.clone()
                var pos = new THREE.Vector3();
                var q = new THREE.Quaternion();
                var s = new THREE.Vector3();
                bubble.matrix.decompose(pos, q, s)
                bubble.position.copy(pos)
                bubble.position.y -= 1.5
                bubble.castShadow = true
                bubble.receiveShadow = true
                scene.add(bubble);
                bubbles.push(bubble)
                if (bubbles.length > 100) {
                    var lastBubble = bubbles.shift()
                    TweenMax.to(lastBubble.scale, .3, {x: .001, y: .001, z: .001, onComplete: removeBubble, onCompleteParams: [lastBubble]})
                }
                controller.prevPosition.copy(controller.position)
            }


        } else {
        }

        controller.prevPositionStatic.copy(controller.position)


    }

    function removeBubble(bubble) {
        scene.remove(bubble)
    }

    function onBeat() {
        setTimeout(onBeatEnd, 300);
    }

    function onBeatEnd() {
    }

    function toggle() {
        setup()
    }

    function onResize() {
        /*var width = window.innerWidth;
         var height = window.innerHeight;
         
         var pixelRatio = renderer.getPixelRatio();
         var newWidth = Math.floor(width / pixelRatio) || 1;
         var newHeight = Math.floor(height / pixelRatio) || 1;
         if (composer)
         composer.setSize(newWidth, newHeight);
         
         if (vrControls) {
         effect.setSize(window.innerWidth, window.innerHeight);
         }*/

    }

    function effectUpdate() {
        if (vrControls)
            vrControls.update();

        if (controller1)
            handleController(controller1, 0);
        if (controller2)
            handleController(controller2, 1);

        camera.position.y -= 1.5
        effect.render(scene, camera);
        camera.position.y += 1.5
        /*renderer.setScissorTest( true );
         renderer.setViewport( 0, 0,renderer.getSize().width,renderer.getSize().height );
         renderer.setScissor( 0, 0, renderer.getSize().width,renderer.getSize().height );
         renderer.render(scene, camera);
         renderer.setScissorTest( false );*/

        effect.requestAnimationFrame(effectUpdate);
    }

    function update(t) {
        //renderer.render(scene, camera);
        //return;

        scene.overrideMaterial = depthMaterial;
        renderer.render(scene, camera, depthRenderTarget, true);
        scene.overrideMaterial = null;
        effectComposer.render();

        /*if (controller1)
         return;
         
         renderer.render(scene, camera);
         //renderer.shadowMap.needsUpdate = true;
         return;
         
         scene.overrideMaterial = depthMaterial;
         renderer.render(scene, camera, depthRenderTarget);//, true
         scene.overrideMaterial = null;
         
         if (composer) {
         //renderer.clear();
         composer.render();
         }*/

    }

    return {
        init: init,
        update: update,
        toggle: toggle,
        onBeat: onBeat,
        onResize: onResize
    };

}();