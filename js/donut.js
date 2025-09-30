// js/donut.js — Interactive Donut Chart
(function() {
  const dataPath = "data/Ex5_TV_energy_Allsizes_byScreenType.csv"; 
  const container = d3.select("#donut .chart-body");

  // Create tooltip
  const tooltip = d3.select('body').append('div')
    .attr('class','tooltip')
    .style('display','none')
    .style('position','absolute')
    .style('padding','6px 10px')
    .style('background','#fff')
    .style('border','1px solid #ccc')
    .style('border-radius','4px')
    .style('pointer-events','none')
    .style('font-size','12px');

  function render() {
    container.selectAll("*").remove(); // clear old chart

    const containerWidth = container.node().getBoundingClientRect().width;
    const containerHeight = container.node().getBoundingClientRect().height || 350;

    const width = containerWidth;
    const height = containerHeight;
    const radius = Math.min(width, height) / 2.5; 

    const svg = container.append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${radius + 20}, ${height / 2})`);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    d3.csv(dataPath).then(data => {
      data.forEach(d => {
        d.tech = d["Screen_Tech"];
        d.value = +d["Mean(Labelled energy consumption (kWh/year))"];
      });

      const pie = d3.pie()
        .sort(null)
        .value(d => d.value);

      const arc = d3.arc()
        .innerRadius(radius * 0.5)
        .outerRadius(radius - 10);

      const pieData = pie(data);

      // Draw arcs with hover interaction
      svg.selectAll("path")
        .data(pieData)
        .join("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.tech))
        .on('mousemove', (event,d)=>{
          tooltip.style('display','block')
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY + 10) + 'px')
            .html(`<strong>${d.data.tech}</strong><br/>${d.data.value.toFixed(1)} kWh`);

          d3.select(event.currentTarget)
            .attr('opacity', 0.7)
            .attr('stroke','#222')
            .attr('stroke-width',2);
        })
        .on('mouseout', (event,d)=>{
          tooltip.style('display','none');
          d3.select(event.currentTarget)
            .attr('opacity',1)
            .attr('stroke','none');
        });

      // Labels (percentages)
      const labelArc = d3.arc()
        .innerRadius(radius * 0.7)
        .outerRadius(radius * 0.7);

      const totalSum = d3.sum(pieData, d => d.value);

      svg.selectAll("text")
        .data(pieData)
        .join("text")
        .attr("transform", d => `translate(${labelArc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .style("font-size", `${Math.max(10, radius * 0.12)}px`)
        .style("fill", "white")
        .text(d => {
          const pct = ((d.value / totalSum) * 100).toFixed(0);
          return `${pct}%`;
        });

      // ---- LEGEND ----
      const legend = container.select("svg")
        .append("g")
        .attr("transform", `translate(${radius * 2 + 40}, ${40})`);

      const legendItem = legend.selectAll(".legend-item")
        .data(data)
        .join("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 22})`);

      legendItem.append("rect")
        .attr("x", 0)
        .attr("y", -8)
        .attr("width", Math.max(10, radius * 0.12))
        .attr("height", Math.max(10, radius * 0.12))
        .attr("fill", d => color(d.tech));

      legendItem.append("text")
        .attr("x", radius * 0.2 + 10)
        .attr("y", 2)
        .style("font-size", `${Math.max(10, radius * 0.12)}px`)
        .text(d => d.tech);
    });
  }

  render();
  window.addEventListener("resize", render);
})();
