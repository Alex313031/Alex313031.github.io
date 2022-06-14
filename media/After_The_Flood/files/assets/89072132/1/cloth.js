// TODO: Optimize!

var Cloth = pc.createScript('cloth');

// initialize code called once per entity
Cloth.prototype._initialize = function() {
    
    var width = 22;
    var height = 9;
    
    var app = this.app;
    var device = app.graphicsDevice;
    var chunks = pc.shaderChunks;
    
    var instance, mat;
    
    var skinCloth = app.assets.find("transformSkinnedClothVS").resource;
    var normalCloth = app.assets.find("normalClothVS").resource;
    
    var meshes = this.entity.model.model.meshInstances;
    for(var i=0; i<meshes.length; i++) {
        meshes[i].drawToDepth = false;
        if (meshes[i].node.name==="06_extented") {
            console.log("cloth found");
            instance = meshes[i];
            mat = instance.material;
            mat.chunks.transformSkinnedVS = skinCloth;
            mat.chunks.normalSkinnedVS = normalCloth;
            mat.forceUv1 = true;
            mat.update();
            //break;
        }
    }
    
    var texPos = new pc.Texture(device, {
        width: width,
        height: height,
        format: pc.PIXELFORMAT_RGBA32F,
        autoMipmap: false
    });
    texPos.addressU = pc.ADDRESS_CLAMP_TO_EDGE;
    texPos.addressV = pc.ADDRESS_CLAMP_TO_EDGE;
    texPos.magFilter = pc.FILTER_NEAREST;
    texPos.minFilter = pc.FILTER_NEAREST;
    this.rtPos = new pc.RenderTarget(device, texPos, {
        depth: false
    });
    var texPos2 = new pc.Texture(device, {
        width: width,
        height: height,
        format: pc.PIXELFORMAT_RGBA32F,
        autoMipmap: false
    });
    texPos2.addressU = pc.ADDRESS_CLAMP_TO_EDGE;
    texPos2.addressV = pc.ADDRESS_CLAMP_TO_EDGE;
    texPos2.magFilter = pc.FILTER_NEAREST;
    texPos2.minFilter = pc.FILTER_NEAREST;
    this.rtPos2 = new pc.RenderTarget(device, texPos2, {
        depth: false
    });
    var texPrevPos = new pc.Texture(device, {
        width: width,
        height: height,
        format: pc.PIXELFORMAT_RGBA32F,
        autoMipmap: false
    });
    texPrevPos.addressU = pc.ADDRESS_CLAMP_TO_EDGE;
    texPrevPos.addressV = pc.ADDRESS_CLAMP_TO_EDGE;
    texPrevPos.magFilter = pc.FILTER_NEAREST;
    texPrevPos.minFilter = pc.FILTER_NEAREST;
    this.rtPrevPos = new pc.RenderTarget(device, texPrevPos, {
        depth: false
    });
    var texBoneIndex = new pc.Texture(device, {
        width: width,
        height: height,
        format: pc.PIXELFORMAT_R8_G8_B8_A8,
        autoMipmap: false
    });
    texBoneIndex.addressU = pc.ADDRESS_CLAMP_TO_EDGE;
    texBoneIndex.addressV = pc.ADDRESS_CLAMP_TO_EDGE;
    texBoneIndex.magFilter = pc.FILTER_NEAREST;
    texBoneIndex.minFilter = pc.FILTER_NEAREST;
    var texBoneWeight = new pc.Texture(device, {
        width: width,
        height: height,
        format: pc.PIXELFORMAT_RGBA32F,
        autoMipmap: false
    });
    texBoneWeight.addressU = pc.ADDRESS_CLAMP_TO_EDGE;
    texBoneWeight.addressV = pc.ADDRESS_CLAMP_TO_EDGE;
    texBoneWeight.magFilter = pc.FILTER_NEAREST;
    texBoneWeight.minFilter = pc.FILTER_NEAREST;
    
    var texPosLocal = new pc.Texture(device, {
        width: width,
        height: height,
        format: pc.PIXELFORMAT_RGBA32F,
        autoMipmap: false
    });
    texPosLocal.addressU = pc.ADDRESS_CLAMP_TO_EDGE;
    texPosLocal.addressV = pc.ADDRESS_CLAMP_TO_EDGE;
    texPosLocal.magFilter = pc.FILTER_NEAREST;
    texPosLocal.minFilter = pc.FILTER_NEAREST;
    
    var texNormal = new pc.Texture(device, {
        width: width,
        height: height,
        format: pc.PIXELFORMAT_RGBA32F,
        autoMipmap: false
    });
    texNormal.addressU = pc.ADDRESS_CLAMP_TO_EDGE;
    texNormal.addressV = pc.ADDRESS_CLAMP_TO_EDGE;
    texNormal.magFilter = pc.FILTER_NEAREST;
    texNormal.minFilter = pc.FILTER_NEAREST;
    this.rtNormal = new pc.RenderTarget(device, texNormal, {
        depth: false
    });
    
    this.constantClothWorldPos = device.scope.resolve("clothWorldPos");
    this.constantClothWorldPos.setValue(texPos);
    device.scope.resolve("clothPrevWorldPos").setValue(this.rtPrevPos.colorBuffer);
    device.scope.resolve("clothBoneIndex").setValue(texBoneIndex);
    device.scope.resolve("clothBoneWeight").setValue(texBoneWeight);
    this.constantClothSkinMatrices = device.scope.resolve("clothSkinMatrices");
    this.constantClothSkinPoseMapSize = device.scope.resolve("clothSkinPoseMapSize");
    device.scope.resolve("clothLocalPos").setValue(texPosLocal);
    this.constantSkinOffset = device.scope.resolve("clothSkinOffset");
    this.constantSkinOffsetPrev = device.scope.resolve("clothSkinOffsetPrev");
    device.scope.resolve("clothNormal").setValue(texNormal);
    //device.scope.resolve("clothWorldPos").setValue( app.assets.find("22x9_color.png").resource );
    
    instance._skinInstance.updateMatrices();
    var mesh = instance.mesh;
    var pixels = texPos.lock();
    var pixelsBI = texBoneIndex.lock();
    var pixelsBW = texBoneWeight.lock();
    var pixelsL = texPosLocal.lock();
    var elems = mesh.vertexBuffer.format.elements;
    var numVerts = mesh.vertexBuffer.numVertices;
    var vertSize = mesh.vertexBuffer.format.size;
    var index;
    var offsetP, offsetI, offsetW, offsetUv2;
    var j, k;
    for(i=0; i<elems.length; i++) {
        if (elems[i].name===pc.SEMANTIC_POSITION) {
            offsetP = elems[i].offset;
        } else if (elems[i].name===pc.SEMANTIC_BLENDINDICES) {
            offsetI = elems[i].offset;
        } else if (elems[i].name===pc.SEMANTIC_BLENDWEIGHT) {
            offsetW = elems[i].offset;
        } else if (elems[i].name===pc.SEMANTIC_TEXCOORD1) {
            offsetUv2 = elems[i].offset;
        }
    }
    var data8 = new Uint8Array(mesh.vertexBuffer.storage);
    var dataF = new Float32Array(mesh.vertexBuffer.storage);
    var offsetPF = offsetP / 4;
    var offsetWF = offsetW / 4;
    var offsetUv2F = offsetUv2 / 4;
    var localPos = new pc.Vec3();
    var lx, ly, lz, weight;
    var u, v, x, y, z;
    var pixelX, pixelY, pixelIndex;
    var vertSizeF = vertSize / 4;
    for(j=0; j<numVerts; j++) {
        u = dataF[j * vertSizeF + offsetUv2F];
        v = dataF[j * vertSizeF + offsetUv2F + 1];
        if (u > 0.0 && u < 1.0 && v > 0.0 && v < 1.0) {
            
            x = 0; y = 0; z = 0;
            
            pixelX = Math.floor(u * width);
            pixelY = Math.floor(v * height);
            pixelIndex = pixelY * width + pixelX;
            
            for(k=0; k<4; k++) {
                weight = dataF[j * vertSizeF + offsetWF + k];
                if (weight > 0) {
                    index = data8[j * vertSize + offsetI + k];
                    // Vertex j is affected by bone index
                    lx = dataF[j * vertSizeF + offsetPF];
                    ly = dataF[j * vertSizeF + offsetPF + 1];
                    lz = dataF[j * vertSizeF + offsetPF + 2];
                    localPos.set(lx, ly, lz);
                    instance._skinInstance.matrices[index].transformPoint(localPos, localPos);
                    x += localPos.x * weight;
                    y += localPos.y * weight;
                    z += localPos.z * weight;
                    
                    pixelsBI[pixelIndex*4 + k] = index;
                    pixelsBW[pixelIndex*4 + k] = weight;
                    
                    pixelsL[pixelIndex*4] = lx;
                    pixelsL[pixelIndex*4+1] = ly;
                    pixelsL[pixelIndex*4+2] = lz;
                }
            }
            
            /*x = dataF[j * vertSizeF + offsetPF];
            y = dataF[j * vertSizeF + offsetPF + 1];
            z = dataF[j * vertSizeF + offsetPF + 2];*/
            pixels[pixelIndex*4] = x;
            pixels[pixelIndex*4+1] = y;
            pixels[pixelIndex*4+2] = z;
            
        }
    }
    texPos.unlock();
    texBoneIndex.unlock();
    texBoneWeight.unlock();
    texPosLocal.unlock();
    
    this.constantSource = device.scope.resolve("source");
    this.constantDeltaTime = device.scope.resolve("deltaTime");
    this.forceShader = chunks.createShaderFromCode(device, chunks.fullscreenQuadVS, app.assets.find("clothForcePS").resource, "clothForce");
    this.constraintShader = chunks.createShaderFromCode(device, chunks.fullscreenQuadVS, app.assets.find("clothConstraintPS").resource, "clothConstraint");
    this.lengthShader = chunks.createShaderFromCode(device, chunks.fullscreenQuadVS, app.assets.find("clothLengthPS").resource, "clothLength");
    this.outputShader = chunks.createShaderFromCode(device, chunks.fullscreenQuadVS, chunks.fullscreenQuadPS, "fsQuadSimple");
    this.normalShader = chunks.createShaderFromCode(device, chunks.fullscreenQuadVS, app.assets.find("clothNormalPS").resource, "clothNormal");
    //this.blurShader = chunks.createShaderFromCode(device, chunks.fullscreenQuadVS, app.assets.find("clothBlurPS").resource, "clothBlur");
    
    
    var texLen = new pc.Texture(device, {
        width: width,
        height: height,
        format: pc.PIXELFORMAT_RGBA32F,
        autoMipmap: false
    });
    texLen.addressU = pc.ADDRESS_CLAMP_TO_EDGE;
    texLen.addressV = pc.ADDRESS_CLAMP_TO_EDGE;
    texLen.magFilter = pc.FILTER_NEAREST;
    texLen.minFilter = pc.FILTER_NEAREST;
    this.rtLen = new pc.RenderTarget(device, texLen, {
        depth: false
    });
    this.constantSource.setValue(this.rtPos.colorBuffer);
    pc.drawQuadWithShader(device, this.rtLen, this.lengthShader);
    device.scope.resolve("clothLength").setValue(this.rtLen.colorBuffer);
    
    //device.scope.resolve("noiseTex").setValue(app.assets.find("tex16vflip.png").resource);
    device.scope.resolve("curlTex").setValue(app.assets.find("curl.png").resource);
    
    this.boneL0 = app.root.findByName("Bip01 L Thigh");
    this.boneL1 = app.root.findByName("Bip01 L Calf");
    this.boneL2 = app.root.findByName("Bip01 L Foot");
    
    this.boneR0 = app.root.findByName("Bip01 R Thigh");
    this.boneR1 = app.root.findByName("Bip01 R Calf");
    this.boneR2 = app.root.findByName("Bip01 R Foot");
    
    this.debugSphere0 = new pc.GraphNode();//app.root.findByName("DebugSphere0");
    this.debugSphere1 = new pc.GraphNode();//app.root.findByName("DebugSphere1");
    this.debugSphere2 = new pc.GraphNode();//app.root.findByName("DebugSphere2");
    this.debugSphere3 = new pc.GraphNode();//app.root.findByName("DebugSphere3");
    this.debugSphere4 = new pc.GraphNode();//app.root.findByName("DebugSphere4");
    this.debugSphere5 = new pc.GraphNode();//app.root.findByName("DebugSphere5");
    this.debugSphere6 = new pc.GraphNode();//app.root.findByName("DebugSphere6");
    
    var r = 0.2;
    var r2 = 0.2;
    var kr = 0.2;
    this.debugSphere0.setLocalScale(r, r2, 0.6);
    this.debugSphere1.setLocalScale(r, r2+0.0, 0.6);
    this.debugSphere2.setLocalScale(r, r2, 0.6);
    this.debugSphere3.setLocalScale(r, r2+0.0, 0.6);
    this.debugSphere4.setLocalScale(kr,kr,kr);
    this.debugSphere5.setLocalScale(kr,kr,kr);
    this.debugSphere6.setLocalScale(0.25, 0.5, 0.25);
    
    this.constantLegL0 = device.scope.resolve("legL0");
    this.constantLegL1 = device.scope.resolve("legL1");
    this.constantLegR0 = device.scope.resolve("legR0");
    this.constantLegR1 = device.scope.resolve("legR1");
    this.constantKneeL = device.scope.resolve("kneeL");
    this.constantKneeR = device.scope.resolve("kneeR");
    this.constantLegC = device.scope.resolve("legC");
    
    /*this.constantPLegL0 = device.scope.resolve("plegL0");
    this.constantPLegL1 = device.scope.resolve("plegL1");
    this.constantPLegR0 = device.scope.resolve("plegR0");
    this.constantPLegR1 = device.scope.resolve("plegR1");
    
    this.plegL0 = new pc.Mat4();
    this.plegL1 = new pc.Mat4();
    this.plegR0 = new pc.Mat4();
    this.plegR1 = new pc.Mat4();*/
    
    
    this.debugSphere0.setPosition(this.boneL0.getPosition().add(this.boneL1.getPosition()).scale(0.5));
    this.debugSphere1.setPosition(this.boneL1.getPosition().add(this.boneL2.getPosition()).scale(0.5));
    this.debugSphere2.setPosition(this.boneR0.getPosition().add(this.boneR1.getPosition()).scale(0.5));
    this.debugSphere3.setPosition(this.boneR1.getPosition().add(this.boneR2.getPosition()).scale(0.5));

    this.debugSphere0.lookAt(this.boneL1.getPosition());
    this.debugSphere1.lookAt(this.boneL2.getPosition());
    this.debugSphere2.lookAt(this.boneR1.getPosition());
    this.debugSphere3.lookAt(this.boneR2.getPosition());
    var legL0 = this.debugSphere0.getWorldTransform().clone().invert();
    var legL1 = this.debugSphere1.getWorldTransform().clone().invert();
    var legR0 = this.debugSphere2.getWorldTransform().clone().invert();
    var legR1 = this.debugSphere3.getWorldTransform().clone().invert();
    /*this.plegL0.copy(legL0);
    this.plegL1.copy(legL1);
    this.plegR0.copy(legR0);
    this.plegR1.copy(legR1);*/
    
    this.constantLegL0t = device.scope.resolve("legL0t");
    this.constantLegL1t = device.scope.resolve("legL1t");
    this.constantLegR0t = device.scope.resolve("legR0t");
    this.constantLegR1t = device.scope.resolve("legR1t");
    this.constantKneeLt = device.scope.resolve("kneeLt");
    this.constantKneeRt = device.scope.resolve("kneeRt");
    this.constantLegCt = device.scope.resolve("legCt");
    
    this.charRight = device.scope.resolve("charRight");
    
    this.prevSkinOffset = new pc.Vec3();
    
    /*var drawCalls = app.scene.drawCalls;
    var xformUv1 = app.assets.find("transformClothUv1VS").resource;
    var cam = app.root.findByName("Camera").camera.camera;
    var origRt = cam._renderTarget;
    var origClear = cam._clearOptions;
    
    app.scene.drawCalls = [ instance ];
    mat.chunks.transformSkinnedVS = xformUv1;
    mat.chunks.endPS = app.assets.find("worldPosEndPS").resource;
    mat.update();
    cam.frustumCulling = false;
    cam._renderTarget = this.rtPos;
    cam._clearOptions = {
            color: [0,0,0,0],
            depth: 1.0,
            stencil: 0,
            flags: pc.CLEARFLAG_COLOR
        };
    
    app.renderer.render(app.scene, cam);
    
    app.scene.drawCalls = drawCalls;
    mat.chunks.transformSkinnedVS = skinCloth;
    mat.chunks.endPS = null;
    mat.update();
    cam.frustumCulling = true;
    cam._renderTarget = origRt;
    cam._clearOptions = origClear;*/
    
    //mat.chunks.basePS = chunks.basePS + "uniform sampler2D clothWorldPos;\n";
    //mat.chunks.endPS = app.assets.find("debugWorldPosTexEndPS").resource;
    
    //mat.customFragmentShader = app.assets.find("debugWorldPosTexPS").resource;
    mat.update();
    
    //var mat2 = app.root.findByName("debug").model.model.meshInstances[0].material;
    //mat2.customFragmentShader = app.assets.find("debugQuadPS").resource;
    //mat2.update();
    
    this.legL0 = new pc.Mat4();
    this.legL1 = new pc.Mat4();
    this.legR0 = new pc.Mat4();
    this.legR1 = new pc.Mat4();
    this.kneeL = new pc.Mat4();
    this.kneeR = new pc.Mat4();
    this.legC = new pc.Mat4();
    
    this.mat = mat;
    this.instance = instance;
    this.skinCloth = skinCloth;
    
    this.state = true;
    this.waitTime = pc.now() + 200;
};

// update code called every frame
Cloth.prototype.postUpdate = function(dt) {

    if (!this.entity.model.model) return;
    if (!this.mat) {
        this._initialize();
    }
    
    this.debugSphere0.setPosition(this.boneL0.getPosition().add(this.boneL1.getPosition()).scale(0.5));
    this.debugSphere1.setPosition(this.boneL1.getPosition().add(this.boneL2.getPosition()).scale(0.5));
    this.debugSphere2.setPosition(this.boneR0.getPosition().add(this.boneR1.getPosition()).scale(0.5));
    this.debugSphere3.setPosition(this.boneR1.getPosition().add(this.boneR2.getPosition()).scale(0.5));
    //this.debugSphere4.setPosition(this.boneL1.getPosition());
    //this.debugSphere5.setPosition(this.boneR1.getPosition());
    this.debugSphere6.setPosition(this.boneL1.getPosition().add(this.boneR1.getPosition()).scale(0.5));
    
    this.debugSphere0.lookAt(this.boneL1.getPosition());
    this.debugSphere1.lookAt(this.boneL2.getPosition());
    this.debugSphere2.lookAt(this.boneR1.getPosition());
    this.debugSphere3.lookAt(this.boneR2.getPosition());
    
    var mat0 = this.debugSphere0.getWorldTransform();
    var mat1 = this.debugSphere1.getWorldTransform();
    var mat2 = this.debugSphere2.getWorldTransform();
    var mat3 = this.debugSphere3.getWorldTransform();
    //var mat4 = this.debugSphere4.getWorldTransform();
    //var mat5 = this.debugSphere5.getWorldTransform();
    var mat6 = this.debugSphere6.getWorldTransform();
    
    this.constantLegL0t.setValue(mat0.data);
    this.constantLegL1t.setValue(mat1.data);
    this.constantLegR0t.setValue(mat2.data);
    this.constantLegR1t.setValue(mat3.data);
    //this.constantKneeLt.setValue(mat4.data);
    //this.constantKneeRt.setValue(mat5.data);
    this.constantLegCt.setValue(mat6.data);
    
    var legL0 = this.legL0.copy(mat0).invert();// this.debugSphere0.getWorldTransform().clone().invert();
    var legL1 = this.legL1.copy(mat0).invert();//this.debugSphere1.getWorldTransform().clone().invert();
    var legR0 = this.legR0.copy(mat0).invert();//this.debugSphere2.getWorldTransform().clone().invert();
    var legR1 = this.legR1.copy(mat0).invert();//this.debugSphere3.getWorldTransform().clone().invert();
    //var kneeL = this.debugSphere4.getWorldTransform().clone().invert();
    //var kneeR = this.debugSphere5.getWorldTransform().clone().invert();
    var legC = this.legC.copy(mat0).invert();//this.debugSphere6.getWorldTransform().clone().invert();
    
    this.constantLegL0.setValue(legL0.data);
    this.constantLegL1.setValue(legL1.data);
    this.constantLegR0.setValue(legR0.data);
    this.constantLegR1.setValue(legR1.data);
    //this.constantKneeL.setValue(kneeL.data);
    //this.constantKneeR.setValue(kneeR.data);
    this.constantLegC.setValue(legC.data);
    
    /*this.constantPLegL0.setValue(this.plegL0.data);
    this.constantPLegL1.setValue(this.plegL1.data);
    this.constantPLegR0.setValue(this.plegR0.data);
    this.constantPLegR1.setValue(this.plegR1.data);*/
       
    if (pc.now() < this.waitTime) return;
    
    var app = this.app;
    var device = app.graphicsDevice;
    
    this.charRight.setValue(this.entity.right.data);
    
    this.constantDeltaTime.setValue(1.0/60.0);//dt);
    
    this.instance._skinInstance.updateMatrices();
    this.instance._skinInstance.updateMatrixPalette();
    this.constantClothSkinMatrices.setValue(this.instance._skinInstance.boneTexture);
    this.constantClothSkinPoseMapSize.setValue([this.instance._skinInstance.boneTexture.width, this.instance._skinInstance.boneTexture.height]);
    
    var skinPos = this.instance._skinInstance.rootNode.getPosition();
    this.constantSkinOffset.setValue(skinPos.data);
    this.constantSkinOffsetPrev.setValue(this.prevSkinOffset.data);
    
    this.constantSource.setValue(this.rtPos.colorBuffer);
    pc.drawQuadWithShader(device, this.rtPrevPos, this.outputShader);
    
    this.constantClothWorldPos.setValue(this.state? this.rtPos.colorBuffer : this.rtPos2.colorBuffer);
    pc.drawQuadWithShader(device, this.state? this.rtPos2 : this.rtPos, this.forceShader);
    this.constantClothWorldPos.setValue(this.state? this.rtPos2.colorBuffer : this.rtPos.colorBuffer);
    this.state = !this.state;
    
    this.constantClothWorldPos.setValue(this.state? this.rtPos.colorBuffer : this.rtPos2.colorBuffer);
    pc.drawQuadWithShader(device, this.state? this.rtPos2 : this.rtPos, this.constraintShader);
    this.constantClothWorldPos.setValue(this.state? this.rtPos2.colorBuffer : this.rtPos.colorBuffer);
    this.state = !this.state;
    
    
    for(var i=0; i<8; i++) {
    this.constantClothWorldPos.setValue(this.state? this.rtPos.colorBuffer : this.rtPos2.colorBuffer);
    pc.drawQuadWithShader(device, this.state? this.rtPos2 : this.rtPos, this.constraintShader);
    this.constantClothWorldPos.setValue(this.state? this.rtPos2.colorBuffer : this.rtPos.colorBuffer);
    this.state = !this.state;
    
    this.constantClothWorldPos.setValue(this.state? this.rtPos.colorBuffer : this.rtPos2.colorBuffer);
    pc.drawQuadWithShader(device, this.state? this.rtPos2 : this.rtPos, this.constraintShader);
    this.constantClothWorldPos.setValue(this.state? this.rtPos2.colorBuffer : this.rtPos.colorBuffer);
    this.state = !this.state;
    }
    
    pc.drawQuadWithShader(device, this.rtNormal, this.normalShader);
    
    /*this.plegL0.copy(legL0);
    this.plegL1.copy(legL1);
    this.plegR0.copy(legR0);
    this.plegR1.copy(legR1);*/
    
    this.prevSkinOffset.copy(skinPos);
    
    this.waitTime = pc.now() + (1.0 / 60.0) * 1000.0;
    
};

// swap method called for script hot-reloading
// inherit your script state here
// Cloth.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/