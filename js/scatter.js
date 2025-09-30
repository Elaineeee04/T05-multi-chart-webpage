// Scatter plot (star rating vs energy consumption) — interactive
(function(){
  const dataPath = 'data/Ex5_TV_energy.csv'; 
  const container = d3.select('#scatter .chart-body');
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
      brand: d.brand,
      screen_size: d.screensize ? +d.screensize : NaN,
      screen_technology: d.screen_tech || 'Unknown',
      star: d.star2 ? +d.star2 : NaN,
      energy: d.energy_consumpt ? +d.energy_consumpt : NaN,
      count: d.count ? +d.count : 1
    };
  }

  d3.csv(dataPath, parseRow).then(raw => {
    const data = raw.filter(d => !isNaN(d.star) && !isNaN(d.energy));
    const techs = Array.from(new Set(data.map(d=>d.screen_technology))).sort();
    const color = d3.scaleOrdinal().domain(techs).range(d3.schemeTableau10);

    function draw(){
      const node = container.node();
      const width = Math.max(320, node.clientWidth);
      const height = Math.max(300, Math.round(width * 0.6));
      container.selectAll('svg').remove();

      const margin = {top:20,right:20,bottom:45,left:60};
      const innerW = width - margin.left - margin.right;
      const innerH = height - margin.top - margin.bottom;

      const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);
      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // x = star rating
      const xExtent = d3.extent(data, d => d.star);
      const xPad = 0.5;
      const x = d3.scaleLinear()
        .domain([xExtent[0]-xPad, xExtent[1]+xPad])
        .range([0, innerW])
        .nice();

      // y = energy consumption
      const yExtent = d3.extent(data, d => d.energy);
      const y = d3.scaleLinear()
        .domain([Math.min(0, yExtent[0]*0.95), yExtent[1]*1.05])
        .range([innerH, 0])
        .nice();

      // bubble radius scales with chart size
      const maxR = Math.max(2, Math.min(innerW, innerH) / 60); 
      const r = d3.scaleSqrt()
        .domain(d3.extent(data, d => d.screen_size))
        .range([2, maxR]);

      // axes
      g.append('g')
        .attr('transform', `translate(0,${innerH})`)
        .call(d3.axisBottom(x));
      g.append('g').call(d3.axisLeft(y));

      g.append('text')
        .attr('x', innerW/2)
        .attr('y', innerH + 40)
        .attr('text-anchor','middle')
        .attr('fill','#333')
        .text('Star Rating');

      g.append('text')
        .attr('transform','rotate(-90)')
        .attr('x', -innerH/2)
        .attr('y', -44)
        .attr('text-anchor','middle')
        .attr('fill','#333')
        .text('Energy Consumption (kWh)');

      // crosshair lines
      const crosshairX = g.append('line')
        .attr('stroke','gray')
        .attr('stroke-dasharray','3,3')
        .style('display','none');
      const crosshairY = g.append('line')
        .attr('stroke','gray')
        .attr('stroke-dasharray','3,3')
        .style('display','none');

      // points
      const points = g.selectAll('circle').data(data, d=>d.brand + d.screen_size + d.energy);
      points.enter().append('circle')
        .attr('cx', d=>x(d.star))
        .attr('cy', d=>y(d.energy))
        .attr('r', 2)
        .attr('fill', d=>color(d.screen_technology))
        .attr('fill-opacity', 0.85)
        .attr('stroke', '#222')
        .attr('stroke-opacity', 0.06)
        .on('mouseover', (event,d)=>{
          d3.select(event.currentTarget)
            .attr('stroke','#000')
            .attr('stroke-width',2)
            .attr('fill-opacity',1);
        })
        .on('mouseout', (event,d)=>{
          d3.select(event.currentTarget)
            .attr('stroke','#222')
            .attr('stroke-width',1)
            .attr('fill-opacity',0.85);
          tooltip.style('display','none');
          crosshairX.style('display','none');
          crosshairY.style('display','none');
        })
        .on('mousemove', (event,d)=>{
          tooltip.style('display','block')
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY + 10) + 'px')
            .html(`<strong>${d.brand}</strong><br/>Tech: ${d.screen_technology}<br/>Size: ${d.screen_size ? d.screen_size + '"' : 'NA'}<br/>Star: ${d.star}<br/>Energy: ${d.energy} kWh`);

          // update crosshairs
          crosshairX
            .attr('x1', x(d.star))
            .attr('y1', 0)
            .attr('x2', x(d.star))
            .attr('y2', innerH)
            .style('display','block');
          crosshairY
            .attr('x1', 0)
            .attr('y1', y(d.energy))
            .attr('x2', innerW)
            .attr('y2', y(d.energy))
            .style('display','block');
        });

      // legend
      const legend = svg.append('g')
        .attr('transform', `translate(${width - 10 - 120},${margin.top})`);
      techs.forEach((t,i)=>{
        const row = legend.append('g').attr('transform', `translate(0, ${i*18})`);
        row.append('rect')
          .attr('width',12)
          .attr('height',12)
          .attr('fill', color(t));
        row.append('text')
          .attr('x',16)
          .attr('y',11)
          .text(t)
          .attr('font-size','11px');
      });
    }

    let t;
    window.addEventListener('resize', ()=>{ clearTimeout(t); t = setTimeout(draw, 120); });
    draw();
  }).catch(err => {
    container.append('div').text('Error loading scatter data: ' + err.message);
  });
})();
