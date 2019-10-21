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
  fileInput = createFileInput(fileHandle).parent('#Encapsulador4');
  fileInput.class('fileInputClass');
  /*Observer del volumen*/
  amplitude = new p5.Amplitude();
  /*Monitor de audio*/
  mic = new p5.AudioIn();
  /*trasnformada rapida de fourier, para el espectro*/
  fft = new p5.FFT(0,32);

  canvas = createCanvas(windowWidth,windowHeight,WEBGL);
  //volumen = createSlider(0,1,0.5,0.1);
  sel = createSelect().parent('#Encapsulador5');
  sel.class('selectorClass');
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
  
  //metodo encargado de actualizar el Slider de tiempo del UI
  valorTiempoBarraMusica(sound.currentTime()); 
  
  //metodo encargado de actualizar los botones en ejecucion dependiendo de su estado
  actualizarbtn();
  
  //metodo encargado de revisar si el loop de la cancion esta activo para repertirse
  //noEjecutarLoop();
} 



/*Funcion encargada de desactivar la actualizacion del Slider seekTime*/
/*function noActualizarBarraMusica(){
  //Se desactiva la actualizacion de la barra
  barraDuracionActiva = false;
}*/

/*Funcion encargada de activar la actualizacion del Slider seekTime*/
/*function ActualSizarBarraMusica(){

  //Se activa la actualizacion de la barra
  barraDuracionActiva = true;
}*/

function windowResized() {resizeCanvas(windowWidth, windowHeight);}
