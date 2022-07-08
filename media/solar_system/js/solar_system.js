var WIDTH = $(window).innerWidth(),
    HEIGHT = $(window).innerHeight();
var VIEW_ANGLE = 45,
    ASPECT = WIDTH / HEIGHT,
    NEAR = 0.1,
    FAR = 10000;
var container = document.getElementById("container");
var mouseX = 0,
    mouseY = 0,
    mouse_down = false,
    roll = false;
var renderer = new THREE.WebGLRenderer({ antialias: true });
var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
var scene = new THREE.Scene();
scene.add(camera);
camera.position.set(0, -800, 0);
camera.lookAt({ x: 0, y: 0, z: 0 });
renderer.setSize(WIDTH, HEIGHT);
container.appendChild(renderer.domElement);
var pointLight = new THREE.PointLight(16777215, 1);
pointLight.position.x = 0;
pointLight.position.y = 0;
pointLight.position.z = 0;
var camLight = new THREE.PointLight(16777215, 0.3);
camLight.position = camera.position;
var planets = {},
    sun,
    sun_mesh,
    cloudearthmesh,
    saturnrings;
var suntext = new THREE.ImageUtils.loadTexture("img/sun.jpg", {}, function () {});
var sphereMaterial = new THREE.MeshBasicMaterial({ map: suntext });
var cam = { radius: 800, radian: 0, degree: Math.random() * 1000 };
planets.mercury = {
    name: "Mercury",
    x: WIDTH * 0.5,
    y: HEIGHT * 0.5,
    radius: 57,
    speed: 0.8,
    degree: Math.random() * 1000,
    radian: 0,
    planetSize: 4,
    planetColor: 10066329,
    planetTexture: new THREE.ImageUtils.loadTexture("img/mercurymap.jpg", {}, function () {}),
};
planets.venus = {
    name: "Wenus",
    x: WIDTH * 0.5,
    y: HEIGHT * 0.5,
    radius: 100,
    speed: 0.3,
    degree: Math.random() * 1000,
    radian: 0,
    planetSize: 8,
    planetColor: 12551737,
    planetTexture: new THREE.ImageUtils.loadTexture("img/venusmap.jpg", {}, function () {}),
};
planets.earth = {
    name: "Ziemia",
    x: WIDTH * 0.5,
    y: HEIGHT * 0.5,
    radius: 130,
    speed: 0.2,
    degree: Math.random() * 1000,
    radian: 0,
    planetSize: 8,
    planetColor: 26316,
    planetTexture: new THREE.ImageUtils.loadTexture("img/earthmap1k.jpg", {}, function () {}),
    cloudTexture: new THREE.ImageUtils.loadTexture("img/earth_clouds_1024.png", {}, function () {}),
};
planets.mars = {
    name: "Mars",
    x: WIDTH * 0.5,
    y: HEIGHT * 0.5,
    radius: 180,
    speed: 0.1,
    degree: Math.random() * 1000,
    radian: 0,
    planetSize: 6,
    planetColor: 11158016,
    planetTexture: new THREE.ImageUtils.loadTexture("img/mars_1k_color.jpg", {}, function () {}),
};
planets.jupiter = {
    name: "Jupiter",
    x: WIDTH * 0.5,
    y: HEIGHT * 0.5,
    radius: 300,
    speed: 0.06,
    degree: Math.random() * 1000,
    radian: 0,
    planetSize: 20,
    planetColor: 14724719,
    planetTexture: new THREE.ImageUtils.loadTexture("img/jupitermap.jpg", {}, function () {}),
};
planets.saturn = {
    name: "Saturn",
    x: WIDTH * 0.5,
    y: HEIGHT * 0.5,
    radius: 400,
    speed: 0.03,
    degree: Math.random() * 1000,
    radian: 0,
    planetSize: 17,
    planetColor: 14724719,
    planetTexture: new THREE.ImageUtils.loadTexture("img/saturnmap.jpg", {}, function () {}),
    ringsTexture: new THREE.ImageUtils.loadTexture("img/saturn-rings.png", {}, function () {}),
};
planets.uran = {
    name: "Uran",
    x: WIDTH * 0.5,
    y: HEIGHT * 0.5,
    radius: 450,
    speed: 0.05,
    degree: Math.random() * 1000,
    radian: 0,
    planetSize: 10,
    planetColor: 14724719,
    planetTexture: new THREE.ImageUtils.loadTexture("img/uranusmap.jpg", {}, function () {}),
};
planets.neptun = {
    name: "Neptun",
    x: WIDTH * 0.5,
    y: HEIGHT * 0.5,
    radius: 500,
    speed: 0.03,
    degree: Math.random() * 1000,
    radian: 0,
    planetSize: 10,
    planetColor: 14724719,
    planetTexture: new THREE.ImageUtils.loadTexture("img/neptunemap.jpg", {}, function () {}),
};
function create_meshes() {
    var d;
    for (d in planets) {
        if (planets.hasOwnProperty(d)) {
            var g = new THREE.SphereGeometry(planets[d].planetSize, 16, 16);
            var e = new THREE.MeshLambertMaterial({ map: planets[d].planetTexture });
            var c = new THREE.Mesh(g, e);
            c.rotation.x = Math.PI / 2;
            planets[d].mesh = c;
            if (planets[d].cloudTexture) {
                var f = new THREE.SphereGeometry(8.1, 16, 16);
                var h = new THREE.MeshLambertMaterial({ map: planets[d].cloudTexture, transparent: true });
                var k = new THREE.Mesh(f, h);
                k.rotation.x = Math.PI / 2;
                cloudearthmesh = k;
            }
            if (planets[d].ringsTexture) {
                var j = new THREE.TorusGeometry(25, 5, 2, 32, 2 * Math.PI);
                var b = new THREE.MeshLambertMaterial({ map: planets[d].ringsTexture, transparent: true, opacity: 0.6 });
                var a = new THREE.Mesh(j, b);
                a.rotation.x = 0;
                saturnrings = a;
            }
        }
    }
    sun_mesh = new THREE.Mesh(new THREE.SphereGeometry(50, 24, 24), sphereMaterial);
    sun_mesh.rotation.x = Math.PI / 2;
}
function update_positions() {
    var a;
    for (a in planets) {
        if (planets.hasOwnProperty(a)) {
            planets[a].degree += planets[a].speed;
            planets[a].radian = (planets[a].degree / 180) * Math.PI;
            planets[a].mesh.position.x = planets[a].x = Math.cos(planets[a].radian) * planets[a].radius;
            planets[a].mesh.position.y = planets[a].y = -Math.sin(planets[a].radian) * planets[a].radius;
            planets[a].mesh.position.z = 0;
            planets[a].mesh.rotation.y += 0.01;
            if (planets[a].cloudTexture) {
                cloudearthmesh.position.x = planets[a].x = Math.cos(planets[a].radian) * planets[a].radius;
                cloudearthmesh.position.y = planets[a].y = -Math.sin(planets[a].radian) * planets[a].radius;
                cloudearthmesh.position.z = 0;
                cloudearthmesh.rotation.y += 0.01;
            }
            if (planets[a].ringsTexture) {
                saturnrings.position.x = planets[a].x = Math.cos(planets[a].radian) * planets[a].radius;
                saturnrings.position.y = planets[a].y = -Math.sin(planets[a].radian) * planets[a].radius;
                saturnrings.position.z = 0;
            }
        }
    }
    sun_mesh.rotation.y += 0.01;
    cam.radian = ((cam.degree / 180) * Math.PI) % Math.PI;
    camera.position.x = cam.x = Math.cos(cam.radian) * cam.radius;
    camera.position.y = cam.y = -Math.sin(cam.radian) * cam.radius;
    camLight.position = camera.position;
    camera.lookAt({ x: 0, y: 0, z: 0 });
    camera.rotation.z = 0;
}
function render_all() {
    var a;
    for (a in planets) {
        if (planets.hasOwnProperty(a)) {
            scene.add(planets[a].mesh);
        }
    }
    scene.add(pointLight);
    scene.add(camLight);
    scene.add(sun_mesh);
    scene.add(cloudearthmesh);
    scene.add(saturnrings);
    renderer.render(scene, camera);
}
function animate() {
    roll = false;
    update_positions();
    render_all();
    requestAnimationFrame(animate);
}
function onDocumentMouseWheel(a) {
    var b = 0;
    if (!a) {
        a = window.event;
    }
    if (a.wheelDelta) {
        b = a.wheelDelta / 120;
        if (window.opera) {
            b = -b;
        }
    } else {
        if (a.detail) {
            b = -a.detail / 3;
        }
    }
    if (b) {
        cam.radius -= b * 10;
    }
    roll = true;
}
function onDocumentMouseDown(a) {
    a.preventDefault();
    mouse_down = true;
}
function onDocumentMouseUp(a) {
    a.preventDefault();
    mouse_down = false;
}
function onDocumentMouseMove(e) {
    e.preventDefault();
    var d = mouseX,
        c = mouseY,
        b,
        a;
    mouseX = e.clientX - window.innerWidth / 2;
    mouseY = e.clientY - window.innerHeight / 2;
    if (!(!mouse_down && !roll)) {
        cam.degree -= (mouseX - d) * -0.1;
        camera.position.z -= mouseY - c;
    }
}
cam.degree = 639.6541584398185;
camera.position.z = 80;
if (window.addEventListener) {
    window.addEventListener("DOMMouseScroll", onDocumentMouseWheel, false);
}
window.onmousewheel = document.onmousewheel = onDocumentMouseWheel;
window.addEventListener("mousedown", onDocumentMouseDown, false);
window.addEventListener("mouseup", onDocumentMouseUp, false);
window.addEventListener("mousemove", onDocumentMouseMove, false);
$("#earth").click(function () {
    cam.radius = 180;
    return false;
});
$("#saturn").click(function () {
    cam.radius = 480;
    return false;
});
var i,
    r = 20,
    starsGeometry = [new THREE.Geometry(), new THREE.Geometry()];
for (i = 0; i < 250; i++) {
    var vertex = new THREE.Vector3();
    vertex.x = Math.random() * 2 - 1;
    vertex.y = Math.random() * 2 - 1;
    vertex.z = Math.random() * 2 - 1;
    vertex.multiplyScalar(r);
    starsGeometry[0].vertices.push(vertex);
}
for (i = 0; i < 1500; i++) {
    var vertex = new THREE.Vector3();
    vertex.x = Math.random() * 2 - 1;
    vertex.y = Math.random() * 2 - 1;
    vertex.z = Math.random() * 2 - 1;
    vertex.multiplyScalar(r);
    starsGeometry[1].vertices.push(vertex);
}
var stars;
var starsMaterials = [
    new THREE.ParticleBasicMaterial({ color: 5592405, size: 2, sizeAttenuation: false }),
    new THREE.ParticleBasicMaterial({ color: 5592405, size: 1, sizeAttenuation: false }),
    new THREE.ParticleBasicMaterial({ color: 3355443, size: 2, sizeAttenuation: false }),
    new THREE.ParticleBasicMaterial({ color: 3815994, size: 1, sizeAttenuation: false }),
    new THREE.ParticleBasicMaterial({ color: 1710618, size: 2, sizeAttenuation: false }),
    new THREE.ParticleBasicMaterial({ color: 1710618, size: 1, sizeAttenuation: false }),
];
for (i = 10; i < 30; i++) {
    stars = new THREE.ParticleSystem(starsGeometry[i % 2], starsMaterials[i % 6]);
    stars.rotation.x = Math.random() * 6;
    stars.rotation.y = Math.random() * 6;
    stars.rotation.z = Math.random() * 6;
    s = i * 10;
    stars.scale.set(s, s, s);
    stars.matrixAutoUpdate = false;
    stars.updateMatrix();
    scene.add(stars);
}
var play = true;
$("#music").on("click", function () {
    var a = document.getElementsByTagName("audio")[0];
    if (play) {
        a.pause();
        play = false;
        $(this).text("|Music Off|");
    } else {
        a.play();
        play = true;
        $(this).text("|Music On|");
    }
    return false;
});
create_meshes();
animate();
