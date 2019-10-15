// eve-nerd.com
// Hole Map
// Authors: SmallFatCat
// GitHub Repo: https://github.com/smallfatcat/eve-nerd
// Date: 12th October 2019
// Licence: MIT
// Testing webhooks



//js onload
$( function() {
	// setup Paste div
	document.getElementById('editableDiv').addEventListener('paste', handlePaste);
	
	init_map();
	
	add_mouse_listeners();
	// routing
	calcRouteMap();
	//draw_map(systems);
	arrangeSystems();
	draw_map_canvas(systems);
	attach_autocomplete('#system_input', list_solar_systems);

	
} );

function calcRouteMap(){
	var map = buildGraph("FASTEST");
	systems.forEach(function(system){
		addSystemToGraph(map, system);
	});
	var universe_map = new Graph(map);
	systems.forEach(function(system){
		var systemId = getSystemId(system.name);
		if(systemId != "31001263"){
			var shortestPath = universe_map.findShortestPath("31001263",systemId);
			if(shortestPath != undefined){
				system.distance = shortestPath.length-1;
			}
			else{
				system.distance = 9999;
			}
		}
	});
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
    alert(pastedData);
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

var br = "</br>"
var list_solar_systems = [];
prepare_autocomplete();
var systems = [];
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

function init_map(){
	for(let i = 0; i < systemList.length; i++){
		add_system(systemList[i])
		add_statics(systems[i]);
	}
	//add_link(systems[0], 3);
	//add_link(systems[0], 2);
	//add_link(systems[0], 4);
	//add_link(systems[3], 4);
}

function draw_map(systems){
	$("#map_text").empty();
	for(let i = 0; i < systems.length; i++){
		$("#map_text").append(systems[i].name + br);
		$("#map_text").append(systems[i].pos.x + br);
		$("#map_text").append(systems[i].pos.y + br);
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
    for(let i = 0; i < systems.length ; i++){
  		if(isInBox(systems[i], canMouseX, canMouseY)){  
  			// set the drag flag
    		isDragging=true;
    		systemDragged = i;
    		$("#map_text").append(systems[i].name);
  			current_system = systems[i].name;
  			if(linkCLicked && previous_current_system != current_system){
  				linkCLicked = false;
  				linkFirstSystem = "";
  				add_link(systems[getIndexOfSystem(previous_current_system)], systems[getIndexOfSystem(current_system)]);
  			}
    	}
    }
    if(linkCLicked && current_system == "NONE_SELECTED"){
    	linkCLicked = false;
    	linkFirstSystem = "";
    }
    draw_map_canvas(systems);
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
    		systems[systemDragged].pos.x = canMouseX;
    		systems[systemDragged].pos.y = canMouseY;
    		$("#map_text").empty();
  			$("#map_text").append(systems[systemDragged].name);
  			current_system = systems[systemDragged].name;
    		draw_map_canvas(systems);
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
	systems.forEach(function(system){
		if(system.distance < 6){
			columns[system.distance]++;
		}
		else{
			columns[5]++;
		}
	});
	var columnPositions = [];
	columns.forEach(function(column){
		var positions = [];
		for(let i = 1; i <= column; i++){
			positions.push(arrangeY/(column+1)*i);
		}
		columnPositions.push(positions);
	});
	systems.forEach(function(system){
		system.pos.x = (arrangeX * system.distance) + 50;
		if(system.pos.x > 950){
			system.pos.x = 950;
		}

		system.pos.y = columnPositions[system.distance < 6 ? system.distance : 5].shift();

	});
}

function draw_map_canvas(systems){
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
	for(let i = 0; i < systems.length; i++){
		ctx.font = "12px sans-serif";
		// System Name
		ctx.fillText(systems[i].name, systems[i].pos.x+3, systems[i].pos.y+13);

		// System Distance
		ctx.fillText(systems[i].distance, systems[i].pos.x+3, systems[i].pos.y+47);

		// System Security
		ctx.textAlign = "end";
		ctx.fillText(systems[i].security, systems[i].pos.x+77, systems[i].pos.y+47);
		ctx.textAlign = "start";

		// Statics
		var staticText = "";
		for(let j = 0; j < systems[i].statics.length ; j++){
			staticText += systems[i].statics[j] + " ";
		}
		ctx.font = "12px sans-serif";
		ctx.fillText(staticText, systems[i].pos.x+3, systems[i].pos.y+30);
		
		// System Box
		ctx.strokeStyle = "#000000";
		if(systems[i].name == current_system){
			ctx.strokeStyle = "#DD0000";
		}
		if(systems[i].name == linkFirstSystem){
			ctx.strokeStyle = "#00DD00";
		}
		ctx.beginPath();
		ctx.rect(systems[i].pos.x, systems[i].pos.y, systemWidth, systemHeight);
		ctx.stroke();
	}

	// Draw links
	var systemIndex = 0;
	systems.forEach(function(system){
		system.links.forEach(function(link){
			var indexA = getIndexOfSystem(system.name);
			var indexB = getIndexOfSystem(link);
			if(system.distance <= systems[indexB].distance){
				if(system.distance == systems[indexB].distance){
					if(indexA<indexB){
						drawLink(ctx, system, systems[indexB]);
					}	
				}
				else{
					drawLink(ctx, system, systems[indexB]);
				}
			}
		});
		systemIndex++;
	});
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
	neighbours.forEach(function(system){
		if(system.systemName == startSystem.name){
			var jumpNodes = system.jumpNodes.split(":");
			jumpNodes.forEach(function(jumpNode){
				if(jumpNode == getSystemId(endSystem.name)){
					returnValue =  true;
					//break;
				}
			});
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

function add_system(name){
	var system_spacing = 100;
	var pos = new Pos(system_spacing, system_spacing);
	var system = new System(name, pos, get_system_security(name));
	systems.push(system);
}

function get_system_security(name){
	var system_security = "";
	for(let i = 0; i < solarSystems.length;i++){
		if(solarSystems[i].label == name){
			system_security = solarSystems[i].security;
			break;
		}
	}
	return system_security;
}

function add_link(systemA, systemB){
	systemA.links.push(systemB.name);
	systemB.links.push(systemA.name);
	calcRouteMap();
	draw_map_canvas(systems);
}


function add_statics(system){
	system.statics = getStatics(getSystemId(system.name));
}

function add_system_click(){
	var newSystem = $("#system_input")[0].value;
	var validName = isValidSystem(newSystem);
	if(validName!="NOT_VALID"){
		add_system(validName);
		add_statics(systems[systems.length-1]);
		if(current_system != "NONE_SELECTED"){
			current_system_id = getIndexOfSystem(current_system);
			add_link(systems[current_system_id], systems[systems.length-1]);
			
		}
		calcRouteMap();
		draw_map_canvas(systems);
	}
}

function link_click(){
	if(current_system != "NONE_SELECTED"){
		linkCLicked = true;
		linkFirstSystem = current_system;
		draw_map_canvas(systems);
	}
}

function arrange_click(){
	arrangeSystems();
	draw_map_canvas(systems);
}

function add_adjacent_click(){
	if(current_system != "NONE_SELECTED"){
		var system = systems[getIndexOfSystem(current_system)];
		neighbours.forEach(function(sys){
			if(system.name == sys.systemName){
				var jumpNodes = sys.jumpNodes.split(":");
				jumpNodes.forEach(function(jumpNode){
					var jumpNodeName = getSystemName(jumpNode);
					if(!isSystemAdded(jumpNodeName)){
						add_system(jumpNodeName);
						add_link(system, systems[systems.length-1]);
					}
				});
			}
		});
	}
}

function isSystemAdded(systemName){
	var returnValue = false;
	systems.forEach(function(system){
		if(system.name == systemName){
			returnValue = true;
		}
	});
	return returnValue;
}

function getIndexOfSystem(name){
	var returnedIndex = 0;
	for(let i= 0; i < systems.length; i++){
		if(systems[i].name == name){
			returnedIndex = i;
			return returnedIndex;
			break;
		}
	}
	return returnedIndex;
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

function getSystemId(name){
	var returnValue = 0;
	solarSystems.forEach(function(system){
		if (name == system.label){
			returnValue = system.value;
		}
	});
	return returnValue;
}

function getSystemName(id){
	var returnValue = 0;
	solarSystems.forEach(function(system){
		if (id == system.value){
			returnValue = system.label;
		}
	});
	return returnValue;
}

function getStatics(systemId){
	staticList = [];
	statics.forEach(function(static){
		if(systemId == static.systemId){
			staticList.push(static.name);
		}
	});
	return staticList;
}



