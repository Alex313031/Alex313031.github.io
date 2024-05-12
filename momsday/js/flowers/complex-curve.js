class ComplexCurveModel extends DynamicModel
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
            highp vec2 newTex;

            uniform sampler2D uSampler;
            uniform mediump float u_time;

            void main() {
                /*
                gl_FragColor = vec4(0.2, vTextureCoord[0]-0.5, (1.0-vTextureCoord[0]) * 0.2, 1.0);
                if (gl_FrontFacing)
                {
                    gl_FragColor = vec4(0., 0., 1.0, 1.0);
                } else {
                    gl_FragColor = vec4(0.0, 1.0, 0.0, 1.);
                }
                */
            }
        `;
                 
    }    

    _makeBaseCurves()
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

        // t: u/0.5
        // pt.x: x
        // pt.y: z
        this.xzCurve = new bzCurveQuad(
            new Point(0, 0),
            new Point(0, 1),
            new Point(1, 1)
        );
        
        // t: v
        // pt.x: z
        // pt.y: y
        this.yzCurve = new bzCurveQuad(
            new Point(0, 0),
            new Point(0, 1),
            new Point(1, 1)
        );
    }

    _getXYPointAt(u)
    {
        if (u < this.midPoint)
        {
            return this.botCurve.getPointAt(u / this.midPoint);
        }

        let u2 = (u - this.midPoint) / (1 - this.midPoint);
        return this.topCurve.getPointAt(u2);
    }

    _getXZPointAt(u)
    {
        return this.xzCurve.getPointAt(u);
    }

    _getYZPointAt(u)
    {
        return this.yzCurve.getPointAt(u);
    }

    _getVertex(u, v)
    {
        let xyPoint = this._getXYPointAt(v);
        let yzPoint = this._getYZPointAt(v);
        let xzPoint = this._getXZPointAt(u * xyPoint.x);

        let xzMult = Math.sin(v * Math.PI);

        let x, y, z;

        x = u * (this.width/2);
        y = v * this.height;
        z = 0; 
        
        x = x * xyPoint.x;
        
        z = yzPoint.x;
        z = (z - (xzPoint.y * v));
        // z /= 2;

        z *= this.depth;

        return vec3.fromValues(x,y,z);
    }

    _addVerts(v, divsX, nextV)
    {
        let u, nextU;
        let point;

        let lastPoint = null;
        let normal;

        let a, b, A, B;

        // right side
        for (let i=0; i <= divsX; i++)
        {
            u = (i / (divsX));
            nextU = (i + 1) / divsX;

            point = this._getVertex(u, v);

            a = this._getVertex(u, nextV);
            A = vec3.fromValues(
                a[0] - point[0], 
                a[1] - point[1], 
                a[2] - point[2]
            );

            if (lastPoint == null) {
                // normal = [0, 0, -1];
                normal = vec3.fromValues(0, 0, -1);

                b = this._getVertex((i+1)/divsX, v);
            }
            else 
            {
                b = this._getVertex((i-1)/divsX, v);
            }

            B = vec3.fromValues(
                (point[0] - b[0]),
                point[1] - b[1],
                point[2] - b[2]
            );

            normal = vec3.create();
            if (i < 1)
            {
                vec3.cross(normal, B, A);
            }
            else
            {
                vec3.cross(normal, A, B);

            }
            vec3.normalize(normal, normal);

            this.addVertex(
                point[0], point[1], point[2],
                (u * 0.5) + 0.5, v,
                [normal[0], normal[1], normal[2]]
            );

            lastPoint = point;
        }

        // left side
        for (let i=1; i <= divsX; i++)
        {
            u = (i / (divsX));
            point = this._getVertex(u, v);

            a = this._getVertex(u, nextV);
            A = vec3.fromValues(
                a[0] - point[0], 
                a[1] - point[1], 
                a[2] - point[2]
            );

            b = this._getVertex((i-1)/divsX, v);
            B = vec3.fromValues(
                (point[0] - b[0]),
                point[1] - b[1],
                point[2] - b[2]
            );            

            normal = vec3.create();
            vec3.cross(normal, A, B);            
            vec3.normalize(normal, normal);

            this.addVertex(
                -point[0], point[1], point[2],
                (u * 0.5)+0.5, v,
                [normal[0], normal[1], normal[2]]
            );
        }
    }

    _addStartFaces(divsX, divsY)
    {
        let indices = [];
        let i1, i2;
        i1 = 1;
        
        for (let i=0; i < divsX; i++)
        {
            indices.push(0, i + 2, i + 1);
            
            i2 = 1 + (divsX + 1) + i;

            if (i > 0) i1 = i2 - 1;

            indices.push(0, i1, i2);
        }
        this.faceIndices = this.faceIndices.concat(indices);
    }

    _addEndFaces(divsX, divsY)
    {
        let indices = [];

        let startLoop = (divsY - 2) * ((divsX*2)+1) + 1;
        let lastVert = startLoop + ((divsX*2) + 1);

        let i1, i2;
        i2 = startLoop;

        for (let i=0; i < divsX; i++)
        {
            indices.push(lastVert, startLoop+i, startLoop+i+1);
            i1 = startLoop+(divsX+1) + i;
            
            if (i > 0)
            {
                i2 = i1 - 1;
            }
            
            indices.push(lastVert,
                    i1,
                    i2);
        }

        this.faceIndices = this.faceIndices.concat(indices);
    }

    _addFaceStrip(ymin, ymax, divsY, divsX)
    {
        let indices = [];

        /*
        C--D
        | /|
        |/ |
        A--B
        */

        let startBottom = ymin * ((divsX*2) + 1) + 1;
        let startTop = ymax * ((divsX*2) + 1) + 1;

        let i1, i2, i3, i4;

        for (let i=0; i < divsX; i++)
        {   
            // right side

            // A D C
            indices.push(
                startBottom + i,
                startTop + i + 1,
                startTop + i  
            );

            // A B D
            indices.push(
                startBottom + i,
                startBottom + i + 1,
                startTop + i + 1
            );  
            
            // left side
            i1 = startBottom;
            i2 = startTop + (divsX + 1);
            i3 = startTop;
            i4 = startBottom + (divsX + 1);

            if (i > 0) {
                i1 += (divsX + 1) + (i-1);
                i2 += i;
                i3 = i2 - 1;
                i4 += i;
            }

            indices.push(
                i1, i3, i2,
                i1, i2, i4
            );
        }

        this.faceIndices = this.faceIndices.concat(indices);
    }

    setDimensions()
    {   
        let r = this.rand;
        /*
        this.width = r.randInRange(1, 3);
        this.height = r.randInRange(2, 10);
        this.depth = r.randInRange(1, 3);
        */
       
        this.width = 7;
        this.height = 5;
        this.depth = 3;

        this.divsX = 4;
        this.divsY = 4;

    }

    _addFirstVertex()
    {

        let B = vec3.fromValues(1, 0, 0);
        
        let a = this._getVertex(0, 1/this.divsY);
        let A = vec3.fromValues(
            a[0], a[1], a[2]
        );

        let normal = vec3.create();
        vec3.cross(normal, A, B);

        // first vertex at the origin
        this.addVertex(0, 0, 0,
            0.5, 0,
            [normal[0], normal[1], normal[2]]);

    }

    _addLastVertex()
    {
        let point = this._getVertex(0, 1);

        let B = vec3.fromValues(1, 0, 0);
        
        let a = this._getVertex(0, (1 - 1/this.divsY));
        let A = vec3.fromValues(
            point[0] - a[0],
            point[1] - a[1],
            point[2] - a[2]
        );

        let normal = vec3.create();
        vec3.cross(normal, A, B);

        // first vertex at the origin
        this.addVertex(point[0], point[1], point[2],
            0.5, 1,
            [normal[0], normal[1], normal[2]]);

    }

    updateGeometry()
    {
        let gl = this.gl;
        let r = this.rand;

        this.setDimensions();

        this._makeBaseCurves();
        let normal = vec3.create();

        let A;

        this._addFirstVertex();

        let v;
        for (let i=1; i < this.divsY; i++)
        {
            v = i / (this.divsY);
            this._addVerts(v, this.divsX, (i+1)/this.divsY);
        }
        this._addLastVertex();

        /*
        let lastPt = this._getVertex(0, 1);
        this.addVertex(lastPt[0], lastPt[1], lastPt[2],
            0.5, 1,
            );
        */

        this._addStartFaces(this.divsX, this.divsY);
        for (let i=1; i < this.divsY-1; i++)
        {
            this._addFaceStrip(i-1, i, this.divsY, this.divsX);
        }
        this._addEndFaces(this.divsX, this.divsY);

    }
}