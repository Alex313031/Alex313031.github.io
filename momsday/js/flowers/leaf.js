class Leaf extends ComplexCurveModel
{
    constructor(gl, seed, options)
    {
        super(gl, seed, true);

        this.widthRange = [2,4];
        this.heightRange = [4, 7];
        this.depthRange = [2,5];

        if (options)
        {
            this.widthRange = options.widthRange || this.widthRange;
            this.heightRange = options.heightRange || this.heightRange;
            this.depthRange = options.depthRange || this.depthRange;
        }

        this._updateGeometryWrapper();
    }

    initShaders()
    {
        super.initShaders();

        
        this.fsShaderSource = `
            varying highp vec2 vTextureCoord;
            varying highp vec3 vLighting;
            varying highp vec3 vNormal;
            highp vec2 newTex;

            uniform sampler2D uSampler;

            void main() {
                highp vec3 darkGrn = vec3(0.1, 0.2, 0.);
                highp vec3 lightGrn = vec3(0., 0.3, 0.);
                
                highp vec3 color = vec3(0., vTextureCoord[0], 0.1);

                highp float val = vTextureCoord[0] - vTextureCoord[1];
                val = ((cos(val * 50.)) + 1.)/2.;

                highp vec3 valMult = vec3(val * 1.);

                // color = valMult;

                if (gl_FrontFacing) {
                    // gl_FragColor = vec4(0., vTextureCoord[0], 0., 1.);
                    color = vec3(0., vTextureCoord[0] * 0.5, 0.);
                    color = vec3(0., val * vTextureCoord[0], 0.);
                    
                    color = mix(lightGrn, darkGrn, val);
                    
                    // color = vec3(1.);
                }

                gl_FragColor = vec4(color * vLighting, 1.);
            }
        `;  
    }

    animate(dt)
    {
        // this.rotateY(dt * 0.1);
    }

    setDimensions()
    {
        let r = this.rand;
        super.setDimensions();

        this.height = r.randInRange(this.heightRange[0], this.heightRange[1]);
        this.width = r.randInRange(this.widthRange[0], this.widthRange[1]);
        this.depth = r.randInRange(this.depthRange[0], this.depthRange[1]);

        this.divsX = 8;
        this.divsY = 12;
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

}