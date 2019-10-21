/* ================================================================== *
 * Aqui van a ir todas aquellas funciones que se encargen exclusivamente
 * de manipular o controlar el audio
 * ================================================================== */

function soundLoaded(){
  if(!soundMode) return;
  fft.setInput(sound);
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
    fft.setInput(mic);
    soundMode = false;
  }
}

