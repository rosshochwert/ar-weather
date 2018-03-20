var camera, scene, renderer;
var geometry, material, mesh;
var sphere, cone;

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
	//createSun();
	createRain();
}


function createRain(){
	var geometry = new THREE.ConeGeometry(1, 3, 32 );
	var material = new THREE.MeshPhongMaterial({
		color: 0x00008b,
		shading: THREE.FlatShading
	});
	cone = new THREE.Mesh( geometry, material );
	scene.add( cone );
	//cone.rotateX(60);
	cone.position.set(0,1,0)
	addLight();
	render();
}

function createSun(){
	var geometry = new THREE.IcosahedronGeometry(0.5, 1);
	var material = new THREE.MeshPhongMaterial({
		color: 0xffd927,
		shading: THREE.FlatShading
	});

	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );
	addLight();
	render();
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


function render(){
	renderer = new THREE.WebGLRenderer( { antialias: true, alpha:true } );

	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	window.addEventListener('resize', onResize);
}

function animate() {

	requestAnimationFrame( animate );

	//mesh.rotation.y += 0.005;
	//mesh.rotation.x += 0.005;
	renderer.render( scene, camera );

}

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

	return adjective;
}

function callback(){
	console.log("Here we are");
}