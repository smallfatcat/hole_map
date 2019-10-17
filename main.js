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
