import * as THREE from "three";

const scene = new THREE.Scene();

const bgTexture = new THREE.TextureLoader().load("images/eid pic BG.jpg");
scene.background = bgTexture;

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const cube = new THREE.Group();
scene.add(cube);

const size = 2;
const half = size / 2;
const loader = new THREE.TextureLoader();

const tex = {
    frontOut: loader.load("images/eid pic 13.jpg"),
    frontIn: loader.load("images/eid pic (D1).jpg"),
    backOut: loader.load("images/eid pic 11.jpg"),
    backIn: loader.load("images/eid pic (E1).jpg"),
    leftOut: loader.load("images/eid pic (E2).jpg"),
    leftIn: loader.load("images/eid pic 4.jpg"),
    rightOut: loader.load("images/eid pic (D2).jpg"),
    rightIn: loader.load("images/eid pic 12.jpg"),
    baseOut: loader.load("images/eid pic 10.jpg"),
    baseIn: loader.load("images/eid pic (I).jpg")
};

// --- BASE ---
const bottomPivot = new THREE.Object3D();
const bOuter = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: tex.baseOut }));
const bInner = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: tex.baseIn }));
bInner.rotation.y = Math.PI;
bottomPivot.add(bOuter, bInner);
bottomPivot.position.y = -half;
bottomPivot.rotation.x = Math.PI / 2;
cube.add(bottomPivot);

// --- WALL ---
function createWall(outerTex, innerTex, hingePos, meshRot = {}) {
    const pivot = new THREE.Object3D();
    const geo = new THREE.PlaneGeometry(size, size);
    geo.translate(0, half, 0);
    const outer = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: outerTex }));
    const inner = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: innerTex }));
    inner.rotation.y = Math.PI;
    if (meshRot.y) {
        outer.rotation.y = meshRot.y;
        inner.rotation.y = meshRot.y + Math.PI;
    }
    pivot.add(outer, inner);
    pivot.position.set(hingePos.x, hingePos.y, hingePos.z);
    cube.add(pivot);
    return pivot;
}

const frontPivot = createWall(tex.frontOut, tex.frontIn, { x: 0, y: -half, z: half });
const backPivot = createWall(tex.backOut, tex.backIn, { x: 0, y: -half, z: -half }, { y: Math.PI });
const leftPivot = createWall(tex.leftOut, tex.leftIn, { x: -half, y: -half, z: 0 }, { y: Math.PI / 2 });
const rightPivot = createWall(tex.rightOut, tex.rightIn, { x: half, y: -half, z: 0 }, { y: -Math.PI / 2 });

cube.scale.set(1.5, 1.5, 1.5);

// --- TEXT FUNCTION ---
function createTextSprite(message, fontSize = 160) {
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFD700";
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 40;
    ctx.fillText(message, canvas.width / 2, 300);
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(10, 2.5, 1);
    return sprite;
}

// --- Eid Text ---
const eidText = createTextSprite("Eid Mubarak", 180);
eidText.position.set(0, -2, 0);
eidText.visible = false;
scene.add(eidText);

// --- Name Text ---
const nameText = createTextSprite("From Muhammad Umer (B23110006117)", 100);
nameText.scale.set(7, 1.7, 1);
nameText.position.set(0, 4, 3);
nameText.visible = false;
scene.add(nameText);

// --- CONFETTI ---
const particleCount = 350;
const particleGeo = new THREE.BufferGeometry();
const positions = [];
for (let i = 0; i < particleCount; i++) {
    positions.push(
        (Math.random() - 0.5) * 8, 
        (Math.random() - 0.5) * 2.5, 
        (Math.random() - 0.5) * 4
    );
}
particleGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
const particleMat = new THREE.PointsMaterial({ color: 0xFFD700, size: 0.05 });
const confetti = new THREE.Points(particleGeo, particleMat);
confetti.visible = false;
scene.add(confetti);

let isRotating = true;
let fallAngle = 0;
const targetCamPos = new THREE.Vector3(0, 5, 8);

renderer.domElement.addEventListener("click", () => {
    isRotating = false;
    eidText.visible = true;
    nameText.visible = true;
    confetti.visible = true;
});

function animate() {
    if (isRotating) {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        camera.lookAt(0, 0, 0);
    } else {
        cube.rotation.x = THREE.MathUtils.lerp(cube.rotation.x, 0, 0.08);
        cube.rotation.y = THREE.MathUtils.lerp(cube.rotation.y, 0, 0.08);

        camera.position.lerp(targetCamPos, 0.08);
        camera.lookAt(0, 0, 0);

        if (fallAngle < Math.PI / 2) {
            fallAngle += 0.05;
            frontPivot.rotation.x = fallAngle;
            backPivot.rotation.x = -fallAngle;
            leftPivot.rotation.z = fallAngle;
            rightPivot.rotation.z = -fallAngle;
        }

        if (eidText.position.y < 2.2) eidText.position.y += 0.06;

        confetti.position.y = eidText.position.y;
        confetti.rotation.y += 0.015;

        if (nameText.position.y > -6.5) nameText.position.y -= 0.18;
    }
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});