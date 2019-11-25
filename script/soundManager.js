/* ================================================================== *
 * Aqui van a ir todas aquellas funciones que se encargen exclusivamente
 * de manipular o controlar el audio
 * ================================================================== */

const localURL = window.location.href;
let url = new URL(localURL);

let token = {};

let sparams = new URLSearchParams(url.search);
if(sparams.has('error')) console.error('Usuario no ha aceptado');
else {
  url.hash.substr(1).split('&').forEach(v=>{
    let lo = v.split('=');
    token[lo[0]] = lo[1];
  });
  //console.log(token);
  //console.log(token.access_token);
}

function soundLoaded(){
  
  const tw = (width/2)/32;
  const th = height/32;
  for(let i=0;i<32;++i){
    spoints[i]=[];
    for(let j=0;j<32;++j){
      spoints[i][j]={x:i*tw,y:j*th};
    }
  }
  
  if(!soundMode) return;
  fftwave.setInput(sound);
  fftspec.setInput(sound);
  amplitude.setInput(sound);
  peaks = sound.getPeaks();
  sound.playMode('restart');
  sound.setLoop(false);
  loopActivo = false;
  sound.play();
  //Se le asigna como valor maximo al slider de tiempo la duracion total de la cancion
  document.getElementById("seekTime").max = parseInt(sound.duration());
}
function soundError(){
  loopActivo = false;
  textCanvas.background(0);
  textCanvas.text('Archivo no cargado\nPrueba con otro',200,200);
}

function selChange(){
  let value = sel.value();
  
  mic.stop();
  if(sound.isLoaded()) sound.pause();
  if(value==="Archivo"){
    sound.play();
    $("#song-controls").show();
    $("#btnClear").hide();
    cambioPropiedades(false);
    soundMode = true;
    fftwave.setInput(sound);
    fftspec.setInput(sound);
    amplitude.setInput(sound);
  } else {
    mic.getSources(ls=>{
      console.log(ls);
      ls.forEach((d,i)=>{
        if(d.label === value){
          console.log(d.label);
          mic.setSource(i);
          return;
        }
      });
    });
    console.log('No rompre la madre');
    mic.start();
    $("#song-controls").hide();
    $("#btnClear").show();
    cambioPropiedades(true);
    fftwave.setInput(mic);
    fftspec.setInput(mic);
    amplitude.setInput(mic);
    soundMode = false;
  }
}

/*Funcion encargada de cambiar el tamanno de dos componentes de la visualizacion
en caso de cambio entre microfono y archivo*/
function cambioPropiedades(value){

  //If del valor de entrada que va a ser un booleano en caso de que se ocupe
  //hacer mas pequenna
  if(value){
    //se le cambia ancho a contenedor
    document.getElementById('Contenedor').style.height = "40px";
    //se le cambia ancho a Encapsulador5 
    document.getElementById('Encapsulador5').style.width = "100%";
  }
  //Else que coloca los tamannos originales 
  else{
    //se le cambia ancho a contenedor
    document.getElementById('Contenedor').style.height = "130px";
    //se le cambia ancho a Encapsulador5
    document.getElementById('Encapsulador5').style.width = "500px";
  }     
}

