function init() {

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffff);
    scene.fog = new THREE.Fog(0xffff, 0, 850); //雾效

    var light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75); //光源直接放置于场景之上，光照颜色从天空光线颜色颜色渐变到地面光线颜色。
    light.position.set(0.5, 1, 0.75);
    //scene.add(light);

    //scene.add(camera);
    controls = new THREE.PointerLockControls(camera); //加入鼠标控件，此时鼠标即为摄像机视角
    scene.add(controls.getObject());

    //坐标辅助控件
    var axisHelper = new THREE.AxesHelper(25000); //红色代表 X 轴. 绿色代表 Y 轴. 蓝色代表 Z 轴
    axisHelper.position.set(0, 0, 0);
    //scene.add(axisHelper);
    //半球灯辅助控件
    var lighthelper = new THREE.HemisphereLightHelper(light, 500);
    //scene.add( lighthelper );

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
                if (canJump === true) velocity.y += 800;
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
        var fixed1 = 0.7;
        var face = floorGeometry.faces[i];
        formula1 = Math.random() * fixed1 + 0.5;
        formula2 = Math.random() * 0.25 + 0.75;
        face.vertexColors[0] = new THREE.Color().setHSL(formula1, fixed, formula2);
        formula1 = Math.random() * fixed1 + 0.5;
        formula2 = Math.random() * 0.25 + 0.75;
        face.vertexColors[1] = new THREE.Color().setHSL(formula1, fixed, formula2);
        formula1 = Math.random() * fixed1 + 0.5;
        formula2 = Math.random() * 0.25 + 0.75;
        face.vertexColors[2] = new THREE.Color().setHSL(formula1, fixed, formula2);

    }

    var floorMaterial = new THREE.MeshBasicMaterial({
        vertexColors: THREE.VertexColors
    });
    var textureLoader = new THREE.TextureLoader();
    var str1 = 'https://img2.baidu.com/it/u=2116410189,1585260632&fm=26&fmt=auto&gp=0.jpg';
    var str2 = 'img/pixel/sand.jpg';
    var sandtex = textureLoader.load(str2);
    var floorMaterial2 = new THREE.MeshLambertMaterial({
        //vertexColors: THREE.VertexColors,
       // color: 0xff,
        map: sandtex,
    });
    var floor = new THREE.Mesh(floorGeometry, floorMaterial2);
    scene.add(floor);

    // objects
    var size = 100;
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
    var num = 800;
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


    //加载大海龟
    var robot_loader = new THREE.SEA3D({

        autoPlay: true, // Auto play animations
        container: scene // Container to add models

    });
    // Open3DGC - Export by SEA3D Studio
    robot_loader.load('models/mascot.tjs.sea');


    //rendering
    robot_loader.onComplete = function (e) {
        animate();
    };
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);


    window.addEventListener('resize', onWindowResize, false);

}