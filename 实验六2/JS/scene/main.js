var camera, scene, renderer, controls;

var objects = [];

var raycaster;

var blocker = document.getElementById('blocker');
var instructions = document.getElementById('instructions');

// http://www.html5rocks.com/en/tutorials/pointerlock/intro/

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document ||
    'webkitPointerLockElement' in document;

if (havePointerLock) {

    var element = document.body;

    var pointerlockchange = function (event) {

        if (document.pointerLockElement === element || document.mozPointerLockElement === element || document
            .webkitPointerLockElement === element) {

            controlsEnabled = true;
            controls.enabled = true;

            blocker.style.display = 'none';

        } else {//按ESC触发

            controls.enabled = false;

            blocker.style.display = 'block';//触发html中的blocker下的暂停指示

            instructions.style.display = '';

        }

    };

    var pointerlockerror = function (event) {

        instructions.style.display = '';

    };

    // Hook pointer lock state change events
    document.addEventListener('pointerlockchange', pointerlockchange, false);
    document.addEventListener('mozpointerlockchange', pointerlockchange, false);
    document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

    document.addEventListener('pointerlockerror', pointerlockerror, false);
    document.addEventListener('mozpointerlockerror', pointerlockerror, false);
    document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

    instructions.addEventListener('click', function (event) {

        instructions.style.display = 'none';

        // Ask the browser to lock the pointer
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element
            .webkitRequestPointerLock;
        element.requestPointerLock();

    }, false);

} else {

    instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

}

init();//创建场景
animate();

var controlsEnabled = false;

var moveForward = false;//移动判断
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;

var prevTime = performance.now();
var velocity = new THREE.Vector3();//用于移动的速度
var direction = new THREE.Vector3();



