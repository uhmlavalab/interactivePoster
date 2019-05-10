
//
// SAGE2 application: webviewApp
// by: Dylan Kobayashi <dylank@hawaii.edu>
//
// Copyright (c) 2018
//

console.log("main.js loaded");

// To manually change the application title
SAGE2_AppState.titleUpdate("Plotly Chart");



// Start the draw
initChartDiv();


// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------



// This should be the only event that causes data change.
function plotFromContainer(param) {
	let plotlyFormat = formatDataFromStandardFormat(param);
	Plotly.newPlot("chartDiv", plotlyFormat.complexData, plotlyFormat.complexLayout);
	addEventsToPlot();
	sendDataChangeToContainer([param[0], param[1]]);
}

/*
Could be multiple.
*/
function hoverFromContainer(param) {
	console.log("erase me, hoverFromContainer", param);
	// First get matches
	let dataMatches = getTraceAndIndexOfData(param);
	triggerHoverEffects(dataMatches);
}


// Switch scatter plot to a line chart
function restyleFromContainer(param) {
	Plotly.restyle("chartDiv", param.switchData, param.switchLayout);
}



// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------

function sendDataChangeToContainer(param) {
	SAGE2_AppState.callFunctionInContainer("handleDataChange", param);
}

// function sendClickToContainer(param) {
// 	SAGE2_AppState.callFunctionInContainer("handleClick", param);
// }

function sendHoverToContainer(param) {
	SAGE2_AppState.callFunctionInContainer("handleHover", param);
}

function sendSelectionToContainer(param) {
	SAGE2_AppState.callFunctionInContainer("handleSelection", param);
}

