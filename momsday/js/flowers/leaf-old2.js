class Leaf extends DynamicModel
{
    constructor(gl, seed)
    {
        super(gl, seed);
    }

    initShaders()
    {
        super.initShaders();

        this.fsShaderSource = `
            varying highp vec2 vTextureCoord;
            highp vec2 newTex;

            uniform sampler2D uSampler;
            uniform mediump float u_time;

            void main() {
                gl_FragColor = vec4(0.2, vTextureCoord[0]-0.5, (1.0-vTextureCoord[0]) * 0.2, 1.0);
                // gl_FragColor = vec4(1.0);
            }
        `;
                
    }

    animate(dt)
    {
        // this.rotateY(dt * 0.02);
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
            new Point(0.2, 1),
            new Point(1, 1)
        );
        
        // t: v
        // pt.x: z
        // pt.y: y
        this.yzCurve = new bzCurveQuad(
            new Point(0, 0),
            new Point(0, 0.75),
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

    _getVertex(u, v)
    {
        let xzPoint = this.xzCurve.getPointAt(u);
        let xyPoint = this._getXYPointAt(v);
        let yzPoint = this.yzCurve.getPointAt(v);

        let x, y, z;

        x = (u * xyPoint.x) * this.width;

        y = v * this.height;

        z = 0;
        z += (yzPoint.x * -this.depth) * v;
        z += (xzPoint.y * (this.depth * 0.75)) * u * v;

        return vec3.fromValues(x,y,z);
    }

    _addVerts(v, divsX, nextV)
    {
        let xzPt;
        let u, x, y, z;

        let xyPoint = this._getXYPointAt(v);
        let yzPoint = this.yzCurve.getPointAt(v);

        let ypos = v * this.height;

        let xzMult = Math.sin(v * Math.PI);

        let otherSide = [];
        for (let i=0; i <= divsX; i++)
        {
            u = (i / (divsX));
            xzPt = this.xzCurve.getPointAt(u);
            x = (u * xyPoint.x) * this.width;

            z = 0;
            z += (-yzPoint.x * this.depth) * v;
            z += (xzPt.y * (this.depth * 0.75)) * xzMult;

            this.addVertex(
                x, ypos, z,
                (u * 0.5)+0.5, v
            );
        }

        for (let i=1; i <= divsX; i++)
        {
            u = (i / (divsX));
            xzPt = this.xzCurve.getPointAt(u);
            x = -(u * xyPoint.x) * this.width;

            z = 0;
            z += (-yzPoint.x * this.depth) * v;
            z += (xzPt.y * (this.depth * 0.75)) * xzMult;

            this.addVertex(
                x, ypos, z,
                (u * 0.5)+0.5, v
            );
        }

        /*
        otherSide.forEach(data => {
            this.addVertex(
                data[0], data[1], data[2],
                data[3], data[4]
            )
        });
        */
    }

    _addStartFaces(divsX, divsY)
    {
        let indices = [];
        let i1, i2;
        i1 = 1;
        
        for (let i=0; i < divsX; i++)
        {
            indices.push(0, i + 1, i + 2);
            
            i2 = 1 + (divsX + 1) + i;

            if (i > 0) i1 = i2 - 1;

            indices.push(0, i2, i1);
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

    updateGeometry()
    {
        let gl = this.gl;
        let r = this.rand;

        this.width = r.randInRange(1, 3);
        this.height = r.randInRange(2, 10);
        this.depth = r.randInRange(1, 3);

        this._makeBaseCurves();

        let divsX = 30;
        let divsY = 30;

        // first vertex at the origin
        this.addVertex(0, 0, 0,
            0.5, 0,
            [0, 0, 1]);

        let u;
        for (let i=1; i < divsY; i++)
        {
            u = i / (divsY);
            this._addVerts(u, divsX);
        }

        let lastPt = this._getVertex(0, 1);
        this.addVertex(lastPt[0], lastPt[1], lastPt[2],
            0.5, 1,
            );

        this._addStartFaces(divsX, divsY);

        for (let i=1; i < divsY-1; i++)
        {
            this._addFaceStrip(i-1, i, divsY, divsX);
        }

        this._addEndFaces(divsX, divsY);

    }
}