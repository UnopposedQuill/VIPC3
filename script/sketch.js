let x=0,y=120;
let slider, canvas;
let sound, fft;

let cRojo ,cAzul;

function setup(){
  //sound = loadSound('assets/megalovania.mp3',()=>{sound.loop();});
  sound = loadSound('assets/BohemianRhapsody.mp3',()=>{sound.loop();});
  
  canvas = createCanvas(400,400);
  y = width/2;
  fft = new p5.FFT();
  slider = createSlider(0,1,0.5,0.1);

  cRojo = color(255,0,0);
  cAzul = color(0,0,255);
}

function draw(){
  background(206);
  if(sound.isLoaded()){
    sound.setVolume(slider.value());
    
    var spectrum = fft.analyze();
    for (var i = 0; i< spectrum.length; i++){
      let theta = map(i, 0, spectrum.length, 0, TAU);
      let r = -width/2 + map(spectrum[i], 0, 255, width/2, 0);
      let x = r * sin(theta) + width/2;
      let y = r * cos(theta) + width/2;
      stroke(lerpColor(cRojo,cAzul,theta/TAU));
      line(width/2,width/2,x,y);
      //line(x, height, width / spectrum.length, h )
    }
    
    var waveform = fft.waveform();
    noFill();
    beginShape();
    stroke(255,0,0); // waveform is red
    strokeWeight(1);
    for (var i = 0; i< waveform.length; i++){
      let theta = map(i, 0, waveform.length, 0, TAU);
      let r = map( waveform[i], -1, 1, 0, width/2);
      let x = r * sin(theta);
      let y = r * cos(theta);
      vertex(x+width/2,y+width/2);
    }
    endShape();
  } else {
    textAlign(CENTER,CENTER);
    textSize(24);
    text('Archivo no cargado\nEspera unos minutos\nO prueba con otro',width/2,height/2);
  }
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
