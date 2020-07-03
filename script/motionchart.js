function xMotion(d) {
  return d.Injury;
}

function yMotion(d) {
  return d.Accident;
}

function radius(d) {
  return d.Injury;
}

function colorMotion(d) {
  return d.LGA_NAME;
}

function keyMoyion(d) {
  return d.LGA_NAME;
}

var currentCountry = "";

// Chart dimensions.
const motion_margin = {
    top: 19.5,
    right: 19.5,
    bottom: 19.5,
    left: 39.5
  },
  motion_width = 860 - motion_margin.right,
  motion_height = 500 - motion_margin.top - motion_margin.bottom,
  yearMargin = 10;

// Various scales. These domains make assumptions of data, naturally.
var xScale = d3.scaleLinear().domain([0, 1200]).range([0, motion_width]),
  yScale = d3.scaleLinear().domain([0, 1000]).range([motion_height, 0]),
  radiusScale = d3.scaleSqrt().domain([0, 1000]).range([0, 50]),
  motion_colorScale = d3.scaleOrdinal(d3.schemeCategory20);

// The x & y axes.
// formatter = d3.format(".0%");
var xAxis = d3.axisBottom(xScale)
// .scale(xScale);

var yAxis = d3.axisLeft(yScale)
// .scale(yScale);

// Create the SVG container and set the origin.
const svg = d3.select("#motionchart").append("svg")
  .attr("id", "motion_chart")
  .attr("width", motion_width + motion_margin.left + motion_margin.right)
  .attr("height", motion_height + motion_margin.top + motion_margin.bottom)
  .append("g")
  .attr("transform", "translate(" + motion_margin.left + "," + motion_margin.top + ")");

// Add the x-axis.
svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + motion_height + ")")
  .call(xAxis);

// Add the y-axis.
svg.append("g")
  .attr("class", "y axis")
  .call(yAxis);

// Add an x-axis label.
svg.append("text")
  .attr("class", "x label")
  .attr("text-anchor", "end")
  .attr("x", motion_width)
  .attr("y", motion_height - 6)
  .text("Number of Injured");

// Add a y-axis label.
svg.append("text")
  .attr("class", "y label")
  .attr("text-anchor", "end")
  .attr("y", 6)
  .attr("dy", ".75em")
  .attr("transform", "rotate(-90)")
  .text("Number of Accidents");

// Add the year label; the value is set on transition.
var label = svg.append("text")
  .attr("class", "year label")
  .attr("text-anchor", "end")
  .attr("font", '100px')
  .attr("y", motion_height - 24)
  .attr("x", motion_width)
  .text(2013);

var country = svg.append("text")
  .attr("class", "country")
  .attr("y", motion_height - motion_margin.bottom)
  .attr("x", motion_margin.left)
  .text("");

// Load the data.
d3.json("./data/motion.json").get(function (newData) {
  drawMotionChart(newData);

})


function drawMotionChart(nations) {

  // A bisector since many nation's data is sparsely-defined.
  var bisect = d3.bisector(function (d) {
    return d[0];
  });

  // Add a dot per nation. Initialize the data at 1990, and set the colors.
  var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .text("a simple tooltip");

  tooltip.text("my tooltip text");

  var dots = svg.append("g")
    .attr("class", "dots");

  var dot = dots.selectAll(".dot")
    .data(interpolateData(2018))
    .enter().append("circle")
    .attr("class", "dot")
    .style("fill", function (d) {
      return motion_colorScale(colorMotion(d));
    })
    .on("mouseover", function (d) {
      tooltip.html("<strong>LGA name:</strong> " + d.LGA_NAME + "<br><strong>Number of Accidents:</strong>" + d.Accident);
      tooltip.attr('class', 'd3-tip');
      return tooltip.style("visibility", "visible");
    })
    .on("mousemove", function (d) {
      tooltip.html("<strong>LGA name:</strong> " + d.LGA_NAME + "<br><strong>Number of Accidents:</strong>" + d.Accident);
      return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
    })
    .on("mouseout", function (d) {
      return tooltip.style("visibility", "hidden");
    })
    .call(position)
    .sort(order);

  // Add a title.
  dot.append("text")
    .text(function (d) {
      return d.LGA_NAME;
    });

  // Add an overlay for the year label.
  var box = label.node().getBBox();
  console.log(box);

  var overlay = svg.append("rect")
    .attr("class", "overlay")
    .attr("x", box.x)
    .attr("y", box.y)
    .attr("width", box.width)
    .attr("height", box.height)
    .on("mouseover", enableInteraction);

  // Positions the dots based on data.
  function position(dot) {
    dot.attr("cx", function (d) {
        return xScale(xMotion(d));
      })
      .attr("cy", function (d) {
        return yScale(yMotion(d));
      })
      .attr("r", function (d) {
        return radiusScale(radius(d));
      });
  }

  // Defines a sort order so that the smallest dots are drawn on top.
  function order(a, b) {
    return radius(b) - radius(a);
  }

  // After the transition finishes, you can mouseover to change the year.
  function enableInteraction() {
    var yearScale = d3.scaleLinear()
      .domain([2013, 2018])
      .range([box.x + 10, box.x + box.width - 10])
      .clamp(true);

    // Cancel the current transition, if any.
    svg.transition().duration(0);

    overlay
      .on("mouseout", mouseout)
      .on("mousemove", mousemove)
      .on("touchmove", mousemove)

    function mouseout() {
      label.classed("active", false);
    }

    function mousemove() {
      label.classed("active", true);
      displayYear(yearScale.invert(d3.mouse(this)[0]));
    }
  }

  // Tweens the entire chart by first tweening the year, and then the data.
  // For the interpolated data, the dots and label are redrawn.
  function tweenYear() {
    var year = d3.interpolateNumber(2013, 2018);
    return function (t) {
      displayYear(year(t));
    };
  }

  // Updates the display to show the specified year.
  function displayYear(year) {
    dot.data(interpolateData(year), keyMoyion).call(position).sort(order);
    label.text(Math.round(year));
  }

  // Interpolates the dataset for the given (fractional) year.
  function interpolateData(year) {
    return nations.map(function (d) {
      return {
        LGA_NAME: d.LGA_NAME,
        sector: d.LGA_NAME,
        year: interpolateValues(d.year, year),
        Accident: Math.round(interpolateValues(d.Accident, year)),
        Injury: interpolateValues(d.Injury, year)
      };
    });
  }

  // Finds (and possibly interpolates) the value for the specified year.
  function interpolateValues(values, year) {
    var i = bisect.left(values, year, 0, values.length - 1),
      a = values[i];
    if (i > 0) {
      var b = values[i - 1],
        t = (year - a[0]) / (b[0] - a[0]);
      return a[1] * (1 - t) + b[1] * t;
    }
    return a[1];
  }

  // Start a transition that interpolates the data based on year.
  function start() {
    svg.transition()
      .duration(30000)
      .ease(d3.easeLinear)
      .tween("year", tweenYear)
      .on("end", enableInteraction);
  }

  //start the transition
  document.getElementById('play').onclick = function () {
    start();
  }

  // Cancel the current transition
  document.getElementById('stop').onclick = function () {
    svg.transition().duration(0);
  }
}