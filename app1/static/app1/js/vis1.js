var monthsData = JSON.parse(document.getElementsByTagName('dataM')[0].getAttribute('data') || '{}');
var fireData = JSON.parse(document.getElementsByTagName('dataF')[0].getAttribute('data') || '{}');


console.log(fireData)
///////////////////// SELCTOR /////////////////////////

var maxArea = 0,
    maxCount = 0,
    selectorColor = "#FF6666",
		clickColor = "#33CCCC",
		violenceColor = "#ffcccc",
		homicideColor = "#FF6666";

monthsData.map(function(d) {
  if(d.data[0] >= maxCount) {
    maxCount = d.data[0]
  };
  if(d.data[1] >= maxArea) {
    maxArea = d.data[1]
  }
});


var width = 400,
    leftMargin = 100,
    topMargin = 70,
    barHeight = 20,
    barGap = 5,
    tickGap = 5,
    tickHeight = 10,
    scaleFactor = width / maxCount,
    barSpacing = barHeight + barGap,
    translateText = "translate(" + leftMargin + "," + topMargin + ")",
    scaleText = "scale(" + scaleFactor + ",1)";

// make selector chart
var selector = d3.select("#selector_chart");
var svg_selector = selector.append("svg")
		.attr("height", 700)
		.attr("width", 550)


var bar = svg_selector.append("g")
   .attr("transform", translateText + " " + scaleText)
   .attr("class", "bar");

bar.selectAll("rect")
    .data(monthsData)
    .enter().append("rect")
    .attr("class", "bargraph")
    .attr("x", 0)
    .attr("y", function(d,i) { return i * barSpacing })
    .attr("width", function(d) { return d.data[1] })
    .attr("height", barHeight)
    .attr("fill", selectorColor)
		.on("click", handleClick)
		.on("mouseover", handleMouseOver)
		.on("mouseout", handleMouseOut);


var barLabel = svg_selector.append("g")
     .attr("transform", translateText)
		 .attr("text-anchor", "end")
     .attr("class","bar-label");

barLabel.selectAll("text")
    .data(monthsData)
    .enter().append("text")
    .attr("x", -5)
    .attr("y", function(d,i) {return i * barSpacing + barHeight*(2/3)})
    .text(function(d) {return d.month})
    .style("fill", "#808080");

var graphTitle = svg_selector.append("g")
  .attr("transform", translateText)
  .attr("class","axis-label");

graphTitle.selectAll("text")
	.data(["Burnt Area per month (km^2)"])
	.enter().append("text")
	.attr("y", -30)
	.attr("x", 0)
	.style("font-size", 20)
	.style("font-weight", "bold")
	.style("fill", "#606060")
	.text(function(d) {return d});

var yAxisLabel = svg_selector.append("g")
  .attr("transform", translateText)
  .attr("class","axis-label");

yAxisLabel.selectAll("text")
  .data(["Month"])
  .enter().append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", -100)
  .attr("x", -(((monthsData.length * barSpacing) / 2) + topMargin))
  .attr("dy", "1em")
  .style("fill", "#808080")
  .style("font-size", 15)
  .text(function(d) {return d});

var totals = svg_selector.append("g")
  .attr("transform", translateText)
  .attr("class","bar-totals");

totals.selectAll("text")
  .data(monthsData)
  .enter().append("text")
  .attr("class", "totals")
  .attr("x",function(d) { return ((d.data[1]) * scaleFactor) + 10})
  .attr("y", function(d,i) {return i * barSpacing + barHeight*(2/3)})
  .text(function(d) { return (d.data[1]).toFixed(2) })
  .style("font-size", 13)

var dictOn = {};

// Initialize listOn with all months on
for(i=0;i<monthsData.length;i++) {
  window.dictOn[monthsData[i].month] = 0;
}

function handleClick(d, i) {
  console.log("hola")
  if(dictOn[monthsData[i].month] == 1) {
    d3.select(this).attr( "class", "bargraph");
		d3.select(this).attr( "isClicked", "false");
    // remove from list
    dictOn[monthsData[i].month] = 0;
  } else {
		dictOn[monthsData[i].month] = 1;
    // Use D3 to select element, change color and size
    d3.select(this).attr("class", "clicked");
		d3.select(this).attr( "isClicked", "true");
  }
  updateFires();
}

function handleMouseOver(d, i) {
	d3.select(this).attr( "class", "cliked");
}

function handleMouseOut(d, i) {
	if(d3.select(this).attr("isClicked") == "true") {
		d3.select(this).attr("class", "clicked");
	} else {
		d3.select(this).attr( "class", "bargraph");
	}
}


////////////////////// MAP ////////////////////////////
w = 600;
h = 800;
// variables for catching min and max zoom factors
var minZoom;
var maxZoom;
var hoverColor = "rgba(54, 203, 188, .6)";
var mapColor = "rgba(188, 251, 212, .4)";


// Define map projection
var projection = d3
   .geoEquirectangular()
   .center([-60, -20]) // set centre to center of Latin America
   .scale([w*6/(2*Math.PI)]) // scale to fit group width
   .translate([w/2,h/2]) // ensure centred in group
;


// Define map path
var path = d3
   .geoPath()
   .projection(projection)
;

function getTextBox(selection) {
  selection.each(function(d) {
    d.bbox = this.getBBox();
  });
}

var svg = d3
  .select("#map-holder")
  .append("svg")
  // set to the same size as the "map-holder" div
  .attr("width", $("#map-holder").width())
  .attr("height", $("#map-holder").height())
;

// Create a text element to write the coordinates
var label = d3.select("#lat-lon").append('text')
  .classed('coords', true)
  .text("-4.6,-62.2");


function updateFires() {
  var trueFireData = []
  fireData.map(function(d) {
    if(dictOn[d.month] == 1) {
    trueFireData.push(d);
    }
  });
  // add circles to svg
  svg.selectAll("circle")
  .remove();

  svg.selectAll("circle")
  .data(trueFireData).enter()
  .append("circle")
  .attr("cx", function (d) { return projection([d.x, d.y])[0]; })
  .attr("cy", function (d) { return projection([d.x, d.y])[1]; })
  .attr("r", function (d) { return d.area })
  .attr("class", "fire");


}

//get map data
d3.json(
  "http://127.0.0.1:8000/app1/LA-Geojson",
  function(la_json) {

  d3.json("http://127.0.0.1:8000/app1/AMZ-Geojson",
  function(amz_json) {

    amazonGroup = svg
      .append("g")
      .attr("id", "map");

    countriesGroup = svg
      .append("g")
      .attr("id", "map");

    // add a background rectangle
    countriesGroup
      .append("rect")
      .attr("class", "frame")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", w)
      .attr("height", h);

    amazon = amazonGroup
       .selectAll("path")
       .data(amz_json.features)
       .enter()
       .append("path")
       .attr("d", path)
       .attr("class", "amazon")



    // draw a path for each feature/country
    countries = countriesGroup
       .selectAll("path")
       .data(la_json.features)
       .enter()
       .append("path")
       .attr("d", path)
       .attr("id", function(d, i) {
          return "country" + d.properties.iso_a3;
       })
       .attr("class", "country")
       // add an onclick action to zoom into clicked country
       .on('mousemove', function(ev) {

          // Get the (x, y) position of the mouse (relative to the SVG element)
          var pos = d3.mouse(svg.node()),
              px = pos[0],
              py = pos[1];

          // Compute the corresponding geographic coordinates using the inverse projection
          var coords = projection.invert([px, py]);

          // Format the coordinates to have at most 4 decimal places
          var lon = coords[0].toFixed(4),
              lat = coords[1].toFixed(4);
          label.text([lat, lon].join(', '));
      });

    });
});


function clickHandle(x, y) {
  var coords = projection.invert([x, y]);
  var lon = coords[0].toFixed(4),
      lat = coords[1].toFixed(4);

  var data = [lat, lon, ]

  console.log([lat, lon].join(', '))
}
