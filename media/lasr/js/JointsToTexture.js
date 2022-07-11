import Joint from './Joint.js'


class JointsToTexture {

  constructor ( options ) {

    Object.assign(this, {

      joints: [],

      height: 0,

      texture: {value: undefined},

      textureDim: {value: new THREE.Vector2()},

      onNewDataTexture: tex => {
        // callback when the texture size changes
      }

    }, options || {} )

  }

  update () {

    // if there's nothing to do don't do it
    if(!this.joints.length) return;


    // check to see if we need to resize
    if (this.height < this.joints.length && this.texture.value) {

      // dispose of the texture and we'll make a new one on the following step
      this.texture.value.dispose()
      this.texture.value = undefined

    }

    // create a new data texture if needed
    if( this.height < this.joints.length ) {

      // create the joint texture and assign height
      let w = 4; // 4 pixels needed for 1 matrix
      let h = THREE.Math.nextPowerOfTwo( this.joints.length )
      this.height = h

      this.jointData = new Float32Array(w * 4 * h)

      this.texture.value = new THREE.DataTexture( this.jointData, w, h, THREE.RGBAFormat, THREE.FloatType );

      Object.assign( this.texture.value, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter
      })

      this.textureDim.value.set( w, h )

      this.onNewDataTexture( this.texture.value )

    }


    // iterate through the bodies and add the data to our texture
    this.joints.forEach( ( j, i ) => {
      j.update()
      j.transform.toArray( this.jointData, i * 16);
    });

    // send it to the gpu
    this.texture.value.needsUpdate = true;
  }

  getJointCount(){
    return this.joints.length
  }

  addJoint( body, transform, debugMesh ) {

    var j = new Joint({
      transform: transform,
      body: body,
      debugMesh: debugMesh } )

    this.joints.push( j )

    return j
  }

}


module.exports = JointsToTexture
