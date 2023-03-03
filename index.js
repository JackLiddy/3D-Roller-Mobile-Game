// import { OrbitControls } from "https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js";
// import * as THREE from "https://unpkg.com/three@0.127.0/build/three.module.js";

import * as THREE from "https://cdn.skypack.dev/three";
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Init scene and renderer
const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

//camera.position.z = 5;
camera.position.z = 3;

const animate = function () {
  requestAnimationFrame(animate);

  //gx = document.getElementById('Accelerometer_gx').value;
  //gy = document.getElementById('Accelerometer_gy').value;
  var gx = 0;
  var gy = 0;

  if (gx == null) {
    gx = 0;
  }

  if (gy == null) {
    gy = 0;
  }
  //console.log(accelX);

  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
  //cube.rotation.x += 0.001 + gx/10;
  //cube.rotation.y += 0.001 + gy/10;


  let accelX = 5;
  let accelY = 5;

  if (accelX != null && accelY != null) {
    cube.rotation.x += 0.0001 + accelX / 100;
    cube.rotation.y += 0.0001 + accelY / 100;
  } else {
    cube.rotation.x += 0.0001;
    cube.rotation.y += 0.0001;
  }

  renderer.render(scene, camera);
};

animate();

function handleOrientation(event) {
  updateFieldIfNotNull("Orientation_a", event.alpha);
  updateFieldIfNotNull("Orientation_b", event.beta);
  updateFieldIfNotNull("Orientation_g", event.gamma);
  incrementEventCount();
}

function incrementEventCount() {
  let counterElement = document.getElementById("num-observed-events");
  let eventCount = parseInt(counterElement.innerHTML);
  counterElement.innerHTML = eventCount + 1;
}

function updateFieldIfNotNull(fieldName, value, precision = 10) {
  if (value != null)
    document.getElementById(fieldName).innerHTML = value.toFixed(precision);
    //innerHTML error
}

function handleMotion(event) {
//   accelX = event.accelerationIncludingGravity.x;
//   accelY = event.accelerationIncludingGravity.y;

  let accelX = 5;
  let accelY = 5;

  updateFieldIfNotNull(
    "Accelerometer_gx",
    event.accelerationIncludingGravity.x
  );
  updateFieldIfNotNull(
    "Accelerometer_gy",
    event.accelerationIncludingGravity.y
  );
  updateFieldIfNotNull(
    "Accelerometer_gz",
    event.accelerationIncludingGravity.z
  );

  updateFieldIfNotNull("Accelerometer_x", event.acceleration.x);
  updateFieldIfNotNull("Accelerometer_y", event.acceleration.y);
  updateFieldIfNotNull("Accelerometer_z", event.acceleration.z);

//   updateFieldIfNotNull("Accelerometer_i", event.interval, 2);
//   updateFieldIfNotNull("Gyroscope_z", event.rotationRate.alpha);
//   updateFieldIfNotNull("Gyroscope_x", event.rotationRate.beta);
//   updateFieldIfNotNull("Gyroscope_y", event.rotationRate.gamma);
  incrementEventCount();
}

let is_running = false;
let demo_button = document.getElementById("start_demo");
demo_button.onclick = function (e) {


  console.log('isIOSDevice: ', isIOSDevice());

  let browser = navigator.userAgent.toLowerCase();
  console.log('browser: ',  );
  console.log('isChrome: ', isChrome(browser));
  document.getElementById("Browser").innerHTML = browser;



  e.preventDefault();

  // Request permission for iOS 13+ devices
  if (
    DeviceMotionEvent &&
    typeof DeviceMotionEvent.requestPermission === "function"
  ) {
    DeviceMotionEvent.requestPermission();
  }

  if (is_running) {
    window.removeEventListener("devicemotion", handleMotion);
    window.removeEventListener("deviceorientation", handleOrientation);
    demo_button.innerHTML = "Start demo";
    demo_button.classList.add("btn-success");
    demo_button.classList.remove("btn-danger");
    is_running = false;
  } else {
    window.addEventListener("devicemotion", handleMotion);
    window.addEventListener("deviceorientation", handleOrientation);
    document.getElementById("start_demo").innerHTML = "Stop demo";
    demo_button.classList.remove("btn-success");
    demo_button.classList.add("btn-danger");
    is_running = true;
  }
};

//javascript function to detect if the browser is running on a mobile device
function isMobileDevice() {
  return (
    typeof window.orientation !== "undefined" ||
    navigator.userAgent.indexOf("IEMobile") !== -1
  );
}
//javascript function to detect if the browser is running on an iOS device
function isIOSDevice() {
  return (
    navigator.userAgent.match(/iPad/i) ||
    navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPod/i)
  );
}



//function to read the value of the orientation sensor on an iOS device
function readOrientation() {
  if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", handleOrientation, true);
  }
}

//function to detect if the browser is chrome
function isChrome(browser) {
  return browser.indexOf("chrome") > -1;
}

//function to detect what browser is running
// function detectBrowser() {
//   let browser = navigator.userAgent.toLowerCase();
//   if (isChrome(browser)) {
//     console.log("Browser is Chrome");
//   } else {
//     console.log("Browser is not Chrome");
//   }
// }