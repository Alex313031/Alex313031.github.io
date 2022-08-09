window.onload = function () {
                let v = document.createElement("video");
                if (typeof v.canPlayType == "function") {
                    checkMimeType(v);
                }
                let m = document.getElementById("media");
                if (m) {
                    m.volume = 0.6;
                    let b = document.getElementById("buffer");
                    b.style.display = "block";
                    b.addEventListener(
                        "click",
                        function () {
                            m.pause(0);
                            m.preload = "none";
                            m.autoplay = "";
                            m.load();
                        },
                        false
                    );
                    loop();
                }
                let e = document.getElementById("toggleText").addEventListener("click", toggle, false);
                function toggle() {
                    let e = document.getElementById("displayText");
                    e.classList.toggle("h");
                }
                function checkMimeType(v) {
                    let m = [
                        "",
                        'video\/webm; codecs="av01.0.04M.08.0.110,opus"',
                        'video\/mp4; codecs="av01.0.00M.08"',
                        'video\/webm; codecs="vp9,vorbis"',
                        'video\/webm; codecs="vp8,vorbis"',
                        'video\/ogg; codecs="theora,vorbis"',
                        'video\/mp4; codecs="avc1.42c015,mp4a.40.2"',
                        'video\/mp4; codecs="avc1.4d001f,mp4a.40.2"',
                        'video\/mp4; codecs="avc1.42c01e,mp4a.40.2"',
                        'video\/mp2t; codecs="avc1.640028,mp4a.40.2"',
                        'video\/mp4; codecs="avc1.4d401f"',
                        "video\/3gpp",
                        'video\/mp4; codecs="hvc1.1.6.L120.90,mp4a.40.2"',
                        'video\/mp4; codecs="hvc1.1.6.L93.90,mp4a.40.2"',
                        "video\/x-msvideo",
                        "video\/quicktime",
                        "audio\/amr",
                        "audio\/mpeg",
                        "audio\/webm",
                        'audio\/ogg; codecs="vorbis"',
                        'audio\/ogg; codecs="vorbis"',
                        'audio\/ogg; codecs="opus"',
                        "audio\/flac",
                        "audio\/wav",
                        "audio\/x-m4a",
                        "audio\/mpeg",
                        "audio\/mpeg",
                        "audio\/aac",
                        'audio\/ogg; codecs="opus"',
                        "imgur\/gifv",
                        "imgur\/gifv",
                    ];
                    let e = document.querySelectorAll("table#mediaTable tr");
                    let p,
                        t,
                        i,
                        f,
                        l = m.length;
                    for (i = l; i--; ) {
                        f = e[i].cells[0];
                        t = m[i];
                        t = t.replace(/"/g, "&quot;");
                        if (m[i] === "imgur/gifv") {
                            if (isPlayable(v, "video/webm") || isPlayable(v, "video/mp4")) {
                                if (e[i].className != "focus") {
                                    e[i].className = "playable";
                                }
                                f.innerHTML = '<span class="dot green"></span>';
                            }
                        } else if (isPlayable(v, m[i])) {
                            if (e[i].className != "focus") {
                                e[i].className = "playable";
                            }
                            f.innerHTML = '<span class="dot green" title="MIME: ' + t + '"></span>';
                        } else {
                            f.innerHTML = '<span class="dot grey" title="MIME: ' + t + '"></span>';
                        }
                    }
                }
                function isPlayable(v, m) {
                    let p = v.canPlayType(m);
                    p = p.toLowerCase();
                    if (p === "probably" || p === "maybe") {
                        return true;
                    }
                }
                function resize(p, c) {
                    let w = p.parentElement.clientWidth;
                    c.width = w;
                    c.height = 30;
                }
                function toTime(s) {
                    let h = Math.floor(s / 3600);
                    let m = Math.floor((s - h * 3600) / 60);
                    s -= h * 3600 + m * 60;
                    s += "";
                    m += "";
                    while (m.length < 2) {
                        m = "0" + m;
                    }
                    while (s.length < 2) {
                        s = "0" + s;
                    }
                    h = h ? h + ":" : "";
                    return h + m + ":" + s;
                }
                function loop() {
                    let ctx = canvas.getContext("2d"),
                        buf = document.getElementById("buffer"),
                        can = document.getElementById("canvas");
                    window.addEventListener("resize", resize(buf, can), false);
                    let b = media.buffered,
                        i = b.length,
                        w = canvas.width,
                        h = canvas.height,
                        crt = media.currentTime,
                        dur = media.duration,
                        x1,
                        x2;
                    ctx.fillStyle = "#666";
                    ctx.fillRect(0, 0, w, h);
                    ctx.fillStyle = "#888";
                    while (i--) {
                        x1 = (b.start(i) / dur) * w;
                        x2 = (b.end(i) / dur) * w;
                        ctx.fillRect(x1, 0, x2 - x1, h);
                    }
                    let start = Math.round(crt),
                        end = Math.round(dur),
                        txtStart = toTime(start),
                        txtEnd = "";
                    if (isNaN(end) === false && isFinite(end) === true) {
                        let n = (crt / dur) * 100;
                        let pc = Math.round(n);
                        txtStart += " (" + pc + "%)";
                        txtEnd = toTime(end);
                    }
                    ctx.fillStyle = "#fff";
                    ctx.textBaseline = "top";
                    ctx.textAlign = "left";
                    ctx.fillText(txtStart, 4, 10);
                    ctx.textAlign = "right";
                    ctx.fillText(txtEnd, w - 4, 10);
                    x1 = (crt / dur) * w;
                    ctx.beginPath();
                    ctx.arc(x1, h * 0.5, 2, 0, 2 * Math.PI);
                    ctx.fill();
                    setTimeout(loop, 20);
                }
};
