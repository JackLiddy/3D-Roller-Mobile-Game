// import { OrbitControls } from "https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js";
// import * as THREE from "https://unpkg.com/three@0.127.0/build/three.module.js";

import * as THREE from "https://cdn.skypack.dev/three";
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Init global variables for scene
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

// Init initial geometry
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

//camera.position.z = 5;
camera.position.z = 3;

let rotationChangeX = 0;
let rotationChangeY = 0;

let accelX = 0;
let accelY = 0;

let isMobile = null;
let is_running = false;

const animate = function () {
    requestAnimationFrame(animate);

    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;
    //cube.rotation.x += 0.001 + gx/10;
    //cube.rotation.y += 0.001 + gy/10;

    //update rotation 
    if (is_running) {
        if (isMobile) {
            if (accelX != null && accelY != null) {
                // console.log(rotating );
                cube.rotation.x += 0.0001 + accelX / 100;
                cube.rotation.y += 0.0001 + accelY / 100;
            } else {
                // cube.rotation.x += 0.0001;
                // cube.rotation.y += 0.0001;
            }   
        }
        else if (isMobile === false) {
            console.log('adjusting rotation via keyboard');
            cube.rotation.x += accelX / 100;
            cube.rotation.y += accelY / 100;
        }
    }
    else {
        //default rotation
        // cube.rotation.x += 0.005;
        // cube.rotation.y += 0.005;
    }

    renderer.render(scene, camera);
};

animate();

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

// handle device orientation change
// function handleOrientation(event) {
//     updateFieldIfNotNull("Orientation_a", event.alpha);
//     updateFieldIfNotNull("Orientation_b", event.beta);
//     updateFieldIfNotNull("Orientation_g", event.gamma);
//     incrementEventCount();
// }

// Handle device motion change
function handleMotion(event) {
    //   accelX = event.accelerationIncludingGravity.x;
    //   accelY = event.accelerationIncludingGravity.y;

      accelY = event.accelerationIncludingGravity.x;
      accelX = event.accelerationIncludingGravity.y;

    console.log("motion event handled");

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

let usingKeyboardButton = document.getElementById("using_keyboard");
usingKeyboardButton.onclick = function (e) {
    e.preventDefault();
    console.log("KEYBOARD BUTTON CLICKED");
    window.addEventListener("keypress", handleKeyDown);
    isMobile = false;

    // Toggle running state and mobile button
    if (is_running) {
        window.removeEventListener("devicemotion", handleMotion);
        // window.removeEventListener("deviceorientation", handleOrientation);
        usingKeyboardButton.innerHTML = "Use Keyboard";
        usingKeyboardButton.classList.add("btn-success");
        usingKeyboardButton.classList.remove("btn-danger");
        is_running = false;
    } else {
        window.addEventListener("devicemotion", handleMotion);
        // window.addEventListener("deviceorientation", handleOrientation);
        document.getElementById("using_mobile").innerHTML = "Stop Playing";
        usingKeyboardButton.classList.remove("btn-success");
        usingKeyboardButton.classList.add("btn-danger");
        is_running = true;
    }

};

let usingMobileButton = document.getElementById("using_mobile");
usingMobileButton.onclick = function (e) {
    console.log("MOBILE BUTTON CLICKED");
    isMobile = true;

    //   console.log('isIOSDevice: ', isIOSDevice());

    //   let browser = navigator.userAgent.toLowerCase();
    //   console.log('browser: ',  );
    //   console.log('isChrome: ', isChrome(browser));
    //   document.getElementById("Browser").innerHTML = browser;

    e.preventDefault();

    // Request permission for iOS 13+ devices
    if (
        DeviceMotionEvent &&
        typeof DeviceMotionEvent.requestPermission === "function"
    ) {
        DeviceMotionEvent.requestPermission();
    }

    // Toggle running state and mobile button
    if (is_running) {
        window.removeEventListener("devicemotion", handleMotion);
        // window.removeEventListener("deviceorientation", handleOrientation);
        usingMobileButton.innerHTML = "Mobile Device";
        usingMobileButton.classList.add("btn-success");
        usingMobileButton.classList.remove("btn-danger");
        is_running = false;
        isMobile = false;
    } else {
        window.addEventListener("devicemotion", handleMotion);
        // window.addEventListener("deviceorientation", handleOrientation);
        document.getElementById("using_mobile").innerHTML = "Stop Playing";
        usingMobileButton.classList.remove("btn-success");
        usingMobileButton.classList.add("btn-danger");
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
// function readOrientation() {
//   if (window.DeviceOrientationEvent) {
//     window.addEventListener("deviceorientation", handleOrientation, true);
//   }
// }

//function to detect if the browser is chrome
// function isChrome(browser) {
//   return browser.indexOf("chrome") > -1;
// }

//function to detect what browser is running
// function detectBrowser() {
//   let browser = navigator.userAgent.toLowerCase();
//   if (isChrome(browser)) {
//     console.log("Browser is Chrome");
//   } else {
//     console.log("Browser is not Chrome");
//   }
// }

//funtion to detect keypress of w a s d keys
function handleKeyDown(event) {
    // console.log("key pressed: ", event.keyCode);
    switch (event.keyCode) {
        case 119:
            // w - up
            console.log("up");
            accelX += 1;
            // cube.rotation.x += 0.05;
            // accelX = 
            // console.log('left');
            break;
        case 115:
            // s - down
            accelX -= 1;
            // cube.rotation.y += 0.05;
            // console.log('up');
            break;
        case 97:
            // a - left
            accelY += 1;
            // cube.rotation.x -= 0.05;
            break;
        case 100:
            // d - right
            accelY -= 1;
            // cube.rotation.y -= 0.05;
            break;
    }

    // switch (event.keyCode) {
    //     case 37:
    //         // left
    //         cube.rotation.x += 0.05;
    //         console.log('left');
    //         break;
    //     case 38:
    //         // up
    //         cube.rotation.y += 0.05;
    //         console.log('up');
    //         break;
    //     case 39:
    //         // right
    //         cube.rotation.x -= 0.05;
    //         break;
    //     case 40:
    //         // down
    //         cube.rotation.y -= 0.05;
    //         break;
    // }
}