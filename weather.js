var camera, scene, renderer;
var geometry, material, mesh;
var sphere, cone;
var weather_id, sunLight, skydom;
var cloud_array = [];
var frustum;
var cameraViewProjectionMatrix;
var starField;
var date;
var sunAngle;

var latitude = 41.8889470;
var longitude = -87.6336350;

$(document).ready(function(){
	addWeatherListeners();
	settingsReset();
	init();
	render();
	getLocation();
	addLight();
});

function addWeatherListeners(){
	$("#clouds").on("click", function(){
		createClouds();
	});

	$("#rain").on("click", function(){
		createRain();
	});

	$("#sunny").on("click", function(){
		createSun();
	});
}


function settingsReset(){
	date = new Date();
	hour = date.getHours();

	var sunPos = SunCalc.getPosition(/*Date*/ new Date(), /*Number*/ latitude, /*Number*/ longitude);
	sunAngle = sunPos.altitude;
	$("#time_range").val(sunAngle);
	if (sunAngle<0){
		$("p").css('color', 'white');
	} else {
		$("p").css('color', 'black');
	}
	
}

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

	frustum = new THREE.Frustum();
	cameraViewProjectionMatrix = new THREE.Matrix4();
	camera.updateMatrixWorld(); // make sure the camera matrix is updated
	camera.matrixWorldInverse.getInverse( camera.matrixWorld );
	cameraViewProjectionMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
	frustum.setFromMatrix( cameraViewProjectionMatrix );
}

function removeScene(){
	var sunObject = scene.getObjectByName("sun", true);
	scene.remove(sunObject);

	var rainObject = scene.getObjectByName("rain", true);
	var rainObject1 = scene.getObjectByName("rain1", true);
	var rainObject2 = scene.getObjectByName("rain2", true);
	var rainObject3 = scene.getObjectByName("rain3", true);
	var rainObject4 = scene.getObjectByName("rain4", true);
	var rainObject5 = scene.getObjectByName("rain5", true);
	scene.remove(rainObject);
	scene.remove(rainObject1);
	scene.remove(rainObject2);
	scene.remove(rainObject3);
	scene.remove(rainObject4);
	scene.remove(rainObject5);


	for (var i=0; i<cloud_array.length; i++){
		var cloudObject = scene.getObjectByName(cloud_array[i], true);
		scene.remove(cloudObject);
	}
}

function createRain(){
	$("#clouds").removeClass("active");
	$("#rain").addClass("active");
	$("#sunny").removeClass("active");
	removeScene();
	weather_id=1;
	var geometry = new THREE.ConeGeometry(1, 3, 32 );
	var material = new THREE.MeshPhongMaterial({
		color: 0x00008b,
		shading: THREE.FlatShading
	});
	cone = new THREE.Mesh( geometry, material );
	cone2 = new THREE.Mesh( geometry, material );
	cone3 = new THREE.Mesh( geometry, material );

	cone.name = "rain";
	cone2.name = "rain1";
	cone3.name = "rain2";

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

	sphere.name = "rain3";
	sphere2.name = "rain4";
	sphere3.name = "rain5";

	scene.add( sphere );
	scene.add( sphere2 );
	scene.add( sphere3 );

	sphere.position.set(0,1.4,0);
	sphere2.position.set(-2,2.4,1);
	sphere3.position.set(2,0.4,0-1);

}

function createSun(){
	removeScene();
	$("#clouds").removeClass("active");
	$("#rain").removeClass("active");
	$("#sunny").addClass("active");
	weather_id=2;
	var geometry = new THREE.IcosahedronGeometry(1.5, 1);
	var material = new THREE.MeshPhongMaterial({
		color: 0xffd927,
		shading: THREE.FlatShading
	});

	
	mesh = new THREE.Mesh( geometry, material );
	mesh.name="sun";
	scene.add( mesh );
}

function createClouds(){
	removeScene();
	$("#clouds").addClass("active");
	$("#rain").removeClass("active");
	$("#sunny").removeClass("active");

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

}

function addLight(){
	// add subtle ambient lighting
    var ambientLight = new THREE.AmbientLight({color: 0x000000, intensity: 0.1});
    scene.add(ambientLight);

    var light = new THREE.DirectionalLight();
    light.position.set(200, 100, 200);
    // light.castShadow = true;
    scene.add(light);
    addDayNight();
}

function addDayNight(){
	sunLight = new THREEx.DayNight.SunLight();
	skydom	= new THREEx.DayNight.Skydom();
	starField = new THREEx.DayNight.StarField();
	scene.add( starField.object3d );
	scene.add( sunLight.object3d );
	scene.add( skydom.object3d );
}

function render(){
	renderer = new THREE.WebGLRenderer( { antialias: true, alpha:true } );
	renderer.setSize( window.innerWidth, window.innerHeight);
	document.body.appendChild( renderer.domElement );
	//document.getElementById("ar").appendChild( renderer.domElement );
	window.addEventListener('resize', onResize);
}

function changeTime(time){
	sunAngle = time;
	if (time<0){
		$("p").css('color', 'white');
	} else {
		$("p").css('color', 'black');
	}
}

function animate() {

	sunLight.update(sunAngle);
	skydom.update(sunAngle);
	starField.update(sunAngle);

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
		mesh.rotation.y += 0.005;
		mesh.rotation.x += 0.005;
	} else if (weather_id==3){
		for (var i=0; i<cloud_array.length; i++){
			var random_x = (Math.random() * 0.002)-0.001;
			var direction = new THREE.Vector3(random_x, random_x, random_x);
			var object = scene.getObjectByName(cloud_array[i], true);
			object.position.add(direction);
			if (frustum.intersectsObject( object )){

			} else {
				// var reset_int = object.position.x*1.99;
				// var reset = new THREE.Vector3(-reset_int, 0, 0);
				// object.position.add(reset);
				//alert("off");
				//console.log("false")
			}
			
		}
	}

	
	renderer.render( scene, camera );

	requestAnimationFrame( animate );

}

function getWeatherCallback(data) {
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
	animate();
}



function getWeather(callback){
	var weather = 'https://api.openweathermap.org/data/2.5/weather?q=Chicago&APPID=c8a76cd630b38b395dacaefa6e1a4631&&units=imperial';
	if (callback.latitude){
		weather = 'https://api.openweathermap.org/data/2.5/weather?lat=' + callback.latitude +'&lon=' + callback.longitude + '&APPID=c8a76cd630b38b395dacaefa6e1a4631&&units=imperial';
	}

	$.ajax({
		dataType: "jsonp",
		url: weather,
		success: getWeatherCallback
	});

}

function getLocation() {
	var object = {latitude: false};
	if (navigator.geolocation){
		navigator.geolocation.getCurrentPosition(function(position) {
			getWeather(position);
		}, function (error){
			getWeather(object);
		});
		
	} else {
		getWeather(object);
	}
    
}

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