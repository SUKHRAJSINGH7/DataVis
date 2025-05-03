(() => {
  const width = 800; // Bigger width
  const height = 600; // Taller for better label space

  const svg = d3
    .select("#american-debt-donut")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(0,0)");

  const color = d3.scaleOrdinal(d3.schemeTableau10);

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

  const url =
    "https://gist.githubusercontent.com/SUKHRAJSINGH7/2ff8636eab872761fdc8f6ee268a311a/raw/d31c72c487df34cd91528d6dc40c49d0aeeda401/AmericanDebt.csv";

  d3.csv(url).then((data) => {
    data.forEach((d) => {
      d.Average_Balance_2023_Q3 = +d.Average_Balance_2023_Q3;
    });

    const root = d3
      .hierarchy({
        name: "Total Debt",
        children: data.map((d) => ({
          name: d.Debt_Type,
          value: d.Average_Balance_2023_Q3,
          total: d.Total_Balance_2024_Q1,
        })),
      })
      .sum((d) => d.value);

    d3.treemap().size([width, height]).paddingInner(5)(
      // More space between boxes
      root
    );

    const nodes = svg
      .selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

    nodes
      .append("rect")
      .attr("width", 0)
      .attr("height", 0)
      .attr("fill", (d) => color(d.data.name))
      .transition()
      .duration(800)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0);

    // Zoom on hover
    nodes
      .on("mouseover", function (event, d) {
        tooltip.transition().duration(200).style("opacity", 0.95);
        tooltip
          .html(
            `<strong>${d.data.name}</strong><br>
         Avg Balance: $${d.data.value.toLocaleString()}<br>
         Total: ${d.data.total}`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 30 + "px");

        d3.select(this)
          .select("rect")
          .transition()
          .duration(200)
          .attr("transform", "scale(1.05)")
          .attr("stroke", "#333")
          .attr("stroke-width", 2);
      })
      .on("mouseout", function () {
        tooltip.transition().duration(200).style("opacity", 0);

        d3.select(this)
          .select("rect")
          .transition()
          .duration(200)
          .attr("transform", "scale(1)")
          .attr("stroke", "none");
      });

    nodes
      .append("text")
      .attr("x", 5)
      .attr("y", 20)
      .text((d) => d.data.name)
      .attr("fill", "#fff")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", (d) => {
        const boxWidth = d.x1 - d.x0;
        const boxHeight = d.y1 - d.y0;
        return boxWidth > 70 && boxHeight > 30 ? 1 : 0;
      });
  });
})();
