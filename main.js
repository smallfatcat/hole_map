// eve-nerd.com
// Hole Map
// Authors: SmallFatCat
// GitHub Repo: https://github.com/smallfatcat/eve-nerd
// Date: 12th October 2019
// Licence: MIT

//js onload
$( function() {
	// setup Paste div
	document.getElementById('editableDiv').addEventListener('paste', handlePaste);
	
	init_map();
	
	add_mouse_listeners();
	// routing
	calcRouteMap();
	arrangeSystems();
	draw_map_canvas();
	attach_autocomplete('#system_input', list_solar_systems);
} );

function calcRouteMap(){
	var map = buildGraph("FASTEST");
	for (let [id, system] of Object.entries(mappedSystems)) {
		addSystemToGraph(map, system);
	}
	var universe_map = new Graph(map);
	for (let [id, system] of Object.entries(mappedSystems)) {
		var systemId = g_nameToId[system.name];
		if(systemId != "31001263"){
			var shortestPath = universe_map.findShortestPath("31001263",systemId);
			if(shortestPath != undefined){
				system.distance = shortestPath.length-1;
				system.route = shortestPath;
			}
			else{
				system.distance = 9999;
				system.route = [];
			}
		}
	}
	//console.log(printRoute(route));
}

function handlePaste (e) {
    var clipboardData, pastedData;

    // Stop data actually being pasted into div
    e.stopPropagation();
    e.preventDefault();

    // Get pasted data via clipboard API
    clipboardData = e.clipboardData || window.clipboardData;
    pastedData = clipboardData.getData('Text');

    // Do whatever with pasteddata
    var scanResult = new ScanResult(pastedData);
    scanResults.push(scanResult);
    pasteDataTemp = pastedData;
    
    var sigHtml = scanResult.getSigHtml();
    //console.log(sigHtml);
		$("#sigs").empty();
    $("#sigs").append(sigHtml);
}

function attach_autocomplete(id, list){
	$( id ).autocomplete({
    source: function( request, response ) {
        var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( request.term ), "i" );
        response( $.grep( list, function( item ){
          if(request.term.length>1){
            return matcher.test( item );
          }
        }) );
    }
  });
}

function prepare_autocomplete(){
	solarSystems.forEach(function(ss){
		var name = ss.label;
		list_solar_systems.push(name);
	});
}

//
//
//
//
//
//
// Initialise Everything

var mappedSystems = {};

// Old stuff Below


var br = "</br>"
var list_solar_systems = [];
prepare_autocomplete();
//var systems = [];
var systemList = ["J172701", "Jita", "Amarr"];
var current_system = "NONE_SELECTED";
var systemWidth = 80,
		systemHeight = 50,
		arrangeY = 600,
		arrangeX = 150;

var linkCLicked = false;
var linkFirstSystem = "";
var g_canMouseX = 0;
var g_canMouseY = 0;

var pasteDataTemp = "";
var scanResults = [];

function init_map(){
	for(let i = 0; i < systemList.length; i++){
		add_system(systemList[i])
	}
}

function add_mouse_listeners(){
	var canvas = document.getElementById("map_canvas");

	var canvasOffset=$("#map_canvas").offset();
  var offsetX=canvasOffset.left;
  var offsetY=canvasOffset.top;
  var canvasWidth=canvas.width;
  var canvasHeight=canvas.height;
  var isDragging=false;
  var systemDragged = 0;

  function handleMouseDown(e){
    canMouseX=parseInt(e.clientX-offsetX);
    canMouseY=parseInt(e.clientY-offsetY);
    previous_current_system = current_system;
    current_system = "NONE_SELECTED";
  	$("#map_text").empty();
  	// Check each system to see if clicked
  	for (let [id, system] of Object.entries(mappedSystems)){
  		if(isInBox(system, canMouseX, canMouseY)){
  			isDragging=true;
    		systemDragged = id;
    		$("#map_text").append(system.name);
  			current_system = system.name;
  			if(linkCLicked && previous_current_system != current_system){
  				linkCLicked = false;
  				linkFirstSystem = "";
  				add_link(mappedSystems[g_nameToId[previous_current_system]], mappedSystems[g_nameToId[current_system]]);
  			}
  		}
  	}

    if(linkCLicked && current_system == "NONE_SELECTED"){
    	linkCLicked = false;
    	linkFirstSystem = "";
    }
    draw_map_canvas();
  }

  function handleMouseUp(e){
    canMouseX=parseInt(e.clientX-offsetX);
    canMouseY=parseInt(e.clientY-offsetY);
    // clear the drag flag
    isDragging=false;
  }

  function handleMouseOut(e){
    canMouseX=parseInt(e.clientX-offsetX);
    canMouseY=parseInt(e.clientY-offsetY);
    // user has left the canvas, so clear the drag flag
    //isDragging=false;
  }

  function handleMouseMove(e){
    canMouseX=parseInt(e.clientX-offsetX);
    canMouseY=parseInt(e.clientY-offsetY);
    g_canMouseX = canMouseX;
    g_canMouseY = canMouseY;
    // if the drag flag is set, clear the canvas and draw the image
    if(isDragging){
    		mappedSystems[systemDragged].pos.x = canMouseX;
    		mappedSystems[systemDragged].pos.y = canMouseY;
    		$("#map_text").empty();
  			$("#map_text").append(mappedSystems[systemDragged].name);
  			current_system = mappedSystems[systemDragged].name;
    		draw_map_canvas();
    }
  }

  $("#map_canvas").mousedown(function(e){handleMouseDown(e);});
  $("#map_canvas").mousemove(function(e){handleMouseMove(e);});
  $("#map_canvas").mouseup(function(e){handleMouseUp(e);});
  $("#map_canvas").mouseout(function(e){handleMouseOut(e);});


	/*// Add event listener for `click` events.
	canvas.addEventListener('click', function(event) {
  	var x = event.offsetX,
  			y = event.offsetY;
  	current_system = "NONE_SELECTED";
  	$("#map_text").empty();
  	systems.forEach(function(system){
  		if(isInBox(system, x, y)){
  			$("#map_text").append(system.name);
  			current_system = system.name;
  		}
  	});
  	
	}, false);*/
}

function arrangeSystems(){
	var columns = [0,0,0,0,0,0];
	for (let [id, system] of Object.entries(mappedSystems)){
		if(system.distance < 6){
			columns[system.distance]++;
		}
		else{
			columns[5]++;
		}
	}
	var columnPositions = [];
	columns.forEach(function(column){
		var positions = [];
		for(let i = 1; i <= column; i++){
			positions.push((arrangeY/(column+1)*i)-25);
		}
		columnPositions.push(positions);
	});
	for (let [id, system] of Object.entries(mappedSystems)){
		system.pos.x = (arrangeX * system.distance) + 50;
		if(system.pos.x > 950){
			system.pos.x = 950;
		}

		system.pos.y = columnPositions[system.distance < 6 ? system.distance : 5].shift();

	};
}

function draw_map_canvas(){
	//arrangeSystems();
	var canvas = document.getElementById("map_canvas");
	var ctx = canvas.getContext("2d");
	
	// Draw systems
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.lineWidth = 1;
	ctx.strokeStyle = "#000000";
	ctx.font = "12px sans-serif";
	
	// Mouse
	ctx.fillText(g_canMouseX +":"+g_canMouseY, 10, 10);
	for (let [id, system] of Object.entries(mappedSystems)){
		ctx.font = "12px sans-serif";
		// System Name
		ctx.fillText(system.name, system.pos.x+3, system.pos.y+13);

		// System Distance
		ctx.fillText(system.distance, system.pos.x+3, system.pos.y+47);

		// System Security
		ctx.textAlign = "end";
		ctx.fillText(system.security, system.pos.x+77, system.pos.y+47);
		ctx.textAlign = "start";

		// Statics
		var staticText = "";
		for(let j = 0; j < system.statics.length ; j++){
			staticText += getWHinfo(system.statics[j]).class + " ";
		}
		ctx.font = "12px sans-serif";
		ctx.fillText(staticText, system.pos.x+3, system.pos.y+30);
		
		// System Box
		ctx.strokeStyle = "#000000";
		if(system.name == current_system){
			ctx.strokeStyle = "#DD0000";
		}
		if(system.name == linkFirstSystem){
			ctx.strokeStyle = "#00DD00";
		}
		ctx.beginPath();
		ctx.rect(system.pos.x, system.pos.y, systemWidth, systemHeight);
		ctx.stroke();
	}

	// Draw links
	var systemIndex = 0;
	for (let [id, systemA] of Object.entries(mappedSystems)){
		systemA.links.forEach(function(link){
			var systemB = mappedSystems[g_nameToId[link]];
			if(systemA.distance <= systemB.distance){
				if(systemA.distance == systemB.distance){
					if(systemA.name<systemB.name){
						drawLink(ctx, systemA, systemB);
					}	
				}
				else{
					drawLink(ctx, systemA, systemB);
				}
			}
		});
		systemIndex++;
	}

	// Draw Route
	if(current_system != "NONE_SELECTED"){
		drawRoute(ctx, mappedSystems[g_nameToId[current_system]].route);
	}
}

function drawRoute(ctx, route){
	var routeTextList = printRoute(route);
	var x = 10;
	var y = 580;
	ctx.strokeStyle = "#000000";
	for(let i = 0; i < routeTextList.length; i++){
		ctx.beginPath();
		ctx.rect(x + (i * 20), y, 10, 10);
		ctx.stroke();
	}
}

function drawLink(ctx, startSystem, endSystem){
	var sx = startSystem.pos.x + systemWidth;
	var sy = startSystem.pos.y + (systemHeight/2);
	var ex = endSystem.pos.x;
	var ey = endSystem.pos.y+ (systemHeight/2);
	var mx = sx+(ex - sx)/2;
	var my = sy+(ey - sy)/2;
	var csx = sx + 30;
	var csy = sy + 0;
	var cex = ex - 30;
	var cey = ey + 0;
	var lineWidth = 0;
	ctx.lineWidth = 4;
	if(isJumpGate(startSystem, endSystem)){
		ctx.strokeStyle = "#0000BB";
	}
	else{
		ctx.strokeStyle = "#BBBBBB";
	}
	
	ctx.beginPath();
	ctx.moveTo(sx, sy);
	ctx.quadraticCurveTo(csx, csy, mx, my);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(ex, ey);
	ctx.quadraticCurveTo(cex, cey, mx, my);
	ctx.stroke();
	ctx.lineWidth = 2;
	ctx.strokeStyle = "#FFFFFF";
	ctx.beginPath();
	ctx.moveTo(sx, sy);
	ctx.quadraticCurveTo(csx, csy, mx, my);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(ex, ey);
	ctx.quadraticCurveTo(cex, cey, mx, my);
	ctx.stroke();
}

function isJumpGate(startSystem, endSystem){
	var returnValue = false;
	startSystem.neighbours.forEach(function(jumpNode){
		if(jumpNode == g_nameToId[endSystem.name]){
			returnValue =  true;
		}
	});
	return returnValue;
}

function isInBox(system, x, y){
	if(x >= system.pos.x&& x <= system.pos.x+systemWidth && y >= system.pos.y && y <= system.pos.y+systemHeight){
		return true;
	}
	return false;
}

function add_system(newSystemName){
	var newSystemId = g_nameToId[newSystemName];
	var newSystem = g_systemObjects[newSystemId];
	// Check if any existing systems have jump gate links to this system
	mappedSystems[newSystemId] = newSystem;
	for (let [existingSystemId, existingSystem] of Object.entries(mappedSystems)) {
		if(isNeighbour(newSystem, existingSystem)){
			add_link(existingSystem, newSystem);;
		}
	}
}

function add_link(systemA, systemB){
	systemA.links.push(systemB.name);
	systemB.links.push(systemA.name);
	calcRouteMap();
	draw_map_canvas();
}

function add_system_click(){
	var newSystem = $("#system_input")[0].value;
	var newSystemName = isValidSystem(newSystem);
	var newSystemId = g_nameToId[newSystemName];
	if(newSystemName!="NOT_VALID" && !isSystemAdded(newSystemName)){
		add_system(newSystemName);
		if(current_system != "NONE_SELECTED"){
			current_system_id = g_nameToId[current_system];
			add_link(mappedSystems[current_system_id], mappedSystems[newSystemId]);	
		}
		calcRouteMap();
		draw_map_canvas();
	}
}

function link_click(){
	if(current_system != "NONE_SELECTED"){
		linkCLicked = true;
		linkFirstSystem = current_system;
		draw_map_canvas();
	}
}

function arrange_click(){
	arrangeSystems();
	draw_map_canvas();
}

function add_adjacent_click(){
	if(current_system != "NONE_SELECTED"){
		var system = mappedSystems[g_nameToId[current_system]];
		system.neighbours.forEach(function(jumpNode){
			var jumpNodeName = g_systemObjects[jumpNode].name;
			if(!isSystemAdded(jumpNodeName)){
				add_system(jumpNodeName);
				add_link(system, mappedSystems[g_nameToId[jumpNodeName]]);
			}
		});
	}
}

function isSystemAdded(systemName){
	var returnValue = false;
	for (let [id, system] of Object.entries(mappedSystems)){
		if(system.name == systemName){
			returnValue = true;
		}
	}
	return returnValue;
}

function isValidSystem(newSystem){
	var returnValue = "NOT_VALID";
	solarSystems.forEach(function(ss){
		if(ss.label.toUpperCase() == newSystem.toUpperCase()){
			returnValue = ss.label;
		}
	});
	return returnValue;
}

function getWHinfo(name){
	var staticInfo = {};
	wh_types.forEach(function(wh_type){
		if(wh_type.type == name){
			staticInfo = wh_type;
		}
	});
	return staticInfo;
}

function isNeighbour(systemA, systemB){
	var returnValue = false;
	var systemBId = g_nameToId[systemB.name];
	var neighbours = systemA.neighbours;
	neighbours.forEach(function(neighbour){
		if(neighbour == systemBId){
			returnValue = true;
		}
	});
	return returnValue;
}
