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

	// Initialise map with home systems
	init_map();

	// Get kills from ESI
	ESI_getKills();
	
	add_mouse_listeners();
	// routing
	calcRouteMap();

	// Draw Map
	arrangeSystems();
	draw_map_canvas();
	attach_autocomplete('#system_input', list_solar_systems);
} );


async function ESI_getKills(){
	fetch('https://esi.evetech.net/latest/universe/system_kills/?datasource=tranquility')
    .then(function(response) {
      if (!response.ok) {
        throw new Error("HTTP error, status = " + response.status);
      }
      return response.json();
    })
    .then(function(json) {
    	console.log(json);
    	add_kills(json);
    })
}

function add_kills(json){
	json.forEach(function(systemData){
		var system = g_systemObjects[systemData.system_id];
		var mappedSystem = mappedSystems[systemData.system_id];
		system.ship_kills = systemData.ship_kills;
		system.pod_kills = systemData.pod_kills;
		system.npc_kills = systemData.npc_kills;
		if(mappedSystem != undefined){
			mappedSystem.ship_kills = systemData.ship_kills;
			mappedSystem.pod_kills = systemData.pod_kills;
			mappedSystem.npc_kills = systemData.npc_kills;
		}
	})
}

//
//
//
// Initialise Everything

var mappedSystems = {};

var br = "</br>"
var list_solar_systems = [];
prepare_autocomplete();
//var systems = [];
//var systemList = ["J172701", "Jita", "Amarr", "Nalvula", "Jan"];
var systemList = ["J172701", "Jita", "Amarr"];
var current_system = "NONE_SELECTED";
var systemWidth = 80,
		systemHeight = 40,
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
		add_system(systemList[i]);
	}
	//add_link(mappedSystems[g_nameToId["J172701"]],mappedSystems[g_nameToId["Nalvula"]]);
	//add_link(mappedSystems[g_nameToId["J172701"]],mappedSystems[g_nameToId["Jan"]]);
}

function add_system(newSystemName){
	var newSystemId = g_nameToId[newSystemName];
	var newSystem = g_systemObjects[newSystemId];
	// Check if any existing systems have jump gate links to this system
	mappedSystems[newSystemId] = new System(newSystem);
	for (let [existingSystemId, existingSystem] of Object.entries(mappedSystems)) {
		if(isNeighbour(newSystem, existingSystem)){
			add_link(existingSystem, newSystem);;
		}
	}
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

function add_link(systemA, systemB){
	systemA.links.push(systemB.name);
	systemB.links.push(systemA.name);
	calcRouteMap();
	draw_map_canvas();
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
	for (let [id, system] of Object.entries(g_systemObjects)){
		if(system.name.toUpperCase() == newSystem.toUpperCase()){
			returnValue = system.name;
		}
	}
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
	var systemBId = systemB.id;
	var neighbours = systemA.neighbours;
	neighbours.forEach(function(neighbour){
		if(neighbour == systemBId){
			returnValue = true;
		}
	});
	return returnValue;
}
