// Dimension of the whole chart. Only one size since it has to be square
const correlation_margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
    },
    correlation_size = 640 - correlation_margin.left - correlation_margin.right

// Create the svg area
const svg_cor = d3.select("#correlation")
    .append("svg")
    .attr("width", correlation_size + correlation_margin.left + correlation_margin.right)
    .attr("height", correlation_size + correlation_margin.top + correlation_margin.bottom)
    .append("g")
    .attr("transform", "translate(" + correlation_margin.left + "," + correlation_margin.top + ")");

d3.csv("./data/pairplot.csv").get(function (data) {
    // What are the numeric variables in this dataset? How many do I have
    const allVar = ['Accident', "Population", "Vehicle number", "number of commuters"]
    const numVar = allVar.length

    // compute the size of a single chart
    mar = 20

    // Create a scale: gives the position of each pair each variable
    const cor_position = d3.scalePoint()
        .domain(allVar)
        .range([0, correlation_size - correlation_size / numVar])

    // ------------------------------- //
    // Add charts
    // ------------------------------- //
    for (i in allVar) {
        for (j in allVar) {

            // Get current variable name
            let var1 = allVar[i]
            let var2 = allVar[j]

            // If var1 == var2 i'm on the diagonal, skip that
            if (var1 === var2) {
                continue;
            }

            // Add X Scale of each graph
            xextent = d3.extent(data, function (d) {
                return +d[var1]
            })
            const x_cor = d3.scaleLinear()
                .domain(xextent).nice()
                .range([0, correlation_size / numVar - 2 * mar]);

            // Add Y Scale of each graph
            yextent = d3.extent(data, function (d) {
                return +d[var2]
            })
            const y_cor = d3.scaleLinear()
                .domain(yextent).nice()
                .range([correlation_size / numVar - 2 * mar, 0]);

            // Add a 'g' at the right position
            var tmp = svg_cor
                .append('g')
                .attr("transform", "translate(" + (cor_position(var1) + mar) + "," + (cor_position(var2) + mar) + ")");

            // Add X and Y axis in tmp
            tmp.append("g")
                .attr("transform", "translate(" + 0 + "," + (correlation_size / numVar - mar * 2) + ")")
                .call(d3.axisBottom(x_cor).ticks(3));
            tmp.append("g")
                .call(d3.axisLeft(y_cor).ticks(3));

            // Add circle
            tmp
                .selectAll("myCircles")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function (d) {
                    return x_cor(+d[var1])
                })
                .attr("cy", function (d) {
                    return y_cor(+d[var2])
                })
                .attr("r", 3)
                .attr("fill", '#8FD175')
        }
    }


    // ------------------------------- //
    // Add variable names = diagonal
    // ------------------------------- //
    for (i in allVar) {
        for (j in allVar) {
            // If var1 == var2 i'm on the diagonal, otherwise skip
            if (i != j) {
                continue;
            }
            // Add text
            let var1 = allVar[i]
            let var2 = allVar[j]
            console.log(var1);
            svg_cor
                .append('g')
                .attr("transform", "translate(" + cor_position(var1) + "," + cor_position(var2) + ")")
                .append('text')
                .attr("x", correlation_size / numVar / 2)
                .attr("y", correlation_size / numVar / 2)
                .text(var1)
                .attr("text-anchor", "middle")

        }
    }


})