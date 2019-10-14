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
	constructor(name, pos) {
		this._name = name;
		this._sigs = [];
		this._links = [];
		this._statics = [];
		this._pos = pos;
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
}