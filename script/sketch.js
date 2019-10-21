let volumen, canvas, textCanvas, sel, fileInput;
/*sound dummy para que no me de errores por no cargar el archivo default*/
/*Ya me canse de los primeros 10s de Megalovania*/
let sound = {
  isLoaded:function(){return false;},
  currentTime:function(){return 0;},
  duration: function(){return 1;},
  isPlaying:function(){return false;},
  stop:function(){},
  play:function(){},
  loop:function(){},
}
let fft, amplitude, mic;
let soundMode = true; //true=>archivo, false=>audio de la computadora/microfono
/*********************************************************
 *********************************************************
 **                      CUIDADO                        **
 **   EL MODO DE AUDIO DE LA COMPUTADORA ES MAS PESADO  **
 **  SE ESPERA LAG CONSIDERABLE COMPARADO AL DE ARCHIVO **
 *********************************************************
 *********************************************************/

let heightMap = [];
let small, big;
let barraDuracionActiva = true;
let loopActivo = true;
let invertidor=false;
let tileWidth, tileHeight;

let cR=0,cG=0,cB=0;

function setup(){
  /*Archivo de audio por defecto*/
  //sound = loadSound('assets/megalovania.mp3',soundLoaded,soundError);
  /*Input de archivo*/
  fileInput = createFileInput(fileHandle);
  /*Observer del volumen*/
  amplitude = new p5.Amplitude();
  /*Monitor de audio*/
  mic = new p5.AudioIn();
  /*trasnformada rapida de fourier, para el espectro*/
  fft = new p5.FFT(0,32);

  canvas = createCanvas(windowWidth,windowHeight,WEBGL);
  volumen = createSlider(0,1,0.5,0.1);
  sel = createSelect();
  sel.option("Archivo");
  mic.getSources(ls=>{ //lista de sources de audio
    ls.forEach((d,i)=>{ //data index de cada elemento del array
      sel.option(d.label);
    });
  });
  sel.changed(selChange);
  
  small = min(width,height);
  big = max(width,height);
  
  tileWidth = width/12, tileHeight = width/50; //constantes magicas
  
  /*Esto es para mensajes de estado*/
  /*Al usar un render 3d no acepta dibujar texto normalmente*/
  textCanvas = createGraphics(400,400);
    textCanvas.background(0);
    textCanvas.fill(255);
    textCanvas.textAlign(CENTER,CENTER);
    textCanvas.textSize(24);
    textCanvas.text('Archivo no cargado\nEspera unos minutos\nO prueba con otro',200,200);
}

function draw(){
  background(15);
  if(!sound.isLoaded()  && soundMode) {
    texture(textCanvas);
    plane(400,400);
    return;
  }
  /* ========================================= *
   *  Calculos matematicos, update fisicos
   *   Y otras cosas no relacionadas al dibujo
   * ========================================= */
  //if(soundMode) sound.setVolume(volumen.value());
  
  let spectrum = fft.analyze(32);
  cR = (cR+fft.getEnergy("treble"))/2
  cG = (cG+fft.getEnergy("mid"))/2
  cB = (cB+fft.getEnergy("bass"))/2
  
  let waveform = fft.waveform(128);
  
  /*Aca meto el estado actual del espectro a la cola del mapa de altura*/
  let row = heightMap.push([])-1;
  for(let i=0;i<spectrum.length;++i) heightMap[row][i] = spectrum[i];
  /*Elimino la cabeza si ya hay 90 estados
   *60 es una heruristica empirica que parece funcionar bien
   */
  if(heightMap.length>=60) heightMap.shift();
    


  /* ========================================= *
   *  Seccion del dibujo
   * ========================================= */
  
  /*Lo que hace esto es renderizar la matriz del mapa de altura
   *Como varios triangle_strip, donde la altura es el valor del espectro
   *Se puede ver como z->tiempo, x->frecuencia, y->amplitud de la freq
   */
  push();
  {
    /*Ajuste a la izquierda para que quede centrado, y con un margen para que asi las filas de atras no se vean pequeñas
     *Ajuste Vertical para que el origen vertical este en la base de la pantalla
     *No hay ajuste de Z
     */
    colorMode(HSB);
    noStroke();
    translate(-width/2-10*tileWidth,height/2,0);
    /**Rotate para ver el map con angulo**/
    rotateX(-0.5);
    for(let i=0;i<(heightMap.length-1);++i){
      beginShape(TRIANGLE_STRIP);
      for(let j=0;j<heightMap[i].length;++j){
        /*j->columna de la fila, x
         *i->fila del heightMap, z, con un ajuste para que la primera fila (la mas antigua) siempre este fuera de pantalla y no se vea el corte
         *h[i][j]->altura de la frecuencia, y
         */
        /** (i,j)___(i,j+1)__(i,j+2)
         ** |       /|       /|
         ** |      / |      / |
         ** |     /  |     /  |
         ** (i+1,j)_(i+1,j+1)_(i+1,j+2)
         ** => En cada iteracion coloca los dos puntos que tienen la misma vertical
         **/
        fill(map(j,0,32,0,360),100,(heightMap[i][j]/255.)*100);
        vertex(j*tileWidth,height-heightMap[i][j]  ,(1-i)*tileHeight);
        fill(map(j,0,32,0,360),100,(heightMap[i+1][j]/255.)*100);
        vertex(j*tileWidth,height-heightMap[i+1][j], (-i)*tileHeight);
      }
      endShape();
    }
  }
  pop();

  /*El circulito de la waveform, habria que hacer algo interesante con este*/
  colorMode(RGB);
  push();
  {
    fill(0,0,0,0);
    stroke(cR, cG, cB);
    strokeWeight(4);
    beginShape();
    for (var i = 0; i< waveform.length; i++){
      let theta = map(i, 0, waveform.length, 0, TAU);
      let r = small/4 + waveform[i]*small/8;
      let x = r * sin(theta);
      let y = r * cos(theta);
      curveVertex(x,y,0);
    }
    endShape(CLOSE);
  }
  pop();

  //Actualizaciones de los UI de la demostracion Grafia
  $("#Duracion1").html(tiempoMusica(sound.currentTime())) ;
  $("#Duracion2").html(tiempoMusica(sound.duration()));

  //metodo encargado de actualizar el Slider de tiempo del UI
  valorTiempoBarraMusica(sound.currentTime()); 
  //metodo encargado de actualizar los botones en ejecucion dependiendo de su estado
  actualizarbtn();
  //metodo encargado de revisar si el loop de la cancion esta activo para repertirse
  //noEjecutarLoop();
} 



/*Funcion encargado de actualizar el volumen de la cancion utlizando un slider del UI*/
function volumenMusica(self){
  
  //si la cacion no se esta ejecunatdo no se realiza el reto de la funcion
  if(!soundMode) return;
  //Obtiene el valor del Slider de volumen del UI y pasa el valor a un numero
  var entrada = parseInt(self.value);
  //Asigna el valor del volumen a la cancion pero lo divide entre 10 porque el radio de valor 0.0 a 1.0
  sound.setVolume(entrada/10);
  //Se refresca el valor del lbl que despliega el valor del volumen en el UI
  $("#valorVolumenMusica").html(entrada);
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

/*Funcion encargada de Actualizar el Slider seekTime del UI con el valor actual de en 
cual segundo se encuentra la ejecucion de la cancion*/
function valorTiempoBarraMusica(valor){

  //If encargado de revisar que si se pueda actualizar el valor y que este no 
  //interfiera cuando el usuario intente cambiar el tiempo de ejecucion de la cancion 
  if(barraDuracionActiva){
    
    //se asigna el valor al Slider con los segundos actuales de la cancion
    document.getElementById("seekTime").value = parseInt(valor);
  }  
}


/*Funcion encargada de desactivar la actualizacion del Slider seekTime*/
function noActualizarBarraMusica(){
  //Se desactiva la actualizacion de la barra
  barraDuracionActiva = false;
}

/*Funcion encargada de activar la actualizacion del Slider seekTime*/
function ActualSizarBarraMusica(){

  //Se activa la actualizacion de la barra
  barraDuracionActiva = true;
}

/*Funcion encargada de detener la reproduccion de la cancion que se esta ejecutando*/
function btnStop(){
  
  //si la cacion no se esta ejecunatdo no se realiza el reto de la funcion
  if(!soundMode) return;
  
  //Se detiene la reproduccion de la cancion
  sound.stop();
}

/*Funcion encargada de actualizar el aspecto de los botones dependiendo de los
valores en el que se encuentren en ejecucion*/
function actualizarbtn(){

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

function windowResized() {resizeCanvas(windowWidth, windowHeight);}
