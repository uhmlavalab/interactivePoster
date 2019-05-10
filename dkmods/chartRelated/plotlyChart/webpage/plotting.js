// ----------------------------------------------------------------------------------------------------
// Scatter Plot

// Setup the div, should only be called once

function initChartDiv() {
	var chartDiv = document.getElementById("chartDiv"),
		d3 = Plotly.d3,
		N = 16,
		x = d3.range(N), // X points in a row to N
		y = d3.range(N).map( d3.random.normal() ), // Normal distribution of N points
		opacity = 0.5,
		data = [ {
			x, y,
			type:"scatter",
			mode:"markers",
			marker:{size:16} }
		],
		layout = {
			hovermode:"closest",
			// xaxis: {title: "xaxis"},
			// yaxis: {title: "yaxis"},
		};
	
	Plotly.newPlot("chartDiv", data, layout);

	addEventsToPlot();
	redrawPlot();
	sendDataChangeToContainer([x, y]);
}


// ----------------------------------------------------------------------------------------------------
// These may get called repeatedly


function addEventsToPlot() {
	let chartDiv = document.getElementById("chartDiv");

	// Disabling click for now.
	// chartDiv.on("plotly_click", function(data){
	// 	var pts = "";
	// 	for(var i=0; i < data.points.length; i++){
	// 		pts = "x = "+data.points[i].x +"\ny = "+
	// 		data.points[i].y.toPrecision(4) + "\n\n";
	// 		clickData(data.points[i].x, data.points[i].y);
	// 	}
	// });

	chartDiv.on("plotly_hover", function(data){
		var pts = "";
		for(var i=0; i < data.points.length; i++){
			pts = "x = "+data.points[i].x +"\ny = "+
			data.points[i].y.toPrecision(4) + "\n\n";
			hoverData(data.points[i].x, data.points[i].y);
		}
	});

	// selection event
	chartDiv.on("plotly_selected", function(eventData) {
		var x = [];
		var y = [];

		eventData.points.forEach(function(pt) {
			x.push(pt.x);
			y.push(pt.y);
		})
		selectionData(x, y);
	});
}

function redrawPlot() {
	let chartDiv = document.getElementById("chartDiv");
	chartDiv.style.width = window.innerWidth * 0.97 + "px";
	chartDiv.style.height = window.innerHeight * 0.97 + "px";
	Plotly.newPlot("chartDiv", chartDiv.data, chartDiv.layout);
	addEventsToPlot();
}

function getCurrentDataInStandardFormat() {
	let chartData = document.getElementById("chartDiv").data;
	return [chartData.x, chartData.y];
}


function formatDataFromStandardFormat(newData) {
	let complexData = [{
		x:newData[0], y:newData[1],
		type:'scatter',
		mode:'markers',
		marker:{size:16}
	}];

	let complexLayout = {
			hovermode:'closest',
			title:'Alternate Data'
	};
	return {complexData, complexLayout};
}


/*
	This is intended to be used with hover and selection triggering through programmatic means.

	standardDataArray is the format decided from meeting:
		[
			0[x1,x2,..]
			1[y1,y2,..]
		]

*/
function getTraceAndIndexOfData(standardDataArray) {
	let chartDiv = document.getElementById("chartDiv");
	let chartData = chartDiv.data;

	let matches =	Array(standardDataArray[0].length).fill(null); // Can't have index of -1
	let checkx, checky, plotx, ploty;

	// If there is data
	if (chartData && (chartData.length > 0) && chartData[0].x) {

		// Go through each chart trace
		for (let traceIndex = 0; traceIndex < chartData.length; traceIndex++) {
			trace = chartData[traceIndex];
			if (trace.x && trace.y) {
				// And see if the data matches anything in the given data array. Note this is highly inefficient
				for (let elementIndex = 0; elementIndex < trace.x.length; elementIndex++) {
					for (let dataToTriggerIndex = 0; dataToTriggerIndex < standardDataArray[0].length; dataToTriggerIndex++) {
						checkx = standardDataArray[0][dataToTriggerIndex];
						checky = standardDataArray[1][dataToTriggerIndex];
						plotx = trace.x[elementIndex];
						ploty = trace.y[elementIndex];
						if (
						(standardDataArray[0][dataToTriggerIndex] === trace.x[elementIndex])
						&& (standardDataArray[1][dataToTriggerIndex] === trace.y[elementIndex])
						){
							matches[dataToTriggerIndex] = [traceIndex, elementIndex];
						}
					}
				}
			}
		}
	}
	return matches;
}


function triggerHoverEffects(traceAndDataIndexies) {
	let entry;
	let allHoversToTrigger = [];
	for (let i = 0; i < traceAndDataIndexies.length; i++) {
		entry = traceAndDataIndexies[i];
		if (entry) {
			allHoversToTrigger.push({curveNumber: entry[0], pointNumber: entry[1]});
		}
	}
	// OK for blank, as that will remove hover
	Plotly.Fx.hover("chartDiv", allHoversToTrigger);
}



// ----------------------------------------------------------------------------------------------------
// Event handlers

function clickData(x, y) {
  sendClickToContainer([[x],[y]]);
  return [ [x], [y] ];
}

function hoverData(x, y) {
  sendHoverToContainer([[x],[y]]);
  return [ [x], [y] ];
}

function selectionData(x, y) {
	sendSelectionToContainer([x,y]);
  return [ x, y ];
}


// ----------------------------------------------------------------------------------------------------
// For future usage




function getPlotMinMaxBoundsOfXAndY(buffers) {
	let chartDiv = document.getElementById("chartDiv");
	let mm = {
		min: {x: null, y: null},
		max: {x: null, y: null}
	}
	let trace;

	// Get min max by going through all chart trace and do data comparison. Currently does x,y
	if (chartDiv.data && (chartDiv.data.length > 0) && chartDiv.data[0].x) {
		mm.min.x = chartDiv.data[0].x[0];
		mm.max.x = chartDiv.data[0].x[0];
		mm.min.y = chartDiv.data[0].y[0];
		mm.max.y = chartDiv.data[0].y[0];
		for (let traceIndex = 0; traceIndex < chartDiv.data.length; traceIndex++) {
			trace = chartDiv.data[traceIndex];
			if (trace.x && trace.y) {
				for (let elementIndex = 0; elementIndex < trace.x.length; elementIndex++) {
					if (trace.x[elementIndex] < mm.min.x) {
						 mm.min.x = trace.x[elementIndex];
					} else if (trace.x[elementIndex] > mm.max.x) {
						mm.max.x = trace.x[elementIndex];
					}
					if (trace.y[elementIndex] < mm.min.y) {
						 mm.min.y = trace.y[elementIndex];
					} else if (trace.y[elementIndex] > mm.max.y) {
						mm.max.y = trace.y[elementIndex];
					}
				}
			}
		}
	
		// Apply buffers if given
		if (buffers) {
			if (buffers.x) {
				mm.min.x -= buffers.x;
				mm.max.x += buffers.x;
			}
			if (buffers.y) {
				mm.min.y -= buffers.y;
				mm.max.y += buffers.y;
			}
		}
	} else { // If there is no data, cannot provide min/max
		mm = null;
	}
	
	return mm.min.y;
}



function scatterToLine(data) {
  var switchData = [{
    x:data[0], y:data[1],
    type:"scatter", mode: "lines"
  }];

  var switchLayout = {
    hovermode: "closest",
    title:"Line Chart"
  };

  return {switchData, switchLayout};
}



