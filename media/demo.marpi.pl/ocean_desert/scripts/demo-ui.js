var MarpiDemoUI = MarpiDemoUI || function () {
    function e() {
        return "ontouchstart" in window || navigator.maxTouchPoints
    }

    function t() {
        document.removeEventListener("mousemove", t), a = setTimeout(function () {
            //document.getElementById("demoNav").className = "demoNav"
        }, 2500)
    }
    var n, a, o = "./",
            i = void 0,
            s = [],
            m = void 0,
            d = void 0,
            c = void 0,
            l = !1;
    !function () {
        e() ? (document.getElementsByTagName("html")[0].setAttribute("class", "is-touch"), n = !0) : (document.getElementsByTagName("html")[0].setAttribute("class", "is-no-touch"), n = !1)
    }();
    var r = document.createElement("link");
    r.href = o + "styles/demo-ui.css", r.type = "text/css", r.rel = "stylesheet", document.getElementsByTagName("head")[0].appendChild(r);
    var u = function (e) {
        var t = new XMLHttpRequest;
        t.onreadystatechange = function () {
            if (4 == this.readyState && 200 == this.status) {
                myObj = JSON.parse(this.responseText), s = myObj.demos;
                for (var e = !1, t = 0; t < s.length; t++)
                    if (s[t].id == i) {
                        m = t, d = m + 1, c = m - 1, m >= s.length - 1 && (d = 0), m <= 0 && (c = s.length - 1), s[t].inverseUI && (l = !0), v(!0), e = !0;
                        break
                    }
                e || v(!1)
            }
        }, t.open("GET", e, !0), t.send()
    },
            v = function (e) {
                var i = document.createElement("div"),
                        r = "";
                if (false && s[m].noSocial != true) {
                    var p = [];
                    p[0] = {
                        imageURL: "../images/ui/icon-twitter.svg",
                        link: "https://twitter.com/marpi_"
                    }, p[1] = {
                        imageURL: "../images/ui/icon-instagram.svg",
                        link: "https://instagram.com/marpi_/"
                    }, p[2] = {
                        imageURL: "../images/ui/icon-facebook.svg",
                        link: "https://facebook.com/marpi.studio/"
                    };
                    var g = function (e, t) {
                        var n = new XMLHttpRequest;
                        n.onload = function () {
                            return t(this.responseText)
                        }, n.open("GET", o + e, !0), n.send()
                    }
                    var h = document.createElement("ul");
                    h.className = "socialPageLinks", document.body.appendChild(h), p.forEach(function (e, t) {
                        g(e.imageURL, function (t) {
                            var n = document.createElement("li");
                            n.className = l ? "socialPageLinks__item socialPageLinks__item--inverseUI" : "socialPageLinks__item", n.innerHTML = "<a href='" + e.link + "' target='_blank' style='border-bottom: none;'>" + t + "</a>", h.appendChild(n)
                        })
                    })
                }
                e && (r = '<div class="demoNav__extended">\n<div class="demoNav__demoIndex">\n<a href="https://marpi.pl/" class="demoNav__demoIndexLink">Marpi</a> / <a href="' + o + '" class="demoNav__demoIndexLink">Artwork</a>\n</div>\n<div class="demoNav__demoTitle" id="demo-title">\n' + s[m].title + '</div>\n<div class="demoNav__buttons">\n<a href="' + s[c].url + '" class="demoNav__button" data-title="' + s[c].title + '">\n<span class="demoNav__buttonIcon demoNav__buttonIcon--prev"></span>\n</a>\n<a href="' + s[d].url + '" class="demoNav__button" data-title="' + s[d].title + '">\n<span class="demoNav__buttonIcon demoNav__buttonIcon--next"></span>\n</a>\n</div>\n</div>\n'), i.innerHTML = '<div class="demoNav is-hover" id="demoNav">\n<a href="https://marpi.pl/" class="demoNav__logo">\n<span class="logoMarpi"></span>\n</a>\n' + "</div>\n", document.body.appendChild(i);
                var u = document.getElementsByClassName("demoNav__button");
                if (!n) {
                    document.getElementById("demoNav").addEventListener("mouseout", function () {
                        a = setTimeout(function () {
                            document.getElementById("demoNav").className = "demoNav"
                        }, 350)
                    }), document.getElementById("demoNav").addEventListener("mousemove", function () {
                        clearTimeout(a), document.getElementById("demoNav").className = "demoNav is-hover"
                    });
                    for (var v = 0; v < u.length; v++)
                        u[v].addEventListener("mouseover", function () {
                            document.getElementById("demo-title").innerHTML = this.getAttribute("data-title")
                        }), u[v].addEventListener("mouseout", function () {
                            document.getElementById("demo-title").innerHTML = s[m].title
                        });
                    document.addEventListener("mousemove", t)
                }


            };
    return {
        init: function (e) {
            i = e, u("content.json")
        }
    }
}();
