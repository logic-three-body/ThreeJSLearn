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