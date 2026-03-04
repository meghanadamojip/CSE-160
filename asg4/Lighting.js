// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
precision mediump float;

attribute vec4 a_Position;
attribute vec3 a_Normal;

uniform mat4 u_ModelMatrix;
uniform mat4 u_GlobalRotateMatrix;
uniform mat4 u_NormalMatrix;

varying vec3 v_NormalW;
varying vec3 v_WorldPos;

void main() {
  vec4 worldPos = u_ModelMatrix * a_Position;
  v_WorldPos = worldPos.xyz;

  v_NormalW = normalize((u_NormalMatrix * vec4(a_Normal, 0.0)).xyz);

  gl_Position = u_GlobalRotateMatrix * worldPos;
}
`;

var FSHADER_SOURCE = `
precision mediump float;

uniform vec4 u_FragColor;

uniform bool u_LightingOn;
uniform bool u_ShowNormals;

uniform vec3 u_LightPos;
uniform vec3 u_CameraPos;
uniform vec3 u_LightColor;

uniform bool  u_SpotOn;
uniform vec3  u_SpotPos;
uniform vec3  u_SpotDir;        // normalized
uniform float u_SpotCosCutoff;  // cos(radians(cutoffDegrees))
uniform vec3  u_SpotColor;

varying vec3 v_NormalW;
varying vec3 v_WorldPos;

void main() {

  if (u_ShowNormals) {
    vec3 n = normalize(v_NormalW);
    gl_FragColor = vec4(n * 0.5 + 0.5, 1.0);
    return;
  }

  vec3 base = u_FragColor.rgb;

  if (!u_LightingOn) {
    gl_FragColor = vec4(base, 1.0);
    return;
  }

  vec3 N = normalize(v_NormalW);
  vec3 V = normalize(u_CameraPos - v_WorldPos);

  vec3 L = normalize(u_LightPos - v_WorldPos);
  vec3 R = reflect(-L, N);

  float diff = max(dot(N, L), 0.0);

  float spec = 0.0;
  if (diff > 0.0) {
    spec = pow(max(dot(R, V), 0.0), 32.0);
  }

  vec3 ambient  = 0.30 * base;
  vec3 diffuse  = diff * base * u_LightColor;
  vec3 specular = 0.35 * spec * u_LightColor;

  vec3 color = ambient + diffuse + specular;


  if (u_SpotOn) {
    vec3 Ls = normalize(u_SpotPos - v_WorldPos);

    
    float spotCos = dot(normalize(-Ls), normalize(u_SpotDir));

    if (spotCos > u_SpotCosCutoff) {
      
      float spotFactor = pow((spotCos - u_SpotCosCutoff) / (1.0 - u_SpotCosCutoff), 8.0);

      float diffS = max(dot(N, Ls), 0.0);
      vec3 Rs = reflect(-Ls, N);

      float specS = 0.0;
      if (diffS > 0.0) {
        specS = pow(max(dot(Rs, V), 0.0), 32.0);
      }

      vec3 diffuseS  = diffS * base * u_SpotColor;
      vec3 specularS = 0.35 * specS * u_SpotColor;

      color += spotFactor * (diffuseS + specularS);
    }
  }

  gl_FragColor = vec4(color, 1.0);
}
`;

let g_lastFPSTime = performance.now();
let g_frameCount = 0;
let g_fps = 0;


//global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;


let g_globalAngle = 0;

let g_yellowlAngle = 0;
let g_magentaAngle = 0;


let g_yellowAnimation = false;
let g_magentaAnimation = false;


let g_tailAnimation = true;


var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;


let g_mouseDown = false;
let g_lastX = 0;
let g_lastY = 0;
let g_mouseAngleX = 0;
let g_mouseAngleY = 0; 


let g_poke = false;
let g_pokeStart = 0;


let g_tailBaseAngle = 0;
let g_tailMidAngle = 0;
let g_tailTipAngle = 0;

let a_Normal;
let u_NormalMatrix;

let u_LightingOn;
let u_ShowNormals;
let u_LightPos;
let u_CameraPos;
let u_LightColor;

// lighting state
let g_lightingOn = true;
let g_showNormals = false;

// light + camera
let g_lightPos = [0.3, 0.6, 0.3];
let g_lightColor = [1.0, 1.0, 1.0];
let g_cameraPos = [0.0, 0.0, 3.0];

let g_lightAnimate = true;
let g_lightRadius = 0.6;
let g_lightHeight = 0.6; 

let g_spotOn = true;
let g_spotPos = [0.0, 0.6, 0.0];
let g_spotDir = [0.0, -1.0, -1.0]; 
let g_spotCutoffDeg = 45.0;
let g_spotColor = [1.0, 1.0, 1.0];

let u_SpotOn, u_SpotPos, u_SpotDir, u_SpotCosCutoff, u_SpotColor;

let g_model;

function setupWebGL() {
  canvas = document.getElementById('webgl');
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!u_NormalMatrix) {
    console.log('Failed to get the storage location of u_NormalMatrix');
    return;
  }

  u_LightingOn = gl.getUniformLocation(gl.program, 'u_LightingOn');
  u_ShowNormals = gl.getUniformLocation(gl.program, 'u_ShowNormals');
  u_LightPos = gl.getUniformLocation(gl.program, 'u_LightPos');
  u_CameraPos = gl.getUniformLocation(gl.program, 'u_CameraPos');
  u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');

  u_SpotOn = gl.getUniformLocation(gl.program, 'u_SpotOn');
  u_SpotPos = gl.getUniformLocation(gl.program, 'u_SpotPos');
  u_SpotDir = gl.getUniformLocation(gl.program, 'u_SpotDir');
  u_SpotCosCutoff = gl.getUniformLocation(gl.program, 'u_SpotCosCutoff');
  u_SpotColor = gl.getUniformLocation(gl.program, 'u_SpotColor');

  if (!u_LightingOn || !u_ShowNormals || !u_LightPos || !u_CameraPos || !u_LightColor) {
    console.log('Failed to get one or more lighting uniform locations');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

  var identityN = new Matrix4();
  gl.uniformMatrix4fv(u_NormalMatrix, false, identityN.elements);


    // init lighting uniforms
    gl.uniform1i(u_LightingOn, g_lightingOn);
    gl.uniform1i(u_ShowNormals, g_showNormals);
    gl.uniform3fv(u_LightPos, g_lightPos);
    gl.uniform3fv(u_CameraPos, g_cameraPos);
    gl.uniform3fv(u_LightColor, g_lightColor);
}

function addActionsforHtmlUI() {
  
  document.getElementById('animationYellowOffButton').onclick = function() { g_yellowAnimation=false; };
  document.getElementById('animationYellowOnButton').onclick  = function() { g_yellowAnimation=true;  };

  document.getElementById('animationMagentaOffButton').onclick = function() { g_magentaAnimation=false; };
  document.getElementById('animationMagentaOnButton').onclick  = function() { g_magentaAnimation=true;  };

  
  document.getElementById('animationTailOnButton').onclick  = function() { g_tailAnimation=true;  };
  document.getElementById('animationTailOffButton').onclick = function() {
    g_tailAnimation=false;
    g_tailBaseAngle = 0;
    g_tailMidAngle  = 0;
    g_tailTipAngle  = 0;
  };

  
  document.getElementById('yellowSlide').addEventListener('input', function() {
    g_yellowlAngle = Number(this.value);
  });

  document.getElementById('magentaSlide').addEventListener('input', function() {
    g_magentaAngle = Number(this.value);
  });

  document.getElementById('angleSlide').addEventListener('input', function() {
    g_globalAngle = Number(this.value);
  });
  document.getElementById('lightSlideX').addEventListener('input', function() {
    g_lightAnimate = false;                 
    g_lightPos[0] = Number(this.value);
  });

  document.getElementById('lightSlideY').addEventListener('input', function() {
    g_lightAnimate = false;
    g_lightPos[1] = Number(this.value);
  });

  document.getElementById('lightSlideZ').addEventListener('input', function() {
    g_lightAnimate = false;
    g_lightPos[2] = Number(this.value);
  });
  document.getElementById('lightColorSlide').addEventListener('input', function() {
    let t = Number(this.value);
    g_lightColor = [1.0, t, t];
  });
  document.getElementById('lightOnBtn').onclick = function() { g_lightingOn = true; };
  document.getElementById('lightOffBtn').onclick = function() { g_lightingOn = false; };
  document.getElementById('normalsOnBtn').onclick = function() {
    g_showNormals = true;
  };
  
  document.getElementById('normalsOffBtn').onclick = function() {
    g_showNormals = false;
  };
}

function initMouseRotateAndPoke() {
  canvas.onmousedown = function(ev) {
   
    if (ev.shiftKey) {
      g_poke = true;
      g_pokeStart = g_seconds;
    }

    g_mouseDown = true;
    g_lastX = ev.clientX;
    g_lastY = ev.clientY;
  };

  canvas.onmouseup = function() {
    g_mouseDown = false;
  };

  canvas.onmouseleave = function() {
    g_mouseDown = false;
  };

  canvas.onmousemove = function(ev) {
    if (!g_mouseDown) return;

    let dx = ev.clientX - g_lastX;
    let dy = ev.clientY - g_lastY;
    g_lastX = ev.clientX;
    g_lastY = ev.clientY;

   
    g_mouseAngleY += dx * 0.5;
    g_mouseAngleX += dy * 0.5;
  };
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();

  gl.enable(gl.DEPTH_TEST);

  addActionsforHtmlUI();
  initMouseRotateAndPoke();

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  requestAnimationFrame(tick);
  g_model = new Model();
  g_model.loadOBJ("OBJModels/bunny.obj");
}

function tick() {
  g_seconds = performance.now()/1000.0 - g_startTime;


  g_frameCount++;
  let now = performance.now();
  if (now - g_lastFPSTime >= 1000) {   
    g_fps = g_frameCount;
    g_frameCount = 0;
    g_lastFPSTime = now;
  }

  updateAnimationAngles();
  renderAllShapes();
  requestAnimationFrame(tick);
}


function updateAnimationAngles() {
 
  if (g_yellowAnimation) {
    g_yellowlAngle = 30 * Math.sin(g_seconds * 2.0);
  }
  if (g_magentaAnimation) {
    g_magentaAngle = 45 * Math.sin(g_seconds * 3.0);
  }

  
  if (g_tailAnimation) {
    g_tailBaseAngle = 20 * Math.sin(g_seconds * 2.0);
    g_tailMidAngle  = 30 * Math.sin(g_seconds * 2.5);
    g_tailTipAngle  = 40 * Math.sin(g_seconds * 3.0);
  }


  if (g_poke) {
    let t = g_seconds - g_pokeStart;
    if (t > 1.0) {
      g_poke = false;
    } else {

      g_tailTipAngle = 90 * Math.sin(t * Math.PI * 4);
      g_magentaAngle = 60 * Math.sin(t * Math.PI * 3);
    }
  }
  if (g_lightAnimate) {
    g_lightPos[0] = g_lightRadius * Math.cos(g_seconds);
    g_lightPos[2] = g_lightRadius * Math.sin(g_seconds);
    g_lightPos[1] = g_lightHeight;
  }
}

function renderAllShapes(){
  var startTime = performance.now();


  var globalRotMat = new Matrix4()
    .rotate(g_globalAngle, 0,1,0)
    .rotate(g_mouseAngleY, 0,1,0)
    .rotate(g_mouseAngleX, 1,0,0);

  gl.uniformMatrix4fv(u_GlobalRotateMatrix,false,globalRotMat.elements);

  gl.uniform1i(u_LightingOn, g_lightingOn);
  gl.uniform1i(u_ShowNormals, g_showNormals);
  gl.uniform3fv(u_LightPos, g_lightPos);
  gl.uniform3fv(u_CameraPos, g_cameraPos);
  gl.uniform3fv(u_LightColor, g_lightColor);

  gl.uniform1i(u_SpotOn, g_spotOn);
  gl.uniform3fv(u_SpotPos, g_spotPos);

  let d = g_spotDir;
  let len = Math.sqrt(d[0]*d[0] + d[1]*d[1] + d[2]*d[2]);
  gl.uniform3f(u_SpotDir, d[0]/len, d[1]/len, d[2]/len);

  gl.uniform1f(u_SpotCosCutoff, Math.cos(g_spotCutoffDeg * Math.PI / 180.0));
  gl.uniform3fv(u_SpotColor, g_spotColor);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  var body = new Cube();
  body.color = [0.6,0.6,0.6,1];
  body.matrix.translate(-0.25,-0.75,0.0);
  body.matrix.scale(0.6,0.3,0.4);
  body.render();

  
  var head = new Cube();
  head.color = [0.7,0.7,0.7,1];
  head.matrix.translate(0.35,-0.62,0.1);

  
  var headCoord = new Matrix4(head.matrix);

  head.matrix.scale(0.25,0.2,0.2);
  head.render();


  var snout = new Cube();
  snout.color = [0.75,0.75,0.75,1];
  snout.matrix.translate(0.55,-0.58,0.14);
  snout.matrix.scale(0.10,0.08,0.10);
  snout.render();

 
  var ear1 = new Circle3D();
  ear1.color = [0.95,0.75,0.75,1];
  ear1.matrix = new Matrix4(headCoord);
  ear1.matrix.translate(0.065, 0.18, 0.18);
  ear1.matrix.rotate(90, 0, 1, 0);
  ear1.matrix.scale(0.10, 0.10, 0.10);
  ear1.segments = 28;
  ear1.thickness = 0.25;  
  ear1.render();


  var ear2 = new Circle3D();
  ear2.color = [0.95,0.75,0.75,1];
  ear2.matrix = new Matrix4(headCoord);
  ear2.matrix.translate(0.065, 0.18, 0.05);   
  ear2.matrix.rotate(90, 0, 1, 0);
  ear2.matrix.scale(0.10, 0.10, 0.10);
  ear2.segments = 28;
  ear2.thickness = 0.25;  
  ear2.render();


  var nose = new Circle3D();
  nose.color = [0.95,0.55,0.55,1];
  nose.matrix = new Matrix4(headCoord);
  nose.matrix.translate(0.35, 0.06, 0.10);   
  nose.matrix.rotate(90, 0, 1, 0);
  nose.matrix.scale(0.06, 0.06, 0.06);
  nose.segments = 22;
  nose.thickness = 0.35;  
  nose.render();



  function leg(x,z){
    var l = new Cube();
    l.color = [0.35,0.35,0.35,1];
    l.matrix.translate(x,-0.86,z);
    l.matrix.scale(0.08,0.14,0.08);
    l.render();
  }
  leg(-0.18,0.05);
  leg(-0.18,0.28);
  leg(0.15,0.05);
  leg(0.15,0.28);


  var upperArm = new Cube();
  upperArm.color = [0.6,0.6,0.6,1];
  upperArm.matrix.translate(0.10,-0.62,0.30);
  upperArm.matrix.rotate(-g_yellowlAngle,0,0,1);

  var upperCoord = new Matrix4(upperArm.matrix);

  upperArm.matrix.scale(0.10,0.25,0.10);
  upperArm.render();


  var lowerArm = new Cube();
  lowerArm.color = [0.6,0.6,0.6,1];
  lowerArm.matrix = upperCoord;
  lowerArm.matrix.translate(0,0.25,0);
  lowerArm.matrix.rotate(g_magentaAngle,0,0,1);
  lowerArm.matrix.scale(0.10,0.18,0.10);
  lowerArm.render();


  var tailBase = new Cube();
  tailBase.color = [0.9,0.7,0.7,1];
  tailBase.matrix.translate(-0.55,-0.70,0.20);
  tailBase.matrix.rotate(g_tailBaseAngle,0,0,1);

  var tailBaseCoord = new Matrix4(tailBase.matrix);

  tailBase.matrix.scale(0.22,0.04,0.04);
  tailBase.render();


  var tailMid = new Cube();
  tailMid.color = [0.9,0.7,0.7,1];
  tailMid.matrix = tailBaseCoord;
  tailMid.matrix.translate(0.22,0,0);
  tailMid.matrix.rotate(g_tailMidAngle,0,0,1);

  var tailMidCoord = new Matrix4(tailMid.matrix);

  tailMid.matrix.scale(0.20,0.035,0.035);
  tailMid.render();


  var tailTip = new Cube();
  tailTip.color = [0.9,0.7,0.7,1];
  tailTip.matrix = tailMidCoord;
  tailTip.matrix.translate(0.20,0,0);
  tailTip.matrix.rotate(g_tailTipAngle,0,0,1);
  tailTip.matrix.scale(0.16,0.03,0.03);
  tailTip.render();


    let s = new Sphere();
    s.color = [1, 0, 0, 1];
    s.matrix.translate(0.0, 0.2, 0.0);
    s.matrix.scale(0.25, 0.25, 0.25);
    s.render();

    let prevLighting = g_lightingOn;
    g_lightingOn = false;
    gl.uniform1i(u_LightingOn, g_lightingOn);
  
    let lightCube = new Cube();
    lightCube.color = [1.0, 1.0, 1.0, 1.0];
    lightCube.matrix.translate(
        g_lightPos[0],
        g_lightPos[1],
        g_lightPos[2]
    );
    lightCube.matrix.scale(0.12, 0.12, 0.12);
    lightCube.render();
  
    g_lightingOn = prevLighting;
    gl.uniform1i(u_LightingOn, g_lightingOn);

    
    let prevLighting2 = g_lightingOn;
    let prevSpot = g_spotOn;


    g_lightingOn = false;
    g_spotOn = false;

    gl.uniform1i(u_LightingOn, g_lightingOn);
    gl.uniform1i(u_SpotOn, g_spotOn);

    let spotCube = new Cube();
    spotCube.color = [1.0, 1.0, 0.0, 1.0]; 
    spotCube.matrix.translate(
        g_spotPos[0],
        g_spotPos[1],
        g_spotPos[2]
);
spotCube.matrix.scale(0.12, 0.12, 0.12);
spotCube.render();

// restore lighting
g_lightingOn = prevLighting2;
g_spotOn = prevSpot;

gl.uniform1i(u_LightingOn, g_lightingOn);
gl.uniform1i(u_SpotOn, g_spotOn);

if (g_model && g_model.ready) {

    g_model.color = [0.3, 0.8, 1.0, 1.0];
  
    g_model.matrix.setIdentity();
    g_model.matrix.translate(-0.8, -0.75, 0.2); 
    g_model.matrix.rotate(180,0,1,0);   
    g_model.matrix.scale(0.1, 0.1, 0.1);
  
    g_model.render();
  
  }


  var duration = performance.now() - startTime;
  sendTextToHTML("fps: " + g_fps, "numdot");

}


function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + "from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}