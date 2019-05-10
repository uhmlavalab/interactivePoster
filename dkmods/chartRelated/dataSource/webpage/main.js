
//
// SAGE2 application: skeletonWebviewApp
// by: Dylan Kobayashi <dylank@hawaii.edu>
//
// Copyright (c) 2018
//

console.log("main.js loaded");


dataState = { // Default values
	count: 10,
	style: "xCountUp", // or "fullRandom"
	xmin: 0,
	xmax: 10,
	ymin: 0,
	ymax: 10,
	values: []
}

generateValues();
updateVisuals();

document.getElementById("btnGenVals").addEventListener("click", () => {
	generateValues();
});


/*
How to use SAGE2_AppState.js

	Including SAGE2_AppState.js will add a global variable to the window called:
		SAGE2_AppState

	That provides the means to communicate with the app container.

	See the following examples below:

*/


// To manually change the application title
SAGE2_AppState.titleUpdate("Data Source");




// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------
// Functional


function updateVisuals() {
	document.getElementById("stateCount").value = dataState.count;
	document.getElementById("stateStyle").value = dataState.style;
	document.getElementById("stateXRangeMin").value = dataState.xmin;
	document.getElementById("stateXRangeMax").value = dataState.xmax;
	document.getElementById("stateYRangeMin").value = dataState.ymin;
	document.getElementById("stateYRangeMax").value = dataState.ymax;
	document.getElementById("stateCurrent").textContent = JSON.stringify(dataState.values);

}

function setter(name, value) {
	if (dataState[name]) {
		dataState[name] = value;
	} else {
		throw "ERROR, unknown dataState: " +  name;
	}

}

function generateValues(){
	dataState.values = [];
	let xValues = [];
	let yValues = [];

	// this works with Angela's formatting
	if (dataState.style === "xCountUp") { // regardless of count, use x min to max
		for (let i = dataState.xmin; i < dataState.xmax; i++) {
			xValues.push(i);
			yValues.push(randomInt(dataState.ymin, dataState.ymax));
		}
	} else if (dataState.style === "fullRandom") {
		for (let i = 0; i < dataState.count; i++) {
			xValues.push(randomInt(dataState.xmin, dataState.xmax))
			yValues.push(randomInt(dataState.ymin, dataState.ymax));
		}
	}
	dataState.values.push(xValues);
	dataState.values.push(yValues);


	// this works with Troy's formatting
	if (dataState.style === "timeSeriesTroy") { // regardless of count, use x min to max
		let nextTimeMillis;
		let interval = 1000;

		// If there is already a time series data piece loaded
		if ((typeof dataState.values === "object")
			&& (dataState.values.x)
			&& (dataState.values.y)
			&& (dataState.type === "timeSeriesTroy")) {
				// Remove oldest element (first)
				dataState.values.x.shift();
				dataState.values.y.shift();
				// Add another element (now)
				nextTimeMillis = dataState.values.x.slice(-1)[0] + interval;
				dataState.values.x.push({
					date: new Date(nextTimeMillis),
					millis: nextTimeMillis // Add one second from the last
				});
				dataState.values.y.push(randomInt(0, 20)); // Thats the current test app limits
		} else {
			// Else, create one
			dataState.values = {x:[], y:[], type: "timeSeriesTroy"};
			let nextTimeMillis = Date.now() - (interval * dataState.count);
			for (let i = 0; i < dataState.count; i++) {
				dataState.values.x.push({
					date: new Date(nextTimeMillis),
					millis: nextTimeMillis // Add one second from the last
				});
				dataState.values.y.push(randomInt(0, 20));
				nextTimeMillis += interval;
			}
		}
	}


	updateVisuals();

	SAGE2_AppState.callFunctionInContainer("storeDataGeneration", JSON.stringify(dataState.values));
}

function randomInt(min, max) {
	let diff = max - min;
	diff++; // to allow generating max
	return min + parseInt(diff * Math.random());
}



	
// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------
// Communications

function customFullStateHandler(state) {
	console.log("Received a full state update from container", state);
}

function handlerForZoomStateValue(value) {
	console.log("State was updated, current zoom value:", value);
}


function setValueInDataState(value) {
	console.log("State was updated, current value:" + JSON.stringify(value));
	if (value.type === "int") {
		this.dataState[value.vname] = parseInt(value.clientInput);
		updateVisuals();
	} else if (value.type === "string") {
		this.dataState[value.vname] = value.clientInput;
		updateVisuals();
	} else if (value.type === "generate") {
		generateValues();
	}
}