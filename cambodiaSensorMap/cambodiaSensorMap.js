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
    fetch('./user/apps/cambodiaSensorMap/text/cambodiaSensor.txt')
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
  this.sensors.forEach(function(sensor) {
    if (sensor.lat === latlng.lat && sensor.long === latlng.lng) {
      console.log(sensor);
    }
  });
}
})