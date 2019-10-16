let volumen, canvas, textCanvas;
let sound, fft, amplitude;

let fileInput;
let hmap = [];
let w, small, big;

function setup(){
  /*Archivo de audio por defecto*/
  sound = loadSound('assets/megalovania.mp3',soundLoaded,soundError);
  /*Input de archivo*/
  fileInput = createFileInput(fileHandle);
  /*Observer del volumen*/
  amplitude = new p5.Amplitude();
  /*trasnformada rapida de fourier, para el espectro*/
  fft = new p5.FFT(0,32);


  canvas = createCanvas(windowWidth,windowHeight,WEBGL);
  volumen = createSlider(0,1,0.5,0.1);
  
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
  if(sound.isLoaded()){
    
    sound.setVolume(volumen.value());
    //if(frameCount%2==0){
    /*Aca meto el estado actual del espectro a la cola del mapa de altura*/
    let row = hmap.push([])-1;
    let spectrum = fft.analyze(32);
    for(let i=0;i<spectrum.length;++i) hmap[row][i] = spectrum[i];
    /*Elimino la cabeza si ya hay 32 estados*/
    if(hmap.length>=90) hmap.shift();
//}
    noStroke();
 
    /*Lo que hace esto es renderizar la matriz del mapa de altura
     *Como varios triangle_strip, donde la altura es el valor del espectro
     *Se puede ver como z->tiempo, x->frecuencia, y->amplitud de la freq
     */
    push();
    /*Constantes magicas*/
    translate(-(w*16),0,-(26*50));
    rotateX(10*PI/27);
    for(let i=0;i<(hmap.length-1);++i){
      beginShape(TRIANGLE_STRIP);
      for(let j=0;j<hmap[i].length;++j){
        fill(map(j,0,32,0,360),100,map(hmap[i][j],0,255,0,100));
        vertex(j*w,big-i*(26),hmap[i][j]);
        fill(map(j,0,32,0,360),100,map(hmap[i+1][j],0,255,0,100));
        vertex((j)*w,big-(i+1)*(26),hmap[i+1][j]);
      }
      endShape();
    }
    pop();

    /*El circulito de la waveform, habria que hacer algo interesante con este*/
    let waveform = fft.waveform(128);
    fill(255,0);
    push();
    {
      beginShape();
      stroke(map(amplitude.getLevel(),0,1,0,360),100,100);// color varia con el volumen de la cancion
      strokeWeight(4);
      for (var i = 0; i< waveform.length; i++){
        let theta = map(i, 0, waveform.length-1, 0, TAU);
        let r = map( waveform[i], -1, 1, small/8, small/4);
        let x = r * sin(theta);
        let y = r * cos(theta);
        curveVertex(x,y,-10);
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

  valorTiempoBarraMusica(sound.currentTime()); 
} 

function toggleSound(){
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
    volume.valumen(0.5);
  } else {
    soundError();
  }
}

function soundLoaded(){
  sound.playMode('restart');
  sound.loop();
}
function soundError(){
    textCanvas.background(0);
    textCanvas.text('Archivo no cargado\nPrueba con otro',200,200);
}

function volumenMusica(self){
  var entrada = parseInt(self.value);
  console.log(volumen);
  console.log(entrada/10);
  //volumen =  parseInt(entrada);
  //volumen = parseInt(entrada)/10;
  volumen.value(entrada/10);

  $("#valorVolumenMusica").html(entrada);
  console.log(sound.pan());

}


function tiempoMusica(valor){
  var minutos = parseInt(valor/60);
  var segundos= parseInt(valor%60);
  if(minutos<=9){
    minutos="0"+ minutos;

  }

  if(segundos<=9){
    segundos="0"+ segundos;

  }

  return minutos +":"+ segundos;
}

function valorBarraMusica(valor){
  //document.getElementById("myRange").value = "75";
}


function valorTiempoBarraMusica(valor){
  document.getElementById("seekTime").value = parseInt(valor);
}

function tiempoBarraMusica(self){
 var tiempo=parseInt(self.value);
 //sound.stop();
 sound.jump(tiempo);
}

