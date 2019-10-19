class ScanResult {
	constructor(pasteData){
		this._rawData = pasteData;
		this._lines = this._rawData.split('\n');
		this._scanType = "UNKNOWN";
		this._probeResultData = [];
		this._dcsanResultData = [];
		this.parsePasteData();
	}

	parsePasteData(){
		for(let i = 0; i < this._lines.length; i++){
			var result = this._lines[i].split('\t');
			if(result.length==4){
				this._dcsanResultData.push(result);
				this._scanType = "DSCAN";
			}
			if(result.length==6){
				this._probeResultData.push(result);
				this._scanType = "PROBE";
			}
		}
	}

	getSigHtml(){
		var outputHtml = "";
		if(this._scanType = "PROBE"){
			outputHtml = "<table><tr><td>ID</td><td>TYPE</td><td>SUBTYPE</td><td>NAME</td><td>PC</td><td>DISTANCE</td></tr>"
			for(let i = 0; i < this._probeResultData.length; i++){
				outputHtml += "<tr>";
				for(let j = 0; j < this._probeResultData[i].length; j++){
					outputHtml += "<td>"+ this._probeResultData[i][j] +"</td>";
				}
				outputHtml += "</tr>";
			}
			outputHtml += "</table>";
		}
		return outputHtml;
	}
}

class Sig {
	constructor(id, type, added, updated, target){
		this._id = id;
		this._type = type;
		this._added = added;
		this._updated = updated;
		this._target = target;
	}

	set id(id){
		this._id = id;
	}

	get id(){
		return this._id;
	}

	set type(type){
		this._type = type;
	}

	get type(){
		return this._type;
	}

	set added(added){
		this._added = added;
	}

	get added(){
		return this._added;
	}

	set updated(updated){
		this._updated = updated;
	}

	get updated(){
		return this._updated;
	}

	set target(target){
		this._target = target;
	}

	get target(){
		return this._target;
	}
}

class Pos {
	constructor(x, y){
		this._x = x;
		this._y = y;
	}

	set x(x){
		this._x = x; 
	}

	get x(){
		return this._x;
	}

	set y(y){
		this._y = y; 
	}

	get y(){
		return this._y;
	}

	set pos(pos){
		this._x = pos.x;
		this._y = pos.y;
	}
}

class System {
	constructor(system) {
		// "30000001":{"name":"Tanoo","sigs":[],"links":[],"statics":[],"pos":{"x":100,"y":100},"distance":0,"security":"H","route":[],"neighbours":["30000003","30000005","30000007"]}
		this._name = system.name;
		this._sigs = system.sigs;
		this._links = system.links;
		this._statics = system.statics;
		this._pos = system.pos;
		this._distance = system.distance;
		this._security = system.security;
		this._route = system.route;
		this._neighbours = system.neighbours;
		this._id = system.id;
		this._ship_kills = system.ship_kills || 0;
		this._pod_kills = system.pod_kills || 0;
		this._npc_kills = system.npc_kills || 0;
	}

	get ship_kills(){
		return this._ship_kills;
	}

	set ship_kills(ship_kills){
		this._ship_kills = ship_kills;
	}

	get pod_kills(){
		return this._pod_kills;
	}

	set pod_kills(pod_kills){
		this._pod_kills = pod_kills;
	}

	get npc_kills(){
		return this._npc_kills;
	}

	set npc_kills(npc_kills){
		this._npc_kills = npc_kills;
	}

	get id(){
		return this._id;
	}

	set id(id){
		this._id = id;
	}

	get neighbours(){
		return this._neighbours;
	}

	set neighbours(neighbours){
		this._neighbours = neighbours;
	}

	get route(){
		return this._route;
	}

	set route(route){
		this._route = route;
	}

	get security(){
		return this._security;
	}

	set security(security){
		this._security = security;
	}

	get distance(){
		return this._distance;
	}

	set distance(distance){
		this._distance = distance;
	}

	get name(){
		return this._name;
	}

	set name(name){
		this._name = name;
	}

	get pos(){
		return this._pos;
	}

	set links(links){
		this._links = links
	}

	get links(){
		return this._links;
	}

	set statics(statics){
		this._statics = statics;
	}

	get statics(){
		return this._statics;
	}

	addSig(id, type, added, updated, target){
		var sig = new Sig(id, type, added, updated, target);
		this._sigs.push(sig);
	}
}