let volumen, canvas, textCanvas, backPlot,  sel, fileInput, celljunior, ditto;
let puntos=[], curr, past, present, ushade;
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
let spoints = [];
let mpoints = [];

let cR=0,cG=0,cB=0;

let CanvasEllipsenaitor;

function preload(){
  ushade = loadShader(
    'https://raw.githubusercontent.com/UnopposedQuill/VIPC3/master/shader.vert?token=AETROEE73E3XYGMYOT3WGDS5XIH7A'
   ,'https://raw.githubusercontent.com/UnopposedQuill/VIPC3/master/shader.frag?token=AETROEHX3XJCXGGVHV77P5K5XIH4O');
}

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


  createSpan("Visualizavion:").parent('#Encapsulador5').class('lbl');
  sel.changed(selChange);
  ditto = createSelect().parent('#Encapsulador5');
  ditto.class('selectorClass');
  ditto.option('Colinas');
  ditto.option('Titus');
  ditto.option('Estrellas');
  ditto.option('Gotus');
  
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

  present = createGraphics(width/2,height/2,WEBGL);
  curr = createGraphics(width/2,height/2);
  past = createGraphics(width/2,height/2);
  past.colorMode(HSB);
  past.noStroke();
  for(let i=0;i<1024;++i){
    puntos[i] = {x:random(width/2),y:random(height/2)};
  }

  CanvasEllipsenaitor = createGraphics(width,height);
  
  clearGrid();
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


  /* ========================================= *
   *  Seccion del dibujo
   * ========================================= */
   if(ditto.value()==="Colinas"){
     luces(waveform,spectrumfull);
     montanha(spectrum);
   } else if(ditto.value()==="Titus"){
    push();
    scale(2,2,0);
    softSpectre(spectrumfull.filter((v,i)=>i%3==0));
    pop();

    //llama el metodo que dibuja las ellipses en el canvas de elipses;
    ellipsinador();
    push();
    translate( -(width/2), -(height/2),0);
    image(CanvasEllipsenaitor,0,0);
    pop();
  
  } else if(ditto.value()==="Estrellas"){
    push();
    translate(0,0,-4*height);
    scale(10,10,0);
    softSpectre(spectrumfull.filter((v,i)=>i%3==0));
    pop();
    montanha(spectrum);
  } else if(ditto.value()==="Gotus"){
    push();
      translate(0,0,-4*height);
      scale(4,4,0);
      ellipsinador();
    translate( -(width/2), -(height/2),0);
      image(CanvasEllipsenaitor,0,0);
    pop();
     montanha(spectrum);
  }
  //Actualizaciones de los UI de la demostracion Grafia
  
  //metodo encargado de actualizar el Slider de tiempo del UI
  valorTiempoBarraMusica(sound.currentTime()); 
  
  //metodo encargado de actualizar los botones en ejecucion dependiendo de su estado
  actualizarbtn();
  
  //metodo encargado de revisar si el loop de la cancion esta activo para repertirse
  //noEjecutarLoop();
} 

function softSpectre(spectrum){
  if(sound){
    for(let i=0;i<spectrum.length;++i){
      past.fill(255*i/spectrum.length,100,100,0.5);
      past.ellipse(puntos[i].x, puntos[i].y, 20*spectrum[i]/255);
    }
  }
  if(mouseX<width && mouseY<height){
    past.fill(255);
    past.push();
    past.ellipse(mouseX/2,mouseY/2,10,10);
    past.pop();
  }
  present.shader(ushade);
  ushade.setUniform('curr',curr);
  ushade.setUniform('prev',past);
  ushade.setUniform('texelSize',[1.0/width,1.0/height]);
  present.rect(0,0,width,height);
  curr.image(present,0,0);

  let tmp = curr;
  curr = past;
  past = tmp;

  texture(present);
  noStroke();
  plane(present.width,present.height);
}

function luces(waveform, spectrumfull){
  if(soundMode){
    /*ilimpia el buffer de los puntos*/
    backPlot.background(15);
    /*recorre la matriz*/
    spoints.forEach((l,i)=>{l.forEach((p,j)=>{
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
  } else {
    /*ilimpia el buffer de los puntos*/
    backPlot.background(15);
    /*recorre la matriz*/
    mpoints.forEach((l,i)=>{l.forEach((p,j)=>{
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
  }
}

function montanha(spectrum){
  /*Aca meto el estado actual del espectro a la cola del mapa de altura*/
  let row = heightMap.push([])-1;
  for(let i=0;i<spectrum.length;i++) heightMap[row][i] = spectrum[i];
  /*Elimino la cabeza si ya hay 90 estados
   *60 es una heruristica empirica que parece funcionar bien
   */
  if(heightMap.length>=60) heightMap.shift();
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

/*funcion encargada de dibujar ellipses dentro del canvas*/
function ellipsinador(){
  CanvasEllipsenaitor.clear();
  
  CanvasEllipsenaitor.rectMode(CENTER);

  var ancho = amplitude.getLevel();

  // creacion de Titusineitor

  //creaccion del cuerpo del bot

  CanvasEllipsenaitor.fill(0,155*ancho+150,0);
  
  CanvasEllipsenaitor.ellipse(width/2, height/2 - 150,50 ,50);

  //Oreja 2 verde
  CanvasEllipsenaitor.rect(width/2, height/2 ,370 ,25);


  //Oreja 1 verde
  CanvasEllipsenaitor.rect(width/2, height/2 ,350 ,50);
  
  CanvasEllipsenaitor.ellipse(width/2 + 170, height/2 - 165, 30 ,30);
  CanvasEllipsenaitor.ellipse(width/2 - 170 , height/2 - 165, 30 ,30);


  //brazo1

  CanvasEllipsenaitor.rect(width/2 , height/2 + 190, 600, 60);


  //brazo1

  CanvasEllipsenaitor.rect(width/2 , height/2 + 190, 500, 110);

  //cabeza Cuadrada
  CanvasEllipsenaitor.fill("#333333");
  CanvasEllipsenaitor.rect(width/2, height/2, 300, 300);
  //Orejas del Bot
  CanvasEllipsenaitor.rectMode(CORNER);
  CanvasEllipsenaitor.rect(width/2 + 165, height/2 - 150, 10, 175);
  CanvasEllipsenaitor.rect(width/2 - 175 , height/2 - 150, 10, 175);

  //reset center
  CanvasEllipsenaitor.rectMode(CENTER);
  //Base de Ojos y Boca
  CanvasEllipsenaitor.fill("#FFFFFF");

  
  CanvasEllipsenaitor.rect(width/2 , height/2 +20, 100, ancho*200 +10);

  CanvasEllipsenaitor.ellipse(width/2 - 50, height/2 -75, 80, 80);
  
  CanvasEllipsenaitor.ellipse(width/2 + 50, height/2 -75, 80, 80);

  //Colores de Ojos y Boca
  
  CanvasEllipsenaitor.fill(0,155*ancho+175,0);

  CanvasEllipsenaitor.rect(width/2 , height/2 +20, 95, ancho*200 +5);


  CanvasEllipsenaitor.ellipse(width/2 - 50, height/2 -75, 75, 75);
  
  CanvasEllipsenaitor.ellipse(width/2 + 50, height/2 -75, 75, 75);

  //internos de Ojos y Boca
  CanvasEllipsenaitor.fill("#FFFFFF");

  CanvasEllipsenaitor.rect(width/2 , height/2 +20, 95, ancho*200);
  
  CanvasEllipsenaitor.ellipse(width/2 - 50, height/2 -75, 70, 70);
  
  CanvasEllipsenaitor.ellipse(width/2 + 50, height/2 -75, 70, 70);

  //Cuerpo

  CanvasEllipsenaitor.rectMode(CORNER);
  CanvasEllipsenaitor.fill("#333333");
  CanvasEllipsenaitor.rect(width/2 - 220, height/2 + 100, 440, 440);
  
  CanvasEllipsenaitor.rect(width/2 - 275, height/2 + 125, 25, 440);

  CanvasEllipsenaitor.rect(width/2 + 250, height/2 + 125, 25, 440);

  CanvasEllipsenaitor.rectMode(CENTER);

  //contenedor placa
  CanvasEllipsenaitor.fill("#444444");
  CanvasEllipsenaitor.rect(width/2 , height/2 + 190, 350, 110);

  //Panel de control

  CanvasEllipsenaitor.fill(0,155*ancho+175,0);
  

  CanvasEllipsenaitor.rect(width/2 - 150, height/2 + 190, 10, 100);  

    CanvasEllipsenaitor.ellipse(width/2 - 100, height/2 + 190, 10, 100);

      CanvasEllipsenaitor.rect(width/2 - 50, height/2 + 190, 10, 100);

        CanvasEllipsenaitor.rect(width/2 , height/2 + 190, 20, 100);

      CanvasEllipsenaitor.rect(width/2 + 50, height/2 + 190, 10, 100);

    CanvasEllipsenaitor.ellipse(width/2 + 100, height/2 + 190, 10, 100);

  CanvasEllipsenaitor.rect(width/2 + 150, height/2 + 190, 10, 100);
}
