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
		if(jumpNode == endSystem.id){
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