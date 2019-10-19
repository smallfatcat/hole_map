function layout(){
	var layers = [];
	for(let [id, system] of Object.entries(mappedSystems)){
		if(layers[system.distance] == undefined){
			var layer = [system.name];
			layers[system.distance] = layer;
		}
		else{
			layers[system.distance].push(system.name);
		}
	}
	return layers;
}

function process_layers(){
	oldLayers = layout();
	var newLayers = [];
	newLayers[0] = oldLayers[0];
	var activeLayers = [];
	oldLayers.forEach(function(layer, distance){
		activeLayers.push(distance);
	});
	activeLayers.forEach(function(distance){
		// Each system in layer
		if(newLayers[distance] == undefined){
			newLayers[distance] = oldLayers[distance];
		}
		newLayers[distance].forEach(function(systemName){
			var system = mappedSystems[g_nameToId[systemName]];
			// Each link in system
			system.links.forEach(function(linkSystemName){
				var linkSystem = mappedSystems[g_nameToId[linkSystemName]];
				// add to newLayers with index distance if it doesn't exist there
				if(newLayers[linkSystem.distance] == undefined){
					newLayers[linkSystem.distance] = [];
				}
				if(newLayers[linkSystem.distance].indexOf(linkSystem.name) == -1){
					newLayers[linkSystem.distance].push(linkSystem.name);
				}
			});
		});
	});
	return newLayers;
}

function pull_system(system, layer){
	var systemIndex = layer.indexOf(system);
	var newlayer = [];
	if(systemIndex != -1){
		newlayer = layer.splice(systemIndex, 1);
	}
	return newlayer[0];
}

function arrangeSystems(){
	var layers = process_layers();
	var columns = [0,0,0,0,0,0,0,0];
	layers.forEach(function(layer, distance){
		layer.forEach(function(systemName){
			if(distance > 7){
				distance = 7;
			}
			columns[distance]++;
		});
	});
	var columnPositions = [];
	columns.forEach(function(column){
		var positions = [];
		for(let i = 1; i <= column; i++){
			positions.push((arrangeY/(column+1)*i)-25);
		}
		columnPositions.push(positions);
	});
	layers.forEach(function(layer, distance){
		layer.forEach(function(systemName){
			var system = mappedSystems[g_nameToId[systemName]];
			system.pos.x = (arrangeX * system.distance) + 50;
			if(system.pos.x > 1100){
				system.pos.x = 1100;
			}
			system.pos.y = columnPositions[system.distance < 8 ? system.distance : 7].shift();
		});
	});
}

function arrangeSystemsOld(){
	var columns = [0,0,0,0,0,0,0,0];
	for (let [id, system] of Object.entries(mappedSystems)){
		if(system.distance < 8){
			columns[system.distance]++;
		}
		else{
			columns[7]++;
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
		if(system.pos.x > 1100){
			system.pos.x = 1100;
		}
		system.pos.y = columnPositions[system.distance < 8 ? system.distance : 7].shift();
	};
}

function getSecurityColor(security){
	var color = "#206ACC";
	if(security == "H"){
		color = "#20C129";
	}
	if(security == "L"){
		color = "#DDA922";
	}
	if(security == "0.0" || security == "0"){
		color = "#CC203E";
	}
	return color;
}

function getLinkNodes(a, b){
	var cpOffset = [new Pos(0, -10), new Pos(10, 0), new Pos(0, 10), new Pos(-10, 0)];
	var nodesA = getNodes(a);
	var nodesB = getNodes(b);
	var shortestDist2 = Infinity;
	var aIndex = 0;
	var bIndex = 0;
	for(let s = 0; s < 4; s++){
		for(let e = 0; e < 4; e++){
			var dist = dist2(nodesA[s], nodesB[e]);
			if(dist < shortestDist2){
				if((s%2 == 0 || e%2 == 0) && dist > 2500){
					continue;
				}
				shortestDist2 = dist;
				aIndex = s;
				bIndex = e;
			}
		}
	}
	var linkNodes = [nodesA[aIndex], nodesB[bIndex]];
	var cpNodes = [cpOffset[aIndex], cpOffset[bIndex]];
	var nodes = [linkNodes, cpNodes];
	return nodes;
}

function dist2(a, b){
	var distance2 = (b.x - a.x)**2 + (b.y - a.y)**2;
	return distance2;
}

function getNodes(a){
	var am = new Pos(systemWidth / 2, systemHeight / 2);
	var au = new Pos(a.x + am.x, a.y);
	var ad = new Pos(a.x + am.x, a.y + systemHeight);
	var ar = new Pos(a.x + systemWidth, a.y + am.y);
	var al = new Pos(a.x, a.y + am.y);
	var nodes = [au, ar, ad, al];
	return nodes;
}

function draw_map_canvas(){
	//arrangeSystems();
	var canvas = document.getElementById("map_canvas");
	var ctx = canvas.getContext("2d");
	
	// Draw systems
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.lineWidth = 1;
	ctx.strokeStyle = "#000000";
	ctx.font = "12px Verdana bold";
	
	// Mouse
	ctx.fillText(g_canMouseX +":"+g_canMouseY, 10, 10);
	
	// Loop through each mapped system
	for (let [id, system] of Object.entries(mappedSystems)){
		ctx.font = "12px sans-serif";
		
		// Top line
		var topLineText = system.security + " " +system.name;
		ctx.fillStyle = getSecurityColor(system.security);
		ctx.fillText(topLineText, system.pos.x+3, system.pos.y+13);
		ctx.fillStyle = "#000000";

		// Bottom Line right
		var bottomLineRight = "";
		for(let j = 0; j < system.statics.length ; j++){
			bottomLineRight += " " + getWHinfo(system.statics[j]).class;
		}

		ctx.textAlign = "end";
		ctx.fillText(bottomLineRight, system.pos.x+77, system.pos.y+systemHeight-3);
		ctx.textAlign = "start";


		// Bottom Line left
		var bottomLineLeft = system.distance + " " + (system.ship_kills != undefined ? system.ship_kills : " ");
		bottomLineLeft += " " + (system.npc_kills != undefined ? system.npc_kills : " ");
		ctx.fillText(bottomLineLeft, system.pos.x+3, system.pos.y+systemHeight-3);

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
	// Loop through each mapped system
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
	var nodes = getLinkNodes(startSystem.pos, endSystem.pos);
	var linkNodes = nodes[0];
	var cpnodes = nodes[1];

	var sx = linkNodes[0].x;
	var sy = linkNodes[0].y;
	var ex = linkNodes[1].x;
	var ey = linkNodes[1].y;
	var modx = 0;
	var mody = 0;
	if((cpnodes[0].x == -10 && cpnodes[1].x == -10)||(cpnodes[0].x == 10 && cpnodes[1].x == 10)){
		modx = cpnodes[0].x;
		mody = cpnodes[0].y;
	}
	var mx = (sx+(ex - sx)/2)+modx;
	var my = (sy+(ey - sy)/2)+mody;
	var csx = sx + cpnodes[0].x;
	var csy = sy + cpnodes[0].y;
	var cex = ex + cpnodes[1].x;
	var cey = ey + cpnodes[1].y;
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