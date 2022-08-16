var Generator = function () {
    var number;
    var material, material2

    var spd, center, position, centerTween, centerTweenObject, legsNum, bonesPositions, bonesPositionsTween, mesh, bodyBone, j, r;

    var big = true;
    var colorinit, color2init;

    function init() {
        //var reflectionCube = Assets.getCubeMap(0)
        //reflectionCube.format = THREE.RGBFormat;
        var roughness = .5;
        var metalness = .3;
        material = new THREE.MeshPhongMaterial({
            skinning: true,
            color: 0xFFFFFF,
            //metalness: metalness,
            //roughness: roughness,
            shininess: 50,
            //fog: false,
            //map: new THREE.TextureLoader().load( "textures/stickers.png" ),
            reflectivity: 1,
            shading: THREE.FlatShading,
            side: THREE.DoubleSide,
            //envMap: reflectionCube,
            vertexColors: THREE.VertexColors,
            emissive: 0
        })
        material2 = material.clone()
        material2.skinning = false
    }

    function create(id, position) {
        big = Math.random() < .05

        number = {random: new Math.seedrandom(id)};

        if (!colorinit || number.random() < .07) {
            //console.log('change color')
            colorinit = number.random() - .2
            color2init = number.random() - .2
        }

        var segmentHeight = (Math.floor(number.random() * 8) + 5);
        var segmentCount = 2;
        var height = segmentHeight * segmentCount;
        var spread = (3 + number.random() * 20);

        if (big)
            spread = 30 + Math.random() * 20

        var legs = Math.floor(number.random() * 5) + 3;

        if (big)
            legs = 8

        var radiusBottom = (.1 + colorinit + .2 * number.random()) * segmentHeight * spread * .03 + .5;
        var radiusTop = (.1 + color2init + .2 * number.random()) * radiusBottom;
        var radiusSegments = 3 + number.random() * 5;
        var color = new THREE.Color().setHSL(colorinit + .2 * number.random(), .7, .5);
        var color2 = new THREE.Color().setHSL(color2init + .2 * number.random(), .3, .5);
        var size = spread * (segmentHeight + (radiusTop + radiusBottom) * .01) / 15;
        var sizeBias = .5;
        var ankleSpread = .2 + .6 * number.random();
        var ankleHeight = .2 + .6 * number.random();
        if (big)
            ankleHeight *= 5
        var turbulence = number.random() * 1.5;
        var speed = .05 + .2 * number.random()//(segmentHeight - 2) / 20
        if (big)
            speed *= 2

        big = false;

        var ankle = 0;
        while (Math.abs(ankle) < .3)
            ankle = -.6 + number.random() * 1.5;

        var polygonNum = Math.round(height * .2 + ankle);

        var stepHeight = ankleHeight * (.3 + .2 * number.random())///2//.2 + number.random() * .1;

        //

        var sizing = {
            id: id,
            color: color,
            color2: color2,
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
            ankleHeight: ankleHeight,
            polygonNum: polygonNum,
            stepHeight: stepHeight,
            turbulence: turbulence,
            initialPosition: position.clone()
        };

        var centerTweenObject = new THREE.Object3D();
        centerTweenObject.position.copy(position);

        var movement = {
            center: position.clone(),
            centerTween: centerTweenObject,
            position: position
        }

        var meshes = []
        var positions = []
        var bonesPositions = []
        var bonesPositionsTween = []

        var geometry = createGeometry(sizing, turbulence, sizing.legs, size, sizeBias);
        var bones = createBones(sizing, sizing.legs);
        var mesh = createMesh(geometry, bones, sizing.legs);
        mesh.frustumCulled = false;

        meshes.push(mesh)

        var pos = position.clone();
        positions.push(pos)

        for (var i = 0; i < sizing.legs; i++) {
            var posAnimating = pos.clone()
            posAnimating.animating = false;
            bonesPositions.push(pos.clone())
            bonesPositionsTween.push(pos.clone())
        }

        return {id: id, random: Math.random(), meshes: meshes, sizing: sizing, movement: movement, positions: positions, bonesPositions: bonesPositions, bonesPositionsTween: bonesPositionsTween}
    }

    function updateCreature(creature, des, mod, mouseControl, meshes, targetPosition, newlyCreated) {
        spd = creature.sizing.speed;
        if (newlyCreated)
            spd = 0;
        center = creature.movement.center;
        position = creature.movement.position;
        centerTween = creature.movement.centerTween.position;
        centerTweenObject = creature.movement.centerTween;
        legsNum = creature.sizing.legs
        bonesPositions = creature.bonesPositions
        bonesPositionsTween = creature.bonesPositionsTween
        mesh = meshes[0]
        bodyBone = mesh.skeleton.bones[legsNum * 3]

        if (mouseControl) {
            des.x = targetPosition.x;
            des.z = targetPosition.z;
        }
        TweenLite.to(center, center.distanceTo(des) * spd, {
            x: des.x,
            //y: 0,
            z: des.z,
            ease: Linear.easeNone
        })
        //console.log(bodyBone,legsNum * 3,mesh.skeleton.bones)
        if (newlyCreated) {
            bodyBone.lookAt(center)
        } else {
            TweenLite.to(centerTween, spd * 5, {x: center.x, y: center.y, z: center.z, ease: Linear.easeNone});
            centerTweenObject.lookAt(center)
            bodyBone.rotation.copy(centerTweenObject.rotation)
        }

        for (j = 0; j < legsNum; j++) {
            if ((mesh.skeleton.bones[ 2 + j * 3 ].position.z == 0 || Math.random() < .0005 || bonesPositions[j].distanceTo(center) > creature.sizing.spread * 1.4) && !bonesPositionsTween[j].animating) {
                r = 2 * Math.PI * j / legsNum - Math.atan2(centerTween.z - center.z, centerTween.x - center.x)// + Math.random() * .1

                bonesPositions[j].x = center.x + Math.sin(r) * creature.sizing.spread
                bonesPositions[j].y = 0
                bonesPositions[j].z = center.z + Math.cos(r) * creature.sizing.spread

                bonesPositionsTween[j].animating = true;

                TweenLite.killTweensOf(bonesPositionsTween[j])
                TweenLite.to(bonesPositionsTween[j], spd * 2, {x: bonesPositions[j].x, z: bonesPositions[j].z})
                TweenLite.to(bonesPositionsTween[j], spd, {y: creature.sizing.height * creature.sizing.stepHeight})
                TweenLite.to(bonesPositionsTween[j], spd, {delay: spd, y: bonesPositions[j].y})
                TweenLite.delayedCall(spd * 3, finishAnimating, [j, bonesPositionsTween])
            }
            mod.y = creature.sizing.height * creature.sizing.ankleHeight

            mesh.skeleton.bones[ 0 + j * 3 ].position.copy(centerTween)
            mesh.skeleton.bones[ 0 + j * 3 ].position.add(mod)
            mesh.skeleton.bones[ 0 + j * 3 ].position.y += des.y

            mesh.skeleton.bones[ 1 + j * 3 ].position.set(bonesPositionsTween[j].x * creature.sizing.ankleSpread, mod.y * creature.sizing.ankle + bonesPositionsTween[j].y * creature.sizing.ankleSpread, bonesPositionsTween[j].z * creature.sizing.ankleSpread)
            mesh.skeleton.bones[ 1 + j * 3 ].position.sub(centerTween.clone().multiplyScalar(creature.sizing.ankleSpread))
            mesh.skeleton.bones[ 1 + j * 3 ].position.y -= des.y

            mesh.skeleton.bones[ 2 + j * 3 ].position.set(bonesPositionsTween[j].x * (1 - creature.sizing.ankleSpread), -mod.y * (1 + creature.sizing.ankle) + bonesPositionsTween[j].y * (1 - creature.sizing.ankleSpread), bonesPositionsTween[j].z * (1 - creature.sizing.ankleSpread))
            mesh.skeleton.bones[ 2 + j * 3 ].position.sub(centerTween.clone().multiplyScalar(1 - creature.sizing.ankleSpread))
        }

        position.copy(centerTween)
        position.add(mod)
        position.y += des.y

        bodyBone.position.copy(position)
    }

    function finishAnimating(j, bonesPositionsTween) {
        bonesPositionsTween[j].animating = false
    }

    function createGeometry(sizing, turbulence, legsNum, size, sizeBias) {
        var geometry = new THREE.CylinderGeometry(
                sizing.radiusTop, // radiusTop
                sizing.radiusBottom, // radiusBottom
                sizing.height, // height
                sizing.radiusSegments, // radiusSegments
                sizing.segmentCount * sizing.polygonNum, // heightSegments
                false                     // openEnded
                );
        for (var j = 0; j < legsNum - 1; j++) {
            var singleGeometry = new THREE.CylinderGeometry(
                    sizing.radiusTop, // radiusTop
                    sizing.radiusBottom, // radiusBottom
                    sizing.height, // height
                    sizing.radiusSegments, // radiusSegments
                    sizing.segmentCount * sizing.polygonNum, // heightSegments
                    false                     // openEnded
                    );
            geometry.merge(singleGeometry)
        }

        for (var i = 0; i < geometry.vertices.length; i++) {

            var vertex = geometry.vertices[ i ];
            var y = (vertex.y + sizing.halfHeight);

            var skinIndex = Math.floor(y / sizing.segmentHeight);
            var skinWeight = (y % sizing.segmentHeight) / sizing.segmentHeight;
            for (var j = 1; j < legsNum; j++) {
                if (i / geometry.vertices.length >= j / legsNum)
                    skinIndex += 3;
            }

            vertex.x -= (.5 - number.random()) * turbulence * (sizing.radiusTop + sizing.radiusBottom) / 2
            vertex.z -= (.5 - number.random()) * turbulence * (sizing.radiusTop + sizing.radiusBottom) / 2
            if (vertex.y == -sizing.segmentHeight) {
                vertex.x = vertex.z = 0;
            }

            geometry.skinIndices.push(new THREE.Vector4(skinIndex, skinIndex + 1, 0, 0));
            geometry.skinWeights.push(new THREE.Vector4(1 - skinWeight, skinWeight, 0, 0));

        }

        var body = createBody(sizing, size, sizeBias);
        body.position.y = -sizing.height / 2
        body.updateMatrix();

        for (var i = 0; i < body.geometry.vertices.length; i++) {
            var vertex = geometry.vertices[ i ];
            geometry.skinIndices.push(new THREE.Vector4(legsNum * 3, 0, 0, 0));
            geometry.skinWeights.push(new THREE.Vector4(1, 0, 0, 0));
        }
        geometry.merge(body.geometry, body.matrix)

        colorGeometry(geometry, sizing)

        return geometry;

    }

    function randomizeGeometry(geometry, size, vertical) {
        size *= .1;
        for (var i = 0; i < geometry.vertices.length; i++) {

            var vertex = geometry.vertices[ i ];
            var mod = Math.abs(vertex.x) + vertex.y + vertex.z
            vertex.x += Math.sin(mod) * size;
            vertex.y += Math.sin(mod) * size;
            vertex.z += Math.sin(mod) * size;

        }

        return geometry;

    }

    function colorGeometry(geometry, sizing) {
        var c = new THREE.Color(sizing.color);
        var f;
        var faceIndices = ['a', 'b', 'c'];
        for (var i = 0; i < geometry.faces.length; i++) {
            f = geometry.faces[ i ];
            if (i % Math.floor(sizing.radiusSegments) == 0) {
                c = new THREE.Color(sizing.color);
                if (Math.sin(i * .3) > .5)
                    c = new THREE.Color(sizing.color2);
            }
            for (var j = 0; j < 3; j++) {
                vertexIndex = f[ faceIndices[ j ] ];
                p = geometry.vertices[ vertexIndex ];
                f.vertexColors[ j ] = c;

            }

        }
    }

    function createBones(sizing, legsNum) {

        bones = [];

        for (var j = 0; j < legsNum; j++) {

            var prevBone = new THREE.Bone();
            bones.push(prevBone);
            prevBone.position.y = -sizing.halfHeight;

            for (var i = 0; i < sizing.segmentCount; i++) {

                var bone = new THREE.Bone();
                bone.position.y = sizing.segmentHeight;
                bones.push(bone);
                prevBone.add(bone);
                prevBone = bone;

            }
        }

        var headBone = new THREE.Bone();
        headBone.position.y = -sizing.halfHeight;
        bones.push(headBone);

        return bones;

    }

    function createMesh(geometry, bones, legsNum) {

        var mesh = new THREE.SkinnedMesh(geometry, material);
        var skeleton = new THREE.Skeleton(bones);

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        for (var i = 0; i < legsNum; i++) {
            mesh.add(bones[ i * 3 ]);
        }
        mesh.add(bones[ legsNum * 3 ]);
        mesh.bind(skeleton);

        /*var skeletonHelper = new THREE.SkeletonHelper(mesh);
         skeletonHelper.material.linewidth = 2;
         //groupHolder.add(skeletonHelper);
         skeletonHelpers.push(skeletonHelper)*/

        return mesh;

    }

    function createBody(sizing, size, sizeBias) {
        var container = new THREE.Object3D()

        size *= .5

        var geoms = [new THREE.BoxGeometry(
                    size * (sizeBias * number.random() + 1 - sizeBias),
                    size * (sizeBias * number.random() + 1 - sizeBias),
                    size * (sizeBias * number.random() + 1 - sizeBias)
                    ),
            new THREE.OctahedronGeometry(size * (sizeBias * number.random() + 1 - sizeBias), 1),
            new THREE.TetrahedronGeometry(size * (sizeBias * number.random() + 1 - sizeBias), 1),
            new THREE.TetrahedronGeometry(size * (sizeBias * number.random() + 1 - sizeBias), 0)]

        for (var i = 0; i < 5; i++) {
            var g = geoms[Math.floor(number.random() * geoms.length)]
            var mesh = new THREE.Mesh(g, null)
            var roz = size * 2

            mesh.position.x = (number.random() - .5) * roz
            mesh.position.y = (number.random() - .5) * roz
            mesh.position.z = (number.random() - .5) * roz

            container.add(mesh)


            var mesh2 = mesh.clone()
            mesh2.geometry = mesh2.geometry.clone()
            for (var j = 0; j < mesh2.geometry.vertices.length; j++) {
                mesh2.geometry.vertices[j].x = -mesh2.geometry.vertices[j].x
            }

            for (var j = 0; j < mesh2.geometry.faces.length; j++) {
                var a = mesh2.geometry.faces[j].a
                mesh2.geometry.faces[j].a = mesh2.geometry.faces[j].b
                mesh2.geometry.faces[j].b = a
            }
            mesh2.position.copy(mesh.position)
            mesh2.position.x = -mesh2.position.x

            container.add(mesh2)

        }


        var geom = new THREE.Geometry()
        for (var i = 0; i < container.children.length; i++) {
            if (container.children[i].geometry) {
                container.children[i].updateMatrix();
                geom.merge(container.children[i].geometry, container.children[i].matrix, 0);
            }
        }
        var body = new THREE.Mesh(geom, material2);

        colorGeometry(body.geometry, sizing)
        randomizeGeometry(body.geometry, size, true)
        body.castShadow = true;
        body.receiveShadow = true;

        return body;
    }
    return {
        init: init,
        create: create,
        createGeometry: createGeometry,
        createBones: createBones,
        createMesh: createMesh,
        colorGeometry: colorGeometry,
        randomizeGeometry: randomizeGeometry,
        createBody: createBody,
        updateCreature: updateCreature,
    };

}();