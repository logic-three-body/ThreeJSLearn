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