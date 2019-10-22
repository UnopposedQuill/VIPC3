let volumen, canvas, textCanvas, backPlot,  sel, fileInput;
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
let fftwave, fftspec, amplitude, mic;
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

let peaks = [];
let points = [];

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
  fftwave = new p5.FFT(0,1024);
  fftspec = new p5.FFT(0,32);

  canvas = createCanvas(windowWidth,windowHeight,WEBGL);
  colorMode(HSB);
  frameRate(24);
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
  
  tileWidth = width/32, tileHeight = width/50; //constantes magicas
  
  /*Esto es para mensajes de estado*/
  /*Al usar un render 3d no acepta dibujar texto normalmente*/
  textCanvas = createGraphics(400,400);
    textCanvas.background(0);
    textCanvas.fill(255);
    textCanvas.textAlign(CENTER,CENTER);
    textCanvas.textSize(24);
    textCanvas.text('Archivo no cargado\nEspera unos minutos\nO prueba con otro',200,200);
  

  backPlot = createGraphics(width,height);
  backPlot.colorMode(HSB);
  backPlot.noStroke();
}

function draw(){
  background(15);
  if(!sound.isLoaded()  && soundMode) {
    image(textCanvas,-200,-200);
    return;
  }
  /* ========================================= *
   *  Calculos matematicos, update fisicos
   *   Y otras cosas no relacionadas al dibujo
   * ========================================= */
  
  let spectrum = fftspec.analyze();
  let spectrumfull = fftwave.analyze();
  /*
  cR = (cR+fftspec.getEnergy("treble"))/2
  cG = (cG+fftspec.getEnergy("mid"))/2
  cB = (cB+fftspec.getEnergy("bass"))/2
  */
  let waveform = fftwave.waveform();

  /*Aca meto el estado actual del espectro a la cola del mapa de altura*/
  let row = heightMap.push([])-1;
  for(let i=0;i<spectrum.length;i++) heightMap[row][i] = spectrum[i];
  /*Elimino la cabeza si ya hay 90 estados
   *60 es una heruristica empirica que parece funcionar bien
   */
  if(heightMap.length>=60) heightMap.shift();

  /* ========================================= *
   *  Seccion del dibujo
   * ========================================= */

  /*ilimpia el buffer de los puntos*/
  backPlot.background(15);
  /*recorre la matriz*/
  points.forEach((l,i)=>{l.forEach((p,j)=>{
    let wave = waveform[i*32+j]*5 //el offset o movimiento que se le data a cada punto
      , spec = spectrumfull[i*32+j] //tamaño y alpha
      , pos  = i*32+j;
    let nx = wave, ny=wave, r = map(spec,0,255,5,25);
    backPlot.fill(map(pos,0,waveform.length,0,255),100,100,spec/255.);
    backPlot.ellipse(p.x,p.y,r,r);
    backPlot.ellipse(backPlot.width-p.x,p.y,r,r);
    /*mueve los puntos y hace que ciclen al llegar a los bordes*/
    p.x += nx;
    if(p.x<0)p.x+=backPlot.width;
    if(p.x>backPlot.width)p.x-=backPlot.width;
    p.y += ny;
    if(p.y<0)p.y+=height;
    if(p.y>backPlot.height)p.y-=backPlot.height;
  })});
  push();
  translate(0,0,-4*height);
  texture(backPlot)
  plane(4*backPlot.width,4*backPlot.height);
  pop();
//pone la imagen del buffer de los puntos atras de las montañas
//  translate(0,0,-70*tileHeight);
//  texture(backPlot)
  //la escala ya que al dibujarla atras se hace mas pequenha
//  plane(backPlot.width,backPlot.height);
//  pop();
  
  /*Lo que hace esto es renderizar la matriz del mapa de altura
   *Como varios triangle_strip, donde la altura es el valor del espectro
   *Se puede ver como z->tiempo, x->frecuencia, y->amplitud de la freq
   */
  noStroke();
  /*Ajuste a la izquierda para que quede centrado, y con un margen para que asi las filas de atras no se vean pequeñas
   *Ajuste Vertical para que el origen vertical este en la base de la pantalla
   *No hay ajuste de Z
   */
  
  push();
    translate(-width/2,0,0);
    /**Rotate para ver el map con angulo**/
    //rotateX(-0.5);
    for(let i=0;i<(heightMap.length-1);++i){
      /*normal*/
      beginShape(TRIANGLE_STRIP)
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
        vertex(j*(tileWidth)-width/2,height-heightMap[i][j]  ,(1-i)*tileHeight);
        fill(map(j,0,32,0,360),100,(heightMap[i+1][j]/255.)*100);
        vertex(j*(tileWidth)-width/2,height-heightMap[i+1][j], (-i)*tileHeight);
      }
      /*reflejo simetrico*/
      for(let j=heightMap[i].length-1;j>=0;--j){
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
        vertex(width-j*(tileWidth)+width/2,height-heightMap[i][j]  ,(1-i)*tileHeight);
        fill(map(j,0,32,0,360),100,(heightMap[i+1][j]/255.)*100);
        vertex(width-j*(tileWidth)+width/2,height-heightMap[i+1][j], (-i)*tileHeight);
      }
      endShape();
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

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  tileWidth = width/32, tileHeight = width/50; //constantes magicas
}
