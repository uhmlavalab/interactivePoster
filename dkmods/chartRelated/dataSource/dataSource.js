//
// SAGE2 application: dataSource
// by: Dylan Kobayashi <dylank@hawaii.edu>
//
// Copyright (c) 2018
//

"use strict";

// Please see https://bitbucket.org/sage2/sage2/wiki/SAGE2%20Webview%20Container for instructions


var dataSource = sage2_webview_appCoreV01_extendWebview({
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
	},
	load: function(date) {
		// OPTIONAL
		// The state will be automatically passed to your webpage through the handler you gave to SAGE2_AppState
		// Use this if you want to alter the state BEFORE it is passed to your webpage. Access with this.state
	},
	draw: function(date) {
		// OPTIONAL
		// Your webpage will be in charge of its view
		// Use this if you want to so something within the SAGE2 Display variables
		// Be sure to set 'this.maxFPS' within init() if this is desired.
		// FPS only works if instructions sets animation true
	},
	resize: function() {
		// OPTIONAL
	},
	getContextEntries: function() {
		// OPTIONAL
		// This can be used to allow UI interaction to your webpage
		// Entires are added after entries of enableUiContextMenuEntries 
		var entries = [];

		entries.push({
			description: "Generate Values",
			callback: "setValueInContainer", // The string will specify which function to activate
			parameters: {fname: "", type: "generate"},
		});
		
		entries.push({description: "separator"});

		entries.push({
			description: "Send Value to app below",
			callback: "sendValueToAppUnderneath", // The string will specify which function to activate
			parameters: {},
		});

		
		entries.push({description: "separator"});



		entries.push({
			description: "Set Count",
			callback: "setValueInContainer", // The string will specify which function to activate
			parameters: {vname: "count", type: "int"},
			inputField: true,
			inputFieldSize: 5,
		});

		entries.push({
			description: "Set Style To xCountUp",
			callback: "setValueInContainer", // The string will specify which function to activate
			parameters: {vname: "style", type: "string", clientInput: "xCountUp"},
		});

		entries.push({
			description: "Set Style To fullRandom",
			callback: "setValueInContainer", // The string will specify which function to activate
			parameters: {vname: "style", type: "string", clientInput: "fullRandom"},
		});

		entries.push({
			description: "Set Style To timeSeriesTroy",
			callback: "setValueInContainer", // The string will specify which function to activate
			parameters: {vname: "style", type: "string", clientInput: "timeSeriesTroy"},
		});

		entries.push({
			description: "Set x min",
			callback: "setValueInContainer", // The string will specify which function to activate
			parameters: {vname: "xmin", type: "int"},
			inputField: true,
			inputFieldSize: 5,
		});

		entries.push({
			description: "Set x max",
			callback: "setValueInContainer", // The string will specify which function to activate
			parameters: {vname: "xmax", type: "int"},
			inputField: true,
			inputFieldSize: 5,
		});

		entries.push({
			description: "Set y min",
			callback: "setValueInContainer", // The string will specify which function to activate
			parameters: {vname: "ymin", type: "int"},
			inputField: true,
			inputFieldSize: 5,
		});

		entries.push({
			description: "Set y max",
			callback: "setValueInContainer", // The string will specify which function to activate
			parameters: {vname: "ymax", type: "int"},
			inputField: true,
			inputFieldSize: 5,
		});





		return entries;
	},

	// ----------------------------------------------------------------------------------------------------
	// ----------------------------------------------------------------------------------------------------
	// ----------------------------------------------------------------------------------------------------
	// Add optional functions

	setValueInContainer: function(response) {
		this.callFunctionInWebpage("setValueInDataState", response);
	},


	// Functions can be called from the webpage, see the webpage/main.js file for example
	consolePrint: function (value) {
		console.log(value);
	},

	storeDataGeneration: function(value) {
		console.log("Received from page:" + value);
		this.dataArrayToPassToApp = JSON.parse(value);
	},


	sendValueToAppUnderneath: function(value) {
    let appIds = Object.keys(applications);
    let app;
    for (let i = 0; i < appIds.length; i++) {
    	app = applications[appIds[i]];
    	if (this.isThisAppOverParamApp(app)) {
				console.log("Btw should be data sending...");
				app.fullyReplaceChartData(this.dataArrayToPassToApp);
				break;
    	}
    }
	},

	/*
	Troy's data formatting
			{
				x: [],
				y: []
			}

			receiveData: 

			// x: [ {
				date: dateObj, new Date(Date.now()),
				millis: Date.now() // he uses 1 second, but shouldn't matter
				} ]

			y: range between 0-20
	*/


	// ----------------------------------------------------------------------------------------------------
	// ----------------------------------------------------------------------------------------------------
	// ----------------------------------------------------------------------------------------------------



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

  isParamAppOverThisApp: function(app) {
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
  	if ((thisAppBounds.top < otherAppBounds.top)
  		&& (thisAppBounds.left < otherAppBounds.left)
  		&& (thisAppBounds.width > otherAppBounds.width)
  		&& (thisAppBounds.height > otherAppBounds.height)
  		){
  			return true;
  	}
  	return false;
  },


});