class Node3d
{
    constructor(gl, seed, skipGeo)
    {
        // super(gl, seed, skipGeo);
    
        this.gl = gl;

        this.pos = vec3.create();
        
        this.data = [];

        this.parent = null;
        this.children = [];

        this.modelViewMatrix = mat4.create();
        this.position = [0, 0, 0];
        this.rotation = [0, 0, 0];
        this.scale = [1, 1, 1]; 
    }

    radToDeg(r) { return (r * 180 / Math.PI); }
    degToRad(d) { return (d * (Math.PI / 180)); }

    // syntactic sugar for transform data
    set x(v) { this.position[0] = v; }
    set y(v) { this.position[1] = v; }
    set z(v) { this.position[2] = v; }

    set rotationX(v){ this.rotation[0] = this.degToRad(v); }
    set rotationY(v) { this.rotation[1] = this.degToRad(v); }
    set rotationZ(v) { this.rotation[2] = this.degToRad(v); }

    set scaleX(v) { this.scale[0] = v; }
    set scaleY(v) { this.scale[1] = v; }
    set scaleZ(v) { this.scale[2] = v; }

    translateX(v) { this.position[0] += v; }
    translateY(v) { this.position[1] += v; }
    translateZ(v) { this.position[2] += v; }

    rotateX(v){ this.rotation[0] += this.degToRad(v); }
    rotateY(v){ this.rotation[1] += this.degToRad(v); }
    rotateZ(v){ this.rotation[2] += this.degToRad(v); }


    addChild(c)
    {
        c.parent = this;
        this.children.push(c);
    } 

    updateGeometry(){}

    initShaders(){}

    update(dt) {}

    draw(proj, modelview)
    {
        let gl = this.gl;
        
        this.projectionMatrix = proj;
        
        this.modelViewMatrix = (modelview) ? mat4.clone(modelview) : mat4.create();

        mat4.scale(this.modelViewMatrix,
            this.modelViewMatrix,
            this.scale);
        mat4.translate(this.modelViewMatrix,
            this.modelViewMatrix,
            this.position);
        
        mat4.rotate(this.modelViewMatrix,
            this.modelViewMatrix,
            this.rotation[1], [0,1,0]);
        mat4.rotate(this.modelViewMatrix,
            this.modelViewMatrix,
            this.rotation[0], [1,0,0]);
        mat4.rotate(this.modelViewMatrix,
            this.modelViewMatrix,
            this.rotation[2], [0,0,1]);
    
        const normalMatrix = mat4.create();
        mat4.invert(normalMatrix, this.modelViewMatrix);
        mat4.transpose(normalMatrix, normalMatrix);

        this.children.forEach(c => {
            c.draw(proj, this.modelViewMatrix);
        })
    }    
}