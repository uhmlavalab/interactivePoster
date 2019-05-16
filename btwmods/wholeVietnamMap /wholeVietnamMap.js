var wholeVietnamMap = SAGE2_App.extend({
  init: function (data) {
    console.log(data);

    this.SAGE2Init('div', data);
    this.element.id = data.id;
    this.resizeEvents = "continuous";
    this.passSAGE2PointerAsMouseEvents = true;
    this.redraw = true;
    this.initialWidth = this.element.offsetWidth;
    this.initialHeight = this.element.offsetHeight;
    this.zoomLevel = 6;
    this.center = [16.0583, 108.2772];

    this.map = L.map(this.element).setView(this.center, this.zoomLevel);

    this.tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
    });

    this.tileLayer.addTo(this.map);
    this.loadIcon();
    this.cursorMarker = null;
    this.cursorMarkerLastMoved = Date.now();

    // For eating synchronized cursor events
    this.eventLastFired = Date.now();

    this.handleMapZoom = this.handleMapZoom.bind(this);
    this.handleMapPan = this.handleMapPan.bind(this);
    this.handleMapMouseMove = this.handleMapMouseMove.bind(this);
    this.placeMarkerAtLocation = this.placeMarkerAtLocation.bind(this);
    this.removeCursorMarker = this.removeCursorMarker.bind(this);
   
    this.map.on('zoomend', this.handleMapZoom);
    this.map.on('moveend', this.handleMapPan);
    this.map.on('mousemove', this.handleMapMouseMove);
    this.map.on('mouseout', this.handleMapMouseOut);

  }, // end init

  loadIcon: function() {
    if (this.icon === undefined) {
      this.icon = L.icon({
        iconUrl: this.resrcPath + '/images/icon2.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });
    }
  },

  placeMarkerAtLocation: function (latlng) {
    var now = Date.now();
    console.log(now - this.eventLastFired);
    if ((now - this.eventLastFired) >= this.fps * 1.5) {

      var newMarker = L.marker(latlng, { icon: this.icon }).addTo(this.map);
      if (this.cursorMarker !== null) {
        this.map.removeLayer(this.cursorMarker);
      }
      this.cursorMarker = newMarker;
      this.eventLastFired = now;
      this.cursorMarkerLastMoved = now;
      this.redraw = true;
    }
  },

  removeCursorMarker: function () {
    if (this.cursorMarker !== null && this.cursorMarker !== undefined) {
      this.map.removeLayer(this.cursorMarker);
    }
  },

  disableAllLayers: function () {
    for (let i = 0; i < this.allLayerObjects.length; i++) {
      if (this.allLayerObjects[i].enabled) { this.allLayerObjects[i].removeFrom(this.map); }
      this.allLayerObjects[i].enabled = false;
      element = document.getElementById(this.element.id + '_option_' + this.allLayerObjects[i].index);
      element.childNodes[0].classList.add('fa-square');
      element.childNodes[0].classList.remove('fa-check-square');
    }
  },
  
  load: function (date) {

  },

  draw: function (date) {
    var now = Date.now();
    if (now - this.cursorMarkerLastMoved > 5000) {
      this.removeCursorMarker();
    }
    if (this.redraw) {
      this.redraw = false;
      console.log(this.zoomLevel);
      console.log(this.center);
      this.map.invalidateSize();
    }
  },

  resize: function (date) {
    var percentChange = (this.element.offsetHeight - this.initialHeight) / (this.initialHeight * 15);
    this.initialHeight = this.element.offsetHeight;
    this.initialWidth = this.element.offsetWidth;

    this.zoomLevel += this.zoomLevel * percentChange;
    console.log(this.zoomLevel);
    this.map.setZoom(this.zoomLevel);
    this.map.panInside(this.center);

    this.redraw = true;

    this.rs_update();

    this.refresh(date); //redraw after resize
  },

  event: function (type, position, user, data, date) {
    this.refresh(date);
  },

  move: function (date) {
    this.redraw = true;
    this.refresh(date);
  },

  quit: function () {
    this.log("Done");
  },

  // ---------------------------------------------------------------------------------------------------- Map events
  handleMapZoom: function (e) {
    this.zoomLevel = e.target._zoom;
    this.redraw = true;
  },

  handleMapPan: function (e) {
    this.center = [this.map.getCenter().lat, this.map.getCenter().lng];
    this.redraw = true;
  },

  handleMapMouseMove: function (e) {
    console.log(e.latlng);
    for (appID in applications) {
      if (appID !== this.id && applications[appID].application === "vietnamMapLayers") {
        console.log(applications[appID]);
        var latlng = [e.latlng.lat, e.latlng.lng];
        applications[appID].placeMarkerAtLocation(latlng);
      } else {
        this.removeCursorMarker();
      }
    }
  },

  handleMapMouseOut: function (e) {
    for (appID in applications) {
      if (applications[appID].application === this.application || applications[appID].application === "wholeVietnamMap") {
        applications[appID].removeCursorMarker();
      }
    }
  }
});
