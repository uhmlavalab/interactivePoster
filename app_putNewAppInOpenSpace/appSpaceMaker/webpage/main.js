
//
// SAGE2 application: skeletonWebviewApp
// by: Dylan Kobayashi <dylank@hawaii.edu>
//
// Copyright (c) 2018
//

console.log("main.js loaded");





// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------

/*

height map should be
[
	[] top most
	[] ...
	[] bottom most
]


*/
function updateCanvasMap(heightMap) {
	let canvas = document.getElementById("usageMap");
	let cHeight = heightMap.length;
	let cWidth = heightMap[0].length;
	let ctx = canvas.getContext('2d');

	canvas.width = cWidth;
	canvas.height = cHeight;

	// clear out the current color
	ctx.clearRect(0, 0, cWidth, cHeight); // whole thing

	// Setup fill color:
	// ctx.fillStyle = "rgba("+r+","+g+","+b+","+(a/255)+")";
	ctx.fillStyle = "rgb(253,187,132)"; // orangish
	
	// Go through height map and color
	for (let row = 0; row < cHeight; row++) {
		for (let col = 0; col < cWidth; col++) {
			if (heightMap[row][col] !== 0) {
				ctx.fillRect(col, row, 1, 1); // color 1 px for that row col
			}
		}
	}



}



// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------
// Testing

function test01TestPlot() {
	let m = [
		[0, 0, 0, 0, 1, 0],
		[0, 0, 1, 0, 0, 1],
		[0, 0, 0, 0, 0, 0],
		[1, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 1],
		[0, 0, 1, 0, 0, 0],
	];
	updateCanvasMap(m);
}