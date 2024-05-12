class LeafOld extends DynamicModel
{
    constructor(gl, seed)
    {
        super(gl, seed);
        this.numQuads = 0;

        this.totalTime = 0;
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
                gl_FragColor = vec4(1.0);
            }
        `;
    }

    get numTriangles()
    {
        return this.faceIndices.length;
    }

    animate(dt)
    {
        this.totalTime += dt;
        // this.rotationZ = Math.cos(this.totalTime / 1000) * 30;
    }

    _addSlice(w, h, x1, y1, x2, y2)
    {   
        let verts = [
            0, y1, 0,   // 0
            x1, y1, 0,  // 1
            x2, y2, 0,  // 2
            0, y2, 0,   // 3

            0, y1, 0,   // 4
            -x1, y1, 0, // 5
            -x2, y2, 0, // 6
            0, y2, 0,   // 7
        ];

        let m;
        verts = verts.map((v, i) => {
            m = i % 3;
            if (m === 0) return v * w;
            if (m === 1) return v * h;
            return v;
        });

        let offset = this.vertexPositions.length/3;

        this.vertexPositions = this.vertexPositions.concat(verts);

        this.textureCoords = this.textureCoords.concat([
            0.5, y1,
            1, y1,
            1, y2,
            0.5, y2,

            0.5, y1,
            1, y1,
            1, y2,
            0.5, y2,
        ]);

        this.faceIndices = this.faceIndices.concat([
            offset, offset+1, offset+2,
            offset, offset+2, offset+3,

            offset+4, offset+6, offset+5,
            offset+4, offset+7, offset+6           
        ]);
        this.numQuads += 2;
        this.triangleCount += 4;        
        
    }

    updateGeometry()
    {
        let gl = this.gl;
        this.numQuads = 0;
        this.triangleCount = 0;
        let r = this.rand;
        let w = r.randInt(10, 30);
        let h = r.randInt(20, 40);

        let xVals = [0, 0.8, 1, 0.8, 0.8];
        let yVals = [0, 0.1, 0.5, 0.9, 1];

        let midPoint = r.random() * 0.5 + 0.25;
        let botMid = r.random() * (midPoint * 0.5) + (midPoint * 0.25);
        let topMid = r.random() * ((1-midPoint) * 0.5) + ((1-midPoint) * 0.25);
        topMid += midPoint;

        let points = [];
        points[0] = new Point(0, 0);

        points[1] = new Point(0, botMid);
        points[2] = new Point(1, botMid);
        
        points[3] = new Point(1, midPoint);

        points[4] = new Point(1, topMid);
        points[5] = new Point(0, topMid);

        points[6] = new Point(0, 1);

        let botCurve = new bzCurveCubic(points[0], points[1], points[2], points[3]);
        let topCurve = new bzCurveCubic(points[3], points[4], points[5], points[6]);

        let divs = 12;
        let p0 = botCurve.getPointAt(0);
        let p1;

        for (let i=1; i < divs; i++)
        {
            p1 = botCurve.getPointAt(i/(divs-1));
            this._addSlice(w, h, p0.x, p0.y, p1.x, p1.y);
            p0 = p1;
        }

        p0 = topCurve.getPointAt(0);
        for (let i=1; i < divs; i++)
        {
            p1 = topCurve.getPointAt(i/(divs-1));
            this._addSlice(w, h, p0.x, p0.y, p1.x, p1.y);
            p0 = p1;
        }
    }

    updateGeometryOld(gl)
    {
        this.numQuads = 0;
        let r = this.rand;
        let w = r.randInt(10, 30);
        let h = r.randInt(20, 40);

        let yVals = [0];
        let yRemaining = 1;
        let yTotal = 0;
        let newY = 0;

        // small jump
        newY = r.random() * 0.15;
        yVals.push(newY);
        yRemaining -= newY;
        yTotal += newY;

        // bigger jump
        newY = r.random() * (yRemaining * 0.5) + (yRemaining * 0.25);
        yVals.push(newY+yTotal);
        yRemaining -= newY;
        yTotal += newY;

        // one more
        newY = ((r.random() * (yRemaining * 0.1)) + (yRemaining * 0.8));
        newY += (1 - yRemaining);
        // newY = yRemaining * 0.1;
        yVals.push(newY + yTotal);
        yRemaining -= newY;

        yVals.push(1);

        // yVals = [0, 0.1, 0.5, 0.9, 1];
        // yVals[3] = 0.9;

        let xVals = [0];
        xVals[1] = (r.random() * 0.1) + 0.1;
        xVals[2] = 1;
        xVals[3] = (r.random() * 0.1) + 0.1;
        xVals[4] = 0;

        console.log(w, h);

        for (let i=0; i < 4; i++)
        {
            this._addSlice(w, h, xVals[i], yVals[i], xVals[i+1], yVals[i+1]);
        }


    }
}