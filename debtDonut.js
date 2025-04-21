(() => {
  const width = 600;
  const height = 600;
  const radius = Math.min(width, height) / 2;

  const svg = d3
    .select("#american-debt-donut")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  const color = d3.scaleOrdinal(d3.schemeTableau10);

  const pie = d3.pie().value((d) => d.Average_Balance_2023_Q3);

  const arc = d3
    .arc()
    .innerRadius(radius * 0.6)
    .outerRadius(radius * 0.9);

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

    const arcs = pie(data);

    svg
      .selectAll("path")
      .data(arcs)
      .join("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data.Debt_Type))
      .on("mouseover", function (event, d) {
        tooltip.transition().duration(200).style("opacity", 0.95);
        tooltip
          .html(
            `<strong>${d.data.Debt_Type}</strong><br>
               Avg Balance: $${d.data.Average_Balance_2023_Q3.toLocaleString()}<br>
               Total: ${d.data.Total_Balance_2024_Q1}`
          )
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 28 + "px");
        d3.select(this).attr("stroke", "#333").attr("stroke-width", 2);
      })
      .on("mouseout", function () {
        tooltip.transition().duration(200).style("opacity", 0);
        d3.select(this).attr("stroke", "none");
      });

    // Add labels inside the donut
    svg
      .selectAll("text")
      .data(arcs)
      .join("text")
      .text((d) => d.data.Debt_Type)
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .style("text-anchor", "middle")
      .style("font-size", "11px");
  });
})();
