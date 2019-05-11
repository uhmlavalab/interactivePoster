








var uiHelper = {
	debug: true,

	// Tracking vars
	runningCheckboxCounter: 0,

	// ------------------------------------------------------------------------------------------------------------
	// Just a quick window
	makePanel: function(draggable = true) {
		let p = document.createElement("div");

		// Pos
		p.style.left = "2px";
		p.style.top = "2px";
		p.style.position = "absolute";
		p.style.zIndex = 1111; // safe?
		// Visual
		p.style.background = "white";
		p.style.border = "2px solid black";

		if (draggable){
			p.dragproperties = {};
			p.addEventListener("mousedown", function (e) {
				this.dragproperties.drag = true;
			});
			p.addEventListener("mousemove", function (e) {
				if (this.dragproperties.drag) {
					this.style.left = parseInt(this.style.left) + e.movementX + "px";
					this.style.top = parseInt(this.style.top) + e.movementY + "px";
				}
			});
			p.addEventListener("mouseleave", function (e) {
				if (this.dragproperties.drag) {
					this.style.left = parseInt(this.style.left) + e.movementX + "px";
					this.style.top = parseInt(this.style.top) + e.movementY + "px";
				}
			});
			p.addEventListener("mouseup", function (e) {
				this.dragproperties.drag = false;
			});
		}

		document.body.appendChild(p);

		return p;
	},


	// ------------------------------------------------------------------------------------------------------------
	// Just a quick checklist
	addCheckbox: function(panel, text, callback) {
		if (!panel) { throw "Unable to add checkbox without panel";}
		if (!text) { throw "Unable to add checkbox without text";}
		if (!callback) { uiHelper.debugprint("WARNING> No callback given on checkbox add");}

		// Example:
		// <input type="checkbox" id="scales" name="scales" checked>
		// <label for="scales">Scales</label>
		let d = document.createElement("div"); // div container
		d.id = "cbd" + uiHelper.runningCheckboxCounter;
		d.style.margin = "10px";

		let c = document.createElement("button");
		c.innerHTML = "&nbsp&nbsp&nbsp&nbsp";
		// c.style.border = "1px solid black";
		c.style.background = "black";
		c.id = "cbc" + uiHelper.runningCheckboxCounter;

		
		// let c = document.createElement("span");
		// c.innerHTML = "&nbsp&nbsp&nbsp&nbsp";
		// c.style.border = "1px solid black";
		// c.style.background = "black";
		// c.id = "cbc" + uiHelper.runningCheckboxCounter;

					// let c = document.createElement("input");
					// c.type = "checkbox";
					// c.id = "cbc" + uiHelper.runningCheckboxCounter;
					// c.name = text;



		let l = document.createElement("label");
		l.for = c.id;
		l.id = "cbl" + uiHelper.runningCheckboxCounter;
		l.innerHTML = text;
		d.appendChild(c);
		d.appendChild(l);
		panel.appendChild(d);

		if (callback) {
			c.addEventListener("mousedown", (e) => {
				if (c.style.background === "black") { c.style.background = "white"; }
				else { c.style.background = "black"; }
				callback(e);
			});
			l.addEventListener("mousedown", (e) => {
				if (c.style.background === "black") { c.style.background = "white"; }
				else { c.style.background = "black"; }
				callback(e);
			});
		}

		uiHelper.runningCheckboxCounter++;
	},

	

	// ------------------------------------------------------------------------------------------------------------
	debugprint: function(line) {
		if (arguments.length > 1) { console.log("leafletHelper DEBUG>", arguments); }
		else { console.log("leafletHelper DEBUG>", line); }
	}
};




