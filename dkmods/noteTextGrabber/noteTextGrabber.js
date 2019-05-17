// SAGE2 is available for use under the SAGE2 Software License
//
// University of Illinois at Chicago's Electronic Visualization Laboratory (EVL)
// and University of Hawai'i at Manoa's Laboratory for Advanced Visualization and
// Applications (LAVA)
//
// See full text, terms and conditions in the LICENSE.txt included file
//
// Copyright (c) 2014

"use strict";

var noteTextGrabber = SAGE2_App.extend({

	init: function(data) {
		// SAGE2_App
		this.SAGE2Init("div", data); // call super-class 'init'
		this.element.id = "div" + this.id; // Set id of element
		this.maxFPS = 1.0; // FPS only works if instructions sets animation true
		this.resizeEvents = "never"; // Options: never, continuous, onfinish
		this.passSAGE2PointerAsMouseEvents = false; // Set to true to enable SAGE2 auto conversion of pointer events to mouse events

		//
		this.appSpecific();
	},

	//
	appSpecific: function() {
		this.debug = false;
		this.element.style.background = "white";

		this.listOfSnapshotsTaken = [];

		// inject html code    file to grab from,    element.innerHTML to override
		this.loadHtmlFromFile(this.resrcPath + "webpage/index.html", this.element, () => {
			if (this.isAnotherOpen()) {
				requestAnimationFrame(() => { this.close(); }); // only One at a time
			} else {
				this.postHtmlFillActions();
			}
		});
	},

	debugprint: function() {
		if (this.debug) {
			console.log("DEBUG sessionHelper>", arguments);
		}
	},

	/**
	 * If a design is loaded from html, this would be where to add event listeners. Name must match the function call named in loadHtmlFromFile
	 *
	 * @method     postHtmlFillActions
	 */
	postHtmlFillActions: function() {},


	// ------------------------------------------------------------------------------------------------------------------------
	// ------------------------------------------------------------------------------------------------------------------------


	// Use load for view synchronization across multiple clients / remote sites
	load: function(date) {},

	// Draw is called based on the maxFPS value and animation true
	draw: function(date) { },

	// ------------------------------------------------------------------------------------------------------------------------
	// ------------------------------------------------------------------------------------------------------------------------

	// Needs resizeEvents set to continuous or onfinish
	resize: function(date) {},


	// ------------------------------------------------------------------------------------------------------------------------
	// ------------------------------------------------------------------------------------------------------------------------

	/**
	* To enable right click context menu support this function needs to be present.
	*
	* Must return an array of entries. An entry is an object with three properties:
	*	description: what is to be displayed to the viewer.
	*	callback: String containing the name of the function to activate in the app. It must exist.
	*	parameters: an object with specified datafields to be given to the function.
	*		The following attributes will be automatically added by server.
	*			serverDate, on the return back, server will fill this with time object.
	*			clientId, unique identifier (ip and port) for the client that selected entry.
	*			clientName, the name input for their pointer. Note: users are not required to do so.
	*			clientInput, if entry is marked as input, the value will be in this property. See pdf_viewer.js for example.
	*		Further parameters can be added. See pdf_view.js for example.
	*/
	getContextEntries: function() {
		var entries = [];
		entries.push({
			description: "Take Snapshot",
			callback: "makeNoteSnapshot",
			parameters: {}
		});
		entries.push({description: "separator"});
		for (let i = 0; i < this.listOfSnapshotsTaken.length; i++) {
			entries.push({
				description: "Copy to clipboard snapshot" + this.listOfSnapshotsTaken[i].epoch,
				callback: "SAGE2_copyURL",
				parameters: {
					url: JSON.stringify(this.listOfSnapshotsTaken[i]),
				}
			});
		}
		entries.push({description: "separator"});
		entries.push({description: "separator"});
		for (let i = 0; i < this.listOfSnapshotsTaken.length; i++) {
			entries.push({
				description: "Download snapshot " + this.listOfSnapshotsTaken[i].epoch,
				callback: "SAGE2_download",
				parameters: {
					url: cleanURL("/user/notes/noteTextGrabber_" + this.listOfSnapshotsTaken[i].epoch + ".note"),
				}
			});
		}
		entries.push({description: "separator"});
		return entries;
	},

	makeNoteSnapshot: function() {
		// Using current time as differentiation
		let suffix = Date.now();
		let snap = [];
		let app;
		// Get all of the applications states
		for (let appId in applications) {
			app = applications[appId];
			if (app.application === "quickNote") {
				snap.push(Object.assign({}, app.state));
			}
		}
		// Track the date
		snap.epoch = suffix;
		this.listOfSnapshotsTaken.push(snap);
		this.writeBackupFile(suffix, snap);
		this.getFullContextMenuAndUpdate();
	},


	// ------------------------------------------------------------------------------------------------------------------------
	// ------------------------------------------------------------------------------------------------------------------------

	// Fill this out to handle pointer events. OR use the passSAGE2PointerAsMouseEvents
	event: function(eventType, position, user_id, data, date) {},

	// Is activated before closing, use this for cleanup or saving
	quit: function() {},



	// ------------------------------------------------------------------------------------------------------------------------
	// ------------------------------------------------------------------------------------------------------------------------

	writeBackupFile: function(nameSuffix, snap) {
		// Note: there are limited datatypes that can be written from display.
		// The .note happens to be one of them.
		var fileData = {};
		fileData.fileType = "note"; // Extension
		fileData.fileName = "noteTextGrabber_" + nameSuffix + ".note"; // Fullname with extension
		// What to save in the file, uses format of the quickNote
		fileData.fileContent = this.creationTime + "\n" + "white" + "\n";
		fileData.fileContent += JSON.stringify(snap) + ",\n";
		wsio.emit("saveDataOnServer", fileData);
	},


	// ------------------------------------------------------------------------------------------------------------------------
	// ------------------------------------------------------------------------------------------------------------------------
	// Default Support functions

	/**
	 * This will load the visual layout from html file included in the folder
	 * Done so one doesn't have to programatically generate layout.
	 *
	 * @method     loadHtmlFromFile
	 * @param      {String}  relativePathFromAppFolder From the containing app folder, path to file
	 * @param      {String}  whereToAppend     Node who's innerHTML will be set to content
	 * @param      {String}  callback     What function to call after getting the file
	 */
	loadHtmlFromFile: function(relativePathFromAppFolder, whereToAppend, callback) {
		var _this = this;
		readFile(relativePathFromAppFolder, function(err, data) {
			_this.loadIntoAppendLocation(whereToAppend, data);
			callback();
		}, 'TEXT');
	},

	/**
	 * Called after xhr gets html content
	 * Main thing to note is that id fields are altered to be prefixed with SAGE2 assigned id
	 *
	 * @method     loadIntoAppendLocation
	 * @param      {String}  whereToAppend Node who's innerHTML will be set to content
	 * @param      {String}  responseText     Content of the file
	 */
	loadIntoAppendLocation: function(whereToAppend, responseText) {
		var content = "";
		// id and spaces because people aren't always consistent
		var idIndex;

		// find location of first id div. Because there will potentially be multiple apps.
		idIndex = this.findNextIdInHtml(responseText);

		// for each id, prefix it with this.id
		while (idIndex !== -1) {
			// based on id location move it over
			content += responseText.substring(0, idIndex);
			responseText = responseText.substring(idIndex);
			// collect up to the first double quote. design.html has double quotes, but HTML doesn't require.
			content += responseText.substring(0, responseText.indexOf('"') + 1);
			responseText = responseText.substring(responseText.indexOf('"') + 1);
			// apply id prefix
			content += this.id;
			// collect rest of id
			content += responseText.substring(0, responseText.indexOf('"') + 1);
			responseText = responseText.substring(responseText.indexOf('"') + 1);

			// find location of first id div. Because there will potentially be multiple apps.
			idIndex = this.findNextIdInHtml(responseText);
		}
		content += responseText;
		whereToAppend.innerHTML = content;
	},

	/**
	 * This returns the index of the first location of id
	 * Accounts for 0 to 3 spaces between id and =
	 *
	 * @method     findNextIdInHtml
	 */
	findNextIdInHtml: function(responseText) {
		// find location of first id div. Because there will potentially be multiple apps.
		// the multiple checks are incase writers are not consistent
		var idIndex = responseText.indexOf("id=");
		var ids1 = responseText.indexOf("id =");
		var ids2 = responseText.indexOf("id  =");
		var ids3 = responseText.indexOf("id   =");
		// if (idIndex isn't found) or (is found but ids1 also found and smaller than idIndex)
		if ((idIndex === -1) || (ids1 > -1 && ids1 < idIndex)) {
			idIndex = ids1;
		}
		if ((idIndex === -1) || (ids2 > -1 && ids2 < idIndex)) {
			idIndex = ids2;
		}
		if ((idIndex === -1) || (ids3 > -1 && ids3 < idIndex)) {
			idIndex = ids3;
		}
		return idIndex;
	},

	// Makes it so only one of this app can be open
	isAnotherOpen: function() {
		let appNames = Object.keys(applications);
		for (let i = 0; i < appNames.length; i++) {
			if ((applications[appNames[i]].application == "noteAge") && (appNames[i] != this.id)) {
				return true;
			}
		}
		return false;
	},
});
