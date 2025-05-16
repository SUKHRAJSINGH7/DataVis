(() => {
  // Define chart dimensions and margins
  const margin = { top: 10, right: 65, bottom: 5, left: 10 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Create SVG container
  const svg = d3
    .select("#american-debt-donut")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Set up color scale
  const color = d3.scaleOrdinal(d3.schemeTableau10);

  // Create a tooltip div
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
    .style("font-size", "14px");

  // CSV data URL
  const url =
    "https://gist.githubusercontent.com/SUKHRAJSINGH7/2ff8636eab872761fdc8f6ee268a311a/raw/bdde11f9b800a26713bdae54ee91fe44d6e98334/AmericanDebt.csv";

  // Load and process the data
  d3.csv(url).then((data) => {
    // Convert balance strings to numbers
    data.forEach((d) => {
      d.Average_Balance_2023_Q3 = +d.Average_Balance_2023_Q3;
    });

    // Create a hierarchical structure for treemap
    const root = d3
      .hierarchy({
        children: data.map((d) => ({
          name: d.Debt_Type,
          value: d.Average_Balance_2023_Q3,
          total: d.Total_Balance_2024_Q1,
        })),
      })
      .sum((d) => d.value);

    // Generate treemap layout
    d3.treemap().size([width, height]).paddingInner(5)(root);

    // Draw each treemap cell
    const nodes = svg
      .selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

    // Draw rectangle for each node
    nodes
      .append("rect")
      .attr("fill", (d) => color(d.data.name))
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0);

    // Mouse interactions
    nodes
      .on("mouseover", function (event, d) {
        tooltip.transition().duration(200).style("opacity", 0.95);
        tooltip
          .html(
            `
          <strong>${d.data.name}</strong><br>
          Avg Balance: $${d.data.value.toLocaleString()}<br>
          Total: ${d.data.total}
        `
          )
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 30}px`);

        d3.select(this)
          .select("rect")
          .attr("stroke", "#333")
          .attr("stroke-width", 2);
      })
      .on("mouseout", function () {
        tooltip.transition().duration(200).style("opacity", 0);
        d3.select(this).select("rect").attr("stroke", "none");
      });

    // Add text labels if there's enough space
    nodes
      .append("text")
      .attr("x", 5)
      .attr("y", 20)
      .text((d) => d.data.name)
      .attr("fill", "#fff")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", (d) => {
        const w = d.x1 - d.x0,
          h = d.y1 - d.y0;
        return w > 70 && h > 30 ? 1 : 0;
      });
  });
})();
