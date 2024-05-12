class Scene
{
    constructor(canvasEl)
    {
        this.canvas = document.getElementById(canvasEl);
        this.gl = this.canvas.getContext("webgl");

        this.canvas.onmouseover = this.stopAnim.bind(this);
        this.canvas.onmouseout = this.startAnim.bind(this);
        this.canvas.onmousemove = this.mousemove.bind(this);

        this.bounds = this.canvas.getBoundingClientRect();
        console.log(this.bounds);
        
        if (this.gl === null)
        {
            alert("WebGL not available");
        }

        this._lastUpdate = -1;

        this.children = [];

        this.flower = new Flower(this.gl);
        this.flower.x = 0;
        this.flower.y = -30;
        this.flower.z = -70;            
        this.children.push(this.flower);

        this.animating = true;
        this.update(0);
    }

    setFlowerSeedFromLocation(lat, long)
    {
        this.flower.setSeedFromLocation(lat, long);
    }

    startAnim()
    {
        this.animating = true;
    }

    stopAnim()
    {
        this.animating = false;
    }

    mousemove(evt)
    {    
        let x = ((evt.clientX - this.bounds.x) / this.bounds.width);
        x = (x - 0.5) * 360;

        let y = ((evt.clientY - this.bounds.y)) / this.bounds.height;
        y = (y - 0.5) * 90;

        // this.plant.rotationY = y;
        this.children.forEach(c => {
            c.rotationY = x;
            // c.rotationX = y;
        });
    }

    update(totalTime)
    {
        let deltaTime = 0;
        if( this._lastUpdate != -1 )
        {
            deltaTime = totalTime - this._lastUpdate;
        }
        this._lastUpdate = totalTime;

        if( deltaTime === deltaTime )
        {
            this.children.forEach( e =>
            {
                e.update( deltaTime );
            } );
        }

        if (this.animating)
        {
            // this.plant.rotateY(deltaTime * 0.1);
            this.children.forEach(c => {
                c.rotateY(deltaTime * 0.1);
            });
        
        }
        
        this.drawScene();
        requestAnimationFrame(this.update.bind(this));
    }

    drawScene()
    {
        let gl = this.gl;
        gl.clearColor(0.2, 0.2, 0.2, 0.2);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        // gl.enable(gl.CULL_FACE);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const fieldOfView = 45 * Math.PI / 180;
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 1000.0;
        const projectionMatrix = mat4.create();

        mat4.perspective(projectionMatrix,
            fieldOfView,
            aspect,
            zNear,
            zFar);
            
        this.children.forEach(c => {
            c.draw(projectionMatrix);
        });    
    }

}
