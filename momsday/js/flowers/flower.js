class Flower extends DynamicModel
{
    constructor(gl, seed)
    {
        super(gl, seed);
    }

    updateGeometry()
    {
        let r = this.rand;

        this.stem = new Stem(this.gl, r.seed);
        this.addChild(this.stem);

        this.flowerBase = new Node3d();

        this.center = new FlowerCenter(this.gl, r.seed), {
            maxR: 3,
            height: 2
        };
        this.center.y = 0.1;
        this.flowerBase.addChild(this.center);

        let numPetals = r.randInt(3,12);
        let p;
        for (let i=0; i < numPetals; i++)
        {
            p = new Petal(this.gl, r.seed, {
                heightRange: [5, 10],
                depthRange: [3, 10],
                widthRange: [5, 7]
            });
            p.rotationX = 5;
            p.rotationZ = 20;
            p.rotationY = (i / numPetals) * 360 + 20;
            this.flowerBase.addChild(p);
        }

        let tip = this.stem.getLastPoint();

        this.flowerBase.x = tip[0];
        this.flowerBase.y = tip[1];
        this.flowerBase.z = tip[2];

        this.flowerBase.rotationZ = (-this.stem.getTipAngle()) * 3; // r.randInRange(2.0, 5);

        this.addChild(this.flowerBase);
    }
}