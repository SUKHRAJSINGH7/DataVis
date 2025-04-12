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
      .attr("font-size", "14px")
      .text("Year");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -50)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .text("Tuition Amount ($)");

    // Line
    const line = d3
      .line()
      .x((d) => x(d.year))
      .y((d) => y(d.all_institutions));

    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);
  })
  .catch((error) => {
    console.error("Error loading or processing the CSV:", error);
  });
