function renderPoints() {
  incomingMessages.forEach((point) => {
    console.debug(`Rendering point:`, point);
    showPoint(point.name, point.long, point.lat);
  });
}

let mapData = {}; // Keep an unchanged copy of the requested GeoJSON to reset to
let geoJSON = {};
let context = d3.select("#mapContent").node().getContext("2d");
let projection = d3.geoOrthographic().scale(250);
let geoGenerator = d3
  .geoPath()
  .projection(projection)
  .pointRadius(8)
  .context(context);
let yaw = 180;

function resetView() {
  geoJSON = mapData;
  yaw = 180;
  renderPoints();
}

function update() {
  projection.rotate([yaw, 180]);
  context.clearRect(0, 0, 800, 800);
  context.lineWidth = 0.5;
  context.strokeStyle = "#333";
  context.beginPath();
  geoGenerator({ type: "FeatureCollection", features: geoJSON.features });
  context.stroke();

  // Graticule
  let graticule = d3.geoGraticule();
  context.beginPath();
  context.strokeStyle = "#ccc";
  geoGenerator(graticule());
  context.stroke();

  yaw -= 0.2;
}

function showPoint(name, long, lat) {
  const point = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [lat, long],
    },
    style: {
      stroke: "red", // FIXME!
    },
    properties: {
      name: name,
    },
  };
  // TODO: Show in red or something!
  geoJSON = { ...geoJSON, features: [...geoJSON.features, point] };
}

// REQUEST DATA
d3.json("110m_land.json").then(function (json) {
  mapData = json;
  geoJSON = json;
  window.setInterval(update, 100);
  window.setInterval(renderPoints, 1000);
});
