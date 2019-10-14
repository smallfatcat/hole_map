// eve-nerd.com
// Hole Map
// Authors: SmallFatCat
// GitHub Repo: https://github.com/smallfatcat/eve-nerd
// Date: 12th October 2019
// Licence: MIT



//js onload
$( function() {
	init_map();
	//draw_map(systems);
	add_mouse_listeners();
	draw_map_canvas(systems);
	attach_autocomplete('#system_input', list_solar_systems);
} );

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
systemList = ["J172701", "Jita", "Amarr", "Tama", "Obe"];
var systemWidth = 80,
		systemHeight = 50;

function init_map(){
	for(let i = 0; i < systemList.length; i++){
		add_system(systemList[i])
		add_statics(systems[i]);
	}
	add_link(systems[0], 1);
	add_link(systems[0], 2);
	add_link(systems[0], 3);
	add_link(systems[0], 4);
	add_link(systems[3], 4);
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
    for(let i = 0; i < systems.length ; i++){
  		if(isInBox(systems[i], canMouseX, canMouseY)){  
  			// set the drag flag
    		isDragging=true;
    		systemDragged = i;
    	}
    }
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
    // if the drag flag is set, clear the canvas and draw the image
    if(isDragging){
    		systems[systemDragged].pos.x = canMouseX;
    		systems[systemDragged].pos.y = canMouseY;
    		draw_map_canvas(systems);
    }
  }

  $("#map_canvas").mousedown(function(e){handleMouseDown(e);});
  $("#map_canvas").mousemove(function(e){handleMouseMove(e);});
  $("#map_canvas").mouseup(function(e){handleMouseUp(e);});
  $("#map_canvas").mouseout(function(e){handleMouseOut(e);});


	// Add event listener for `click` events.
	canvas.addEventListener('click', function(event) {
  	var x = event.offsetX,
  			y = event.offsetY;
  	systems.forEach(function(system){
  		if(isInBox(system, x, y)){
  			$("#map_text").empty();
  			$("#map_text").append(system.name);
  		}
  	});
  	
	}, false);
}

function draw_map_canvas(systems){
	var canvas = document.getElementById("map_canvas");
	var ctx = canvas.getContext("2d");
	
	// Draw systems
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.font = "12px sans-serif";
	ctx.lineWidth = 1;
	ctx.strokeStyle = "#000000";
	for(let i = 0; i < systems.length; i++){
		// System Name
		ctx.fillText(systems[i].name, systems[i].pos.x+3, systems[i].pos.y+13);
		
		// Statics
		var staticText = "";
		for(let j = 0; j < systems[i].statics.length ; j++){
			staticText += systems[i].statics[j] + " ";
		}
		ctx.fillText(staticText, systems[i].pos.x+3, systems[i].pos.y+26);
		
		// System Box
		ctx.beginPath();
		ctx.rect(systems[i].pos.x, systems[i].pos.y, systemWidth, systemHeight);
		ctx.stroke();
	}

	// Draw links
	systems.forEach(function(system){
		system.links.forEach(function(link){
			drawLink(ctx, system, systems[link])		
		});
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
	ctx.lineWidth = 2;
	ctx.strokeStyle = "#BBBBBB";
	ctx.beginPath();
	ctx.moveTo(sx, sy);
	ctx.quadraticCurveTo(csx, csy, mx, my);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(ex, ey);
	ctx.quadraticCurveTo(cex, cey, mx, my);
	ctx.stroke();
}

function isInBox(system, x, y){
	if(x >= system.pos.x&& x <= system.pos.x+systemWidth && y >= system.pos.y && y <= system.pos.y+systemHeight){
		return true;
	}
	return false;
}

function add_system(name){
	var system_spacing = 100;
	var pos = new Pos(system_spacing+(systems.length*system_spacing), system_spacing);
	var system = new System(name, pos);
	systems.push(system);
}

function add_link(system, link){
	system.links.push(link);
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
		add_link(systems[0], systems.length-1)
		draw_map_canvas(systems);
	}
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

function getStatics(systemId){
	staticList = [];
	statics.forEach(function(static){
		if(systemId == static.systemId){
			staticList.push(static.name);
		}
	});
	return staticList;
}



