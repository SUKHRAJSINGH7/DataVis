(() => {
  const margin = { top: 20, right: 30, bottom: 60, left: 80 },
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  const svg = d3
    .select("#debt-bar-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom + 40)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const url =
    "https://gist.githubusercontent.com/SUKHRAJSINGH7/70f8a7a5b3f6e73fe29822a79cb06b10/raw/b7cbb227f29392ca11ca86fd6dd882141986cd5d/debt.csv";

  d3.csv(url).then((data) => {
    data = data.reverse(); // latest year on the left

    data.forEach((d) => {
      d["Undergraduate Debt (Billions USD)"] =
        +d["Undergraduate Debt (Billions USD)"];
      d["Graduate Debt (Billions USD)"] = +d["Graduate Debt (Billions USD)"];
    });

    const subgroups = [
      "Undergraduate Debt (Billions USD)",
      "Graduate Debt (Billions USD)",
    ];
    const years = data.map((d) => d.Year);

    const x = d3.scaleBand().domain(years).range([0, width]).padding(0.2);
    const xSubgroup = d3
      .scaleBand()
      .domain(subgroups)
      .range([0, x.bandwidth()])
      .padding(0.05);
    const y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(data, (d) => Math.max(d[subgroups[0]], d[subgroups[1]])) * 1.1,
      ])
      .range([height, 0]);

    const color = d3
      .scaleOrdinal()
      .domain(subgroups)
      .range(["#1f77b4", "#ff7f0e"]);

    // Axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3.axisBottom(x).tickValues(x.domain().filter((_, i) => i % 2 === 0))
      )
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg.append("g").call(d3.axisLeft(y));

    // Axis Labels
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + 50)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .text("Year");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -60)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .text("Debt Amount (Billions USD)");

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
      .style("font-size", "13px")
      .style("transition", "opacity 0.3s ease");

    // Bars with animation and hover effect
    const barGroups = svg
      .append("g")
      .selectAll("g")
      .data(data)
      .join("g")
      .attr("transform", (d) => `translate(${x(d.Year)},0)`);

    barGroups
      .selectAll("rect")
      .data((d) =>
        subgroups.map((key) => ({ key, value: d[key], year: d.Year }))
      )
      .join("rect")
      .attr("x", (d) => xSubgroup(d.key))
      .attr("y", height) // Start bars at the bottom
      .attr("width", xSubgroup.bandwidth())
      .attr("height", 0)
      .attr("fill", (d) => color(d.key))
      .on("mouseover", function (event, d) {
        tooltip.transition().duration(200).style("opacity", 0.95);
        tooltip
          .html(
            `<strong>Year:</strong> ${d.year}<br>
             <strong>Type:</strong> ${d.key}<br>
             <strong>Debt:</strong> $${d.value}B`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 30 + "px");

        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill", d3.rgb(color(d.key)).darker(1));
      })
      .on("mouseout", function (event, d) {
        tooltip.transition().duration(200).style("opacity", 0);
        d3.select(this).transition().duration(200).attr("fill", color(d.key));
      })
      .transition()
      .duration(1500)
      .attr("y", (d) => y(d.value))
      .attr("height", (d) => height - y(d.value));

    // Legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - 200}, -10)`)
      .style("opacity", 0);

    subgroups.forEach((key, i) => {
      const g = legend.append("g").attr("transform", `translate(0, ${i * 20})`);

      g.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", color(key));

      g.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text(key)
        .style("font-size", "12px")
        .attr("fill", "#333");
    });

    legend.transition().duration(1000).style("opacity", 1);
  });
})();
