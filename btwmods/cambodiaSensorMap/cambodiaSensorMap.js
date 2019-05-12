var cambodiaSensorMap = SAGE2_App.extend({
  init: function(data) {
    console.log(data);
    this.SAGE2Init('div', data);
    this.resizeEvents = "continuous";
    this.redraw = true;
    this.initialWidth = this.element.offsetWidth;
    this.initialHeight = this.element.offsetHeight;
    this.zoomLevel = 7;
    this.center = [12.50723484116556, 105.20276069641115];
    this.map = L.map(this.element)
      .setView(this.center, this.zoomLevel);

    this.tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
    });

    this.handleMapPan = this.handleMapPan.bind(this);
    this.handleMapZoom = this.handleMapZoom.bind(this);
    this.handleMarkerClick = this.handleMarkerClick.bind(this);
    this.tileLayer.addTo(this.map);
    this.map.on('moveend', this.handleMapPan);
    this.map.on('zoomend', this.handleMapZoom);

    this.sensors = [];
    this.sensorLayers = [];
    var _this = this;
    fetch(this.resrcPath + "/text/cambodiaSensor.txt")
      .then(function(response) {
        return response.text();
      })
      .then(function(text) {
        return JSON.parse(text);
      }).then(function(json) {
        json.features.forEach(function(feature){
          _this.sensors.push({
            lat: feature.geometry.coordinates[1],
            long: feature.geometry.coordinates[0],
            name: feature.properties.name
          });
        });
        return _this.sensors;
      }).then(function(sensors) {
        sensors.forEach(function(sensor) {
          var sensorLayer = L.marker([sensor.lat, sensor.long]);
          sensorLayer.sid = sensor.name + sensor.lat + sensor.long;
          _this.sensorLayers.push(sensorLayer);
        });
        return _this.sensorLayers;
      }).then(function(layers) {
        layers.forEach(function(layer) {
          layer.on('click', _this.handleMarkerClick);
          layer.addTo(_this.map);
        });
			});
		// This is to track graph lines
		this.linesToGraphs = [];
	},

	load: function(date) {

	},

	draw: function(date) {

		if (this.redraw) {
			this.redraw = false;
			this.map.invalidateSize();
		}
		if (this.linesToGraphs.length > 0) {
			this.updatesLinesToGraphs();
		}
	},

	resize: function(date) {
			var percentChange = (this.element.offsetHeight - this.initialHeight) / (this.initialHeight * 7);
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
			
			this.refresh(date);
	},

	move: function(date) {
			this.redraw = true;
			this.refresh(date);
	},

	quit: function() {
			this.log("Done");
	},

	handleMapZoom: function(e) {
		this.zoomLevel = e.target._zoom;
		this.redraw = true;
	},

	handleMapPan: function(e) {
		this.center = [this.map.getCenter().lat, this.map.getCenter().lng];
		this.redraw = true;
	},

	handleMarkerClick: function(e) {
		var latlng = e.latlng;
		this.sensors.forEach((sensor) => {
			if (sensor.lat === latlng.lat && sensor.long === latlng.lng) {
        console.log(sensor);
				this.launchAppWithValues("randomDataGenerator", {name: sensor.name}, this.sage2_x + this.sage2_width, this.sage2_y - ui.titleBarHeight);
				this.linesToGraphs.push({replace:true, latlng});
				setTimeout(() => {
					this.makeLineToChildGraph();
				}, 500); // How much is enough time?
			}
		});
	},

	makeLineToChildGraph: function() {
		let child, latlng;
		for (let i = 0; i < this.linesToGraphs.length; i++){
			child = this.linesToGraphs[i];
			if (child.replace) {
				latlng = child.latlng; // Keep the location
				child = applications[this.childrenAppIds[i]];
				this.linesToGraphs[i] = this.makeLine({
					linePosition: "foreground",
					appId: this.id,
					appEndId: this.childrenAppIds[i],
					index: i,
					appStart: latlng
				});
			}
		}
	},

	// ----------------------------------------------------------------------------------------------------
	// Line related
	/*
	Trying to allow general usage. Might become complex though.
	Properties of options:
		linePosition:			"background", "foreground"
		appStart: 				appId
		appEndId:						appid
	*/
	makeLine: function(options = {}) {
		var line; // Create line
		if (options.linePosition === "background") { line = svgBackgroundForWidgetConnectors.line(0,0,0,0); }
		else if (options.linePosition === "foreground") { line = svgForegroundForWidgetConnectors.line(0,0,0,0); }
		else { throw "Error creating line on position type: " + options.linePosition; }

		// Create the line properties for later reference.
		// Random int should be changed to something more meaningful later
		let color = "#";
		for (let i = 0; i < 6; i++) {
			color += this.randomInt(0,9);  // Getting lazy with full values. Although can be #ffffff, current limit will be #999999
		}
    line.attr({
			id: this.id + "line" + options.index,
			strokeWidth: ui.widgetControlSize * 0.18,
			stroke: color
		});
		
		// Store the rest of the properties
		line.color = color;
		line.appStart = options.appStart;
		line.appEndId = options.appEndId;

		return line;
	},

	randomInt: function (min, max) {
		let diff = max - min;
		diff++; // to allow generating max
		return min + parseInt(diff * Math.random());
	},

	updatesLinesToGraphs: function() {
		let x1, y1, x2, y2, pixelPos, appEnd;
		// For each of the lines
		for (let i = 0; i < this.linesToGraphs.length; i++) {
			// It could be waiting to be made, skip if so.
			if (this.linesToGraphs[i].replace) { continue; }
			// Draw line from marker if destination app still exists
			appEnd = applications[this.linesToGraphs[i].appEndId];
			if (appEnd) {
				// First check if latlng is in view
				pixelPos = this.getPixelLocationFromLatLng(this.linesToGraphs[i].appStart);
				if (
					(pixelPos.x > 0) && (pixelPos.x < this.sage2_width)
					&& (pixelPos.y > 0) && (pixelPos.y < this.sage2_height)
				) {
					// Start is this app over the sensor location
					x1 = pixelPos.x + this.sage2_x;
					y1 = pixelPos.y + this.sage2_y;
					// End is destination app top left corner, maybe better place elsewhere.
					x2 = appEnd.sage2_x;
					y2 = appEnd.sage2_y;
				} else { // it was out of bounds. draw it off view
					x1 = y1 = x2 = y2 = -100;
				}
			} else { // App doesn't exist, get the line off screen
				x1 = y1 = x2 = y2 = -100;
			}
			this.linesToGraphs[i].attr({x1, x2, y1, y2});
		}// end for linesToGraphs 
	},

	getPixelLocationFromLatLng: function(latlng) {
		let pixel = this.map.latLngToContainerPoint(latlng); // Map location
		let map = this.element.getBoundingClientRect();
		let yratio = map.height / this.sage2_height;
		let xratio = map.width / this.sage2_width;
		let pixelInApp = {
			x: pixel.x,
			y: pixel.y
			// x: pixel.x * xratio,
			// y: pixel.y * yratio
		};
		return pixelInApp;
	},

})