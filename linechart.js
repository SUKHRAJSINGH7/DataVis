const margin = { top: 20, right: 30, bottom: 60, left: 80 },
  width = 800 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

const svg = d3
  .select("#tuition-line-chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const url =
  "https://gist.githubusercontent.com/SUKHRAJSINGH7/7f5d90ec163331753a83dfec5d178efe/raw/c8d5254f8cd1e23ba4870534c5aca217180e95dc/Tuition.csv";

d3.csv(url)
  .then((data) => {
    data.forEach((d) => {
      d.all_institutions = +d.all_institutions;
    });

    const x = d3
      .scalePoint()
      .domain(data.map((d) => d.year))
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.all_institutions) * 0.95,
        d3.max(data, (d) => d.all_institutions) * 1.05,
      ])
      .range([height, 0]);

    // X Axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3.axisBottom(x).tickValues(x.domain().filter((_, i) => i % 5 === 0))
      )
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Y Axis
    svg.append("g").call(d3.axisLeft(y));

    // Axis Labels
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + 50)
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .text("Year");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -50)
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .text("Tuition Amount ($)");

    // Line generator
    const line = d3
      .line()
      .x((d) => x(d.year))
      .y((d) => y(d.all_institutions));

    // Path for line
    const path = svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Animate the line drawing
    const totalLength = path.node().getTotalLength();
    path
      .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(2000)
      .ease(d3.easeCubic)
      .attr("stroke-dashoffset", 0);

    // Tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background", "#fff")
      .style("border", "1px solid #ccc")
      .style("padding", "8px")
      .style("pointer-events", "none")
      .style("font-size", "18px");

    // Hover interaction
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("mousemove", function (event) {
        const [mouseX] = d3.pointer(event, this);
        const x0 = x
          .domain()
          .reduce((prev, curr) =>
            Math.abs(x(curr) - mouseX) < Math.abs(x(prev) - mouseX)
              ? curr
              : prev
          );
        const d = data.find((d) => d.year === x0);

        if (d) {
          tooltip
            .style("opacity", 0.9)
            .html(
              `<strong>Year:</strong> ${
                d.year
              }<br><strong>Tuition:</strong> $${d.all_institutions.toLocaleString()}`
            )
            .style("left", event.pageX + 15 + "px")
            .style("top", event.pageY - 30 + "px");
        }
      })
      .on("mouseout", function () {
        tooltip.transition().duration(300).style("opacity", 0);
      });
  })
  .catch((error) => {
    console.error("Error loading or processing the CSV:", error);
  });
