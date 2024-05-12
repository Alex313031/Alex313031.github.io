class FlowerCenter extends LathedGeo
{
    constructor(gl, seed, options)
    {
        super(gl, seed, true);

        this.maxHeight = 3;
        this.maxRadius = 3;
        this.minHeight = 1;

        if (options)
        {
            this.maxHeight = options.height || 1;
            this.maxRadius = options.maxR || 2;
            this.minHeight = options.minHeight || 1;
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

            precision highp float;

            void main() {
                
                highp vec3 c1 = vec3(0.9, 0.5, 0.1);
                highp vec3 c2 = vec3(0.9, 0.9, 0.1);

                highp vec3 color = mix(c1, c2, smoothstep(0.9, 1.0, vTextureCoord[1]));
                
                gl_FragColor = vec4(color * vLighting, 1.);
                gl_FragColor = vec4(color, 1.);
            }
        `;         
    }

    setDimensions()
    {
        super.setDimensions();

        let r = this.rand;
        this.radius = r.randInRange(1, this.maxRadius);
        this.height = r.randInRange(this.minHeight, this.maxHeight);

        this.divsR = 12;
    }

    _makeBaseCurve()
    {
        let r = this.rand;
        this.midPoint = r.random() * 0.25 + 0.75;
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
        points[5] = new Point(r.random() * 0.2, 1);

        points[6] = new Point(0, 1);

        // xz curve is a combination of two 
        this.botCurve = new bzCurveCubic(points[0], points[1], points[2], points[3]);
        this.topCurve = new bzCurveCubic(points[3], points[4], points[5], points[6]);

        this.origin = vec3.fromValues(0, 0, 0);
    }

}