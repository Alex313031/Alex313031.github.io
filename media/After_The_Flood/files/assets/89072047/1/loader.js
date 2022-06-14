var Loader = pc.createScript('loader');

Loader.prototype.loadAssets = function(assets, objects, onFinish) {
    var app = this.app;
    var loaded = 0;
    var onLoad = function() {
        if (++loaded === assets.length) {
            // all loaded
            for(var j = 0; j < objects.length; j++) {
                objects[j].enabled = true;
            }
            onFinish();
        }
    };
    for(var i = 0; i < assets.length; i++) {
         if (assets[i].resource) {
              onLoad();
         } else {
              assets[i].once('load', onLoad);
              app.assets.load(assets[i]);
         }
    }
};

function onFinishExp2() {
    
}

// initialize code called once per entity
Loader.prototype.initialize = function() {
    
    var app = this.app;
    
    var tagExp2 = "load-exp2";
    var assetsExp2 = app.assets.findByTag(tagExp2);
    var objectsExp2 = app.root.findByTag(tagExp2);
    this.loadAssets(assetsExp2, objectsExp2, onFinishExp2);
    
    var tagP = "load-phone";
    var assetsP = app.assets.findByTag(tagP);
    var objectsP = app.root.findByTag(tagP);
    //this.loadAssets(assetsP, objectsP, onFinishExp2);
};

// update code called every frame
Loader.prototype.update = function(dt) {
    
};

// swap method called for script hot-reloading
// inherit your script state here
// Loader.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/