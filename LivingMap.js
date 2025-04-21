window.onload = async function () {
  const width = 960;
  const height = 600;

  const svg = d3
    .select("#cost-of-living-map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const projection = d3
    .geoAlbersUsa()
    .translate([width / 2, height / 2])
    .scale(1000);
  const path = d3.geoPath().projection(projection);

  const geoData = await d3.json(
    "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"
  );
  const states = topojson.feature(geoData, geoData.objects.states).features;

  const csvUrl =
    "https://gist.githubusercontent.com/SUKHRAJSINGH7/3267bd904fd7f60a3d4d468c8736dd8b/raw/f387e5a2257328daaf17a8249a90319ee482ee38/livingIndex.csv";
  const data = await d3.csv(csvUrl);

  // Build cost index map with lowercased keys
  const costIndexMap = {};
  data.forEach((d) => {
    const state = d.state?.trim().toLowerCase();
    const index = +d.CostOfLivingIndex_CostOfLivingIndex_num_2024;
    if (state && !isNaN(index)) {
      costIndexMap[state] = index;
    }
  });

  // Manually patch known mismatch for DC (if needed)
  costIndexMap["district of columbia"] =
    costIndexMap["district of columbia"] || 141.9;

  // Map state ID to state name
  const nameById = new Map([
    [1, "Alabama"],
    [2, "Alaska"],
    [4, "Arizona"],
    [5, "Arkansas"],
    [6, "California"],
    [8, "Colorado"],
    [9, "Connecticut"],
    [10, "Delaware"],
    [11, "District of Columbia"],
    [12, "Florida"],
    [13, "Georgia"],
    [15, "Hawaii"],
    [16, "Idaho"],
    [17, "Illinois"],
    [18, "Indiana"],
    [19, "Iowa"],
    [20, "Kansas"],
    [21, "Kentucky"],
    [22, "Louisiana"],
    [23, "Maine"],
    [24, "Maryland"],
    [25, "Massachusetts"],
    [26, "Michigan"],
    [27, "Minnesota"],
    [28, "Mississippi"],
    [29, "Missouri"],
    [30, "Montana"],
    [31, "Nebraska"],
    [32, "Nevada"],
    [33, "New Hampshire"],
    [34, "New Jersey"],
    [35, "New Mexico"],
    [36, "New York"],
    [37, "North Carolina"],
    [38, "North Dakota"],
    [39, "Ohio"],
    [40, "Oklahoma"],
    [41, "Oregon"],
    [42, "Pennsylvania"],
    [44, "Rhode Island"],
    [45, "South Carolina"],
    [46, "South Dakota"],
    [47, "Tennessee"],
    [48, "Texas"],
    [49, "Utah"],
    [50, "Vermont"],
    [51, "Virginia"],
    [53, "Washington"],
    [54, "West Virginia"],
    [55, "Wisconsin"],
    [56, "Wyoming"],
  ]);

  const color = d3
    .scaleSequential(d3.interpolateBlues)
    .domain(d3.extent(Object.values(costIndexMap)));

  // Tooltip setup
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("padding", "8px")
    .style("background", "#fff")
    .style("border", "1px solid #ccc")
    .style("font-size", "14px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  svg
    .selectAll("path")
    .data(states)
    .join("path")
    .attr("d", path)
    .attr("fill", (d) => {
      const name = nameById.get(d.id);
      const val = costIndexMap[name?.toLowerCase()];
      return val ? color(val) : "#ccc";
    })
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.5)
    .on("mouseover", function (event, d) {
      const name = nameById.get(d.id);
      const val = costIndexMap[name?.toLowerCase()];
      d3.select(this).attr("stroke", "#222").attr("stroke-width", 2);

      tooltip
        .style("opacity", 0.95)
        .html(
          `<strong>${name}</strong><br>Cost of Living Index: ${
            val !== undefined ? val : "N/A"
          }`
        )
        .style("left", event.pageX + 15 + "px")
        .style("top", event.pageY - 40 + "px");
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", event.pageX + 15 + "px")
        .style("top", event.pageY - 40 + "px");
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
      d3.select(this).attr("stroke", "#fff").attr("stroke-width", 0.5);
    });
};
