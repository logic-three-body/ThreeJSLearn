# WebGL three.js-example 研究 -> misc_controls_pointerlock 漫游案例

## 背景

本文将分析three.js源码案例中的[misc_controls_pointerlock](http://www.yanhuangxueyuan.com/threejs/examples/?q=misc#misc_controls_pointerlock)，同时我的改进版在[这里](https://github.com/logic-three-body/ThreeJSLearn/tree/master/%E5%AE%9E%E9%AA%8C%E5%85%AD2)。

这个案例是玩家漫游场景，可以WASD（包括方向）移动和跳跃到方块，鼠标控制视角。

玩法很简单：初次进入游戏后点击继续（游戏提示已经写在屏幕上了），玩家四处移动，遇到方块可以跳到方块上（此处判断较为简单，没有碰撞检测，所以方块可以穿过）

![start.gif](https://github.com/logic-three-body/ThreeJSLearn/blob/master/%E5%AE%9E%E9%AA%8C%E5%85%AD2/img/orgin/start.gif?raw=true)



![](https://github.com/logic-three-body/ThreeJSLearn/blob/master/%E5%AE%9E%E9%AA%8C%E5%85%AD2/img/orgin/jump_high.gif?raw=true)

## 原版代码分析

原版版本：[here](https://github.com/logic-three-body/ThreeJSLearn/tree/e73819838593ca59c2dcf1eefc7cd2e2bf67aaf1/%E5%AE%9E%E9%AA%8C%E5%85%AD2)

### HTML部分

在引入的script中，three.js是图形库，PointerLockControls.js是鼠标控件，我将场景的实现拆分在了三个js文件里（loading my scene下面的三个）

main.js-> 所需的全局变量（如相机，场景，射线 raycaster【用于判断和物体的接触】）以及函数对象的使用

scene.js -> 包含场景里的几何体，光照，相机以及键盘事件

render.js -> 负责渲染的控件 ， 窗口自适应变换 ，实时渲染（内部的动画逻辑）

body部分设置了一个指示牌（当玩家按ESC暂停时可以看到）

```html
<!DOCTYPE html>
<html lang="en">

<head>
	<title>跳跳跳</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
	<link rel="stylesheet" href="CSS/style.css">

	<script src="JS/build/three.js" defer></script>
	<script src="JS/controls/PointerLockControls.js" defer></script>

	<!-- loading my scene -->
	<script src="JS/scene/scene.js" defer></script>
	<script src="JS/scene/render.js"></script>
	<script src="JS/scene/main.js" defer></script>
</head>

<body>


	<div id="blocker">

		<div id="instructions">
			<span style="font-size:40px">点击继续</span>
			<br />
			(W, A, S, D | ← ↑ → ↓ => 移动, 空格 => 跳， 鼠标左(右)键 => 移动视角 | ESC=>暂停)
		</div>

	</div>


</body>

</html>
```



### JS部分

**请结合代码和注释阅读**

辅助控件：[raycaster](http://www.yanhuangxueyuan.com/threejs/docs/index.html#api/zh/core/Raycaster)  [hemispherelight半球灯](http://www.yanhuangxueyuan.com/threejs/docs/index.html#api/zh/lights/HemisphereLight) [hemispherelighthelper](http://www.yanhuangxueyuan.com/threejs/docs/#api/zh/helpers/HemisphereLightHelper)

#### scene.js

```javascript
function init() {

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffff);
    scene.fog = new THREE.Fog(0xffff, 0, 750); //雾效

    var light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75); //光源直接放置于场景之上，光照颜色从天空光线颜色颜色渐变到地面光线颜色。
    light.position.set(0.5, 1, 0.75);
    scene.add(light);

    controls = new THREE.PointerLockControls(camera); //加入鼠标控件，此时鼠标即为摄像机视角
    scene.add(controls.getObject());

    //坐标辅助控件
    var axisHelper = new THREE.AxesHelper(25000); //红色代表 X 轴. 绿色代表 Y 轴. 蓝色代表 Z 轴
    //scene.add(axisHelper);
    //半球灯辅助控件


    var onKeyDown = function (event) { //控制场景移动 键盘按下事件

        switch (event.keyCode) {

            case 38: // up
            case 87: // w
                moveForward = true;
                break;

            case 37: // left
            case 65: // a
                moveLeft = true;
                break;

            case 40: // down
            case 83: // s
                moveBackward = true;
                break;

            case 39: // right
            case 68: // d
                moveRight = true;
                break;

            case 32: // space
                if (canJump === true) velocity.y += 350;
                canJump = false;
                break;

        }

    };

    var onKeyUp = function (event) { //键盘抬起事件

        switch (event.keyCode) {

            case 38: // up
            case 87: // w
                moveForward = false;
                break;

            case 37: // left
            case 65: // a
                moveLeft = false;
                break;

            case 40: // down
            case 83: // s
                moveBackward = false;
                break;

            case 39: // right
            case 68: // d
                moveRight = false;
                break;

        }

    };

    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);

    raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10); //raycaster用于判断和物体的接触【类比Unity】
    /*
      origin —— 光线投射的原点向量。
      direction —— 向射线提供方向的方向向量，应当被标准化。
      near —— 返回的所有结果比near远。near不能为负值，其默认值为0。
      far —— 返回的所有结果都比far近。far不能小于near，其默认值为Infinity（正无穷。）  
    */

    //以下为场景搭建 场景位置以及物体颜色随机生成

    /*
    注意：如果我把原代码里的random相关公式都存在变量里然后赋值，由于random是使用
    一次返回一次随机数，所以变量也要不停获取随机数
    */

    // floor
    var formula1, formula2, fixed = 0.75;
    var floorGeometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
    floorGeometry.rotateX(-Math.PI / 2);

    for (var i = 0, l = floorGeometry.vertices.length; i < l; i++) {

        var vertex = floorGeometry.vertices[i];
        var formulavx = Math.random() * 20 - 10;
        var formulavy = Math.random() * 2;
        var formulavz = Math.random() * 20 - 10;
        vertex.x += formulavx;
        vertex.y += formulavy;
        vertex.z += formulavz;

    }

    for (var i = 0, l = floorGeometry.faces.length; i < l; i++) {

        var face = floorGeometry.faces[i];
        formula1 = Math.random() * 0.3 + 0.5;
        formula2 = Math.random() * 0.25 + 0.75;
        face.vertexColors[0] = new THREE.Color().setHSL(formula1, fixed, formula2);
        formula1 = Math.random() * 0.3 + 0.5;
        formula2 = Math.random() * 0.25 + 0.75;
        face.vertexColors[1] = new THREE.Color().setHSL(formula1, fixed, formula2);
        formula1 = Math.random() * 0.3 + 0.5;
        formula2 = Math.random() * 0.25 + 0.75;
        face.vertexColors[2] = new THREE.Color().setHSL(formula1, fixed, formula2);

    }

    var floorMaterial = new THREE.MeshBasicMaterial({
        vertexColors: THREE.VertexColors
    });

    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    scene.add(floor);

    // objects
    var size = 20;
    var boxGeometry = new THREE.BoxGeometry(size, size, size);

    for (var i = 0, l = boxGeometry.faces.length; i < l; i++) { //设置方块颜色

        var face = boxGeometry.faces[i];
        formula1 = Math.random() * 0.3 + 0.5;
        formula2 = Math.random() * 0.25 + 0.75;
        face.vertexColors[0] = new THREE.Color().setHSL(formula1, fixed, formula2);
        formula1 = Math.random() * 0.3 + 0.5;
        formula2 = Math.random() * 0.25 + 0.75;
        face.vertexColors[1] = new THREE.Color().setHSL(formula1, fixed, formula2);
        formula1 = Math.random() * 0.3 + 0.5;
        formula2 = Math.random() * 0.25 + 0.75;
        face.vertexColors[2] = new THREE.Color().setHSL(formula1, fixed, formula2);

    }

    for (var i = 0; i < 500; i++) { //随机分布方块

        var boxMaterial = new THREE.MeshPhongMaterial({
            specular: 0xffffff,
            flatShading: true,
            vertexColors: THREE.VertexColors,
        });
        formula1 = Math.random() * 0.2 + 0.5;
        formula2 = Math.random() * 0.25 + 0.75;
        boxMaterial.color.setHSL(formula1, fixed, formula2);

        var box = new THREE.Mesh(boxGeometry, boxMaterial);
        var formulapx = Math.floor(Math.random() * 20 - 10) * 20;
        var formulapy = Math.floor( Math.random() * 20 ) * 20 + 10;
        var formulapz = Math.floor( Math.random() * 20 - 10 ) * 20;
        box.position.x = formulapx;
        box.position.y = formulapy;
        box.position.z = formulapz;
        //尝试让box.position.x=box.position.y=formulapx查看不同效果

        scene.add(box);
        objects.push(box);

    }

    //rendering

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    //auto resizing render

    window.addEventListener('resize', onWindowResize, false);

}
```



#### render.js

```javascript
function onWindowResize() {//自适应窗口渲染

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    requestAnimationFrame(animate);//每帧执行此函数

    if (controlsEnabled === true) {

        //当raycaster 射线 触碰到物体 ...
        raycaster.ray.origin.copy(controls.getObject().position);//初始化射线位置为玩家位置 copy复制属性
        raycaster.ray.origin.y -= 10;//如果玩家没有跳跃，则相当于射线原点现在地面（x,0,z）

        var intersections = raycaster.intersectObjects(objects);//与物体相交

        var onObject = intersections.length > 0;

        var time = performance.now();
        var delta = (time - prevTime) / 1000;//时间步长

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        //y轴（向上）模拟重力
        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveLeft) - Number(moveRight);
        direction.normalize(); // this ensures consistent movements in all directions

        if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

        if (onObject === true) {//当与物体交互可以跳跃

            velocity.y = Math.max(0, velocity.y);
            canJump = true;

        }

        //保证控件和玩家一起移动
        controls.getObject().translateX(velocity.x * delta);
        controls.getObject().translateY(velocity.y * delta);
        controls.getObject().translateZ(velocity.z * delta);

        if (controls.getObject().position.y < 10) {

            velocity.y = 0;
            controls.getObject().position.y = 10;

            canJump = true;

        }

        prevTime = time;

    }

    renderer.render(scene, camera);

}
```



#### main.js

```javascript
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
            .webkitPointerLockElement === element) {//游戏正常进行

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




```



## 文末推荐

[PointerLockControls.js 作者的博客](https://mrdoob.com/#/126/or_so_they_say)  （大佬内部有好多好玩的three.js小游戏，包括水、火、粒子模拟、物理模拟）

这里总结其精彩的案例，大家可以在浏览器里按F12,在开发者模式下阅读它的source code里的重要逻辑

### PointerLockControls.js 作者的博客

#### 水流模拟

https://mrdoob.com/#/115/water

https://mrdoob.com/#/116/water_remix

https://mrdoob.com/#/123/water_type

#### 火焰模拟

https://mrdoob.com/#/117/fire

#### 粒子模拟

https://mrdoob.com/#/110/branching

https://mrdoob.com/#/111/branching

https://mrdoob.com/#/112/branching

https://mrdoob.com/#/144/magic_dust

#### 小球物理模拟

https://mrdoob.com/#/91/ball_pool

https://mrdoob.com/#/150/beach_balls

#### 云雾模拟

https://mrdoob.com/#/131/clouds

#### voxels_liquid

https://mrdoob.com/#/137/voxels_liquid

#### 图形动画

https://mrdoob.com/#/126/or_so_they_say

https://mrdoob.com/#/152/obsidian

https://mrdoob.com/#/153/sporel