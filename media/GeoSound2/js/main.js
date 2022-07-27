console.log("Hello, World!");
console.log("Welcome to the Console!");
function init() {
    scene = new THREE.Scene();
    var e = window.innerWidth / window.innerHeight;
    ((camera = new THREE.PerspectiveCamera(30, e, 1, 1e3)).position.z = 400),
        (renderer = new THREE.WebGLRenderer({ antialias: !0 })).setSize(window.innerWidth, window.innerHeight),
        renderer.setPixelRatio(window.devicePixelRatio),
        renderer.setClearColor(2106669),
        (renderer.shadowMapEnabled = !0),
        (renderer.shadowMapSoft = !0),
        document.body.appendChild(renderer.domElement);
    var t = new THREE.SpotLight(0, 0.75);
    t.position.set(-10, 80, 20), t.target.position.set(-200, 88, 10), (t.castShadow = !0), (t.shadowDarkness = 0.2), (t.shadowBias = 1e-5), (helper = new THREE.SpotLightHelper(t)), (t.shadowMapWidth = 2048), (t.shadowMapHeight = 2048);
    var n = new THREE.SpotLight(0, 0.95);
    n.position.set(40, 80, 30), n.target.position.set(0, -20, -30), (n.castShadow = !0), (n.shadowDarkness = 0.2), (t.shadowBias = 0.001);
    new THREE.SpotLightHelper(n);
    (n.shadowMapWidth = 2048), (n.shadowMapHeight = 2048);
    var a = new THREE.DirectionalLight("rgb(255,255,255)", 1);
    (a.castShadow = !0), (a.shadowDarkness = 0.2), (a.shadowMapWidth = 2048), (a.shadowMapHeight = 2048);
    new THREE.DirectionalLightHelper(a, 1);
    var o = new THREE.PointLight(10824509, 0.7, 100);
    o.position.set(110, -5, 10), (o.shadowDarkness = 0.4), (o.shadowColor = 8018261);
    new THREE.PointLightHelper(o);
    var i = new THREE.PointLight(10824509, 0.7, 100);
    i.position.set(0, 30, 10);
    new THREE.PointLightHelper(i);
    var r = new THREE.AmbientLight(7364704, 3);
    (r.shadowDarkness = 0.08), (r.shadowColor = 3656831);
    var s = new THREE.MeshBasicMaterial({ color: 7434882 }),
        c = new THREE.PlaneBufferGeometry(20, 23),
        d = new THREE.Mesh(c, s);
    (d.rotation.x = (8 * -Math.PI) / 24), (d.rotation.z = (5 * Math.PI) / 16), (d.position.x = -20), (d.position.y = 10), (d.receiveShadow = !0);
    var l = new THREE.Mesh(c, s);
    (l.rotation.x = (8 * -Math.PI) / 24), (l.rotation.z = (5 * Math.PI) / 16), (l.position.x = 30), (l.position.y = -8), (l.receiveShadow = !0);
    var h = new THREE.Mesh(c, s);
    (h.rotation.x = (8 * -Math.PI) / 24), (h.rotation.z = (5 * Math.PI) / 16), (h.position.x = 80), (h.position.y = -26), (h.receiveShadow = !0);
    var y = new THREE.Mesh(c, s);
    (y.rotation.x = (8 * -Math.PI) / 24), (y.rotation.z = (5 * Math.PI) / 16), (y.position.x = 130), (y.position.y = -43), (y.receiveShadow = !0);
    var w = new THREE.LineDashedMaterial({ color: 10902632, dashSize: (1 * Math.PI * 10) / 40, gapSize: (1 * Math.PI * 10) / 40, linewidth: 1 }),
        p = new THREE.CircleGeometry(10, 50);
    p.vertices.shift(), p.computeLineDistances();
    var m = new THREE.Line(p, w);
    m.position.set(-20, 38, 0), (m.rotation.x = Math.PI / 9), (m.rotation.y = -Math.PI / 7), m.scale.set(1.5, 1.5, 1.5);
    var M = new THREE.Line(p, w);
    M.position.set(31, 20, 0), (M.rotation.x = Math.PI / 9), (M.rotation.y = -Math.PI / 6), M.scale.set(1.5, 1.64, 1.5);
    var E = new THREE.Line(p, w);
    E.position.set(81, 2, 0), (E.rotation.x = Math.PI / 9), (E.rotation.y = -Math.PI / 5), E.scale.set(1.6, 1.7, 1.5);
    var g = new THREE.Line(p, w);
    g.position.set(131, -14, 0),
        (g.rotation.x = Math.PI / 9),
        (g.rotation.y = -Math.PI / 4),
        g.scale.set(1.65, 1.75, 1.5),
        scene.add(a),
        scene.add(n),
        scene.add(o),
        scene.add(i),
        scene.add(r),
        scene.add(d),
        scene.add(l),
        scene.add(h),
        scene.add(y),
        scene.add(cylinder1),
        scene.add(cylinder2),
        scene.add(cylinder3),
        scene.add(cylinder4),
        scene.add(m),
        scene.add(M),
        scene.add(E),
        scene.add(g),
        (objectControls = new ObjectControls(camera));
    var v = new THREE.PlaneBufferGeometry(1e5, 1e5),
        H = new THREE.MeshLambertMaterial({ color: 11711154 });
    ((intersectionPlane = new THREE.Mesh(v, H)).visible = !1), scene.add(intersectionPlane);
    var b = new THREE.Mesh(new createMergedGeometry().geometry, H);
    (b.position.x = -140), (b.position.y = 20), (b.castShadow = !0), (b.receiveShadow = !0);
    var T = new THREE.Mesh(new createMergedGeometry().geometry, H);
    (T.position.x = -113), (T.position.y = 20), (T.castShadow = !0), (T.receiveShadow = !0);
    var R = new THREE.Mesh(new createMergedGeometry().geometry, H);
    (R.position.x = -86), (R.position.y = 20), (R.castShadow = !0), (R.receiveShadow = !0);
    var u = new THREE.Mesh(new createMergedGeometry().geometry, H);
    (u.position.x = -140), (u.position.y = -7), (u.castShadow = !0), (u.receiveShadow = !0);
    var k = new THREE.Mesh(new createMergedGeometry().geometry, H);
    (k.position.x = -113), (k.position.y = -7), (k.castShadow = !0), (k.receiveShadow = !0);
    var x = new THREE.Mesh(new createMergedGeometry().geometry, H);
    (x.position.x = -86), (x.position.y = -7), (x.castShadow = !0), (x.receiveShadow = !0);
    var f = new THREE.Mesh(new createMergedGeometry().geometry, H);
    (f.position.x = -140), (f.position.y = -34), (f.castShadow = !0), (f.receiveShadow = !0);
    var S = new THREE.Mesh(new createMergedGeometry().geometry, H);
    (S.position.x = -113), (S.position.y = -34), (S.castShadow = !0), (S.receiveShadow = !0);
    var P = new THREE.Mesh(new createMergedGeometry().geometry, H);
    (P.position.x = -86), (P.position.y = -34), (P.castShadow = !0), (P.receiveShadow = !0), mesh.push(b, T, R, u, k, x, f, S, P);
    for (L = 0; L < mesh.length; L++) collidableMeshList.push(mesh[L]);
    for (var L = 0; L < mesh.length; L++)
        mesh[L].scale.set(0.26, 0.26, 0.26),
            (mesh[L].castShadow = !0),
            (mesh[L].receiveShadow = !0),
            (mesh[L].selected = !1),
            (mesh[L].select = function () {
                (this.selected = !0), intersectionPlane.position.copy(this.position);
            }),
            (mesh[L].deselect = function () {
                this.selected = !1;
            }),
            (mesh[L].update = function () {
                var e = objectControls.raycaster.intersectObject(intersectionPlane);
                e[0] ? this.position.copy(e[0].point) : console.log("something is terribly wrong");
            }),
            scene.add(mesh[L]),
            objectControls.add(mesh[L]);
    window.addEventListener("resize", onWindowResize, !1),
        console.log("Check Out My Works Here:" + "%c www.yanlinma.com ", "background: #355493; color: #fff"),
        window.addEventListener("load", function () {
            document.getElementById("loadingPage").style.display = "none";
        });
}
function createMergedGeometry() {
    this.geometry = new THREE.Geometry();
    for (var e = 0; e < 5; e++) {
        var t = new THREE.BoxGeometry(65 * Math.random(), 65 * Math.random(), 65 * Math.random()),
            n = new THREE.Matrix4().makeTranslation(10 * Math.random(), 10 * Math.random(), 10 * Math.random()).makeRotationX(Math.random() * Math.PI);
        t.applyMatrix(n), this.geometry.merge(t);
    }
}
function onWindowResize() {
    (camera.aspect = window.innerWidth / window.innerHeight), camera.updateProjectionMatrix(), renderer.setSize(window.innerWidth, window.innerHeight);
}
function animate() {
    requestAnimationFrame(animate), objectControls.update(), update(), generateSound(), changeGeoColor(), renderer.render(scene, camera);
}
function update() {
    ++counter > 20 && (Tone.Master.mute = !1);
    for (e = 0; e < mesh.length; e++) mesh[e].rotation.x += slider1.value / 1500;
    for (e = 0; e < mesh.length; e++) mesh[e].rotation.z += slider2.value / 2e3;
    for (var e = 0; e < mesh.length; e++) mesh[e].rotation.y += speed[e];
}
function generateSound() {
    var e = document.getElementById("contact1");
    e.innerHTML = "contact_1:&nbsp;&nbsp;0";
    var t = document.getElementById("contact2");
    t.innerHTML = "contact_2:&nbsp;&nbsp;0";
    var n = document.getElementById("contact3");
    n.innerHTML = "contact_3:&nbsp;&nbsp;0";
    var a = document.getElementById("contact4");
    a.innerHTML = "contact_4:&nbsp;&nbsp;0";
    for (var o = cylinder1.position.clone(), i = 0; i < cylinder1.geometry.vertices.length; i++) {
        var r = cylinder1.geometry.vertices[i].clone().applyMatrix4(cylinder1.matrix).sub(cylinder1.position),
            s = new THREE.Raycaster(o, r.clone().normalize()).intersectObjects(collidableMeshList);
        if (s.length > 0 && s[0].distance < r.length()) {
            switch (((e.innerHTML = "contact_1:&nbsp;&nbsp;" + s[0].distance), (plane2.material = new THREE.MeshLambertMaterial({ color: 13837885 })), Math.floor(s[0].distance))) {
                case 7:
                    note2 = "E4";
                    break;
                case 8:
                case 9:
                case 10:
                    note2 = "D2";
                    break;
                case 11:
                case 12:
                case 13:
                    note2 = "E2";
                    break;
                default:
                    note2 = "E2";
            }
            synth2.triggerAttack(note2);
        } else synth2.triggerRelease();
    }
    for (var c = cylinder2.position.clone(), d = 0; d < cylinder2.geometry.vertices.length; d++) {
        var l = cylinder2.geometry.vertices[d].clone().applyMatrix4(cylinder2.matrix).sub(cylinder2.position),
            h = new THREE.Raycaster(c, l.clone().normalize()).intersectObjects(collidableMeshList);
        if (h.length > 0 && h[0].distance < l.length()) {
            switch (((t.innerHTML = "contact_2:&nbsp;&nbsp;" + h[0].distance), Math.floor(h[0].distance))) {
                case 5:
                case 6:
                case 7:
                    note1 = "C6";
                    break;
                case 8:
                case 9:
                case 10:
                    note1 = "D6";
                    break;
                case 11:
                case 12:
                case 13:
                    note1 = "E6";
                    break;
                case 14:
                    note1 = "A6";
                    break;
                case 15:
                case 16:
                case 17:
                    note1 = "C6";
                    break;
                case 18:
                case 19:
                    note1 = "G6";
                    break;
                case 20:
                case 21:
                    note1 = "A6";
                    break;
                default:
                    note1 = "A6";
            }
            synth1.triggerAttack(note1);
        } else synth1.triggerRelease();
    }
    for (var y = cylinder3.position.clone(), w = 0; w < cylinder2.geometry.vertices.length; w++) {
        var p = cylinder3.geometry.vertices[w].clone().applyMatrix4(cylinder3.matrix).sub(cylinder3.position),
            m = new THREE.Raycaster(y, p.clone().normalize()).intersectObjects(collidableMeshList);
        if (m.length > 0 && m[0].distance < p.length()) {
            switch (((n.innerHTML = "contact_3:&nbsp;&nbsp;" + m[0].distance), Math.floor(m[0].distance))) {
                case 5:
                case 6:
                case 7:
                    note3 = "C3";
                    break;
                case 8:
                    note3 = "D3";
                    break;
                case 9:
                    note3 = "D4";
                    break;
                case 10:
                    note3 = "D3";
                    break;
                case 11:
                    note3 = "E3";
                    break;
                case 12:
                    note3 = "E4";
                    break;
                case 13:
                    note3 = "E3";
                    break;
                case 14:
                    note3 = "A3";
                    break;
                case 15:
                case 16:
                case 17:
                    note3 = "C3";
                    break;
                case 18:
                case 19:
                    note3 = "G3";
                    break;
                case 20:
                case 21:
                    note3 = "A4";
                    break;
                default:
                    note3 = "F3";
            }
            synth3.triggerAttack(note3);
        } else synth3.triggerRelease();
    }
    for (var M = cylinder4.position.clone(), E = 0; E < cylinder4.geometry.vertices.length; E++) {
        var g = cylinder4.geometry.vertices[E].clone().applyMatrix4(cylinder4.matrix).sub(cylinder4.position),
            v = new THREE.Raycaster(M, g.clone().normalize()).intersectObjects(collidableMeshList);
        if (v.length > 0 && v[0].distance > 4 && v[0].distance < g.length()) {
            switch (((a.innerHTML = "contact_4:&nbsp;&nbsp;" + v[0].distance), Math.floor(v[0].distance))) {
                case 5:
                    note4 = "C3";
                    break;
                case 6:
                    note4 = "C4";
                    break;
                case 7:
                    note4 = "C5";
                    break;
                case 8:
                case 9:
                    note4 = "D4";
                    break;
                case 10:
                    note4 = "D3";
                    break;
                case 11:
                    note4 = "E3";
                    break;
                case 12:
                case 13:
                    note4 = "E4";
                    break;
                case 14:
                    note4 = "A4";
                    break;
                case 15:
                    note4 = "C3";
                    break;
                case 16:
                    note4 = "C4";
                    break;
                case 17:
                    note4 = "C5";
                    break;
                case 18:
                case 19:
                    note4 = "G4";
                    break;
                case 20:
                case 21:
                    note4 = "A4";
                    break;
                default:
                    note4 = "C3";
            }
            synth4.triggerAttack(note4);
        } else synth4.triggerRelease();
    }
}
function changeGeoColor() {
    for (var e = 0; e < mesh.length; e++)
        (Math.abs(mesh[e].position.y - cylinder1.position.y) < 80 && Math.abs(mesh[e].position.x - cylinder1.position.x) < 30) ||
        (Math.abs(mesh[e].position.y - cylinder2.position.y) < 80 && Math.abs(mesh[e].position.x - cylinder2.position.x) < 30) ||
        (Math.abs(mesh[e].position.y - cylinder3.position.y) < 80 && Math.abs(mesh[e].position.x - cylinder3.position.x) < 30) ||
        (Math.abs(mesh[e].position.y - cylinder4.position.y) < 180 && Math.abs(mesh[e].position.x - cylinder4.position.x) < 30)
            ? (mesh[e].material = new THREE.MeshLambertMaterial({ color: 13004569 }))
            : (mesh[e].material = new THREE.MeshLambertMaterial({ color: 10389124 }));
}
var scene,
    camera,
    renderer,
    objectControls,
    objects = [],
    mesh = [],
    speed = [],
    particlesPool = [],
    counter = 0;
speed.push(Math.random() / 14, Math.random() / 12, Math.random() / 14, Math.random() / 12, Math.random() / 14, Math.random() / 12, Math.random() / 12, Math.random() / 12, Math.random() / 12);
var intersectionPlane,
    collidableMeshList = [],
    newMat = new THREE.MeshNormalMaterial(),
    planeMaterial = new THREE.MeshBasicMaterial({ color: 7434882 }),
    planeGeo = new THREE.PlaneBufferGeometry(20, 23),
    plane2 = new THREE.Mesh(planeGeo, planeMaterial);
(plane2.rotation.x = (8 * -Math.PI) / 24), (plane2.rotation.z = (5 * Math.PI) / 16), (plane2.position.x = 30), (plane2.position.y = -8), (plane2.receiveShadow = !0);
var CylinderGeo = new THREE.CylinderGeometry(0.15, 0.15, 25),
    cylinderMat = new THREE.MeshBasicMaterial({ color: 10902632 }),
    cylinder1 = new THREE.Mesh(CylinderGeo, cylinderMat);
(cylinder1.position.x = -20), (cylinder1.position.y = 18);
var cylinder2 = new THREE.Mesh(CylinderGeo, cylinderMat);
(cylinder2.position.x = 30), (cylinder2.position.y = 0);
var cylinder3 = new THREE.Mesh(CylinderGeo, cylinderMat);
(cylinder3.position.x = 80), (cylinder3.position.y = -17);
var cylinder4 = new THREE.Mesh(CylinderGeo, cylinderMat);
(cylinder4.position.x = 130), (cylinder4.position.y = -34);
var synth1 = new Tone.Synth({
        portamento: 0.01,
        oscillator: { type: "square" },
        envelope: { attack: 0.005, decay: 0.2, sustain: 0.4, release: 1.4 },
        filterEnvelope: { attack: 0.005, decay: 0.1, sustain: 0.05, release: 0.8, baseFrequency: 300, octaves: 4 },
    }).toMaster(),
    synth2 = new Tone.Synth({ portamento: 0.01, oscillator: { type: "sine10" }, envelope: { attack: 0.005, decay: 0.2, sustain: 0.4, release: 1.4 } }).toMaster(),
    synth3 = new Tone.FMSynth({ modulationIndex: 12.22, envelope: { attack: 0.01, decay: 0.2 }, modulation: { type: "sine10" }, modulationEnvelope: { attack: 0.2, decay: 0.01 } }).toMaster(),
    synth4 = new Tone.MonoSynth({ portamento: 0.01, oscillator: { type: "sawtooth" }, envelope: { attack: 0.005, decay: 0.2, sustain: 0.4, release: 1.4 } }),
    volume3 = new Tone.Volume(15);
synth3.chain(volume3, Tone.Master);
var volume4 = new Tone.Volume(-10);
synth4.chain(volume4, Tone.Master), (Tone.Master.mute = !0), init(), animate();
