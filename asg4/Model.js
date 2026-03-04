class Model {
    constructor() {
      this.vertices = [];
      this.normals = [];
      this.matrix = new Matrix4();
      this.color = [1,1,1,1];
      this.ready = false;
    }
  
    async loadOBJ(path) {
      const response = await fetch(path);
      const text = await response.text();
      this.parseOBJ(text);
      this.ready = true;
    }
  
    parseOBJ(data) {
      const lines = data.split('\n');
      let verts = [];
      let norms = [];
  
      for (let line of lines) {
        let parts = line.trim().split(/\s+/);
  
        if (parts[0] === 'v') {
          verts.push([
            parseFloat(parts[1]),
            parseFloat(parts[2]),
            parseFloat(parts[3])
          ]);
        }
  
        if (parts[0] === 'vn') {
          norms.push([
            parseFloat(parts[1]),
            parseFloat(parts[2]),
            parseFloat(parts[3])
          ]);
        }
  
        if (parts[0] === 'f') {
          for (let i = 1; i <= 3; i++) {
            let vals = parts[i].split('/');
            let v = verts[vals[0]-1];
            let n = norms[vals[2]-1];
  
            this.vertices.push(...v);
            this.normals.push(...n);
          }
        }
      }
    }
  
    render() {
      if (!this.ready) return;
  
      gl.uniform4fv(u_FragColor, this.color);
  
      gl.uniformMatrix4fv(u_ModelMatrix,false,this.matrix.elements);
  
      let normalMatrix = new Matrix4();
      normalMatrix.setInverseOf(this.matrix);
      normalMatrix.transpose();
      gl.uniformMatrix4fv(u_NormalMatrix,false,normalMatrix.elements);
  
      let vBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
      gl.vertexAttribPointer(a_Position,3,gl.FLOAT,false,0,0);
      gl.enableVertexAttribArray(a_Position);
  
      let nBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
      gl.vertexAttribPointer(a_Normal,3,gl.FLOAT,false,0,0);
      gl.enableVertexAttribArray(a_Normal);
  
      gl.drawArrays(gl.TRIANGLES,0,this.vertices.length/3);
    }
  }