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