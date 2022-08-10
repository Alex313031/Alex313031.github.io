var Birds = function () {

    var boidCount = 200, sharkCount = 2;

    var scene, renderer, camera;
    var goahead = false
    var targets = []
    var groupsNum = 3;
    var sgroup, bgroup;

    function init() {

        //init event listeners
        events.on("update", update);

        scene = VizHandler.getScene();
        renderer = VizHandler.getRenderer();
        camera = VizHandler.getCamera();

        trackingShark = false;
        trackingBoid = false;
        mouse = new THREE.Vector2();

        clock = new THREE.Clock();

        count = 0;

        for (var i = 0; i < groupsNum; i++) {
            targets.push(new THREE.Vector3(0, 100, 0))
        }
        //loadBoids();
    }

    function boidMouseUp() {
        if (boidCount > boids.length) {
            var count = boidCount - boids.length;
            for (var i = 0; i != count; i++) {
                addBoid();
            }
        } else if (boidCount < boids.length) {
            var count = boids.length - boidCount;
            for (var i = 0; i != count; i++) {
                removeBoid();
            }
        }
    }

    function sharkMouseUp() {
        if (sharkCount > sharks.length) {
            var count = sharkCount - sharks.length;
            for (var i = 0; i != count; i++) {
                addShark();
            }
        } else if (sharkCount < sharks.length) {
            var count = sharks.length - sharkCount;
            for (var i = 0; i != count; i++) {
                removeShark();
            }
        }
    }

    function initBoids(amountPerc) {
        //
        // Using https://github.com/OwenMcNaughton/Boids.js/tree/master by Owen McNaughton
        //

        boidCount = Math.floor(amountPerc * 300);
        if (isMobile.phone)
            boidCount = Math.floor(amountPerc * 250);

        fishTypeCount = 1 + 5 * amountPerc

        if (sgroup) {
            scene.remove(sgroup);
            scene.remove(bgroup);
            sgroup = null;
            bgroup = null;
        }

        boids = [];
        sharks = [];
        bgroup = new THREE.Group();
        sgroup = new THREE.Group();

        var geoType = Math.floor(Math.random() * 4)

        var sharkGeometry = new THREE.BoxBufferGeometry(1 + 10 * Math.random(), 1 + 20 * Math.random(), 1 + 10 * Math.random())
        if (geoType == 1)
            sharkGeometry = new THREE.ConeBufferGeometry(1 + 10 * Math.random(), 1 + 10 * Math.random(), 3 + 6 * Math.random())
        if (geoType == 2)
            sharkGeometry = new THREE.OctahedronBufferGeometry(1 + 8 * Math.random(), 1)
        if (geoType == 3)
            sharkGeometry = new THREE.TetrahedronBufferGeometry(1 + 8 * Math.random(), 0)

        var color = new THREE.Color().setHSL(Math.random(), .7, .7);
        sharkMaterial = new THREE.MeshPhongMaterial({color: color, shininess: 60, shading: THREE.FlatShading});

        for (var i = 0; i < sharkCount; i++) {
            var posx = Math.random() * 300 - 150;
            var posy = Math.random() * 300 - 150;
            var posz = Math.random() * 300 - 150;

            var rotx = 0;
            var roty = 0;
            var rotz = 0;

            var pos = new THREE.Vector3(posx, posy, posz);
            var rot = new THREE.Vector3(rotx, roty, rotz);
            var vel = new THREE.Vector3(Math.random() * 10 - .5,
                    Math.random() * 10 - .5,
                    Math.random() * 10 - .5);

            var boid = new Boid(pos, rot, vel, true);
            var mesh = new THREE.Mesh(sharkGeometry, sharkMaterial);
            mesh.castShadow = true
            mesh.receiveShadow = true

            mesh.position.x = pos.x;
            mesh.position.y = pos.y;
            mesh.position.z = pos.z;

            mesh.rotation.x = rot.x;
            mesh.rotation.y = rot.y;
            mesh.rotation.z = rot.z;

            sharks.push(boid);
            sgroup.add(mesh);
        }

        for (var j = 0; j < fishTypeCount; j++) {
            var geoType = Math.floor(Math.random() * 5)

            var boidGeometry = new THREE.BoxBufferGeometry(1 + 3 * Math.random(), 1 + 6 * Math.random(), 1 + 3 * Math.random())
            if (geoType == 1)
                boidGeometry = new THREE.TetrahedronBufferGeometry(1 + 3 * Math.random(), 0)
            if (geoType == 2)
                boidGeometry = new THREE.OctahedronBufferGeometry(1 + 3 * Math.random(), 0)
            if (geoType == 3)
                boidGeometry = new THREE.ConeBufferGeometry(1 + 5 * Math.random(), 0, 3 + 6 * Math.random())
            if (geoType == 4)
                boidGeometry = new THREE.ConeBufferGeometry(1 + 5 * Math.random(), 1 + 5 * Math.random(), 3 + 6 * Math.random())

            var color = new THREE.Color().setHSL(Math.random(), .7, .7);
            boidMaterial = new THREE.MeshPhongMaterial({color: color, shininess: 60, shading: THREE.FlatShading});
            for (var i = 0; i < boidCount / fishTypeCount; i++) {
                var posx = Math.random() * 300 - 150;
                var posy = 100 + Math.random() * 300 - 150;
                var posz = Math.random() * 300 - 150;

                var rotx = 0;
                var roty = 0;
                var rotz = 0;

                var pos = new THREE.Vector3(posx, posy, posz);
                var rot = new THREE.Vector3(rotx, roty, rotz);
                var vel = new THREE.Vector3(Math.random() * 10 - .5,
                        Math.random() * 10 - .5,
                        Math.random() * 10 - .5);


                var boid = new Boid(pos, rot, vel, false, 10 + 3 * j, 8 + 2 * j, 10 + 5 * j);
                var mesh = new THREE.Mesh(boidGeometry, boidMaterial);
                mesh.castShadow = true
                mesh.receiveShadow = true

                mesh.position.x = pos.x;
                mesh.position.y = pos.y;
                mesh.position.z = pos.z;

                mesh.rotation.x = rot.x;
                mesh.rotation.y = rot.y;
                mesh.rotation.z = rot.z;

                boids.push(boid);
                bgroup.add(mesh);
            }
        }
        goahead = true;

        scene.add(sgroup);
        scene.add(bgroup);
    }

    function addBoid() {
        var mesh = new THREE.Mesh(boidGeometry, boidMaterial);
        var posx = Math.random() * 100 - 50;
        var posy = Math.random() * 100 - 50;
        var posz = Math.random() * 100 - 50;

        var rotx = 0;
        var roty = 0;
        var rotz = 0;

        var pos = new THREE.Vector3(posx, posy, posz);
        var rot = new THREE.Vector3(rotx, roty, rotz);
        var vel = new THREE.Vector3(Math.random() * 10 - .5,
                Math.random() * 10 - .5,
                Math.random() * 10 - .5);

        mesh.position.x = pos.x;
        mesh.position.y = pos.y;
        mesh.position.z = pos.z;

        mesh.rotation.x = rot.x;
        mesh.rotation.y = rot.y;
        mesh.rotation.z = rot.z;

        var boid = new Boid(pos, rot, vel);

        boids.push(boid);
        bgroup.add(mesh);
    }

    function addShark() {
        var mesh = new THREE.Mesh(sharkGeometry, sharkMaterial);
        var posx = Math.random() * 100 - 50;
        var posy = Math.random() * 100 - 50;
        var posz = Math.random() * 100 - 50;

        var rotx = 0;
        var roty = 0;
        var rotz = 0;

        var pos = new THREE.Vector3(posx, posy, posz);
        var rot = new THREE.Vector3(rotx, roty, rotz);
        var vel = new THREE.Vector3(Math.random() * 10 - .5,
                Math.random() * 10 - .5,
                Math.random() * 10 - .5);

        mesh.position.x = pos.x;
        mesh.position.y = pos.y;
        mesh.position.z = pos.z;

        mesh.rotation.x = rot.x;
        mesh.rotation.y = rot.y;
        mesh.rotation.z = rot.z;

        var boid = new Boid(pos, rot, vel);

        sharks.push(boid);
        sgroup.add(mesh);
    }

    function removeShark() {
        sharks.pop();
        sgroup.children.pop();
    }

    function removeBoid() {
        boids.pop();
        bgroup.children.pop();
    }
    var time = 0
    function update() {
        if (!goahead)
            return;
        var lastFoodGem = Mecha.lastFoodGem()
        var foodGems = Mecha.foodGems()
        time += .01

        var mousePoint = Mecha.mousePoint()
        for (var i = 0; i < groupsNum; i++) {
            var target = targets[i]
            if (foodGems[i]) {
                target.x = foodGems[i].position.x
                target.y = foodGems[i].position.y
                target.z = foodGems[i].position.z
            } else {
                target.x = 300 * Math.sin(time + 3.14 * i / groupsNum)
                target.y = 100
                target.z = 300 * Math.cos(time + 3.14 * i / groupsNum)
                //console.log(target)
            }
            if (mousePoint) {
                target.copy(mousePoint)
                target.y += 50;
            }
        }

        for (var i = 0; i < boidCount; i++) {
            var groupID = Math.floor(groupsNum * i / boidCount)
            var target = targets[groupID]
            boids[i].update(boids, target, sharks);

            bgroup.children[i].position.x = boids[i].pos.x;
            bgroup.children[i].position.y = boids[i].pos.y;
            bgroup.children[i].position.z = boids[i].pos.z;

            bgroup.children[i].rotation.x = boids[i].rot.x;
            bgroup.children[i].rotation.y = boids[i].rot.y;
            bgroup.children[i].rotation.z = boids[i].rot.z;
        }

        for (var i = 0; i < sharkCount; i++) {
            sharks[i].update(boids, target, sharks);

            sgroup.children[i].position.x = sharks[i].pos.x;
            sgroup.children[i].position.y = sharks[i].pos.y;
            sgroup.children[i].position.z = sharks[i].pos.z;

            sgroup.children[i].rotation.x = sharks[i].rot.x;
            sgroup.children[i].rotation.y = sharks[i].rot.y;
            sgroup.children[i].rotation.z = sharks[i].rot.z;
        }


    }
    return {
        init: init,
        update: update,
        initBoids: initBoids,
    }

}
();


