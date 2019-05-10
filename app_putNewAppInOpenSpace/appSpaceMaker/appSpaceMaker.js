//
// SAGE2 application: appSpaceMaker
// by: Dylan Kobayashi <dylank@hawaii.edu>
//
// Copyright (c) 2018
//

"use strict";

// Please see https://bitbucket.org/sage2/sage2/wiki/SAGE2%20Webview%20Container for instructions


var appSpaceMaker = sage2_webview_appCoreV01_extendWebview({
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

		this.maxFPS = 3; // Don't think this needs to happen often


		this.debug = true;

		this.marginSpace = ui.titleBarHeight;
		this.knownAppsOpen = null;

	},
	load: function(date) {
		// OPTIONAL
		// The state will be automatically passed to your webpage through the handler you gave to SAGE2_AppState
		// Use this if you want to alter the state BEFORE it is passed to your webpage. Access with this.state
	},
	draw: function(date) {
		// Used to determine if new apps open
		this.moveNewlyOpenedAppsToEmptySpace(this.getAllNewlyOpenedAppIds());

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
			description: "Update Usage Map",
			callback: "updateUsageMap", // The string will specify which function to activate
			parameters: {},
		});
		return entries;
	},
	

	// ----------------------------------------------------------------------------------------------------
	// ----------------------------------------------------------------------------------------------------
	// ----------------------------------------------------------------------------------------------------
	// Communication functions

	// Functions can be called from the webpage, see the webpage/main.js file for example
	consolePrint: function (value) {
		console.log(value);
	},


	updateUsageMap: function() {
		let wall = this.step01MakeEmptyArrayRepresendingTheWall();
		this.step02FillWallWithOldApps(wall, []); // no new apps, just show everything.
		this.callFunctionInWebpage("updateCanvasMap", this.determineHeightMap(wall));
	},



	// ----------------------------------------------------------------------------------------------------
	// ----------------------------------------------------------------------------------------------------
	// ----------------------------------------------------------------------------------------------------
	// Helper functions


	getAllOpenAppIds: function() {
		return Object.keys(applications);
	},

	getAllNewlyOpenedAppIds: function() {
		if (!this.knownAppsOpen) {
			this.knownAppsOpen = this.getAllOpenAppIds();
			return;
		}
		let allOpen = {};
		allOpen.list = this.getAllOpenAppIds();
		for (let i = 0; i < this.knownAppsOpen.length; i++) {
			allOpen[this.knownAppsOpen[i]] = true; // set to true since undefined is false
		}
		let newlyOpened = [];
		for (let i = 0; i < allOpen.list.length; i++) {
			if (!allOpen[allOpen.list[i]]) newlyOpened.push(allOpen.list[i]); // If undefined, then it wasn't known before
		}
		this.knownAppsOpen = allOpen.list;
		return newlyOpened;
	},


	moveNewlyOpenedAppsToEmptySpace: function(newlyOpenedAppIds) {
		if (!newlyOpenedAppIds) return;
		let id, app, width, height;
		for (let i = 0; i < newlyOpenedAppIds.length; i++) {
			id = newlyOpenedAppIds[i];
			app = applications[id];

			this.findOpenSpaceAndPlaceApp(app, newlyOpenedAppIds);
		}
	},

	findOpenSpaceAndPlaceApp: function(app, newlyOpenedAppIds) {
		let wall = this.step01MakeEmptyArrayRepresendingTheWall();
		this.step02FillWallWithOldApps(wall, newlyOpenedAppIds); // object/ gets modified
		let heightMap = this.determineHeightMap(wall); // this.step03GenerateHeightMap(wall);

		console.log("erase me, after heightmap");
		let emptySpace = this.findFirstRectInHeightMapWithMinimumSize(heightMap, app.sage2_width + this.marginSpace, app.sage2_height + this.marginSpace); // this.step04FindEmptySpaceToFitNewApp(heightMap, width, height);

		console.log("erase me, after emptyspace");

		this.step05PutAppInEmptySpace(emptySpace, app);
	},

	step01MakeEmptyArrayRepresendingTheWall: function() {
		// Step 1 make empty array represending the wall
		let wall = [];
		for (let rows = 0; rows < ui.height; rows++) {
			wall.push(Array(ui.width).fill(0));
		}
		return wall;
	},

	step02FillWallWithOldApps: function(wall, newlyOpenedAppIds) {
		let appIds = this.getAllOpenAppIds();
		let id, app, w, h, winc, hinc, x, y;
		// Step 2, if not a new app, fill in with 0s
		for (let ai = 0; ai < appIds.length; ai++) {
			id = appIds[ai];
			if (!newlyOpenedAppIds.includes(id)) {
				app = applications[id];

				// // Keep values non-negative
				// w = Math.max(app.sage2_x - this.marginSpace, this.marginSpace); // In case the 
				// h = Math.max(app.sage2_y - this.marginSpace, this.marginSpace);
				w = app.sage2_x - this.marginSpace;
				h = app.sage2_y - this.marginSpace;

				// for (let hinc = 0; (hinc < app.sage2_height + this.marginSpace) && ((w + hinc) < ui.height); hinc++) {
				// 	for (let winc = 0; (winc < app.sage2_width + this.marginSpace) && ((w + winc) < ui.width); winc++) {
				// 		wall[parseInt(h + hinc)][parseInt(w + winc)] = 1;
				// 	}
				// }

				try {
					for (let hinc = 0; hinc < (app.sage2_height + this.marginSpace); hinc++) {
						for (let winc = 0; winc < (app.sage2_width + this.marginSpace); winc++) {
							x = parseInt(w + winc);
							y = parseInt(h + hinc);
							if ( 
							(y > 0)
							&& (y < ui.height)
							&& (x > 0)
							&& (x <= ui.width)
							){
								wall[y][x] = 1;
							}
						}
					}
				} catch (e) {
					console.log(e);
					console.log("Position:", x, y);
				}
			} // else: it is a newly opened app id, it shouldn't modify the available space
		}
	},

	/*
		emptySpace
		row: i,
		col: j,
		width: currentWidth,
		height: currentHeight,
		fitsMinSize: true
	*/
	step05PutAppInEmptySpace: function(emptySpace, app) {
		if (emptySpace.fitsMinSize) {
			wsio.emit("updateApplicationPosition", {appPositionAndSize:{
				elemId: app.id,
				elemLeft: emptySpace.col,
				elemTop: emptySpace.row,
				elemWidth: app.sage2_width,
				elemHeight: app.sage2_height
			}});
		} else { // Else could only find a smaller space
			let wRatio = app.sage2_width / app.sage2_height;
			let hRatio = app.sage2_height / app.sage2_width;
			let w1 = emptySpace.height * wRatio;
			if (w1 <= emptySpace.width) {
				// if using width ratio works, then keep using it
				wsio.emit("updateApplicationPosition", {appPositionAndSize:{
					elemId: app.id,
					elemLeft: emptySpace.col,
					elemTop: emptySpace.row,
					elemWidth: w1,
					elemHeight: emptySpace.height
				}});
				setTimeout(() => { app.sendResize(w1, emptySpace.height); }, 100);
			} else {
				// else use the height as limitor.
				wsio.emit("updateApplicationPosition", {appPositionAndSize:{
					elemId: app.id,
					elemLeft: emptySpace.col,
					elemTop: emptySpace.row,
					elemWidth: emptySpace.width,
					elemHeight: emptySpace.width * hRatio
				}});
				setTimeout(() => { app.sendResize(emptySpace.width, emptySpace.width * hRatio); }, 100);
			}
		}
	},

	/*


		Input: matrix
			[
				[bottom row],
				[second from bottom row],
				...
				[top row]
			]

		Example matrix as input
		index	[
		0				[0,1,1,0],
		1				[0,1,1,0],
		2				[0,1,1,0],
		3				[0,0,0,0]
					]

		Will return:

		index	[
		0				[0,1,1,0],
		1				[0,2,2,0],
		2				[0,3,3,0],
		3				[0,0,0,0]     <--- consider this as the "top"
					]

	*/
	determineHeightMap: function (matrix) {
    var m = matrix.length; // m set to height of matrix
    var n = m == 0 ? 0 : matrix[0].length; // n is number of columns. As long as there is height, assume all rows have equal amount of columns (n)
    var height = [];
		
		// Create empty array m high and n+1 wide
    for (var i = 0; i < m; i++) {
			var temp = [];
			for (var j = 0; j < n+1; j++) {
				temp.push(0);
			}
			height.push(temp);
    }
		// For each layer of height, start from the "bottom". In this case 0,0 as origin is set at top left, making 0 the top of the screen
    for (var i = m - 1; i >= 0; i--) {
			// For each column
			for (var j = n - 1; j >= 0; j--) {
				// If original matrix [i][j] == 0, keep the 0 in the new height matrix
				if (matrix[i][j] == 1) {
						height[i][j] = 0;
				} else {
					// If not 0 in original, then set value in height matrix to 1 if i is at 0 height. OR if i is not at 0 height, one greater than the previous height value
													// if i is bottom row      set to 1   otherwise, set to +1 of previous row
					height[i][j] =  (i == m - 1)             ? 1          : height[i + 1][j] + 1;
				}
			}
		}
		// At this point can go through the height matrix and figure out which longest run of values for the biggest rectangle.
    return height;
	},



	/*
		NOTE: return value is within loop
	*/
	findFirstRectInHeightMapWithMinimumSize: function(heightMap, requiredWidth, requiredHeight) {
		// Must be 00 as top left
		// Work top down. left to right, kinda?
		let rows = heightMap.length;
		let cols = heightMap[0].length; // assumes all are equal
		let runLength, runIndex;
		let smallerCandidate = null; // will only track one smallest candidate
		let currentHeight, currentWidth;

		this.debugprint("Starting search in ", rows, ", ", cols);

		// Go through each row
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				runLength = 0;
				// Starting at a column, determine run size
				for (runIndex = j; runIndex < cols; runIndex++) {
					runLength = runIndex - j;
					if (heightMap[i][runIndex] == 0) {
						// this.debugprint("skipping run due to 0", i, runIndex);
						break;
					}

					if (runLength > 0) {
						currentWidth = runLength;
						currentHeight = Math.min(...(heightMap[i].slice(j, j + runLength)));
						// If found a space that will fit
						if ((currentHeight >= requiredHeight)
							&& currentWidth >= requiredWidth) {
								this.debugprint("FOUND match fitting within minimum size", i, j, currentHeight, currentWidth, requiredHeight, requiredWidth);
								return {
									row: i,
									col: j,
									width: currentWidth,
									height: currentHeight,
									fitsMinSize: true
								}
						}
	
						// Otherwise keep track of the smaller candidate
						smallerCandidate = this.checkIfSmallerCandidateIsBetter(smallerCandidate, {
							row: i,
							col: j,
							width: currentWidth,
							height: currentHeight,
							fitsMinSize: false
						});
					}
				}
				j += runLength;
			} // end of cols
		} // end of going through all rows

		this.debugprint("Couldn't find match fitting minimum size. Sending next largest instead", smallerCandidate);
		return smallerCandidate;
	},

	// Using this to check and keep the next largest candidate space.
	checkIfSmallerCandidateIsBetter: function(survivingCandidate, candidateToCheck) {
		// If no survivor, then use the new
		if (!survivingCandidate) {
			// this.debugprint("No candidate, using new", candidateToCheck);
			return candidateToCheck;
		}
		let scArea = survivingCandidate.width * survivingCandidate.height;
		let ctcArea = candidateToCheck.width * candidateToCheck.height;
		// If survivor area is larger, keep. Otherwise use new
		if (scArea >= ctcArea) return survivingCandidate;
		
		// this.debugprint("Newer candidate is larger, using new", candidateToCheck);
		return candidateToCheck;
	},




	// ----------------------------------------------------------------------------------------------------
	// ----------------------------------------------------------------------------------------------------
	// ----------------------------------------------------------------------------------------------------
	// Test functions

	debugprint: function(s) {
		if (!this.debug) return;
		if (arguments.length === 1) console.log("DEBUG> " + s);
		else console.log("DEBUG> ", arguments);
	},

	printMatrixWith00AsTopLeft: function(matrix) {
		let rows = matrix.length; // height

		// for (var i = rows - 1; i >= 0; i--) { // For each row
		// 	console.log(matrix[i].join(" "));
		// }

		for (var i = 0; i < rows; i++) { // For each row
			console.log(matrix[i].join(" "));
		}
	},

	testHeightMap01: function() {
		console.log("testHeightMap01: Checking matrix evaluator.");
		console.log("Starting matrix:");
		let m = [
			[0, 0, 0, 0, 1, 0],
			[0, 0, 1, 0, 0, 1],
			[0, 0, 0, 0, 0, 0],
			[1, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 1],
			[0, 0, 1, 0, 0, 0],
		];
		this.printMatrixWith00AsTopLeft(m);
		let hm = this.determineHeightMap(m);
		console.log("Evaluated matrix:");
		this.printMatrixWith00AsTopLeft(hm);
		console.log("testHeightMap01: Complete.");
	},

	testHeightMap02: function(minWidth = 2, minHeight = 2) {
		console.log("testHeightMap02: Checking spot finder. With minimum width and height: " + minWidth + "," + minHeight);
		console.log("Starting matrix:");
		let m = [
			[0, 0, 0, 0, 1, 0],
			[0, 0, 1, 0, 0, 1],
			[0, 0, 0, 0, 0, 0],
			[1, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 1],
			[0, 0, 1, 0, 0, 0],
		];
		this.printMatrixWith00AsTopLeft(m);
		let hm = this.determineHeightMap(m);
		console.log("Evaluated matrix:");
		this.printMatrixWith00AsTopLeft(hm);
		let space = this.findFirstRectInHeightMapWithMinimumSize(hm, minWidth, minHeight);
		console.log("Result:", space);
		console.log("testHeightMap02: Complete.");
	},










});