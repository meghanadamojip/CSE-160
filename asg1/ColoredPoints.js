// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
attribute vec4 a_Position;
uniform float u_Size;
void main() {
  gl_Position = a_Position;
  //gl_PointSize = 10.0;
  gl_PointSize = u_Size;
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

//global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL() {
      // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
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
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
}

}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

//global ui elements
let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
let g_selectedSegments = 10;
let g_showPicture = false;


function addActionsforHtmlUI() {
    document.getElementById('green').onclick = function() {g_selectedColor = [0.0,1.0,0.0,1.0];};
    document.getElementById('red').onclick = function() {g_selectedColor = [1.0,0.0,0.0,1.0];};
    document.getElementById('clearButton').onclick = function () {
        g_shapesList = [];
        g_showPicture = false;   
        renderAllShapes();
      };

    document.getElementById('pointButton').onclick = function() {g_selectedType=POINT};
    document.getElementById('triButton').onclick = function() {g_selectedType=TRIANGLE};
    document.getElementById('circleButton').onclick = function() {g_selectedType=CIRCLE};

    document.getElementById('redSlide').addEventListener('input', function() {g_selectedColor[0] = this.value/100;});
    document.getElementById('greenSlide').addEventListener('input', function() {g_selectedColor[1] = this.value/100;});
    document.getElementById('blueSlide').addEventListener('input', function() {g_selectedColor[2] = this.value/100;});

    document.getElementById('sizeSlide').addEventListener('input', function() {g_selectedSize = this.value;});

    document.getElementById('segSlide').addEventListener('input', function () {
        g_selectedSegments = Number(this.value);
      });
    
    document.getElementById('pictureButton').onclick = function () {
        g_showPicture = true;
        renderAllShapes(); 
      };
      

}


function main() {

    setupWebGL();
    connectVariablesToGLSL();
    addActionsforHtmlUI();
    
  


  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) {if (ev.buttons == 1 ) {click(ev)}};


  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}


var g_shapesList = [];

//var g_points = [];  // The array for the position of a mouse press
//var g_colors = [];  // The array to store the color of a point
//var g_sizes = [];


function click(ev) {
    let [x, y] = convertCoordinatesEventToGL(ev);
  
    let shape;
    if (g_selectedType === POINT) {
      shape = new Point();
    } else if (g_selectedType === TRIANGLE) {
      shape = new Triangle();
    } else if (g_selectedType === CIRCLE) {
      shape = new Circle();
      shape.segments = g_selectedSegments;
    }
  
    shape.position = [x, y];
    shape.color = g_selectedColor.slice();
    shape.size = Number(g_selectedSize);
  
    g_shapesList.push(shape);
    renderAllShapes();
  }

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}

function renderAllShapes(){
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (g_showPicture) {
        drawMyPicture();
    }

    var startTime = performance.now();

    var len = g_shapesList.length;
    for(var i = 0; i < len; i++) {
        g_shapesList[i].render();
    }

    var duration = performance.now() - startTime;
    sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + "from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}

function drawMyPicture() {
    const brownDark  = [0.36, 0.25, 0.20, 1.0]; 
    const brownMid   = [0.45, 0.32, 0.25, 1.0]; 
    const brownLight = [0.60, 0.45, 0.35, 1.0]; 
    const greenTree  = [0.10, 0.55, 0.20, 1.0];
    const white      = [1.0, 1.0, 1.0, 1.0];
  
    function tri(v, c) {
      gl.uniform4f(u_FragColor, c[0], c[1], c[2], c[3]);
      drawTriangle(v);
    }
  
    function rect(x1, y1, x2, y2, c) {
      tri([x1, y1,  x2, y1,  x2, y2], c);
      tri([x1, y1,  x2, y2,  x1, y2], c);
    }
  
 
    rect(-0.70, -0.55, 0.10, 0.10, brownDark);
    rect(-0.78, -0.55, -0.70, 0.10, brownMid);
    tri([-0.78, 0.10,   0.18, 0.10,   -0.30, 0.58], brownLight);
    tri([-0.15, 0.58,   -0.07, 0.42,   0.01, 0.58], white);
  
 
    rect(-0.55, -0.05, -0.35, 0.15, brownMid);
    rect(-0.55, -0.35, -0.35, -0.15, brownMid);
  
   
    tri([-0.55, 0.15, -0.50, 0.15, -0.35, -0.05], white);
    tri([-0.55, 0.15, -0.35, -0.05, -0.40, -0.05], white);
    tri([-0.35, 0.15, -0.40, 0.15, -0.55, -0.05], white);
    tri([-0.35, 0.15, -0.55, -0.05, -0.50, -0.05], white);

    tri([-0.55, -0.15, -0.50, -0.15, -0.35, -0.35], white);
    tri([-0.55, -0.15, -0.35, -0.35, -0.40, -0.35], white);
    tri([-0.35, -0.15, -0.40, -0.15, -0.55, -0.35], white);
    tri([-0.35, -0.15, -0.55, -0.35, -0.50, -0.35], white);
  

    rect(-0.02, -0.55, 0.12, -0.20, brownMid);
    tri([-0.08, -0.20,  0.18, -0.20,  0.05, -0.05], brownLight);
    rect(0.04, -0.55, 0.06, -0.30, white);
  
    function tree(cx, cy, w, h) {
      tri([cx - w, cy - h,  cx + w, cy - h,  cx, cy + h], greenTree);
    }
  
    tree(0.55, 0.25, 0.18, 0.12);
    tree(0.85, 0.25, 0.18, 0.12);
  
    tree(0.55, 0.00, 0.18, 0.12);
    tree(0.85, 0.00, 0.18, 0.12);
  
    tree(0.55, -0.25, 0.18, 0.12);
    tree(0.85, -0.25, 0.18, 0.12);
  
    tree(0.55, -0.48, 0.08, 0.10);
    tree(0.85, -0.48, 0.08, 0.10);
  }
  