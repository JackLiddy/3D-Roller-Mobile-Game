// import { OrbitControls } from "https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js";
// import * as THREE from "https://unpkg.com/three@0.127.0/build/three.module.js";

import * as THREE from "https://cdn.skypack.dev/three";
// import { OrbitControls } from "https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js";

// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Init global variables for scene
const canvas = document.querySelector("canvas.webgl");

let camera, scene, renderer;
let baseBrush, brush;
let core;
let result, evaluator, wireframe;
let ballMesh;
let obstacles = [];

let rotationChangeX = 0;
let rotationChangeY = 0;

let accelX = 0;
let accelY = 0;

let isMobile = null;
let is_running = false;

// motion vector accounting for power and direction
let degrees = 0;
let power = 0.00;

let angleRad = (degrees * Math.PI) / 180;

let velocityX = Math.cos(angleRad) * power;
let velocityZ = Math.sin(angleRad) * power;
let velocityY = 0; //test 0

console.log('angleRad: ' + angleRad);
console.log('velocityX: ' + velocityX);
console.log('velocityY: ' + velocityY);
console.log('velocityZ: ' + velocityZ);

let accelerationRate = 0.2;


var friction = 0.001;
var gravity = 0.2;
var bounciness = 0.9;

var ballRadius = 2;
var ballCircumference = Math.PI * ballRadius * 2;
var ballVelocity = new THREE.Vector3();
var ballRotationAxis = new THREE.Vector3(0, 1, 0);

let score = 0;
let gameClock = 0;


function init() {

    // environment
    // camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 100 );
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    camera.position.z = 15;
    camera.position.y = 10;
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

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    //set camera to look at ballMesh
    camera.lookAt(ballMesh.position);

    renderer.setSize(window.innerWidth, window.innerHeight);

    // controls
    //     const controls = new OrbitControls( camera, renderer.domElement );
    //     controls.minDistance = 5;
    //     controls.maxDistance = 75;
    // }

    addObstacle();


}

init();


const animate = function () {
    requestAnimationFrame(animate);

    if (is_running) {
        if (isMobile) {
            // Mobile mode motion controls
            // accelX = 0.5
            // accelY = 0.5
            if (accelX != null && accelY != null) {

                if (detectCollision() === true){
                    resetScore();
                }
                moveObstacles();
                updateScore();

                if (score % 100 === 0) {
                    addObstacle();
                }
                gameClock++;
                if (gameClock > 10000) {
                    gameClock = 0;
                    obstacles = [];
                }

                let mobileVelocityX = 0;
                let mobileVelocityY = 0;

                // diable motion if too low
                if (Math.abs(accelX) > 0.1) {
                    mobileVelocityX = accelX / 30;
                }
                // now the same for accelY and mobileVelocityY
                if (Math.abs(accelY) > 0.1) {
                    mobileVelocityY = -accelY / 30;
                }

                velocityX = mobileVelocityX;
                velocityZ = mobileVelocityY;
                //test += mobileVelocityX/50;

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

            if (detectCollision() === true){
                resetScore();
            }
            moveObstacles();
            updateScore();

            if (score % 100 === 0) {
                addObstacle();
            }
            gameClock++;
            if (gameClock > 10000) {
                gameClock = 0;
                obstacles = [];
            }

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
    console.log("key pressed: ", event.keyCode);
    switch (event.keyCode) {
        case 119:
            // w - up
            velocityZ -= accelerationRate;
            break;
        case 115:
            // s - down
            velocityZ += accelerationRate;
            break;
        case 97:
            // a - left
            velocityX -= accelerationRate;
            break;
        case 100:
            // d - right
            velocityX += accelerationRate;
            break;
    }
}


//function to add obstacles to the three.js scene
function addObstacle() {
    let obstacleGeometry = new THREE.BoxGeometry(1, 1, 1);
    let obstacleMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });
    let obstacleMesh = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
    obstacleMesh.position.x = Math.floor(Math.random() * 10);
    obstacleMesh.position.y = 0.5;
    obstacleMesh.position.z = Math.floor(Math.random() * 10);
    obstacles.push(obstacleMesh);
    scene.add(obstacleMesh);
}

function isColliding(ball, obstacle) {
    let ballX = ball.position.x;
    let ballY = ball.position.y;
    let ballZ = ball.position.z;

    let obstacleX = obstacle.position.x;
    let obstacleY = obstacle.position.y;
    let obstacleZ = obstacle.position.z;

    let distance = Math.sqrt(
        Math.pow(ballX - obstacleX, 2) +
            Math.pow(ballY - obstacleY, 2) +
            Math.pow(ballZ - obstacleZ, 2)
    );

    return distance < 2;
}

//function to detect collision between ball and obstacles
function detectCollision() {
    // console.log("detecting collision");
    for (let i = 0; i < obstacles.length; i++) {
        if (isColliding(ballMesh, obstacles[i])) {
            console.log("COLLISION DETECTED");
            // console.log("ball", ball.position);
            // console.log("obstacle", obstacles[i].position);
            return true;
        }
    }
    return false;
}

//function to update the score when the ball collides with an obstacle
function updateScore() {
    score++;
    let scoreElement = document.getElementById("score");
    scoreElement.innerHTML = score;
}

//function to reset the score when the ball collides with an obstacle
function resetScore() {
    score = 0;
    let scoreElement = document.getElementById("score");
    scoreElement.innerHTML = score;
}

//function to detect if the ball is out of bounds
function outOfBounds() {
    // console.log("detecting out of bounds");
    let ballX = ball.position.x;
    let ballZ = ball.position.z;
    let distance = Math.sqrt(Math.pow(ballX, 2) + Math.pow(ballZ, 2));

    // console.log("distance", distance);
    return distance > 10;
}

//function to move the position of all obstacles closer to ballMesh
function moveObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        let obstacle = obstacles[i];
        let obstacleX = obstacle.position.x;
        let obstacleZ = obstacle.position.z;

        let ballX = ballMesh.position.x;
        let ballZ = ballMesh.position.z;

        let distanceX = obstacleX - ballX;
        let distanceZ = obstacleZ - ballZ;

        let newX = obstacleX - distanceX / 70;
        let newZ = obstacleZ - distanceZ / 70;

        obstacle.position.x = newX;
        obstacle.position.z = newZ;
    }
}