var Mecha = function () {
    var scene;

    var bonesPositions = []
    var bonesPositionsTween = []
    var targetPosition = new THREE.Vector3()
    var mouseControl = false;
    var meshes = []

    var numCreaturesSqrt = 7;
    var numCreatures = numCreaturesSqrt * numCreaturesSqrt;

    function init() {

        //init event listeners
        events.on("update", update);
        scene = VizHandler.getScene()

        initBones();

        plane = new THREE.Mesh(new THREE.PlaneGeometry(1500, 1500), new THREE.MeshPhongMaterial({
            shading: THREE.FlatShading,
            emissive: 0x101010
        }));
        plane.rotation.x = -Math.PI / 2
        plane.receiveShadow = true;
        scene.add(plane);

        document.addEventListener("mousemove", onDocumentMouseDown);
        document.addEventListener("touchmove", onDocumentTouchStart, false);
    }
    function onDocumentTouchStart(event) {
        if (event.touches.length === 1) {
            var mouse = new THREE.Vector2();
            mouse.x = (event.touches[ 0 ].pageX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.touches[ 0 ].pageY / window.innerHeight) * 2 + 1;
            boom(mouse)
        }
    }
    function onDocumentMouseDown(event) {
        var mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        boom(mouse)

    }
    function boom(mouse) {
        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, VizHandler.getCamera());
        var intersects = raycaster.intersectObject(plane, true);
        if (intersects[ 0 ]) {
            mouseControl = true
            var p = intersects[ 0 ].point
            targetPosition = p;
            TweenMax.killDelayedCallsTo(regainControl)
            TweenMax.delayedCall(meshes[0][0].movement.center.distanceTo(targetPosition) * .15, regainControl)
        }
    }
    function regainControl() {
        mouseControl = false
    }

    function initBones() {
        var reflectionCube = Assets.getCubeMap(0)
        reflectionCube.format = THREE.RGBFormat;
        var roughness = .6;
        var metalness = 1;
        material = new THREE.MeshStandardMaterial({
            skinning: true,
            color: 0xFFFFFF,
            metalness: metalness,
            roughness: roughness,
            reflectivity: 1,
            shading: THREE.FlatShading,
            side: THREE.DoubleSide,
            envMap: reflectionCube,
            vertexColors: THREE.VertexColors,
            emissive: 0
        })
        var material2 = material.clone()
        material2.skinning = false

        meshes = []
        bonesPositions = []
        bonesPositionsTween = []

        for (var i = 0; i < numCreatures; i++) {
            meshes[i] = []
            bonesPositions[i] = []
            bonesPositionsTween[i] = []

            // CONFIG

            var segmentHeight = (Math.floor(Math.random() * 8) + 3)
            var segmentCount = 2;
            var height = segmentHeight * segmentCount;
            var spread = 3 + Math.random() * 20
            var legs = Math.floor(Math.random() * 7) + 2
            var radiusTop = Math.random() * segmentHeight * spread * .04
            var radiusBottom = Math.random() * segmentHeight * spread * .04
            var radiusSegments = 3 + Math.random() * 5;
            var color = new THREE.Color().setHSL(Math.random(), .4, .9)
            var size = spread * (segmentHeight + (radiusTop + radiusBottom) * .01) / 15;
            var sizeBias = .5
            var ankleSpread = .2 + .6 * Math.random()
            var turbulence = Math.random() * 2
            var speed = .1 + .2 * Math.random()//(segmentHeight - 2) / 20

            var ankle = 0
            while (Math.abs(ankle) < .3)
                ankle = -.6 + Math.random() * 1.5

            var polygonNum = height * .2 + ankle

            var stepHeight = Math.random() * .2 + .03

            //

            var body = Tools.createBody(color, size, sizeBias, material2)
            scene.add(body);

            var sizing = {
                segmentHeight: segmentHeight,
                segmentCount: segmentCount,
                height: height,
                halfHeight: height * 0.5,
                radiusTop: radiusTop,
                radiusBottom: radiusBottom,
                radiusSegments: radiusSegments,
                speed: speed,
                spread: spread,
                legs: legs,
                ankle: ankle,
                ankleSpread: ankleSpread,
                polygonNum: polygonNum,
                stepHeight: stepHeight,
                turbulence: turbulence
            };
            var movement = {
                center: new THREE.Vector3(),
                centerTween: new THREE.Object3D(),
                body: body
            }

            for (var j = 0; j < sizing.legs; j++) {
                var geometry = Tools.createGeometry(sizing, color, turbulence);
                var bones = Tools.createBones(sizing);
                var mesh = Tools.createMesh(geometry, bones, material);

                scene.add(mesh);

                var pos = new THREE.Vector3();

                mesh.sizing = sizing;
                mesh.movement = movement;

                meshes[i].push(mesh)
                bonesPositions[i].push(pos)

                var posAnimating = pos.clone()
                posAnimating.animating = false;
                bonesPositionsTween[i].push(posAnimating)
            }
        }
    }

    function update() {
        for (var i = 0; i < numCreatures; i++) {
            var mesh = meshes[i][0]
            var spd = mesh.sizing.speed;
            var center = mesh.movement.center;
            var centerTween = mesh.movement.centerTween.position;
            var centerTweenObject = mesh.movement.centerTween;

            var time = Date.now() * 0.0001;
            var des = new THREE.Vector3(window.innerWidth / window.innerHeight * 15 * Math.sin(2 * i + 1.5 * time) * Math.sin(5 * i + 2.5 * time) * 1, 0, 20 * Math.sin(2 * i + 1 * time) * Math.sin(5 * i + 3.5 * time) * 1)
            if (mouseControl)
                des = targetPosition;
            TweenMax.to(center, center.distanceTo(des) * spd, {
                x: des.x,
                z: des.z,
                ease: Linear.easeNone
            })


            var mod = new THREE.Vector3(40 * (.5 - numCreaturesSqrt / 2 + i % numCreaturesSqrt), 0, 40 * (.5 - numCreaturesSqrt / 2 + Math.floor(i / numCreaturesSqrt)));

            TweenMax.to(centerTween, spd * 5, {x: center.x, y: center.y, z: center.z, ease: Linear.easeNone});
            centerTweenObject.lookAt(center)
            mesh.movement.body.rotation.copy(centerTweenObject.rotation)

            /*var midLeg = Math.floor(mesh.sizing.legs / 2)
             if (mesh.sizing.legs == 2)
             midLeg = 0
             var mesh1 = meshes[i][midLeg].skeleton.bones[ 1 ]
             var mesh2 = meshes[i][midLeg + 1].skeleton.bones[ 1 ]
             var tempObj = new THREE.Object3D()
             tempObj.position.copy(mesh1.position)
             tempObj.position.y = 0
             var tempObj2 = new THREE.Object3D()
             tempObj2.position.copy(mesh2.position)
             tempObj2.position.y = 0
             tempObj.lookAt(tempObj2.position)
             mesh.movement.body.rotation.copy(tempObj.rotation)
             mesh.movement.body.rotation.y += Math.PI / 2*/

            var legsNum = bonesPositions[i].length
            mesh.movement.body.position.copy(mesh.skeleton.bones[ 0 ].position)


            for (var j = 0; j < legsNum; j++) {
                var mesh = meshes[i][j]

                if ((mesh.skeleton.bones[ 2 ].position.z == 0 || Math.random() < .0005 || bonesPositions[i][j].distanceTo(center) > mesh.sizing.spread * 1.4) && !bonesPositionsTween[i][j].animating) {
                    var r = 2 * Math.PI * j / bonesPositions[i].length - Math.atan2(centerTween.z - center.z, centerTween.x - center.x)// + Math.random() * .1

                    bonesPositions[i][j].x = center.x + Math.sin(r) * mesh.sizing.spread
                    bonesPositions[i][j].y = 0
                    bonesPositions[i][j].z = center.z + Math.cos(r) * mesh.sizing.spread

                    bonesPositionsTween[i][j].animating = true;

                    TweenMax.killTweensOf(bonesPositionsTween[i][j])
                    TweenMax.to(bonesPositionsTween[i][j], spd * 2, {x: bonesPositions[i][j].x, z: bonesPositions[i][j].z})
                    TweenMax.to(bonesPositionsTween[i][j], spd, {y: mesh.sizing.height * mesh.sizing.stepHeight})
                    TweenMax.to(bonesPositionsTween[i][j], spd, {delay: spd, y: bonesPositions[i][j].y})
                    TweenMax.delayedCall(spd * 3, finishAnimating, [i, j])
                }
                mod.y = mesh.sizing.height * .5

                mesh.skeleton.bones[ 0 ].position.copy(centerTween)
                mesh.skeleton.bones[ 0 ].position.add(mod)
                //mesh.skeleton.bones[ 0 ].position.add(centerTween.clone().multiplyScalar(mesh.sizing.ankleSpread))

                mesh.skeleton.bones[ 1 ].position.set(bonesPositionsTween[i][j].x * mesh.sizing.ankleSpread, mod.y * mesh.sizing.ankle + bonesPositionsTween[i][j].y * mesh.sizing.ankleSpread, bonesPositionsTween[i][j].z * mesh.sizing.ankleSpread)
                mesh.skeleton.bones[ 1 ].position.sub(centerTween.clone().multiplyScalar(mesh.sizing.ankleSpread))

                mesh.skeleton.bones[ 2 ].position.set(bonesPositionsTween[i][j].x * (1 - mesh.sizing.ankleSpread), -mod.y * (1 + mesh.sizing.ankle) + bonesPositionsTween[i][j].y * (1 - mesh.sizing.ankleSpread), bonesPositionsTween[i][j].z * (1 - mesh.sizing.ankleSpread))
                mesh.skeleton.bones[ 2 ].position.sub(centerTween.clone().multiplyScalar(1 - mesh.sizing.ankleSpread))

            }
        }
    }

    function finishAnimating(i, j) {
        bonesPositionsTween[i][j].animating = false
    }

    return {
        init: init,
        update: update,
    }

}
();