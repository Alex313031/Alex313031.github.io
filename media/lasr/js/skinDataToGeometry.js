// skinDataToGeometry.js

module.exports = (json, skinIndexOffset) => {



  var faces = json['meshData']['faces']
  var v = json['meshData']['position'];
  var n = json['meshData']['normal'];
  var uv = json['meshData']['uv'][Object.keys(json['meshData']['uv'])[0]];
  var sw = json['skinWeights'] || json['skinAndBones']['skinWeights'];
  // var sw = json['skinAndBones']['skinWeights'];
  var si = json['skinIndices'] || json['skinAndBones']['skinIndices'];
  // var si = json['skinAndBones']['skinIndices'];

  var sio = (skinIndexOffset || 0)

  var positions = [];
  var normals = [];
  var uvs = [];

  var jointWeights = [];
  var jointIndices = [];

  var addPos = p => {
    positions.push(p[0], p[1], p[2])
  }

  var addNorm = n => {
    normals.push(n[0], n[1], n[2])
  }

  var addUV = uv => {
    uvs.push(uv[0], uv[1])
  }

  var addJointWeights = jw => {
    jointWeights.push( jw[0], jw[1], jw[2] )
  }

  var addJointIndices = ji => {
    jointIndices.push( ji[0] + sio, ji[1] + sio, ji[2] + sio )
  }

  // interate through the faces
  var v0, v1, v2, i, j;
  faces.forEach( function( f ){

    // iterate through the face triangles
    for(i=1, j=2; j<f[0].length; i++, j++) {

      // positions
      addPos( v[ f[0][0] ] );
      addPos( v[ f[0][i] ] );
      addPos( v[ f[0][j] ] );

      // normals
      addNorm( n[ f[1][0] ] );
      addNorm( n[ f[1][i] ] );
      addNorm( n[ f[1][j] ] );

      // uvs
      addUV( uv[ f[2][0] ] );
      addUV( uv[ f[2][i] ] );
      addUV( uv[ f[2][j] ] );

      // joint weights
      addJointWeights( sw[ f[0][0] ] );
      addJointWeights( sw[ f[0][i] ] );
      addJointWeights( sw[ f[0][j] ] );

      // joint indices
      addJointIndices( si[ f[0][0] ] );
      addJointIndices( si[ f[0][i] ] );
      addJointIndices( si[ f[0][j] ] );

    }

  });

  // create the Buffer mesh
  var geometry = new THREE.BufferGeometry();

  geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array(positions), 3 ) );
  geometry.addAttribute( 'orig_position', new THREE.BufferAttribute( new Float32Array(positions), 3 ) );
  geometry.addAttribute( 'orgPos', new THREE.BufferAttribute( new Float32Array(positions), 3 ) );
  geometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array(normals), 3 ) );
  geometry.addAttribute( 'jointWeights', new THREE.BufferAttribute( new Float32Array(jointWeights), 3 ) );
  geometry.addAttribute( 'jointIndices', new THREE.BufferAttribute( new Float32Array(jointIndices), 3 ) );
  geometry.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array(uvs), 2 ) );

  return geometry;
}
