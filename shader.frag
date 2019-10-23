precision mediump float;

varying vec2 vTexCoord;
// declare a uniform vec2 variable. We use a vec2 because the mouse has both x and y
// p5 will send data to this variable
uniform sampler2D curr;
uniform sampler2D prev;
uniform vec2 texelSize;

void main() {
  vec2 uv = vTexCoord;
  uv = vec2(uv.x,1.-uv.y);
  vec4 ci = texture2D(curr,uv);
  vec4 pi = texture2D(prev,uv+vec2(texelSize.x,0.))
          + texture2D(prev,uv-vec2(texelSize.x,0.))
          + texture2D(prev,uv+vec2(0.,texelSize.y))
          + texture2D(prev,uv-vec2(0.,texelSize.y));
       pi = pi / 2.0 - ci;
       pi = pi * 0.99;
  gl_FragColor = vec4(pi.rgb,1.);
}

