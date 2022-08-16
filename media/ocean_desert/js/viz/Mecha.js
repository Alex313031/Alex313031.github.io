var Mecha = function () {
    var scene;

    var targetPosition = new THREE.Vector3()
    var finalTargetPosition = new THREE.Vector3()
    var mouseControl = false, finalControl = false;
    var meshes = []

    var numCreaturesSqrt = 1;
    var numCreatures = numCreaturesSqrt * numCreaturesSqrt;
    var creatures = [];

    var material, material2;

    var cursors = {};
    var max = 120, maxGems = 20;
    var times = [];
    var mods = []
    var cylGeo = new THREE.CylinderGeometry(10, 5, .5, 32)

    var smokeMaterial = new THREE.MeshPhongMaterial({color: 0xcccccc, shading: THREE.FlatShading})
    var smokePiece = new THREE.OctahedronBufferGeometry(5, 1)
    var crackMaterial = new THREE.MeshPhongMaterial({color: 0xcccccc, shading: THREE.FlatShading})
    var crackPiece = new THREE.TetrahedronBufferGeometry(5, 0)
    var gemMaterial = new THREE.MeshPhongMaterial({color: 0xcccccc, fog: true, shininess: 50, specular: 0xFFFFFF, shading: THREE.FlatShading})
    var gemPiece = new THREE.TetrahedronBufferGeometry(5, 0)
    var rayMaterial = new THREE.MeshBasicMaterial({color: 0xFFFFFF, shading: THREE.FlatShading})
    var rayPiece = new THREE.BoxBufferGeometry(2, 20, 2)

    var mouseMoved = false;
    var mouseEvent = {}
    var preMouse = new THREE.Vector2();

    var foodGems = []
    var crystal;
    var crystalClicked = false;

    function init() {

        //init event listeners
        events.on("update", update);
        scene = VizHandler.getScene()

        initBones();

        document.addEventListener("mousemove", onDocumentMouseMove, false);
        document.addEventListener("touchmove", onDocumentTouchMove, false);
        document.addEventListener("mousedown", onDocumentMouseDown, false);
        document.addEventListener("touchstart", onDocumentTouchStart, false);

        TweenLite.delayedCall(10, crystalBounce)
    }

    function crystalBounce() {
        if (crystalClicked)
            return;
        var time = 1
        TweenLite.killTweensOf(crystal.scale)
        TweenLite.killTweensOf(crystal)
        TweenLite.killDelayedCallsTo(crystalBounce)
        TweenLite.to(crystal.scale, time, {x: 4, y: 4, z: 4, ease: Expo.easeIn})
        TweenLite.to(crystal.scale, time, {delay: time, x: 3, y: 3, z: 3, ease: Expo.easeOut})
        TweenLite.delayedCall(2, crystalBounce)
    }

    function onDocumentTouchMove(event) {
        if (event.touches.length === 1) {
            var mouse = new THREE.Vector2();
            mouse.x = (event.touches[ 0 ].pageX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.touches[ 0 ].pageY / window.innerHeight) * 2 + 1;
            findFromRay(mouse)
        }
    }

    function onDocumentMouseMove(event) {
        var mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        findFromRay(mouse)
    }

    function onDocumentTouchStart(event) {
        if (event.touches.length === 1) {
            var mouse = new THREE.Vector2();
            mouse.x = (event.touches[ 0 ].pageX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.touches[ 0 ].pageY / window.innerHeight) * 2 + 1;
            findFromRay(mouse, true)
            Mecha.onRelease()
        }
    }

    function onDocumentMouseDown(event) {
        var mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        findFromRay(mouse, true)

        Mecha.onRelease()
    }

    function onDocumentTouchEnd(event) {
        VizHandler.getControls().enableRotate = true;
        document.body.style.cursor = "auto";
        selected = null
    }

    function onDocumentMouseUp(event) {
        VizHandler.getControls().enableRotate = true;
        document.body.style.cursor = "auto";
        selected = null
        Mecha.onRelease()
    }

    /*function onDocumentTouchMove() {
     if (!mouseEvent.mouse)
     return;
     //console.log(preMouse.distanceTo(mouseEvent.mouse))
     if (preMouse.distanceTo(mouseEvent.mouse) > 0.03) {
     mouseMoved = true
     }
     }
     
     function onDocumentMouseMove() {
     if (!mouseEvent.mouse)
     return;
     //console.log(preMouse.distanceTo(mouseEvent.mouse))
     if (preMouse.distanceTo(mouseEvent.mouse) > 0.03) {
     mouseMoved = true
     }
     }
     
     function onDocumentTouchStart() {
     if (!mouseEvent.mouse)
     return;
     preMouse.copy(mouseEvent.mouse)
     mouseMoved = false
     }
     function onDocumentMouseDown() {
     if (!mouseEvent.mouse)
     return;
     preMouse.copy(mouseEvent.mouse)
     mouseMoved = false
     }*/

    function lookAround() {
        if (!plane)
            return;
        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouseEvent.mouse, VizHandler.getCamera());
        var intersects = raycaster.intersectObjects([plane, crystal]);
        if (intersects[ 0 ]) {
            if (intersects[ 0 ].object == crystal) {
                document.body.style.cursor = "pointer";
            } else {
                document.body.style.cursor = "auto";
                var p = intersects[ 0 ].point
                targetPosition = p;
                mouseControl = true
                TweenLite.killDelayedCallsTo(regainControl)
                TweenLite.delayedCall(.3, regainControl)
            }

        }
    }

    function onRelease() {
        //console.log(mouseMoved)
        if (mouseMoved || !mouseEvent.mouse)
            return;

        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouseEvent.mouse, VizHandler.getCamera());
        var intersects = raycaster.intersectObjects([plane, crystal]);
        if (intersects[ 0 ]) {

            //if (mouseEvent.click) {
            //var id = Math.floor(Math.random() * 10000);
            //spawn(p.x, p.y, p.z, id);
            //sendClick(p.x, p.y, p.z, id);
            if (intersects[ 0 ].object == crystal) {
                crystalClicked = true;
                VizHandler.playMusic();
                VizHandler.dayNight();

                var num = Math.floor(Math.random() * 5) + 1
                var place = "desert";
                if (VizHandler.getMode() == 1)
                    place = "underwater_new"
                var sound = new Audio('music/pling_' + place + num + '.mp3');
                sound.play();

            } else {
                var p = intersects[ 0 ].point
                addGem(p)
            }
        }
    }

    function addGem(p) {

        var minDist = 10000
        for (var g = 0; g < foodGems.length; g++) {
            var dist = p.distanceTo(foodGems[g].position)
            if (dist < minDist) {
                minDist = dist
            }
        }
        if (minDist < 16) {
            return;
        }

        var num = Math.floor(Math.random() * 5) + 1
        var place = "desert";
        if (VizHandler.getMode() == 1)
            place = "underwater_new"
        var sound = new Audio('music/pling_' + place + num + '.mp3');
        sound.play();

        var gem = new THREE.Mesh(gemPiece, gemMaterial)
        gem.position.x = p.x
        gem.position.y = -5
        gem.position.z = p.z
        TweenLite.to(gem.position, 1, {y: 15, ease: Back.easeOut});
        TweenLite.from(gem.rotation, .6, {x: Math.random() * 6 - 3, y: Math.random() * 6 - 3, z: Math.random() * 6 - 3});
        gem.castShadow = true;
        gem.receiveShadow = true;

        scene.add(gem)
        foodGems.push(gem)

        if (foodGems.length > maxGems) {
            var last = foodGems[0];
            removeGem(last)
        }
    }

    function removeGem(last) {
        foodGems = foodGems.filter(function (item) {
            return item !== last
        })
        TweenLite.to(last.scale, .5, {x: 0, y: 0, z: 0, onComplete: removeFromStage, onCompleteParams: [last]});
    }

    function hideCrystals() {
        if (!crystal)
            return;
        
        TweenLite.killTweensOf(crystal.scale)
        TweenLite.killTweensOf(crystal)
        TweenLite.killDelayedCallsTo(crystalBounce)
        
        TweenLite.to(crystal.scale, .3, {x: 0.01, y: 0.01, z: 0.01})
        for (var i = 0; i < foodGems.length; i++) {
            var last = foodGems[i]
            TweenLite.to(last.scale, .5, {x: 0, y: 0, z: 0, onComplete: removeFromStage, onCompleteParams: [last]});
        }
        foodGems = [];
    }

    function removeFromStage(cursor) {
        scene.remove(cursor)
    }

    function findFromRay(mouse, click) {
        mouseEvent.mouse = mouse
        mouseEvent.click = click

        if (!click)
            lookAround()
    }

    function regainControl() {
        mouseControl = false;
    }

    function initBones() {
        Generator.init();
        clearSpace()
    }

    function clearSpace() {
        for (var i = 0; i < meshes.length; i++) {
            scene.remove(meshes[i])
        }

        creatures = []
        meshes = []

        numCreatures = creatures.length;
        numCreaturesSqrt = Math.sqrt(numCreatures)

    }

    function spawn(x, y, z, id, creatorsName) {
        if (!scene)
            return;
        var meshesAddition = []

        // CONFIG

        var creature = Generator.create(id, new THREE.Vector3(x, y, z))
        //explode(creature.movement.position)
        creature.creatorsName = creatorsName;

        for (var j = 0; j < creature.meshes.length; j++) {
            scene.add(creature.meshes[j]);

            /*skeletonHelper = new THREE.SkeletonHelper(creature.meshes[j]);
             skeletonHelper.material.linewidth = 2;
             scene.add(skeletonHelper);*/

            meshesAddition.push(creature.meshes[j])
        }

        var mod = new THREE.Vector3(0, -30, 0)
        TweenLite.to(mod, 1, {y: 0})

        creatures.push(creature)
        meshes.push(meshesAddition)
        mods.push(mod)
        times.push(0)

        if (creatures.length > max) {
            var creature = creatures[0]

            for (var j = 0; j < creature.meshes.length; j++) {
                scene.remove(creature.meshes[j]);
            }

            //explode(creature.movement.position)

            creatures.shift();
            meshes.shift();
            mods.shift();
            times.shift();
        }


        numCreatures = creatures.length;
        numCreaturesSqrt = Math.sqrt(numCreatures)

        update()
    }

    function update() {
        for (var i = 0; i < foodGems.length; i++) {
            foodGems[i].rotation.x += .03
            foodGems[i].rotation.y += .03
        }
        if (crystal) {
            crystal.rotation.x += .01
            crystal.rotation.y += .01
        }

        var creature, midDist, bestChoice, dist;
        for (var i = 0; i < numCreatures; i++) {
            times[i] += .0007;

            creature = creatures[i];

            finalTargetPosition.copy(targetPosition)
            finalTargetPosition.x += Math.sin(i) * 50 * i / numCreatures
            finalTargetPosition.z += Math.cos(i) * 50 * i / numCreatures
            var finalControl = mouseControl
            if (finalControl && creature.movement.position.distanceTo(targetPosition) > 300) {
                finalControl = false
            }
            if (foodGems.length > 0) {
                minDist = 10000
                for (var g = 0; g < foodGems.length; g++) {
                    dist = creature.movement.position.distanceTo(foodGems[g].position)
                    if (dist < minDist) {
                        minDist = dist
                        bestChoice = foodGems[g];
                    }
                }
                if (minDist < 300) {
                    finalTargetPosition.copy(bestChoice.position)
                    finalControl = true;
                }
                if (minDist < 7) {
                    ray(bestChoice.position);
                    removeGem(bestChoice)
                    //AudioHandler.playGem()
                }
            }

            var time = times[i];
            var des = new THREE.Vector3(
                    Math.sin(1.1 * creature.random * 6 + 1 * time + i) * 300,
                    (-Math.sin(1.1 * creature.random * 6 + 30 * time) / 2 + .5) * creature.sizing.height / 3,
                    Math.sin(1.9 * creature.random * 6 + 1 * time) * 300
                    )
            //var mod = new THREE.Vector3(40 * (.5 - numCreaturesSqrt / 2 + i % numCreaturesSqrt), 0, 40 * (.5 - numCreaturesSqrt / 2 + Math.floor(i / numCreaturesSqrt)));
            var mod = new THREE.Vector3();
            //des.y += mod.y;

            Generator.updateCreature(creature, des, mod, finalControl, meshes[i], finalTargetPosition)
        }
    }

    function hit(position) {
        var creature;
        for (var i = numCreatures - 1; i >= 0; i--) {
            creature = creatures[i];
            if (creature.movement.position.distanceTo(position) < 40) {
                explode(creature.movement.position)

                for (var j = 0; j < creature.meshes.length; j++) {
                    scene.remove(creature.meshes[j]);
                }

                creatures.splice(i, 1);
                meshes.splice(i, 1);
                mods.splice(i, 1);
                times.splice(i, 1);
                numCreatures--

                var roz = 500
                var id = Math.random()
                Mecha.spawn((Math.random() - .5) * roz, 0, (Math.random() - .5) * roz, id)
            }
        }
    }

    function animate(array, col, noteScales) {
        for (var i = 0; i < mods.length; i++) {
            var n = mods.length % i
            if (array[n] == -1 && col % noteScales[n] == 0) {
                TweenLite.to(mods[i], .05, {y: -7});
            } else {
                TweenLite.to(mods[i], 1, {y: 0});
            }
        }
    }

    function explode(position, scale) {
        if (!scale)
            scale = 1
        for (var k = 0; k < 5; k++) {
            var c = new THREE.Mesh(smokePiece, smokeMaterial)
            c.castShadow = true;
            c.receiveShadow = true;
            c.position.copy(position)
            c.position.x += (Math.random() * 10 - 5) * scale
            c.position.y += (Math.random() * 5) * scale
            c.position.z += (Math.random() * 10 - 5) * scale
            c.scale.set(scale, scale, scale)
            scene.add(c)
            var d = Math.random() * 20 * scale
            var a = Math.random() * Math.PI * 2
            var tpos = new THREE.Vector3(Math.sin(a) * d, 0, Math.cos(a) * d)
            tpos.add(c.position)
            var d = Math.random() * .5
            TweenLite.to(c.rotation, 1 + d, {delay: 0, x: 5 * (Math.random() - .5), y: 5 * (Math.random() - .5), z: 5 * (Math.random() - .5)})
            TweenLite.to(c.position, 1 + d, {delay: 0, x: tpos.x, z: tpos.z, onComplete: removeFromStage, onCompleteParams: [c]})
            TweenLite.to(c.position, 1 + d, {delay: 0, y: (Math.random() * 20 + 5) * scale})
            var s = (1 + Math.random()) * scale
            TweenLite.to(c.scale, .7 + d * .7, {delay: 0, x: s, y: s, z: s})
            TweenLite.to(c.scale, .3 + d * .3, {delay: 0 + .7 + d * .7, x: 0.0001, y: 0.0001, z: 0.0001})
        }
    }

    function ray(position, scale) {
        var name = (1 + Math.floor(Math.random() * 5))

        if (VizHandler.getMode() == 1)
            name += "_underwater"
        var sound = new Audio('music/creature' + name + '.mp3');
        sound.play();

        return;

        if (!scale)
            scale = 1
        for (var k = 0; k < 1; k++) {
            var c = new THREE.Mesh(rayPiece, rayMaterial)
            c.position.copy(position)
            c.scale.set(scale, scale, scale)
            scene.add(c)
            var tpos = new THREE.Vector3(0, 300, 0)
            tpos.add(c.position)
            TweenLite.to(c.position, 1, {delay: 0, x: tpos.x, y: tpos.y, z: tpos.z, onComplete: removeFromStage, onCompleteParams: [c]})
            var s = (1 + Math.random()) * scale
            TweenLite.to(c.scale, .7, {delay: 0, x: s, y: s, z: s})
            TweenLite.to(c.scale, .3, {delay: 0 + .7, x: 0.0001, y: 0.0001, z: 0.0001})
        }
    }

    function setColors(r, r2) {
        crackMaterial.color = new THREE.Color().setHSL(r, .7, .5);
        smokeMaterial.color = new THREE.Color().setHSL(r2, 0, .7);
        gemMaterial.color = new THREE.Color().setHSL(r, .7, .5);
        if (plane)
            scene.remove(plane)
        plane = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000, 10 + Math.random() * 10, 10 + Math.random() * 10), new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            //metalness: metalness,
            //roughness: roughness,
            shininess: 70,
            //fog: false,
            //map: new THREE.TextureLoader().load( "textures/stickers.png" ),
            reflectivity: 1,
            shading: THREE.FlatShading,
            side: THREE.DoubleSide,
            //envMap: reflectionCube,
            vertexColors: THREE.VertexColors,
            emissive: 0
        }));
        var color = new THREE.Color().setHSL(r, .3, .5);
        var color2 = new THREE.Color().setHSL(r2, .3, .5);
        Generator.colorGeometry(plane.geometry, {radiusSegments: 7, color: color, color2: color2})
        plane.rotation.x = -Math.PI / 2
        plane.receiveShadow = true;
        scene.add(plane);

        if (crystal)
            scene.remove(crystal)
        var geom = new THREE.TetrahedronGeometry(5, 1)
        var mod = 5
        for (var i = 0; i < geom.vertices.length; i++) {
            var v = geom.vertices[i]
            v.x += (Math.random() - .5) * mod
            v.y += (Math.random() - .5) * mod
            v.z += (Math.random() - .5) * mod
        }
        var color = new THREE.Color().setHSL(Math.random(), .3, .5);
        var color2 = new THREE.Color().setHSL(Math.random(), .3, .5);
        Generator.colorGeometry(geom, {radiusSegments: 7, color: color, color2: color2})
        crystal = new THREE.Mesh(geom, new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            //metalness: metalness,
            //roughness: roughness,
            shininess: 50,
            fog: false,
            //map: new THREE.TextureLoader().load( "textures/stickers.png" ),
            reflectivity: 1,
            shading: THREE.FlatShading,
            side: THREE.DoubleSide,
            //envMap: reflectionCube,
            vertexColors: THREE.VertexColors,
            //emissive: 0xFFFFFF
            specular: 0xFFFFFF
        }));
        crystal.castShadow = true;
        crystal.receiveShadow = true;
        crystal.scale.set(3, 3, 3)
        crystal.position.y = 100
        scene.add(crystal)
        TweenLite.from(crystal.scale, 1, {delay: .5, x: 0.01, y: 0.01, z: 0.01})

        /*var crystalLight = new THREE.Mesh(new THREE.CylinderBufferGeometry(3,3,100,5),new THREE.MeshBasicMaterial({transparent:true,opacity:.5}))
         crystalLight.position.y=50;
         scene.add(crystalLight)*/

    }

    function crack(position, scale) {
        if (isMobile.any)
            return;
        if (!scale)
            scale = 1
        var c
        for (var k = 0; k < 5; k++) {
            if (Math.random() < .5) {
                c = new THREE.Mesh(crackPiece, crackMaterial)
            } else {
                c = new THREE.Mesh(crackPiece, smokeMaterial)
            }
            c.castShadow = true;
            c.receiveShadow = true;
            c.userData.ySpeed = 1 + Math.random() * 1.5;
            c.position.copy(position)
            c.position.x += (Math.random() * 10 - 5) * scale
            c.position.y += (Math.random() * 5) * scale
            c.position.z += (Math.random() * 10 - 5) * scale
            c.scale.set(scale * (.5 + Math.random()), scale * (.5 + Math.random()), scale * (.5 + Math.random()))
            scene.add(c)
            var d = Math.random() * 60 * scale
            var a = Math.random() * Math.PI * 2
            var tpos = new THREE.Vector3(Math.sin(a) * d, 0, Math.cos(a) * d)
            tpos.add(c.position)
            var d = Math.random() * .5
            TweenLite.to(c.rotation, 1 + d, {delay: 0, x: 15 * (Math.random() - .5), y: 15 * (Math.random() - .5), z: 15 * (Math.random() - .5)})
            TweenLite.to(c.position, 1 + d, {delay: 0, x: tpos.x, z: tpos.z, onUpdate: bounce, onUpdateParams: [c], onComplete: removeFromStage, onCompleteParams: [c]})
            var s = (1 + Math.random()) * scale
            TweenLite.to(c.scale, .7 + d * .7, {delay: 0, x: s, y: s, z: s})
            TweenLite.to(c.scale, .3 + d * .3, {delay: 0 + .7 + d * .7, x: 0.0001, y: 0.0001, z: 0.0001})
        }
    }
    function bounce(c) {
        c.position.y += c.userData.ySpeed
        if (c.userData.ySpeed < 0 && c.position.y < 1 * c.scale.y)
            c.userData.ySpeed = -c.userData.ySpeed * .5
        c.userData.ySpeed -= .1
    }
    function removeAll() {
        while (creatures.length > 0) {
            var creature = creatures[0]

            for (var j = 0; j < creature.meshes.length; j++) {
                scene.remove(creature.meshes[j]);
            }

            //explode(creature.movement.position)

            creatures.shift();
            meshes.shift();
            mods.shift();
            times.shift();
        }
    }

    return {
        init: init,
        update: update,
        setColors: setColors,
        hit: hit,
        spawn: spawn,
        explode: explode,
        crack: crack,
        animate: animate,
        max: max,
        getCreatures: function () {
            return creatures
        },
        findFromRay: findFromRay,
        onRelease: onRelease,
        lastFoodGem: function () {
            return foodGems[foodGems.length - 1]
        },
        foodGems: function () {
            return foodGems
        },
        mousePoint: function () {
            if (mouseControl) {
                return targetPosition;
            }
        },
        removeAll: removeAll,
        hideCrystals: hideCrystals
    }

}
();