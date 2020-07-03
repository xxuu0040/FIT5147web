let centered;
const width_mapLine = 660,
    height_mapLine = 500;

const zoom = d3.zoom()
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


const svgMap = d3.select("#mt_data").append('svg')
    .attr('width', width_mapLine)
    .attr('height', height_mapLine)
    .attr('align', 'center')
    .call(zoom)
    .append('g')
    .attr('class', 'map');

const tooltip_map = d3.select('#tool_map');

const path = d3.geoPath();

let projection = d3.geoMercator()
    .scale(3000)
    .center([146, -37])
    .translate([width_mapLine / 2, height_mapLine / 2]);

const data = d3.map();
const colorScale = d3.scaleThreshold()
    .domain([0, 300, 600, 800, 1400, 2000, 2500])
    .range(d3.schemeReds[7]);

let x_map = d3.scaleLinear()
    .domain([5, 4500])
    .rangeRound([600, 860]);

// set the color degree label
let legend = svgMap.append("g")
    .attr("class", "key")
    .attr("id", "legend")
    .attr("transform", "translate(-240,40)");

legend.selectAll("rect")
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
        return colorScale(d[0]);
    });

legend.append("text")
    .attr("class", "caption")
    .attr("x", x_map.range()[0] + 135)
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "end")
    .attr("font-weight", "bold")
    .text("Accidents in vic (hundred)");

legend.call(d3.axisBottom(x_map)
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

// load data
d3.csv("./data/Crashes_Last_Five_Years.csv").get(function (crash) {

    const crashes = d3.nest()
        .key(function (d) {
            return d.LGA_NAME;
        })
        .rollup(function (v) {
            return d3.sum(v, function (d) {
                return d.index;
            })
        })
        .object(crash);

    d3.queue()
        .defer(d3.json,
            "https://data.gov.au/geoserver/vic-local-government-areas-psma-administrative-boundaries/wfs?request=GetFeature&typeName=ckan_bdf92691_c6fe_42b9_a0e2_a4cd716fa811&outputFormat=json")
        .await(ready);

    // draw the map
    function ready(error, topo) {
        svgMap.append('g')
            .attr("id", "map_LGA")
            .selectAll('path')
            .data(topo.features)
            .enter()
            .append("path")
            .attr('id', function (d) {
                return d.properties.vic_lga__3;
            })
            .attr("d", d3.geoPath().projection(projection))
            .attr("fill", function (d) {
                d.total = crashes[d.properties.vic_lga__3] || 0;
                return colorScale(d.total)
            })
            .style("stroke", "transparent")
            .style("opacity", .8)
            .on("mouseover", function (d) {
                tooltip_map.transition()
                    .duration(200)
                    .style('opacity', .9);
                tooltip_map.attr("class", "map-tip")
                    .style("left", d3.event.pageX + 78 + "px")
                    .style("top", d3.event.pageY - 28 + "px")
                    .style("display", "inline-block")
                    .html((d.properties.vic_lga__3) + '<br>' + (d.total));
                d3.select(this).style('opacity', 1.5);
            })
            .on("mouseout", function (d) {
                tooltip_map.style("display", "none");
                d3.selectAll('path').style("opacity", .8);
            })
            .on("click", clicked);
    }
})

// click the map
function clicked(d) {
    let x, y, k;

    if (d && centered !== d) {
        let centroid = path.centroid(d);
        x = centroid[0];
        y = centroid[1];
        k = 2;
        centered = d;
    } else {
        x = width_mapLine / 2;
        y = height_mapLine / 2;
        k = 1;
        centered = null;
    }

    svgMap.selectAll("path")
        .classed("active", centered && function (d) {
            return d === centered;
        });
}

d3.selectAll('#lineDropdown').on('change', changeLocation);

function zoomed() {
    svgMap.attr("transform", d3.event.transform);
}

// select other options of dropdown box
function changeLocation() {
    let selectItem = document.getElementById('lineDropdown');
    let selectData = selectItem.options[selectItem.selectedIndex].value;
    let location;
    switch (selectData) {
        case 'topAccident':
            location = topAccident;
            break;
        case 'topOut':
            location = topOut;
            break;
        case 'topPop':
            location = topPop;
            break;
        case 'topDensity':
            location = topDensity;
            break;
    }
    location.forEach(function (d) {
        let id = '#' + d;
        console.log(id);
        svgMap.selectAll('path').style('stroke-width', .9);
        svgMap.select(id).style('stroke-width', 1.9);
    })
}