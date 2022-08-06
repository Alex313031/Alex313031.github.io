window.mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

pc.script.createLoadingScreen(function (app) {
    var showSplash = function () {
        var noWebgl = !! document.body.querySelector('table tr > td > div > div > a[href="http://get.webgl.org"]');
        
        // splash wrapper
        var wrapper = document.createElement('div');
        wrapper.id = 'application-splash-wrapper';
        document.body.appendChild(wrapper);

        // splash
        var splash = document.createElement('div');
        splash.id = 'application-splash';
        wrapper.appendChild(splash);
        
        var logo = document.createElement('div');
        logo.classList.add('logo');
        splash.appendChild(logo);
        
//         var logoAfter = document.createElement('div');
//         logoAfter.textContent = 'after';
//         logoAfter.classList.add('after');
//         logo.appendChild(logoAfter);
        
//         var logoThe = document.createElement('div');
//         logoThe.textContent = 'the';
//         logoThe.classList.add('the');
//         logo.appendChild(logoThe);
        
//         var logoFlood = document.createElement('div');
//         logoFlood.textContent = 'flood';
//         logoFlood.classList.add('flood');
//         logo.appendChild(logoFlood);

        var container = document.createElement('div');
        container.id = 'progress-bar-container';
        splash.appendChild(container);

        var bar = document.createElement('div');
        bar.id = 'progress-bar';
        container.appendChild(bar);

        var status = document.createElement('div');
        status.id = 'progress-status';
        status.textContent = 'fetching assets';
        container.appendChild(status);
        
        if (noWebgl || window.mobile) {
            status.classList.add('noWebgl');
            logo.style.visibility = 'hidden';
            
            var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
            var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
            
            if (window.mobile) {
                status.innerHTML = 'This demo is currently desktop only, mobile support is coming soon. For now, use a Desktop Browser with WebGL 2.0 support, e.g. <a href="https://www.mozilla.org/en-GB/firefox/new/" target="_blank" style="color:#f50;">Mozilla Firefox</a>.';
                throw new Error('no mobile support yet');
            } else if (isFirefox) {
                status.innerHTML = 'This demo requires WebGL 2.0 support. Please update to the latest version of Mozilla Firefox.';
            } else if (isChrome) {
                status.innerHTML = 'Using Chrome? To enable WebGL 2.0, go to <b>chrome://flags</b>, set the WebGL 2.0 option to Enabled and restart your browser.';
            } else {
                status.innerHTML = 'Please use a browser with WebGL 2.0 support such as <a href="https://www.mozilla.org/en-GB/firefox/new/" target="_blank" style="color:#f50;">Mozilla Firefox</a>.';
            }
        }
    };

    var hideSplash = function () {
        var splash = document.getElementById('application-splash-wrapper');
//         splash.parentElement.removeChild(splash);
        splash.style.display = 'none';
    };

    var setProgress = function (value) {
        var bar = document.getElementById('progress-bar');
        if(bar) {
            value = Math.min(1, Math.max(0, value));
            bar.style.width = value * 100 + '%';
        }
    };

    var createCss = function () {
        var css = function() {/*
html {
    background-color: #000;
}
body {
    background-color: #000;
    font-family: heebolight, sans-serif;
}

#application-splash-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: 100;
    background-color: #000;
}

#application-splash {
    position: absolute;
    top: calc(50% - 182px);
    left: calc(50% - 384px);
    width: 768px;
    height: 176px;
}

#application-splash > .logo {
    position: absolute;
    left: 119px;
    width: 557px;
    height: 107px;
    background-size: 557px 107px;
    background-repeat: no-repeat;
}

#progress-bar-container {
    margin: 155px auto 0 auto;
    height: 2px;
    width: 100%;
    background-color: #333;
}

#progress-bar {
    width: 0%;
    height: 100%;
    background-color: #f50;
}

#progress-status {
    margin: 8px 0 0;
    line-height: 16px;
    text-align: center;
    font-size: 12px;
    font-family: "Lucida Console", Monaco, monospace;
    color: rgba(255, 255, 255, .5);
}

#progress-status.noWebgl {
    max-width: 100%;
    color: #f50;
    font-size: 12px;
    line-height: normal;
}
@media all and (max-width: 768px) {
    #application-splash {
        top: 16px;
        left: 8px;
        width: calc(100% - 16px);
    }
}
        */};
        css = css.toString().trim();
        css = css.slice(css.indexOf('/*') + 2).slice(0, -3);
        
        var style = document.createElement('style');
        style.type = 'text/css';
        if (style.styleSheet) {
          style.styleSheet.cssText = css;
        } else {
          style.appendChild(document.createTextNode(css));
        }

        document.head.appendChild(style);
    };

    createCss();

    showSplash();
    
    app.startOld = app.start;
    app.start = function() {
        return app.startOld();
        
        var shaderCacheAsset = app.assets.findByTag('shader-cache')[0];
        if (! shaderCacheAsset)
            return app.startOld();
        
        var device = app.graphicsDevice;
        var cache = device.programLib._cache;
        
        var shaders = shaderCacheAsset.resource.split('^SH^');
        var shadersTotal = shaders.length;
        var shadersCompiled = 0;
        
        var compileBudget = 50;
        var compileStart = Date.now();
        
        var compileQueue = function() {
            compileStart = Date.now();
            compileNext();
        };
        
        var compileNext = function() {
            if (shaders.length === 0) {
                var status = document.getElementById('progress-status');
                if (status) status.textContent = 'initializing';
                
                return requestAnimationFrame(function() {
                    app.startOld();
                });
            }
            
            var str = shaders.shift();
            
            if (! str) return compileNext();
            
            var vsStart = str.indexOf("^VS^");
            var psStart = str.indexOf("^PS^");
            var atStart = str.indexOf("^AT^");
            
            var entry = str.substring(0, vsStart);
            if (cache[entry]) return compileNext();
            
            var vsCode = str.substring(vsStart + 4, psStart);
            var psCode = str.substring(psStart + 4, atStart);
            var attribsString = str.substring(atStart + 4, str.length);
            
            var a1 = attribsString.split(",");
            var attribs = { };
            for(var j = 0; j < a1.length - 1; j += 2)
                attribs[a1[j]] = a1[j + 1];
            
            var def = {
                vshader: vsCode,
                fshader: psCode,
                attributes: attribs
            };
            
            cache[entry] = new pc.Shader(device, def);
            device.setShader(cache[entry]);
            shadersCompiled++;
            
            if ((Date.now() - compileStart) < compileBudget) {
                compileNext();
            } else {
                var status = document.getElementById('progress-status');
                if (status) status.textContent = shadersCompiled + ' / ' + shadersTotal + ' shaders compiled';
                
                setProgress(shadersCompiled / shadersTotal + 1.0);
                requestAnimationFrame(compileQueue);
            }
        };
        
        var status = document.getElementById('progress-status');
        if (status) status.textContent = shadersCompiled + ' / ' + shadersTotal + ' shaders compiled';
        requestAnimationFrame(compileQueue);
    };
    
    app.on('preload:start', function() {
        var css = function() {/*
@font-face {
    font-family: 'heebothin';
    src: url('{asset[font-thin]}') format('woff');
    font-weight: normal;
    font-style: normal;
}

@font-face {
    font-family: 'heebolight';
    src: url('{asset[font-light]}') format('woff');
    font-weight: normal;
    font-style: normal;
}
        */};
        css = css.toString().trim();
        css = css.slice(css.indexOf('/*') + 2).slice(0, -3);
        
        var fontThin = app.assets.findByTag('font-thin')[0];
        if (fontThin) css = css.replace('{asset[font-thin]}', fontThin.getFileUrl());
        
        var fontLight = app.assets.findByTag('font-light')[0];
        if (fontLight) css = css.replace('{asset[font-light]}', fontLight.getFileUrl());

        var style = document.createElement('style');
        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }

        document.head.appendChild(style);
        
        var logo = document.querySelector('#application-splash > .logo');
        if (logo) {
            var logoAsset = app.assets.findByTag('img-logo')[0];
            if (logoAsset) {
                logo.style.backgroundImage = 'url("' + logoAsset.getFileUrl() + '")';
            }
        }
        
        var loaded = 0;
        var total = 0;
        
        var onLoad = function() {
            loaded++;
            
            var status = document.getElementById('progress-status');
            
            if (! status)
                return;
            
            status.textContent = loaded + ' / ' + total + ' assets loaded';
            
            if ((loaded / total) > 0.95)
                status.textContent = 'compiling shaders';
        };
        
        for(var i = 0; i < app.assets._assets.length; i++) {
            var asset = app.assets._assets[i];
            
            if (! asset.preload)
                continue;
            
            total++;
            
            if (asset.resource) {
                onLoad();
            } else {
                asset.once('load', onLoad);
            }
        }
        
        document.getElementById('progress-status').textContent = loaded + ' / ' + total;
    });
    
    app.on('preload:end', function () {
        app.off('preload:progress');
    });
    app.on('preload:progress', setProgress);
    app.on('start', hideSplash);
    
//     var shaders = [ ];
    
//     var shaderCompileStart = [ ];
//     var shaderCompileTiming = [ ];
//     var shaderCompileTotal = 0;
    
//     var shadersLink = [ ];
    
//     var shaderLinkStart = [ ];
//     var shaderLinkTiming = window.shadersLinked = [ ];
//     var shaderLinkTotal = 0;
    
//     app.graphicsDevice.on('shader:compile:start', function(evt) {
//         shaders.push(evt.target);
//         shaderCompileStart[shaders.length - 1] = evt.timestamp;
//     });
    
//     app.graphicsDevice.on('shader:compile:end', function(evt) {
//         var ind = shaders.indexOf(evt.target);
//         var total = evt.timestamp - shaderCompileStart[ind];
        
//         shaderCompileTiming.push({
//             shader: evt.target,
//             time: total
//         });
        
//         shaderCompileTotal += total;
        
// //         console.log('compile', evt.timestamp - shaderCompileStart[ind], shaderCompileTotal);
//     });
    
//     app.graphicsDevice.on('shader:link:start', function(evt) {
//         shadersLink.push(evt.target);
//         shaderLinkStart[shadersLink.length - 1] = evt.timestamp;
//     });
    
//     app.graphicsDevice.on('shader:link:end', function(evt) {
//         var ind = shadersLink.indexOf(evt.target);
//         var total = evt.timestamp - shaderLinkStart[ind];
        
//         shaderLinkTiming.push({
//             shader: evt.target,
//             time: total
//         });
        
//         shaderLinkTotal += total;
        
// //         console.log('link', total, shaderLinkTotal);
//     });
});