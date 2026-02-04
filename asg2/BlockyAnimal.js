// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
attribute vec4 a_Position;
uniform mat4 u_ModelMatrix;
uniform mat4 u_GlobalRotateMatrix;
void main() {
  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
}
`;

// Fragment shader program
var FSHADER_SOURCE = `
precision mediump float;
uniform vec4 u_FragColor;
void main() {
  gl_FragColor = u_FragColor;
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

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
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
}

function renderAllShapes(){
  var startTime = performance.now();


  var globalRotMat = new Matrix4()
    .rotate(g_globalAngle, 0,1,0)
    .rotate(g_mouseAngleY, 0,1,0)
    .rotate(g_mouseAngleX, 1,0,0);

  gl.uniformMatrix4fv(u_GlobalRotateMatrix,false,globalRotMat.elements);
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




