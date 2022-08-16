var events = new Events();

var Main = function () {

    function init() {

        //INIT DOCUMENT
        document.onselectstart = function () {
            return false;
        };

        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('mousedown', onDocumentMouseDown, false);
        document.addEventListener('mouseup', onDocumentMouseUp, false);
        document.addEventListener('touchstart', onDocumentTouchStart, false);
        document.addEventListener('drop', onDocumentDrop, false);
        document.addEventListener('dragover', onDocumentDragOver, false);
        window.addEventListener('resize', onResize, false);
        //window.addEventListener('keydown', onKeyDown, false);
        //window.addEventListener('keyup', onKeyUp, false);

        //STATS
        //stats = new Stats();
        //document.body.appendChild(stats.domElement);
        /*stats = new Stats();
         $('#controls').append(stats.domElement);
         $("#viz").css({"position": "fixed", "top": "0"});
         stats.domElement.id = "stats";*/

        //INIT HANDLERS
        VizHandler.init();

        //FXHandler.init();

        onResize();
        update();



        preloaderProgress(1);

    }

    function update() {
        requestAnimationFrame(update);
        //stats.update();
        events.emit("update");
    }

    function onDocumentTouchStart(evt) {
        if (!VizHandler.isFullscreen())
            return;
        evt.stopPropagation();
        evt.preventDefault();
        return false;
    }

    function onDocumentDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        return false;
    }

    //load dropped MP3
    function onDocumentDrop(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        AudioHandler.onMP3Drop(evt);
    }

    function onKeyDown(event) {
        switch (event.keyCode) {
            case 32: /* space */
                AudioHandler.onTap();
                break;
            case 81: /* q */
                toggleControls();
                break;
        }
    }

    function onKeyUp(event) {
    }

    function onDocumentMouseDown(event) {
    }

    function onDocumentMouseUp(event) {
    }

    function onDocumentMouseMove(event) {
    }

    function onResize() {
        VizHandler.onResize();
        FXHandler.onResize();
    }

    function toggleControls() {
        /*ControlsHandler.vizParams.showControls = !ControlsHandler.vizParams.showControls;
         $('#controls').toggle();
         VizHandler.onResize();
         if (ControlsHandler.vizParams.showControls) {
         $('#wrap').show()
         } else {
         $('#wrap').hide()
         }*/
    }

    return {
        init: init,
        toggleControls: toggleControls
    };

}();
//document.addEventListener("DOMContentLoaded", function (event) {
//});
window.onload = function () {
    preloaderProgress(1)
    Main.init()
};

