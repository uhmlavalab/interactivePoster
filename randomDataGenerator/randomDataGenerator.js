var randomDataGenerator = SAGE2_App.extend({
  init: function(data) {
    console.log(data);
    this.SAGE2Init('div', data);
    this.resizeEvents = "continuous";
    this.data = [];
    this.x = [];
    this.y = [];

    this.y.push(Math.random() * 10 + 10);
    var now = Date.now();
    this.x.push({ 
      date: new Date(now),
      millis: now,
    });

    var i = 1;
    while (i < 100) {
      now -= 1000;
      var offset = Math.random() > 0.2 ? 0 : -Math.random() * 0.1;
      this.y.unshift(this.y[0] + offset);
      this.x.unshift({
        date: new Date(now),
        millis: now,
      });
      i++;
    }

    var trace = {
      x: this.x.map(function(obj) { 
        return obj.date.toLocaleTimeString() 
      }),
      y: this.y,
      mode: 'lines',
    };

    this.data.push(trace);

    this.redraw = true;

    this.layout = {
      title: 'Rainfall',
      yaxis: {
        title: 'Rainfall (mm)'
      },
    };

},

load: function(date) {

},

draw: function(date) {

  if (this.redraw) {
    Plotly.newPlot(this.element, this.data, this.layout);
    this.redraw = false;
  }

  var now = Date.now();
  console.log(now);
  console.log(this.x[this.x.length - 1].millis);
  console.log(now - this.x[this.x.length - 1].millis);
  if (now - this.x[this.x.length - 1].millis >= 1000) {
    this.x.shift();
    this.x.push({ date: new Date(now), millis: now });
    this.y.shift();
    var offset = Math.random() > 0.2 ? 0 : Math.random() * 0.1;
    this.y.push(this.y[this.y.length - 1] + offset);
    var source = {
      x: this.x,
      y: this.y,
    };

    this.receiveData(source);
  }
},

resize: function(date) {
    this.redraw = true;
    this.refresh(date); //redraw after resize
},

event: function(type, position, user, data, date) {
    
    this.refresh(date);
},

move: function(date) {
    this.redraw = true;
    this.refresh(date);
},

quit: function() {
    this.log("Done");
},

receiveData: function(source) {
  console.log("receiving data");
  this.data[0].x = source.x.map(function(obj) { 
    return obj.date.toLocaleTimeString(); 
  });
  this.data[0].y = source.y;
  this.redraw = true;
  this.refresh(new Date(Date.now()));

},

});