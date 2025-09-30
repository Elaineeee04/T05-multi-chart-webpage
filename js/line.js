// Line chart — Spot Power Prices (1998–2024) with min-max range, responsive legend + hover + axis labels
(function(){
  const dataPath = "data/Ex5_ARE_Spot_Prices.csv";

  const container = d3.select("#line .chart-body");
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

  if (!container.node()) {
    console.error("Container #line .chart-body not found!");
    return;
  }

  function parseRow(d) {
    const numericCols = Object.keys(d).filter(c => c !== "Year" && c !== "Average Price (notTas-Snowy)");
    const rowValues = numericCols.map(c => {
      if (!d[c]) return NaN;
      return +d[c].replace(/[^\d.-]/g, "");
    }).filter(v => !isNaN(v));

    const median = d3.median(rowValues);
    const min = d3.min(rowValues);
    const max = d3.max(rowValues);

    return {
      Year: +d.Year,
      Average: (!d["Average Price (notTas-Snowy)"] || d["Average Price (notTas-Snowy)"] === "")
                  ? median
                  : +d["Average Price (notTas-Snowy)"].replace(/[^\d.-]/g, ""),
      Min: min,
      Max: max
    };
  }

  d3.csv(dataPath, parseRow).then(data => {
    data.sort((a,b) => d3.ascending(a.Year, b.Year));

    function draw() {
      const node = container.node();
      const width = Math.max(320, node.clientWidth);
      const height = Math.max(300, Math.round(width * 0.6));
      container.selectAll('svg').remove();

      const margin = {top: 80, right: 60, bottom: 50, left: 70};
      const innerW = width - margin.left - margin.right;
      const innerH = height - margin.top - margin.bottom;

      const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);

      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Scales
      const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.Year))
        .range([0, innerW]);

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Max)]).nice()
        .range([innerH, 0]);

      // Axes
      g.append('g')
        .attr('transform', `translate(0,${innerH})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(10));

      g.append('g')
        .call(d3.axisLeft(y).ticks(6));

      // Axis labels
      g.append('text')
        .attr('x', innerW / 2)
        .attr('y', innerH + 35)
        .attr('text-anchor', 'middle')
        .attr('fill', '#000')
        .style('font-size', '12px')
        .text('Year');

      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerH / 2)
        .attr('y', -50)
        .attr('text-anchor', 'middle')
        .attr('fill', '#000')
        .style('font-size', '12px')
        .text('Spot Power Price ($/MWh)');

      // Area generator for min-max range
      const area = d3.area()
        .x(d => x(d.Year))
        .y0(d => y(d.Min))
        .y1(d => y(d.Max));

      g.append("path")
        .datum(data)
        .attr("fill", "lightsteelblue")
        .attr("opacity", 0.3)
        .attr("d", area);

      // Line generator for median
      const line = d3.line()
        .x(d => x(d.Year))
        .y(d => y(d.Average));

      // Draw median line
      g.append("path")
        .datum(data)
        .attr("fill","none")
        .attr("stroke","steelblue")
        .attr("stroke-width",2)
        .attr("d", line);

      // Draw interactive points
      g.selectAll(".dot")
        .data(data)
        .join("circle")
        .attr("class","dot")
        .attr("cx", d => x(d.Year))
        .attr("cy", d => y(d.Average))
        .attr("r", 4)
        .attr("fill", "steelblue")
        .on('mousemove', (event,d)=>{
          tooltip.style('display','block')
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY + 10) + 'px')
            .html(`<strong>Year: ${d.Year}</strong><br/>Median/Average: ${d.Average.toFixed(2)}<br/>Min: ${d.Min.toFixed(2)}<br/>Max: ${d.Max.toFixed(2)}`);
          
          d3.select(event.currentTarget).attr('r', 6).attr('fill', 'orange');
        })
        .on('mouseout', (event,d)=>{
          tooltip.style('display','none');
          d3.select(event.currentTarget).attr('r', 4).attr('fill', 'steelblue');
        });

      // Chart title
      svg.append("text")
        .attr("x", width/2)
        .attr("y", 25)
        .attr("text-anchor","middle")
        .style("font-size","16px")
        .style("font-weight","bold")
        .text("Spot Power Prices (1998–2024) — Min-Max Range");

      // Responsive Legend
      const legendX = margin.left + 10;
      const legendY = margin.top * 0.6;
      const legend = svg.append("g")
        .attr("transform", `translate(${legendX}, ${legendY})`);
      const legendData = [
        { color: "steelblue", text: "Median/Average" },
        { color: "lightsteelblue", text: "Min–Max Range", opacity: 0.3 }
      ];
      legendData.forEach((d,i)=>{
        const row = legend.append("g")
          .attr("transform", `translate(0, ${i * 18})`);
        row.append("rect")
          .attr("width", 18)
          .attr("height", 12)
          .attr("fill", d.color)
          .attr("opacity", d.opacity || 1);
        row.append("text")
          .attr("x", 22)
          .attr("y", 10)
          .attr("font-size", Math.max(10, width * 0.013))
          .text(d.text);
      });
    }

    let t;
    window.addEventListener('resize', ()=>{ clearTimeout(t); t = setTimeout(draw, 120); });
    draw();
  }).catch(err=>{
    container.append('div').text('Error loading line data: ' + err.message);
  });
})();
