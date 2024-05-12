class Stem extends DynamicModel
{
    constructor(gl, seed)
    {
        super(gl, seed);

        this.baseRingPos = [];
    }

    initShaders()
    {
        super.initShaders();

        this.fsShaderSource = `
            varying highp vec2 vTextureCoord;
            varying highp vec3 vLighting;
            highp vec2 newTex;

            uniform sampler2D uSampler;
            uniform mediump float u_time;

            void main() {
                mediump vec3 color = vec3(0., vTextureCoord[1], 0.);
            
                gl_FragColor = gl_FragColor = vec4(color * vLighting, 1.);;
            }        
        `;
        
    }

    getLastPoint()
    {
        let p = this.baseCurve.getPointAt(1);

        return vec3.fromValues(
            p.x,
            p.y,
            0
        );
    }

    getTipAngle()
    {
        let end = this.getLastPoint();
        let beforeEnd = this.baseCurve.getPointAt(0.8);

        let dist = vec3.create();
        vec3.sub(dist, end, vec3.fromValues(beforeEnd.x, beforeEnd.y, 0));

        let angle = vec3.angle(dist, vec3.fromValues(0, 1, 0));
        return this.radToDeg(angle);
    }

    _addVertRing(yPos, vCoord, rad, offset, rotation)
    {
        let vFinal;
        let origin = vec3.create();
        
        let centerVec = vec3.fromValues(offset[0],
            offset[1],
            0);

        let verts = [];
        let normals = [];
        let n;
        this.baseRingPos.forEach( v => {            
            vFinal = vec3.fromValues(
                v[0] * rad,
                0,
                v[2] * rad
            );
            
            vec3.rotateZ(vFinal, vFinal, origin, rotation);
            
            n = vec3.create();

            vec3.sub(n, vFinal, centerVec);
            vec3.normalize(n, n);

            normals.push(n[0], n[1], n[2]);

            verts.push( [vFinal[0] + offset[0],
                vFinal[1] + offset[1], 
                vFinal[2]]);
            
        });
        verts = verts.reduce((acc, val) => acc.concat(val), []);
        this.vertexPositions = this.vertexPositions.concat(verts);

        this.normals = this.normals.concat(normals);

        let texCoords = [];
        for (let i=0; i < this.baseRingPos.length; i++)
        {
            texCoords = texCoords.concat([
                (i / this.baseRingPos.length-1), vCoord
            ]);            
        }
        this.textureCoords = this.textureCoords.concat(texCoords);
    }

    _addRingFaces(rMin, rMax, divs)
    {
        let x1, x2;
        for (let i=0; i < divs; i++)
        {
            x1 = i;
            x2 = (i + 1) % divs;
            this.faceIndices = this.faceIndices.concat(
            [
                rMin * divs + i, rMax * divs + i, rMax * divs + x2, 
                rMin * divs + i, rMax * divs + x2, rMin * divs + x2]        
            );            

        }
    }

    _addLeaf(u, leafSeed)
    {
        let r = this.rand;

        let leaf;
        let p1, p2;
        let angle;
        let rad;        

        p1 = this.baseCurve.getPointAt(u);
        p2 = this.baseCurve.getPointAt(u + 0.2);

        rad = ((this.r2 - this.r1) * u) + this.r1;

        // angle = p1.angleTo(p2);

        leaf = new Leaf(this.gl, leafSeed, {
            heightRange: [5, 10],
            depthRange: [3, 5],
            widthRange: [5, 7]            
        });

        angle = r.random() * Math.PI * 2;
        leaf.rotationY = -this.radToDeg(angle) - 90;
        leaf.rotationX = r.random() * 60;
        
        // angle = this.degToRad(angle);

        leaf.z = 0 - Math.sin(angle) * (rad * 0.6);
        leaf.y = p1.y;
        leaf.x = p1.x - (Math.cos(angle) * (rad * 0.6));

        this.addChild(leaf);

    }

    _addLeaves()
    {
        let r = this.rand;

        let numLeaves = r.randInt(5, 10);
        let leafSeed = r.randInRange(1, 1000);

        /*
        let leaf;
        let p1, p2;
        let angle;
        let rad;        
        */
        let u;
        for (let i=0; i < numLeaves; i++)
        {
            u = r.randInRange(0.1, 0.79);
            this._addLeaf(u, leafSeed);
        }
    }

    updateGeometry()
    {
        let r = this.rand;

        this.height = r.randInRange(20, 60);
        this.depth = r.randInRange(0, 20);

        // height = 20;
        // depth = 30;

        this.midpoint = r.random() * (this.height/4) + (this.height * 0.25);

        // create base curve
        this.baseCurve = new bzCurveQuad(
            new Point(0, 0),
            new Point(0, this.midpoint),
            new Point(this.depth, this.height)
        );

        let divsHeight = 10;
        let divsRound = 32;

        this.baseRingPos = [];

        let x, z, theta;
        let slice = Math.PI * 2 / divsRound;

        for (let i=0; i < divsRound; i++)
        {
            x = Math.cos(i * slice);
            z = Math.sin(i * slice);
            this.baseRingPos.push([x, 0, z]);
        }

        this.r1 = 1;
        this.r2 = 0.2;

        this._addVertRing(0, 0, this.r1, [0,0], 0);
        
        let rad, u, y;
        let pt;
        let angle;
        let ptPrev = new Point(0, 0);

        for (let i=1; i < divsHeight; i++)
        {
            u = (i / (divsHeight-1));
            rad = (this.r2 - this.r1) * u + this.r1;

            pt = this.baseCurve.getPointAt(u);
            angle = pt.angleTo(ptPrev);
            angle = -(Math.PI/2 - angle);

            this._addVertRing(0, u, rad, [pt.x, pt.y], angle);
            this._addRingFaces(i-1, i, divsRound);    
        
            ptPrev = pt;
        }

        this._addLeaves();
    }
}