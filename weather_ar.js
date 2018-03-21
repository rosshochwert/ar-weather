THREEx.ArToolkitContext.baseURL = 'node_modules/ar.js/';
var renderer, onRenderFcts, scene;
var camera, mesh;
var weather_id;
var cloud_array = [];
var frustum;
var cameraViewProjectionMatrix;

function getWeather(callback) {
    var weather = 'https://api.openweathermap.org/data/2.5/weather?q=Chicago&APPID=c8a76cd630b38b395dacaefa6e1a4631&&units=imperial';
    $.ajax({
      dataType: "jsonp",
      url: weather,
      success: callback
    });
}

getWeather(function (data) {
	var adjective = weatherType(data.weather[0].id);
	weatherType(data.weather[0].id);
	$(".weatherBox").html("It is currently " + data.main.temp + " degrees and </br>" + adjective + " in " + data.name);
	if (weather_id==1){
		createRain();
	} else if (weather_id==2){
		createSun();
	} else if (weather_id==3){
		createClouds();
	}
});



function weatherType(integer){
	var adjective = "sunny";
	var id = Number(String(integer).charAt(0));

	if (id==2){
		adjective = "thundering";

	} else if (id==3){
		adjective = "drizzling";
		weather_id = 1;
	} else if (id==5){
		adjective = "raining";
		weather_id = 1;
	} else if (id==6){
		adjective = "snowing";
	} else if (id==8){
		if (integer==800){
			adjective = "clear skies";
			weather_id = 2;
		} else {
			adjective = "cloudy";
			weather_id = 3;
		}
	} else if (id==9){
		adjective = "extreme";
	}

	return adjective;
}

function callback(){
	console.log("Here we are");
}

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

init();

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
	patternUrl : THREEx.ArToolkitContext.baseURL + 'data/data/patt.hiro',
	//patternUrl : THREEx.ArToolkitContext.baseURL + 'data/data/pattern-marker.patt',
	// patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/patt.kanji',
	// as we controls the camera, set changeMatrixMode: 'cameraTransformMatrix'
	changeMatrixMode: 'cameraTransformMatrix'
});

// as we do changeMatrixMode: 'cameraTransformMatrix', start with invisible scene
scene.visible = false;

//////////////////////////////////////////////////////////////////////////////////
//		add an object in the scene
//////////////////////////////////////////////////////////////////////////////////
function createRain(){
	weather_id=1;
	var geometry = new THREE.ConeGeometry(1, 3, 32 );
	var material = new THREE.MeshPhongMaterial({
		color: 0x00008b,
		shading: THREE.FlatShading
	});
	cone = new THREE.Mesh( geometry, material );
	cone2 = new THREE.Mesh( geometry, material );
	cone3 = new THREE.Mesh( geometry, material );
	scene.add( cone );
	scene.add( cone2 );
	scene.add( cone3 );
	cone.position.set(0,3,0);
	cone2.position.set(-2,4,1);
	cone3.position.set(2,2,-1);

	var geometry2 = new THREE.SphereGeometry(1, 32, 32 );
	var material2 = new THREE.MeshPhongMaterial({
		color: 0x00008b,
		shading: THREE.FlatShading
	});
	sphere = new THREE.Mesh( geometry2, material2 );
	sphere2 = new THREE.Mesh( geometry2, material2 );
	sphere3 = new THREE.Mesh( geometry2, material2 );
	scene.add( sphere );
	scene.add( sphere2 );
	scene.add( sphere3 );

	sphere.position.set(0,1.4,0);
	sphere2.position.set(-2,2.4,1);
	sphere3.position.set(2,0.4,0-1);


	addLight();
	//render();
}

function createSun(){
	weather_id=2;
	var geometry = new THREE.IcosahedronGeometry(0.5, 1);
	var material = new THREE.MeshPhongMaterial({
		color: 0xffd927,
		shading: THREE.FlatShading
	});

	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );
	addLight();
	//render();
}

function createClouds(){
	weather_id=3;
	for (var i=0; i<100; i++){
		var geometry = new THREE.IcosahedronGeometry(0.5, 1);
		var material = new THREE.MeshPhongMaterial({
			color: 0xA0A0A0,
			shading: THREE.FlatShading
		});

		var mesh = new THREE.Mesh( geometry, material );
		mesh.name = "q" + i;
		cloud_array.push(mesh.name);
		scene.add( mesh );
		var random_x = Math.random() * Math.floor(3)-1.5;
		var random_y = Math.random() * Math.floor(1)-0.5;
		var random_z = Math.random() * Math.floor(2)-1;
		mesh.position.set(random_x,random_y,random_z);
	}

	addLight();
	//render();
}

function addLight(){
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
	// mesh.rotation.x += Math.PI*delta;
	// mesh.rotation.y += Math.PI*delta;
});


//////////////////////////////////////////////////////////////////////////////////
//		render the whole thing on the page
//////////////////////////////////////////////////////////////////////////////////

// render the scene
onRenderFcts.push(function(){
	if (weather_id==1){
		var direction = new THREE.Vector3(0, -0.05, 0); // amount to move per frame
		var direction2 = new THREE.Vector3(0, -0.025, 0); // amount to move per frame
		var direction3 = new THREE.Vector3(0, -0.1, 0); // amount to move per frame
		var reset = new THREE.Vector3(0, 10, 0); // amount to move per frame
	
		if (sphere.position.y<-7){
			cone.position.add(reset);
			sphere.position.add(reset);
		} else if (sphere2.position.y<-7){
			cone2.position.add(reset);
			sphere2.position.add(reset);
		} else if (sphere3.position.y<-7){
			cone3.position.add(reset);
			sphere3.position.add(reset);
		} else {
			cone.position.add(direction);
			sphere.position.add(direction);
			cone2.position.add(direction2);
			sphere2.position.add(direction2);
			cone3.position.add(direction3);
			sphere3.position.add(direction3);
		}
	} else if (weather_id==2){
		mesh.position.y += 0.005;
		mesh.rotation.x += 0.005;
	} else if (weather_id==3){
		for (var i=0; i<cloud_array.length; i++){
			var random_x = (Math.random() * 0.002)-0.001;
			var direction = new THREE.Vector3(random_x, random_x, random_x);
			var object = scene.getObjectByName(cloud_array[i], true);
			object.position.add(direction);
		}
	}
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