function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    
    mProjection = M4x4.makePerspective(localParam.camera.fov, gl.viewportWidth / gl.viewportHeight, localParam.camera.near, localParam.camera.far);
    
    mWorld = M4x4.makeTranslate3(0,0,0);  
    mView = M4x4.makeTranslate3(0,0,0);
    
    mView = M4x4.translate3(localParam.camera.translate[0],0,0,mView);
    mView = M4x4.translate3(0,-localParam.camera.translate[1],0,mView);
    mView = M4x4.translate3(0,0,localParam.camera.translate[2],mView);
    mView = M4x4.rotate(localParam.camera.rotate[0],V3.$(1,0,0),mView);
    mView = M4x4.rotate(localParam.camera.rotate[1],V3.$(0,1,0),mView);

	  localParam.camera.eye = V3.$(-mViewInv[12],-mViewInv[13],-mViewInv[14]);

    readDebugParam();
    simulate();
    drawJellyfish();

    gl.flush();
}



