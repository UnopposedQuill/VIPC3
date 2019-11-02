let volumen, canvas, textCanvas, backPlot,  sel, fileInput, celljunior, ditto;
let lineaLoca;
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
let invertidor,fastForward=false;
let tileWidth, tileHeight;

let peaks = [];
let spoints = [];
let mpoints = [];

let cR=0,cG=0,cB=0;

let CanvasEllipsenaitor;

function preload(){
/*  ushade = loadShader(
   'https://raw.githubusercontent.com/UnopposedQuill/VIPC3/master/shader.vert?token=ADTYVSODVAIXI5RJFNY2TAK5YNNR6'
  ,'https://raw.githubusercontent.com/UnopposedQuill/VIPC3/master/shader.frag?token=ADTYVSJKUBO5DFC7VE7J3HC5YNNQE');
*/
}

function setup(){
  /*Archivo de audio por defecto*/
  //sound = loadSound('assets/megalovania.mp3',soundLoaded,soundError);
  /*Input de archivo*/
  fileInput = createFileInput(fileHandle).parent('#Encapsulador6');
  fileInput.class('fileInputClass');
  /*Observer del volumen*/
  amplitude = new p5.Amplitude();
  /*Monitor de audio*/
  mic = new p5.AudioIn();
  /*trasnformada rapida de fourier, para el espectro*/
  fftwave = new p5.FFT(0,1024);
  fftspec = new p5.FFT(0,32);

  let contenedor = document.getElementById("superContenedor");

  canvas = createCanvas(contenedor.offsetWidth,contenedor.offsetHeight,WEBGL).parent('#superContenedor');;
  
  colorMode(HSB);
  frameRate(24);
  //volumen = createSlider(0,1,0.5,0.1);
  /*sel = createSelect().parent('#Encapsulador2');
  sel.class('selectorClass');
  sel.option("Archivo");
  mic.getSources(ls=>{ //lista de sources de audio
    ls.forEach((d,i)=>{ //data index de cada elemento del array
      sel.option(d.label);
    });
  });
*/

  createSpan("Visualizavion Musica:").parent('#Encapsulador2').class('lbl');
  //sel.changed(selChange);
  ditto = createSelect().parent('#Encapsulador2');
  ditto.class('selectorClass');
  ditto.option('Clasic++');
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

  lineaLoca = createGraphics(width,height);
  lineaLoca.background(15);
  lineaLoca.noFill();

  celljunior = createGraphics(width,height);
  celljunior.background(15);
  celljunior.noFill();

  backPlot = createGraphics(width,height);
  backPlot.colorMode(HSB);
  backPlot.noStroke();

  present = createGraphics(width/2,height/2,WEBGL);
  curr = createGraphics(width/2,height/2);
  past = createGraphics(width/2,height/2);
  past.colorMode(HSB);
  past.noStroke();
  puntos = Array.from(Array(ceil(1024/3)),(v,i)=>{return {x:random(width/2),y:random(height/2)}});
  /*creade shader se debe llamar una vez que el contexto exista, lease: canvas*/
  /*se crea dentro del contxto del canvas que se va a usar, o si no... hay tabla*/
  ushade = present.createShader(shaderVert,shaderFrag);
  present.shader(ushade);

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

  cR = (cR+fftwave.getEnergy("treble"))/2
  cG = (cG+fftwave.getEnergy("mid"))/2
  cB = (cB+fftwave.getEnergy("bass"))/2

  let waveform = fftwave.waveform();


  /* ========================================= *
   *  Seccion del dibujo
   * ========================================= */
   if(ditto.value()==="Colinas"){
     luces(waveform,spectrumfull);
     montanha(spectrum,0,300);
   } else if(ditto.value()==="Titus"){
    push();
    scale(2,2,0);
    softSpectre(spectrumfull.filter((v,i)=>i%3==0));
    pop();

    //llama el metodo que dibuja las ellipses en el canvas de elipses;
    colorMode(RGB);
    ellipsinador(color(0,map(amplitude.getLevel(),0,0.5,0,255),0));
    push();
    translate( -(width/2), -(height/2),0);
    image(CanvasEllipsenaitor,0,0);
    pop();
    colorMode(HSB);

  } else if(ditto.value()==="Estrellas"){
    push();
    translate(0,0,-4*height);
    scale(10,10,0);
    softSpectre(spectrumfull.filter((v,i)=>i%3==0));
    pop();
    montanha(spectrum,0,255);
  } else if(ditto.value()==="Gotus"){
    push();
      translate(0,0,-4*height);
      scale(4,4,0);
      circulos(amplitude);
      ellipsinador(color(60,69,map(amplitude.getLevel(),0,0.5,0,100)));
    translate( -(width/2), -(height/2),0);
      image(celljunior,0,0);
      image(CanvasEllipsenaitor,0,0);
    pop();
     montanha(spectrum,160,250,42);
  } else if(ditto.value()==="Clasic++"){
    push();
      translate( -(width/2), -(height/2),0);
      circulos(amplitude);
      image(celljunior,0,0);
      lineFactory(waveform,spectrumfull);
      image(lineaLoca,0,0);
    pop();
  }
  //Actualizaciones de los UI de la demostracion Grafia

  //metodo encargado de actualizar el Slider de tiempo del UI
  valorTiempoBarraMusica(sound.currentTime());

  //metodo encargado de actualizar los botones en ejecucion dependiendo de su estado
  actualizarbtn();
}

function circulos(amplitude){
  celljunior.background(15,10);
  celljunior.stroke(cR,cG,cB);
  celljunior.strokeWeight(20);
  celljunior.noFill();
  celljunior.ellipse(width/2,height/2,amplitude.getLevel()*width/2+width/4);
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
      backPlot.fill(map(pos,0,waveform.length,0,300),100,100,spec/255.);
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

function montanha(spectrum,cBase,cAlto,saturation=100){
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
        fill(map(j,0,32,cBase,cAlto),saturation,(heightMap[i][j]/255.)*100);
        vertex(j*(tileWidth)-width/2,height-heightMap[i][j]  ,(1-i)*tileHeight);
        fill(map(j,0,32,cBase,cAlto),saturation,(heightMap[i+1][j]/255.)*100);
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
        fill(map(j,0,32,cBase,cAlto),saturation,(heightMap[i][j]/255.)*100);
        vertex(width-j*(tileWidth)+width/2,height-heightMap[i][j]  ,(1-i)*tileHeight);
        fill(map(j,0,32,cBase,cAlto),saturation,(heightMap[i+1][j]/255.)*100);
        vertex(width-j*(tileWidth)+width/2,height-heightMap[i+1][j], (-i)*tileHeight);
      }
      endShape();
    }
  pop();
}

function windowResized() {
  let contenedor = document.getElementById("superContenedor");

  resizeCanvas(contenedor.offsetWidth, contenedor.offsetHeight);
  tileWidth = width/32, tileHeight = width/50; //constantes magicas
}

/*funcion encargada de dibujar un Robot dentro del canvas*/
function ellipsinador(eColor){

  //Limpia el canvas donde se muestra el elipsinador
  CanvasEllipsenaitor.clear();

  //comando encargado de crear los rectangulos en P5 desde el centro
  CanvasEllipsenaitor.rectMode(CENTER);

  // se consigue el valor de la aplitud de onda
  var ancho = amplitude.getLevel();

  // creacion de Titus

  //creaccion de las partes verdes que van de base para Orejas y Brazos

  //Se asigna el color Verde a las siguientes partes y a su vez este se
  //saturara mas dependiendo del alto de la frecuencia de la cancion
  CanvasEllipsenaitor.fill(eColor);
  //Bolita de la cabeza del Robot
  CanvasEllipsenaitor.ellipse(width/2, height/2 - 150,50 ,50);

  //Orejas del Robot
    //Parte Externa de la Oreja
    CanvasEllipsenaitor.rect(width/2, height/2 ,370 ,25);
    //Parte Interna de la Oreja
    CanvasEllipsenaitor.rect(width/2, height/2 ,350 ,50);

    //Bolitas de la parte superior de las Orejas
    CanvasEllipsenaitor.ellipse(width/2 + 170, height/2 - 165, 30 ,30);
    CanvasEllipsenaitor.ellipse(width/2 - 170 , height/2 - 165, 30 ,30);

  //Brasos del Robot
    //Parte externa del brazo del Robot
    CanvasEllipsenaitor.rect(width/2 , height/2 + 190, 600, 60);
    //Parte interna del brazo del Robot
    CanvasEllipsenaitor.rect(width/2 , height/2 + 190, 500, 110);

  //Cabeza Del Robot

  //Se asigna el color para las partes Grices de la cabeza
  CanvasEllipsenaitor.fill("#333333");

  //Se crea la base de la cabeza del robot
  CanvasEllipsenaitor.rect(width/2, height/2, 300, 300);

  //Orejas del Robot

    //Comenaod encargado de crear los rectangulos desde la esquina superior derecha
    CanvasEllipsenaitor.rectMode(CORNER);
    //Se crean los palitos que se conectaran las bolitas superiores con el cuerpo
    //de la oreja
    CanvasEllipsenaitor.rect(width/2 + 165, height/2 - 150, 10, 175);
    CanvasEllipsenaitor.rect(width/2 - 175 , height/2 - 150, 10, 175);
    //Se reinicia la creacion de rectangulos desde su centro
    CanvasEllipsenaitor.rectMode(CENTER);

  //Creacion de los Ojos t la boca del Robot

  //Se asigna el color blanco para que sea la base de las figuras a divujar
  CanvasEllipsenaitor.fill("#FFFFFF");
  //Base de los Ojos y la Boca
    //Creacion de la base de la boca
    CanvasEllipsenaitor.rect(width/2 , height/2 +20, 100, ancho*200 +10);
    //creacion de la base de los ojos
    CanvasEllipsenaitor.ellipse(width/2 - 50, height/2 -75, 80, 80);
    CanvasEllipsenaitor.ellipse(width/2 + 50, height/2 -75, 80, 80);

  //Colores de Ojos y Boca

  //Se asigna el color verde para que sea la base de las figuras a divujar
  // ademas la saturacion va a variar con relacion a las frecuencias
  CanvasEllipsenaitor.fill(eColor);
    //Creacion de la parte verde de la boca
    CanvasEllipsenaitor.rect(width/2 , height/2 +20, 95, ancho*200 +5);
    //Creacion de la parte verde de los ojos
    CanvasEllipsenaitor.ellipse(width/2 - 50, height/2 -75, 75, 75);
    CanvasEllipsenaitor.ellipse(width/2 + 50, height/2 -75, 75, 75);

  //Parte interna de  los Ojos y la Boca

  //Se asigna el color blanco para que sea la base de las figuras a divujar
  CanvasEllipsenaitor.fill("#FFFFFF");
    //Creacion de la parte interna de la boca
    CanvasEllipsenaitor.rect(width/2 , height/2 +20, 95, ancho*200);
    //Creacion de la parte interna de los Ojos
    CanvasEllipsenaitor.ellipse(width/2 - 50, height/2 -75, 70, 70);
    CanvasEllipsenaitor.ellipse(width/2 + 50, height/2 -75, 70, 70);

  //Creacion del Cuerpo del Robot

  //Comenaod encargado de crear los rectangulos desde la esquina superior derecha
  CanvasEllipsenaitor.rectMode(CORNER);
  //Se asigna el color para las partes Grices del cuerpo
  CanvasEllipsenaitor.fill("#333333");

  //Base del cuerpo del Robot

    //Creacion del pecho del Robot
    CanvasEllipsenaitor.rect(width/2 - 220, height/2 + 100, 440, 440);
    //Creacion de los brazos del Robot
    CanvasEllipsenaitor.rect(width/2 - 275, height/2 + 125, 25, 440);
    CanvasEllipsenaitor.rect(width/2 + 250, height/2 + 125, 25, 440);
    //Se reinicia la creacion de rectangulos desde su centro
    CanvasEllipsenaitor.rectMode(CENTER);

  //contenedor placa del pecho del Robot
  //Se asigna el color para las parte Gris claro de la placa
  CanvasEllipsenaitor.fill("#444444");
  //Creacion de la placa del Pecho del Robot
  CanvasEllipsenaitor.rect(width/2 , height/2 + 190, 350, 110);

  //Panel de control

  //Se asigna el color verde para que sea la base de las figuras a divujar
  // ademas la saturacion va a variar con relacion a las frecuencias
  CanvasEllipsenaitor.fill(eColor);
    // Barras verdes del panel de control del Robot
    CanvasEllipsenaitor.rect(width/2 - 150, height/2 + 190, 10, 100);
      CanvasEllipsenaitor.ellipse(width/2 - 100, height/2 + 190, 10, 100);
        CanvasEllipsenaitor.rect(width/2 - 50, height/2 + 190, 10, 100);
          CanvasEllipsenaitor.rect(width/2 , height/2 + 190, 20, 100);//Barra del Centro
        CanvasEllipsenaitor.rect(width/2 + 50, height/2 + 190, 10, 100);
      CanvasEllipsenaitor.ellipse(width/2 + 100, height/2 + 190, 10, 100);
    CanvasEllipsenaitor.rect(width/2 + 150, height/2 + 190, 10, 100);
}


/*Funcion encargada de duvujar una linea que ondule con la frecuencia de la
cancion y desplegarlo en el canvas*/
function lineFactory(waveform,spectrum){

  //Funciones encargadas de limpiar y preparar el canvas para dibujar la linea
  //con la cual se va a visualizar las frecuencias del la cancion
  lineaLoca.clear();
  lineaLoca.noFill();
  lineaLoca.stroke(255);
  lineaLoca.noFill();

  //Inicion de la creacion de la linea
  lineaLoca.beginShape();

  //Se le asigna el color verde a la lina de la visualizacion
  lineaLoca.stroke(0,255,0)

  //Se le asigna un ancho de 3 px a la linea
  lineaLoca.strokeWeight(3);

  //For encargado de reccores las freciencias que la cancion
  for (var i = 0; i< waveform.length; i++){

    //variables de "X" y "Y" de la posicion de las frecuencias
    let x = map(i, 0, waveform.length, 0, lineaLoca.width);
    let y = map( waveform[i], -1, 1, 0, lineaLoca.height);

    //asignacion de la posicion del punto de la linea
    lineaLoca.vertex(x,y);
  }

  //Finalizacion de la creacion de la linea
  lineaLoca.endShape();
}

/*js no tiene string multiniea, y quien le diga lo contrario le esta mientiendo*/
var shaderFrag = 
"precision mediump float;"+
"varying vec2 vTexCoord;"+
"uniform sampler2D curr;"+
"uniform sampler2D prev;"+
"uniform vec2 texelSize;"+
"void main() {"+
"  vec2 uv = vTexCoord;"+
"  uv = vec2(uv.x,1.-uv.y);"+
"  vec4 ci = texture2D(curr,uv);"+
"  vec4 pi = texture2D(prev,uv+vec2(texelSize.x,0.))"+
"          + texture2D(prev,uv-vec2(texelSize.x,0.))"+
"          + texture2D(prev,uv+vec2(0.,texelSize.y))"+
"          + texture2D(prev,uv-vec2(0.,texelSize.y));"+
"       pi = pi / 2.0 - ci;"+
"       pi = pi * 0.9;"+
"  gl_FragColor = vec4(pi.rgb,1.);"+
"}";
var shaderVert = 
"attribute vec3 aPosition;"+
"attribute vec2 aTexCoord;"+
"varying vec2 vTexCoord;"+
"void main() {"+
"  vTexCoord = aTexCoord;"+
"  vec4 positionVec4 = vec4(aPosition, 1.0);"+
"  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;"+
"  gl_Position = positionVec4;"+
"}";
