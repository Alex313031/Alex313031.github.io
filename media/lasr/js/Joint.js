

var quat = new THREE.Quaternion()
var scl = new THREE.Vector3(1,1,1)

class Joint {

  constructor( options ) {

    Object.assign( this, {

      transform: new THREE.Matrix4(),

      offset: new THREE.Matrix4(),

      bodyMatrix: new THREE.Matrix4(),

      localMatrix: new THREE.Matrix4(),

      matrixWorld: new THREE.Matrix4(),

      body: null,

      box: null,

      debugMesh: null

    }, options || {} )

    this.setup( this.transform )

  }


  setup( transform ){

    this.composeBodyMatrix()

    var invParent = new THREE.Matrix4().getInverse( this.bodyMatrix )

    this.localMatrix.copy( invParent ).multiply( transform )

    this.offset.getInverse( transform )

  }

  update(){

    this.updateMatrixWorld()

    if(this.debugMesh) {

      this.matrixWorld.decompose(
        this.debugMesh.position,
        this.debugMesh.quaternion,
        this.debugMesh.scale)

    }

    this.transform.copy( this.matrixWorld ).multiply( this.offset )

  }

  composeBodyMatrix() {
    this.bodyMatrix.compose(
      this.body.position,
      quat.copy(this.body.quaternion),
      scl)
  }

  updateMatrixWorld () {
    this.composeBodyMatrix()
    this.matrixWorld.copy( this.bodyMatrix ).multiply( this.localMatrix );
  }

}


module.exports = Joint
