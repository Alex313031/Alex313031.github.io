var AudioHandler = function () {

    var waveData = []; //waveform - from 0 - 1 . no sound is 0.5. Array [binCount]
    var levelsData = []; //levels of each frequecy - from 0 - 1 . no sound is 0. Array [levelsCount]
    var volume = 0; // averaged normalized level from 0 - 1
    var bpmTime = 0; // bpmTime ranges from 0 to 1. 0 = on beat. Based on tap bpm
    var ratedBPMTime = 550;//time between beats (msec) multiplied by BPMRate
    var levelHistory = []; //last 256 ave norm levels
    var bpmStart; //FIXME

    var BEAT_HOLD_TIME = 40; //num of frames to hold a beat
    var BEAT_DECAY_RATE = 0.98;
    var BEAT_MIN = 0.15; //level less than this is no beat

    //BPM STUFF
    var count = 0;
    var msecsFirst = 0;
    var msecsPrevious = 0;
    var msecsAvg = 633; //time between beats (msec)

    var timer;
    var gotBeat = false;

    var debugCtx;
    var debugW = 250;
    var debugH = 200;
    var chartW = 220;
    var chartH = 200;
    var aveBarWidth = 30;
    var bpmHeight = debugH - chartH;
    var debugSpacing = 2;
    var gradient;

    var freqByteData; //bars - bar data is from 0 - 256 in 512 bins. no sound is 0;
    var timeByteData; //waveform - waveform data is from 0-256 for 512 bins. no sound is 128.
    var levelsCount = 16; //should be factor of 512

    var binCount; //512
    var levelBins;

    var isPlayingAudio = false;

    var beatCutOff = 0;
    var beatTime = 0;

    var source;
    var buffer;
    var audioBuffer;
    var dropArea;
    var audioContext;
    //var processor;
    var analyser;

    var high = 0;


    function init() {
        if(!ControlsHandler.audioParams.useMic && !ControlsHandler.audioParams.useSample)
            return;

        //EVENT HANDLERS
        events.on("update", update);

        //Get an Audio Context
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new window.AudioContext();
        } catch (e) {
            //Web Audio API is not supported in this browser
            alert("Sorry! This browser does not support the Web Audio API. Please use Chrome, Safari or Firefox.");
            return;
        }
        //audioContext = new window.webkitAudioContext();
        //processor = audioContext.createJavaScriptNode(2048 , 1 , 1 );

        analyser = audioContext.createAnalyser();
        analyser.smoothingTimeConstant = 0.3; //smooths out bar chart movement over time
        analyser.fftSize = 1024;
        analyser.connect(audioContext.destination);
        binCount = analyser.frequencyBinCount; // = 512


        levelBins = Math.floor(binCount / levelsCount); //number of bins in each level

        freqByteData = new Uint8Array(binCount);
        timeByteData = new Uint8Array(binCount);

        var length = 256;
        for (var i = 0; i < length; i++) {
            levelHistory.push(0);
        }

        //INIT DEBUG DRAW
        var canvas = document.getElementById("audioDebug");
        console.log(canvas)
        debugCtx = canvas.getContext('2d');
        console.log(debugCtx)
        debugCtx.width = debugW;
        debugCtx.height = debugH;
        debugCtx.fillStyle = "rgb(40, 40, 40)";
        debugCtx.lineWidth = 2;
        debugCtx.strokeStyle = "rgb(255, 255, 255)";
        $('#audioDebugCtx').hide();

        gradient = debugCtx.createLinearGradient(0, 0, 0, 256);
        gradient.addColorStop(1, '#fff');
        gradient.addColorStop(0, '#fff');

        //assume 120BPM
        msecsAvg = 640;
        timer = setInterval(onBMPBeat, msecsAvg);
    }

    function initSound() {
        source = audioContext.createBufferSource();
        source.connect(analyser);
    }

    //load sample MP3
    function loadSampleAudio() {

        stopSound();

        initSound();

        // Load asynchronously
        var request = new XMLHttpRequest();
        request.open("GET", ControlsHandler.audioParams.sampleURL, true);
        request.responseType = "arraybuffer";

        request.onload = function () {
            audioContext.decodeAudioData(request.response, function (buffer) {
                audioBuffer = buffer;
                startSound();
            }, function (e) {
                console.log(e);
            });
        };
        request.send();

    }

    function startSound() {
        source.buffer = audioBuffer;
        source.loop = true;
        source.start(0.0);
        isPlayingAudio = true;
        //startViz();
    }

    function stopSound() {
        if(!ControlsHandler.audioParams.useMic && !ControlsHandler.audioParams.useSample)
            return;
        isPlayingAudio = false;
        if (source) {
            source.stop(0);
            source.disconnect();
        }
        debugCtx.clearRect(0, 0, debugW, debugH);
    }

    function onUseMic() {

        if (ControlsHandler.audioParams.useMic) {
            ControlsHandler.audioParams.useSample = false;
            getMicInput();
        } else {
            stopSound();
        }
    }

    function onUseSample() {
        if (ControlsHandler.audioParams.useSample) {
            loadSampleAudio();
            ControlsHandler.audioParams.useMic = false;
        } else {
            stopSound();
        }
    }

    function onShowDebug() {
        if (ControlsHandler.audioParams.showDebug) {
            $('#audioDebug').show();
        } else {
            $('#audioDebug').hide();
        }
    }

    //load dropped MP3
    function onMP3Drop(evt) {

        ControlsHandler.audioParams.useSample = false;
        ControlsHandler.audioParams.useMic = false;

        stopSound();

        initSound();

        var droppedFiles = evt.dataTransfer.files;
        var reader = new FileReader();
        reader.onload = function (fileEvent) {
            var data = fileEvent.target.result;
            onDroppedMP3Loaded(data);
        };
        reader.readAsArrayBuffer(droppedFiles[0]);
    }

    function onDroppedMP3Loaded(data) {

        if (audioContext.decodeAudioData) {
            audioContext.decodeAudioData(data, function (buffer) {
                audioBuffer = buffer;
                startSound();
            }, function (e) {
                console.log(e);
            });
        } else {
            audioBuffer = audioContext.createBuffer(data, false);
            startSound();
        }
    }

    function getMicInput() {

        stopSound();

        //x-browser
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

        if (navigator.getUserMedia) {

            navigator.getUserMedia(
                    {audio: true},
                    function (stream) {

                        //reinit here or get an echo on the mic
                        source = audioContext.createBufferSource();
                        analyser = audioContext.createAnalyser();
                        analyser.fftSize = 1024;
                        analyser.smoothingTimeConstant = 0.3;

                        microphone = audioContext.createMediaStreamSource(stream);
                        microphone.connect(analyser);
                        isPlayingAudio = true;
                        // console.log("here");
                    },
                    // errorCallback
                            function (err) {
                                alert("The following error occured: " + err);
                            }
                    );

                } else {
            alert("Could not getUserMedia");
        }
    }

    function onBeat() {
        gotBeat = true;

        if (ControlsHandler.audioParams.bpmMode)
            return;

        events.emit("onBeat");
    }

    function onBMPBeat() {
        bpmStart = new Date().getTime();

        if (!ControlsHandler.audioParams.bpmMode)
            return;

        gotBeat = false;

    }

    function update() {

        if (!isPlayingAudio)
            return;

        //GET DATA
        analyser.getByteFrequencyData(freqByteData); //<-- bar chart
        analyser.getByteTimeDomainData(timeByteData); // <-- waveform

        //normalize waveform data
        for (var i = 0; i < binCount; i++) {
            waveData[i] = ((timeByteData[i] - 128) / 128) * ControlsHandler.audioParams.volSens;
        }
        //TODO - cap levels at 1 and -1 ?

        //normalize levelsData from freqByteData
        for (var i = 0; i < levelsCount; i++) {
            var sum = 0;
            for (var j = 0; j < levelBins; j++) {
                sum += freqByteData[(i * levelBins) + j];
            }
            levelsData[i] = sum / levelBins / 256 * ControlsHandler.audioParams.volSens; //freqData maxs at 256
        }
        //TODO - cap levels at 1?

        //GET AVG LEVEL
        var sum = 0;
        for (var j = 0; j < levelsCount; j++) {
            sum += levelsData[j];
        }

        volume = sum / levelsCount;

        // high = Math.max(high,level);
        levelHistory.push(volume);
        levelHistory.shift(1);

        //BEAT DETECTION
        if (volume > beatCutOff && volume > BEAT_MIN) {
            onBeat();
            beatCutOff = volume * 1.1;
            beatTime = 0;
        } else {
            if (beatTime <= ControlsHandler.audioParams.beatHoldTime) {
                beatTime++;
            } else {
                beatCutOff *= ControlsHandler.audioParams.beatDecayRate;
                beatCutOff = Math.max(beatCutOff, BEAT_MIN);
            }
        }


        bpmTime = (new Date().getTime() - bpmStart) / msecsAvg;
        //trace(bpmStart);

        if ($('#controls').css('display') != 'none')
            debugDraw();
    }



    function debugDraw() {

        debugCtx.clearRect(0, 0, debugW, debugH);
        //draw chart bkgnd
        debugCtx.fillStyle = "#000";
        debugCtx.fillRect(0, 0, debugW, debugH);

        //DRAW BAR CHART
        // Break the samples up into bars
        var barWidth = chartW / levelsCount;
        debugCtx.fillStyle = gradient;
        for (var i = 0; i < levelsCount; i++) {
            debugCtx.fillRect(i * barWidth, chartH, barWidth - debugSpacing, -levelsData[i] * chartH);
        }

        //DRAW AVE LEVEL + BEAT COLOR
        if (beatTime < 6) {
            debugCtx.fillStyle = "#e61d5f";
        }
        debugCtx.fillRect(chartW, chartH, aveBarWidth, -volume * chartH);

        //DRAW CUT OFF
        debugCtx.beginPath();
        debugCtx.moveTo(chartW, chartH - beatCutOff * chartH);
        debugCtx.lineTo(chartW + aveBarWidth, chartH - beatCutOff * chartH);
        debugCtx.stroke();

        /*//DRAW BPM
         var bpmMaxSize = bpmHeight;
         var size = bpmMaxSize - bpmTime * bpmMaxSize;
         debugCtx.fillStyle = "#222";
         debugCtx.fillRect(0, chartH, bpmMaxSize, bpmMaxSize);
         debugCtx.fillStyle = "#fff";
         debugCtx.fillRect((bpmMaxSize - size) / 2, chartH + (bpmMaxSize - size) / 2, size, size);*/
    }

    function onTap() {

        console.log("ontap");

        clearInterval(timer);

        timeSeconds = new Date();
        msecs = timeSeconds.getTime();

        //after 2 seconds, new tap counts as a new sequnce
        if ((msecs - msecsPrevious) > 2000) {
            count = 0;
        }

        if (count === 0) {
            console.log("First Beat");
            msecsFirst = msecs;
            count = 1;
        } else {
            bpmAvg = 60000 * count / (msecs - msecsFirst);
            msecsAvg = (msecs - msecsFirst) / count;
            count++;
            console.log("bpm: " + Math.round(bpmAvg * 100) / 100 + " , taps: " + count + " , msecs: " + msecsAvg);
            onBMPBeat();
            clearInterval(timer);
            timer = setInterval(onBMPBeat, msecsAvg);
        }
        msecsPrevious = msecs;
    }

    function onChangeBPMRate() {

        //change rate without losing current beat time

        //get ratedBPMTime from real bpm
        switch (ControlsHandler.audioParams.bpmRate)
        {
            case -3:
                ratedBPMTime = msecsAvg * 8;
                break;
            case -2:
                ratedBPMTime = msecsAvg * 4;
                break;
            case -1:
                ratedBPMTime = msecsAvg * 2;
                break;
            case 0:
                ratedBPMTime = msecsAvg;
                break;
            case 1:
                ratedBPMTime = msecsAvg / 2;
                break;
            case 2:
                ratedBPMTime = msecsAvg / 4;
                break;
            case 3:
                ratedBPMTime = msecsAvg / 8;
                break;
            case 4:
                ratedBPMTime = msecsAvg / 16;
                break;
        }

        //console.log("ratedBPMTime: " + ratedBPMTime);


        //get distance to next beat
        bpmTime = (new Date().getTime() - bpmStart) / msecsAvg;


        timeToNextBeat = ratedBPMTime - (new Date().getTime() - bpmStart);

        //set one-off timer for that
        clearInterval(timer);
        timer = setInterval(onFirstBPM, timeToNextBeat);


        //set timer for new beat rate


    }

    function onFirstBPM() {
        clearInterval(timer);
        timer = setInterval(onBMPBeat, ratedBPMTime);
    }

    // function toggleBPMMode(tog){
    //	console.log("PP");
    // }

    return {
        onMP3Drop: onMP3Drop,
        onShowDebug: onShowDebug,
        onUseMic: onUseMic,
        onUseSample: onUseSample,
        update: update,
        init: init,
        onTap: onTap,
        onChangeBPMRate: onChangeBPMRate,
        getLevelsData: function () {
            return levelsData;
        },
        getVolume: function () {
            return volume;
        },
        getBPMTime: function () {
            return bpmTime;
        },
    };

}();