/* ================================================================== *
 * Aqui van a ir todas aquellas funciones que se encargen exclusivamente
 * de manipular o controlar el audio
 * ================================================================== */

/*funncion encargada de activar y desactivar el loop de la cancion*/
function btnLoopMetodo(){

  //si la cacion no se esta ejecunatdo no se realiza el reto de la funcion
  if(!soundMode) return;

  /* Mas o menos, obentgo el estado actual del loop, y lo invierto */
  console.log(sound.isLooping(),loopActivo);
  if(!sound.isPlaying()) return;
  loopActivo = !sound.isLooping();
  sound.setLoop(loopActivo);
  /*
  //if encargadod de desactivar el loop
  if(loopActivo){

    //Se desactiva el loop
    loopActivo=false;
  }

  //if encargadod de activar el loop
  else{

    //Se activar el loop
    loopActivo=true;
  }*/
}


function selChange(){
  let value = sel.value();
  if(value==="Archivo"){
    if(!soundMode){ //!sM => estaba con el mic
      mic.stop();
      if(sound.isLoaded()) sound.play();
      fft.setInput(sound);
    }
    if(!sound.isPlaying()) sound.play();
    soundMode = true;
  } else {
    if(soundMode && sound.isLoaded()) sound.pause(); //sM => esataba con sound
    mic.getSources(ls=>{
      ls.forEach((d,i)=>{
        if(d.label === value){
          console.log(d.label);
          mic.setSource(i);
          return;
        }
      });
    });
    console.log('No rompre la madre');
    if(soundMode) { //sM => archivo, hay que arrancar
      mic.start();
      fft.setInput(mic);
    }
    soundMode = false;
  }
}

