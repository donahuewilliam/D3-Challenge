// @TODO: YOUR CODE HERE!
var povertyXAxis = "poverty";
var healthcareYAxis = "healthcare";
// create scales
function xScale(data, povertyXAxis, chartWidth) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[povertyXAxis]) * .8,
            d3.max(data, d => d[povertyXAxis]) * 1.1])
        .range([0, chartWidth]);
    return xLinearScale;
}
// Create Xaxis and yaxis
function renderXAxes(newXScale, xAxis) {
    var rightAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(rightAxis);
    return xAxis;
}
function yScale(data, healthcareYAxis, chartHeight) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[healthcareYAxis]) * .8,
            d3.max(data, d => d[healthcareYAxis]) * 1.2])
        .range([chartHeight, 0]);
    return yLinearScale;
}
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}
// Function for updating circles 
function renderCircles(circlesGroup, newXScale, newYScale, povertyXAxis, healthcareYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[povertyXAxis]))
        .attr("cy", d => newYScale(d[healthcareYAxis]));
    return circlesGroup;
}
function renderText(circletextGroup, newXScale, newYScale, povertyXAxis, healthcareYAxis) {
    circletextGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[povertyXAxis]))
        .attr("y", d => newYScale(d[healthcareYAxis]));
    return circletextGroup;
}
// start tooltip.
function updateToolTip(povertyXAxis, healthcareYAxis, circlesGroup, textGroup) {
    if (povertyXAxis === "poverty") {
        var xlabel = "Poverty: ";
    } else if (povertyXAxis === "income") {
        var xlabel = "Average Income: "
    } else {
        var xlabel = "Age: "
    }
    if (healthcareYAxis === "healthcare") {
        var ylabel = "No Healthcare: ";
    } else if (healthcareYAxis === "smokes") {
        var ylabel = "Smokers: "
    } else {
        var ylabel = "Obesity: "
    }
    // Define tooltip.
    var toolTip = d3.tip()
        .offset([120, -60])
        .attr("class", "d3-tip")
        .html(function(d) {
            if (povertyXAxis === "age") {
                return (`${d.state}<hr>${xlabel} ${d[povertyXAxis]}<br>${ylabel}${d[healthcareYAxis]}%`);
                } else if (povertyXAxis !== "poverty" && povertyXAxis !== "age") {
                return (`${d.state}<hr>${xlabel}$${d[povertyXAxis]}<br>${ylabel}${d[healthcareYAxis]}%`);
                } else {
                return (`${d.state}<hr>${xlabel}${d[povertyXAxis]}%<br>${ylabel}${d[healthcareYAxis]}%`);
                }      
        });
    circlesGroup.call(toolTip);
    // Create "mouseover" event listener to display tool tip.
    circlesGroup
        .on("mouseover", function(data) {
            toolTip.show(data, this);
        })
        .on("mouseout", function(data) {
            toolTip.hide(data);
        });
    textGroup
        .on("mouseover", function(data) {
            toolTip.show(data, this);
        })
        .on("mouseout", function(data) {
            toolTip.hide(data);
        });
    return circlesGroup;
}
function makeResponsive() {
    // Select div by id.
    var svgArea = d3.select("#scatter").select("svg");
    // Clear SVG.
    if (!svgArea.empty()) {
        svgArea.remove();
    }
    //SVG params.
    var svgHeight = window.innerHeight/1.2;
    var svgWidth = window.innerWidth/1.7;
    // Margins.
    var margin = {
        top: 50,
        right: 50,
        bottom: 100,
        left: 80
    };
    // Chart area minus margins.
    var chartHeight = svgHeight - margin.top - margin.bottom;
    var chartWidth = svgWidth - margin.left - margin.right;
    // Create an SVG wrapper, append an SVG group that will hold our chart,
    // and shift the latter by left and top margins.
    var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);
    // Append an SVG group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    d3.csv("assets/data/data.csv").then(function(demoData, err) {
        if (err) throw err;
        // Parse data.
        demoData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
        });
        // Create x/y linear scales.
        var xLinearScale = xScale(demoData, povertyXAxis, chartWidth);
        var yLinearScale = yScale(demoData, healthcareYAxis, chartHeight);
        // Create initial axis functions.
        var rightAxis =d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);
        // Append x axis.
        var xAxis = chartGroup.append("g")
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(rightAxis);
        // Append y axis.
        var yAxis = chartGroup.append("g")
            .call(leftAxis);
        // Set data used for circles.
        var circlesGroup = chartGroup.selectAll("circle")
            .data(demoData);
        // Bind data.
        var enterBot = circlesGroup.enter();
        // Create circles.
        var circle = enterBot.append("circle")
            .attr("cx", d => xLinearScale(d[povertyXAxis]))
            .attr("cy", d => yLinearScale(d[healthcareYAxis]))
            .attr("r", 15)
            .classed("stateCircle", true);
        // Create circle text.
        var circleText = enterBot.append("text")            
            .attr("x", d => xLinearScale(d[povertyXAxis]))
            .attr("y", d => yLinearScale(d[healthcareYAxis]))
            .attr("dy", ".35em") 
            .text(d => d.abbr)
            .classed("stateText", true);
        // Update tool tip function above csv import.
        var circlesGroup = updateToolTip(povertyXAxis, healthcareYAxis, circle, circleText);
        // Add x label groups and labels.
        var xLabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);
        var povertyLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") 
            .classed("active", true)
            .text("Poverty Percentage");
        // Add y labels group and labels.
        var yLabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)");
        var healthcareLabel = yLabelsGroup.append("text")
            .attr("x", 0 - (chartHeight / 2))
            .attr("y", 40 - margin.left)
            .attr("dy", "1em")
            .attr("value", "healthcare")
            .classed("active", true)
            .text("No Healthcare Percentage");
        xLabelsGroup.selectAll("text")
            .on("click", function() {
                // Grab selected label.
                povertyXAxis = d3.select(this).attr("value");
                // Update xLinearScale.
                xLinearScale = xScale(demoData, povertyXAxis, chartWidth);
                // Render xAxis.
                xAxis = renderXAxes(xLinearScale, xAxis);
                // Switch active/inactive labels.
                if (povertyXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                } else if (povertyXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            });
        // Make Y labeles
        yLabelsGroup.selectAll("text")
            .on("click", function() {
                healthcareYAxis = d3.select(this).attr("value");
                yLinearScale = yScale(demoData, healthcareYAxis, chartHeight);
                yAxis = renderYAxes(yLinearScale, yAxis);
                if (healthcareYAxis === "healthcare") {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                } else if (healthcareYAxis === "smokes"){
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                circle = renderCircles(circlesGroup, xLinearScale, yLinearScale, povertyXAxis, healthcareYAxis);
                circleText = renderText(circleText, xLinearScale, yLinearScale, povertyXAxis, healthcareYAxis);
                circlesGroup = updateToolTip(povertyXAxis, healthcareYAxis, circle, circleText);
            });
    }).catch(function(err) {
        console.log(err);
    });
}
makeResponsive();
d3.select(window).on("resize", makeResponsive);