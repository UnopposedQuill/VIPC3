let x=0,y=120;
let volumen, canvas, fqslider;
let sound, fft;

let points = [];

let cRojo ,cAzul;

function setup(){
  sound = loadSound('assets/megalovania.mp3',()=>{sound.loop();});
  //sound = loadSound('assets/BohemianRhapsody.mp3',()=>{sound.loop();});
  
  canvas = createCanvas(400,400);
  y = width/2;
  fft = new p5.FFT(0,256);
  volumen = createSlider(0,1,0.5,0.1);
  //fqslider = createSlider(0,255,128,1);
  
  for(let i=0;i<fft.bins;++i){
    points.push({
      x: random(0,width),
      y: random(0,height),
      color: {r: random(0,255), g: random(0,255), b:random(0,255),}
    });
  }
  cRojo = color(255,0,0);
  cAzul = color(0,0,255);
}

function draw(){
  background(206);
  if(sound.isLoaded()){
    sound.setVolume(volumen.value());
    
    
    let spectrum = fft.analyze();
    for (let i = 0; i< spectrum.length; i++){
      let c = points[i].color;
      fill(c.r,c.g,c.b,120);
      ellipse(points[i].x, points[i].y, map(spectrum[i],0,255,0,40));
    }
     
    
    //let spectrum = fft.analyze();
    for (let i = 0; i< spectrum.length; i++){
      let theta = map(i, 0, spectrum.length, 0, TAU);
      let r = map(spectrum[i], 0, 255, 0, width/4);
      let x = r * sin(theta) + width/2;
      let y = r * cos(theta) + width/2;
      stroke(lerpColor(cRojo,cAzul,theta/TAU));
      line(width/2,width/2,x,y);
      //line(x, height, width / spectrum.length, h )
    }
     
    var waveform = fft.waveform();
    noFill();
    push();
    {
      translate(width/2,height/2);
      beginShape();
      stroke(255,0,0); // waveform is red
      strokeWeight(1);
      for (var i = 0; i< waveform.length; i++){
        let theta = map(i, 0, waveform.length, 0, TAU);//*fqslider.value();
        let r = map( waveform[i], -1, 1, 0, width/2);
        let x = r * sin(theta);
        let y = r * cos(theta);
        vertex(x,y);
      }
      endShape();
    }
    pop();
  } else {
    textAlign(CENTER,CENTER);
    textSize(24);
    text('Archivo no cargado\nEspera unos minutos\nO prueba con otro',width/2,height/2);
  }

  document.getElementById("Duracion").innerHTML = volumenMusica(parseInt(sound.currentTime()))
    + " - " + volumenMusica(parseInt(sound.duration()));
}

function toggleSound(){
  if(sound.isPlaying()){
    sound.pause();
  } else {
    sound.play();
  }
}

function keyPressed(){
  if(key=='p') toggleSound();
}

function mousePressed(){
  if(mouseX>0&&mouseX<width&&mouseY>0&&mouseY<height) toggleSound();
}

function volumenMusica(self){
  var entrada = parseInt(self.value);
  console.log(volumen);
  console.log(entrada/10);
  //volumen =  parseInt(entrada);
  //volumen = parseInt(entrada)/10;
  volumen.value(entrada/10);

  document.getElementById("valorVolumenMusica").innerHTML = entrada;
  console.log(sound.pan());

}


function volumenMusica(valor){
  var minutos = parseInt(valor/60);
  var segundos= valor%60;
  return minutos +":"+ segundos;
}