(() => {
  // Set chart dimensions and margins
  const margin = { top: 20, right: 80, bottom: 70, left: 80 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Create SVG canvas and main group
  const svg = d3
    .select("#tuition-line-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // CSV data URL
  const dataURL =
    "https://gist.githubusercontent.com/SUKHRAJSINGH7/7f5d90ec163331753a83dfec5d178efe/raw/c8d5254f8cd1e23ba4870534c5aca217180e95dc/Tuition.csv";

  // Load and process the data
  d3.csv(dataURL)
    .then((data) => {
      // Convert string values to numbers
      data.forEach((d) => {
        d.all_institutions = +d.all_institutions;
      });

      // Set up x and y scales
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

      // Draw x-axis
      svg
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(
          d3.axisBottom(x).tickValues(x.domain().filter((_, i) => i % 5 === 0))
        )
        .selectAll("text")
        .attr("text-anchor", "middle");

      // Draw y-axis
      svg.append("g").attr("class", "y-axis").call(d3.axisLeft(y));

      // Add axis labels
      svg
        .append("text")
        .attr("class", "x-label")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Year");

      svg
        .append("text")
        .attr("class", "y-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Tuition Amount ($)");

      // Define line generator
      const line = d3
        .line()
        .x((d) => x(d.year))
        .y((d) => y(d.all_institutions));

      // Draw the line path
      const path = svg
        .append("path")
        .datum(data)
        .attr("class", "tuition-line")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);

      // Animate line drawing
      const totalLength = path.node().getTotalLength();
      path
        .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(2000)
        .ease(d3.easeCubic)
        .attr("stroke-dashoffset", 0);

      // Create tooltip
      const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tuition-tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "#fff")
        .style("border", "1px solid #ccc")
        .style("padding", "8px")
        .style("pointer-events", "none")
        .style("font-size", "14px")
        .style("transition", "opacity 0.3s ease");

      // Add invisible overlay for mouse tracking
      svg
        .append("rect")
        .attr("class", "overlay-rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("mousemove", function (event) {
          const [mouseX] = d3.pointer(event, this);

          // Find the closest year to the mouse x position
          const closestYear = x.domain().reduce((prev, curr) => {
            return Math.abs(x(curr) - mouseX) < Math.abs(x(prev) - mouseX)
              ? curr
              : prev;
          });

          const d = data.find((d) => d.year === closestYear);

          if (d) {
            tooltip
              .style("opacity", 0.9)
              .html(
                `
              <strong>Year:</strong> ${d.year}<br>
              <strong>Tuition:</strong> $${d.all_institutions.toLocaleString()}
            `
              )
              .style("left", `${event.pageX + 15}px`)
              .style("top", `${event.pageY - 30}px`);
          }
        })
        .on("mouseout", () => {
          tooltip.transition().duration(300).style("opacity", 0);
        });
    })
    .catch((error) => {
      console.error("Error loading or processing the CSV:", error);
    });
})();
