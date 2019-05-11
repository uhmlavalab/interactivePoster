//
// SAGE2 application: vietnamMapLayers
// by: Dylan Kobayashi <dylank@hawaii.edu>
//
// Copyright (c) 2018
//

"use strict";

// Please see https://bitbucket.org/sage2/sage2/wiki/SAGE2%20Webview%20Container for instructions


var vietnamMapLayers = sage2_webview_appCoreV01_extendWebview({
	webpageAppSettings: {
		setSageAppBackgroundColor: true,  // Web pages without background values will be transparent.
		backgroundColor: "white",         // Used if above is true, can also use rgb and hex strings
		enableRightClickNewWindow: false, // If true, right clicking on images or links open new webview
		printConsoleOutputFromPage: true, // If true, when web page uses console.log, container will console.log that value in display client

		// If you want your context entries to appear before or after the default
		putAdditionalContextMenuEntriesBeforeDefaultEntries: true,
		// The following will include the default Webview context menu entry if set to true.
		enableUiContextMenuEntries: {
			navigateBack:       false, // alt left-arrow
			navigateForward:    false, // alt right-arrow
			reload:             true, // alt r
			autoRefresh:        false, // must be selected from UI context menu
			consoleViewToggle:  false, // must be selected from UI context menu
			zoomIn:             true, // alt up-arrow
			zoomOut:            true, // alt down-arrow
			urlTyping:          false, // must be typed from UI context menu
			copyUrlToClipboard: false, // must be typed from UI context menu
		},
	},
	init: function(data) {
		// Will be called after initial SAGE2 init()
		// this.element will refer to the webview tag
		this.resizeEvents = "continuous"; // Recommended not to change. Options: never, continuous, onfinish

		// Path / URL of the page you want to show
		this.changeURL(this.resrcPath + "/webpage/index.html", false);

		//
		this.dataLinking = {};
		this.linesBetweenApps = [];

		this.setupServerDataGrabber();
	},
	setupServerDataGrabber: function() {
		this.dataLinking.shouldUseTheBoundsData = true;
		this.dataLinking.varNames = {};
		this.dataLinking.varNames.leafmapBounds = "leafmapBounds";
		this.dataLinking.varNames.layerClickData = "layerClickData";
		this.dataLinking.disableCounters = {}; // Used to prevent self updates
		this.dataLinking.disableCounters.boundsFromContainer = 0;
		this.dataLinking.disableCounters.boundsFromMap = 0;

		this.serverDataSubscribeToValue(this.dataLinking.varNames.leafmapBounds,"handleDataLinkBounds");
	},
	load: function(date) { }, // optional
	draw: function(date) {
		this.updateLinesBetweenApps();
	},
	resize: function() { }, // optional
	getContextEntries: function() {
		var entries = [];
		// if (this.dataLinking.shouldUseTheBoundsData) {
		// 	entries.push({
		// 		description: "DISABLE bounds link",
		// 		callback: "toggleBoundsLink", // The string will specify which function to activate
		// 		parameters: {link: false},
		// 	});
		// } else {
		// 	entries.push({
		// 		description: "ENABLE bounds link",
		// 		callback: "toggleBoundsLink", // The string will specify which function to activate
		// 		parameters: {link: true},
		// 	});
		// }

		return entries;
	},

	quit: function() {
		for (let i = 0; i < this.linesBetweenApps.length; i++) {
			this.linesBetweenApps[i].remove();
		}
	},
	// ----------------------------------------------------------------------------------------------------
	// ----------------------------------------------------------------------------------------------------
	// ----------------------------------------------------------------------------------------------------
	// Add optional functions

	// Functions can be called from the webpage, see the webpage/main.js file for example
	consolePrint: function (value) { console.log(value); },

	toggleBoundsLink: function(params) {
		this.dataLinking.shouldUseTheBoundsData = params.link;
		this.getFullContextMenuAndUpdate();
	},

	makeLineUsingAppBehind: function(params) {
		let appBehind = this.getFirstAppUnderneathThisApp();
		if (!appBehind) return; // Can't do anything if no app behind.

		if (params.action === "start") {
			// action will be either "foreground" or "background"
			this.makeLine({linePosition: params.type, appStart: appBehind.id}); // use id not app itself
		} else if (params.action === "end") {
			// If there is a line, override the last link
			if (this.linesBetweenApps.slice(-1)[0]) {
				this.linesBetweenApps.slice(-1)[0].appEnd = appBehind.id; // use id
			}
		}
	},

	/*
	Trying to allow general usage. Might become complex though.
	Properties of options:
		linePosition:			"background", "foreground"
		appStart: 				appId
		appEnd:						appid
	*/
	makeLine: function(options = {}) {
		var line; // Create line
		if (options.linePosition === "background") { line = svgBackgroundForWidgetConnectors.line(0,0,0,0); }
		else if (options.linePosition === "foreground") { line = svgForegroundForWidgetConnectors.line(0,0,0,0); }
		else { throw "Error creating line on position type: " + options.linePosition; }

		// Store the line for later updates
    this.linesBetweenApps.push(line);

		// Create the line properties for later reference.
		let color = "#";
		for (let i = 0; i < 6; i++) {
			color += this.randomInt(0,9);  // Getting lazy with full values. Although can be #ffffff, current limit will be #999999
		}
    line.attr({
			id: this.id + "line" + (this.linesBetweenApps.length - 1),
			strokeWidth: ui.widgetControlSize * 0.18,
			stroke: color
		});
		
		// Store the rest of the properties
		line.s2AddedProperties = {};
		line.s2AddedProperties.color = color;
		line.appStart = options.appStart;
		line.appEnd = options.appEnd;
	},
	updateLinesBetweenApps: function() {
		let x1, y1, x2, y2;
		for (let i = 0; i < this.linesBetweenApps.length; i++) {
			// Default is removed
			x1 = x2 = this.sage2_x
			y1 = y2 = this.sage2_y;
			// There must be draw-able
			if ((this.linesBetweenApps[i].appStart) // Use the start app if available
				&& (applications[this.linesBetweenApps[i].appStart])
				) {
					x1 = applications[this.linesBetweenApps[i].appStart].sage2_x + applications[this.linesBetweenApps[i].appStart].sage2_width / 2;
					y1 = applications[this.linesBetweenApps[i].appStart].sage2_y + applications[this.linesBetweenApps[i].appStart].sage2_height / 2;
			}
			if ((this.linesBetweenApps[i].appEnd) // use the end app if available
				&& (applications[this.linesBetweenApps[i].appEnd])
				) {
					x2 = applications[this.linesBetweenApps[i].appEnd].sage2_x + applications[this.linesBetweenApps[i].appEnd].sage2_width / 2;
					y2 = applications[this.linesBetweenApps[i].appEnd].sage2_y + applications[this.linesBetweenApps[i].appEnd].sage2_height / 2;
			}
			this.linesBetweenApps[i].attr({x1, x2, y1, y2});
		}
},


	// ----------------------------------------------------------------------------------------------------
	// ----------------------------------------------------------------------------------------------------
	// ----------------------------------------------------------------------------------------------------
	// Functions related to data links

	handleDataLinkBounds: function(value) {
		console.log("Received server update", value);

		if (this.dataLinking.disableCounters.boundsFromContainer > 0) {
			this.dataLinking.disableCounters.boundsFromContainer--;
			console.log("--Squelching");
		} else {
			console.log("--Using");
			// Prevent trigger from self
			this.dataLinking.disableCounters.boundsFromMap++;
			if (this.dataLinking.shouldUseTheBoundsData) {
				this.callFunctionInWebpage("handleContainerDataBounds", value);
			}
		}
	},


	// ----------------------------------------------------------------------------------------------------
	// ----------------------------------------------------------------------------------------------------
	// ----------------------------------------------------------------------------------------------------
	// Communication from webpage

	handleMapBoundChange: function(data) {
		console.log("Got handleMapBoundChange data:", data);
		if (this.dataLinking.disableCounters.boundsFromMap > 0) {
			this.dataLinking.disableCounters.boundsFromMap--;
		} else {
			this.serverDataSetValue(this.dataLinking.varNames.leafmapBounds, data, "Bounds data for leafmap test demo");
			this.dataLinking.disableCounters.boundsFromContainer++; // Prevent self trigger
		}
	},


	handleLayerClick: function(data) {
		console.log("Got mapmove data:", data);
	},



	// ----------------------------------------------------------------------------------------------------
	// ----------------------------------------------------------------------------------------------------
	// ----------------------------------------------------------------------------------------------------


	getFirstAppUnderneathThisApp: function() {
    let appIds = Object.keys(applications);
    let app;
    for (let i = 0; i < appIds.length; i++) {
    	app = applications[appIds[i]];
    	if (this.isThisAppOverParamApp(app)) {
				return app;
    	}
		}
		return null; // Couldn't find an app over
	},


  isThisAppOverParamApp: function(app) {
  	let thisAppBounds = {
  		top: this.sage2_y,
  		left: this.sage2_x,
  		width: this.sage2_width,
  		height: this.sage2_height
  	};
  	let otherAppBounds = {
  		top: app.sage2_y,
  		left: app.sage2_x,
  		width: app.sage2_width,
  		height: app.sage2_height
  	};
  	// Top left is 0,0.
  	if ((otherAppBounds.top < thisAppBounds.top)
  		&& (otherAppBounds.left < thisAppBounds.left)
  		&& (otherAppBounds.width + otherAppBounds.left > thisAppBounds.width + thisAppBounds.left)
  		&& (otherAppBounds.height + otherAppBounds.top > thisAppBounds.height + thisAppBounds.top)
  		){
  			return true;
  	}
  	return false;
  },
	randomInt: function (min, max) {
		let diff = max - min;
		diff++; // to allow generating max
		return min + parseInt(diff * Math.random());
	},




});




