let volumen, canvas, textCanvas, sel;
let sound, fft, amplitude, mix;
let soundMode = true; //true=>archivo, false=>audio de la computadora/microfono
/*********************************************************
 *********************************************************
 **                      CUIDADO                        **
 **   EL MODO DE AUDIO DE LA COMPUTADORA ES MAS PESADO  **
 **  SE ESPERA LAG CONSIDERABLE COMPARADO AL DE ARCHIVO **
 *********************************************************
 *********************************************************/

let fileInput;
let hmap = [];
let w, small, big;
let barraDuracionActiva = true;
let loopActivo = true;
let invertidor=false;

function setup(){
  /*Archivo de audio por defecto*/
  sound = loadSound('assets/megalovania.mp3',soundLoaded,soundError);
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
  w = big/16;
  
  colorMode(HSB); 

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
  background(0);
  if(sound.isLoaded() || !soundMode){
    
    if(soundMode) sound.setVolume(volumen.value());
    /*Aca meto el estado actual del espectro a la cola del mapa de altura*/
    let row = hmap.push([])-1;
    let w = width/12, uv = width/50; //constantes magicas
    let spectrum = fft.analyze(32);
    for(let i=0;i<spectrum.length;++i) hmap[row][i] = spectrum[i];
    /*Elimino la cabeza si ya hay 90 estados
     *90 es una heruristica empirica que parece funcionar bien
     */
    if(hmap.length>=90) hmap.shift();

    noStroke();
 
    /*Lo que hace esto es renderizar la matriz del mapa de altura
     *Como varios triangle_strip, donde la altura es el valor del espectro
     *Se puede ver como z->tiempo, x->frecuencia, y->amplitud de la freq
     */
    push();
    /*Ajuste a la izquierda para que quede centrado, y con un margen para que asi las filas de atras no se vean pequeñas
     *Ajuste Vertical para que el origen vertical este en la base de la pantalla
     *No hay ajuste de Z
     */
    translate(-width/2-10*w,height/2,0);
    /**Rotate para ver el map con angulo**/
    rotateX(-0.5);
    for(let i=0;i<(hmap.length-1);++i){
      beginShape(TRIANGLE_STRIP);
      for(let j=0;j<hmap[i].length;++j){
        /*j->columna de la fila, x
         *i->fila del hmap, z, con un ajuste para que la primera fila (la mas antigua) siempre este fuera de pantalla y no se vea el corte
         *h[i][j]->altura de la frecuencia, y
         */
        /**Color por vertex**/
        fill(map(j,0,32,0,360),100,map(hmap[i][j],0,255,0,100));
        vertex(j*w,height-hmap[i][j],-i*uv+uv);
        fill(map(j,0,32,0,360),100,map(hmap[i+1][j],0,255,0,100));
        vertex(j*w,height-hmap[i+1][j],-i*uv);
      }
      endShape();
    }
    pop();

    /*El circulito de la waveform, habria que hacer algo interesante con este*/
    let waveform = fft.waveform(128);
    fill(255,0);
    push();
    translate(0,0,-10);
    {
      beginShape();
      stroke(map(amplitude.getLevel(),0,1,0,360),100,100);// color varia con el volumen de la cancion
      strokeWeight(4);
      for (var i = 0; i< waveform.length; i++){
        let theta = map(i, 0, waveform.length, 0, TAU);
        let r = map( waveform[i], -1, 1, small/8, small/4);
        let x = r * sin(theta);
        let y = r * cos(theta);
        curveVertex(x,y,0);
      }
      endShape(CLOSE);
    }
    pop();
  } else {
    texture(textCanvas);
    plane(400,400);
  }

  //Actualizaciones de los UI de la demostracion Grafia
  $("#Duracion1").html(tiempoMusica(sound.currentTime())) ;
  $("#Duracion2").html(tiempoMusica(sound.duration()));

  //metodo encargado de actualizar el Slider de tiempo del UI
  valorTiempoBarraMusica(sound.currentTime()); 
  //metodo encargado de actualizar los botones en ejecucion dependiendo de su estado
  actualizarbtn();
  //metodo encargado de revisar si el loop de la cancion esta activo para repertirse
  noEjecutarLoop();
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

function mousePressed(){
  if(mouseX>0&&mouseX<width&&mouseY>0&&mouseY<height) toggleSound();
}

function fileHandle(file){
  if(file.type=="audio"){
    textCanvas.background(0);
    textCanvas.text('Archivo no cargado\nEspera unos minutos\nO prueba con otro',200,200);
    sound.stop();
    sound = loadSound(file,soundLoaded,soundError);
  } else {
    soundError();
  }
}

function soundLoaded(){
  if(!soundMode) return;
  sound.playMode('restart');
  sound.loop();
  document.getElementById("seekTime").max = parseInt(sound.duration());
}

function soundError(){
    textCanvas.background(0);
    textCanvas.text('Archivo no cargado\nPrueba con otro',200,200);
}

/*Funcion encargado de actualizar el volumen de la cancion utlizando un slider del UI*/
function volumenMusica(self){
  
  if(!soundMode) return;
  //Obtiene el valor del Slider de volumen del UI y pasa el valor a un numero
  var entrada = parseInt(self.value);
  //Asigna el valor del volumen a la cancion pero lo divide entre 10 porque el radio de valor 0.0 a 1.0
  volumen.value(entrada/10);
  //Se refresca el valor del lbl que despliega el valor del volumen en el UI
  $("#valorVolumenMusica").html(entrada);
}

/*Funcion encargada padar los segundos dados  en eun patron de MM:SS*/
function tiempoMusica(valor){

  if(!soundMode) return;
  
  //Variable encargada de obtener los Minutos de la cancion
  var minutos = parseInt(valor/60);
  
  //Variable encargada de obtener los Segundos de la cancion
  var segundos= parseInt(valor%60);
  
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


function valorTiempoBarraMusica(valor){
  if(barraDuracionActiva){
    document.getElementById("seekTime").value = parseInt(valor);

  }  
}

function tiempoBarraMusica(self){
  if(!soundMode) return;
  var tiempo=parseInt(self.value);
  //sound.stop();
  sound.jump(tiempo);
  barraDuracionActiva = true;
}

function noActualizarBarraMusica(){
  barraDuracionActiva = false;
}

function ActualSizarBarraMusica(){
  barraDuracionActiva = true;

}

function btnStop(){
  if(!soundMode) return;
  sound.stop();
}

function actualizarbtn(){
  if(!soundMode) return; 
  if(sound.isPlaying()){
    document.getElementById("btnPausa").innerHTML = "Play";
    document.getElementById("btnPausa").style.background = "#77FF55";
  } else {
    document.getElementById("btnPausa").innerHTML = "Pause";
    document.getElementById("btnPausa").style.background = "#4CAF50";
  }

  if(loopActivo){
    document.getElementById("btnLoop").innerHTML = "Loop ON";
    document.getElementById("btnLoop").style.background = "#77FF55";
  } else {
    document.getElementById("btnLoop").innerHTML = "Loop OFF";
    document.getElementById("btnLoop").style.background = "#4CAF50";
  
  }

  if(invertidor){
    document.getElementById("btnReversa").innerHTML = "Reversa ON";
    document.getElementById("btnReversa").style.background = "#77FF55";
  } else {
    document.getElementById("btnReversa").innerHTML = "Reversa OFF";
    document.getElementById("btnReversa").style.background = "#4CAF50";
  }
  
}

function Velocidad(self){
  if(!soundMode) return;
  var entrada = parseInt(self.value);
  if(invertidor){
    entrada=entrada*-1;
  }

  sound.rate(entrada);
  document.getElementById("valorVelocidadMusica").innerHTML = entrada;
  //invertidor=false;
}

function btnLoopMetodo(){
  if(!soundMode) return;
  if(loopActivo){
    loopActivo=false;
  }
  else{
    loopActivo=true;
  }
}

function noEjecutarLoop(){
  if(!soundMode) return;
  var test1 = parseInt(sound.currentTime());
  var test2= parseInt(sound.duration());
  //console.log(test1 + " - " + test2);  
  if(!loopActivo && test1 == test2 && sound.isLoaded()){
    sound.stop();
  }

}

function selChange(){
  let value = sel.value();
  if(value==="Archivo"){
    if(!soundMode){ //!sM => estaba con el mic
      mic.stop();
      if(sound.isLoaded())sound.play();
      fft.setInput(sound);
    }
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
    if(soundMode) { //sM => archivo, hay que arrancar
      mic.start();
      fft.setInput(mic);
    }
    soundMode = false;
  }
}
