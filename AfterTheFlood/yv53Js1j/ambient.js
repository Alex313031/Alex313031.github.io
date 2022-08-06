var Ambient = pc.createScript('ambient');

Ambient.attributes.add('music', { type: 'asset', assetType: 'audio' });

// initialize code called once per entity
Ambient.prototype.initialize = function() {
    
    var asset = this.music;
    if (!asset) {
        console.log("Can't find music!");
        return;
    }
    var url = asset.getFileUrl();
    
    var audio = document.createElement("AUDIO");
    if (!audio.canPlayType("audio/mpeg")) {
        console.log("Can't play mp3!");
        return;
    }
    
    audio.oncanplay = function() {
        audio.play();
    };
    audio.setAttribute("src", url);
    audio.loop = true;
    audio.autoplay = true;
    //audio.play();
    this.audio = audio;
    
    this.fadeInMode = false;
    
    pc.demoAmbient = this;
};

// update code called every frame
Ambient.prototype.update = function(dt) {
    
    var volume;
    
    if (this.fadeInMode) {
        volume = this.audio.volume;
        volume += dt / 3.0;
        if (volume < 1) {
            this.audio.volume = volume;
        } else {
            this.audio.volume = volume = 1.0;
            this.fadeInMode = false;
        }
        return;
    }
    
    if (pc.charController.cinematic) return;
    
    var cam = this.app.scene._activeCamera;
    if (!cam) return;
    
    var minZ = 9;
    var maxZ = 44;
    
    var pos = cam._node.getPosition();
    
    volume = pc.math.lerp(1, 0.125, (pos.z - minZ) / (maxZ - minZ));
    
    this.audio.volume = volume;
};

// swap method called for script hot-reloading
// inherit your script state here
// Ambient.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/