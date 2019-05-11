








var leafletHelper = {
	mapId: [],
	mapRef: [],
	markerReferences: [],
	debug: true,

	// ------------------------------------------------------------------------------------------------------------
	makeMapInId: function(mapId, lat, lng, zoom = 13, tileset = "default") {
		this.debugprint("make");
		if (this.mapId.includes(mapId)) {
			throw "Error > leafletHelper > Multi call to makeMapInId, current id:" + this.mapId;
			return;
		} else if ((!lat) || (!lng)) {
			throw `Error > leafletHelper > No position for marker given, cannot make marker (${lat}, ${lng})`;
			return;
		}
		this.mapId.push(mapId);
		let newMap = L.map(mapId);
		this.mapRef.push(newMap);
		if (lat && lng) {
			newMap.setView([lat, lng], zoom);
		}

		// Get tiles
		// L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		// 	maxZoom: 18,
		// 	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
		// 		'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		// 		'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		// 	id: 'mapbox.streets'
		// }).addTo(this.mapRef);

		if (tileset === "default") {
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: 19,
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(newMap);
		} else if (tileset == "basic") {
			L.tileLayer('http://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &amp; USGS'
			}).addTo(newMap);
		} else if (tileset === "esri_world_topo") {
			L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
				attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
			}).addTo(newMap);
		}

		return newMap;
	},

	// ------------------------------------------------------------------------------------------------------------
	makeMarkerOnMap: function(mapRef = null, lat, lng, options = {}) {
		if (!mapRef) {
			throw "Error > leafletHelper > Trying to make marker without map reference";
			return;
		} else if ((!lat) || (!lng)) {
			throw `Error > leafletHelper > No position for marker given, cannot make marker at (${lat}, ${lng})`;
			return;
		}
		
		let marker = {
			obj: L.marker([lat, lng]).addTo(mapRef),
			lat, lng, // make field name and value using lat, lng
		};
		if (options.info) { marker.obj.bindPopup(options.info); }
		if (options.center) { mapRef.panTo(new L.LatLng(lat, lng)); }
		if (!mapRef.markerReferences) { mapRef.markerReferences = []; }
		mapRef.markerReferences.push(marker);
		return marker;
	},

	// ------------------------------------------------------------------------------------------------------------
	removeMarkerFromMap: function(mapRef = null, marker = null) {
		if (!mapRef) {
			throw "Error > leafletHelper > removeMarkerFromMap > Cannot remove marker without map reference";
			return;
		} else if (!marker) {
			throw `Error > leafletHelper > removeMarkerFromMap > Marker to remove not given`;
			return;
		}
		if (mapRef.markerReferences.indexOf(marker) !== -1) {
			mapRef.removeLayer(marker.obj); // obj has the actual leaflet marker
			mapRef.markerReferences.splice(mapRef.markerReferences.indexOf(marker), 1);
		}
	},

	

	// // ------------------------------------------------------------------------------------------------------------
	// loadGeoJsonToLayer: function (geoJsonDescription, options) {
	// 	if (!this.mapRef) {
	// 		throw "Error > leafletHelper > Unable to load geojson without map reference";
	// 		return;
	// 	}
	// 	let layer = {};
	// 	if (options) {
	// 		layer.obj = L.geoJSON(geoJsonDescription, options).addTo(this.mapRef);
	// 	} else {
	// 		layer.obj = L.geoJSON(geoJsonDescription).addTo(this.mapRef);
	// 	}
	// 	layer.enabled = true;
	// 	layer.toggle = function() { leafletHelper.toggleLayer(this); }; // call helper function
	// },
	// ------------------------------------------------------------------------------------------------------------
	loadGeoJsonToLayer: function (mapRef = null, geoJsonDescription = null, options = {}) {
		if (!mapRef) {
			throw "Error > leafletHelper > removeMarkerFromMap > Cannot remove marker without map reference";
			return;
		} else if (!geoJsonDescription) {
			throw `Error > leafletHelper > removeMarkerFromMap > Marker to remove not given`;
			return;
		}

		let layer = {};
		layer.geoJsonDescription = geoJsonDescription;
		layer.mapRef = mapRef;
		layer.obj = L.geoJSON(geoJsonDescription, options).addTo(mapRef);

		if (options.center) {
			let bounds = layer.obj.getBounds().getCenter();
			mapRef.panTo(new L.LatLng(bounds.lat, bounds.lng));
		}

		layer.enabled = true;
		layer.toggle = function() { // call helper function
			leafletHelper.toggleLayer(this);
			return this;
		};
		return layer;
	},











	// ------------------------------------------------------------------------------------------------------------
	// The following layer creation might not be possible due to the creation system of the geoJSON

	// ------------------------------------------------------------------------------------------------------------
	createLayer: function (features) {
		if (!this.mapRef) {
			throw "Error > leafletHelper > Unable to make layer without map reference";
			return;
		}
		let layer = {};
		layer.obj = L.geoJSON().addTo(this.mapRef);
		layer.allFeatures = [];
		layer.enabled = true;
		layer.toggle = function() { leafletHelper.toggleLayer(this); }; // call helper function
		layer.addFeature = function(feat) { leafletHelper.addFeatureToLayer(this, feat); }; // call helper function

		if (features) {
			if (features.length) {
				for (let i = 0; i < features.length; i++) {
					layer.addFeature(features[i]);
				}
			} else {
				layer.addFeature(features); // no length property may indicate single feature
			}
		}
		return layer;
	},

	// ------------------------------------------------------------------------------------------------------------
	toggleLayer: function (layer) {
		if (!layer.mapRef) {
			throw "Error > leafletHelper > Unable to toggle layer without map reference";
			return;
		} else if (!layer) {
			throw "Error > leafletHelper > Unable to toggle layer, none given";
			return;
		}
		if (layer.enabled) {
			layer.obj.removeFrom(layer.mapRef);
		} else {
			layer.obj.addTo(layer.mapRef);
		}
		layer.enabled = !layer.enabled;
		return layer;
	},

	// ------------------------------------------------------------------------------------------------------------
	addFeatureToLayer: function (layer, feature) {
		if (!this.mapRef) {
			throw "Error > leafletHelper > Unable to add feature without map reference";
			return;
		} else if (!layer) {
			throw "Error > leafletHelper > Unable to toggle layer, none given";
			return;
		} else if (!feature) {
			throw "Error > leafletHelper > Unable to toggle layer, none given";
			return;
		}
		layer.obj.addData(feature);
		if (feature.property && feature.property.popupInfo) {
			layer.obj.bindPopup(feature.property.popupInfo);
		}
		layer.allFeatures.push(feature);
		return layer;
	},







	

	// ------------------------------------------------------------------------------------------------------------
	debugprint: function(line) {
		if (arguments.length > 1) { console.log("leafletHelper DEBUG>", arguments); }
		else { console.log("leafletHelper DEBUG>", line); }
	}
};




