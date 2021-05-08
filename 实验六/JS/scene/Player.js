function init() {

    raycaster = new THREE.Raycaster();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333333);

    velocity = new THREE.Vector3();

    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);

    controls = new THREE.PointerLockControls(camera);
    scene.add(controls.getObject());

    controls.getObject().translateX(250);
    controls.getObject().translateZ(250);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    stats = new Stats();
    container.appendChild(stats.dom);

    // post-processing

    composer = new THREE.EffectComposer(renderer);

    var renderPass = new THREE.RenderPass(scene, camera);
    var copyPass = new THREE.ShaderPass(THREE.CopyShader);
    composer.addPass(renderPass);

    var vh = 1.4,
        vl = 1.2;

    var colorCorrectionPass = new THREE.ShaderPass(THREE.ColorCorrectionShader);
    colorCorrectionPass.uniforms["powRGB"].value = new THREE.Vector3(vh, vh, vh);
    colorCorrectionPass.uniforms["mulRGB"].value = new THREE.Vector3(vl, vl, vl);
    composer.addPass(colorCorrectionPass);

    var vignettePass = new THREE.ShaderPass(THREE.VignetteShader);
    vignettePass.uniforms["darkness"].value = 1.0;
    composer.addPass(vignettePass);

    composer.addPass(copyPass);
    copyPass.renderToScreen = true;

    // events

    window.addEventListener('resize', onWindowResize, false);

}