var weather_id;

function getWeather(callback) {
    var weather = 'https://api.openweathermap.org/data/2.5/weather?q=Chicago&APPID=c8a76cd630b38b395dacaefa6e1a4631&&units=imperial';
    $.ajax({
      dataType: "jsonp",
      url: weather,
      success: callback
    });
}

// get data:
getWeather(function (data) {
	var adjective = weatherType(data.weather[0].id);
	$(".weatherBox").html("It is currently " + data.main.temp + " degrees and </br>" + adjective + " in " + data.name);
});

function weatherType(integer){
	var adjective = "sunny";
	var id = Number(String(integer).charAt(0));

	if (id==2){
		adjective = "thundering";
	} else if (id==3){
		adjective = "drizzling";
	} else if (id==5){
		adjective = "raining";
	} else if (id==6){
		adjective = "snowing";
	} else if (id==8){
		if (integer==800){
			adjective = "clear skies";
		} else {
			adjective = "cloudy";
		}
	} else if (id==9){
		adjective = "extreme";
	}
	weather_id = id;
	return adjective;
}

function callback(){
	console.log("Here we are");
}

THREEx.ArToolkitContext.baseURL = 'node_modules/ar.js/';
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
	cameraParametersUrl: THREEx.ArToolkitContext.baseURL + 'data/data/camera_para.dat',
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
	patternUrl : THREEx.ArToolkitContext.baseURL + 'data/data/pattern-marker.patt',
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