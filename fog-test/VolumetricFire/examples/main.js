// set path to texture images
// either relative or absolute path
VolumetricFire.texturePath = '../textures/';
var width = window.innerWidth;
var height = window.innerHeight;
var clock = new THREE.Clock();
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(60, width / height, .1, 1000);
camera.position.set(0, 0, 3);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);
var ambientlight = new THREE.AmbientLight(0x666655);
scene.add(ambientlight);
var pointlight = new THREE.PointLight(0xff9933, 1, 1.5);
pointlight.position.set(0, 1, 0);
scene.add(pointlight);
var textureLoader = new THREE.TextureLoader();
var groundColor = textureLoader.load('./images/groundcolor.jpg');
groundColor.wrapS = groundColor.wrapT = THREE.RepeatWrapping;
groundColor.repeat.set(6, 6);
var groundNormal = textureLoader.load('./images/groundnormal.jpg');
groundColor.wrapS = groundColor.wrapT = THREE.RepeatWrapping;
groundColor.repeat.set(6, 6);
var ground = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(10, 10),
    new THREE.MeshPhongMaterial({
        map: groundColor,
        normalMap: groundNormal,
        normalScale: new THREE.Vector2(0.8, 0.8),
    })
);
ground.rotation.x = Math.PI / -2;
scene.add(ground);
var fireplace;
var loader = new THREE.JSONLoader();
loader.load('./models/fireplace.json', function(geometry, materials) {
    fireplace = new THREE.Mesh(
        geometry,
        new THREE.MeshFaceMaterial(materials)
    );
    scene.add(fireplace);
});
var fireWidth = 7;
var fireHeight = 3;
var fireDepth = 5;
var sliceSpacing = 0.5;
var fire = new VolumetricFire(
    fireWidth,
    fireHeight,
    fireDepth,
    sliceSpacing,
    camera
);
scene.add(fire.mesh);
// you can set position, rotation and scale
// fire.mesh accepts THREE.mesh features
fire.mesh.position.set(0, fireHeight / 2, 0);
var smoke,
    NUM_OF_PARTICLE = 32,
    vertexShader,
    fragmentShader,
    texture,
    uniforms,
    material,
    geometry = new THREE.BufferGeometry(),
    position = new Float32Array(NUM_OF_PARTICLE * 3),
    shift = new Float32Array(NUM_OF_PARTICLE),
    i;
vertexShader = document.getElementById('smoke-vertexshader').textContent;
fragmentShader = document.getElementById('smoke-fragmentshader').textContent;
texture = textureLoader.load('./images/smoke.png');
uniforms = {
    time: {
        type: 'f',
        value: 0
    },
    size: {
        type: 'f',
        value: 3
    },
    texture: {
        type: 't',
        value: texture
    },
    lifetime: {
        type: 'f',
        value: 10
    },
    projection: {
        type: 'f',
        value: Math.abs(height / (2 * Math.tan(THREE.Math.degToRad(camera.fov))))
    }
};
material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: uniforms,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false
});
for (i = 0; i < NUM_OF_PARTICLE; i++) {
    position[i * 3 + 0] = THREE.Math.randFloat(-0.5, 0.5);
    position[i * 3 + 1] = 2.4;
    position[i * 3 + 3] = THREE.Math.randFloat(-0.5, 0.5);
    shift[i] = Math.random() * 1;
}
geometry.addAttribute('position', new THREE.BufferAttribute(position, 3));
geometry.addAttribute('shift', new THREE.BufferAttribute(shift, 1));
smoke = new THREE.Points(geometry, material);
smoke.sortParticles = true;
scene.add(smoke);
(function animate() {
    requestAnimationFrame(animate);
    var elapsed = clock.getElapsedTime();
    camera.position.set(
        Math.sin(elapsed * 0.1) * 4,
        Math.sin(elapsed * 0.5) * 1 + 2,
        Math.cos(elapsed * 0.1) * 4
    );
    camera.lookAt(scene.position);
    pointlight.intensity = Math.sin(elapsed * 30) * 0.25 + 3;
    smoke.material.uniforms.time.value = clock.getElapsedTime();
    fire.update(elapsed);
    renderer.render(scene, camera);
})();


// JavaScript Performance Monitor
var stats = new Stats();