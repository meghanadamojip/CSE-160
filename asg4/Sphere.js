class Sphere {
    constructor() {
      this.color = [1, 0, 0, 1];
      this.matrix = new Matrix4();
  
      this.latBands = 20;
      this.lonBands = 20;
  
      this.vertexBuffer = null;
      this.normalBuffer = null;
  
      this._vertices = null;
      this._normals = null;
      this._count = 0;
    }
  
    _buildMesh() {
      const lat = this.latBands;
      const lon = this.lonBands;
  
      const verts = [];
      const norms = [];
  
      for (let i = 0; i < lat; i++) {
        const theta1 = (i / lat) * Math.PI;
        const theta2 = ((i + 1) / lat) * Math.PI;
  
        for (let j = 0; j < lon; j++) {
          const phi1 = (j / lon) * 2 * Math.PI;
          const phi2 = ((j + 1) / lon) * 2 * Math.PI;
  
          // 4 points on the unit sphere
          const p1 = [
            Math.sin(theta1) * Math.cos(phi1),
            Math.cos(theta1),
            Math.sin(theta1) * Math.sin(phi1),
          ];
          const p2 = [
            Math.sin(theta2) * Math.cos(phi1),
            Math.cos(theta2),
            Math.sin(theta2) * Math.sin(phi1),
          ];
          const p3 = [
            Math.sin(theta2) * Math.cos(phi2),
            Math.cos(theta2),
            Math.sin(theta2) * Math.sin(phi2),
          ];
          const p4 = [
            Math.sin(theta1) * Math.cos(phi2),
            Math.cos(theta1),
            Math.sin(theta1) * Math.sin(phi2),
          ];
  
          // Two triangles: (p1,p2,p3) and (p1,p3,p4)
          verts.push(...p1, ...p2, ...p3);
          verts.push(...p1, ...p3, ...p4);
  
          // Normals for unit sphere centered at origin: Normal = Position
          norms.push(...p1, ...p2, ...p3);
          norms.push(...p1, ...p3, ...p4);
        }
      }
  
      this._vertices = new Float32Array(verts);
      this._normals = new Float32Array(norms);
      this._count = this._vertices.length / 3;
    }
  
    render() {
      if (!this._vertices) this._buildMesh();
  
      gl.uniform4f(u_FragColor, ...this.color);
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
  
      // normal matrix = inverse transpose(model)
      const normalMatrix = new Matrix4();
      normalMatrix.setInverseOf(this.matrix);
      normalMatrix.transpose();
      gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  
      // position buffer
      if (!this.vertexBuffer) this.vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this._vertices, gl.STATIC_DRAW);
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_Position);
  
      // normal buffer
      if (!this.normalBuffer) this.normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this._normals, gl.STATIC_DRAW);
      gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_Normal);
  
      gl.drawArrays(gl.TRIANGLES, 0, this._count);
    }
  }