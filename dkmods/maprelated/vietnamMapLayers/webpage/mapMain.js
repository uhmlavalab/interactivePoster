

console.log("mainMap.js loading...");


var ONLY_ENABLE_ONE_LAYER_AT_A_TIME = true;

// ------------------------------------------------------------------------------------------------------------
// Make Map
var zoomLevel = 13;
var center = [22.597483, 104.492310];
var map = leafletHelper.makeMapInId(
	"mapDiv", // id
	center[0], // lat
	center[1], // lng
	zoomLevel, // zoom
	"esri_world_topo"); // tileset to load: default, basic, esri_world_topo



// ------------------------------------------------------------------------------------------------------------
// Load data on map

// First get the bounds of Nam Dan
let namDanCoords = getNamDanCoords();
let imageTopLeft = [
	Math.min(...namDanCoords.map(function(coords){ return coords[1]; })) + 0.0007,
	Math.min(...namDanCoords.map(function(coords){ return coords[0]; })) - 0.005
];
console.log(imageTopLeft);
let imageBottomRight = [
	Math.max(...namDanCoords.map(function(coords){ return coords[1]; })) + 0.0005,
	Math.max(...namDanCoords.map(function(coords){ return coords[0]; })) + 0.003
];
let imageBounds = [imageTopLeft, imageBottomRight];
console.log(imageBounds);

// Now add layers, first get the image names
let layerFileNames = getLayerFileNamesFromImageFolder();
let layerPrefixPath = "images/";
let allLayerObjects = [];
let tempLayer;
// For each image, need to
for (let i = 0 ; i < layerFileNames.length; i++) {
	// Generate a layer
	tempLayer = L.imageOverlay(layerPrefixPath + layerFileNames[i],
		imageBounds,
		{opacity: 0.45}); // More opacity? Less?. NOTE: Not added yet
	allLayerObjects.push(tempLayer); // Store ref for later
	// Adding additional accounting
	tempLayer.enabled = false;
	tempLayer.toggle = function () {
		this.enabled = !this.enabled;
		if (!this.enabled) { this.removeFrom(map); }
		else { this.addTo(map); }
	}
	tempLayer.toggle(); // Start by default with it on
}

map.on('zoomend', handleMapZoom);
map.on('moveend', handleMapPan);

function handleMapZoom(e) {
  zoomLevel = e.target._zoom;
	map.invalidateSize();
};

function handleMapPan(e) {
  center = [map.getCenter().lat, map.getCenter().lng];
	map.invalidateSize();
};



// ------------------------------------------------------------------------------------------------------------
// Add events

map.on('moveend', function(e) {
	let c = map.getBounds();
	// map2.panTo(new L.LatLng(c.lat, c.lng));
	// SAGE2_AppState.callFunctionInContainer("handleMapBoundChange", {lat: c.lat, lng: c.lng});
	SAGE2_AppState.callFunctionInContainer("handleMapBoundChange", {
		_southWest: c._southWest,
		_northEast: c._northEast
	});
});

function handleContainerDataBounds(data) {
	console.log("Currently now handling bounds update from container");
	// console.log("Map received bound data", JSON.stringify(data));
	// map.fitBounds([
  //   [data._northEast.lat, data._northEast.lng],
  //   [data._southWest.lat, data._southWest.lng],
	// ]);
}

// ------------------------------------------------------------------------------------------------------------
// Add control panel
let layerControl = uiHelper.makePanel();
for (let i = 0; i < allLayerObjects.length; i++) {
	uiHelper.addCheckbox(layerControl,
		"PLACEHOLDERNAME-" + i,
		(e)=>{handleLayerCheckboxClick("PLACEHOLDERNAME-" + i, allLayerObjects[i], e)});
}
function handleLayerCheckboxClick(name, layer, e) {
	uiHelper.debugprint(name, e.target.checked);
	layer.toggle();
	// If only one layer is allowed to be toggled at a time.
	if (layer.enabled && ONLY_ENABLE_ONE_LAYER_AT_A_TIME) {
		// Probably less computation way by tracking last layer, but this guarantees.
		for (let i = 0; i < allLayerObjects.length; i++) {
			if (layer !== allLayerObjects[i]) {
				if (allLayerObjects[i].enabled) {
					document.getElementById("cbc" + i).dispatchEvent(new MouseEvent("mousedown"));
				}
			}
		}
	} // end check to disable everything else.
}

// Now turn all the layers off because of style...
for (let i = 0; i < allLayerObjects.length; i++) {
	document.getElementById("cbc" + i).dispatchEvent(new MouseEvent("mousedown"));
}



// ------------------------------------------------------------------------------------------------------------
// Data retrieval functions


function getNamDanCoords() {
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
};

function getLayerFileNamesFromImageFolder() {
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
};


