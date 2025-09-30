// Bar chart (energy consumption for 55" TVs by screen technology) — interactive
(function(){
  const dataPath = 'data/Ex5_TV_energy_55inchtv_byScreenType.csv'; 

  const container = d3.select('#bar .chart-body');
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

  function parseRow(d){
    return {
      tech: d.Screen_Tech,
      mean_energy: +d['Mean(Labelled energy consumption (kWh/year))']
    };
  }

  d3.csv(dataPath, parseRow).then(data => {
    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.tech))
      .range(d3.schemeTableau10);

    function draw(){
      const node = container.node();
      const width = Math.max(320, node.clientWidth);
      const height = Math.max(250, Math.round(width * 0.8));
      container.selectAll('svg').remove();

      const margin = {top:80, right:20, bottom:50, left:70};  
      const innerW = width - margin.left - margin.right;
      const innerH = height - margin.top - margin.bottom;

      const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);

      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // x scale
      const x = d3.scaleBand()
        .domain(data.map(d=>d.tech))
        .range([0, innerW])
        .padding(0.3);

      // y scale
      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d=>d.mean_energy)*1.1])
        .range([innerH, 0])
        .nice();

      // axes
      g.append('g')
        .attr('transform', `translate(0,${innerH})`)
        .call(d3.axisBottom(x));
      g.append('g')
        .call(d3.axisLeft(y));

      // axis labels
      g.append('text')
        .attr('x', innerW/2)
        .attr('y', innerH + 40)
        .attr('text-anchor','middle')
        .attr('fill','#333')
        .text('Screen Technology');

      g.append('text')
        .attr('transform','rotate(-90)')
        .attr('x', -innerH/2)
        .attr('y', -50)
        .attr('text-anchor','middle')
        .attr('fill','#333')
        .text('Mean Energy Consumption (kWh/year)');

      // bars
      const bars = g.selectAll('rect').data(data).enter().append('rect')
        .attr('x', d => x(d.tech))
        .attr('y', d => y(d.mean_energy))
        .attr('width', x.bandwidth())
        .attr('height', d => innerH - y(d.mean_energy))
        .attr('fill', d => color(d.tech))
        .on('mousemove', (event,d)=>{
          tooltip.style('display','block')
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY + 10) + 'px')
            .html(`<strong>${d.tech}</strong><br/>${d.mean_energy.toFixed(1)} kWh/year`);

          // highlight bar on hover
          d3.select(event.currentTarget)
            .attr('fill', d3.color(color(d.tech)).darker(0.5));
        })
        .on('mouseout', (event,d)=>{
          tooltip.style('display','none');
          // restore original bar color
          d3.select(event.currentTarget)
            .attr('fill', color(d.tech));
        });

      // responsive legend
      const legend = svg.append('g')
        .attr('transform', `translate(${margin.left},30)`);
      const spacing = innerW / data.length;

      data.forEach((d,i) => {
        const row = legend.append('g')
          .attr('transform', `translate(${i*spacing},0)`);
        row.append('rect')
          .attr('width',12)
          .attr('height',12)
          .attr('fill', color(d.tech));
        row.append('text')
          .attr('x',16)
          .attr('y',11)
          .attr('font-size','11px')
          .text(d.tech);
      });
    }

    let t;
    window.addEventListener('resize', ()=>{ clearTimeout(t); t = setTimeout(draw, 120); });
    draw();
  }).catch(err=>{
    container.append('div').text('Error loading bar data: ' + err.message);
  });
})();
