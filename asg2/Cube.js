class Cube {
    constructor(){
        this.type='cube';
        //this.position=[0.0,0.0,0.0];
        this.color=[1.0,1.0,1.0,1.0];
        //this.size=5.0;
        //this.segments=10;
        this.matrix = new Matrix4();
    }
    render() {
        //var xy = this.position;
        var rgba = this.color;
        //var size = this.size;

        //var xy = g_points[i];
        //var rgba = g_colors[i];
        //var size = g_sizes[i];

        // Pass the position of a point to a_Position variable
        //gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Draw all 6 faces of the cube (each face = 2 triangles)
        // Slight shading per face helps you see depth
        gl.uniform4f(u_FragColor, rgba[0]*1.0, rgba[1]*1.0, rgba[2]*1.0, rgba[3]);

        // FRONT (z = 0)
        drawTriangle3D([0.0,0.0,0.0,  1.0,1.0,0.0,  1.0,0.0,0.0]);
        drawTriangle3D([0.0,0.0,0.0,  0.0,1.0,0.0,  1.0,1.0,0.0]);

        // BACK (z = 1)
        gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
        drawTriangle3D([0.0,0.0,1.0,  1.0,0.0,1.0,  1.0,1.0,1.0]);
        drawTriangle3D([0.0,0.0,1.0,  1.0,1.0,1.0,  0.0,1.0,1.0]);

        // LEFT (x = 0)
        gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
        drawTriangle3D([0.0,0.0,0.0,  0.0,0.0,1.0,  0.0,1.0,1.0]);
        drawTriangle3D([0.0,0.0,0.0,  0.0,1.0,1.0,  0.0,1.0,0.0]);

        // RIGHT (x = 1)
        gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
        drawTriangle3D([1.0,0.0,0.0,  1.0,1.0,1.0,  1.0,0.0,1.0]);
        drawTriangle3D([1.0,0.0,0.0,  1.0,1.0,0.0,  1.0,1.0,1.0]);

        // TOP (y = 1)
        gl.uniform4f(u_FragColor, rgba[0]*0.85, rgba[1]*0.85, rgba[2]*0.85, rgba[3]);
        drawTriangle3D([0.0,1.0,0.0,  0.0,1.0,1.0,  1.0,1.0,1.0]);
        drawTriangle3D([0.0,1.0,0.0,  1.0,1.0,1.0,  1.0,1.0,0.0]);

        // BOTTOM (y = 0)
        gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
        drawTriangle3D([0.0,0.0,0.0,  1.0,0.0,1.0,  0.0,0.0,1.0]);
        drawTriangle3D([0.0,0.0,0.0,  1.0,0.0,0.0,  1.0,0.0,1.0]);
    }
}

