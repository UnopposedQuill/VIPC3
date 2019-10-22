/* ================================================================== *
 * Aqui van a ir todas aquellas funciones que se encargen exclusivamente
 * de manipular o controlar el audio
 * ================================================================== */

function soundLoaded(){
  
  const tw = (width/2)/32;
  const th = height/32;
  for(let i=0;i<32;++i){
    points[i]=[];
    for(let j=0;j<32;++j){
      points[i][j]={x:i*tw,y:j*th};
    }
  }
  
  if(!soundMode) return;
  fftwave.setInput(sound);
  fftspec.setInput(sound);
  peaks = sound.getPeaks();
  sound.playMode('restart');
  sound.setLoop(true);
  loopActivo = true;
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
    cambioPropiedades(false);
    soundMode = true;
    fft.setInput(sound);
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
    //$("#btnPausa").hide();
    cambioPropiedades(true);
    fft.setInput(mic);
    soundMode = false;
  }
}

function cambioPropiedades(value){
  if(value){
    document.getElementById('Contenedor').style.height = "40px";
     document.getElementById('Encapsulador5').style.width = "100%";
  }
  else{
    document.getElementById('Contenedor').style.height = "130px";

     document.getElementById('Encapsulador5').style.width = "200px";
  }
     
  
    //$("#Contenedor").style.height = "130px";
  
}

