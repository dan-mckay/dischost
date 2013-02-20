var dataset = {
  apples: [53245, 28479, 19697, 24037, 40245],
  oranges: [200, 200, 200, 200, 200]
};

var width = 167,
    height = 167,
    radius = Math.min(width, height) / 2;

var color = d3.scale.category20();

var pie = d3.layout.pie()
    .sort(null);

var arc = d3.svg.arc()
    .innerRadius(radius - (100 / 3))
    .outerRadius(radius - (20 / 3));

var svg = d3.select("#rating").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var path = svg.selectAll("path")
    .data(pie(dataset.apples))
  .enter().append("path")
    .attr("fill", function(d, i) { return color(i); })
    .attr("d", arc)
    .each(function(d) { this._current = d; }); // store the initial values

d3.selectAll("input").on("change", change);

var timeout = setTimeout(function() {
  d3.select("input[value=\"oranges\"]").property("checked", true).each(change);
}, 2000);

function change() {
  clearTimeout(timeout);
  path = path.data(pie(dataset[this.value])); // update the data
  path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
}

// Store the displayed angles in _current.
// Then, interpolate from _current to the new angles.
// During the transition, _current is updated in-place by d3.interpolate.
function arcTween(a) {
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  return function(t) {
    return arc(i(t));
  };
}