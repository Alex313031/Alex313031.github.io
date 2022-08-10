var ControlsHandler = function () {

    var t = 0;

    var mainParams = {
        time: 0.0001,
        auto: false,
        fullscreen: function () {
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            Main.toggleControls()
        },
        generate_one: function () {
            Asteroid.generate(0,0)
        },
        generate_grid: function () {
            Asteroid.generate(8,8)
        }
    }

    var audioParams = {
        useMic: false,
        useSample: false,
        showDebug: true,
        volSens: 1,//1,
        beatHoldTime: 40,
        beatDecayRate: 0.97,
        bpmMode: false,
        bpmRate: 0
    };

    var fxParams = {
        song: 0,
        effects: true,
        nuts: false,
        tilt: true,
        tv: false,
        kaleidoscope: -1,
        kaleidoscopeJump: false,
        rgb: true,
        wireframe: false,
        dots: false,
        person: false,
        ssao:true,
        ssaoOnly:false,
        heart: true,
        items: true,
        black: true,
        animSpeed: 1.0,
        colorProgress: 0.0,
        spreadProgress: 0.0,
        waterProgress: 0.3,
        bgProgress: 0.0,
        glow: 0.3
    };

    var vizParams = {
        fullSize: true,
        showControls: false,
        fakeKinect: false,
        // useBars: false,
        // useGoldShapes: true,
        // useNebula:true,
        // useNeonShapes:true,
        // useStripes:true,
        // useTunnel:true,
        // useWaveform:true,
    };

    function init() {
        return;

        events.on("update", update);

        //Init DAT GUI control panel
        gui = new dat.GUI({autoPlace: false});
        $('#settings').append(gui.domElement);

        gui.add(mainParams, 'time', 0, 1).step(0.001).listen();//.onChange(autoChange);
        gui.add(mainParams, 'auto').listen();
        gui.add(mainParams, 'generate_one');
        gui.add(mainParams, 'generate_grid');
        gui.add(mainParams, 'fullscreen');

        var f2 = gui.addFolder('Audio');
        //f2.add(audioParams, 'useSample').listen().onChange(AudioHandler.onUseSample);
        f2.add(audioParams, 'volSens', 0, 10).step(0.1);
        //f2.add(audioParams, 'beatHoldTime', 0, 100).step(1);
        //f2.add(audioParams, 'beatDecayRate', 0.9, 1).step(0.01);
        // f2.add(audioParams, 'bpmMode').listen();
        // f2.add(audioParams, 'bpmRate', 0, 4).step(1).listen().onChange(AudioHandler.onChangeBPMRate);
        f2.open();

        //var f5 = gui.addFolder('Viz');
        //f5.add(fxParams, 'Full', 0, 4).listen().onChange(AudioHandler.onUseMic);
        var f5 = gui.addFolder('FX');
        f5.add(fxParams, 'glow', 0, 4).step(0.1).listen()//.onChange(manualChange);;
        //f5.add(fxParams, 'animSpeed', -10, 10).step(0.1).listen()//.onChange(manualChange);;
        //f5.add(fxParams, 'colorProgress', 0, 1).step(0.01).listen()//.onChange(manualChange);;
        //f5.add(fxParams, 'spreadProgress', 0, 1).step(0.01).listen()//.onChange(manualChange);;
        //f5.add(fxParams, 'waterProgress', 0, 1).step(0.01).listen()//.onChange(manualChange);;
        //f5.add(fxParams, 'bgProgress', 0, 1).step(0.01).listen()//.onChange(manualChange);;
        //f5.add(fxParams, 'effects').listen().onChange(FXHandler.toggle);
        f5.add(fxParams, 'ssao').listen().onChange(manualChange);
        f5.add(fxParams, 'ssaoOnly').listen().onChange(manualChange);
        f5.add(fxParams, 'kaleidoscopeJump').listen().onChange(manualChange);
        f5.add(fxParams, 'kaleidoscope', -1, 4).step(1).listen().onChange(manualChange);
        f5.add(fxParams, 'nuts').listen().onChange(manualChange);
        f5.add(fxParams, 'tilt').listen().onChange(manualChange);
        f5.add(fxParams, 'tv').listen().onChange(manualChange);
        f5.add(fxParams, 'rgb').listen().onChange(manualChange);
        //f5.add(fxParams, 'wireframe').listen()//.onChange(manualChange);
        f5.add(fxParams, 'dots').listen().onChange(manualChange);
        //f5.add(fxParams, 'person').listen().onChange(FXHandler.toggle);
        //f5.add(fxParams, 'heart').listen()//.onChange(manualChange);
        //f5.add(fxParams, 'items').listen()//.onChange(manualChange);
        //f5.add(fxParams, 'black').listen()//.onChange(manualChange);
        f5.open();




        // var f6 = gui.addFolder('Bloom');
        // for (var propertyName in bloomParams) {
        // 	f6.add(bloomParams,propertyName)
        // }

        AudioHandler.onUseMic();
        AudioHandler.onUseSample();
        AudioHandler.onShowDebug();

    }

    function show(trigger, percStart, percFinish, value) {
        var changedValue = true;
        if (typeof value === 'number') {
            changedValue = value
        }
        if (mainParams.time > percStart && mainParams.time <= percFinish) {
            fxParams[trigger] = changedValue;
        }
    }

    function autoChange() {
        mainParams.auto = true;
    }

    function manualChange() {
        mainParams.auto = false;
        FXHandler.toggle();
    }

    function update() {


        if (mainParams.auto) {
            mainParams.time += 1 / 3/*hours*/ / 60/*minutes*/ / 60/*seconds*/ / 60/*fps*/;//*60*4;
            if (mainParams.time > 1)
                mainParams.time = 1;
            if (mainParams.time < 0)
                mainParams.time = 0;
        }

        var clone = {};
        for (var attr in fxParams) {
            if (fxParams.hasOwnProperty(attr)) {
                clone[attr] = fxParams[attr];
            }
        }
        if (mainParams.auto) {
            for (var attr in fxParams) {
                if (fxParams.hasOwnProperty(attr)) {
                    if (fxParams[attr] === true)
                        fxParams[attr] = false;
                }
            }

            fxParams.waterProgress = Math.sin(3.5 + mainParams.time * 6) / 2 + .5
            fxParams.colorProgress = mainParams.time
            fxParams.spreadProgress = mainParams.time
            //fxParams.bgProgress=mainParams.time

            show('effects', 0, 1)


            show('black', 0.07, 0.25)
            show('bgProgress', 0.00, 0.50, 0)
            show('bgProgress', 0.50, 1.00, 1)

            show('kaleidoscope', 0.00, 0.09, -1)
            show('kaleidoscope', 0.13, 0.16, 0)
            show('kaleidoscope', 0.16, 0.19, 1)
            show('kaleidoscope', 0.19, 0.24, 4)

            show('heart', 0.00, 0.37)
            show('heart', 0.43, 1)
            show('black', 0.30, 0.40)
            show('spreadProgress', 0.30, 1, 1)

            show('kaleidoscope', 0.24, 0.30, -1)
            show('kaleidoscope', 0.30, 0.33, 0)
            show('kaleidoscope', 0.33, 0.36, 1)
            show('kaleidoscope', 0.36, 0.43, 2)

            show('items', 0.15, 1.00)

            show('animSpeed', 0.17, 0.20, -3)
            show('animSpeed', 0.20, 0.23, 4)
            show('animSpeed', 0.23, 0.30, -10)
            show('animSpeed', 0.53, 0.61, -3)
            show('animSpeed', 0.61, 0.67, 4)
            show('animSpeed', 0.67, 0.73, -6)
            show('animSpeed', 0.73, 0.81, 7)
            show('animSpeed', 0.81, 0.87, 0)
            show('animSpeed', 0.91, 1, -10)

            show('kaleidoscope', 0.40, 0.60, -1)
            show('kaleidoscope', 0.60, 0.65, 0)
            show('kaleidoscope', 0.65, 0.70, 1)
            show('kaleidoscope', 0.70, 0.75, 2)

            show('nuts', 0.43, 0.47)
            show('wireframe', 0.47, 0.57)
            show('nuts', 0.57, 1.00)

            show('rgb', 0.30, 0.40)
            show('rgb', 0.70, 1.00)

            show('tv', .65, 1)

            show('kaleidoscopeJump', .75, 1)

        }

        /*show('nuts',.5,1)
         show('tv',.5,1)
         show('wireframe',.16,.20)
         show('wireframe',.33,.38)
         show('dots',.9,1)
         show('black',.3,.7)*/

        var changed = false;

        for (var attr in fxParams) {
            if (clone[attr] != fxParams[attr] && (typeof fxParams[attr] === 'boolean') && attr !== "heart" && attr !== "wireframe" && attr !== "items" && attr !== "black" && attr !== "waterProgress" && attr !== "spreadProgress" && attr !== "bgProgress") {
                changed = true;
                console.log(attr, fxParams[attr])
            }
        }
        //if(changed)console.log(fxParams.nuts, changed)
        //if(changed)alert('hi')
        if (changed)
            FXHandler.toggle();

    }

    return {
        init: init,
        audioParams: audioParams,
        fxParams: fxParams,
        vizParams: vizParams
    };
}();