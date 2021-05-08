if (!Detector.webgl) Detector.addGetWebGLMessage();
// Initialize Three.JS
initPointerLock(); //鼠标
initKeyDown(); //按键
init();//漫游玩家变量（ray -- 用于判断和物体的触碰 ， 速度） 后处理


loader = new THREE.SEA3D({

    autoPlay: true, // Auto play animations
    container: scene // Container to add models

});

loader.load('models/sea3d/sound.tjs.sea');
loader.onComplete = function (e) {

    audioListener = loader.audioListener;

    // sound filter

    soundFilter = audioListener.context.createBiquadFilter();
    soundFilter.type = 'lowpass';
    soundFilter.Q.value = 10;
    soundFilter.frequency.value = 440;

    // sound asset 1

    lightOutside = loader.getLight("Light1");

    var soundOutside = loader.getSound3D("Point001");
    soundOutsideAnalyser = new THREE.AudioAnalyser(soundOutside, 32);

    // sound asset 2 + area

    lightArea = loader.getLight("Light2");

    soundArea = loader.getSound3D("Point002");
    soundAreaAnalyser = new THREE.AudioAnalyser(soundArea, 512);

    collisionArea = loader.getMesh("Torus003");

    animate();

};









var clock = new THREE.Clock();
var audioPos = new THREE.Vector3();
var audioRot = new THREE.Euler();

function updateSoundFilter() {

    // difference position between sound and listener
    var difPos = new THREE.Vector3().setFromMatrixPosition(soundArea.matrixWorld).sub(audioPos);
    var length = difPos.length();

    // pick a vector from camera to sound
    raycaster.set(audioPos, difPos.normalize());

    // intersecting sound1
    if (length > 50 && raycaster.intersectObjects([collisionArea]).length) {

        if (soundArea.getFilters()[0] !== soundFilter) soundArea.setFilters([soundFilter]);

    } else if (soundArea.getFilters()[0] === soundFilter) {

        soundArea.setFilters([]);

    }

}

