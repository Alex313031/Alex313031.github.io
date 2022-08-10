var Shards = function () {
    var groupHolder;
    var multiMaterial

    var drewNewShape = false;
    var scl = 0;
    var full;
    var spd = 0;
    var mod = 0;
    var speed = .035;
    var back = false;
    var main;
    var timeout
    var flotilla = []
    var isMobile = {any: false};
    var plane;
    var rings = []
    var material
    var time = 0
    function init() {

        //init event listeners
        events.on("update", update);
        events.on("onBeat", onBeat);


        var shininess = 50, specular = 0xffffff, bumpScale = .055, shading = THREE.SmoothShading;
        var reflectionCube = Assets.getCubeMap(12)
        reflectionCube.format = THREE.RGBFormat;
        var roughness = 0;
        var metalness = 1;
        //var diffuseColor = new THREE.Color(.1,.1,.1);
        material = new THREE.MeshStandardMaterial({
            bumpScale: bumpScale,
            metalness: metalness,
            fog: false,
            roughness: roughness,
            shading: THREE.FlatShading,
            envMap: reflectionCube,
            //side: THREE.DoubleSide,
            //map: new THREE.TextureLoader().load("2708diffuse.jpg"),
            //alphaMap: new THREE.TextureLoader().load("textures/op.png"),
            //transparent:true,
            //normalMap: new THREE.TextureLoader().load("2708normal.jpg"),
            //bumpMap: texture,
            //emissive: 0x111111,
            //metalnessMap:texture,
            //lightMap:texture,
            //depthWrite:false,
            //depthTest:false,
            //blendEquation:THREE.MinEquation
        })
        
        reload()
    }

    function reload() {
        if (full) {
            VizHandler.getScene().remove(full);
            full.geometry.dispose();
            full = null;
        }

        var geo = new THREE.BoxGeometry(.1, .1, .1, 1, 1, 1)
        var group = new THREE.Object3D();
        
        for (var j = 0; j < 400; j++) {
            var r = 15
            var tpos = new THREE.Vector3()
            if (j != 0)
                tpos.set((Math.random() - .5) * r, (Math.random() - .5) * r, (Math.random() - .5) * r)
            var ran=Math.random()*5
            for (var i = 0; i < ran; i++) {
                var cube = new THREE.Mesh(geo, material)
                var r = .2 + .4 * Math.random()
                cube.position.set((Math.random() - .5) * r, (Math.random() - .5) * r, (Math.random() - .5) * r)
                cube.position.add(tpos)
                var scr0 = Math.random()
                var scr1 = Math.random()
                var scr2 = Math.random()
                cube.scale.set(scr0, scr1, scr2)
                group.add(cube)
                cube.castShadow = true;
                cube.receiveShadow = true;
            }
        }


        var geom = new THREE.Geometry()
        for (var i = 0; i < group.children.length; i++) {
            group.children[i].updateMatrix();
            geom.merge(group.children[i].geometry, group.children[i].matrix);
        }

        var mod = .1
        for (var i = 0; i < geom.vertices.length; i++) {
            var v = geom.vertices[i]
            v.x += (Math.random() - .5) * mod
            v.y += (Math.random() - .5) * mod
            v.z += (Math.random() - .5) * mod
        }

        geom.computeFaceNormals();
        geom.computeVertexNormals();

        full = new THREE.Mesh(geom, material)
        full.castShadow = true;
        full.receiveShadow = true;
        VizHandler.getScene().add(full)

        VizHandler.getRenderer().shadowMap.needsUpdate = true;
    }

    function update() {
    }

    function onBeat() {
    }

    function generate() {
    }

    return {
        init: init,
        update: update,
        onBeat: onBeat,
        generate: generate,
        reload: reload,
    }

}
();