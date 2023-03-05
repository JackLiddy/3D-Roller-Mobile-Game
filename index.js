// import { OrbitControls } from "https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js";
// import * as THREE from "https://unpkg.com/three@0.127.0/build/three.module.js";

import * as THREE from "https://cdn.skypack.dev/three";
// import { OrbitControls } from "https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js";

// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Init global variables for scene
const canvas = document.querySelector("canvas.webgl");
// const scene = new THREE.Scene();
// scene.background = new THREE.Color( 0xfce4ec );

// const camera = new THREE.PerspectiveCamera(
//     75,
//     window.innerWidth / window.innerHeight,
//     0.1,
//     1000
// );
// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

// Init initial geometry
// const geometry = new THREE.BoxGeometry();
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

//camera.position.z = 5;
// camera.position.z = 3;

// const renderer = new THREE.WebGLRenderer();

let camera, scene, renderer;
let baseBrush, brush;
let core;
let result, evaluator, wireframe;
let ballMesh;

let rotationChangeX = 0;
let rotationChangeY = 0;

let accelX = 0;
let accelY = 0;

let isMobile = null;
let is_running = false;


// var degrees = 35;
// var power = 0.45;

// motion vector accounting for power and direction
var degrees = 0;
var power = 0.00;

// var degrees = 35;
// var power = 0.01;

var angleRad = (degrees * Math.PI) / 180;

// var velocityX = Math.cos(angleRad) * power;
// var velocityY = Math.sin(angleRad) * power;
// var velocityZ = 0; //test 0

var velocityX = Math.cos(angleRad) * power;
var velocityZ = Math.sin(angleRad) * power;
var velocityY = 0; //test 0


console.log('angleRad: ' + angleRad);

console.log('velocityX: ' + velocityX);
console.log('velocityY: ' + velocityY);
console.log('velocityZ: ' + velocityZ);




// function to determine











// velocityX = -0.1;
// velocityY = 0.0;
// velocityZ = 0.0; //test 0


// var velocityX  = 0;
// var velocityY = 0;
// var velocityZ = 0.5;

let accelerationRate = 0.2;


var friction = 0.001;
var gravity = 0.2;
var bounciness = 0.9;

var ballRadius = 2;
var ballCircumference = Math.PI * ballRadius * 2;
var ballVelocity = new THREE.Vector3();
var ballRotationAxis = new THREE.Vector3(0, 1, 0);

//new approach
// var rotation_matrix = null;

// var setQuaternions = function () {
//     setMatrix();
//     ballMesh.rotation.set(Math.PI / 2, Math.PI / 4, Math.PI / 4); // Set initial rotation
//     ballMesh.matrix.makeRotationFromEuler(ballMesh.rotation); // Apply rotation to the object's matrix
// };
// var setMatrix = function () {
//     rotation_matrix = new THREE.Matrix4().makeRotationZ(angleRad); // Animated rotation will be in .01 radians along object's X axis
// };
// setQuaternions();

function init() {
    // camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 100 );
    // camera.position.set( - 1, 1, 1 ).normalize().multiplyScalar( 10 );

    // environment
    // camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 100 );
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    // camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 100 );
    // camera.position.set( - 1, 1, 1 ).normalize().multiplyScalar( 10 );

    camera.position.z = 10;
    // camera.position.set( - 1, 1, 1 ).normalize().multiplyScalar( 10 );

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfce4ec);

    // lights
    const ambient = new THREE.HemisphereLight(0xffffff, 0xbfd4d2, 0.9);
    scene.add(ambient);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
    directionalLight.position.set(1, 4, 3).multiplyScalar(3);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.setScalar(2048);
    directionalLight.shadow.bias = -1e-4;
    directionalLight.shadow.normalBias = 1e-4;
    scene.add(directionalLight);

    
    // const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.1);
    // directionalLight2.position.set(3, 10, 3).multiplyScalar(3);
    // directionalLight2.castShadow = true;
    // directionalLight2.shadow.mapSize.setScalar(2048);
    // directionalLight2.shadow.bias = -1e-4;
    // directionalLight2.shadow.normalBias = 1e-4;
    // scene.add(directionalLight2);

    // renderer = new THREE.WebGLRenderer();
    // renderer.setSize(window.innerWidth, window.innerHeight);
    // document.body.appendChild(renderer.domElement);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // add shadow plane
    // const plane = new THREE.Mesh(
    //     new THREE.PlaneGeometry(),
    //     new THREE.ShadowMaterial({
    //         color: 0xd81b60,
    //         transparent: true,
    //         opacity: 0.075,
    //         side: THREE.DoubleSide,
    //     })
    // );

        // add shadow plane
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(55, 55),
            new THREE.ShadowMaterial({
                color: 0xd81b60,
                transparent: true,
                opacity: 0.075,
                side: THREE.DoubleSide,
            })
        );
    plane.position.y = -2;
    plane.rotation.x = -Math.PI / 2;
    plane.scale.setScalar(10);
    plane.receiveShadow = true;
    scene.add(plane);

    const plane2 = new THREE.Mesh(
        new THREE.PlaneGeometry(),
        new THREE.ShadowMaterial({
            color: 0xd81b60,
            transparent: false,
            opacity: 0.0075,
            side: THREE.DoubleSide,
        })
    );
    plane2.position.y = -3.5;
    plane2.rotation.x = -Math.PI / 2;
    plane2.scale.setScalar(10);
    plane.receiveShadow = true;
    // scene.add(plane2);

    let ballGeometry = new THREE.IcosahedronGeometry(2, 3);
    let ballMaterial = new THREE.MeshStandardMaterial({
        flatShading: true,
        // color: 0xff9800,
        // emissive: 0xff9800,
        emissiveIntensity: 0.15,
        polygonOffset: true,
        polygonOffsetUnits: 1,
        polygonOffsetFactor: 1,
    });
    ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
    ballMesh.castShadow = true;
    scene.add(ballMesh);

    //     const geometry = new THREE.BoxGeometry();
    // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // const cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);

    // create wireframe
    // wireframe = new THREE.Mesh(
    //     undefined,
    //     new THREE.MeshBasicMaterial( { color: 0x009688, wireframe: true } ),
    // );
    // scene.add( wireframe );
    // create wireframe
    // wireframe = new THREE.Mesh(
    //     undefined,
    //     new THREE.MeshBasicMaterial( { color: 0x009688, wireframe: true } ),
    // );
    // scene.add( wireframe );

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    // controls
    //     const controls = new OrbitControls( camera, renderer.domElement );
    //     controls.minDistance = 5;
    //     controls.maxDistance = 75;
    // }
}

init();

var rotation_matrix = null;

var setQuaternions = function () {
    setMatrix();
    ballMesh.rotation.set(Math.PI / 2, Math.PI / 4, Math.PI / 4); // Set initial rotation
    ballMesh.matrix.makeRotationFromEuler(ballMesh.rotation); // Apply rotation to the object's matrix
};
var setMatrix = function () {
    rotation_matrix = new THREE.Matrix4().makeRotationZ(angleRad); // Animated rotation will be in .01 radians along object's X axis
};
setQuaternions();

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
                // ballMesh.rotation.x += accelX / 100;
                // ballMesh.rotation.y += accelY / 100;

                let mobileVelocityX = 0;
                let mobileVelocityY = 0;

                // diable motion if too low
                if (Math.abs(accelX) > 0.1) {
                    mobileVelocityX = accelX / 40;
                }
                // now the same for accelY and mobileVelocityY
                if (Math.abs(accelY) > 0.1) {
                    mobileVelocityY = -accelY / 40;
                }

                velocityX = mobileVelocityX;
                velocityZ = mobileVelocityY;

                // add velocity to ball
                ballMesh.position.x += velocityX;
                ballMesh.position.z += velocityZ;
                ballMesh.position.y += velocityY;
                // Figure out the rotation based on the velocity and radius of the ballMesh...
                ballVelocity.set(velocityX, velocityY, velocityZ);
                ballRotationAxis.set(0, 1, 0).cross(ballVelocity).normalize(); //!!!!!!
                var velocityMag = ballVelocity.length();
                var rotationAmount =
                    (velocityMag * (Math.PI * 2)) / ballCircumference;
                ballMesh.rotateOnWorldAxis(ballRotationAxis, rotationAmount);

                // apply friction
                if (velocityX > 0) {
                    velocityX -= friction;
                }
                else {
                    velocityX += friction;
                }
                if (velocityZ > 0) {   
                    velocityZ -= friction;
                }
                else {
                    velocityZ += friction;
                }

            } else {
                // cube.rotation.x += 0.0001;
                // cube.rotation.y += 0.0001;
            }
        } else if (isMobile === false) {
            // desktop controls

            // start of new test

            // add velocity to ball
            ballMesh.position.x += velocityX;
            ballMesh.position.z += velocityZ;
            ballMesh.position.y += velocityY;

            // ballMesh.position.z += 0.1;
            

            //validate if ball is stop moving
            // if (Math.abs(velocityX) < 0.02 && Math.abs(velocityY) < 0.02) {
            //     console.log("DONE!");
            //     return;
            // }
            // handle boucing effect
            // if (ballMesh.position.z < 1) {
            //     velocityZ *= -bounciness;
            //     ballMesh.position.z = 1;
            // }
            // Figure out the rotation based on the velocity and radius of the ballMesh...
            ballVelocity.set(velocityX, velocityY, velocityZ);
            ballRotationAxis.set(0, 1, 0).cross(ballVelocity).normalize(); //!!!!!!
            var velocityMag = ballVelocity.length();
            var rotationAmount =
                (velocityMag * (Math.PI * 2)) / ballCircumference;
            ballMesh.rotateOnWorldAxis(ballRotationAxis, rotationAmount);

            //reducing speed by friction
            // angleRad *= friction;
            // velocityX *= friction;
            // velocityY *= friction;
            // velocityZ *= friction;


            
            // let xDirection = velocityX > 0 ? 1 : -1;
            // let zDirection = velocityZ > 0 ? 1 : -1;

            if (velocityX > 0) {
                velocityX -= friction;
            }
            else {
                velocityX += friction;
            }
            if (velocityZ > 0) {   
                velocityZ -= friction;
            }
            else {
                velocityZ += friction;
            }



            // velocityX -= friction;
            // velocityY -= friction;
            // velocityZ -= friction;


            //validate ball is withing its borders otherwise go in the mirror direction
            // if (Math.abs(ballMesh.position.x) > borders[0]) {
            //     velocityX *= -1;
            //     ballMesh.position.x =
            //     ballMesh.position.x < 0 ? borders[0] * -1 : borders[0];
            // }

            // if (Math.abs(ballMesh.position.y) > borders[1]) {
            //     velocityY *= -1;
            //     ballMesh.position.y =
            //         ballMesh.position.y < 0 ? borders[1] * -1 : borders[1];
            // }

            // reduce ball height with gravity
            // velocityZ -= gravity;

            // end of new test

            // camera.position.z += 0.1;



            console.log("adjusting rotation via keyboard");
            // ballMesh.rotation.x += accelX / 100;
            // ballMesh.rotation.y += accelY / 100;
            // ballMesh.position.x -= ( accelY / 100);
            // ballMesh.position.z -= ( accelX / 100);
            // ballMesh.position.x += 0.1;
            // let rotateAngle1 = ( accelY / 100);
            // let rotateAngle2 = ( -accelX / 100);

            // let rotateAngle = 0.01;
            // ballMesh.rotateOnAxis(new THREE.Vector3(0,0,1), rotateAngle1);
            // ballMesh.rotateOnAxis(new THREE.Vector3(1,0,0), rotateAngle2);

            // let velocityX = 1;
            // let velocityZ = 0;
            // let velocityY = 0;

            // ballMesh.position.x += velocityX;
            // ballMesh.position.z += velocityZ;
            // ballMesh.position.y += velocityY;

            // // Figure out the rotation based on the velocity and radius of the ball...
            // ballVelocity.set(velocityX, velocityY, velocityZ);
            // ballRotationAxis.set(0, 0, 1).cross(ballVelocity).normalize();
            // var velocityMag = ballVelocity.length();
            // var rotationAmount =
            //     (velocityMag * (Math.PI * 2)) / ballCircumference;
            // ballMesh.rotateOnWorldAxis(ballRotationAxis, rotationAmount);

            // ballMesh.position.x += velocityX;
            // ballMesh.position.z += velocityZ;
            // ballMesh.position.y += velocityY;

            // ballMesh.position.y += accelX / 100;

            // ballMesh.rotation.set(along_x, along_y, along_z);
            // ballMesh.rotation.z += 1;
        }
    } else {
        //default rotation before method selection
        // cube.rotation.x += 0.005;
        // cube.rotation.y += 0.005;
    }

    // camera.position.z += 0.05;
    // camera.position.y += 0.01;

    //rotate camera around postition of the ball
    // camera.position.x = ballMesh.position.x + 10 * Math.sin( Date.now() / 1000 );
    // camera.position.z = ballMesh.position.z + 10 * Math.cos( Date.now() / 1000 );
    // camera.lookAt( ballMesh.position );

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
    accelX = event.accelerationIncludingGravity.x;
    accelY = event.accelerationIncludingGravity.y;

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

        //hide popover
        document.getElementById("popover").style.display = "none";
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
        //hide popover
        document.getElementById("popover").style.display = "none";
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

//funtion to detect keypress of w a s d keys
function handleKeyDown(event) {
    // console.log("key pressed: ", event.keyCode);
    switch (event.keyCode) {
        case 119:
            // w - up
            console.log("up");
            // accelX += 1;
            velocityZ -= accelerationRate;
            // cube.rotation.x += 0.05;
            // accelX =
            // console.log('left');
            break;
        case 115:
            // s - down
            // accelX -= 1;
            velocityZ += accelerationRate;
            // cube.rotation.y += 0.05;
            // console.log('up');
            break;
        case 97:
            // a - left
            velocityX -= accelerationRate;
            // accelY += 1;
            // cube.rotation.x -= 0.05;
            break;
        case 100:
            // d - right
            velocityX += accelerationRate;
            // accelY -= 1;
            // cube.rotation.y -= 0.05;
            break;
    }
}
