var margin_line = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 50
    },
    width_line = 560 - margin_line.left - margin_line.right,
    height_line = 500 - margin_line.top - margin_line.bottom;

// append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg_line = d3.select("#lines").append("svg")
    .attr('class', 'line-chart')
    .attr("width", width_line + margin_line.left + margin_line.right)
    .attr("height", height_line + margin_line.top + margin_line.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin_line.left + "," + margin_line.top + ")");


function drawLines(data) {
    // set the ranges
    let x = d3.scaleLinear().range([0, width_line]);
    let y = d3.scaleLinear().range([height_line, 0]);
    let color_line = d3.scaleOrdinal(d3.schemeCategory10);

    // define the color
    color_line.domain(d3.keys(data[0]).filter(function (key) {
        return key !== "year";
    }))

    // process the data
    let originData = color_line.domain().map(function (name) {
        return {
            name: name,
            values: data.map(function (d) {
                return {
                    year: d.year,
                    number: +d[name]
                };
            })
        };
    });

    // define the line
    const lines = d3.line()
        .curve(d3.curveBasis)
        .x(d => x(d.year))
        .y(d => y(d.number));
    // Scale the range of the data
    x.domain(d3.extent(data, function (d) {
        return d['year'];
    }));

    y.domain([
        d3.min(originData, function (c) {
            return d3.min(c.values, function (v) {
                return v.number;
            });
        }),
        d3.max(originData, function (c) {
            return d3.max(c.values, function (v) {
                return v.number;
            });
        })
    ]);

    // set legend
    const legend = svg_line.selectAll('g')
        .data(originData)
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr("transform", "translate(" + -100 + "," + 0 + ")");

    // legend color value     
    legend.append('rect')
        .attr("class", "legendColor")
        .attr('x', width_line - 20)
        .attr('y', function (d, i) {
            return i * 20;
        })
        .attr('width', 10)
        .attr('height', 10)
        .style('fill', function (d) {
            return color_line(d.name);
        });

    // legend words
    legend.append('text')
        .attr("class", "legendText")
        .attr("font-size", "10px")
        .attr('x', width_line - 8)
        .attr('y', function (d, i) {
            return (i * 20) + 9;
        })
        .text(function (d) {
            return d.name;
        });

    // Add the X Axis
    svg_line.append("g")
        .attr("class", "xaxis")
        .attr("transform", "translate(0," + height_line + ")")
        .call(d3.axisBottom(x).ticks(6));

    // Add the Y Axis
    svg_line.append("g")
        .attr("class", "yxais")
        .call(d3.axisLeft(y))
        .style("text-anchor", "end");

    // y axis label 
    svg_line.append("text")
        .attr('class', 'ytitle')
        .attr("transform", "rotate(-90)")
        .attr("y", 8)
        .attr("dy", ".75em")
        .style("fill", '#9f0000')
        .style("text-anchor", "end")
        .style("font-family", '"Lato", sans-serif')
        .style("font-size", "12px")
        .text("Number of Accidents");

    // x-axis label
    svg_line.append("text")
        .attr('class', 'xtitle')
        .attr("x", width_line)
        .attr("y", height_line - 6)
        .style("text-anchor", "end")
        .style("font-family", '"Lato", sans-serif')
        .style("font-size", "12px")
        .style("fill", '#9f0000')
        .text("Year");

    let accidents = svg_line.selectAll(".accident")
        .data(originData)
        .enter().append("g")
        .attr("class", "accident")

    accidents.append("path")
        .attr("class", "line")
        .attr("d", function (d) {
            return lines(d.values);
        })
        .style("stroke", function (d) {
            return color_line(d.name);
        });


    // mouse interaction 
    let mouseG = svg_line.append("g")
        .attr("class", "mouse-over-effects");

    // this is the black vertical line to follow mouse
    mouseG.append("path")
        .attr("class", "mouse-line")
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .style("opacity", "0");

    // variable to get class of current mouse 
    let current_lines = document.getElementsByClassName('line');

    let mousePerLine = mouseG.selectAll('.mouse-per-line2')
        .data(originData)
        .enter()
        .append("g")
        .attr("class", "mouse-per-line2");

    // add circle at point of hover 
    mousePerLine.append("circle")
        .attr('class', 'a')
        .attr("r", 7)
        .style("stroke", function (d) {
            return color_line(d.name);
        })
        .style("fill", "none")
        .style("stroke-width", "1px")
        .style("opacity", "0");

    // add text at point of hover 
    mousePerLine.append("text")
        .attr('class', 'b')
        .attr("transform", "translate(10,3)");

    // append rect to catch mouse movements on canvas
    // because cant catch mouse events on a g element
    mouseG.append('svg:rect')
        .attr('width', width_line)
        .attr('height', height_line)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mouseout', function () { // on mouse out hide line, circles and text
            d3.select(".mouse-line")
                .style("opacity", "0");
            d3.selectAll(".mouse-per-line2 circle").filter('.a')
                .style("opacity", "0");
            d3.selectAll(".mouse-per-line2 text").filter('.b')
                .style("opacity", "0");
        })
        .on('mouseover', function () { // on mouse in show line, circles and text
            d3.select(".mouse-line")
                .style("opacity", "1");
            d3.selectAll(".mouse-per-line2 circle").filter('.a')
                .style("opacity", "1");
            d3.selectAll(".mouse-per-line2 text").filter('.b')
                .style("opacity", "1");
        })
        .on('mousemove', function () { // mouse moving over canvas
            let mouse = d3.mouse(this);
            d3.select(".mouse-line")
                .attr("d", function () {
                    let d = "M" + mouse[0] + "," + height_line;
                    d += " " + mouse[0] + "," + 0;
                    return d;
                });

            // find the actual values as mouse hovers over, using a invert technic 
            d3.selectAll(".mouse-per-line2")
                .attr("transform", function (d, i) {
                    bisect = d3.bisector(function (d) {
                        return d.number;
                    }).left;

                    let beginning = 0,
                        end = current_lines[i].getTotalLength(),
                        target = null;

                    while (true) {
                        target = Math.floor((beginning + end) / 2);
                        pos = current_lines[i].getPointAtLength(target);
                        if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                            break;
                        }
                        if (pos.x > mouse[0]) end = target;
                        else if (pos.x < mouse[0]) beginning = target;
                        else break; //position found
                    }

                    d3.select(this).select('text')
                        .text(Math.round(y.invert(pos.y)));

                    return "translate(" + mouse[0] + "," + pos.y + ")";
                });
        });

    // function for invert scaleBand 
    function scaleBandInvert(scale) {
        let domain = scale.domain();
        let paddingOuter = scale(domain[0]);
        let eachBand = scale.step();
        return function (value) {
            let index = Math.floor(((value - paddingOuter) / eachBand));
            return domain[Math.max(0, Math.min(index, domain.length - 1))];
        }
    }


}

// update the line chart
function updateLine() {
    d3.selectAll('.line-chart').remove();
    svg_line = d3.select("#lines").append("svg")
        .attr('class', 'line-chart')
        .attr("width", width_line + margin_line.left + margin_line.right)
        .attr("height", height_line + margin_line.top + margin_line.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin_line.left + "," + margin_line.top + ")");
}


d3.selectAll('#lineDropdown').on('change', change);

// Get the data
function getLineData(file) {
    d3.csv(file, function (error, data) {
        if (error) throw error;
        // trigger render
        drawLines(data);
    });
}

getLineData('./data/top5accident.csv');

// change the line chart based on the dropdown box
function change() {
    let selectItem = document.getElementById('lineDropdown');
    let selectData = selectItem.options[selectItem.selectedIndex].value;
    let fileName;
    switch (selectData) {
        case 'topAccident':
            fileName = './data/top5accident.csv';
            break;
        case 'topOut':
            fileName = './data/top5outer.csv';
            break;
        case 'topPop':
            fileName = './data/top5pop.csv';
            break;
        case 'topDensity':
            fileName = './data/top5density.csv';
            break;
    }
    updateLine();
    getLineData(fileName);
}