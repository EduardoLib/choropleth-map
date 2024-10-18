const educationDataUrl = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const countyDataUrl = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

// Set up SVG canvas dimensions
const width = 960;
const height = 600;

// Define the tooltip
const tooltip = d3.select("#tooltip");

// Define color scale
const colorScale = d3.scaleThreshold()
    .domain([10, 20, 30, 40])
    .range(d3.schemeBlues[5]);

// Create SVG element
const svg = d3.select("#map")
    .attr("width", width)
    .attr("height", height);

// Load the data and create the map
Promise.all([d3.json(educationDataUrl), d3.json(countyDataUrl)]).then(([educationData, countyData]) => {
    const counties = topojson.feature(countyData, countyData.objects.counties).features;

    // Map the education data by FIPS code
    const educationMap = new Map(educationData.map(d => [d.fips, d]));

    // Create a path generator
    const path = d3.geoPath();

    // Draw the counties
    svg.selectAll("path")
        .data(counties)
        .enter()
        .append("path")
        .attr("class", "county")
        .attr("d", path)
        .attr("fill", d => {
            const county = educationMap.get(d.id);
            return county ? colorScale(county.bachelorsOrHigher) : "#ccc";
        })
        .attr("data-fips", d => d.id)
        .attr("data-education", d => educationMap.get(d.id)?.bachelorsOrHigher || 0)
        .on("mouseover", (event, d) => {
            const county = educationMap.get(d.id);
            tooltip.style("display", "block")
                .html(`FIPS: ${d.id}<br>Education: ${county ? county.bachelorsOrHigher : "No data"}%`)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 20}px`);
        })
        .on("mouseout", () => tooltip.style("display", "none"));

    // Create legend
    const legend = d3.select("#legend");
    const legendData = [10, 20, 30, 40];
    legend.selectAll("div")
        .data(legendData)
        .enter()
        .append("div")
        .style("background-color", d => colorScale(d))
        .text(d => `${d}%`);
});