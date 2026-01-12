let canvas, ctx;

function main() {
  canvas = document.getElementById("webgl");
  if (!canvas) {
    console.log("Failed to retrieve the <canvas> element");
    return;
  }
  ctx = canvas.getContext("2d");


  clearCanvas();
  let v1 = getV1();
  let v2 = getV2();
  drawVector(v1, "red");
  drawVector(v2, "blue");


  document.getElementById("drawV1Button").addEventListener("click", handleDrawEvent);
}

function clearCanvas() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 400, 400);
}

function getV1() {
  const v1x = parseFloat(document.getElementById("v1x").value);
  const v1y = parseFloat(document.getElementById("v1y").value);
  return new Vector3([v1x, v1y, 0]);
}

function getV2() {
  const v2x = parseFloat(document.getElementById("v2x").value);
  const v2y = parseFloat(document.getElementById("v2y").value);
  return new Vector3([v2x, v2y, 0]);
}

function angleBetween(v1, v2) {
  const dot = Vector3.dot(v1, v2);
  const mag1 = v1.magnitude();
  const mag2 = v2.magnitude();


  if (mag1 === 0 || mag2 === 0) return 0;

  let cosTheta = dot / (mag1 * mag2);

  cosTheta = Math.min(1, Math.max(-1, cosTheta));

  const radians = Math.acos(cosTheta);
  const degrees = radians * (180 / Math.PI);
  return degrees;
}

function areaTriangle(v1, v2) {
  const cross = Vector3.cross(v1, v2);
  const areaParallelogram = cross.magnitude();
  return areaParallelogram / 2;
}

function drawVector(v, color) {
  ctx.strokeStyle = color;
  ctx.beginPath();

  const cx = 200;
  const cy = 200;

  ctx.moveTo(cx, cy);
  ctx.lineTo(
    cx + v.elements[0] * 20,
    cy - v.elements[1] * 20
  );

  ctx.stroke();
}

function handleDrawEvent() {
  clearCanvas();

  let v1 = getV1();
  let v2 = getV2();

  drawVector(v1, "red");
  drawVector(v2, "blue");
}


function handleDrawOperationEvent() {
  clearCanvas();

 
  let v1 = getV1();
  let v2 = getV2();

  drawVector(v1, "red");
  drawVector(v2, "blue");

  let op = document.getElementById("opSelect").value;
  let s = parseFloat(document.getElementById("scalar").value);

  if (op === "add") {
    let v3 = new Vector3(v1.elements);
    v3.add(v2);
    drawVector(v3, "green");
  } else if (op === "sub") {
    let v3 = new Vector3(v1.elements);
    v3.sub(v2);
    drawVector(v3, "green");
  } else if (op === "mul") {
    let v3 = new Vector3(v1.elements); 
    let v4 = new Vector3(v2.elements); 
    v3.mul(s);
    v4.mul(s);
    drawVector(v3, "green");
    drawVector(v4, "green");
  } else if (op === "div") {
    let v3 = new Vector3(v1.elements); 
    let v4 = new Vector3(v2.elements); 
    v3.div(s);
    v4.div(s);
    drawVector(v3, "green");
    drawVector(v4, "green");
  } else if (op === "mag") {
    console.log("Magnitude v1:", v1.magnitude());
    console.log("Magnitude v2:", v2.magnitude());
  } else if (op === "norm") {
    let v3 = new Vector3(v1.elements); 
    let v4 = new Vector3(v2.elements); 
    v3.normalize();
    v4.normalize();
    drawVector(v3, "green");
    drawVector(v4, "green");
  } else if (op === "angle") {
    const angle = angleBetween(v1, v2);
    console.log("Angle:", angle);
  } else if (op === "area") {
    const area = areaTriangle(v1, v2);
    console.log("Area:", area);
  }
}
