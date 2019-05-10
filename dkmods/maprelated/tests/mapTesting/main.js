




let mapInfo = {
	id: "mapid",
	// // London
	// lat: 51.505,
	// lng: -0.09,
	// Daejeon
	lat: 36.375,
	lng: 127.393,
}

leafletHelper.makeMapInId(mapInfo.id, mapInfo.lat, mapInfo.lng, 10);
// leafletHelper.makeMarkerOnMap(mapInfo.lat, mapInfo.lng, {info:"Place In Daejeon", center: true});




// ------------------------------------------------------------------------------------------------------------
// Examples for geojson

/*

ALL GEOJSON IS LNG, LAT

*/

// Add point
leafletHelper.createLayer(
	{ type: "Feature", geometry: {"type": "Point", "coordinates": [mapInfo.lng, mapInfo.lat]}, properties: {"popupInfo": "Center view"}},
	{
		onEachFeature: function (feature, layer) {
			layer.bindPopup(feature.properties.popupContent);
		}
	}
);
leafletHelper.createLayer(
	{ type: "FeatureCollection", "features": [
		{
			"geometry": {
					"type": "Point",
					"coordinates": [
							-104.9998241,
							39.7471494
					]
			},
			"type": "Feature",
			"properties": {
					"popupContent": "This is a B-Cycle Station. Come pick up a bike and pay by the hour. What a deal!"
			},
			"id": 51
		},
		{
				"geometry": {
						"type": "Point",
						"coordinates": [
								-104.9983545,
								39.7502833
						]
				},
				"type": "Feature",
				"properties": {
						"popupContent": "This is a B-Cycle Station. Come pick up a bike and pay by the hour. What a deal!"
				},
				"id": 52
		}
	]},
	{

	}
);

	

