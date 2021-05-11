# WebGL three.js-example 研究 -> misc_controls_pointerlock 漫游案例

## 背景

本文将分析three.js源码案例中的[misc_controls_pointerlock](http://www.yanhuangxueyuan.com/threejs/examples/?q=misc#misc_controls_pointerlock)，同时我的改进版在[这里](https://github.com/logic-three-body/ThreeJSLearn/tree/master/%E5%AE%9E%E9%AA%8C%E5%85%AD2)。

这个案例是玩家漫游场景，可以WASD（包括方向）移动和跳跃到方块，鼠标控制视角。

玩法很简单：初次进入游戏后点击继续（游戏提示已经写在屏幕上了），玩家四处移动，遇到方块可以跳到方块上（此处判断较为简单，没有碰撞检测，所以方块可以穿过）

![](![start.gif](https://github.com/logic-three-body/ThreeJSLearn/blob/master/%E5%AE%9E%E9%AA%8C%E5%85%AD2/img/orgin/start.gif?raw=true)



![](https://github.com/logic-three-body/ThreeJSLearn/blob/master/%E5%AE%9E%E9%AA%8C%E5%85%AD2/img/orgin/jump_high.gif?raw=true)

## 原版代码分析

### HTML部分

在引入的script中，three.js是图形库，PointerLockControls.js是鼠标控件，我将场景的实现拆分在了三个js文件里（loading my scene下面的三个）

main.js-> 所需的全局变量（如相机，场景，射线 raycaster【用于判断和物体的接触】）以及函数对象的使用

scene.js -> 包含场景里的几何体，光照，相机以及键盘事件

render.js -> 负责渲染的控件 ， 窗口自适应变换 ，实时渲染（内部的动画逻辑）

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

辅助控件：[raycaster](http://www.yanhuangxueyuan.com/threejs/docs/index.html#api/zh/core/Raycaster) 

#### scene.js



#### render.js

```javascript
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    requestAnimationFrame(animate);

    if (controlsEnabled === true) {

        //当raycaster 射线 触碰到物体
        raycaster.ray.origin.copy(controls.getObject().position);
        raycaster.ray.origin.y -= 10;

        var intersections = raycaster.intersectObjects(objects);

        var onObject = intersections.length > 0;

        var time = performance.now();
        var delta = (time - prevTime) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

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