THREEx.ArToolkitContext.baseURL = '/resources/ar.js/';
var renderer, onRenderFcts, scene;
var camera, mesh;
init();


function init(){
	renderer	= new THREE.WebGLRenderer({
		antialias: true,
		alpha: true
	});
	renderer.setClearColor(new THREE.Color('lightgrey'), 0);
	renderer.setSize( 640, 480 );
	renderer.domElement.style.position = 'absolute';
	renderer.domElement.style.top = '0px';
	renderer.domElement.style.left = '0px';
	document.body.appendChild( renderer.domElement );

	// array of functions for the rendering loop
	onRenderFcts= [];

	// init scene and camera
	scene	= new THREE.Scene();

	camera = new THREE.Camera();
	scene.add(camera);
}

////////////////////////////////////////////////////////////////////////////////
//          handle arToolkitSource
////////////////////////////////////////////////////////////////////////////////

var arToolkitSource = new THREEx.ArToolkitSource({
	sourceType : 'webcam'
});

arToolkitSource.init(function onReady(){
	onResize();
});

// handle resize
window.addEventListener('resize', function(){
	onResize();
});

function onResize(){
	arToolkitSource.onResize();
	arToolkitSource.copySizeTo(renderer.domElement);
	if( arToolkitContext.arController !== null ){
		arToolkitSource.copySizeTo(arToolkitContext.arController.canvas);
	}
}
////////////////////////////////////////////////////////////////////////////////
//          initialize arToolkitContext
////////////////////////////////////////////////////////////////////////////////


// create atToolkitContext
var arToolkitContext = new THREEx.ArToolkitContext({
	cameraParametersUrl: THREEx.ArToolkitContext.baseURL + '/data/data/camera_para.dat',
	detectionMode: 'mono',
});

// initialize it
arToolkitContext.init(function onCompleted(){
	// copy projection matrix to camera
	camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
});

// update artoolkit on every frame
onRenderFcts.push(function(){
	if( arToolkitSource.ready === false )	return;

	arToolkitContext.update( arToolkitSource.domElement );
	
	// update scene.visible if the marker is seen
	scene.visible = camera.visible;
});
	
////////////////////////////////////////////////////////////////////////////////
//          Create a ArMarkerControls
////////////////////////////////////////////////////////////////////////////////

// init controls for camera
var markerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {
	type : 'pattern',
	patternUrl : THREEx.ArToolkitContext.baseURL + '/data/data/patt.hiro',
	// patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/patt.kanji',
	// as we controls the camera, set changeMatrixMode: 'cameraTransformMatrix'
	changeMatrixMode: 'cameraTransformMatrix'
});

// as we do changeMatrixMode: 'cameraTransformMatrix', start with invisible scene
scene.visible = false;

//////////////////////////////////////////////////////////////////////////////////
//		add an object in the scene
//////////////////////////////////////////////////////////////////////////////////
addWeather();

function addWeather(){
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
}


onRenderFcts.push(function(delta){
	mesh.rotation.x += Math.PI*delta;
	mesh.rotation.y += Math.PI*delta;
});


//////////////////////////////////////////////////////////////////////////////////
//		render the whole thing on the page
//////////////////////////////////////////////////////////////////////////////////

// render the scene
onRenderFcts.push(function(){
	renderer.render( scene, camera );
});

// run the rendering loop
var lastTimeMsec= null;
requestAnimationFrame(function animate(nowMsec){
	// keep looping
	requestAnimationFrame( animate );
	// measure time
	lastTimeMsec	= lastTimeMsec || nowMsec-1000/60;
	var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec);
	lastTimeMsec	= nowMsec;
	// call each update function
	onRenderFcts.forEach(function(onRenderFct){
		onRenderFct(deltaMsec/1000, nowMsec/1000);
	});
});