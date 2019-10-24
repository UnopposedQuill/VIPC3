/* ================================================================== *
 * Aqui van a ir todas aquellas funciones que se encargen de responder
 * directamente a eventos de la UI
 * ================================================================== */

/*funncion encargada de activar y desactivar el loop de la cancion*/
function btnLoopMetodo(){

  //si la cacion no se esta ejecunatdo no se realiza el reto de la funcion
  if(!soundMode) return;

  /* Mas o menos, obentgo el estado actual del loop, y lo invierto */
  if(!sound.isPlaying()){
    loopActivo = !loopActivo;
  } else {
    loopActivo = !sound.isLooping();
  }
  sound.setLoop(loopActivo);
}

function toggleSound(){
  if(!soundMode) return;
  if(sound.isPlaying()){
    barraDuracionActiva = false;
    sound.pause(); 
  } else {
    barraDuracionActiva = true;
    sound.play();
  }
}

function clearGrid(){
  const tw = (width/2)/32;
  const th = height/32;
  for(let i=0;i<32;++i){
    mpoints[i]=[];
    for(let j=0;j<32;++j){
      mpoints[i][j]={x:i*tw,y:j*th};
    }
  }
}

/*Funcion encargada de detener la reproduccion de la cancion que se esta ejecutando*/
function btnStop(){
  
  //si la cacion no se esta ejecunatdo no se realiza el reto de la funcion
  if(!soundMode) return;
  
  //Se detiene la reproduccion de la cancion
  sound.stop();
}


function keyPressed(){
  if(key=='p' || key == ' ') toggleSound();
}

function fileHandle(file){
  console.log(file);
  if(file.type=="audio"){
    window.jsmediatags.read(file.file, {
      onSuccess: (data)=>{
      let tags = data.tags;
      /*Example
      album: "Relaxer"
      artist: "alt-J"
      picture: Object { format: "image/jpeg", type: "Cover (front)", description: "", data:[...], ... }<=Esta picture.data es la imagen del cover, util a futuro
      title: "Adeline"
      track: "6/8"
      year: "2017"
      */
        console.log(tags.title,tags.artist,tags.album, tags);
      },
      onError: (error)=>{console.error(error);}
    });
    textCanvas.background(15);
    textCanvas.text('Archivo no cargado\nEspera unos minutos\nO prueba con otro',200,200);
    sound.stop();
    sound = loadSound(file,soundLoaded,soundError);
  } else {
    soundError();
  }
}


/*Funcion encargada de actualizar el aspecto de los botones dependiendo de los
valores en el que se encuentren en ejecucion*/
function actualizarbtn(){
/* ================================================================== *
 *  No seria mejor actualizar los botones solamente cuando han        *
 *  Cambiado, como por ejemplo, en la funcion que los modifica        *
 * ================================================================== */

  //si la cacion no se esta ejecunatdo no se realiza el reto de la funcion
  if(!soundMode) return;

  //if encargado de recizar si la cancion se esta ejecutando para actualizar el btnPausa 
  if(sound.isPlaying()){

    //Se actualiza el la palabra dentro del boton a Play
    document.getElementById("btnPausa").innerHTML = "Playing";

    //Se actualiza el color del boton con relacion al valor
    document.getElementById("btnPausa").style.background = "#77FF55";
  } 

  //else encargado de actualizar el btnPausa 
  else {

    //se actualiza el la palabra dentro del boton a Pause
    document.getElementById("btnPausa").innerHTML = "Paused";

    //Se actualiza el color del boton con relacion al valor
    document.getElementById("btnPausa").style.background = "#4CAF50";
  }

  //if encargado de recizar si la cancion se esta ejecutando en loop para actualizar el btnLoop 
  if(loopActivo){

    //Se actualiza el la palabra dentro del boton a Loop ON
    document.getElementById("btnLoop").innerHTML = "Loop ON";

    //Se actualiza el color del boton con relacion al valor
    document.getElementById("btnLoop").style.background = "#77FF55";
  } 

  //else encargado de actualizar el btnLoop
  else {

    //Se actualiza el la palabra dentro del boton a Loop OFF
    document.getElementById("btnLoop").innerHTML = "Loop OFF";

    //Se actualiza el color del boton con relacion al valor
    document.getElementById("btnLoop").style.background = "#4CAF50";
  
  }

   //if encargado de recizar si la cancion se esta ejecutando en loop para actualizar el btnReversa
  if(invertidor){

    //Se actualiza el la palabra dentro del boton a Reversa ON
    document.getElementById("btnReversa").innerHTML = "Reversa ON";

    //Se actualiza el color del boton con relacion al valor
    document.getElementById("btnReversa").style.background = "#77FF55";
  }

  //else encargado de actualizar el btnReversa
  else {

    //Se actualiza el la palabra dentro del boton a Reversa OFF
    document.getElementById("btnReversa").innerHTML = "Reversa OFF";

    //Se actualiza el color del boton con relacion al valor
    document.getElementById("btnReversa").style.background = "#4CAF50";
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

/*Funcion encargada padar los segundos dados  en eun patron de MM:SS*/
function tiempoMusica(valor){

  //si la cacion no se esta ejecunatdo no se realiza el reto de la funcion
  if(!soundMode) return;
  
  //Variable encargada de obtener los Minutos de la cancion
  var minutos = parseInt(valor/60);
  
  //Variable encargada de obtener los Segundos de la cancion
  var segundos = parseInt(valor%60);
  
  //If encargado de revizar si el numero es menor a 10 para colocar un cero para que se vea mas estetico
  //la representacion de los Minutos 
  if(minutos<=9){
    minutos="0"+ minutos;
  }
  
  //If encargado de revizar si el numero es menor a 10 para colocar un cero para que se vea mas estetico
  //la representacion de los Segundos
  if(segundos<=9){
    segundos="0"+ segundos;
  }

  //Retorna un String con los minutos y segundos acomodados de manera estetica
  return minutos +":"+ segundos;
}

/*Funcion encargada de Actualizar el Slider seekTime del UI con el valor actual de en 
cual segundo se encuentra la ejecucion de la cancion*/
function valorTiempoBarraMusica(valor){

  //If encargado de revisar que si se pueda actualizar el valor y que este no 
  //interfiera cuando el usuario intente cambiar el tiempo de ejecucion de la cancion 
  if(barraDuracionActiva){
    $("#Duracion1").html(tiempoMusica(sound.currentTime()));
    $("#Duracion2").html(tiempoMusica(sound.duration()));
    //se asigna el valor al Slider con los segundos actuales de la cancion
    document.getElementById("seekTime").value = parseInt(valor);
  }  
}

/*Funcion a encargada de asignar la velociada a la cacion ya sea en funcion normal o en reversa*/
function Velocidad(self){

  //si la cacion no se esta ejecunatdo no se realiza el reto de la funcion
  if(!soundMode) return;

  //se obpiene el valor del Slider de velocidad 
  var entrada = parseInt(self.value);

  //si la funcion de reversa esta activa el valor del Slider se hara negativo 
  if(invertidor){

    //Se hace negativo el valor del Slider
    entrada=entrada*-1;
  }

  //Se le asigna la velocidad a la cancion
  sound.rate(entrada);

  //Se actualiza el valor del lbl que muestra la velocidad de ejecucion
  document.getElementById("valorVelocidadMusica").innerHTML = entrada;
}

/*Funcion encargado de actualizar el volumen de la cancion utlizando un slider del UI*/
function volumenMusica(self){
  //si la cacion no se esta ejecunatdo no se realiza el reto de la funcion
  if(!soundMode) return;
  //Obtiene el valor del Slider de volumen del UI y pasa el valor a un numero
  let entrada = parseInt(self.value);
  //Asigna el valor del volumen a la cancion pero lo divide entre 10 porque el radio de valor 0.0 a 1.0
  sound.setVolume(entrada/10);
  //Se refresca el valor del lbl que despliega el valor del volumen en el UI
  $("#valorVolumenMusica").html(entrada);
}

/*Funcion encargada de reproducir en reversa la cancion o rever*/
function inversorMusical(){

  //si la cacion no se esta ejecunatdo no se realiza el reto de la funcion
  if(!soundMode) return;

  //if encargo de revisar si la variable de invertido esta en un valor de true y si este 
  //es el caso colocar la cancion a velocidad de 1 a sonar normal 
  if(invertidor){
    
    //se asigna el valor de velocidad 1 a la cancion
    sound.rate(1);

    //se actualiza el valor la variable invertidor
    invertidor=false;

    //Se actualiza el valor del lbl con la velocidad de la cancion
    document.getElementById("valorVelocidadMusica").innerHTML ="1";

    //se asigna el valor de 1 al slider de velocidad
    document.getElementById("barraVelocidad").value=1;
  }

  //else que se ejecutara si el if anterior no cumple con la condicion, si 
  //es el caso colocar la cancion a velocidad de -1 a sonar en reversa
  else{
  
    /*Por un error de la libreria se hace un juego con la velocidad negativa para que esta
    pueda ser ejecutada*/

    //se asigna el valor de velocidad -1 a la cancion    
    sound.rate(-1);
    
    //se asigna el valor de velocidad 0 a la cancion
    sound.rate(0);
    
    //se asigna el valor de velocidad -1 a la cancion
    sound.rate(-1);

    //se actualiza el valor la variable invertidor
    invertidor=true;

    //Se actualiza el valor del lbl con la velocidad de la cancion
    document.getElementById("valorVelocidadMusica").innerHTML ="-1";

    //se asigna el valor de 1 al slider de velocidad
    document.getElementById("barraVelocidad").value=1;
  }
}
