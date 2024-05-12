class Flower
{
    constructor(gl)
    {
        this.gl = gl;

        this.pos = vec3.create();
        
        this.data = [];
    
        this.vertexPositions = [];
        this.textureCoords = [];
        this.faceIndices = [];
        this.vertexCount = 0;
        this.numQuads = 0;

        this.initBuffers(this.gl);

        this.updateGeometry(this.gl);
    }

    initBuffers(gl)
    {
        this.positionBuffer = gl.createBuffer();
        this.textureCoordBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();
    }

    updateGeometry(gl)
    {
        // set the values for 
    }

    _refreshBuffers(gl)
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexPositions), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.textureCoords), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Arry(this.faceIndices), gl.STATIC_DRAW);
    }
}