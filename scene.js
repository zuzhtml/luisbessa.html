import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { MeshBasicMaterial } from 'three';

// Import textures
import berserkSrc from './textures/berserk.jpg';
import evangelionSrc from './textures/evangelion.jpg';
import chainsawManSrc from './textures/chainsaw_man.jpg';
import jojoSrc from './textures/jojo.jpg';
import cowboyBebopSrc from './textures/cowboy_bebop.jpg';
import makimaSrc from './textures/makima.jpg';

import floorSrc from './textures/floor.jpg';
import ceilingSrc from './textures/ceiling.jpg';

let paintingSrcs = [berserkSrc, evangelionSrc, chainsawManSrc, jojoSrc, cowboyBebopSrc, makimaSrc];

const DEBUG = false;
const SHOW_STATS = false || DEBUG;
const HALL_DEPTH = (paintingSrcs.length * 10) + 25;
const HALL_WIDTH = 20;

let controls;
let stats;

// Initial setup

function calculateFOV() {
  let fov = 45;
  let ratio = window.innerHeight / window.innerWidth;

  return ratio <= 1 ? fov : fov - 15;
}

export function startScene(elementId) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(calculateFOV(), window.innerWidth / window.innerHeight, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById(elementId),
    antialias: window.devicePixelRatio <= 1,
    powerPreference: "high-performance"
  });

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  renderer.outputEncoding = THREE.sRGBEncoding;
  camera.position.set(0, 5, - 15);
  renderer.render(scene, camera);

  // Lights

  RectAreaLightUniformsLib.init();

  const rectLight1 = new THREE.RectAreaLight(0xff0000, 5, 4, 10);
  rectLight1.position.set(- 5, 5, 5);
  scene.add(rectLight1);

  const rectLight2 = new THREE.RectAreaLight(0x00ff00, 5, 4, 10);
  rectLight2.position.set(0, 5, 5);
  scene.add(rectLight2);

  const rectLight3 = new THREE.RectAreaLight(0x0000ff, 5, 4, 10);
  rectLight3.position.set(5, 5, 5);
  scene.add(rectLight3);

  scene.add(new RectAreaLightHelper(rectLight1));
  scene.add(new RectAreaLightHelper(rectLight2));
  scene.add(new RectAreaLightHelper(rectLight3));

  // Floor

  const floorTexture = new THREE.TextureLoader().load(floorSrc, (texture) => {
    texture.rotation = Math.PI / 2;
    texture.wrapT = texture.wrapS = THREE.RepeatWrapping;
    // texture.
  });

  const geoFloor = new THREE.BoxBufferGeometry(HALL_WIDTH, 0.1, HALL_DEPTH);
  const matStdFloor = new THREE.MeshStandardMaterial({ map: floorTexture, roughness: 0.5, metalness: 0 });
  const mshStdFloor = new THREE.Mesh(geoFloor, matStdFloor);
  mshStdFloor.position.z = - geoFloor.parameters.depth / 2 + 5;
  scene.add(mshStdFloor);

  // Ceiling

  const ceilingTexture = new THREE.TextureLoader().load(ceilingSrc, (texture) => {
    texture.wrapT = texture.wrapS = THREE.RepeatWrapping;
  })

  const matStdCeiling = new THREE.MeshStandardMaterial({ map: ceilingTexture, roughness: 1, metalness: 0 });
  const mshStdCeiling = new THREE.Mesh(geoFloor, matStdCeiling);
  mshStdCeiling.position.y = 12;
  mshStdCeiling.position.z = - geoFloor.parameters.depth / 2 + 5;
  scene.add(mshStdCeiling);

  // Walls

  const wall_distance = HALL_WIDTH / 2;

  const geoWall = new THREE.BoxBufferGeometry(0.1, 12, HALL_DEPTH);
  const matStdWall = new THREE.MeshStandardMaterial({ color: 0x3152a1, roughness: 0.5, metalness: 0 });
  const mshStdLeftWall = new THREE.Mesh(geoWall, matStdWall);
  mshStdLeftWall.position.set(- wall_distance, geoWall.parameters.height / 2, - geoWall.parameters.depth / 2 + 5);

  const mshStdRightWall = new THREE.Mesh(geoWall, matStdWall);
  mshStdRightWall.position.set(wall_distance, geoWall.parameters.height / 2, - geoWall.parameters.depth / 2 + 5);

  let walls = [mshStdLeftWall, mshStdRightWall];

  scene.add(...walls);

  // Add wall-floor protections (i forgot the name and can't seem to google-fu it)

  let geoProtection = new THREE.BoxBufferGeometry(1, 1, HALL_DEPTH);
  let matProtection = new THREE.MeshStandardMaterial({ color: 0x704733, roughness: 0.5, metalness: 0 });

  const addWallFloorProtection = (wall) => {
    let mshProtection = new THREE.Mesh(geoProtection, matProtection);
    mshProtection.position.copy(wall.position);
    mshProtection.position.y = geoProtection.parameters.height / 2;

    scene.add(mshProtection);
  }
  walls.forEach(addWallFloorProtection);

  // Backwall

  const geoBackWall = new THREE.BoxBufferGeometry(HALL_WIDTH, 12, 0.01);
  const mshStdBackWall = new THREE.Mesh(geoBackWall, matStdWall);
  mshStdBackWall.position.z = 5.05;
  mshStdBackWall.position.y = geoBackWall.parameters.height / 2;

  scene.add(mshStdBackWall);

  // Torus Knot

  const geometry = new THREE.TorusKnotBufferGeometry(1.5, 0.5, 64, 8);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.2 });
  const torusKnot = new THREE.Mesh(geometry, material);
  torusKnot.position.set(0, 5, 0);
  scene.add(torusKnot);

  camera.lookAt(torusKnot.position);

  // Paintings

  const paintGeometry = new THREE.BoxBufferGeometry(0.1, 8, 8);

  let paintingTextures = paintingSrcs.map(src => new THREE.TextureLoader().load(src));

  let paintings = paintingTextures.map((texture, index) => {
    let painting_z = (index+1) * - 10;
    let painting_x = (HALL_WIDTH / 2) - 0.1;
    // Choose side
    painting_x = index % 2 === 0 ? painting_x : - painting_x;

    let painting = new THREE.Mesh(paintGeometry, new THREE.MeshStandardMaterial({ map: texture, roughness: 0.7 }));
    painting.position.set(painting_x, 6.5, painting_z);
    return painting;
  });

  scene.add(...paintings);

  // Spotlights for paintings

  const generateSpotlightForPainting = (painting) => {
    let spotlight = new THREE.SpotLight(0xffffff, 0.07, 100, -1, 1, 10);
    let paint_light_x = painting.position.x + (painting.position.x < 0 ? 3 : -3);
    spotlight.position.set(paint_light_x, 12, painting.position.z);
    spotlight.target = painting;
    scene.add(spotlight);
  }
  paintings.forEach(generateSpotlightForPainting);

  // Debug

  if (DEBUG) {
    const gridHelper = new THREE.GridHelper(200, 50);
    scene.add(gridHelper);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(torusKnot.position);
    controls.update();
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper);
  }

  if (SHOW_STATS) {
    stats = new Stats();
    document.body.appendChild(stats.dom);
  }

  // Scroll Animation

  function moveCamera() {
    const t = document.body.getBoundingClientRect().top;

    camera.position.z = t * 0.01 - 15;
  }
  document.body.onscroll = moveCamera;
  moveCamera();

  // Animation Loop

  function animate(time) {
    if (SHOW_STATS) {
      console.log("Scene polycount:", renderer.info.render.triangles);
      console.log("Active Drawcalls:", renderer.info.render.calls);
      console.log("Textures in Memory", renderer.info.memory.textures);
      console.log("Geometries in Memory", renderer.info.memory.geometries);
      stats.update();
    }

    torusKnot.rotation.y = time / 1000;

    if (DEBUG) {
      controls.update();
    } else {
      camera.position.x = Math.sin(time / 1000);
    }

    renderer.render(scene, camera);
  }

  function onWindowResize() {

    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = (window.innerWidth / window.innerHeight);
    camera.fov = calculateFOV();
    camera.updateProjectionMatrix();

  }
  window.onresize = onWindowResize;

  // Debug at the end to remove HTML
  if (DEBUG) {
    document.getElementById('main').remove();
  }
}