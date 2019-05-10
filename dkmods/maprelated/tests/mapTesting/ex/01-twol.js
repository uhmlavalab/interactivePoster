




let mapInfo = {
	id1: "map1",
	id2: "map2",
	id3: "map3",
	id4: "map4",
	// // London
	// lat: 51.505,
	// lng: -0.09,
	// // Daejeon
	// lat: 36.375,
	// lng: 127.393,
	lat: 21.299678,
	lng: -157.815829,
}

let map1 = leafletHelper.makeMapInId(mapInfo.id1, mapInfo.lat, mapInfo.lng, 10);
let map2 = leafletHelper.makeMapInId(mapInfo.id2, mapInfo.lat, mapInfo.lng, 13);
let map3 = leafletHelper.makeMapInId(mapInfo.id3, mapInfo.lat, mapInfo.lng, 16);
let map4 = leafletHelper.makeMapInId(mapInfo.id4, mapInfo.lat, mapInfo.lng, 19);
// leafletHelper.makeMarkerOnMap(mapInfo.lat, mapInfo.lng, {info:"Place In Daejeon", center: true});


map1.on('moveend', function(e) {
	let c = map1.getCenter();
	map2.panTo(new L.LatLng(c.lat, c.lng));
	map3.panTo(new L.LatLng(c.lat, c.lng));
	map4.panTo(new L.LatLng(c.lat, c.lng));
});

let m1marker1 = leafletHelper.makeMarkerOnMap(map1, mapInfo.lat, mapInfo.lng, {info:"Keller", center: true});
map1.on("click", function() {
	leafletHelper.removeMarkerFromMap(map1, m1marker1);
})





// ------------------------------------------------------------------------------------------------------------
// Examples for geojson

/*

ALL GEOJSON IS LNG, LAT

*/
