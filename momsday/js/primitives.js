class Cylinder extends DynamicModel
{
    constructor(gl, options)
    {
        super(gl);
        
    }

    animate(dt)
    {
        this.rotateX(dt * 0.1);
    }

    initData(dat)
    {
        /*
        this.divsH = options.divsLength || 1;
        this.divsR = options.divs || 8;
        this.height = options.height || 10;
        this.radius = options.radius || 1;
        */

        this.height = 30;
        this.radius = 10;
        this.divsR = 32;
        this.divsH = 1;
    }

    initShaders()
    {
        super.initShaders();

        /*
        this.fsShaderSource = `
            varying highp vec2 vTextureCoord;
            highp vec2 newTex;

            uniform sampler2D uSampler;
            uniform mediump float u_time;

            void main() {
                // gl_FragColor = vec4(0.2, vTextureCoord[0]-0.5, (1.0-vTextureCoord[0]) * 0.2, 1.0);
                gl_FragColor = vec4(vTextureCoord[0]);
            }
        `;
        */        
    }

    _addRing(ypos)
    {
        let norm = (ypos < 0) ? [0, -1, 0] : [0,1,0];

        // center point
        this.addVertex(
            0, ypos, 0,
            0.5 , 0.5,
            norm
        );

        let theta = Math.PI * 2 / this.divsR;
        
        let x, z;
        let nv;
        for (let i=0; i < this.divsR; i++)
        {
            x = Math.cos(i * theta);
            z = Math.sin(i * theta);

            nv = vec3.fromValues(x, ypos, z);
            vec3.normalize(nv, nv);

            this.addVertex(
                x * this.radius,
                ypos,
                z * this.radius,
                (x+1)/2, 
                (z+1)/2,
                [nv[0], nv[1], nv[2]]
            );
        }
    }

    addSideFaces()
    {
        let indices = [];


        let bottomStart = 1;
        let topStart = this.divsR + 2;

        let i1, i2, i3, i4;

        for (let i=0; i < this.divsR; i++)
        {
            i1 = bottomStart + i;
            i2 = topStart + i;
            i3 = topStart + ((i + 1) % this.divsR);
            i4 = bottomStart + ((i + 1) % this.divsR);

            indices.push(
                i1, i2, i3,
                i1, i3, i4
            );
        }

        this.faceIndices = this.faceIndices.concat(indices);

    }

    addCaps()
    {
        let indices = [];

        let i1, i2;
        let centerTop = 2 + (this.divsH * this.divsR);

        // bottom
        for (let i=0; i < this.divsR; i++)
        {
            i1 = i;
            i2 = (i+1) % this.divsR;
            
            indices.push(
                0,
                i1 + 1,
                i2 + 1
            );
            
            indices.push(
                centerTop,
                centerTop + i2,
                centerTop + i1
            );

        }

        this.faceIndices = this.faceIndices.concat(indices);
    }

    updateGeometry()
    {
        this._addRing(-(this.height/2));
        this._addRing(this.height/2);

        this.addSideFaces();
        this.addCaps();

        // console.log(this.vertexPositions, this.faceIndices, this.normals);
    }
}