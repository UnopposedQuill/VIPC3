var particion = d3.partition().size([2*Math.PI, svg_radio]);
var nodo_selecto;
function sunburst(lraiz){
  lraiz = lraiz?lraiz:sunburst_raiz;
  $('svg').html('');
  if(!busqueda()) return;
  particion(lraiz);
  console.log(lraiz);;
  let arc = d3.arc()  // <-- 2
    .startAngle(d=>d.x0)
    .endAngle(d=>d.x1)
    .innerRadius(d=>d===lraiz?0:(svg_radio/2))
    .outerRadius(d=>d===lraiz?(svg_radio/2):svg_radio);
  grafo_result.append('g')
       .attr('transform', 'translate(' + svg_ancho / 2 + ',' + svg_alto / 2 + ')')
    .selectAll('path')
    .data(lraiz.descendants().filter(d=>d.parent===lraiz||d===lraiz))
    .join('path')
      .attr('d',arc)
      .style('fill','#999')
      .style('stroke','#000')
      .on('click',inspeccionar)
    .append('title')
      .text(d=>d.data.name?d.data.name:d.data.Titulo);
  
  grafo_result.append('g')
       .attr('transform', 'translate(' + svg_ancho / 2 + ',' + svg_alto / 2 + ')')
    .attr('pointer-events','none')
    .attr('text-anchor','middle')
    .selectAll('text')
    .data(lraiz.descendants().filter(d=>d.parent===lraiz||d===lraiz))
    .join('text')
      .attr('transform',d=>{
        const x = (d.x0 +d.x1)/2 * 180/Math.PI, y = (d===lraiz?0:3*svg_radio/4);
        return `rotate(${x-90}) translate(${y},0) rotate(${x<180?0:180})`
      })
      .attr('dy','0.35em')
      .text(d=>(d.data.name?d.data.name:d.data.Titulo));
}
function inspeccionar(d){
  if(!d.children) cambioSongSpoti(d.data._prev,d.data._cover,d.data._id);
  else if(d===nodo_selecto && d!=sunburst_raiz) nodo_selecto = d.parent;
  else {
    nodo_selecto = d;
  }
  sunburst(nodo_selecto);
}
