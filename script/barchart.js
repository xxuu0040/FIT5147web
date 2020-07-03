const margin = {
        top: 20,
        right: 20,
        bottom: 70,
        left: 40
    },
    width = 650 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// set the svg
var his_svg1 = d3.select("#histogram1").append('svg')
    .attr("id", "bar_svg1")
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + 40 + ',' + 30 + ")");

var hig_svg2 = d3.select("#histogram2").append('svg')
    .attr("id", "bar_svg2")
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + 40 + ',' + 30 + ")");

//set the x,y and tooltip
let x_bar = d3.scaleBand().range([0, width]).padding(0.1);
let y_bar = d3.scaleLinear().range([height, 0]);
const tooltip_his = d3.select("#tool_bar");
var crash_his;

//draw the bar chart
function drawBarChart(data, svg, name) {
    x_bar.domain(data.map(function (d) {
        return d.key;
    }));
    y_bar.domain([0, d3.max(data, function (d) {
        return d.value;
    })]);

    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .style('fill', 'steelblue')
        .attr("x", function (d) {
            return x_bar(d.key);
        })
        .attr("width", x_bar.bandwidth())
        .attr("y", function (d) {
            return y_bar(d.value);
        })
        .attr("height", function (d) {
            return height - y_bar(d.value);
        })
        .on("mouseover", function (d) {
            tooltip_his.attr("class", "bar-tip")
                .style("left", d3.event.pageX + 30 + "px")
                .style("top", d3.event.pageY - 10 + "px")
                .style("display", "inline-block")
                .html("Hour: " + (d.key) + '<br>' + "Accidents: " + (d.value));
            d3.select(this).style("fill", "#F4A7B9");
        })
        .on("mouseout", function (d) {
            tooltip_his.style("display", "none");
            d3.selectAll(".bar").style('fill', 'steelblue')
        });

    // x axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x_bar))

    // y axis
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y_bar))

    //title label
    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Number of accidents in " + name);

    // y-axis label
    svg.append("text")
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
    svg.append("text")
        .attr('class', 'xtitle')
        .attr("x", width_line - 200)
        .attr("y", height_line - 6)
        .style("text-anchor", "start")
        .style("font-family", '"Lato", sans-serif')
        .style("font-size", "12px")
        .style("fill", '#9f0000')
        .text("Hour");
}

// update the bar chart
function updateHis(number) {
    if (number === '1') {
        d3.selectAll("#bar_svg1").remove();
        his_svg1 = d3.select("#histogram1").append('svg')
            .attr("id", "bar_svg1")
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + 40 + ',' + 30 + ")");
    } else {
        d3.selectAll("#bar_svg2").remove();
        hig_svg2 = d3.select("#histogram2").append('svg')
            .attr("id", "bar_svg2")
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + 40 + ',' + 30 + ")");
    }

}

// change the dropdown box
d3.selectAll('#barDropdown1').on('change', changeFirst);
d3.selectAll('#barDropdown2').on('change', changeSecond);

// load the data
function loadData(item, number) {
    let barValue;
    d3.csv("./data/Crashes_Last_Five_Years.csv").get(function (data) {
        crash_his = d3.nest()
            .key(function (d) {
                return d.DAY_OF_WEEK;
            })
            .key(function (d) {
                return d.hour;
            })
            .sortKeys(d3.ascending)
            .rollup(function (v) {
                return d3.sum(v, function (d) {
                    return d.index;
                })
            })
            .entries(data);

        crash_his.forEach(function (d) {
            if (d.key === item) {
                barValue = d.values
            }
        })
        if (number === '1') {
            drawBarChart(barValue, his_svg1, item);
        } else {
            drawBarChart(barValue, hig_svg2, item);
        }

    })
}

loadData('Monday', "1");
loadData('Saturday', "2");

// change the bar chart when select other options
function changeFirst() {
    let selectItem1 = document.getElementById('barDropdown1');
    let selectData1 = selectItem1.options[selectItem1.selectedIndex].value;
    updateHis("1");
    loadData(selectData1, "1");
}

function changeSecond() {
    let selectItem2 = document.getElementById('barDropdown2');
    let selectData2 = selectItem2.options[selectItem2.selectedIndex].value;
    updateHis('2');
    loadData(selectData2, '2');
}