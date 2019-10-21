/* ================================================================== *
 * Aqui van a ir todas aquellas funciones que se encargen de responder
 * directamente a eventos de la UI
 * ================================================================== */

function soundLoaded(){
  if(!soundMode) return;
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
function toggleSound(){
  if(!soundMode) return;
  if(sound.isPlaying()){
    sound.pause(); 
  } else {
    sound.play();
  }
}

function keyPressed(){
  if(key=='p' || key == ' ') toggleSound();
}
/*
function mousePressed(){
  if(mouseX>0&&mouseX<width&&mouseY>0&&mouseY<height) toggleSound();
}
*/
function fileHandle(file){
  if(file.type=="audio"){
    textCanvas.background(15);
    textCanvas.text('Archivo no cargado\nEspera unos minutos\nO prueba con otro',200,200);
    sound.stop();
    sound = loadSound(file,soundLoaded,soundError);
  } else {
    soundError();
  }
}

/*funcion encargada de hacer un salto en la cancion a los segundos que el usuario 
quiere hacer*/
function tiempoBarraMusica(self){
  
  //si la cacion no se esta ejecunatdo no se realiza el reto de la funcion
  if(!soundMode) return;
  
  //Detiene la ejecucion atual de la cancion
  sound.stop();

  //se activa la actualizacion del slider 
  barraDuracionActiva = true;
  
  //Variable encargada de conseguir el valor del tiempo al cual el Usuario quiere
  //hacer para la reproduccion de la cancion
  let tiempo=parseInt(self.value);
  
  //Salta al tiempo deseado despues de 50ms, para asegurar que no haya errores por asincrono
  //Si se hace inmediato, primero salta y luego la cancion se detiene o no.
  setTimeout(function(){sound.jump(tiempo);},50);

}
