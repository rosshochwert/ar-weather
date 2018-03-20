var camera, scene, renderer;
var geometry, material, mesh;
var sphere;

init();
animate();

function onResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

function init() {

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.001, 10000 );
	camera.position.z = 5;

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xff0000 );
	createCube();
}

// function createSun(){
// 	var geometry = new THREE.IcosahedronGeometry(1, 1);
// 	var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
// 	mesh = new THREE.Mesh( geometry, material );
// 	mesh.castShadow = true;
//     mesh.receiveShadow = true;
//     mesh.position.set(0, 0, 0);

// 	scene.add( mesh );
// 	render();
// }

function createCube(){
	var geometry = new THREE.IcosahedronGeometry(1, 1);
	var material = new THREE.MeshPhongMaterial({
		color: 0xffd927,
		shading: THREE.FlatShading
	});

	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );
	

	// add subtle ambient lighting
    var ambientLight = new THREE.AmbientLight({color: 0x404040, intensity: 0.5});
    scene.add(ambientLight);

    // add spotlight for the shadows
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-30, 60, 60);
    spotLight.castShadow = true;
    scene.add(spotLight);

    var shadowLight = new THREE.DirectionalLight(0xffffff, 0.4);
    shadowLight.position.set(200, 200, 200);
    shadowLight.castShadow = true;
    scene.add(shadowLight);

    var light = new THREE.DirectionalLight();
    light.position.set(200, 100, 200);
    light.castShadow = true;
    scene.add(light);

	render();
}

function render(){
	renderer = new THREE.WebGLRenderer( { antialias: true, alpha:true } );

	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	window.addEventListener('resize', onResize);
}

function animate() {

	requestAnimationFrame( animate );

	mesh.rotation.y += 0.005;
	mesh.rotation.x += 0.005;
	renderer.render( scene, camera );

}