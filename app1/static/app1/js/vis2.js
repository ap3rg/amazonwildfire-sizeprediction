var index_data = JSON.parse(document.getElementsByTagName('data')[0].getAttribute('data') || '{}');
var weather_data = JSON.parse(document.getElementsByTagName('dataW')[0].getAttribute('data') || '{}');

console.log(weather_data)

w = 600;
h = 800;
// variables for catching min and max zoom factors
var minZoom;
var maxZoom;
var hoverColor = "rgba(54, 203, 188, .6)";
var mapColor = "rgba(188, 251, 212, .4)";

console.log("HElLLo")
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

function plotFire(data) {
  console.log("plotting fire")
  console.log(data)

  console.log(projection([data.x, data.y]));
  // add circles to svg
  svg.selectAll("circle")
  .remove();

  svg.selectAll("circle")
  .data([data]).enter()
  .append("circle")
  .attr("cx", function (d) { return projection([data.x, data.y])[0] - w/2.5; })
  .attr("cy", function (d) { return projection([data.x, data.y])[1] - h/2.5; })
  .attr("r", function (d) { return d.area * 50 })
  .attr("class", "fire");


  d3.select("#lat")
    .text("Latitude: " + data.y)

  d3.select("#lon")
    .text("Longitude: " + data.x)

  d3.select("#fwi")
    .text("FWI: " + data.x)

  d3.select("#ffmc")
    .text("FFMC: " + data.ffmc)

  d3.select("#dmc")
    .text("DMC: " + data.dmc)

  d3.select("#dc")
    .text("DC: " + data.dc)

  d3.select("#isi")
    .text("ISI: " + data.isi)

  d3.select("#area")
    .text("Predicted Area: " + data.area)


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
       // add a mouseover action to show name label for feature/country
       .on("mouseover", function(d, i) {
          d3.select(this).style("fill", hoverColor);
       })
       .on("mouseout", function(d, i) {
          d3.select(this).style("fill", mapColor);
       })
       // add an onclick action to zoom into clicked country
       .on("click", function(d, i) {
         // console.log(event.clientX, event.clientY);
          clickHandle(event.clientX, event.clientY);
          selectModel();
       })
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


const NASA_LAT_START = -58.0,
      NASA_LON_START = -180.0,
      LAT_STEPS = 0.5,
      LON_STEPS = 0.625;


function selectModel() {
  var selectedAns;
  var chosenModel = "no-weather"
  var models = document.getElementsByName("model");
  for(var i = 0; i < models.length; i++) {
     if(models[i].checked == true) {
     chosenModel = models[i].value;
     break;
    }
  }
  return chosenModel;
}

function clickHandle(x, y) {

  var coords = projection.invert([x, y]);
  var lon = coords[0].toFixed(4),
      lat = coords[1].toFixed(4),
      _lon = coords[0],
      _lat = coords[1];

  nasa_lat_index = Math.floor(Math.abs(NASA_LAT_START - _lat) / LAT_STEPS);
  nasa_lon_index = Math.floor(Math.abs(NASA_LON_START - _lon) / LON_STEPS);

  selectedModel = selectModel()

  if(selectedModel == "weather") {
    var fwi = index_data[nasa_lat_index]["fwi"],
        ffmc = index_data[nasa_lat_index]["ffmc"],
        dmc = index_data[nasa_lat_index]["dmc"],
        dc = index_data[nasa_lat_index]["dc"],
        isi = index_data[nasa_lat_index]["isi"],
        rh = weather_data[nasa_lat_index]["qv2m"],
        rain = weather_data[nasa_lat_index]["tql"],
        wind = weather_data[nasa_lat_index]["v10m"],
        temp = weather_data[nasa_lat_index]["t2m"];

    var inputData = {"input": [
      [lon, lat, ffmc, dmc, dc, isi, temp, rh, wind, rain]
    ]}
    console.log(inputData)

    var model = "https://us-central1-fluent-tea-252217.cloudfunctions.net/forest-fire-weather"
  } else {
    var fwi = index_data[nasa_lat_index]["fwi"],
        ffmc = index_data[nasa_lat_index]["ffmc"],
        dmc = index_data[nasa_lat_index]["dmc"],
        dc = index_data[nasa_lat_index]["dc"],
        isi = index_data[nasa_lat_index]["isi"];

    var inputData = {"input": [
      [lon, lat, fwi, ffmc, dmc, dc, isi]
    ]}
    var  model = "https://us-central1-fluent-tea-252217.cloudfunctions.net/forest-fire"
  }

  run_model(inputData, model)

}

function run_model(input, model) {
  var url = model;
  var data = JSON.stringify(
          input
        );

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = false;

        xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
          console.log(this.responseText);
          var resp = JSON.parse(this.responseText);
          if(model == "https://us-central1-fluent-tea-252217.cloudfunctions.net/forest-fire") {
            plotFire({"x": input["input"][0][0],
            "y": input["input"][0][1],
            "fwi": input["input"][0][2],
            "ffmc": input["input"][0][3],
            "dmc":input["input"][0][4],
            "dc": input["input"][0][5],
            "isi": input["input"][0][6],
            "area": resp["area"][0]
            })
          } else {
            plotFire({"x": input["input"][0][0],
            "y": input["input"][0][1],
            "fwi": input["input"][0][2],
            "ffmc": input["input"][0][3],
            "dmc":input["input"][0][4],
            "dc": input["input"][0][5],
            "isi": input["input"][0][6],
            "area": resp["area"][0]
            })
            console.log(this.responseText)
          }
        }
        });

        xhr.open("POST", url);
        xhr.setRequestHeader("content-type", "application/json");

        xhr.send(data);
}
