// Graph code used from
// https://github.com/andrewhayward/dijkstra

var Graph = (function (undefined) {

  var extractKeys = function (obj) {
    var keys = [], key;
    for (key in obj) {
        Object.prototype.hasOwnProperty.call(obj,key) && keys.push(key);
    }
    return keys;
  }

  var sorter = function (a, b) {
    return parseFloat (a) - parseFloat (b);
  }

  var findPaths = function (map, start, end, infinity) {
    infinity = infinity || Infinity;

    var costs = {},
        open = {'0': [start]},
        predecessors = {},
        keys;

    var addToOpen = function (cost, vertex) {
      var key = "" + cost;
      if (!open[key]) open[key] = [];
      open[key].push(vertex);
    }

    costs[start] = 0;

    while (open) {
      if(!(keys = extractKeys(open)).length) break;

      keys.sort(sorter);

      var key = keys[0],
          bucket = open[key],
          node = bucket.shift(),
          currentCost = parseFloat(key),
          adjacentNodes = map[node] || {};

      if (!bucket.length) delete open[key];

      for (var vertex in adjacentNodes) {
          if (Object.prototype.hasOwnProperty.call(adjacentNodes, vertex)) {
          var cost = adjacentNodes[vertex],
              totalCost = cost + currentCost,
              vertexCost = costs[vertex];

          if ((vertexCost === undefined) || (vertexCost > totalCost)) {
            costs[vertex] = totalCost;
            addToOpen(totalCost, vertex);
            predecessors[vertex] = node;
          }
        }
      }
    }

    if (costs[end] === undefined) {
      return null;
    } else {
      return predecessors;
    }

  }

  var extractShortest = function (predecessors, end) {
    var nodes = [],
        u = end;

    while (u !== undefined) {
      nodes.push(u);
      u = predecessors[u];
    }

    nodes.reverse();
    return nodes;
  }

  var findShortestPath = function (map, nodes) {
    var start = nodes.shift(),
        end,
        predecessors,
        path = [],
        shortest;

    while (nodes.length) {
      end = nodes.shift();
      predecessors = findPaths(map, start, end);

      if (predecessors) {
        shortest = extractShortest(predecessors, end);
        if (nodes.length) {
          path.push.apply(path, shortest.slice(0, -1));
        } else {
          return path.concat(shortest);
        }
      } else {
        return null;
      }

      start = end;
    }
  }

  var toArray = function (list, offset) {
    try {
      return Array.prototype.slice.call(list, offset);
    } catch (e) {
      var a = [];
      for (var i = offset || 0, l = list.length; i < l; ++i) {
        a.push(list[i]);
      }
      return a;
    }
  }

  var Graph = function (map) {
    this.map = map;
  }

  Graph.prototype.findShortestPath = function (start, end) {
    if (Object.prototype.toString.call(start) === '[object Array]') {
      return findShortestPath(this.map, start);
    } else if (arguments.length === 2) {
      return findShortestPath(this.map, [start, end]);
    } else {
      return findShortestPath(this.map, toArray(arguments));
    }
  }

  Graph.findShortestPath = function (map, start, end) {
    if (Object.prototype.toString.call(start) === '[object Array]') {
      return findShortestPath(map, start);
    } else if (arguments.length === 3) {
      return findShortestPath(map, [start, end]);
    } else {
      return findShortestPath(map, toArray(arguments, 1));
    }
  }

  return Graph;

})();

// Eve nerd code

function buildGraph(preferRouteFlag){
  var graph = {};
  for (let [id, system] of Object.entries(g_systemObjects)){
    var nodes = system.neighbours;
    var newNodes = {};
    /*var isLowSecurity = parseFloat(system.trueSec)<0.5;
    var isHighSecurity = parseFloat(system.trueSec)>0.5;*/
    var isLowSecurity = system.security != "H";
    var isHighSecurity = system.security == "H";
    nodes.forEach(function(node){
      var weight = 1;
      if(isLowSecurity && preferRouteFlag == "SAFER"){
        weight = 100;
      }
      if(isHighSecurity && preferRouteFlag == "LESS_SAFE"){
        weight = 100;
      }
      newNodes[node] = weight;  
    });
    graph[system.id] = newNodes;
  }
  return graph;
}

function printRoute(route){
  var routeNames = [];
  route.forEach(function(jump){
    routeNames.push(g_systemObjects[jump])
  });
  return routeNames;
}

function addSystemToGraph(map, system){
  var systemId = g_nameToId[system.name];
  if(map[systemId] == undefined){
    var n = {};
    system.links.forEach(function(systemName){
      var neighbourId = g_nameToId[systemName];
      n[neighbourId] = 1;
      if(map[neighbourId] == undefined){
        map[neighbourId] = {};
      }
      map[neighbourId][systemId] = 1;
    });
    map[systemId] = n;
  }
  else{
    system.links.forEach(function(systemName){
      var neighbourId = g_nameToId[systemName];
      map[systemId][neighbourId] = 1;
      if(map[neighbourId] == undefined){
        map[neighbourId] = {};
      }
      map[neighbourId][systemId] = 1;
    });
  }
}

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