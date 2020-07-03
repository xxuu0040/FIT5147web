const margin_total = {
        top: 20,
        right: 20,
        bottom: 70,
        left: 40
    },
    width_total = 650 - margin_total.left - margin_total.right,
    height_total = 500 - margin_total.top - margin_total.bottom;

// set the svg
var total_svg = d3.select("#type-total").append('svg')
    .attr("id", "total_svg")
    .attr('width', width_total + margin_total.left + margin_total.right)
    .attr('height', height_total + margin_total.top + margin_total.bottom)
    .append('g')
    .attr('transform', 'translate(' + 90 + ',' + 30 + ")");

var top_svg = d3.select("#top-type").append('svg')
    .attr("id", "top_svg")
    .attr('width', width_total + margin_total.left + margin_total.right)
    .attr('height', height_total + margin_total.top + margin_total.bottom)
    .append('g')
    .attr('transform', 'translate(' + 40 + ',' + 30 + ")");

var tooltip_total = d3.select('#tool_bar');
var crash_totalType;

// draw the bar chart
function drawTotalBar(data, svg) {
    let x_bar = d3.scaleLinear().range([0, width_total - 160]);
    let y_bar = d3.scaleBand().range([height_total, 30]);

    data.sort(function (a, b) {
        return a.value - b.value;
    });

    // set x,y
    x_bar.domain([0, d3.max(data, function (d) {
        return d.value;
    })]);
    y_bar.domain(data.map(function (d) {
        return d.key;
    })).padding(0.3);

    // x axis
    svg.append("g")
        .attr("class", "x_bar_axis")
        .attr("transform", "translate(80," + 30 + ")")
        .call(d3.axisTop(x_bar))
        .selectAll("text")
        .style("text-anchor", "end");;

    // y axis
    svg.append("g")
        .attr("class", "y_bar_axis")
        .attr("transform", "translate(80," + 0 + ")")
        .call(d3.axisLeft(y_bar));

    svg.selectAll(".horizontal_bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "horizontal_bar")
        .attr("x", 80)
        .attr('fill', 'steelblue')
        .attr("height", y_bar.bandwidth())
        .attr("y", function (d) {
            return y_bar(d.key);
        })
        .attr("width", function (d) {
            return x_bar(d.value);
        })
        .on("mousemove", function (d) {
            tooltip_total
                .style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY - 70 + "px")
                .style("display", "inline-block")
                .html((d.key) + "<br>" + (d.value));
            d3.select(this).style("fill", "#F4A7B9");
        })
        .on("mouseout", function (d) {
            tooltip_total.style("display", "none");
            d3.selectAll(".horizontal_bar").style('fill', 'steelblue');
        })
        .on('click', clickBar);

    // title label
    svg.append("text")
        .attr("x", (width_total / 2))
        .attr("y", 0 - (margin_total.top / 2) + 10)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Total Types of accidents in vic");
}

// draw bar chart
function drawBars(data, svg, type) {
    let x_bar = d3.scaleBand().range([0, width_total - 160]).padding(0.3);
    let y_bar = d3.scaleLinear().range([height_total, 30]);

    // set x,y
    x_bar.domain(data.map(function (d) {
        return d.LGA_NAME;
    }));
    y_bar.domain([0, d3.max(data, function (d) {
        return d.value;
    })]);

    svg.selectAll(".typebar")
        .data(data)
        .enter().append("rect")
        .filter(function (d) {
            return d.type === type
        })
        .attr("class", "typebar")
        .style('fill', 'steelblue')
        .attr("x", function (d) {
            return x_bar(d.LGA_NAME);
        })
        .attr("width", x_bar.bandwidth())
        .attr("y", function (d) {
            return y_bar(d.value);
        })
        .attr("height", function (d) {
            return height_total - y_bar(d.value);
        })
        .on("mouseover", function (d) {
            tooltip_his.attr("class", "bar-tip")
                .style("left", d3.event.pageX + 30 + "px")
                .style("top", d3.event.pageY - 10 + "px")
                .style("display", "inline-block")
                .html(d.LGA_NAME + '<br>' + "Accidents: " + (d.value));
            d3.select(this).style("fill", "pink");
        })
        .on("mouseout", function (d) {
            tooltip_his.style("display", "none");
            d3.selectAll(".typebar").style('fill', 'steelblue');
        });

    // x axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height_total + ")")
        .call(d3.axisBottom(x_bar))

    // y axis
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y_bar))

    // title of the graph
    svg.append("text")
        .attr("x", (width_total / 2))
        .attr("y", 0 - (margin_total.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Number of accidents in " + type);

    // y-axis label
    svg.append("text")
        .attr('class', 'ytitle')
        .attr("transform", "rotate(-90)")
        .attr("y", 4)
        .attr("dy", ".75em")
        .style("fill", '#9f0000')
        .style("text-anchor", "end")
        .style("font-family", '"Lato", sans-serif')
        .style("font-size", "12px")
        .text("Number of Accidents");

    // x-axis label
    svg.append("text")
        .attr('class', 'xtitle')
        .attr("x", width_line - 280)
        .attr("y", height_line - 6)
        .style("text-anchor", "end")
        .style("font-family", '"Lato", sans-serif')
        .style("font-size", "12px")
        .style("fill", '#9f0000')
        .text("LGA");
}

// update the bar chart
function updateTypeBar() {
    d3.selectAll("#top_svg").remove();
    top_svg = d3.select("#top-type").append('svg')
        .attr("id", "top_svg")
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + 40 + ',' + 30 + ")");
}

// load the data
d3.csv("./data/Crashes_Last_Five_Years.csv").get(function (data) {
    crash_totalType = d3.nest()
        .key(function (d) {
            return d.ACCIDENT_TYPE;
        })
        .rollup(function (v) {
            return d3.sum(v, function (d) {
                return d.index;
            })
        })
        .entries(data);
    drawTotalBar(crash_totalType, total_svg);
})

// click the bar
function clickBar(d) {
    let clickItem = d.key;
    updateTypeBar();
    updateTypeValue(clickItem);
}

// update the value of bar chart
function updateTypeValue(type) {
    d3.csv('./data/top5type.csv').get(function (data) {
        let newData = data.filter(function (d) {
            return d.type === type;
        });
        updateTypeBar();
        drawBars(newData, top_svg, type);
    });
}