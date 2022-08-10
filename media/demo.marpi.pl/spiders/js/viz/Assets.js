var Assets = function () {

    var textureCube;
    var cubeMaps = []

    function init() {

    }

    function destroy(object, textureToo) {
        if (object.children.length > 0) {
            var objects = [object.children[1], object.children[0]]

            object.remove(objects[0]);
            object.remove(objects[1]);

            destroyMesh(objects[0], textureToo)
            destroyMesh(objects[1], textureToo)
        } else {
            destroyMesh(object, textureToo)
        }
    }

    function getCubeMap(i) {
        if (cubeMaps[i])
            return cubeMaps[i]

        var cubeMap = new THREE.Texture([]);
        cubeMap.format = THREE.RGBFormat;
        cubeMap.flipY = false;

        var envMaps = [
            {file: "textures/fog.jpg", size: 256, glow: .1},
            {file: "textures/Above_The_Sea.jpg", size: 1024, glow: .1},
        ];

        var loader = new THREE.ImageLoader();
        var file = envMaps[i].file;
        var size = envMaps[i].size;
        loader.load(file, function (image) {
            var getSide = function (x, y) {

                var canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;

                var context = canvas.getContext('2d');
                context.drawImage(image, -x * size, -y * size);

                return canvas;

            };

            preloaderProgress(1);

            cubeMap.image[ 0 ] = getSide(2, 1); // px
            cubeMap.image[ 1 ] = getSide(0, 1); // nx
            cubeMap.image[ 2 ] = getSide(1, 0); // py
            cubeMap.image[ 3 ] = getSide(1, 2); // ny
            cubeMap.image[ 4 ] = getSide(1, 1); // pz
            cubeMap.image[ 5 ] = getSide(3, 1); // nz
            cubeMap.needsUpdate = true;

        });

        cubeMaps[i] = cubeMap
        return cubeMap;
    }

    function destroyMesh(mesh, textureToo) {
        if (mesh.geometry)
            mesh.geometry.dispose();
        if (!mesh.material)
            return;
        var tex = mesh.material.map
        if (!tex && mesh.material.materials)
            tex = mesh.material.materials[1].map
        //console.log(mesh.material.map)
        if (tex && textureToo) {
            tex.needsUpdate = false;
            tex.dispose();
            tex.image = null
            tex = null;
        }
        if (mesh.material.materials) {
            mesh.material.materials[1].dispose();
            mesh.material.materials[0].dispose();
            mesh.material.materials[1] = null;
            mesh.material.materials[0] = null;
        }
        if (mesh.material.dispose)
            mesh.material.dispose();

        mesh.material = null;
        mesh.geometry = null;
        tex = null;
    }

    return {
        init: init,
        textureCube: function () {
            return textureCube;
        },
        destroy: destroy,
        getCubeMap: getCubeMap
    };

}();