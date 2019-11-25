var cluster_maker = d3.tree().size([svg_alto-10,svg_ancho-50]).separation((a,b)=>1);
function cluster(lraiz){
  lraiz=lraiz?lraiz:cluster_raiz;
  $('svg').html('');
  if(!busqueda()) return;
  lraiz.dx = 10;
  lraiz.dy = svg_ancho / (lraiz.height + 1);
  cluster_maker(lraiz);
  grafo_result.append('g')
    .attr('fill','none')
    .attr('stroke','#45f5e7')
    .attr('stroke-opacity',0.4)
    .attr('stroke-width',1.5)
    .selectAll('path')
      .data(lraiz.links())
      .join('path')
        .attr('d',d=> `
        M${d.target.y},${d.target.x}
        C${d.source.y + cluster_raiz.dy / 2},${d.target.x}
         ${d.source.y + cluster_raiz.dy / 2},${d.source.x}
         ${d.source.y},${d.source.x}
      `);
  let nodo = grafo_result.append('g')
    .selectAll('g')
    .data(lraiz.descendants())
    .join('g')
    .attr('transform',d=>`translate(${d.y},${d.x})`);
  nodo.append('circle')
    .attr('fill',d=>d.children?'#1c9b91':(d._children?'green':(d.data._prev?'red':'blue')))
      //arriba: el ternario más cerdo del mundo, pregunta si tiene hijos (esta abierto)
      //luego si no (cerrado) pregunta si tiene hijos en stash
      //si no, no tiene hijos por ningun lado, asi que es hoja, y pregunta si tiene preview o no
    .attr('r',6)
    .on('click',rama_inspeccionar);
  nodo.append('text')
    .attr("dy","0.31em")
    .attr('x',d=>d!=lraiz?-10:10)
    .text(d=>d.data.name?d.data.name:d.data.Titulo)
      .filter(d =>d!=lraiz)
        .attr("text-anchor", "end")
        .clone(true).lower()
        .attr("stroke", "white");
}
function rama_inspeccionar(d,i,n){
  if(d.children){
    d._children = d.children;
    d.children = null;
  } else {
    if(!d._children && d.data._prev) cambioSongSpoti(d.data._prev,d.data._cover,d.data._id);
    else {
      d.children = d._children;
      d._children = null;
    }
  }
  cluster(cluster_raiz);
}

