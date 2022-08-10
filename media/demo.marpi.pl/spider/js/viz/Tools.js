var Tools = function () {
    function createGeometry(sizing, color, turbulence) {
        var geometry = new THREE.CylinderGeometry(
                sizing.radiusTop, // radiusTop
                sizing.radiusBottom, // radiusBottom
                sizing.height, // height
                sizing.radiusSegments, // radiusSegments
                sizing.segmentCount * sizing.polygonNum, // heightSegments
                true                     // openEnded
                );

        for (var i = 0; i < geometry.vertices.length; i++) {

            var vertex = geometry.vertices[ i ];
            var y = (vertex.y + sizing.halfHeight);

            var skinIndex = Math.floor(y / sizing.segmentHeight);
            var skinWeight = (y % sizing.segmentHeight) / sizing.segmentHeight;

            vertex.x -= (.5 - Math.random()) * turbulence * (sizing.radiusTop + sizing.radiusBottom) / 2
            vertex.z -= (.5 - Math.random()) * turbulence * (sizing.radiusTop + sizing.radiusBottom) / 2
            if (vertex.y == -sizing.segmentHeight) {
                vertex.x = vertex.z = 0;
            }

            geometry.skinIndices.push(new THREE.Vector4(skinIndex, skinIndex + 1, 0, 0));
            geometry.skinWeights.push(new THREE.Vector4(1 - skinWeight, skinWeight, 0, 0));

        }

        colorGeometry(geometry, color)

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

    function colorGeometry(geometry, color) {
        var f;
        var faceIndices = ['a', 'b', 'c'];
        for (var i = 0; i < geometry.faces.length; i++) {
            f = geometry.faces[ i ];
            for (var j = 0; j < 3; j++) {
                vertexIndex = f[ faceIndices[ j ] ];
                p = geometry.vertices[ vertexIndex ];
                color = new THREE.Color(color);
                f.vertexColors[ j ] = color;

            }

        }
    }

    function createBones(sizing) {

        bones = [];

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

        return bones;

    }

    function createMesh(geometry, bones, material) {

        var mesh = new THREE.SkinnedMesh(geometry, material);
        var skeleton = new THREE.Skeleton(bones);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        mesh.add(bones[ 0 ]);
        mesh.bind(skeleton);

        /*var skeletonHelper = new THREE.SkeletonHelper(mesh);
         skeletonHelper.material.linewidth = 2;
         //groupHolder.add(skeletonHelper);
         skeletonHelpers.push(skeletonHelper)*/

        return mesh;

    }

    function createBody(color, size, sizeBias, material2) {
        var container = new THREE.Object3D()

        size *= .5

        var geoms = [new THREE.BoxGeometry(
                    size * (sizeBias * Math.random() + 1 - sizeBias),
                    size * (sizeBias * Math.random() + 1 - sizeBias),
                    size * (sizeBias * Math.random() + 1 - sizeBias)
                    ),
            new THREE.OctahedronGeometry(size * (sizeBias * Math.random() + 1 - sizeBias), 1),
            new THREE.TetrahedronGeometry(size * (sizeBias * Math.random() + 1 - sizeBias), 1),
            new THREE.TetrahedronGeometry(size * (sizeBias * Math.random() + 1 - sizeBias), 0)]

        for (var i = 0; i < 5; i++) {
            var g = geoms[Math.floor(Math.random() * geoms.length)]
            var mesh = new THREE.Mesh(g, null)
            var roz = size * 2

            mesh.position.x = (Math.random() - .5) * roz
            mesh.position.y = (Math.random() - .5) * roz
            mesh.position.z = (Math.random() - .5) * roz

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
                /*var l = ship.children[i].geometry.faces.length
                 for (var j = 0; j < l; j++) {
                 var id = 0
                 ship.children[i].geometry.faces[j].materialIndex = ship.children[i].material.materialID;
                 }*/
                geom.merge(container.children[i].geometry, container.children[i].matrix, 0);
            }
        }
        body = new THREE.Mesh(geom, material2);

        colorGeometry(body.geometry, color)
        randomizeGeometry(body.geometry, size, true)
        body.castShadow = true;
        body.receiveShadow = true;

        return body;
    }
    return {
        createGeometry: createGeometry,
        createBones: createBones,
        createMesh: createMesh,
        colorGeometry: colorGeometry,
        randomizeGeometry: randomizeGeometry,
        createBody: createBody,
    };

}();