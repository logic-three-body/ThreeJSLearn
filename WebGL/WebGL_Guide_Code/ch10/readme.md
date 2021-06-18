# WebGL编程之Phong光照模型

## 前言

之前里利用[Three.js](https://logic-three-body.github.io/post/threejs-shader-shi-xian-phong-guang-zhao-mo-xing/)实现过Phong光照模型，也在[GAMES202作业0](https://github.com/logic-three-body/GAMES202_HQRTR/tree/master/homework0/src/shaders/phongShader)接触过phong shader，这次更接近底层，利用WebGL实现一个简易的Phong光照模型

项目工程：[here](https://github.com/logic-three-body/ThreeJSLearn/blob/master/WebGL/WebGL_Guide_Code/ch08/LightedTranslatedRotatedCube.js)

## 实现

### 数据的传递

立方体数据：顶点 顶点索引 法线 颜色

```js
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3

// Coordinates
var vertices = new Float32Array([
    1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,     // v0-v1-v2-v3 front
    1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,     // v0-v3-v4-v5 right
    1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,     // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, // v1-v6-v7-v2 left
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, // v7-v4-v3-v2 down
    1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0  // v4-v7-v6-v5 back
]);

// Colors
var colors = new Float32Array([
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // v0-v1-v2-v3 front
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // v0-v3-v4-v5 right
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // v0-v5-v6-v1 up
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // v1-v6-v7-v2 left
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // v7-v4-v3-v2 down
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0  // v4-v7-v6-v5 back
]);

// Normal
var normals = new Float32Array([
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,     // v0-v1-v2-v3 front
    1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,     // v0-v3-v4-v5 right
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,     // v0-v5-v6-v1 up
    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
    0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, // v7-v4-v3-v2 down
    0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0  // v4-v7-v6-v5 back
]);

// Indices of the vertices
var indices = new Uint8Array([
    0, 1, 2, 0, 2, 3,       // front
    4, 5, 6, 4, 6, 7,       // right
    8, 9, 10, 8, 10, 11,    // up
    12, 13, 14, 12, 14, 15, // left
    16, 17, 18, 16, 18, 19, // down
    20, 21, 22, 20, 22, 23  // back
]);
```

准备传入shader的数据

```js
// Get the storage locations of uniform variables
var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
var u_CameraPosition = gl.getUniformLocation(gl.program, 'u_CameraPosition');
```

设置光源方向以及环境光颜色

```js
// Set the light color (white)
gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
// Set the light direction (in the world coordinate)
var lightDirection = new Vector3([ 0.0, 3.0, 4.0 ]);
lightDirection.normalize(); // Normalize
gl.uniform3fv(u_LightDirection, lightDirection.elements);
// Set the ambient light
gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);
```

设置相机视角位置

```js
//Set Camera parm
var g_eyeX = 3,
    g_eyeY = 3,
    g_eyeZ = 7; // Eye position
var CameraPos = new Vector3(g_eyeX, g_eyeY, g_eyeZ);
gl.uniform3fv(u_CameraPosition, CameraPos.elements);
```

渲染函数

```js
function draw(gl, u_MvpMatrix, mvpMatrix, normalMatrix, modelMatrix, u_NormalMatrix, n) {
  mvpMatrix.multiply(modelMatrix);
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  // Calculate the matrix to transform the normal based on the model matrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  // Pass the transformation matrix for normals to u_NormalMatrix
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // Draw the cube
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}
```

#### model矩阵

可利用键盘控制model矩阵以控制物体旋转与平移（类比[GAMES101作业1](https://github.com/logic-three-body/GameS101_IntroductionTOcomputerGraph/tree/%E4%BD%9C%E4%B8%9A1/Roate_Project)）

最开始立方体先绕Z轴旋转90度

```js
modelMatrix.rotate(90, 0, 0, 1); // Rotate 90 degree around the z-axis
function keydown(ev, gl, u_MvpMatrix, mvpMatrix, normalMatrix, modelMatrix, u_NormalMatrix, n)
{
    var move = 0.01;
    var angle = 1;
    if (ev.keyCode == 39) // The right arrow key was pressed
    {
        console.log("PRESS 39");
        modelMatrix.setTranslate(0, -move, 0); // right arrow
    }
    else if (ev.keyCode == 37)
    {
        console.log("PRESS 37");
        modelMatrix.setTranslate(0, move, 0); // left arrow
    }
    else if (ev.keyCode == 40) // down arrow
    {
        console.log("PRESS 40");
        modelMatrix.setTranslate(-move, 0, 0);
    }
    else if (ev.keyCode == 38) // down arrow
    {
        console.log("PRESS 38");
        modelMatrix.setTranslate(move, 0, 0);
    }
    else if (ev.keyCode == 68) // down D
    {
        modelMatrix.rotate(90 + angle, 0, 0, 1); // left arrow
        console.log("PRESS D");
    }
    else if (ev.keyCode == 65) // down A
    {
        console.log("PRESS A");
        modelMatrix.rotate(90 - angle, 0, 0);
    }
    else if (ev.keyCode == 87) // down W
    {
        modelMatrix.rotate(90 + angle, 0, 1, 0); // left arrow
        console.log("PRESS W");
    }
    else if (ev.keyCode == 83) // down S
    {
        console.log("PRESS S");
        modelMatrix.rotate(90 - angle, 0, 1, 0);
    }
    else
    {
        return;
    }
    draw(gl, u_MvpMatrix, mvpMatrix, normalMatrix, modelMatrix, u_NormalMatrix, n);
}
```

#### mvp矩阵

设置view视角矩阵和projection投影矩阵 (p * v * m * vertexdata)

```js
// Calculate the view projection matrix
mvpMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);//projection
mvpMatrix.lookAt(g_eyeX, g_eyeY, g_eyeZ, 0, 0, 0, 0, 1, 0);//view
//...some code
mvpMatrix.multiply(modelMatrix);
```

#### 法线矩阵的处理

法线变换推到过程：请参考Unityshader入门精要/第四章/4.7 法线变换

这里给出结论：法线变换矩阵 = 原变换矩阵逆转置

![image-20210618145246902](https://i.loli.net/2021/06/18/zYo4Z5sefLcPkXr.png)

```js
// Calculate the matrix to transform the normal based on the model matrix
normalMatrix.setInverseOf(modelMatrix);
normalMatrix.transpose();
// Pass the transformation matrix for normals to u_NormalMatrix
gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
```

### shader实现

Phong光照模型实现的三要素：环境光+漫反射+高光，其中高光实现难度相对较大，需要利用视角方向和光源反射方向

```js
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' + // Transformation matrix of the normal
  'uniform vec3 u_LightColor;\n' + // Light color
  'uniform vec3 u_LightDirection;\n' + // Light direction (in the world coordinate, normalized)
  'uniform vec3 u_AmbientLight;\n' + // Ambient light color
  'uniform vec3 u_CameraPosition;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  // Recalculate the normal based on the model matrix and make its length 1.
  '  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  // Calculate the dot product of the light direction and the orientation of a surface (the normal)
  '  float nDotL = max(dot(u_LightDirection, normal), 0.0);\n' +
  // Calculate the color due to diffuse reflection
  '  vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;\n' +
  // Calculate the color due to ambient reflection
  '  vec3 ambient = u_AmbientLight * a_Color.rgb;\n' +
  //Calculate view direct
  ' vec3 viewDir = normalize(u_CameraPosition - gl_Position.xyz);' +
  //Calculate reflect direct
  ' vec3 reflectDir = reflect(u_LightDirection,normal);' +
  //Calculate specular
  'float spec =pow (max(dot(viewDir, reflectDir), 0.0), 35.0);' +
  'vec3 specular = u_LightColor*spec*4.0;' +
  //Add the surface colors due to diffuse reflection and ambient reflection and our specular for phong
  '  v_Color = vec4(diffuse + ambient + specular, a_Color.a);\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';
```

## 结果图

![phong模型2](https://i.loli.net/2021/06/18/6EbAJpvYBcTsCI8.gif)

## 参考

WebGL权威指南/第八章/示例程序（LightedTranslatedRotatedCube）

WebGL权威指南/第八章/魔法矩阵：逆转置矩阵

WebGL权威指南/第七章/示例程序（LookAtTrianglesWithKeys）