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
    }
  
    render() {
      const rgba = this.color;
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
  
      const angleStep = 360 / this.segments;
      const t = this.thickness * 0.5;  
  
      
      for (let angle = 0; angle < 360; angle += angleStep) {
        const a1 = angle * Math.PI / 180;
        const a2 = (angle + angleStep) * Math.PI / 180;
  
        // unit circle points
        const x1 = Math.cos(a1), y1 = Math.sin(a1);
        const x2 = Math.cos(a2), y2 = Math.sin(a2);
  
        //front face
        drawTriangle3D([
          0, 0, +t,
          x1, y1, +t,
          x2, y2, +t
        ]);
  
        //back face
        drawTriangle3D([
          0, 0, -t,
          x2, y2, -t,
          x1, y1, -t
        ]);
  
        //side
        drawTriangle3D([
          x1, y1, +t,
          x1, y1, -t,
          x2, y2, -t
        ]);
        drawTriangle3D([
          x1, y1, +t,
          x2, y2, -t,
          x2, y2, +t
        ]);
      }
    }
  }