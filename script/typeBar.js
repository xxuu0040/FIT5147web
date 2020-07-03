const margin_hbar = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 80
    },
    width_hbar = 860 - margin_hbar.left - margin_hbar.right,
    height_hbar = 500 - margin_hbar.top - margin_hbar.bottom;

// set the svg
var svg_hbar = d3.select('#type-bar').append('svg')
    .attr('class', 'hbar')
    .attr('width', width_hbar)
    .attr('height', height_hbar)
    .append('g')
    .attr('width', 660)
    .attr("transform", "translate(" + margin_hbar.left + "," + margin_hbar.top + ")");

// set the zoom
const zoom_new = d3.zoom()
    .scaleExtent([1, 40])
    .translateExtent([
        [0, 0],
        [width_mapLine, height_mapLine]
    ])
    .extent([
        [0, 0],
        [width_mapLine, height_mapLine]
    ])
    .on("zoom", zoomed);

const svg_newmap = d3.select("#map2").append('svg')
    .attr('width', width_mapLine)
    .attr('height', height_mapLine)
    .call(zoom_new)
    .append('g')
    .attr('class', 'new_map');

// set other variables
const tooltip_newmap = d3.select("#tool_map");

const tooltip_bar = d3.select('#tool_bar');

const path_new = d3.geoPath();

const data_bar = d3.map();
const colorScale_bar = d3.scaleThreshold()
    .domain([0, 300, 600, 800, 1400, 2000, 2500])
    .range(d3.schemeReds[7]);

let legend_map = svg_newmap.append("g")
    .attr("class", "key")
    .attr("id", "legend")
    .attr("transform", "translate(-240,40)");

// add the color degree label
legend_map.selectAll("rect")
    .data(colorScale.range().map(function (d) {
        d = colorScale.invertExtent(d);
        if (d[0] == null) d[0] = x_map.domain()[0];
        if (d[1] == null) d[1] = x_map.domain()[1];
        return d;
    }))
    .enter().append("rect")
    .attr("height", 8)
    .attr("x", function (d) {
        return x_map(d[0]);
    })
    .attr("width", function (d) {
        return x_map(d[1]) - x_map(d[0]);
    })
    .attr("fill", function (d) {
        return colorScale_bar(d[0]);
    });

legend_map.append("text")
    .attr("class", "caption")
    .attr("x", x_map.range()[0] + 135)
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "end")
    .attr("font-weight", "bold")
    .text("Accidents in vic (hundred)")

legend_map.call(d3.axisBottom(x_map)
        .tickSize(13)
        .tickFormat(function (x_map) {
            if (Math.round(x_map) === 0) {
                return Math.round(x_map);
            }
            return Math.round(x_map) / 100 + 'h';
        })
        .tickValues(colorScale.domain()))
    .select(".domain")
    .remove();

let clickItem = 'MELBOURNE';
var crashes, crash_type, value;

// load the data
d3.csv("./data/Crashes_Last_Five_Years.csv").get(function (data) {
    crashes = d3.nest()
        .key(function (d) {
            return d.LGA_NAME;
        })
        .rollup(function (v) {
            return d3.sum(v, function (d) {
                return d.index;
            })
        })
        .object(data);

    crash_type = d3.nest()
        .key(function (d) {
            return d.LGA_NAME;
        })
        .key(function (d) {
            return d.ACCIDENT_TYPE;
        })
        .rollup(function (v) {
            return d3.sum(v, function (d) {
                return d.index;
            })
        })
        .entries(data);

    crash_type.forEach(function (d) {
        if (d.key === clickItem) {
            value = d.values;
        }
    });

});

// update the bar chart
function updateBar() {
    d3.selectAll('.hbar').remove();
    svg_hbar = d3.select('#type-bar').append('svg')
        .attr('class', 'hbar')
        .attr('width', width_hbar)
        .attr('height', height_hbar)
        .append('g')
        .attr("transform", "translate(" + margin_hbar.left + "," + margin_hbar.top + ")");
}

// update the value of bar chart
function updateValue() {
    d3.csv("./data/Crashes_Last_Five_Years.csv").get(function (data) {
        crash_type.forEach(function (d) {
            if (d.key === clickItem) {
                value = d.values;
            }
        });
    });
}

// zoom the map
function zoomed() {
    svg_newmap.attr("transform", d3.event.transform);
}

// draw the map
function drawMap() {
    d3.queue()
        .defer(d3.json,
            "https://data.gov.au/geoserver/vic-local-government-areas-psma-administrative-boundaries/wfs?request=GetFeature&typeName=ckan_bdf92691_c6fe_42b9_a0e2_a4cd716fa811&outputFormat=json")
        .await(ready);


    function ready(error, topo) {
        svg_newmap.append('g')
            .attr("id", "map_new")
            .selectAll('path')
            .data(topo.features)
            .enter()
            .append("path")
            .attr("d", d3.geoPath().projection(projection))
            .attr("fill", function (d) {
                d.total = crashes[d.properties.vic_lga__3] || 0;
                return colorScale_bar(d.total)
            })
            .style("stroke", "transparent")
            .style("opacity", .8)
            .on("mouseover", function (d) {
                tooltip_newmap.transition()
                    .duration(200)
                    .style('opacity', .9);
                tooltip_newmap.attr("class", "map-tip")
                    .style("left", d3.event.pageX + 70 + "px")
                    .style("top", d3.event.pageY - 28 + "px")
                    .style("display", "inline-block")
                    .html((d.properties.vic_lga__3) + '<br>' + (d.total));
                d3.select(this).style('opacity', 1.5);
            })
            .on("mouseout", function (d) {
                tooltip_newmap.style("display", "none");
                d3.selectAll('path').style("opacity", .8);
            })
            .on("click", clicked);
    }

    // click the map
    function clicked(d) {
        let x, y, k;

        if (d && centered !== d) {
            let centroid = path.centroid(d);
            x = centroid[0];
            y = centroid[1];
            k = 2;
            centered = d;
            clickItem = d.properties.vic_lga__3;
        } else {
            x = width_mapLine / 2;
            y = height_mapLine / 2;
            k = 1;
            centered = null;
        }

        svg_newmap.selectAll("path")
            .classed("active", centered && function (d) {
                return d === centered;
            });
        updateBar();
        updateValue();
        drawHbar(value, svg_hbar);
    }
}

// draw the bar chart
function drawHbar(data, svg) {
    let x_hbar = d3.scaleLinear().range([0, width_hbar - 160]);
    let y_hbar = d3.scaleBand().range([height_hbar, 30]);

    data.sort(function (a, b) {
        return a.value - b.value;
    });

    x_hbar.domain([0, d3.max(data, function (d) {
        return d.value;
    })]);
    y_hbar.domain(data.map(function (d) {
        return d.key;
    })).padding(0.3);

    svg.append("g")
        .attr("class", "x_hbar_axis")
        .attr("transform", "translate(80," + 30 + ")")
        .call(d3.axisTop(x_hbar))
        .selectAll("text")
        .style("text-anchor", "end");;

    svg.append("g")
        .attr("class", "y_hbar_axis")
        .attr("transform", "translate(80," + 0 + ")")
        .call(d3.axisLeft(y_hbar));

    svg.selectAll(".horizontal_bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "horizontal_bar")
        .attr("x", 80)
        .attr('fill', 'steelblue')
        .attr("height", y_hbar.bandwidth())
        .attr("y", function (d) {
            return y_hbar(d.key);
        })
        .attr("width", function (d) {
            return x_hbar(d.value);
        })
        .on("mousemove", function (d) {
            tooltip_bar
                .style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY - 70 + "px")
                .style("display", "inline-block")
                .html((d.key) + "<br>" + (d.value));
            d3.select(this).style('fill', '#F4A7B9');
        })
        .on("mouseout", function (d) {
            tooltip_bar.style("display", "none");
            d3.selectAll(".horizontal_bar").style('fill', 'steelblue')
        });

    svg.append("text")
        .attr("x", (width_hbar / 2))
        .attr("y", 0 - (margin_hbar.top / 2) + 10)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Types of accidents in " + clickItem);

}

drawMap();