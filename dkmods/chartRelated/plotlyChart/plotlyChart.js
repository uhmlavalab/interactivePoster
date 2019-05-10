//
// SAGE2 application: FlyChart
// by: Dylan Kobayashi <dylank@hawaii.edu>
//
// Copyright (c) 2018
//

"use strict";

// Please see https://bitbucket.org/sage2/sage2/wiki/SAGE2%20Webview%20Container for instructions


var plotlyChart = sage2_webview_appCoreV01_extendWebview({
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
		this.chartEventHandlers = {
			dataChange: [],
			hover: [],
			selection: []
		}
	},
	load: function(date) { },
	draw: function(date) { },
	resize: function() {
		this.callFunctionInWebpage("redrawPlot", null);
	},
	getContextEntries: function() {
		var entries = [];
		entries.push({
			description: "Line chart",
			callback: "lineChart",
			parameters: {}
		});
		return entries;
	},

	// ----------------------------------------------------------------------------------------------------
	// ----------------------------------------------------------------------------------------------------
	// Context menu functions

	/*
		This should be in the standard double array format
	*/
	fullyReplaceChartData: function(data) {
		if (data) {
			this.callFunctionInWebpage("plotFromContainer", data);
		}
	},

	triggerHoverEvent: function(data) {
		if (data) {
			this.callFunctionInWebpage("hoverFromContainer", data);
		}
	},

	// removing for now
	// handleClick: function(data) {
	// 	this.clickData = data;
	// },

	getCurrentData: function() {
		return this.currentData;
	},

	handleDataChange: function(data) {
		this.currentData = data;
		this.handleChartEventFunctions(data, this.chartEventHandlers.dataChange);
	},

	handleHover: function(data) {
		this.hoverData = data;
		this.handleChartEventFunctions(data, this.chartEventHandlers.hover);
	},

	handleSelection: function(data) {
		this.selectionData = data;
		this.handleChartEventFunctions(data, this.chartEventHandlers.selection);
	},

	handleChartEventFunctions: function(data, callbackArray) {
		// Try catch because the functions may dissapear
		for (let i = 0; i < callbackArray.length; i++) {
			try {
				callbackArray[i](data); // call it
			} catch (e) { console.log(e);}
		}
	},

	addChartEventListener: function(eventType, callback) {
		if (!eventType || !callback) {
			throw ("Unable to addChartEventListener missing parameter " + eventType + "," + callback);
		}
		if (eventType === "dataChange") {
			this.chartEventHandlers.dataChange.push(callback);
		} else if (eventType === "hover") {
			this.chartEventHandlers.hover.push(callback);
		} else if (eventType === "selection") {
			this.chartEventHandlers.selection.push(callback);
		} else {
			throw ("Unknown chart event type to listen for:" + eventType);
		}
	},

	// ----------------------------------------------------------------------------------------------------
	// ----------------------------------------------------------------------------------------------------
	// Other functions

	getClickData: function() {
		return this.clickData;
	},

	getHoverData: function() {
		return this.hoverData;
	},

	getSelectionData: function() {
		return this.selectionData;
	},

	scatterToLine: function(data) {
	  var switchData = [{
	    x:data[0], y:data[1],
	    type:'scatter', mode: 'lines'
	  }];

	  var switchLayout = {
	    hovermode: 'closest',
	  };

	  return {switchData, switchLayout};
	},
});
