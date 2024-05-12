class LathedGeo extends DynamicModel
{
    constructor(gl, seed, skipGeo)
    {
        super(gl, seed, skipGeo);
    }

    initShaders()
    {
        super.initShaders();
        return;
        this.fsShaderSource = `
            varying highp vec2 vTextureCoord;
            varying highp vec3 vLighting;
            varying highp vec3 vNormal;
            highp vec2 newTex;

            uniform sampler2D uSampler;

            void main() {
                // newTex = vec2(vTextureCoord);
                // gl_FragColor = vec4(0.2, vTextureCoord[0]-0.5, (1.0-vTextureCoord[0]) * 0.2, 1.0);
                // gl_FragColor = vec4(vNormal, 1);
                // gl_FragColor = vec4(0.0, 1., 0., 1.);
                
                highp vec3 color = vec3(1, 1., 0.1);
                
                gl_FragColor = vec4(vNormal, 1.0);
                // gl_FragColor = vec4(color * vLighting, 1.0);

                if (gl_FrontFacing) {
                    gl_FragColor = vec4(vTextureCoord[0], 0., 0., 1.);
                }

                gl_FragColor = vec4(1.);
            }
        `;         
    }

    _makeBaseCurve()
    {
        let r = this.rand;
        this.midPoint = r.random() * 0.5 + 0.25;
        let botMid = r.random() * (this.midPoint * 0.5) + (this.midPoint * 0.25);
        let topMid = r.random() * ((1-this.midPoint) * 0.5) + ((1-this.midPoint) * 0.25);
        topMid += this.midPoint;

        // this.midPoint = 0.5;
        // botMid = 0.1;
        // topMid = 0.8;

        let points = [];
        points[0] = new Point(0, 0);

        points[1] = new Point(0, botMid);
        // points[1] = new Point(1, 0);
        points[2] = new Point(1, botMid);
        
        points[3] = new Point(1, this.midPoint);

        points[4] = new Point(1, topMid);
        points[5] = new Point(0, topMid);

        points[6] = new Point(0, 1);

        // xz curve is a combination of two 
        this.botCurve = new bzCurveCubic(points[0], points[1], points[2], points[3]);
        this.topCurve = new bzCurveCubic(points[3], points[4], points[5], points[6]);

        this.origin = vec3.fromValues(0, 0, 0);
    }

    _getCurvePointAt(v)
    {
        if (v < this.midPoint)
        {
            return this.botCurve.getPointAt(v / this.midPoint);
        }

        let v2 = (v - this.midPoint) / (1 - this.midPoint);
        return this.topCurve.getPointAt(v2);
    }    

    setDimensions()
    {
        this.height = 10;
        this.radius = 3;
    
        this.divsY = 8;
        this.divsR = 8;
    }

    _addVertexLine(u)
    {
        let v1, v2;
        let cp;
        let p;

        let a, b, A, B;
        let normal;
        let theta;

        a = vec3.create();

        let lastPoint = [0,-1,0];

        for (let i=0; i < this.divsY; i++)
        {
            v1 = i / (this.divsY-1);
            theta = (u * Math.PI * 2)
        
            cp = this._getCurvePointAt(v1);
            p = vec3.fromValues(cp.x * this.radius,
                v1 * this.height,
                0);
            vec3.rotateY(p, p, this.origin, theta);

            A = vec3.fromValues(
                p[0] - lastPoint[0],
                p[1] - lastPoint[1],
                p[2] - lastPoint[2]
            );

            vec3.negate(A, A);

            B = vec3.fromValues(1, 0, 0);
            vec3.rotateY(B, B, this.origin, theta - (Math.PI/2));
            

            normal = vec3.create();
            vec3.cross(normal, A, B);            
            vec3.normalize(normal, normal);

            this.addVertex(
                p[0], p[1], p[2],
                u, v1,
                [normal[0], normal[1], normal[2]]
            );
            
            lastPoint = p;
        }
    }

    addVertices()
    {
        for (let i=0; i < this.divsR; i++)
        {
            this._addVertexLine(i / (this.divsR-1));
        }
    }

    addFaces()
    {
        let u1, u2;
        let i1, i2, i3, i4;

        let indices = [];

        for (let i=0; i < this.divsR; i++)
        {
            u1 = i;
            u2 = (i + 1) % this.divsR;

            for (let j=0; j < this.divsY - 1; j++)
            {
                i1 = (u1 * this.divsY) + j;
                i2 = i1 + 1;
                i4 = (u2 * this.divsY) + j;
                i3 = i4 + 1;
    
                indices.push(
                    i1, i3, i2,
                    i1, i4, i3
                );
            }
        }

        this.faceIndices = this.faceIndices.concat(indices);
    }

    updateGeometry()
    {
        let r = this.rand;

        this.setDimensions();

        this._makeBaseCurve();

        this.addVertices();

        this.addFaces();
    }
}