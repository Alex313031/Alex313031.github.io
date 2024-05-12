class LGCRandom
{
    constructor(seedVal)
    {
        this.a = 1664525;
        this.c = 1013904223;
        this.m = 4294967296; // Math.pow(2,32)

        this._seed = seedVal;

        this._value = 0;

        this.init();
    }

    // resets the random generation
    init()
    {
        if (this._seed === undefined) 
        {
            // this.seed = parseInt(Date.now()) % this.m;
            let d = new Date();
            this.seed = d.getMilliseconds();
        }
        else
        {
            this.seed = this._seed;
        }
    }

    set seed(seedVal)
    {
        this._seed = seedVal;
        this._value = this._seed;
    }

    get seed()
    {
        return this._seed;
    }

    _splitDec(input)
    {
        let intComponent = Math.floor(input);
        let fracComponent = input - intComponent;
        return [intComponent, fracComponent];
    }

    // sets the seed from a given pair of lat/long coordinates
    // the starting seed is pulled from the first 5 digits of the lat/long values,
    // combined into a single number (only 5 digits are used so that the total remains less than M)
    // the remaining digits are combined to get a number of times to generate a 
    // value, effectively skipping ahead in the random sequence
    setSeedFromLocation(lat, long)
    {
        lat = (lat + 90) * 100;
        long = (long + 180) * 100;

        let latParts = this._splitDec(lat);
        let longParts = this._splitDec(long);
        
        let locSeed = (latParts[0] * 100000) + longParts[0];
        let reps = Math.floor((latParts[1] * 200) + (longParts[1]+100));

        this.seed = locSeed;

        for (let i=0; i < reps; i++)
        {
            this.random();
        }
    }

    /**
     * return a random number 0-1
     */
    random()
    {
        this._value = ((this.a * this._value) + this.c) % this.m;
        return (this._value / this.m);
    }

    randomColor()
    {
        return [this.random(), this.random(), this.random()];
    }

    randInt(min, max)
    {
        let r = this.random();
        return Math.floor((max-min) * r) + min;
    }

    randInRange(min, max)
    {
        return this.random() * (max-min) + min;
    }

    randN(max)
    {
        return this.randInt(0, max);
    }

    testDistribution(num)
    {
        let count = [];
        let n;
        for (let i=0; i < num; i++)
        {
            n = this.randInt(0,10);
            if (count[n] != undefined)
            {
                count[n]++;
            }
            else
            {
                count[n] = 1;
            }
        }
        console.log(count);
    }
}