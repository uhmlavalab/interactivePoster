//
// SAGE2 application: linker
// by: Dylan Kobayashi <dylank@hawaii.edu>
//
// Copyright (c) 2018
//

"use strict";

// Please see https://bitbucket.org/sage2/sage2/wiki/SAGE2%20Webview%20Container for instructions


var linker = sage2_webview_appCoreV01_extendWebview({
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
		// app var
		this.maxFPS = 8;

		// Customvar
		this.linesBetweenApps = [];
		this.graphLinks = [];
		this.functionsListForEvents = [];
	},
	load: function(date) {
		// OPTIONAL
		// The state will be automatically passed to your webpage through the handler you gave to SAGE2_AppState
		// Use this if you want to alter the state BEFORE it is passed to your webpage. Access with this.state
	},
	draw: function(date) {
		// Currently the main thing is to update the lines
		this.updateLinesBetweenApps();
	},
	resize: function() {
		// OPTIONAL
	},
	getContextEntries: function() {
		var entries = [];

		entries.push({
			description: "Start dataChange link",
			callback: "makeGraphLink", // The string will specify which function to activate
			parameters: {action: "start", type:"dataChange"},
		});
		entries.push({
			description: "Start hover link",
			callback: "makeGraphLink", // The string will specify which function to activate
			parameters: {action: "start", type:"hover"},
		});
		entries.push({
			description: "Start selection link",
			callback: "makeGraphLink", // The string will specify which function to activate
			parameters: {action: "start", type:"selection"},
		});
		entries.push({description: "separator"});
		entries.push({
			description: "End as dataReplace link",
			callback: "makeGraphLink", // The string will specify which function to activate
			parameters: {action: "end", type:"dataReplace"},
		});
		entries.push({
			description: "End as hover link",
			callback: "makeGraphLink", // The string will specify which function to activate
			parameters: {action: "end", type:"hover"},
		});
		entries.push({description: "separator"});
		entries.push({
			description: "Remove link",
			callback: "makeGraphLink", // The string will specify which function to activate
			parameters: {action: "remove", type:""},
		});
		entries.push({description: "separator"});
		entries.push({description: "separator"});

		return entries;
	},

	quit: function() {
		// Remove line on quit so they don't stick around after app closes
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


	// Line Maker based on the app this is in front of and fully enveloped by
	makeGraphLink: function(params) {
		let appBehind = this.getFirstAppUnderneathThisApp();
		if (!appBehind) return; // Can't do anything if no app behind.
		let lastLink = this.graphLinks.slice(-1)[0];
		let currentLink;

		console.log("makeGraphLink");

		// If the param action was to start a link
		if (params.action === "start") {
			if ((!lastLink) // If there was no last link, or this is one, and it has a destination, make a new one
				||
				(lastLink
				&& lastLink.destinationId)
				) {
					currentLink = {};
					currentLink.sourceId = appBehind.id;
					currentLink.sourceType = params.type;
					// action will be either "foreground" or "background"
					this.makeLine({linePosition: "foreground", appStart: currentLink.sourceId}); // use id not app itself
					currentLink.line = this.linesBetweenApps.slice(-1)[0];
					this.graphLinks.push(currentLink);
			} else {
				lastLink.sourceId = appBehind.id;
				lastLink.line.appStart = appBehind.id;
				lastLink.sourceType = params.type;
			}
		} else if (params.action === "end") {
			// If there is a line AND the destinationID is not set (No overriding)
			if (lastLink && !lastLink.destinationId) {
				lastLink.line.appEnd = appBehind.id;
				lastLink.destinationId = appBehind.id;
				this.createGraphLink(lastLink, params.type);
			}
		} else if (params.action === "remove") {
			let aid = appBehind.id;
			let link;
			for (let i = 0; i < this.graphLinks.length; i++) {
				link = this.graphLinks[i];
				if ( (this.graphLinks[i].sourceId === aid) 
					|| (this.graphLinks[i].destinationId === aid) 
				){
					this.removeGraphLink(link);
					lastLink.line.appStart = null;
					lastLink.line.appEnd = null;
				}
			}
		}
	},

	// Line Maker based on the app this is in front of and fully enveloped by
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
		} else if (params.action === "remove") {
			let aid = appBehind.id;
			let line;
			for (let i = 0; i < this.linesBetweenApps.length; i++) {
				line = this.linesBetweenApps[i];
				if (line.appStart === aid) { line.appStart = null; }
				if (line.appEnd === aid) { line.appEnd = null; }
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



	/*
		Each of these depend on usage of plotly chart handlers.

		this.functionsListForEvents = [];

	*/
	createGraphLink: function(linkData, type) {
		let sourceApp = applications[linkData.sourceId];
		let destinationApp = applications[linkData.destinationId];

		if (sourceApp && destinationApp) {
			let passFunc;

			// First create the function to pass the data.
			switch (type) {
				case "dataReplace":
					passFunc = function(data) {
						destinationApp.fullyReplaceChartData(data);
					}
					break;
				case "hover":
					passFunc = function(data) {
						destinationApp.triggerHoverEvent(data);
					}
					break;
				default:
					throw "ERROR> unknown case:" + type
			}
			// Getting here means type was ok, and didn't error out. Add the function to linker.
			this.functionsListForEvents.push(passFunc);
			linkData.funcPassIndex = this.functionsListForEvents.length - 1;
			// Create the listener function which call the data pass func. NEED sourcetype from start of line
			sourceApp.addChartEventListener(linkData.sourceType, (data)=> {
				this.functionsListForEvents[linkData.funcPassIndex](data);
			});
		}
	},
	removeGraphLink: function(linkData) {
		this.functionsListForEvents[linkData.funcPassIndex] = null;
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