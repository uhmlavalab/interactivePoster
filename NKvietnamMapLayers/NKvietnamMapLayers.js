var NKvietnamMapLayers = SAGE2_App.extend({
  init: function(data) {
    console.log(data);

    this.SAGE2Init('div', data);
    this.element.id = data.id;
    this.resizeEvents = "continuous";
    this.passSAGE2PointerAsMouseEvents = true;
    this.element.style.fontSize   = 1.1*ui.titleTextSize + "px";
    this.redraw = true;
    this.initialWidth = this.element.offsetWidth;
    this.initialHeight = this.element.offsetHeight;
    this.zoomLevel = 13;
    this.center = [22.597483, 104.492310];
    this.element.position = "relative";
    this.element.innerHTML = this.element.innerHTML
        +`<div id='`+this.element.id+`map' style='position:relative;width:100%;height:100%'></div>
        <div id='`+this.element.id+`control1' style='position:absolute; width:35%; top:80px; left: 12px;color:white;background:rgb(0,0,0,0.7);border-radius:5px; z-index:100000;padding:1em;font-family:Arial;visibility:hidden '><h2 style="padding-bottom:0.5em">Landslides</h2></div>
        <div id='`+this.element.id+`control2' style='position:absolute; width:35%; top:80px; left: 12px;color:white;background:rgb(0,0,0,0.7);border-radius:5px; z-index:100000;padding:1em;font-family:Arial;visibility:hidden '><h2 style="padding-bottom:0.5em">Human Factors</h2></div>
        <div id='`+this.element.id+`control3' style='position:absolute; width:35%; top:80px; left: 12px;color:white;background:rgb(0,0,0,0.7);border-radius:5px; z-index:100000;padding:1em;font-family:Arial;visibility:hidden '><h2 style="padding-bottom:0.5em">Natural Factors</h2></div>`;

    this.landslideControl = document.getElementById(this.element.id+'control1');
    this.humanControl = document.getElementById(this.element.id+'control2');
    this.natureControl = document.getElementById(this.element.id+'control3');

    this.mode = 0;
    //this.humanControl.style.visibility = 'visible';


    // to use special symbols
    let l = document.createElement('link');
    l.rel = "stylesheet";
    l.href= "https://use.fontawesome.com/releases/v5.7.2/css/all.css";
    l.integrity = "sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr";
    l.crossOrigin = "anonymous";
    document.body.appendChild(l);
    ////



    //this.map = L.map(this.element)
    this.map = L.map(document.getElementById(this.element.id+'map'))
      .setView(this.center, this.zoomLevel);

    this.tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
    });

    this.tileLayer.addTo(this.map);

    this.namDanCoords = this.getNamDanCoords();
    this.currentLayer = 0;
	// ---------------------------------------------------------------------------------------------------- Get bounds of nam dan coordinates, then adjust
  console.log("Nam Dan Coords", this.namDanCoords);
  /*
  this.namDanLayer = L.polygon(
    this.namDanCoords.map(function(coords) { return [coords[1], coords[0]]; }),
    {color: 'red'}
  );
  this.namDanLayer.addTo(this.map);
  */
  this.imageTopLeft = [
    Math.min(...this.namDanCoords.map(function(coords){ return coords[1]; })) + 0.0007,
    Math.min(...this.namDanCoords.map(function(coords){ return coords[0]; })) - 0.005
  ];

  console.log(this.imageTopLeft);

  this.imageBottomRight = [
    Math.max(...this.namDanCoords.map(function(coords){ return coords[1]; })) + 0.0005,
    Math.max(...this.namDanCoords.map(function(coords){ return coords[0]; })) + 0.003
  ];

  this.imageBounds = [this.imageTopLeft, this.imageBottomRight];
  console.log(this.imageBounds);

	// ---------------------------------------------------------------------------------------------------- Add image layers
	//let layerFileNames = this.getLayerFileNamesFromImageFolder();
  let layerFileNames = this.getLayerInformation();
  let layerPrefixPath = this.resrcPath + "images/";
	this.allLayerObjects = [];
	let tempLayer;
	let mapRef = this.map;

	for (let i = 0 ; i < layerFileNames.length; i++) {
		//tempLayer = L.imageOverlay(layerPrefixPath + layerFileNames[i],
    tempLayer = L.imageOverlay(layerPrefixPath + layerFileNames[i].file,
			this.imageBounds,
			{opacity: 0.45}); // More opacity? Less?. NOTE: Not added yet
		this.allLayerObjects.push(tempLayer);
		// Adding additional accounting
		tempLayer.enabled = true
		tempLayer.toggle = function () {
			this.enabled = !this.enabled;
			if (this.enabled) { this.removeFrom(mapRef); }
			else { this.addTo(mapRef); }
		}
    let _this = this;
    tempLayer.enable = function() {
      _this.disableAllLayers();
      this.enabled = true;
      this.addTo(mapRef);

      element = document.getElementById(_this.element.id+'_option_'+this.index);
      element.childNodes[0].classList.remove('fa-square');
      element.childNodes[0].classList.add('fa-check-square');
    }
    tempLayer.index = i;

    if (layerFileNames[i].type == 0) {//landslide
      this.landslideControl.innerHTML = this.landslideControl.innerHTML +
        '<div id="'+this.element.id+'_option_'+i+'" class="control_option" style="width:100%;padding:0.25em 0;border-top:1px solid white;"><i class="fa fa-square" style="padding-right:1em"></i>'+ layerFileNames[i].title +' </div>';
    }
    if (layerFileNames[i].type == 1) {//human Factors
      this.humanControl.innerHTML = this.humanControl.innerHTML +
        '<div id="'+this.element.id+'_option_'+i+'" class="control_option" style="width:100%;padding:0.25em 0;border-top:1px solid white;"><i class="fa fa-square" style="padding-right:1em"></i>'+ layerFileNames[i].title +' </div>';
    }
    if (layerFileNames[i].type == 2) {//natural Factors
      this.natureControl.innerHTML = this.natureControl.innerHTML +
        '<div id="'+this.element.id+'_option_'+i+'" class="control_option" style="width:100%;padding:0.25em 0;border-top:1px solid white;"><i class="fa fa-square" style="padding-right:1em"></i>'+ layerFileNames[i].title +' </div>';
    }
	}
  this.landslideControl.innerHTML = this.landslideControl.innerHTML +
  '<div style="padding-top:2em"><span style="display:inline-block;width:50px">Start:</span><i class="fa fa-calendar"  style="font-size:30px"></i> </div>' +
  '<div style="padding-top:1em"><span style="display:inline-block;width:50px">End:</span><i class="fa fa-calendar"  style="font-size:30px"></i> </div>';


  this.landslideMode();
  this.getFullContextMenuAndUpdate();
  this.addListeners();
	//allLayerObjects[0].toggle();

  //this.allLayerObjects = allLayerObjects; // Save for later
  //this.allLayerObjects[0].enable();


  this.handleMapZoom = this.handleMapZoom.bind(this);
  this.handleMapPan = this.handleMapPan.bind(this);
  this.map.on('zoomend', this.handleMapZoom);
  this.map.on('moveend', this.handleMapPan);
},

addListeners:function() {
  let _this = this;
  elements = document.getElementsByClassName("control_option");
  let mouse_out = function(event) {
    event.target.style.backgroundColor = "rgb(0,0,0,0)";
    event.target.style.color = "white";
  }
  let mouse_over = function(event) {
     event.target.style.backgroundColor = "gray";
     event.target.style.color = "black";
   }
   let mouse_click = function(event) {
     tokens = event.target.id.split("_");
     index = parseInt(tokens[tokens.length - 1]);
     _this.allLayerObjects[index].enable();
    }
  for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener('mouseout', mouse_out, false);
    elements[i].addEventListener('mouseover', mouse_over, false);
    elements[i].addEventListener('click', mouse_click, false);
  }
},

disableAllLayers: function(){
  for (let i = 0 ; i < this.allLayerObjects.length; i++) {
    if (this.allLayerObjects[i].enabled) { this.allLayerObjects[i].removeFrom(this.map); }
    this.allLayerObjects[i].enabled = false;
    element = document.getElementById(this.element.id+'_option_'+this.allLayerObjects[i].index);
    element.childNodes[0].classList.add('fa-square');
    element.childNodes[0].classList.remove('fa-check-square');
  }
},
getContextEntries: function() {
  var entries = [];

  var entry   = {
      description: "Landslide mode", // A string
      callback: "landslideMode", // Name of an existing function within this application. Must be in a string.
      parameters: {}, // An object that will be passed to the callback function
    };
    entries.push(entry);
    entry   = {
        description: "Human mode", // A string
        callback: "humanMode", // Name of an existing function within this application. Must be in a string.
        parameters: {}, // An object that will be passed to the callback function
      };
      entries.push(entry);
      entry   = {
          description: "Nature mode", // A string
          callback: "naturalMode", // Name of an existing function within this application. Must be in a string.
          parameters: {}, // An object that will be passed to the callback function
        };
        entries.push(entry);

  entry = {
    description: "separator"
  }; // This creates a line entry used for visual separation
  entries.push(entry);
  return entries;
},
test : function(msgParams){

  console.log("fuck");
},
landslideMode: function(msgParams) {
  this.mode = 0;
  this.landslideControl.style.visibility = 'visible';
  this.humanControl.style.visibility = 'hidden';
  this.natureControl.style.visibility = 'hidden';
  // choose the first in the mode
  this.allLayerObjects[1].enable();
  this.redraw = true;
  this.getFullContextMenuAndUpdate();
  this.updateTitle("Vietnam - Landslide Maps");
},
humanMode: function(msgParams) {
  console.log("HHHHHHHHHHHHHH");
  this.mode = 1;
  this.landslideControl.style.visibility = 'hidden';
  this.humanControl.style.visibility = 'visible';
  this.natureControl.style.visibility = 'hidden';
  // choose the first in the mode
  this.allLayerObjects[0].enable();
  this.redraw = true;
  this.getFullContextMenuAndUpdate();
  this.updateTitle("Vietnam - Human Factor Maps");
},
naturalMode: function(msgParams) {
  this.mode = 2;
  this.landslideControl.style.visibility = 'hidden';
  this.humanControl.style.visibility = 'hidden';
  this.natureControl.style.visibility = 'visible';
  // choose the first in the mode
  this.allLayerObjects[3].enable();
  this.redraw = true;
  this.getFullContextMenuAndUpdate();
  this.updateTitle("Vietnam - Nature Factor Maps");
},
load: function(date) {

},

draw: function(date) {

  if (this.redraw) {
    this.redraw = false;
    console.log(this.zoomLevel);
    console.log(this.center);
    this.map.invalidateSize();
  }
},

resize: function(date) {
    var percentChange = (this.element.offsetHeight - this.initialHeight) / (this.initialHeight * 15);
    this.initialHeight = this.element.offsetHeight;
    this.initialWidth = this.element.offsetWidth;

    this.zoomLevel += this.zoomLevel * percentChange;
    console.log(this.zoomLevel);
    this.map.setZoom(this.zoomLevel);
    this.map.panInside(this.center);

    this.redraw = true;
    this.refresh(date); //redraw after resize
},

event: function(type, position, user, data, date) {
    if (type == "specialKey") {
      if (data.code == 37) { //left
        console.log(this.allLayerObjects);
      }
      else if (data.code == 39) { //right
        if (this.currentLayer < this.allLayerObjects.length-1) {
          this.allLayerObjects[this.currentLayer].toggle();
          this.currentLayer++;
          this.allLayerObjects[this.currentLayer].toggle();
        }
        else {
          this.allLayerObjects[this.currentLayer].toggle();
          this.currentLayer = 0;
          this.allLayerObjects[this.currentLayer].toggle();
        }
      }
    }
    this.refresh(date);
},

move: function(date) {
    this.redraw = true;
    this.refresh(date);
},

quit: function() {
    this.log("Done");
},

// ---------------------------------------------------------------------------------------------------- Map events
handleMapZoom: function(e) {
  this.zoomLevel = e.target._zoom;
  this.redraw = true;
},

handleMapPan: function(e) {
  this.center = [this.map.getCenter().lat, this.map.getCenter().lng];
  this.redraw = true;
},


// ---------------------------------------------------------------------------------------------------- Data Storage


getNamDanCoords: function() {
	return [
		[104.53433990478521, 22.600080490112305],
		[104.52680969238281, 22.598884582519645],
		[104.5262451171875, 22.597156524658203],
		[104.52052307128906, 22.59026908874523],
		[104.5198364257813, 22.58804512023937],
		[104.5182037353515, 22.588111877441406],
		[104.5111465454101, 22.579690933227653],
		[104.51381683349604, 22.575023651123047],
		[104.5121078491211, 22.569698333740234],
		[104.50918579101574, 22.567895889282227],
		[104.50345611572277, 22.567920684814396],
		[104.50194549560558, 22.568916320800895],
		[104.50160980224604, 22.567518234252987],
		[104.49979400634771, 22.567356109619084],
		[104.49396514892572, 22.569669723510856],
		[104.48394012451178, 22.570178985595817],
		[104.47723388671875, 22.568000793457145],
		[104.4755477905274, 22.566082000732422],
		[104.47188568115234, 22.56677627563471],
		[104.46526336669928, 22.56536865234375],
		[104.46131896972668, 22.56722640991211],
		[104.45981597900402, 22.572462081909237],
		[104.46635437011719, 22.574806213378963],
		[104.46467590332037, 22.57940483093273],
		[104.46292114257812, 22.589218139648438],
		[104.46248626708996, 22.594860076904297],
		[104.46390533447266, 22.597913742065373],
		[104.46015930175793, 22.601863861084098],
		[104.4590530395509, 22.604158401489258],
		[104.46044921875, 22.607482910156364],
		[104.46017456054699, 22.610662460327262],
		[104.4622192382813, 22.613180160522404],
		[104.46424865722656, 22.618387222290153],
		[104.47553253173828, 22.629915237426758],
		[104.479965209961, 22.630012512206974],
		[104.48390197753906, 22.631443023681584],
		[104.48668670654308, 22.631084442138672],
		[104.48731994628906, 22.629417419433707],
		[104.4920883178711, 22.629661560058594],
		[104.4926528930664, 22.628423690796012],
		[104.49343872070312, 22.628305435180778],
		[104.49507904052746, 22.628963470458928],
		[104.49832916259777, 22.628643035888672],
		[104.5018920898438, 22.627481460571346],
		[104.50289916992199, 22.625940322876033],
		[104.50436401367193, 22.626493453979606],
		[104.50683593750006, 22.625469207763786],
		[104.50782775878912, 22.62599372863781],
		[104.51044464111328, 22.624897003173942],
		[104.51514434814447, 22.624673843383903],
		[104.51828765869146, 22.618677139282227],
		[104.51986694335949, 22.613346099853516],
		[104.52422332763678, 22.611944198608455],
		[104.53142547607422, 22.611270904541016],
		[104.53483581542969, 22.60900306701666],
		[104.53626251220714, 22.603666305541992],
		[104.53452301025396, 22.60245704650879],
		[104.53433990478521, 22.600080490112305]
	];
},

getLayerFileNamesFromImageFolder: function() {
	return [
		["DEM_0000_assets-value-distribution.png"],
		["DEM_0001_landslide-hazard-index.png"],
		["DEM_0002_landslide-hazard-zonation.png"],
		["DEM_0003_vertical-segmentation.png"],
		["DEM_0004_geologic-lithology.png"],
		["DEM_0005_housing-distribution.png"],
		["DEM_0006_rainfall-zonation.png"],
		["DEM_0007_geomorphology.png"],
		["DEM_0008_road-density.png"],
		["DEM_0009_population-density-distribution.png"],
		["DEM_0010_fracture-density.png"],
		["DEM_0011_density-of-horizontal-segmentation.png"],
		["DEM_0012_land-use.png"],
		["DEM_0013_slope-aspect.png"],
		["DEM_0014_slope-angle.png"],
		["DEM_0015_weathering-coverage.png"],
		["DEM_0016_landslide-inventory.png"],
		["DEM_0017_Layer-1.png"],
	];
},

getLayerInformation: function() {
	return [
		{"file":"DEM_0000_assets-value-distribution.png", "title":"Assets Value Distribution", "type":1 },
		{"file":"DEM_0001_landslide-hazard-index.png", "title":"Landslide Hazard Index", "type":0},
		{"file":"DEM_0002_landslide-hazard-zonation.png", "title":"Landslide Hazard Zonation", "type":0},
		{"file":"DEM_0003_vertical-segmentation.png", "title":"Vertical Segmentation","type":2},
		{"file":"DEM_0004_geologic-lithology.png", "title":"Geologic Lithology","type":2},
		{"file":"DEM_0005_housing-distribution.png", "title":"Housing Distribution", "type":1},
		{"file":"DEM_0006_rainfall-zonation.png", "title":"Rainfall Zonation","type":2},
		{"file":"DEM_0007_geomorphology.png", "title":"Geomorphology","type":2},
		{"file":"DEM_0008_road-density.png", "title":"Road Density","type":1},
		{"file":"DEM_0009_population-density-distribution.png", "title":"Population Density Distribution","type":1},
		{"file":"DEM_0010_fracture-density.png", "title":"Fracture Density","type":2},
		{"file":"DEM_0011_density-of-horizontal-segmentation.png", "title":"Density of Horizontal Segmentation","type":2},
		{"file":"DEM_0012_land-use.png", "title":"Land Use","type":1},
		{"file":"DEM_0013_slope-aspect.png", "title":"Slope Aspect","type":2},
		{"file":"DEM_0014_slope-angle.png", "title":"Slope Angle","type":2},
		{"file":"DEM_0015_weathering-coverage.png", "title":"Weathering Coverage","type":2},
		{"file":"DEM_0016_landslide-inventory.png", "title":"Landslide Inventory", "type":0},
		{"file":"DEM_0017_Layer-1.png", "title":"DEM","type":2},
	];
}
});
