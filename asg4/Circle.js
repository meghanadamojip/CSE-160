class Circle {
    constructor(){
      this.type='circle';
      this.position=[0.0,0.0,0.0];
      this.color=[1.0,1.0,1.0,1.0];
      this.size=5.0;
      this.segments=10;
    }
    render() {
      var xy = this.position;
      var rgba = this.color;
      var size = this.size;
  
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  
      var d = size/200.0;
  
      let angleStep=360/this.segments;
      for(var angle = 0; angle < 360; angle=angle+angleStep) {
        let centerPt= [xy[0], xy[1]];
        let angle1 = angle;
        let angle2 = angle+angleStep;
        let vec1=[Math.cos(angle1*Math.PI/180)*d, Math.sin(angle1*Math.PI/180)*d];
        let vec2=[Math.cos(angle2*Math.PI/180)*d, Math.sin(angle2*Math.PI/180)*d];
        let pt1 = [centerPt[0]+vec1[0], centerPt[1]+vec1[1]];
        let pt2 = [centerPt[0]+vec2[0], centerPt[1]+vec2[1]];
  
        drawTriangle([xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]]);
      }
    }
  }
  
  class Circle3D {
    constructor(){
      this.type = 'circle3d';
      this.color = [1,1,1,1];
      this.segments = 20;
      this.matrix = new Matrix4();
      this.thickness = 0.2;
  
      
      this.vertexBuffer = null;
      this.normalBuffer = null;
    }
  
    
    _buildMesh() {
      const seg = this.segments;
      const t = this.thickness * 0.5;
      const angleStep = (2 * Math.PI) / seg;
  
      const verts = [];
      const norms = [];
  
      for (let i = 0; i < seg; i++) {
        const a1 = i * angleStep;
        const a2 = (i + 1) * angleStep;
  
        const x1 = Math.cos(a1), y1 = Math.sin(a1);
        const x2 = Math.cos(a2), y2 = Math.sin(a2);
  
    
        verts.push(0,0,+t,  x1,y1,+t,  x2,y2,+t);
        norms.push(0,0,1,   0,0,1,     0,0,1);
  
      
        verts.push(0,0,-t,  x2,y2,-t,  x1,y1,-t);
        norms.push(0,0,-1,  0,0,-1,    0,0,-1);
  
    
        const nx1 = x1, ny1 = y1;
        const nx2 = x2, ny2 = y2;
  
        
        verts.push(x1,y1,+t,  x1,y1,-t,  x2,y2,-t);
        norms.push(nx1,ny1,0, nx1,ny1,0, nx2,ny2,0);
  
        
        verts.push(x1,y1,+t,  x2,y2,-t,  x2,y2,+t);
        norms.push(nx1,ny1,0, nx2,ny2,0, nx2,ny2,0);
      }
  
      this._vertices = new Float32Array(verts);
      this._normals  = new Float32Array(norms);
      this._count = this._vertices.length / 3;
    }
  
    render() {
      const rgba = this.color;
  
      
      if (!this._vertices || this._lastSeg !== this.segments || this._lastThick !== this.thickness) {
        this._lastSeg = this.segments;
        this._lastThick = this.thickness;
        this._buildMesh();
      }
  
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
  
      
      let normalMatrix = new Matrix4();
      normalMatrix.setInverseOf(this.matrix);
      normalMatrix.transpose();
      gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  
      // vertex buffer
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