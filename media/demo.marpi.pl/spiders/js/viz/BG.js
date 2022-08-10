var BG = function () {

    var groupHolder;
    var material;
    var planeMaterial
    var spd = 0;

    var shapes = [];

    var cubeMesh, cubeShader;

    function init() {

        //console.log("BG")

        //init event listeners
        events.on("update", update);
        events.on("onBeat", onBeat);


        groupHolder = new THREE.Object3D();
        VizHandler.getScene().add(groupHolder);

        var cubeMapId = 23//4//28//23//20//16//7;//9
        //4,,23,16,9,,28,20
        cubeMap = Assets.getCubeMap(cubeMapId)

        cubeShader = THREE.ShaderLib['cube'];
        cubeShader.uniforms['tCube'].value = cubeMap;

        var skyBoxMaterial = new THREE.ShaderMaterial({
            fragmentShader: cubeShader.fragmentShader,
            vertexShader: cubeShader.vertexShader,
            uniforms: cubeShader.uniforms,
            depthWrite: true,
            side: THREE.BackSide
        });

        var skyBox = new THREE.Mesh(
                new THREE.CubeGeometry(1500, 1500, 1500),
                skyBoxMaterial
                //new THREE.MeshBasicMaterial({color:0xFFFFFF,side: THREE.BackSide})
                );

        //groupHolder.add(skyBox);

        cubeMaterial = new THREE.MeshStandardMaterial({
            shading: THREE.FlatShading,
            //envMap: reflectionCube,
            //side: THREE.DoubleSide,
            //depthWrite:false,
            //depthTest:false,
            //blendEquation:THREE.MinEquation
        })

        cubeMesh = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), cubeMaterial);
        cubeMesh.rotation.x = -Math.PI / 2
        cubeMesh.position.y = -.25;
        cubeMesh.castShadow = true;
        cubeMesh.receiveShadow = true;
        groupHolder.add(cubeMesh);

        var test = new THREE.Mesh(
                new THREE.CubeGeometry(.2, .2, .2),
                cubeMaterial
                //new THREE.MeshBasicMaterial({color:0xFFFFFF,side: THREE.BackSide})
                );

        test.castShadow = true;
        test.receiveShadow = true;
        //groupHolder.add(test);


        /*planeMaterial = new THREE.MeshPhongMaterial({
         envMap: Assets.textureCube(),
         reflectivity: 1,
         //opacity:.3,//.75,
         color: 0xffffff,
         //transparent:true,
         shading: THREE.FlatShading,
         //blending: THREE.AdditiveBlending,
         side: THREE.DoubleSide//BackSide
         });
         
         
         var groundGeometry = new THREE.PlaneGeometry(4000, 8000, 10, 10);
         var vert = groundGeometry.vertices
         for (var i = 0; i < vert.length; i++) {
         vert[i].z += Math.random() * 1000
         }
         groundGeometry.verticesNeedUpdate = true;
         groundGeometry.normalsNeedUpdate = true;
         groundGeometry.computeFaceNormals();
         groundGeometry.computeVertexNormals();
         
         var ground = new THREE.Mesh(groundGeometry, planeMaterial);
         ground.position.x = -2000;
         ground.position.y = -1500;
         ground.rotation.x = -Math.PI / 2
         //groupHolder.add( ground );
         
         
         var groundGeometry = new THREE.PlaneGeometry(4000, 8000, 10, 10);
         for (var i = 0; i < vert.length; i++) {
         groundGeometry.vertices[i].x = -vert[i].x
         groundGeometry.vertices[i].y = vert[i].y
         groundGeometry.vertices[i].z = vert[i].z
         }
         groundGeometry.verticesNeedUpdate = true;
         groundGeometry.normalsNeedUpdate = true;
         groundGeometry.computeFaceNormals();
         groundGeometry.computeVertexNormals();
         
         var ground2 = new THREE.Mesh(groundGeometry, planeMaterial);
         ground2.position.x = 2000;
         ground2.position.y = -1500;
         ground2.rotation.x = -Math.PI / 2
         //groupHolder.add( ground2 );
         */


    }

    function update() {

        //cubeMesh.rotation.x += spd * .001
        //cubeMesh.scale.x = cubeMesh.scale.y = cubeMesh.scale.z = 16 - ControlsHandler.fxParams.bgProgress * 8
        //groupHolder.rotation.z+=.001
    }

    function onBeat() {
        /*if (Math.random() < .05)
         spd = (Math.random() - .5)
         
         if (ControlsHandler.fxParams.wireframe) {
         cubeMesh.material.wireframe = true;
         planeMaterial.wireframe = true;
         } else {
         cubeMesh.material.wireframe = false;
         planeMaterial.wireframe = false;
         }
         
         
         var basic = [ControlsHandler.fxParams.colorProgress * .75, ControlsHandler.fxParams.colorProgress * .75, (1 - ControlsHandler.fxParams.colorProgress) * .5]
         cubeMesh.material.color.setRGB(basic[0] + Math.random() / 2, basic[1] + Math.random() / 2, basic[2] + Math.random() / 2);
         planeMaterial.color.setRGB(basic[0] + Math.random() / 2, basic[1] + Math.random() / 2, basic[2] + Math.random() / 2);
         if (ControlsHandler.fxParams.black) {
         cubeMesh.material.color.setRGB(.2, .2, .2);
         planeMaterial.color.setRGB(.2, .2, .2);
         }*/
    }

    function setEnvMap(cubeMap) {
        cubeShader.uniforms['tCube'].value = cubeMap;
    }

    return {
        init: init,
        update: update,
        onBeat: onBeat,
        setEnvMap: setEnvMap
    };

}();