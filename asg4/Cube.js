class Cube {
    constructor() {
      this.type = 'cube';
      this.color = [1, 1, 1, 1];
      this.matrix = new Matrix4();
  
      
      this.vertices = new Float32Array([
        // FRONT (z = 0)
        0,0,0,  1,1,0,  1,0,0,
        0,0,0,  0,1,0,  1,1,0,
  
        // BACK (z = 1)
        0,0,1,  1,0,1,  1,1,1,
        0,0,1,  1,1,1,  0,1,1,
  
        // LEFT (x = 0)
        0,0,0,  0,0,1,  0,1,1,
        0,0,0,  0,1,1,  0,1,0,
  
        // RIGHT (x = 1)
        1,0,0,  1,1,1,  1,0,1,
        1,0,0,  1,1,0,  1,1,1,
  
        // TOP (y = 1)
        0,1,0,  0,1,1,  1,1,1,
        0,1,0,  1,1,1,  1,1,0,
  
        // BOTTOM (y = 0)
        0,0,0,  1,0,1,  0,0,1,
        0,0,0,  1,0,0,  1,0,1,
      ]);
  
   
      this.normals = new Float32Array([
        // FRONT (0,0,-1)
        0,0,-1, 0,0,-1, 0,0,-1,
        0,0,-1, 0,0,-1, 0,0,-1,
  
        // BACK (0,0,1)
        0,0,1, 0,0,1, 0,0,1,
        0,0,1, 0,0,1, 0,0,1,
  
        // LEFT (-1,0,0)
        -1,0,0, -1,0,0, -1,0,0,
        -1,0,0, -1,0,0, -1,0,0,
  
        // RIGHT (1,0,0)
        1,0,0, 1,0,0, 1,0,0,
        1,0,0, 1,0,0, 1,0,0,
  
        // TOP (0,1,0)
        0,1,0, 0,1,0, 0,1,0,
        0,1,0, 0,1,0, 0,1,0,
  
        // BOTTOM (0,-1,0)
        0,-1,0, 0,-1,0, 0,-1,0,
        0,-1,0, 0,-1,0, 0,-1,0,
      ]);
  
      
      this.vertexBuffer = null;
      this.normalBuffer = null;
    }
  
    render() {
      // color + model matrix
      gl.uniform4f(u_FragColor, ...this.color);
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
  
     
      let normalMatrix = new Matrix4();
      normalMatrix.setInverseOf(this.matrix);
      normalMatrix.transpose();
      gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  
     
      if (!this.vertexBuffer) this.vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_Position);
  
     
      if (!this.normalBuffer) this.normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);
      gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_Normal);
  
      gl.drawArrays(gl.TRIANGLES, 0, 36);
    }
  }