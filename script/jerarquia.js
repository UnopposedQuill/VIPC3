let contenedor = document.getElementById("searchGraphic");
var svg_alto = contenedor.offsetHeight, svg_ancho = contenedor.offsetWidth;
var svg_radio = Math.min(svg_alto,svg_ancho)/2;
var grafo_result = d3.select('svg');
var sunburst_raiz, cluster_raiz;

function svg_resize(alto,ancho){
  svg_alto = alto;
  svg_ancho = ancho;
  svg_radio = Math.min(svg_alto,svg_ancho)/2;
  grafo_result.attr('width',ancho).attr('height',alto);
  particion.size([2*Math.PI,svg_radio]);
  cluster_maker.size([svg_alto-10,svg_ancho-50]);
  console.log(alto,ancho);
}

function agrupar(listado){
  listado = _.groupBy(listado,'Artista');
  for(let artista in listado)listado[artista]=_.groupBy(listado[artista],'Album');
  return listado;
}

function jerarquicar(listado, root){
    let hier=[];
    _.pairs(listado).forEach(v=>{let o=[];_.pairs(v[1]).forEach(v=>o.push({name:v[0],children:v[1]}));hier.push({name:v[0],children:o});});
    hier={name:root,children:hier};
    console.log(hier);
    return d3.hierarchy(hier).sum(d=>1);
}

function busqueda(){
  if(retornoSpotify===[]){
    return false;
  }
  return true;
}
