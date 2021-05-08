var container, raycaster, stats;

var camera, scene, renderer, composer, controls, velocity;
var blocker, instructions;
var moveLeft, moveForward, moveBackward, moveRight;
var loader;
var audioListener, soundFilter, soundAreaAnalyser, soundOutsideAnalyser;
var soundArea, collisionArea, lightArea, lightOutside;



function animate() {

    var delta = clock.getDelta();

    animateCamera(delta);

    // Sound3D Spatial Transform Update
    loader.audioListener.position.copy(audioPos.setFromMatrixPosition(camera.matrixWorld));
    loader.audioListener.rotation.copy(audioRot.setFromRotationMatrix(camera.matrixWorld));

    // Update sound filter from raycaster intersecting
    updateSoundFilter();

    // light intensity from sound amplitude
    lightOutside.intensity = soundOutsideAnalyser.getAverageFrequency() / 100;
    lightArea.intensity = soundAreaAnalyser.getAverageFrequency() / 50;

    // Update SEA3D Animations
    THREE.SEA3D.AnimationHandler.update(delta);

    render(delta);

    stats.update();

    requestAnimationFrame(animate);

}

function render(delta) {

    //renderer.render( scene, camera );
    composer.render(delta);

}


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    composer.setSize(window.innerWidth, window.innerHeight);
    renderer.setSize(window.innerWidth, window.innerHeight);

}

//

function animateCamera(delta) {

    var scale = 1400;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    if (moveForward) velocity.z -= scale * delta;
    if (moveBackward) velocity.z += scale * delta;

    if (moveLeft) velocity.x -= scale * delta;
    if (moveRight) velocity.x += scale * delta;

    controls.getObject().translateX(velocity.x * delta);
    controls.getObject().translateZ(velocity.z * delta);

}