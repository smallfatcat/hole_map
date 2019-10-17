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
    for (let [id, system] of Object.entries(g_systemObjects)){
        var name = system.name;
        list_solar_systems.push(name);
    }
}