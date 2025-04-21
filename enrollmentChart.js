window.onload = async function () {
  const margin = { top: 40, right: 30, bottom: 50, left: 70 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3
    .select("#college-line-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const url =
    "https://gist.githubusercontent.com/SUKHRAJSINGH7/ca1e737da85887ca6f9be61f1ec1c790/raw/70eca8bc3d23c50a74f2cd7a2fde977851c17c35/Enrollment.csv";

  const raw = await d3.tsv(url);

  const data = raw
    .map((d) => {
      const year = +d["Year"]?.trim();
      const total = +String(d["Total"] || "").replace(/,/g, "");
      return !isNaN(year) && !isNaN(total) ? { year, total } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.year - b.year);

  const x = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.year))
    .range([0, width]);
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.total) * 1.05])
    .range([height, 0]);

  const line = d3
    .line()
    .x((d) => x(d.year))
    .y((d) => y(d.total));

  const area = d3
    .area()
    .x((d) => x(d.year))
    .y0(height)
    .y1((d) => y(d.total));

  // Axes
  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  svg.append("g").call(
    d3
      .axisLeft(y)
      .ticks(8)
      .tickFormat((d) => `${(d / 1_000_000).toFixed(0)}M`)
  );

  // Labels
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + 40)
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
    .text("Enrollment");

  function drawChart() {
    // Area
    svg
      .append("path")
      .datum(data)
      .attr("fill", "#85cbe9")
      .attr("d", area)
      .attr("opacity", 0)
      .transition()
      .duration(1200)
      .attr("opacity", 1);

    // Line
    const path = svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#1f77b4")
      .attr("stroke-width", 2)
      .attr("d", line);

    const totalLength = path.node().getTotalLength();

    path
      .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1500)
      .ease(d3.easeCubic)
      .attr("stroke-dashoffset", 0);

    // Tooltip group
    const focus = svg.append("g").style("display", "none");

    focus
      .append("line")
      .attr("class", "hover-line")
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "#333")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2");

    const tooltipBox = focus
      .append("rect")
      .attr("fill", "#fff")
      .attr("stroke", "#000")
      .attr("width", 120)
      .attr("height", 40)
      .attr("rx", 4)
      .attr("y", -30);

    const tooltipText = focus
      .append("text")
      .attr("x", 60)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("font-size", "13px")
      .attr("font-weight", "bold");

    const tooltipValue = focus
      .append("text")
      .attr("x", 60)
      .attr("y", 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "13px");

    // Invisible overlay to track mouse
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("mouseover", () => focus.style("display", null))
      .on("mouseout", () => focus.style("display", "none"))
      .on("mousemove", function (event) {
        const mouseX = d3.pointer(event, this)[0];
        const year = Math.round(x.invert(mouseX));

        const closest = data.reduce((a, b) =>
          Math.abs(b.year - year) < Math.abs(a.year - year) ? b : a
        );

        focus.attr(
          "transform",
          `translate(${x(closest.year)},${y(closest.total)})`
        );
        focus.select("line").attr("y2", height - y(closest.total));
        tooltipText.text(closest.year);
        tooltipValue.text(closest.total.toLocaleString());
      });
  }

  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          drawChart();
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  observer.observe(document.querySelector("#college-line-chart"));
};
