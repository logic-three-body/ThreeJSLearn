# WebGL three.js-example 研究 -> misc_controls_pointerlock 漫游案例

## 背景

本文将分析three.js源码案例中的[misc_controls_pointerlock](http://www.yanhuangxueyuan.com/threejs/examples/?q=misc#misc_controls_pointerlock)，同时我的改进版在[这里](https://github.com/logic-three-body/ThreeJSLearn/tree/master/%E5%AE%9E%E9%AA%8C%E5%85%AD2)。

这个案例是玩家漫游场景，可以WASD（包括方向）移动和跳跃到方块，鼠标控制视角。

玩法很简单：初次进入游戏后点击继续（游戏提示已经写在屏幕上了），玩家四处移动，遇到方块可以跳到方块上（此处判断较为简单，没有碰撞检测，所以方块可以穿过）

![start.gif](https://github.com/logic-three-body/ThreeJSLearn/blob/master/%E5%AE%9E%E9%AA%8C%E5%85%AD2/img/orgin/start.gif?raw=true)



![](https://github.com/logic-three-body/ThreeJSLearn/blob/master/%E5%AE%9E%E9%AA%8C%E5%85%AD2/img/orgin/jump_high.gif?raw=true)

## 原版代码分析

原版版本：[here](https://github.com/logic-three-body/ThreeJSLearn/tree/e73819838593ca59c2dcf1eefc7cd2e2bf67aaf1/%E5%AE%9E%E9%AA%8C%E5%85%AD2)

**您需要的配置：vscode+live server**

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



## 小游戏：海底大冒险

### 前言

我们可以利用这个漫游框架做些什么小游戏呢，这个漫游框架里有很多值得考究和学习的地方，至于我为什么取了一个海底大冒险的名字，让我们看看我修改添加了哪些代码吧。

**体验工程地址**：[here](https://github.com/logic-three-body/ThreeJSLearn/tree/master/%E5%AE%9E%E9%AA%8C%E5%85%AD2)

### 游戏截图

![海龟漫游.gif](https://github.com/logic-three-body/ThreeJSLearn/blob/master/%E5%AE%9E%E9%AA%8C%E5%85%AD2/img/after/%E6%B5%B7%E9%BE%9F%E6%BC%AB%E6%B8%B8.gif?raw=true)



### 代码分析

#### 加载大海龟模型

加载的海龟是[sea3d](https://sea3d.en.softonic.com/)格式，具体说明请查看[here](http://www.yanhuangxueyuan.com/threejs/examples/?q=sea3d#webgl_loader_sea3d)



```javascript
    //加载大海龟
    var robot_loader = new THREE.SEA3D({

        autoPlay: true, // Auto play animations
        container: scene // Container to add models

    });
    // Open3DGC - Export by SEA3D Studio
    robot_loader.load('models/mascot.tjs.sea');


    //load render and animation
    robot_loader.onComplete = function (e) {
        animate();
    };
```

在render.js模块的animate加入模型动画加载

```javascript
    // Update SEA3D Animations
    THREE.SEA3D.AnimationHandler.update(delta);
```

#### 海底气氛营造

由于加载的模型文件格式是整个场景（即内部已配置灯光），为简化逻辑【如果想更加精细地定制场景，three.js可以通过一些接口修改sea3d文件内部灯光、模型等】以及让场景不过亮，我将原来框架的半球灯关掉，然后修改背景和雾效颜色,

营造海底模糊的气氛，同时我把plane海底地面加载了沙地贴图。

```javascript
    scene.background = new THREE.Color(0xffff);
    scene.fog = new THREE.Fog(0xffff, 0, 850); //雾效

    var light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75); //光源直接放置于场景之上，光照颜色从天空光线颜色颜色渐变到地面光线颜色。
    light.position.set(0.5, 1, 0.75);
    //scene.add(light);
```

```javascript
    var textureLoader = new THREE.TextureLoader();
    var str1 = 'https://img2.baidu.com/it/u=2116410189,1585260632&fm=26&fmt=auto&gp=0.jpg';
    var str2 = './img/pixel/sand.jpg';
    var sandtex = textureLoader.load(str2);
    var floorMaterial2 = new THREE.MeshLambertMaterial({
        //vertexColors: THREE.VertexColors,
       // color: 0xff,
        map: sandtex,
    });
    var floor = new THREE.Mesh(floorGeometry, floorMaterial2);
    scene.add(floor);
```

##### ！！！注意事项！！！

由于我的Javascript部分都是在JS文件里写的，所以在加载图片和音频url，我遇到了问题

如果您观察我工程的文件目录，贴图和音频的本地地址在js文件里应该是【如下】  

```javascript
  var str2 = '../../img/pixel/sand.jpg';
```

浏览器此时会提示

![image-20210521095426812](C:\Users\lenovo\AppData\Roaming\Typora\typora-user-images\image-20210521095426812.png)

即找不到文件位置，后来我明白了其实文件的路径应该是以html文件为准，因为script文件要引入html，其实都相当于把所有script拼成大script放进html

所以正确的加载格式：

```javascript
    var str2 = './img/pixel/sand.jpg';
```

或（ **./ ** 表示当前目录）

```javascript
    var str2 = 'img/pixel/sand.jpg';
```



当然我的环境是vscode+livesever模拟了服务器环境，直接打开html文件，浏览器会因为安全原因阻止你的任何图片、音频等

#### 方块的分布

玩家一出生是在海龟体内的，游戏的逻辑是玩家仅可以跳跃到方块，没有复杂的碰撞检测【玩家可以穿过模型、方块和一切】,所以我尽量让方块分布在大海龟周围，这样玩家可以跳到方块上从不同角度观察大海龟。

```javascript
    var num = 800;//方块数量
    for (var i = 0; i < num; i++) { //随机分布方块

        var boxMaterial = new THREE.MeshBasicMaterial({
            vertexColors: THREE.VertexColors,
        });
        formula1 = Math.random() * 0.2 + 0.5;
        formula2 = Math.random() * 0.25 + 0.75;
        boxMaterial.color.setHSL(formula1, fixed, formula2);
        var coef1=60, coef2=10;//这两个系数控制方块距离海龟的远近
        var box = new THREE.Mesh(boxGeometry, boxMaterial);
        var formulapx = Math.floor(Math.random() * coef1 - coef2) * coef1;
        var formulapy = Math.floor(Math.random() * coef1) * coef1 + coef1;
        var formulapz = Math.floor(Math.random() * coef1 - coef2) * coef1;
        box.position.x = formulapx;
        box.position.y = formulapy;
        box.position.z = formulapz;
        //尝试让box.position.x=box.position.y=formulapx查看不同效果
        scene.add(box);
        objects.push(box);
    }
```

#### 游戏中的物理

velocity和玩家位移有关，speed用于控制玩家移动的快慢， 在原框架中，y向【竖直向】模拟重力加速度-9.8，我希望在水中y向加速度小些营造飘荡的感觉，所以这个物理量除3。

```javascript
    if (controlsEnabled === true) {

        //当raycaster 射线 触碰到物体 ...
        raycaster.ray.origin.copy(controls.getObject().position);//初始化射线位置为玩家位置 copy复制属性
        raycaster.ray.origin.y -= 10;//如果玩家没有跳跃，则相当于射线原点现在地面（x,0,z）

        var intersections = raycaster.intersectObjects(objects);//与物体相交

        var onObject = intersections.length > 0;

        var time = performance.now();
        var delta = (time - prevTime) / 1000;//时间步长
        var speed = 10;//控制移动速度
        velocity.x -= velocity.x * speed * delta;
        velocity.z -= velocity.z * speed * delta;
        //y轴（向上）模拟重力
        velocity.y -= 9.8/3 * 100.0 * delta; // 100.0 = mass 降低重力加速度营造海底移动感觉

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveLeft) - Number(moveRight);
        direction.normalize(); // this ensures consistent movements in all directions

        if (moveForward || moveBackward) velocity.z -= direction.z * 400.0*speed * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0*speed * delta;

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
```

#### 音乐加载模块 music.js

我在场景中某位置放置了一个音源，用户听到的音乐与和它的距离有关。

```javascript
// 用来定位音源的网格模型
var audiobox = new THREE.BoxGeometry(10, 10, 10); //创建一个立方体几何对象Geometry
var music_mat = new THREE.MeshBasicMaterial({
    color: 0x0000ff
  }); //材质对象Material
var audioMesh = new THREE.Mesh(audiobox, music_mat);
// 设置网格模型的位置，相当于设置音源的位置
audioMesh.position.set(0, 0, 300);
scene.add(audioMesh);
// 创建一个虚拟的监听者
var listener = new THREE.AudioListener();
// 监听者绑定到相机对象
camera.add(listener);
// 创建一个位置音频对象,监听者作为参数,音频和监听者关联。
var PosAudio = new THREE.PositionalAudio(listener);
//音源绑定到一个网格模型上
audioMesh.add(PosAudio);
// 创建一个音频加载器
var audioLoader = new THREE.AudioLoader();
// 加载音频文件，返回一个音频缓冲区对象作为回调函数参数
var str1 = 'SFX/sea.mp3';
var str2 = 'https/www.ear0.com/sound/show/soundid-20708';
//var str2 ='F:/百度网盘文件自动备份至天翼云/编程/WebGL/school/Three.js源码/实验六2/SFX/sea.mp3';
audioLoader.load(str1, function(AudioBuffer) {
  // console.log(buffer);
  // 音频缓冲区对象关联到音频对象audio
  PosAudio.setLoop(true); //是否循环
  PosAudio.setBuffer(AudioBuffer);
  PosAudio.setVolume(1); //音量
  PosAudio.setRefDistance(200); //参数值越大,声音越大
  PosAudio.play(); //播放
});
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