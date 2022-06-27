/*!
 * VERSION: 1.15.0
 * DATE: 2014-12-03
 * UPDATES AND DOCS AT: http://www.greensock.com
 *
 * @license Copyright (c) 2008-2014, GreenSock. All rights reserved.
 * This work is subject to the terms at http://www.greensock.com/terms_of_use.html or for
 * Club GreenSock members, the software agreement that was issued with your membership.
 *
 * @author: Jack Doyle, jack@greensock.com
 */
var _gsScope = "undefined" != typeof module && module.exports && "undefined" != typeof global ? global : this || window;
(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push(function () {
    _gsScope._gsDefine(
        "plugins.CSSPlugin",
        ["plugins.TweenPlugin", "TweenLite"],
        function (av, aO) {
            var aJ,
                ax,
                aw,
                aC,
                aU = function () {
                    av.call(this, "css"), (this._overwriteProps.length = 0), (this.setRatio = aU.prototype.setRatio);
                },
                aB = _gsScope._gsDefine.globals,
                aG = {},
                aK = (aU.prototype = new av("css"));
            (aK.constructor = aU),
                (aU.version = "1.15.0"),
                (aU.API = 2),
                (aU.defaultTransformPerspective = 0),
                (aU.defaultSkewType = "compensated"),
                (aK = "px"),
                (aU.suffixMap = { top: aK, right: aK, bottom: aK, left: aK, width: aK, height: aK, fontSize: aK, padding: aK, margin: aK, perspective: aK, lineHeight: "" });
            var au,
                aN,
                aA,
                aV,
                aQ,
                aP,
                aD = /(?:\d|\-\d|\.\d|\-\.\d)+/g,
                aM = /(?:\d|\-\d|\.\d|\-\.\d|\+=\d|\-=\d|\+=.\d|\-=\.\d)+/g,
                at = /(?:\+=|\-=|\-|\b)[\d\-\.]+[a-zA-Z0-9]*(?:%|\b)/gi,
                ap = /(?![+-]?\d*\.?\d+|[+-]|e[+-]\d+)[^0-9]/g,
                aq = /(?:\d|\-|\+|=|#|\.)*/g,
                a2 = /opacity *= *([^)]*)/i,
                ar = /opacity:([^;]*)/i,
                aT = /alpha\(opacity *=.+?\)/i,
                a7 = /^(rgb|hsl)/,
                a4 = /([A-Z])/g,
                br = /-([a-z])/gi,
                a5 = /(^(?:url\(\"|url\())|(?:(\"\))$|\)$)/gi,
                aH = function (a, b) {
                    return b.toUpperCase();
                },
                a8 = /(?:Left|Right|Width)/i,
                bt = /(M11|M12|M21|M22)=[\d\-\.e]+/gi,
                bo = /progid\:DXImageTransform\.Microsoft\.Matrix\(.+?\)/i,
                bc = /,(?=[^\)]*(?:\(|$))/gi,
                bd = Math.PI / 180,
                ba = 180 / Math.PI,
                ao = {},
                aY = document,
                bh = function (a) {
                    return aY.createElementNS ? aY.createElementNS("http://www.w3.org/1999/xhtml", a) : aY.createElement(a);
                },
                bm = bh("div"),
                bn = bh("img"),
                aX = (aU._internals = { _specialProps: aG }),
                bs = navigator.userAgent,
                a1 = (function () {
                    var a = bs.indexOf("Android"),
                        b = bh("a");
                    return (
                        (aA = -1 !== bs.indexOf("Safari") && -1 === bs.indexOf("Chrome") && (-1 === a || Number(bs.substr(a + 8, 1)) > 3)),
                        (aQ = aA && 6 > Number(bs.substr(bs.indexOf("Version/") + 8, 1))),
                        (aV = -1 !== bs.indexOf("Firefox")),
                        (/MSIE ([0-9]{1,}[\.0-9]{0,})/.exec(bs) || /Trident\/.*rv:([0-9]{1,}[\.0-9]{0,})/.exec(bs)) && (aP = parseFloat(RegExp.$1)),
                        b ? ((b.style.cssText = "top:1px;opacity:.55;"), /^0.55/.test(b.style.opacity)) : !1
                    );
                })(),
                aI = function (a) {
                    return a2.test("string" == typeof a ? a : (a.currentStyle ? a.currentStyle.filter : a.style.filter) || "") ? parseFloat(RegExp.$1) / 100 : 1;
                },
                aZ = function (a) {
                    window.console && console.log(a);
                },
                a0 = "",
                az = "",
                bk = function (b, f) {
                    f = f || bm;
                    var a,
                        d,
                        c = f.style;
                    if (void 0 !== c[b]) {
                        return b;
                    }
                    for (b = b.charAt(0).toUpperCase() + b.substr(1), a = ["O", "Moz", "ms", "Ms", "Webkit"], d = 5; --d > -1 && void 0 === c[a[d] + b]; ) {}
                    return d >= 0 ? ((az = 3 === d ? "ms" : a[d]), (a0 = "-" + az.toLowerCase() + "-"), az + b) : null;
                },
                a6 = aY.defaultView ? aY.defaultView.getComputedStyle : function () {},
                bl = (aU.getStyle = function (b, f, a, d, c) {
                    var g;
                    return a1 || "opacity" !== f
                        ? (!d && b.style[f] ? (g = b.style[f]) : (a = a || a6(b)) ? (g = a[f] || a.getPropertyValue(f) || a.getPropertyValue(f.replace(a4, "-$1").toLowerCase())) : b.currentStyle && (g = b.currentStyle[f]),
                          null == c || (g && "none" !== g && "auto" !== g && "auto auto" !== g) ? g : c)
                        : aI(b);
                }),
                aW = (aX.convertToPixels = function (v, g, a, w, d) {
                    if ("px" === w || !w) {
                        return a;
                    }
                    if ("auto" === w || !a) {
                        return 0;
                    }
                    var c,
                        e,
                        j,
                        q = a8.test(g),
                        k = v,
                        b = bm.style,
                        m = 0 > a;
                    if ((m && (a = -a), "%" === w && -1 !== g.indexOf("border"))) {
                        c = (a / 100) * (q ? v.clientWidth : v.clientHeight);
                    } else {
                        if (((b.cssText = "border:0 solid red;position:" + bl(v, "position") + ";line-height:0;"), "%" !== w && k.appendChild)) {
                            b[q ? "borderLeftWidth" : "borderTopWidth"] = a + w;
                        } else {
                            if (((k = v.parentNode || aY.body), (e = k._gsCache), (j = aO.ticker.frame), e && q && e.time === j)) {
                                return (e.width * a) / 100;
                            }
                            b[q ? "width" : "height"] = a + w;
                        }
                        k.appendChild(bm),
                            (c = parseFloat(bm[q ? "offsetWidth" : "offsetHeight"])),
                            k.removeChild(bm),
                            q && "%" === w && aU.cacheWidths !== !1 && ((e = k._gsCache = k._gsCache || {}), (e.time = j), (e.width = 100 * (c / a))),
                            0 !== c || d || (c = aW(v, g, a, w, !0));
                    }
                    return m ? -c : c;
                }),
                bB = (aX.calculateOffset = function (b, f, a) {
                    if ("absolute" !== bl(b, "position", a)) {
                        return 0;
                    }
                    var d = "left" === f ? "Left" : "Top",
                        c = bl(b, "margin" + d, a);
                    return b["offset" + d] - (aW(b, f, parseFloat(c), c.replace(aq, "")) || 0);
                }),
                bf = function (b, f) {
                    var a,
                        d,
                        c = {};
                    if ((f = f || a6(b, null))) {
                        if ((a = f.length)) {
                            for (; --a > -1; ) {
                                c[f[a].replace(br, aH)] = f.getPropertyValue(f[a]);
                            }
                        } else {
                            for (a in f) {
                                c[a] = f[a];
                            }
                        }
                    } else {
                        if ((f = b.currentStyle || b.style)) {
                            for (a in f) {
                                "string" == typeof a && void 0 === c[a] && (c[a.replace(br, aH)] = f[a]);
                            }
                        }
                    }
                    return (
                        a1 || (c.opacity = aI(b)),
                        (d = bI(b, f, !1)),
                        (c.rotation = d.rotation),
                        (c.skewX = d.skewX),
                        (c.scaleX = d.scaleX),
                        (c.scaleY = d.scaleY),
                        (c.x = d.x),
                        (c.y = d.y),
                        bK && ((c.z = d.z), (c.rotationX = d.rotationX), (c.rotationY = d.rotationY), (c.scaleZ = d.scaleZ)),
                        c.filters && delete c.filters,
                        c
                    );
                },
                bg = function (p, k, g, b, q) {
                    var d,
                        m,
                        c,
                        f = {},
                        j = p.style;
                    for (m in g) {
                        "cssText" !== m &&
                            "length" !== m &&
                            isNaN(m) &&
                            (k[m] !== (d = g[m]) || (q && q[m])) &&
                            -1 === m.indexOf("Origin") &&
                            ("number" == typeof d || "string" == typeof d) &&
                            ((f[m] = "auto" !== d || ("left" !== m && "top" !== m) ? (("" !== d && "auto" !== d && "none" !== d) || "string" != typeof k[m] || "" === k[m].replace(ap, "") ? d : 0) : bB(p, m)),
                            void 0 !== j[m] && (c = new ab(j, m, j[m], c)));
                    }
                    if (b) {
                        for (m in b) {
                            "className" !== m && (f[m] = b[m]);
                        }
                    }
                    return { difs: f, firstMPT: c };
                },
                bp = { width: ["Left", "Right"], height: ["Top", "Bottom"] },
                ac = ["marginLeft", "marginRight", "marginTop", "marginBottom"],
                aE = function (b, f, a) {
                    var d = parseFloat("width" === f ? b.offsetWidth : b.offsetHeight),
                        c = bp[f],
                        g = c.length;
                    for (a = a || a6(b, null); --g > -1; ) {
                        (d -= parseFloat(bl(b, "padding" + c[g], a, !0)) || 0), (d -= parseFloat(bl(b, "border" + c[g] + "Width", a, !0)) || 0);
                    }
                    return d;
                },
                bH = function (b, f) {
                    (null == b || "" === b || "auto" === b || "auto auto" === b) && (b = "0 0");
                    var a = b.split(" "),
                        d = -1 !== b.indexOf("left") ? "0%" : -1 !== b.indexOf("right") ? "100%" : a[0],
                        c = -1 !== b.indexOf("top") ? "0%" : -1 !== b.indexOf("bottom") ? "100%" : a[1];
                    return (
                        null == c ? (c = "0") : "center" === c && (c = "50%"),
                        ("center" === d || (isNaN(parseFloat(d)) && -1 === (d + "").indexOf("="))) && (d = "50%"),
                        f && ((f.oxp = -1 !== d.indexOf("%")), (f.oyp = -1 !== c.indexOf("%")), (f.oxr = "=" === d.charAt(1)), (f.oyr = "=" === c.charAt(1)), (f.ox = parseFloat(d.replace(ap, ""))), (f.oy = parseFloat(c.replace(ap, "")))),
                        d + " " + c + (a.length > 2 ? " " + a[2] : "")
                    );
                },
                bz = function (a, b) {
                    return "string" == typeof a && "=" === a.charAt(1) ? parseInt(a.charAt(0) + "1", 10) * parseFloat(a.substr(2)) : parseFloat(a) - parseFloat(b);
                },
                bi = function (a, b) {
                    return null == a ? b : "string" == typeof a && "=" === a.charAt(1) ? parseInt(a.charAt(0) + "1", 10) * parseFloat(a.substr(2)) + b : parseFloat(a);
                },
                bv = function (k, h, g, b) {
                    var m,
                        d,
                        j,
                        c,
                        f = 0.000001;
                    return (
                        null == k
                            ? (c = h)
                            : "number" == typeof k
                            ? (c = k)
                            : ((m = 360),
                              (d = k.split("_")),
                              (j = Number(d[0].replace(ap, "")) * (-1 === k.indexOf("rad") ? 1 : ba) - ("=" === k.charAt(1) ? 0 : h)),
                              d.length &&
                                  (b && (b[g] = h + j),
                                  -1 !== k.indexOf("short") && ((j %= m), j !== j % (m / 2) && (j = 0 > j ? j + m : j - m)),
                                  -1 !== k.indexOf("_cw") && 0 > j ? (j = ((j + 9999999999 * m) % m) - (0 | (j / m)) * m) : -1 !== k.indexOf("ccw") && j > 0 && (j = ((j - 9999999999 * m) % m) - (0 | (j / m)) * m)),
                              (c = h + j)),
                        f > c && c > -f && (c = 0),
                        c
                    );
                },
                aL = {
                    aqua: [0, 255, 255],
                    lime: [0, 255, 0],
                    silver: [192, 192, 192],
                    black: [0, 0, 0],
                    maroon: [128, 0, 0],
                    teal: [0, 128, 128],
                    blue: [0, 0, 255],
                    navy: [0, 0, 128],
                    white: [255, 255, 255],
                    fuchsia: [255, 0, 255],
                    olive: [128, 128, 0],
                    yellow: [255, 255, 0],
                    orange: [255, 165, 0],
                    gray: [128, 128, 128],
                    purple: [128, 0, 128],
                    green: [0, 128, 0],
                    red: [255, 0, 0],
                    pink: [255, 192, 203],
                    cyan: [0, 255, 255],
                    transparent: [255, 255, 255, 0],
                },
                bG = function (b, c, a) {
                    return (b = 0 > b ? b + 1 : b > 1 ? b - 1 : b), 0 | (255 * (1 > 6 * b ? c + 6 * (a - c) * b : 0.5 > b ? a : 2 > 3 * b ? c + 6 * (a - c) * (2 / 3 - b) : c) + 0.5);
                },
                a9 = (aU.parseColor = function (d) {
                    var h, c, g, f, j, b;
                    return d && "" !== d
                        ? "number" == typeof d
                            ? [d >> 16, 255 & (d >> 8), 255 & d]
                            : ("," === d.charAt(d.length - 1) && (d = d.substr(0, d.length - 1)),
                              aL[d]
                                  ? aL[d]
                                  : "#" === d.charAt(0)
                                  ? (4 === d.length && ((h = d.charAt(1)), (c = d.charAt(2)), (g = d.charAt(3)), (d = "#" + h + h + c + c + g + g)), (d = parseInt(d.substr(1), 16)), [d >> 16, 255 & (d >> 8), 255 & d])
                                  : "hsl" === d.substr(0, 3)
                                  ? ((d = d.match(aD)),
                                    (f = (Number(d[0]) % 360) / 360),
                                    (j = Number(d[1]) / 100),
                                    (b = Number(d[2]) / 100),
                                    (c = 0.5 >= b ? b * (j + 1) : b + j - b * j),
                                    (h = 2 * b - c),
                                    d.length > 3 && (d[3] = Number(d[3])),
                                    (d[0] = bG(f + 1 / 3, h, c)),
                                    (d[1] = bG(f, h, c)),
                                    (d[2] = bG(f - 1 / 3, h, c)),
                                    d)
                                  : ((d = d.match(aD) || aL.transparent), (d[0] = Number(d[0])), (d[1] = Number(d[1])), (d[2] = Number(d[2])), d.length > 3 && (d[3] = Number(d[3])), d))
                        : aL.black;
                }),
                aR = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#.+?\\b";
            for (aK in aL) {
                aR += "|" + aK + "\\b";
            }
            aR = RegExp(aR + ")", "gi");
            var bE = function (w, p, j, b) {
                    if (null == w) {
                        return function (a) {
                            return a;
                        };
                    }
                    var x,
                        d = p ? (w.match(aR) || [""])[0] : "",
                        q = w.split(d).join("").match(at) || [],
                        c = w.substr(0, w.indexOf(q[0])),
                        g = ")" === w.charAt(w.length - 1) ? ")" : "",
                        k = -1 !== w.indexOf(" ") ? " " : ",",
                        v = q.length,
                        m = v > 0 ? q[0].replace(aD, "") : "";
                    return v
                        ? (x = p
                              ? function (f) {
                                    var i, h, a, l;
                                    if ("number" == typeof f) {
                                        f += m;
                                    } else {
                                        if (b && bc.test(f)) {
                                            for (l = f.replace(bc, "|").split("|"), a = 0; l.length > a; a++) {
                                                l[a] = x(l[a]);
                                            }
                                            return l.join(",");
                                        }
                                    }
                                    if (((i = (f.match(aR) || [d])[0]), (h = f.split(i).join("").match(at) || []), (a = h.length), v > a--)) {
                                        for (; v > ++a; ) {
                                            h[a] = j ? h[0 | ((a - 1) / 2)] : q[a];
                                        }
                                    }
                                    return c + h.join(k) + k + i + g + (-1 !== f.indexOf("inset") ? " inset" : "");
                                }
                              : function (a) {
                                    var h, i, f;
                                    if ("number" == typeof a) {
                                        a += m;
                                    } else {
                                        if (b && bc.test(a)) {
                                            for (i = a.replace(bc, "|").split("|"), f = 0; i.length > f; f++) {
                                                i[f] = x(i[f]);
                                            }
                                            return i.join(",");
                                        }
                                    }
                                    if (((h = a.match(at) || []), (f = h.length), v > f--)) {
                                        for (; v > ++f; ) {
                                            h[f] = j ? h[0 | ((f - 1) / 2)] : q[f];
                                        }
                                    }
                                    return c + h.join(k) + g;
                                })
                        : function (a) {
                              return a;
                          };
                },
                am = function (a) {
                    return (
                        (a = a.split(",")),
                        function (k, g, b, p, d, m, c) {
                            var f,
                                j = (g + "").split(" ");
                            for (c = {}, f = 0; 4 > f; f++) {
                                c[a[f]] = j[f] = j[f] || j[((f - 1) / 2) >> 0];
                            }
                            return p.parse(k, c, d, m);
                        }
                    );
                },
                ab =
                    ((aX._setPluginRatio = function (k) {
                        this.plugin.setRatio(k);
                        for (var h, g, b, m, d = this.data, j = d.proxy, c = d.firstMPT, f = 0.000001; c; ) {
                            (h = j[c.v]), c.r ? (h = Math.round(h)) : f > h && h > -f && (h = 0), (c.t[c.p] = h), (c = c._next);
                        }
                        if ((d.autoRotate && (d.autoRotate.rotation = j.rotation), 1 === k)) {
                            for (c = d.firstMPT; c; ) {
                                if (((g = c.t), g.type)) {
                                    if (1 === g.type) {
                                        for (m = g.xs0 + g.s + g.xs1, b = 1; g.l > b; b++) {
                                            m += g["xn" + b] + g["xs" + (b + 1)];
                                        }
                                        g.e = m;
                                    }
                                } else {
                                    g.e = g.s + g.xs0;
                                }
                                c = c._next;
                            }
                        }
                    }),
                    function (b, f, a, d, c) {
                        (this.t = b), (this.p = f), (this.v = a), (this.r = c), d && ((d._prev = this), (this._next = d));
                    }),
                ay =
                    ((aX._parseToProxy = function (D, x, q, b, E, k) {
                        var A,
                            j,
                            m,
                            v,
                            C,
                            w = b,
                            g = {},
                            B = {},
                            z = q._transform,
                            y = ao;
                        for (q._transform = null, ao = x, b = C = q.parse(D, x, b, E), ao = y, k && ((q._transform = z), w && ((w._prev = null), w._prev && (w._prev._next = null))); b && b !== w; ) {
                            if (1 >= b.type && ((j = b.p), (B[j] = b.s + b.c), (g[j] = b.s), k || ((v = new ab(b, "s", j, v, b.r)), (b.c = 0)), 1 === b.type)) {
                                for (A = b.l; --A > 0; ) {
                                    (m = "xn" + A), (j = b.p + "_" + m), (B[j] = b.data[m]), (g[j] = b[m]), k || (v = new ab(b, m, j, v, b.rxp[m]));
                                }
                            }
                            b = b._next;
                        }
                        return { proxy: g, end: B, firstMPT: v, pt: C };
                    }),
                    (aX.CSSPropTween = function (q, k, b, v, m, d, g, i, n, j, c) {
                        (this.t = q),
                            (this.p = k),
                            (this.s = b),
                            (this.c = v),
                            (this.n = g || k),
                            q instanceof ay || aC.push(this.n),
                            (this.r = i),
                            (this.type = d || 0),
                            n && ((this.pr = n), (aJ = !0)),
                            (this.b = void 0 === j ? b : j),
                            (this.e = void 0 === c ? b + v : c),
                            m && ((this._next = m), (m._prev = this));
                    })),
                ak = (aU.parseComplex = function (D, Q, M, G, E, J, X, I, K, N) {
                    (M = M || J || ""), (X = new ay(D, Q, 0, 0, X, N ? 2 : 1, null, !1, I, M, G)), (G += "");
                    var P,
                        H,
                        Y,
                        V,
                        U,
                        B,
                        u,
                        z,
                        g,
                        A,
                        W,
                        j,
                        F = M.split(", ").join(",").split(" "),
                        m = G.split(", ").join(",").split(" "),
                        L = F.length,
                        q = au !== !1;
                    for (
                        (-1 !== G.indexOf(",") || -1 !== M.indexOf(",")) && ((F = F.join(" ").replace(bc, ", ").split(" ")), (m = m.join(" ").replace(bc, ", ").split(" ")), (L = F.length)),
                            L !== m.length && ((F = (J || "").split(" ")), (L = F.length)),
                            X.plugin = K,
                            X.setRatio = N,
                            P = 0;
                        L > P;
                        P++
                    ) {
                        if (((V = F[P]), (U = m[P]), (z = parseFloat(V)), z || 0 === z)) {
                            X.appendXtra("", z, bz(U, z), U.replace(aM, ""), q && -1 !== U.indexOf("px"), !0);
                        } else {
                            if (E && ("#" === V.charAt(0) || aL[V] || a7.test(V))) {
                                (j = "," === U.charAt(U.length - 1) ? ")," : ")"),
                                    (V = a9(V)),
                                    (U = a9(U)),
                                    (g = V.length + U.length > 6),
                                    g && !a1 && 0 === U[3]
                                        ? ((X["xs" + X.l] += X.l ? " transparent" : "transparent"), (X.e = X.e.split(m[P]).join("transparent")))
                                        : (a1 || (g = !1),
                                          X.appendXtra(g ? "rgba(" : "rgb(", V[0], U[0] - V[0], ",", !0, !0)
                                              .appendXtra("", V[1], U[1] - V[1], ",", !0)
                                              .appendXtra("", V[2], U[2] - V[2], g ? "," : j, !0),
                                          g && ((V = 4 > V.length ? 1 : V[3]), X.appendXtra("", V, (4 > U.length ? 1 : U[3]) - V, j, !1)));
                            } else {
                                if ((B = V.match(aD))) {
                                    if (((u = U.match(aM)), !u || u.length !== B.length)) {
                                        return X;
                                    }
                                    for (Y = 0, H = 0; B.length > H; H++) {
                                        (W = B[H]), (A = V.indexOf(W, Y)), X.appendXtra(V.substr(Y, A - Y), Number(W), bz(u[H], W), "", q && "px" === V.substr(A + W.length, 2), 0 === H), (Y = A + W.length);
                                    }
                                    X["xs" + X.l] += V.substr(Y);
                                } else {
                                    X["xs" + X.l] += X.l ? " " + V : V;
                                }
                            }
                        }
                    }
                    if (-1 !== G.indexOf("=") && X.data) {
                        for (j = X.xs0 + X.data.s, P = 1; X.l > P; P++) {
                            j += X["xs" + P] + X.data["xn" + P];
                        }
                        X.e = j + X["xs" + P];
                    }
                    return X.l || ((X.type = -1), (X.xs0 = X.e)), X.xfirst || X;
                }),
                by = 9;
            for (aK = ay.prototype, aK.l = aK.pr = 0; --by > 0; ) {
                (aK["xn" + by] = 0), (aK["xs" + by] = "");
            }
            (aK.xs0 = ""),
                (aK._next = aK._prev = aK.xfirst = aK.data = aK.plugin = aK.setRatio = aK.rxp = null),
                (aK.appendXtra = function (d, h, c, g, f, k) {
                    var b = this,
                        j = b.l;
                    return (
                        (b["xs" + j] += k && j ? " " + d : d || ""),
                        c || 0 === j || b.plugin
                            ? (b.l++,
                              (b.type = b.setRatio ? 2 : 1),
                              (b["xs" + b.l] = g || ""),
                              j > 0
                                  ? ((b.data["xn" + j] = h + c), (b.rxp["xn" + j] = f), (b["xn" + j] = h), b.plugin || ((b.xfirst = new ay(b, "xn" + j, h, c, b.xfirst || b, 0, b.n, f, b.pr)), (b.xfirst.xs0 = 0)), b)
                                  : ((b.data = { s: h + c }), (b.rxp = {}), (b.s = h), (b.c = c), (b.r = f), b))
                            : ((b["xs" + j] += h + (g || "")), b)
                    );
                });
            var bw = function (a, b) {
                    (b = b || {}),
                        (this.p = b.prefix ? bk(a) || a : a),
                        (aG[a] = aG[this.p] = this),
                        (this.format = b.formatter || bE(b.defaultValue, b.color, b.collapsible, b.multi)),
                        b.parser && (this.parse = b.parser),
                        (this.clrs = b.color),
                        (this.multi = b.multi),
                        (this.keyword = b.keyword),
                        (this.dflt = b.defaultValue),
                        (this.pr = b.priority || 0);
                },
                an = (aX._registerComplexSpecialProp = function (d, h, c) {
                    "object" != typeof h && (h = { parser: c });
                    var g,
                        f,
                        j = d.split(","),
                        b = h.defaultValue;
                    for (c = c || [b], g = 0; j.length > g; g++) {
                        (h.prefix = 0 === g && h.prefix), (h.defaultValue = c[g] || b), (f = new bw(j[g], h));
                    }
                }),
                bC = function (a) {
                    if (!aG[a]) {
                        var b = a.charAt(0).toUpperCase() + a.substr(1) + "Plugin";
                        an(a, {
                            parser: function (f, e, k, j, l, c, g) {
                                var d = aB.com.greensock.plugins[b];
                                return d ? (d._cssRegister(), aG[k].parse(f, e, k, j, l, c, g)) : (aZ("Error: " + b + " js file not loaded."), l);
                            },
                        });
                    }
                };
            (aK = bw.prototype),
                (aK.parseComplex = function (y, v, k, b, z, g) {
                    var w,
                        d,
                        j,
                        m,
                        x,
                        q,
                        c = this.keyword;
                    if ((this.multi && (bc.test(k) || bc.test(v) ? ((d = v.replace(bc, "|").split("|")), (j = k.replace(bc, "|").split("|"))) : c && ((d = [v]), (j = [k]))), j)) {
                        for (m = j.length > d.length ? j.length : d.length, w = 0; m > w; w++) {
                            (v = d[w] = d[w] || this.dflt), (k = j[w] = j[w] || this.dflt), c && ((x = v.indexOf(c)), (q = k.indexOf(c)), x !== q && ((k = -1 === q ? j : d), (k[w] += " " + c)));
                        }
                        (v = d.join(", ")), (k = j.join(", "));
                    }
                    return ak(y, this.p, v, k, this.clrs, this.dflt, b, this.pr, z, g);
                }),
                (aK.parse = function (d, g, c, f, h, b) {
                    return this.parseComplex(d.style, this.format(bl(d, this.p, aw, !1, this.dflt)), this.format(g), h, b);
                }),
                (aU.registerSpecialProp = function (b, c, a) {
                    an(b, {
                        parser: function (f, h, g, j, e, i) {
                            var d = new ay(f, g, 0, 0, e, 2, g, !1, a);
                            return (d.plugin = i), (d.setRatio = c(f, h, j._tween, g)), d;
                        },
                        priority: a,
                    });
                });
            var bJ,
                bD = "scaleX,scaleY,scaleZ,x,y,z,skewX,skewY,rotation,rotationX,rotationY,perspective,xPercent,yPercent".split(","),
                ah = bk("transform"),
                a3 = a0 + "transform",
                aS = bk("transformOrigin"),
                bK = null !== bk("perspective"),
                bb = (aX.Transform = function () {
                    (this.perspective = parseFloat(aU.defaultTransformPerspective) || 0), (this.force3D = aU.defaultForce3D !== !1 && bK ? aU.defaultForce3D || "auto" : !1);
                }),
                ai = window.SVGElement,
                ad = function (b, f, a) {
                    var d,
                        c = aY.createElementNS("http://www.w3.org/2000/svg", b),
                        g = /([a-z])([A-Z])/g;
                    for (d in a) {
                        c.setAttributeNS(null, d.replace(g, "$1-$2").toLowerCase(), a[d]);
                    }
                    return f.appendChild(c), c;
                },
                bq = document.documentElement,
                bF = (function () {
                    var b,
                        d,
                        a,
                        c = aP || (/Android/i.test(bs) && !window.chrome);
                    return (
                        aY.createElementNS &&
                            !c &&
                            ((b = ad("svg", bq)),
                            (d = ad("rect", b, { width: 100, height: 50, x: 100 })),
                            (a = d.getBoundingClientRect().width),
                            (d.style[aS] = "50% 50%"),
                            (d.style[ah] = "scaleX(0.5)"),
                            (c = a === d.getBoundingClientRect().width),
                            bq.removeChild(b)),
                        c
                    );
                })(),
                aF = function (b, d, a) {
                    var c = b.getBBox();
                    (d = bH(d).split(" ")),
                        (a.xOrigin = (-1 !== d[0].indexOf("%") ? (parseFloat(d[0]) / 100) * c.width : parseFloat(d[0])) + c.x),
                        (a.yOrigin = (-1 !== d[1].indexOf("%") ? (parseFloat(d[1]) / 100) * c.height : parseFloat(d[1])) + c.y);
                },
                bI = (aX.getTransform = function (b3, ch, cd, b4) {
                    if (b3._gsTransform && cd && !b4) {
                        return b3._gsTransform;
                    }
                    var b8,
                        b7,
                        ca,
                        ce,
                        b2,
                        cg,
                        b6,
                        cl,
                        cj,
                        ci,
                        b9 = cd ? b3._gsTransform || new bb() : new bb(),
                        cf = 0 > b9.scaleX,
                        b1 = 0.00002,
                        bY = 100000,
                        bZ = bK ? parseFloat(bl(b3, aS, ch, !1, "0 0 0").split(" ")[2]) || b9.zOrigin || 0 : 0,
                        N = parseFloat(aU.defaultTransformPerspective) || 0;
                    if (
                        (ah
                            ? (b7 = bl(b3, a3, ch, !0))
                            : b3.currentStyle &&
                              ((b7 = b3.currentStyle.filter.match(bt)), (b7 = b7 && 4 === b7.length ? [b7[0].substr(4), Number(b7[2].substr(4)), Number(b7[1].substr(4)), b7[3].substr(4), b9.x || 0, b9.y || 0].join(",") : "")),
                        (b8 = !b7 || "none" === b7 || "matrix(1, 0, 0, 1, 0, 0)" === b7),
                        (b9.svg = !!(ai && "function" == typeof b3.getBBox && b3.getCTM && (!b3.parentNode || (b3.parentNode.getBBox && b3.parentNode.getCTM)))),
                        b9.svg && (aF(b3, bl(b3, aS, aw, !1, "50% 50%") + "", b9), (bJ = aU.useSVGTransformAttr || bF), (ca = b3.getAttribute("transform")), b8 && ca && -1 !== ca.indexOf("matrix") && ((b7 = ca), (b8 = 0))),
                        !b8)
                    ) {
                        for (ca = (b7 || "").match(/(?:\-|\b)[\d\-\.e]+\b/gi) || [], ce = ca.length; --ce > -1; ) {
                            (b2 = Number(ca[ce])), (ca[ce] = (cg = b2 - (b2 |= 0)) ? (0 | (cg * bY + (0 > cg ? -0.5 : 0.5))) / bY + b2 : b2);
                        }
                        if (16 === ca.length) {
                            var b0 = ca[8],
                                ck = ca[9],
                                bM = ca[10],
                                ae = ca[12],
                                bV = ca[13],
                                be = ca[14];
                            b9.zOrigin && ((be = -b9.zOrigin), (ae = b0 * be - ca[12]), (bV = ck * be - ca[13]), (be = bM * be + b9.zOrigin - ca[14]));
                            var cb,
                                bN,
                                bU,
                                bO,
                                bP,
                                bX = ca[0],
                                A = ca[1],
                                bQ = ca[2],
                                bS = ca[3],
                                bT = ca[4],
                                s = ca[5],
                                bW = ca[6],
                                K = ca[7],
                                cc = ca[11],
                                G = Math.atan2(A, s);
                            (b9.rotation = G * ba),
                                G && ((bO = Math.cos(-G)), (bP = Math.sin(-G)), (bX = bX * bO + bT * bP), (bN = A * bO + s * bP), (s = A * -bP + s * bO), (bW = bQ * -bP + bW * bO), (A = bN)),
                                (G = Math.atan2(b0, bX)),
                                (b9.rotationY = G * ba),
                                G &&
                                    ((bO = Math.cos(-G)),
                                    (bP = Math.sin(-G)),
                                    (cb = bX * bO - b0 * bP),
                                    (bN = A * bO - ck * bP),
                                    (bU = bQ * bO - bM * bP),
                                    (ck = A * bP + ck * bO),
                                    (bM = bQ * bP + bM * bO),
                                    (cc = bS * bP + cc * bO),
                                    (bX = cb),
                                    (A = bN),
                                    (bQ = bU)),
                                (G = Math.atan2(bW, bM)),
                                (b9.rotationX = G * ba),
                                G &&
                                    ((bO = Math.cos(-G)),
                                    (bP = Math.sin(-G)),
                                    (cb = bT * bO + b0 * bP),
                                    (bN = s * bO + ck * bP),
                                    (bU = bW * bO + bM * bP),
                                    (b0 = bT * -bP + b0 * bO),
                                    (ck = s * -bP + ck * bO),
                                    (bM = bW * -bP + bM * bO),
                                    (cc = K * -bP + cc * bO),
                                    (bT = cb),
                                    (s = bN),
                                    (bW = bU)),
                                (b9.scaleX = (0 | (Math.sqrt(bX * bX + A * A) * bY + 0.5)) / bY),
                                (b9.scaleY = (0 | (Math.sqrt(s * s + ck * ck) * bY + 0.5)) / bY),
                                (b9.scaleZ = (0 | (Math.sqrt(bW * bW + bM * bM) * bY + 0.5)) / bY),
                                (b9.skewX = 0),
                                (b9.perspective = cc ? 1 / (0 > cc ? -cc : cc) : 0),
                                (b9.x = ae),
                                (b9.y = bV),
                                (b9.z = be);
                        } else {
                            if (!((bK && !b4 && ca.length && b9.x === ca[4] && b9.y === ca[5] && (b9.rotationX || b9.rotationY)) || (void 0 !== b9.x && "none" === bl(b3, "display", ch)))) {
                                var J = ca.length >= 6,
                                    b5 = J ? ca[0] : 1,
                                    bR = ca[1] || 0,
                                    bL = ca[2] || 0,
                                    a = J ? ca[3] : 1;
                                (b9.x = ca[4] || 0),
                                    (b9.y = ca[5] || 0),
                                    (b6 = Math.sqrt(b5 * b5 + bR * bR)),
                                    (cl = Math.sqrt(a * a + bL * bL)),
                                    (cj = b5 || bR ? Math.atan2(bR, b5) * ba : b9.rotation || 0),
                                    (ci = bL || a ? Math.atan2(bL, a) * ba + cj : b9.skewX || 0),
                                    Math.abs(ci) > 90 && 270 > Math.abs(ci) && (cf ? ((b6 *= -1), (ci += 0 >= cj ? 180 : -180), (cj += 0 >= cj ? 180 : -180)) : ((cl *= -1), (ci += 0 >= ci ? 180 : -180))),
                                    (b9.scaleX = b6),
                                    (b9.scaleY = cl),
                                    (b9.rotation = cj),
                                    (b9.skewX = ci),
                                    bK && ((b9.rotationX = b9.rotationY = b9.z = 0), (b9.perspective = N), (b9.scaleZ = 1));
                            }
                        }
                        b9.zOrigin = bZ;
                        for (ce in b9) {
                            b1 > b9[ce] && b9[ce] > -b1 && (b9[ce] = 0);
                        }
                    }
                    return cd && (b3._gsTransform = b9), b9;
                }),
                ag = function (B) {
                    var Q,
                        L,
                        F = this.data,
                        D = -F.rotation * bd,
                        I = D + F.skewX * bd,
                        V = 100000,
                        H = (0 | (Math.cos(D) * F.scaleX * V)) / V,
                        K = (0 | (Math.sin(D) * F.scaleX * V)) / V,
                        M = (0 | (Math.sin(I) * -F.scaleY * V)) / V,
                        A = (0 | (Math.cos(I) * F.scaleY * V)) / V,
                        O = this.t.style,
                        G = this.t.currentStyle;
                    if (G) {
                        (L = K), (K = -M), (M = -L), (Q = G.filter), (O.filter = "");
                        var W,
                            T,
                            J = this.t.offsetWidth,
                            N = this.t.offsetHeight,
                            z = "absolute" !== G.position,
                            q = "progid:DXImageTransform.Microsoft.Matrix(M11=" + H + ", M12=" + K + ", M21=" + M + ", M22=" + A,
                            x = F.x + (J * F.xPercent) / 100,
                            U = F.y + (N * F.yPercent) / 100;
                        if (
                            (null != F.ox && ((W = (F.oxp ? 0.01 * J * F.ox : F.ox) - J / 2), (T = (F.oyp ? 0.01 * N * F.oy : F.oy) - N / 2), (x += W - (W * H + T * K)), (U += T - (W * M + T * A))),
                            z ? ((W = J / 2), (T = N / 2), (q += ", Dx=" + (W - (W * H + T * K) + x) + ", Dy=" + (T - (W * M + T * A) + U) + ")")) : (q += ", sizingMethod='auto expand')"),
                            (O.filter = -1 !== Q.indexOf("DXImageTransform.Microsoft.Matrix(") ? Q.replace(bo, q) : q + " " + Q),
                            (0 === B || 1 === B) &&
                                1 === H &&
                                0 === K &&
                                0 === M &&
                                1 === A &&
                                ((z && -1 === q.indexOf("Dx=0, Dy=0")) || (a2.test(Q) && 100 !== parseFloat(RegExp.$1)) || (-1 === Q.indexOf("gradient(" && Q.indexOf("Alpha")) && O.removeAttribute("filter"))),
                            !z)
                        ) {
                            var k,
                                d,
                                E,
                                j = 8 > aP ? 1 : -1;
                            for (
                                W = F.ieOffsetX || 0,
                                    T = F.ieOffsetY || 0,
                                    F.ieOffsetX = Math.round((J - ((0 > H ? -H : H) * J + (0 > K ? -K : K) * N)) / 2 + x),
                                    F.ieOffsetY = Math.round((N - ((0 > A ? -A : A) * N + (0 > M ? -M : M) * J)) / 2 + U),
                                    by = 0;
                                4 > by;
                                by++
                            ) {
                                (d = ac[by]),
                                    (k = G[d]),
                                    (L = -1 !== k.indexOf("px") ? parseFloat(k) : aW(this.t, d, parseFloat(k), k.replace(aq, "")) || 0),
                                    (E = L !== F[d] ? (2 > by ? -F.ieOffsetX : -F.ieOffsetY) : 2 > by ? W - F.ieOffsetX : T - F.ieOffsetY),
                                    (O[d] = (F[d] = Math.round(L - E * (0 === by || 2 === by ? 1 : j))) + "px");
                            }
                        }
                    }
                },
                bA = (aX.set3DTransformRatio = function (bN) {
                    var b0,
                        bW,
                        bP,
                        bO,
                        bS,
                        b4,
                        bR,
                        bU,
                        bX,
                        bM,
                        bZ,
                        bQ,
                        b2,
                        b1,
                        bT,
                        bY,
                        bL,
                        Z,
                        ae,
                        q,
                        be,
                        b3,
                        G,
                        B,
                        V,
                        E = this.data,
                        bV = this.t.style,
                        H = E.rotation * bd,
                        W = E.scaleX,
                        U = E.scaleY,
                        K = E.scaleZ,
                        J = E.x,
                        Y = E.y,
                        j = E.z,
                        L = E.perspective;
                    if (!((1 !== bN && 0 !== bN) || "auto" !== E.force3D || E.rotationY || E.rotationX || 1 !== K || L || j)) {
                        return bu.call(this, bN), void 0;
                    }
                    if (aV) {
                        var Q = 0.0001;
                        Q > W && W > -Q && (W = K = 0.00002), Q > U && U > -Q && (U = K = 0.00002), !L || E.z || E.rotationX || E.rotationY || (L = 0);
                    }
                    if (H || E.skewX) {
                        (Z = Math.cos(H)),
                            (ae = Math.sin(H)),
                            (b0 = Z),
                            (bS = ae),
                            E.skewX && ((H -= E.skewX * bd), (Z = Math.cos(H)), (ae = Math.sin(H)), "simple" === E.skewType && ((q = Math.tan(E.skewX * bd)), (q = Math.sqrt(1 + q * q)), (Z *= q), (ae *= q))),
                            (bW = -ae),
                            (b4 = Z);
                    } else {
                        if (!(E.rotationY || E.rotationX || 1 !== K || L || E.svg)) {
                            return (
                                (bV[ah] =
                                    (E.xPercent || E.yPercent ? "translate(" + E.xPercent + "%," + E.yPercent + "%) translate3d(" : "translate3d(") +
                                    J +
                                    "px," +
                                    Y +
                                    "px," +
                                    j +
                                    "px)" +
                                    (1 !== W || 1 !== U ? " scale(" + W + "," + U + ")" : "")),
                                void 0
                            );
                        }
                        (b0 = b4 = 1), (bW = bS = 0);
                    }
                    (bZ = 1),
                        (bP = bO = bR = bU = bX = bM = bQ = b2 = b1 = 0),
                        (bT = L ? -1 / L : 0),
                        (bY = E.zOrigin),
                        (bL = 100000),
                        (V = ","),
                        (H = E.rotationY * bd),
                        H && ((Z = Math.cos(H)), (ae = Math.sin(H)), (bX = bZ * -ae), (b2 = bT * -ae), (bP = b0 * ae), (bR = bS * ae), (bZ *= Z), (bT *= Z), (b0 *= Z), (bS *= Z)),
                        (H = E.rotationX * bd),
                        H &&
                            ((Z = Math.cos(H)),
                            (ae = Math.sin(H)),
                            (q = bW * Z + bP * ae),
                            (be = b4 * Z + bR * ae),
                            (b3 = bM * Z + bZ * ae),
                            (G = b1 * Z + bT * ae),
                            (bP = bW * -ae + bP * Z),
                            (bR = b4 * -ae + bR * Z),
                            (bZ = bM * -ae + bZ * Z),
                            (bT = b1 * -ae + bT * Z),
                            (bW = q),
                            (b4 = be),
                            (bM = b3),
                            (b1 = G)),
                        1 !== K && ((bP *= K), (bR *= K), (bZ *= K), (bT *= K)),
                        1 !== U && ((bW *= U), (b4 *= U), (bM *= U), (b1 *= U)),
                        1 !== W && ((b0 *= W), (bS *= W), (bX *= W), (b2 *= W)),
                        bY && ((bQ -= bY), (bO = bP * bQ), (bU = bR * bQ), (bQ = bZ * bQ + bY)),
                        E.svg && ((bO += E.xOrigin - (E.xOrigin * b0 + E.yOrigin * bW)), (bU += E.yOrigin - (E.xOrigin * bS + E.yOrigin * b4))),
                        (bO = (q = (bO += J) - (bO |= 0)) ? (0 | (q * bL + (0 > q ? -0.5 : 0.5))) / bL + bO : bO),
                        (bU = (q = (bU += Y) - (bU |= 0)) ? (0 | (q * bL + (0 > q ? -0.5 : 0.5))) / bL + bU : bU),
                        (bQ = (q = (bQ += j) - (bQ |= 0)) ? (0 | (q * bL + (0 > q ? -0.5 : 0.5))) / bL + bQ : bQ),
                        (B = E.xPercent || E.yPercent ? "translate(" + E.xPercent + "%," + E.yPercent + "%) matrix3d(" : "matrix3d("),
                        (B += (0 | (b0 * bL)) / bL + V + (0 | (bS * bL)) / bL + V + (0 | (bX * bL)) / bL),
                        (B += V + (0 | (b2 * bL)) / bL + V + (0 | (bW * bL)) / bL + V + (0 | (b4 * bL)) / bL),
                        (B += V + (0 | (bM * bL)) / bL + V + (0 | (b1 * bL)) / bL + V + (0 | (bP * bL)) / bL),
                        (B += V + (0 | (bR * bL)) / bL + V + (0 | (bZ * bL)) / bL + V + (0 | (bT * bL)) / bL),
                        (B += V + bO + V + bU + V + bQ + V + (L ? 1 + -bQ / L : 1) + ")"),
                        (bV[ah] = B);
                }),
                bu = (aX.set2DTransformRatio = function (F) {
                    var z,
                        w,
                        b,
                        G,
                        k,
                        C,
                        j,
                        v,
                        x,
                        E,
                        y,
                        g = this.data,
                        D = this.t,
                        B = D.style,
                        A = g.x,
                        q = g.y;
                    return !(g.rotationX || g.rotationY || g.z || g.force3D === !0 || ("auto" === g.force3D && 1 !== F && 0 !== F)) || (g.svg && bJ) || !bK
                        ? ((G = g.scaleX),
                          (k = g.scaleY),
                          g.rotation || g.skewX || g.svg
                              ? ((z = g.rotation * bd),
                                (w = z - g.skewX * bd),
                                (b = 100000),
                                (C = Math.cos(z) * G),
                                (j = Math.sin(z) * G),
                                (v = Math.sin(w) * -k),
                                (x = Math.cos(w) * k),
                                g.svg && ((A += g.xOrigin - (g.xOrigin * C + g.yOrigin * v)), (q += g.yOrigin - (g.xOrigin * j + g.yOrigin * x)), (y = 0.000001), y > A && A > -y && (A = 0), y > q && q > -y && (q = 0)),
                                (E = (0 | (C * b)) / b + "," + (0 | (j * b)) / b + "," + (0 | (v * b)) / b + "," + (0 | (x * b)) / b + "," + A + "," + q + ")"),
                                g.svg && bJ ? D.setAttribute("transform", "matrix(" + E) : (B[ah] = (g.xPercent || g.yPercent ? "translate(" + g.xPercent + "%," + g.yPercent + "%) matrix(" : "matrix(") + E))
                              : (B[ah] = (g.xPercent || g.yPercent ? "translate(" + g.xPercent + "%," + g.yPercent + "%) matrix(" : "matrix(") + G + ",0,0," + k + "," + A + "," + q + ")"),
                          void 0)
                        : ((this.setRatio = bA), bA.call(this, F), void 0);
                });
            (aK = bb.prototype),
                (aK.x = aK.y = aK.z = aK.skewX = aK.skewY = aK.rotation = aK.rotationX = aK.rotationY = aK.zOrigin = aK.xPercent = aK.yPercent = 0),
                (aK.scaleX = aK.scaleY = aK.scaleZ = 1),
                an(
                    "transform,scale,scaleX,scaleY,scaleZ,x,y,z,rotation,rotationX,rotationY,rotationZ,skewX,skewY,shortRotation,shortRotationX,shortRotationY,shortRotationZ,transformOrigin,transformPerspective,directionalRotation,parseTransform,force3D,skewType,xPercent,yPercent",
                    {
                        parser: function (s, I, E, w, B, A, D) {
                            if (w._lastParsedTransform === D) {
                                return B;
                            }
                            w._lastParsedTransform = D;
                            var F,
                                q,
                                H,
                                z,
                                L,
                                K,
                                J,
                                C = (w._transform = bI(s, aw, !0, D.parseTransform)),
                                G = s.style,
                                k = 0.000001,
                                b = bD.length,
                                j = D,
                                a = {};
                            if ("string" == typeof j.transform && ah) {
                                (H = bm.style), (H[ah] = j.transform), (H.display = "block"), (H.position = "absolute"), aY.body.appendChild(bm), (F = bI(bm, null, !1)), aY.body.removeChild(bm);
                            } else {
                                if ("object" == typeof j) {
                                    if (
                                        ((F = {
                                            scaleX: bi(null != j.scaleX ? j.scaleX : j.scale, C.scaleX),
                                            scaleY: bi(null != j.scaleY ? j.scaleY : j.scale, C.scaleY),
                                            scaleZ: bi(j.scaleZ, C.scaleZ),
                                            x: bi(j.x, C.x),
                                            y: bi(j.y, C.y),
                                            z: bi(j.z, C.z),
                                            xPercent: bi(j.xPercent, C.xPercent),
                                            yPercent: bi(j.yPercent, C.yPercent),
                                            perspective: bi(j.transformPerspective, C.perspective),
                                        }),
                                        (J = j.directionalRotation),
                                        null != J)
                                    ) {
                                        if ("object" == typeof J) {
                                            for (H in J) {
                                                j[H] = J[H];
                                            }
                                        } else {
                                            j.rotation = J;
                                        }
                                    }
                                    "string" == typeof j.x && -1 !== j.x.indexOf("%") && ((F.x = 0), (F.xPercent = bi(j.x, C.xPercent))),
                                        "string" == typeof j.y && -1 !== j.y.indexOf("%") && ((F.y = 0), (F.yPercent = bi(j.y, C.yPercent))),
                                        (F.rotation = bv("rotation" in j ? j.rotation : "shortRotation" in j ? j.shortRotation + "_short" : "rotationZ" in j ? j.rotationZ : C.rotation, C.rotation, "rotation", a)),
                                        bK &&
                                            ((F.rotationX = bv("rotationX" in j ? j.rotationX : "shortRotationX" in j ? j.shortRotationX + "_short" : C.rotationX || 0, C.rotationX, "rotationX", a)),
                                            (F.rotationY = bv("rotationY" in j ? j.rotationY : "shortRotationY" in j ? j.shortRotationY + "_short" : C.rotationY || 0, C.rotationY, "rotationY", a))),
                                        (F.skewX = null == j.skewX ? C.skewX : bv(j.skewX, C.skewX)),
                                        (F.skewY = null == j.skewY ? C.skewY : bv(j.skewY, C.skewY)),
                                        (q = F.skewY - C.skewY) && ((F.skewX += q), (F.rotation += q));
                                }
                            }
                            for (
                                bK && null != j.force3D && ((C.force3D = j.force3D), (K = !0)),
                                    C.skewType = j.skewType || C.skewType || aU.defaultSkewType,
                                    L = C.force3D || C.z || C.rotationX || C.rotationY || F.z || F.rotationX || F.rotationY || F.perspective,
                                    L || null == j.scale || (F.scaleZ = 1);
                                --b > -1;

                            ) {
                                (E = bD[b]),
                                    (z = F[E] - C[E]),
                                    (z > k || -k > z || null != j[E] || null != ao[E]) && ((K = !0), (B = new ay(C, E, C[E], z, B)), E in a && (B.e = a[E]), (B.xs0 = 0), (B.plugin = A), w._overwriteProps.push(B.n));
                            }
                            return (
                                (z = j.transformOrigin),
                                z &&
                                    C.svg &&
                                    (aF(s, z, F),
                                    (B = new ay(C, "xOrigin", C.xOrigin, F.xOrigin - C.xOrigin, B, -1, "transformOrigin")),
                                    (B.b = C.xOrigin),
                                    (B.e = B.xs0 = F.xOrigin),
                                    (B = new ay(C, "yOrigin", C.yOrigin, F.yOrigin - C.yOrigin, B, -1, "transformOrigin")),
                                    (B.b = C.yOrigin),
                                    (B.e = B.xs0 = F.yOrigin),
                                    (z = "0px 0px")),
                                (z || (bK && L && C.zOrigin)) &&
                                    (ah
                                        ? ((K = !0),
                                          (E = aS),
                                          (z = (z || bl(s, E, aw, !1, "50% 50%")) + ""),
                                          (B = new ay(G, E, 0, 0, B, -1, "transformOrigin")),
                                          (B.b = G[E]),
                                          (B.plugin = A),
                                          bK
                                              ? ((H = C.zOrigin),
                                                (z = z.split(" ")),
                                                (C.zOrigin = (z.length > 2 && (0 === H || "0px" !== z[2]) ? parseFloat(z[2]) : H) || 0),
                                                (B.xs0 = B.e = z[0] + " " + (z[1] || "50%") + " 0px"),
                                                (B = new ay(C, "zOrigin", 0, 0, B, -1, B.n)),
                                                (B.b = H),
                                                (B.xs0 = B.e = C.zOrigin))
                                              : (B.xs0 = B.e = z))
                                        : bH(z + "", C)),
                                K && (w._transformType = (C.svg && bJ) || (!L && 3 !== this._transformType) ? 2 : 3),
                                B
                            );
                        },
                        prefix: !0,
                    }
                ),
                an("boxShadow", { defaultValue: "0px 0px 0px 0px #999", prefix: !0, color: !0, multi: !0, keyword: "inset" }),
                an("borderRadius", {
                    defaultValue: "0px",
                    parser: function (B, L, H, E, Q) {
                        L = this.format(L);
                        var D,
                            G,
                            I,
                            A,
                            K,
                            C,
                            R,
                            N,
                            M,
                            F,
                            J,
                            z,
                            q,
                            r,
                            j,
                            s,
                            O = ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius"],
                            k = B.style;
                        for (M = parseFloat(B.offsetWidth), F = parseFloat(B.offsetHeight), D = L.split(" "), G = 0; O.length > G; G++) {
                            this.p.indexOf("border") && (O[G] = bk(O[G])),
                                (K = A = bl(B, O[G], aw, !1, "0px")),
                                -1 !== K.indexOf(" ") && ((A = K.split(" ")), (K = A[0]), (A = A[1])),
                                (C = I = D[G]),
                                (R = parseFloat(K)),
                                (z = K.substr((R + "").length)),
                                (q = "=" === C.charAt(1)),
                                q ? ((N = parseInt(C.charAt(0) + "1", 10)), (C = C.substr(2)), (N *= parseFloat(C)), (J = C.substr((N + "").length - (0 > N ? 1 : 0)) || "")) : ((N = parseFloat(C)), (J = C.substr((N + "").length))),
                                "" === J && (J = ax[H] || z),
                                J !== z &&
                                    ((r = aW(B, "borderLeft", R, z)),
                                    (j = aW(B, "borderTop", R, z)),
                                    "%" === J ? ((K = 100 * (r / M) + "%"), (A = 100 * (j / F) + "%")) : "em" === J ? ((s = aW(B, "borderLeft", 1, "em")), (K = r / s + "em"), (A = j / s + "em")) : ((K = r + "px"), (A = j + "px")),
                                    q && ((C = parseFloat(K) + N + J), (I = parseFloat(A) + N + J))),
                                (Q = ak(k, O[G], K + " " + A, C + " " + I, !1, "0px", Q));
                        }
                        return Q;
                    },
                    prefix: !0,
                    formatter: bE("0px 0px 0px 0px", !1, !0),
                }),
                an("backgroundPosition", {
                    defaultValue: "0 0",
                    parser: function (E, z, v, b, k, B) {
                        var j,
                            s,
                            w,
                            D,
                            y,
                            d,
                            C = "background-position",
                            A = aw || a6(E, null),
                            q = this.format((A ? (aP ? A.getPropertyValue(C + "-x") + " " + A.getPropertyValue(C + "-y") : A.getPropertyValue(C)) : E.currentStyle.backgroundPositionX + " " + E.currentStyle.backgroundPositionY) || "0 0"),
                            x = this.format(z);
                        if ((-1 !== q.indexOf("%")) != (-1 !== x.indexOf("%")) && ((d = bl(E, "backgroundImage").replace(a5, "")), d && "none" !== d)) {
                            for (j = q.split(" "), s = x.split(" "), bn.setAttribute("src", d), w = 2; --w > -1; ) {
                                (q = j[w]),
                                    (D = -1 !== q.indexOf("%")),
                                    D !== (-1 !== s[w].indexOf("%")) && ((y = 0 === w ? E.offsetWidth - bn.width : E.offsetHeight - bn.height), (j[w] = D ? (parseFloat(q) / 100) * y + "px" : 100 * (parseFloat(q) / y) + "%"));
                            }
                            q = j.join(" ");
                        }
                        return this.parseComplex(E.style, q, x, k, B);
                    },
                    formatter: bH,
                }),
                an("backgroundSize", { defaultValue: "0 0", formatter: bH }),
                an("perspective", { defaultValue: "0px", prefix: !0 }),
                an("perspectiveOrigin", { defaultValue: "50% 50%", prefix: !0 }),
                an("transformStyle", { prefix: !0 }),
                an("backfaceVisibility", { prefix: !0 }),
                an("userSelect", { prefix: !0 }),
                an("margin", { parser: am("marginTop,marginRight,marginBottom,marginLeft") }),
                an("padding", { parser: am("paddingTop,paddingRight,paddingBottom,paddingLeft") }),
                an("clip", {
                    defaultValue: "rect(0px,0px,0px,0px)",
                    parser: function (p, k, g, b, d, m) {
                        var c, f, j;
                        return (
                            9 > aP
                                ? ((f = p.currentStyle), (j = 8 > aP ? " " : ","), (c = "rect(" + f.clipTop + j + f.clipRight + j + f.clipBottom + j + f.clipLeft + ")"), (k = this.format(k).split(",").join(j)))
                                : ((c = this.format(bl(p, this.p, aw, !1, this.dflt))), (k = this.format(k))),
                            this.parseComplex(p.style, c, k, d, m)
                        );
                    },
                }),
                an("textShadow", { defaultValue: "0px 0px 0px #999", color: !0, multi: !0 }),
                an("autoRound,strictUnits", {
                    parser: function (b, f, a, d, c) {
                        return c;
                    },
                }),
                an("border", {
                    defaultValue: "0px solid #000",
                    parser: function (d, g, c, f, h, b) {
                        return this.parseComplex(d.style, this.format(bl(d, "borderTopWidth", aw, !1, "0px") + " " + bl(d, "borderTopStyle", aw, !1, "solid") + " " + bl(d, "borderTopColor", aw, !1, "#000")), this.format(g), h, b);
                    },
                    color: !0,
                    formatter: function (a) {
                        var b = a.split(" ");
                        return b[0] + " " + (b[1] || "solid") + " " + (a.match(aR) || ["#000"])[0];
                    },
                }),
                an("borderWidth", { parser: am("borderTopWidth,borderRightWidth,borderBottomWidth,borderLeftWidth") }),
                an("float,cssFloat,styleFloat", {
                    parser: function (d, h, c, g, f) {
                        var j = d.style,
                            b = "cssFloat" in j ? "cssFloat" : "styleFloat";
                        return new ay(j, b, 0, 0, f, -1, c, !1, 0, j[b], h);
                    },
                });
            var aj = function (b) {
                var f,
                    a = this.t,
                    d = a.filter || bl(this.data, "filter") || "",
                    c = 0 | (this.s + this.c * b);
                100 === c && (-1 === d.indexOf("atrix(") && -1 === d.indexOf("radient(") && -1 === d.indexOf("oader(") ? (a.removeAttribute("filter"), (f = !bl(this.data, "filter"))) : ((a.filter = d.replace(aT, "")), (f = !0))),
                    f || (this.xn1 && (a.filter = d = d || "alpha(opacity=" + c + ")"), -1 === d.indexOf("pacity") ? (0 === c && this.xn1) || (a.filter = d + " alpha(opacity=" + c + ")") : (a.filter = d.replace(a2, "opacity=" + c)));
            };
            an("opacity,alpha,autoAlpha", {
                defaultValue: "1",
                parser: function (p, k, g, b, d, m) {
                    var c = parseFloat(bl(p, "opacity", aw, !1, "1")),
                        f = p.style,
                        j = "autoAlpha" === g;
                    return (
                        "string" == typeof k && "=" === k.charAt(1) && (k = ("-" === k.charAt(0) ? -1 : 1) * parseFloat(k.substr(2)) + c),
                        j && 1 === c && "hidden" === bl(p, "visibility", aw) && 0 !== k && (c = 0),
                        a1
                            ? (d = new ay(f, "opacity", c, k - c, d))
                            : ((d = new ay(f, "opacity", 100 * c, 100 * (k - c), d)),
                              (d.xn1 = j ? 1 : 0),
                              (f.zoom = 1),
                              (d.type = 2),
                              (d.b = "alpha(opacity=" + d.s + ")"),
                              (d.e = "alpha(opacity=" + (d.s + d.c) + ")"),
                              (d.data = p),
                              (d.plugin = m),
                              (d.setRatio = aj)),
                        j && ((d = new ay(f, "visibility", 0, 0, d, -1, null, !1, 0, 0 !== c ? "inherit" : "hidden", 0 === k ? "hidden" : "inherit")), (d.xs0 = "inherit"), b._overwriteProps.push(d.n), b._overwriteProps.push(g)),
                        d
                    );
                },
            });
            var bj = function (a, b) {
                    b && (a.removeProperty ? ("ms" === b.substr(0, 2) && (b = "M" + b.substr(1)), a.removeProperty(b.replace(a4, "-$1").toLowerCase())) : a.removeAttribute(b));
                },
                af = function (b) {
                    if (((this.t._gsClassPT = this), 1 === b || 0 === b)) {
                        this.t.setAttribute("class", 0 === b ? this.b : this.e);
                        for (var c = this.data, a = this.t.style; c; ) {
                            c.v ? (a[c.p] = c.v) : bj(a, c.p), (c = c._next);
                        }
                        1 === b && this.t._gsClassPT === this && (this.t._gsClassPT = null);
                    } else {
                        this.t.getAttribute("class") !== this.e && this.t.setAttribute("class", this.e);
                    }
                };
            an("className", {
                parser: function (A, s, b, j, x, i, k) {
                    var m,
                        z,
                        q,
                        g,
                        y,
                        w = A.getAttribute("class") || "",
                        v = A.style.cssText;
                    if (((x = j._classNamePT = new ay(A, b, 0, 0, x, 2)), (x.setRatio = af), (x.pr = -11), (aJ = !0), (x.b = w), (z = bf(A, aw)), (q = A._gsClassPT))) {
                        for (g = {}, y = q.data; y; ) {
                            (g[y.p] = 1), (y = y._next);
                        }
                        q.setRatio(1);
                    }
                    return (
                        (A._gsClassPT = x),
                        (x.e = "=" !== s.charAt(1) ? s : w.replace(RegExp("\\s*\\b" + s.substr(2) + "\\b"), "") + ("+" === s.charAt(0) ? " " + s.substr(2) : "")),
                        j._tween._duration && (A.setAttribute("class", x.e), (m = bg(A, z, bf(A), k, g)), A.setAttribute("class", w), (x.data = m.firstMPT), (A.style.cssText = v), (x = x.xfirst = j.parse(A, m.difs, x, i))),
                        x
                    );
                },
            });
            var al = function (d) {
                if ((1 === d || 0 === d) && this.data._totalTime === this.data._totalDuration && "isFromStart" !== this.data.data) {
                    var h,
                        c,
                        g,
                        f,
                        j = this.t.style,
                        b = aG.transform.parse;
                    if ("all" === this.e) {
                        (j.cssText = ""), (f = !0);
                    } else {
                        for (h = this.e.split(" ").join("").split(","), g = h.length; --g > -1; ) {
                            (c = h[g]), aG[c] && (aG[c].parse === b ? (f = !0) : (c = "transformOrigin" === c ? aS : aG[c].p)), bj(j, c);
                        }
                    }
                    f && (bj(j, ah), this.t._gsTransform && delete this.t._gsTransform);
                }
            };
            for (
                an("clearProps", {
                    parser: function (a, d, c, b, f) {
                        return (f = new ay(a, c, 0, 0, f, 2)), (f.setRatio = al), (f.e = d), (f.pr = -10), (f.data = b._tween), (aJ = !0), f;
                    },
                }),
                    aK = "bezier,throwProps,physicsProps,physics2D".split(","),
                    by = aK.length;
                by--;

            ) {
                bC(aK[by]);
            }
            (aK = aU.prototype),
                (aK._firstPT = aK._lastParsedTransform = aK._transform = null),
                (aK._onInitTween = function (u, k, a) {
                    if (!u.nodeType) {
                        return !1;
                    }
                    (this._target = u), (this._tween = a), (this._vars = k), (au = k.autoRound), (aJ = !1), (ax = k.suffixMap || aU.suffixMap), (aw = a6(u, "")), (aC = this._overwriteProps);
                    var c,
                        i,
                        s,
                        n,
                        b,
                        j,
                        r,
                        p,
                        q,
                        f = u.style;
                    if (
                        (aN && "" === f.zIndex && ((c = bl(u, "zIndex", aw)), ("auto" === c || "" === c) && this._addLazySet(f, "zIndex", 0)),
                        "string" == typeof k && ((n = f.cssText), (c = bf(u, aw)), (f.cssText = n + ";" + k), (c = bg(u, c, bf(u)).difs), !a1 && ar.test(k) && (c.opacity = parseFloat(RegExp.$1)), (k = c), (f.cssText = n)),
                        (this._firstPT = i = this.parse(u, k, null)),
                        this._transformType)
                    ) {
                        for (
                            q = 3 === this._transformType,
                                ah
                                    ? aA &&
                                      ((aN = !0),
                                      "" === f.zIndex && ((r = bl(u, "zIndex", aw)), ("auto" === r || "" === r) && this._addLazySet(f, "zIndex", 0)),
                                      aQ && this._addLazySet(f, "WebkitBackfaceVisibility", this._vars.WebkitBackfaceVisibility || (q ? "visible" : "hidden")))
                                    : (f.zoom = 1),
                                s = i;
                            s && s._next;

                        ) {
                            s = s._next;
                        }
                        (p = new ay(u, "transform", 0, 0, null, 2)), this._linkCSSP(p, null, s), (p.setRatio = q && bK ? bA : ah ? bu : ag), (p.data = this._transform || bI(u, aw, !0)), aC.pop();
                    }
                    if (aJ) {
                        for (; i; ) {
                            for (j = i._next, s = n; s && s.pr > i.pr; ) {
                                s = s._next;
                            }
                            (i._prev = s ? s._prev : b) ? (i._prev._next = i) : (n = i), (i._next = s) ? (s._prev = i) : (b = i), (i = j);
                        }
                        this._firstPT = n;
                    }
                    return !0;
                }),
                (aK.parse = function (C, w, q, k) {
                    var z,
                        j,
                        r,
                        u,
                        b,
                        B,
                        y,
                        x,
                        l,
                        s,
                        A = C.style;
                    for (z in w) {
                        (B = w[z]),
                            (j = aG[z]),
                            j
                                ? (q = j.parse(C, B, z, this, q, k, w))
                                : ((b = bl(C, z, aw) + ""),
                                  (l = "string" == typeof B),
                                  "color" === z || "fill" === z || "stroke" === z || -1 !== z.indexOf("Color") || (l && a7.test(B))
                                      ? (l || ((B = a9(B)), (B = (B.length > 3 ? "rgba(" : "rgb(") + B.join(",") + ")")), (q = ak(A, z, b, B, !0, "transparent", q, 0, k)))
                                      : !l || (-1 === B.indexOf(" ") && -1 === B.indexOf(","))
                                      ? ((r = parseFloat(b)),
                                        (y = r || 0 === r ? b.substr((r + "").length) : ""),
                                        ("" === b || "auto" === b) &&
                                            ("width" === z || "height" === z ? ((r = aE(C, z, aw)), (y = "px")) : "left" === z || "top" === z ? ((r = bB(C, z, aw)), (y = "px")) : ((r = "opacity" !== z ? 0 : 1), (y = ""))),
                                        (s = l && "=" === B.charAt(1)),
                                        s ? ((u = parseInt(B.charAt(0) + "1", 10)), (B = B.substr(2)), (u *= parseFloat(B)), (x = B.replace(aq, ""))) : ((u = parseFloat(B)), (x = l ? B.substr((u + "").length) || "" : "")),
                                        "" === x && (x = z in ax ? ax[z] : y),
                                        (B = u || 0 === u ? (s ? u + r : u) + x : w[z]),
                                        y !== x &&
                                            "" !== x &&
                                            (u || 0 === u) &&
                                            r &&
                                            ((r = aW(C, z, r, y)),
                                            "%" === x ? ((r /= aW(C, z, 100, "%") / 100), w.strictUnits !== !0 && (b = r + "%")) : "em" === x ? (r /= aW(C, z, 1, "em")) : "px" !== x && ((u = aW(C, z, u, x)), (x = "px")),
                                            s && (u || 0 === u) && (B = u + r + x)),
                                        s && (u += r),
                                        (!r && 0 !== r) || (!u && 0 !== u)
                                            ? void 0 !== A[z] && (B || ("NaN" != B + "" && null != B))
                                                ? ((q = new ay(A, z, u || r || 0, 0, q, -1, z, !1, 0, b, B)), (q.xs0 = "none" !== B || ("display" !== z && -1 === z.indexOf("Style")) ? B : b))
                                                : aZ("invalid " + z + " tween value: " + w[z])
                                            : ((q = new ay(A, z, r, u - r, q, 0, z, au !== !1 && ("px" === x || "zIndex" === z), 0, b, B)), (q.xs0 = x)))
                                      : (q = ak(A, z, b, B, !0, null, q, 0, k))),
                            k && q && !q.plugin && (q.plugin = k);
                    }
                    return q;
                }),
                (aK.setRatio = function (b) {
                    var f,
                        a,
                        d,
                        c = this._firstPT,
                        g = 0.000001;
                    if (1 !== b || (this._tween._time !== this._tween._duration && 0 !== this._tween._time)) {
                        if (b || (this._tween._time !== this._tween._duration && 0 !== this._tween._time) || this._tween._rawPrevTime === -0.000001) {
                            for (; c; ) {
                                if (((f = c.c * b + c.s), c.r ? (f = Math.round(f)) : g > f && f > -g && (f = 0), c.type)) {
                                    if (1 === c.type) {
                                        if (((d = c.l), 2 === d)) {
                                            c.t[c.p] = c.xs0 + f + c.xs1 + c.xn1 + c.xs2;
                                        } else {
                                            if (3 === d) {
                                                c.t[c.p] = c.xs0 + f + c.xs1 + c.xn1 + c.xs2 + c.xn2 + c.xs3;
                                            } else {
                                                if (4 === d) {
                                                    c.t[c.p] = c.xs0 + f + c.xs1 + c.xn1 + c.xs2 + c.xn2 + c.xs3 + c.xn3 + c.xs4;
                                                } else {
                                                    if (5 === d) {
                                                        c.t[c.p] = c.xs0 + f + c.xs1 + c.xn1 + c.xs2 + c.xn2 + c.xs3 + c.xn3 + c.xs4 + c.xn4 + c.xs5;
                                                    } else {
                                                        for (a = c.xs0 + f + c.xs1, d = 1; c.l > d; d++) {
                                                            a += c["xn" + d] + c["xs" + (d + 1)];
                                                        }
                                                        c.t[c.p] = a;
                                                    }
                                                }
                                            }
                                        }
                                    } else {
                                        -1 === c.type ? (c.t[c.p] = c.xs0) : c.setRatio && c.setRatio(b);
                                    }
                                } else {
                                    c.t[c.p] = f + c.xs0;
                                }
                                c = c._next;
                            }
                        } else {
                            for (; c; ) {
                                2 !== c.type ? (c.t[c.p] = c.b) : c.setRatio(b), (c = c._next);
                            }
                        }
                    } else {
                        for (; c; ) {
                            2 !== c.type ? (c.t[c.p] = c.e) : c.setRatio(b), (c = c._next);
                        }
                    }
                }),
                (aK._enableTransforms = function (a) {
                    (this._transform = this._transform || bI(this._target, aw, !0)), (this._transformType = (this._transform.svg && bJ) || (!a && 3 !== this._transformType) ? 2 : 3);
                });
            var aa = function () {
                (this.t[this.p] = this.e), this.data._linkCSSP(this, this._next, null, !0);
            };
            (aK._addLazySet = function (b, d, a) {
                var c = (this._firstPT = new ay(b, d, 0, 0, this._firstPT, 2));
                (c.e = a), (c.setRatio = aa), (c.data = this);
            }),
                (aK._linkCSSP = function (b, d, a, c) {
                    return (
                        b &&
                            (d && (d._prev = b),
                            b._next && (b._next._prev = b._prev),
                            b._prev ? (b._prev._next = b._next) : this._firstPT === b && ((this._firstPT = b._next), (c = !0)),
                            a ? (a._next = b) : c || null !== this._firstPT || (this._firstPT = b),
                            (b._next = d),
                            (b._prev = a)),
                        b
                    );
                }),
                (aK._kill = function (d) {
                    var a,
                        c,
                        b,
                        f = d;
                    if (d.autoAlpha || d.alpha) {
                        f = {};
                        for (c in d) {
                            f[c] = d[c];
                        }
                        (f.opacity = 1), f.autoAlpha && (f.visibility = 1);
                    }
                    return (
                        d.className &&
                            (a = this._classNamePT) &&
                            ((b = a.xfirst),
                            b && b._prev ? this._linkCSSP(b._prev, a._next, b._prev._prev) : b === this._firstPT && (this._firstPT = a._next),
                            a._next && this._linkCSSP(a._next, a._next._next, b._prev),
                            (this._classNamePT = null)),
                        av.prototype._kill.call(this, f)
                    );
                });
            var bx = function (d, h, c) {
                var g, f, j, b;
                if (d.slice) {
                    for (f = d.length; --f > -1; ) {
                        bx(d[f], h, c);
                    }
                } else {
                    for (g = d.childNodes, f = g.length; --f > -1; ) {
                        (j = g[f]), (b = j.type), j.style && (h.push(bf(j)), c && c.push(j)), (1 !== b && 9 !== b && 11 !== b) || !j.childNodes.length || bx(j, h, c);
                    }
                }
            };
            return (
                (aU.cascadeTo = function (w, j, b) {
                    var x,
                        e,
                        q,
                        d = aO.to(w, j, b),
                        g = [d],
                        k = [],
                        v = [],
                        m = [],
                        c = aO._internals.reservedProps;
                    for (w = d._targets || d.target, bx(w, k, m), d.render(j, !0), bx(w, v), d.render(0, !0), d._enabled(!0), x = m.length; --x > -1; ) {
                        if (((e = bg(m[x], k[x], v[x])), e.firstMPT)) {
                            e = e.difs;
                            for (q in b) {
                                c[q] && (e[q] = b[q]);
                            }
                            g.push(aO.to(m[x], j, e));
                        }
                    }
                    return g;
                }),
                av.activate([aU]),
                aU
            );
        },
        !0
    );
}),
    _gsScope._gsDefine && _gsScope._gsQueue.pop()(),
    (function (a) {
        var b = function () {
            return (_gsScope.GreenSockGlobals || _gsScope)[a];
        };
        "function" == typeof define && define.amd ? define(["TweenLite"], b) : "undefined" != typeof module && module.exports && (require("../TweenLite.js"), (module.exports = b()));
    })("CSSPlugin");
/*!
 * VERSION: beta 1.9.4
 * DATE: 2014-07-17
 * UPDATES AND DOCS AT: http://www.greensock.com
 *
 * @license Copyright (c) 2008-2014, GreenSock. All rights reserved.
 * This work is subject to the terms at http://www.greensock.com/terms_of_use.html or for
 * Club GreenSock members, the software agreement that was issued with your membership.
 *
 * @author: Jack Doyle, jack@greensock.com
 **/
var _gsScope = "undefined" != typeof module && module.exports && "undefined" != typeof global ? global : this || window;
(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push(function () {
    _gsScope._gsDefine(
        "easing.Back",
        ["easing.Ease"],
        function (F) {
            var z,
                w,
                G,
                b = _gsScope.GreenSockGlobals || _gsScope,
                k = b.com.greensock,
                C = 2 * Math.PI,
                j = Math.PI / 2,
                x = k._class,
                v = function (f, a) {
                    var c = x("easing." + f, function () {}, !0),
                        d = (c.prototype = new F());
                    return (d.constructor = c), (d.getRatio = a), c;
                },
                D = F.register || function () {},
                E = function (c, h, a, d) {
                    var f = x("easing." + c, { easeOut: new h(), easeIn: new a(), easeInOut: new d() }, !0);
                    return D(f, c), f;
                },
                B = function (c, d, a) {
                    (this.t = c), (this.v = d), a && ((this.next = a), (a.prev = this), (this.c = a.v - d), (this.gap = a.t - c));
                },
                g = function (f, a) {
                    var c = x(
                            "easing." + f,
                            function (e) {
                                (this._p1 = e || 0 === e ? e : 1.70158), (this._p2 = 1.525 * this._p1);
                            },
                            !0
                        ),
                        d = (c.prototype = new F());
                    return (
                        (d.constructor = c),
                        (d.getRatio = a),
                        (d.config = function (e) {
                            return new c(e);
                        }),
                        c
                    );
                },
                y = E(
                    "Back",
                    g("BackOut", function (a) {
                        return (a -= 1) * a * ((this._p1 + 1) * a + this._p1) + 1;
                    }),
                    g("BackIn", function (a) {
                        return a * a * ((this._p1 + 1) * a - this._p1);
                    }),
                    g("BackInOut", function (a) {
                        return 1 > (a *= 2) ? 0.5 * a * a * ((this._p2 + 1) * a - this._p2) : 0.5 * ((a -= 2) * a * ((this._p2 + 1) * a + this._p2) + 2);
                    })
                ),
                q = x(
                    "easing.SlowMo",
                    function (c, d, a) {
                        (d = d || 0 === d ? d : 0.7), null == c ? (c = 0.7) : c > 1 && (c = 1), (this._p = 1 !== c ? d : 0), (this._p1 = (1 - c) / 2), (this._p2 = c), (this._p3 = this._p1 + this._p2), (this._calcEnd = a === !0);
                    },
                    !0
                ),
                A = (q.prototype = new F());
            return (
                (A.constructor = q),
                (A.getRatio = function (a) {
                    var c = a + (0.5 - a) * this._p;
                    return this._p1 > a
                        ? this._calcEnd
                            ? 1 - (a = 1 - a / this._p1) * a
                            : c - (a = 1 - a / this._p1) * a * a * a * c
                        : a > this._p3
                        ? this._calcEnd
                            ? 1 - (a = (a - this._p3) / this._p1) * a
                            : c + (a - c) * (a = (a - this._p3) / this._p1) * a * a * a
                        : this._calcEnd
                        ? 1
                        : c;
                }),
                (q.ease = new q(0.7, 0.7)),
                (A.config = q.config = function (c, d, a) {
                    return new q(c, d, a);
                }),
                (z = x(
                    "easing.SteppedEase",
                    function (a) {
                        (a = a || 1), (this._p1 = 1 / a), (this._p2 = a + 1);
                    },
                    !0
                )),
                (A = z.prototype = new F()),
                (A.constructor = z),
                (A.getRatio = function (a) {
                    return 0 > a ? (a = 0) : a >= 1 && (a = 0.999999999), ((this._p2 * a) >> 0) * this._p1;
                }),
                (A.config = z.config = function (a) {
                    return new z(a);
                }),
                (w = x(
                    "easing.RoughEase",
                    function (P) {
                        P = P || {};
                        for (
                            var L,
                                U,
                                c,
                                I,
                                R,
                                H,
                                M = P.taper || "none",
                                K = [],
                                S = 0,
                                T = 0 | (P.points || 20),
                                t = T,
                                O = P.randomize !== !1,
                                J = P.clamp === !0,
                                Q = P.template instanceof F ? P.template : null,
                                N = "number" == typeof P.strength ? 0.4 * P.strength : 0.4;
                            --t > -1;

                        ) {
                            (L = O ? Math.random() : (1 / T) * t),
                                (U = Q ? Q.getRatio(L) : L),
                                "none" === M ? (c = N) : "out" === M ? ((I = 1 - L), (c = I * I * N)) : "in" === M ? (c = L * L * N) : 0.5 > L ? ((I = 2 * L), (c = 0.5 * I * I * N)) : ((I = 2 * (1 - L)), (c = 0.5 * I * I * N)),
                                O ? (U += Math.random() * c - 0.5 * c) : t % 2 ? (U += 0.5 * c) : (U -= 0.5 * c),
                                J && (U > 1 ? (U = 1) : 0 > U && (U = 0)),
                                (K[S++] = { x: L, y: U });
                        }
                        for (
                            K.sort(function (a, d) {
                                return a.x - d.x;
                            }),
                                H = new B(1, 1, null),
                                t = T;
                            --t > -1;

                        ) {
                            (R = K[t]), (H = new B(R.x, R.y, H));
                        }
                        this._prev = new B(0, 0, 0 !== H.t ? H : H.next);
                    },
                    !0
                )),
                (A = w.prototype = new F()),
                (A.constructor = w),
                (A.getRatio = function (a) {
                    var c = this._prev;
                    if (a > c.t) {
                        for (; c.next && a >= c.t; ) {
                            c = c.next;
                        }
                        c = c.prev;
                    } else {
                        for (; c.prev && c.t >= a; ) {
                            c = c.prev;
                        }
                    }
                    return (this._prev = c), c.v + ((a - c.t) / c.gap) * c.c;
                }),
                (A.config = function (a) {
                    return new w(a);
                }),
                (w.ease = new w()),
                E(
                    "Bounce",
                    v("BounceOut", function (a) {
                        return 1 / 2.75 > a ? 7.5625 * a * a : 2 / 2.75 > a ? 7.5625 * (a -= 1.5 / 2.75) * a + 0.75 : 2.5 / 2.75 > a ? 7.5625 * (a -= 2.25 / 2.75) * a + 0.9375 : 7.5625 * (a -= 2.625 / 2.75) * a + 0.984375;
                    }),
                    v("BounceIn", function (a) {
                        return 1 / 2.75 > (a = 1 - a)
                            ? 1 - 7.5625 * a * a
                            : 2 / 2.75 > a
                            ? 1 - (7.5625 * (a -= 1.5 / 2.75) * a + 0.75)
                            : 2.5 / 2.75 > a
                            ? 1 - (7.5625 * (a -= 2.25 / 2.75) * a + 0.9375)
                            : 1 - (7.5625 * (a -= 2.625 / 2.75) * a + 0.984375);
                    }),
                    v("BounceInOut", function (a) {
                        var c = 0.5 > a;
                        return (
                            (a = c ? 1 - 2 * a : 2 * a - 1),
                            (a = 1 / 2.75 > a ? 7.5625 * a * a : 2 / 2.75 > a ? 7.5625 * (a -= 1.5 / 2.75) * a + 0.75 : 2.5 / 2.75 > a ? 7.5625 * (a -= 2.25 / 2.75) * a + 0.9375 : 7.5625 * (a -= 2.625 / 2.75) * a + 0.984375),
                            c ? 0.5 * (1 - a) : 0.5 * a + 0.5
                        );
                    })
                ),
                E(
                    "Circ",
                    v("CircOut", function (a) {
                        return Math.sqrt(1 - (a -= 1) * a);
                    }),
                    v("CircIn", function (a) {
                        return -(Math.sqrt(1 - a * a) - 1);
                    }),
                    v("CircInOut", function (a) {
                        return 1 > (a *= 2) ? -0.5 * (Math.sqrt(1 - a * a) - 1) : 0.5 * (Math.sqrt(1 - (a -= 2) * a) + 1);
                    })
                ),
                (G = function (f, a, c) {
                    var d = x(
                            "easing." + f,
                            function (i, l) {
                                (this._p1 = i || 1), (this._p2 = l || c), (this._p3 = (this._p2 / C) * (Math.asin(1 / this._p1) || 0));
                            },
                            !0
                        ),
                        h = (d.prototype = new F());
                    return (
                        (h.constructor = d),
                        (h.getRatio = a),
                        (h.config = function (i, l) {
                            return new d(i, l);
                        }),
                        d
                    );
                }),
                E(
                    "Elastic",
                    G(
                        "ElasticOut",
                        function (a) {
                            return this._p1 * Math.pow(2, -10 * a) * Math.sin(((a - this._p3) * C) / this._p2) + 1;
                        },
                        0.3
                    ),
                    G(
                        "ElasticIn",
                        function (a) {
                            return -(this._p1 * Math.pow(2, 10 * (a -= 1)) * Math.sin(((a - this._p3) * C) / this._p2));
                        },
                        0.3
                    ),
                    G(
                        "ElasticInOut",
                        function (a) {
                            return 1 > (a *= 2) ? -0.5 * this._p1 * Math.pow(2, 10 * (a -= 1)) * Math.sin(((a - this._p3) * C) / this._p2) : 0.5 * this._p1 * Math.pow(2, -10 * (a -= 1)) * Math.sin(((a - this._p3) * C) / this._p2) + 1;
                        },
                        0.45
                    )
                ),
                E(
                    "Expo",
                    v("ExpoOut", function (a) {
                        return 1 - Math.pow(2, -10 * a);
                    }),
                    v("ExpoIn", function (a) {
                        return Math.pow(2, 10 * (a - 1)) - 0.001;
                    }),
                    v("ExpoInOut", function (a) {
                        return 1 > (a *= 2) ? 0.5 * Math.pow(2, 10 * (a - 1)) : 0.5 * (2 - Math.pow(2, -10 * (a - 1)));
                    })
                ),
                E(
                    "Sine",
                    v("SineOut", function (a) {
                        return Math.sin(a * j);
                    }),
                    v("SineIn", function (a) {
                        return -Math.cos(a * j) + 1;
                    }),
                    v("SineInOut", function (a) {
                        return -0.5 * (Math.cos(Math.PI * a) - 1);
                    })
                ),
                x(
                    "easing.EaseLookup",
                    {
                        find: function (a) {
                            return F.map[a];
                        },
                    },
                    !0
                ),
                D(b.SlowMo, "SlowMo", "ease,"),
                D(w, "RoughEase", "ease,"),
                D(z, "SteppedEase", "ease,"),
                y
            );
        },
        !0
    );
}),
    _gsScope._gsDefine && _gsScope._gsQueue.pop()();
/*!
 * VERSION: 1.15.0
 * DATE: 2014-12-03
 * UPDATES AND DOCS AT: http://www.greensock.com
 *
 * @license Copyright (c) 2008-2014, GreenSock. All rights reserved.
 * This work is subject to the terms at http://www.greensock.com/terms_of_use.html or for
 * Club GreenSock members, the software agreement that was issued with your membership.
 *
 * @author: Jack Doyle, jack@greensock.com
 */
(function (aA, aP) {
    var aL = (aA.GreenSockGlobals = aA.GreenSockGlobals || aA);
    if (!aL.TweenLite) {
        var aB,
            aC,
            aG,
            aT,
            aF,
            aI = function (a) {
                var d,
                    b = a.split("."),
                    c = aL;
                for (d = 0; b.length > d; d++) {
                    c[b[d]] = c = c[b[d]] || {};
                }
                return c;
            },
            aM = aI("com.greensock"),
            aU = 1e-10,
            az = function (b) {
                var d,
                    a = [],
                    c = b.length;
                for (d = 0; d !== c; a.push(b[d++])) {}
                return a;
            },
            aH = function () {},
            aO = (function () {
                var a = Object.prototype.toString,
                    b = a.call([]);
                return function (c) {
                    return null != c && (c instanceof Array || ("object" == typeof c && !!c.push && a.call(c) === b));
                };
            })(),
            aR = {},
            aE = function (c, d, f, b) {
                (this.sc = aR[c] ? aR[c].sc : []), (aR[c] = this), (this.gsClass = null), (this.func = f);
                var e = [];
                (this.check = function (k) {
                    for (var j, i, a, l, n = d.length, g = n; --n > -1; ) {
                        (j = aR[d[n]] || new aE(d[n], [])).gsClass ? ((e[n] = j.gsClass), g--) : k && j.sc.push(this);
                    }
                    if (0 === g && f) {
                        for (
                            i = ("com.greensock." + c).split("."),
                                a = i.pop(),
                                l = aI(i.join("."))[a] = this.gsClass = f.apply(f, e),
                                b &&
                                    ((aL[a] = l),
                                    "function" == typeof define && define.amd
                                        ? define((aA.GreenSockAMDPath ? aA.GreenSockAMDPath + "/" : "") + c.split(".").pop(), [], function () {
                                              return l;
                                          })
                                        : c === aP && "undefined" != typeof module && module.exports && (module.exports = l)),
                                n = 0;
                            this.sc.length > n;
                            n++
                        ) {
                            this.sc[n].check();
                        }
                    }
                }),
                    this.check(!0);
            },
            aQ = (aA._gsDefine = function (b, d, a, c) {
                return new aE(b, d, a, c);
            }),
            ay = (aM._class = function (b, c, a) {
                return (
                    (c = c || function () {}),
                    aQ(
                        b,
                        [],
                        function () {
                            return c;
                        },
                        a
                    ),
                    c
                );
            });
        aQ.globals = aL;
        var aN = [0, 0, 1, 1],
            Y = [],
            av = ay(
                "easing.Ease",
                function (b, d, a, c) {
                    (this._func = b), (this._type = a || 0), (this._power = c || 0), (this._params = d ? aN.concat(d) : aN);
                },
                !0
            ),
            ax = (av.map = {}),
            ac = (av.register = function (p, h, g, q) {
                for (var b, d, j, c, f = h.split(","), k = f.length, m = (g || "easeIn,easeOut,easeInOut").split(","); --k > -1; ) {
                    for (d = f[k], b = q ? ay("easing." + d, null, !0) : aM.easing[d] || {}, j = m.length; --j > -1; ) {
                        (c = m[j]), (ax[d + "." + c] = ax[c + d] = b[c] = p.getRatio ? p : p[c] || new p());
                    }
                }
            });
        for (
            aG = av.prototype,
                aG._calcEnd = !1,
                aG.getRatio = function (b) {
                    if (this._func) {
                        return (this._params[0] = b), this._func.apply(null, this._params);
                    }
                    var d = this._type,
                        a = this._power,
                        c = 1 === d ? 1 - b : 2 === d ? b : 0.5 > b ? 2 * b : 2 * (1 - b);
                    return 1 === a ? (c *= c) : 2 === a ? (c *= c * c) : 3 === a ? (c *= c * c * c) : 4 === a && (c *= c * c * c * c), 1 === d ? 1 - c : 2 === d ? c : 0.5 > b ? c / 2 : 1 - c / 2;
                },
                aB = ["Linear", "Quad", "Cubic", "Quart", "Quint,Strong"],
                aC = aB.length;
            --aC > -1;

        ) {
            (aG = aB[aC] + ",Power" + aC), ac(new av(null, null, 1, aC), aG, "easeOut", !0), ac(new av(null, null, 2, aC), aG, "easeIn" + (0 === aC ? ",easeNone" : "")), ac(new av(null, null, 3, aC), aG, "easeInOut");
        }
        (ax.linear = aM.easing.Linear.easeIn), (ax.swing = aM.easing.Quad.easeInOut);
        var aS = ay("events.EventDispatcher", function (a) {
            (this._listeners = {}), (this._eventTarget = a || this);
        });
        (aG = aS.prototype),
            (aG.addEventListener = function (k, g, d, m, a) {
                a = a || 0;
                var b,
                    c,
                    f = this._listeners[k],
                    j = 0;
                for (null == f && (this._listeners[k] = f = []), c = f.length; --c > -1; ) {
                    (b = f[c]), b.c === g && b.s === d ? f.splice(c, 1) : 0 === j && a > b.pr && (j = c + 1);
                }
                f.splice(j, 0, { c: g, s: d, up: m, pr: a }), this !== aT || aF || aT.wake();
            }),
            (aG.removeEventListener = function (b, d) {
                var a,
                    c = this._listeners[b];
                if (c) {
                    for (a = c.length; --a > -1; ) {
                        if (c[a].c === d) {
                            return c.splice(a, 1), void 0;
                        }
                    }
                }
            }),
            (aG.dispatchEvent = function (b) {
                var f,
                    a,
                    c,
                    d = this._listeners[b];
                if (d) {
                    for (f = d.length, a = this._eventTarget; --f > -1; ) {
                        (c = d[f]), c && (c.up ? c.c.call(c.s || a, { type: b, target: a }) : c.c.call(c.s || a));
                    }
                }
            });
        var aJ = aA.requestAnimationFrame,
            ar = aA.cancelAnimationFrame,
            Z =
                Date.now ||
                function () {
                    return new Date().getTime();
                },
            aw = Z();
        for (aB = ["ms", "moz", "webkit", "o"], aC = aB.length; --aC > -1 && !aJ; ) {
            (aJ = aA[aB[aC] + "RequestAnimationFrame"]), (ar = aA[aB[aC] + "CancelAnimationFrame"] || aA[aB[aC] + "CancelRequestAnimationFrame"]);
        }
        ay("Ticker", function (A, q) {
            var k,
                B,
                a,
                g,
                j,
                m = this,
                z = Z(),
                o = q !== !1 && aJ,
                x = 500,
                b = 33,
                w = "tick",
                y = function (d) {
                    var f,
                        c,
                        h = Z() - aw;
                    h > x && (z += h - b), (aw += h), (m.time = (aw - z) / 1000), (f = m.time - j), (!k || f > 0 || d === !0) && (m.frame++, (j += f + (f >= g ? 0.004 : g - f)), (c = !0)), d !== !0 && (a = B(y)), c && m.dispatchEvent(w);
                };
            aS.call(m),
                (m.time = m.frame = 0),
                (m.tick = function () {
                    y(!0);
                }),
                (m.lagSmoothing = function (c, d) {
                    (x = c || 1 / aU), (b = Math.min(d, x, 0));
                }),
                (m.sleep = function () {
                    null != a && (o && ar ? ar(a) : clearTimeout(a), (B = aH), (a = null), m === aT && (aF = !1));
                }),
                (m.wake = function () {
                    null !== a ? m.sleep() : m.frame > 10 && (aw = Z() - x + 5),
                        (B =
                            0 === k
                                ? aH
                                : o && aJ
                                ? aJ
                                : function (c) {
                                      return setTimeout(c, 0 | (1000 * (j - m.time) + 1));
                                  }),
                        m === aT && (aF = !0),
                        y(2);
                }),
                (m.fps = function (c) {
                    return arguments.length ? ((k = c), (g = 1 / (k || 60)), (j = this.time + g), m.wake(), void 0) : k;
                }),
                (m.useRAF = function (c) {
                    return arguments.length ? (m.sleep(), (o = c), m.fps(k), void 0) : o;
                }),
                m.fps(A),
                setTimeout(function () {
                    o && (!a || 5 > m.frame) && m.useRAF(!1);
                }, 1500);
        }),
            (aG = aM.Ticker.prototype = new aM.events.EventDispatcher()),
            (aG.constructor = aM.Ticker);
        var aa = ay("core.Animation", function (b, c) {
            if (
                ((this.vars = c = c || {}),
                (this._duration = this._totalDuration = b || 0),
                (this._delay = Number(c.delay) || 0),
                (this._timeScale = 1),
                (this._active = c.immediateRender === !0),
                (this.data = c.data),
                (this._reversed = c.reversed === !0),
                aq)
            ) {
                aF || aT.wake();
                var a = this.vars.useFrames ? aD : aq;
                a.add(this, a._time), this.vars.paused && this.paused(!0);
            }
        });
        (aT = aa.ticker = new aM.Ticker()),
            (aG = aa.prototype),
            (aG._dirty = aG._gc = aG._initted = aG._paused = !1),
            (aG._totalTime = aG._time = 0),
            (aG._rawPrevTime = -1),
            (aG._next = aG._last = aG._onUpdate = aG._timeline = aG.timeline = null),
            (aG._paused = !1);
        var ap = function () {
            aF && Z() - aw > 2000 && aT.wake(), setTimeout(ap, 2000);
        };
        ap(),
            (aG.play = function (a, b) {
                return null != a && this.seek(a, b), this.reversed(!1).paused(!1);
            }),
            (aG.pause = function (a, b) {
                return null != a && this.seek(a, b), this.paused(!0);
            }),
            (aG.resume = function (a, b) {
                return null != a && this.seek(a, b), this.paused(!1);
            }),
            (aG.seek = function (a, b) {
                return this.totalTime(Number(a), b !== !1);
            }),
            (aG.restart = function (a, b) {
                return this.reversed(!1)
                    .paused(!1)
                    .totalTime(a ? -this._delay : 0, b !== !1, !0);
            }),
            (aG.reverse = function (a, b) {
                return null != a && this.seek(a || this.totalDuration(), b), this.reversed(!0).paused(!1);
            }),
            (aG.render = function () {}),
            (aG.invalidate = function () {
                return (this._time = this._totalTime = 0), (this._initted = this._gc = !1), (this._rawPrevTime = -1), (this._gc || !this.timeline) && this._enabled(!0), this;
            }),
            (aG.isActive = function () {
                var b,
                    c = this._timeline,
                    a = this._startTime;
                return !c || (!this._gc && !this._paused && c.isActive() && (b = c.rawTime()) >= a && a + this.totalDuration() / this._timeScale > b);
            }),
            (aG._enabled = function (a, b) {
                return (
                    aF || aT.wake(),
                    (this._gc = !a),
                    (this._active = this.isActive()),
                    b !== !0 && (a && !this.timeline ? this._timeline.add(this, this._startTime - this._delay) : !a && this.timeline && this._timeline._remove(this, !0)),
                    !1
                );
            }),
            (aG._kill = function () {
                return this._enabled(!1, !1);
            }),
            (aG.kill = function (a, b) {
                return this._kill(a, b), this;
            }),
            (aG._uncache = function (a) {
                for (var b = a ? this : this.timeline; b; ) {
                    (b._dirty = !0), (b = b.timeline);
                }
                return this;
            }),
            (aG._swapSelfInParams = function (b) {
                for (var c = b.length, a = b.concat(); --c > -1; ) {
                    "{self}" === b[c] && (a[c] = this);
                }
                return a;
            }),
            (aG.eventCallback = function (b, f, a, c) {
                if ("on" === (b || "").substr(0, 2)) {
                    var d = this.vars;
                    if (1 === arguments.length) {
                        return d[b];
                    }
                    null == f ? delete d[b] : ((d[b] = f), (d[b + "Params"] = aO(a) && -1 !== a.join("").indexOf("{self}") ? this._swapSelfInParams(a) : a), (d[b + "Scope"] = c)), "onUpdate" === b && (this._onUpdate = f);
                }
                return this;
            }),
            (aG.delay = function (a) {
                return arguments.length ? (this._timeline.smoothChildTiming && this.startTime(this._startTime + a - this._delay), (this._delay = a), this) : this._delay;
            }),
            (aG.duration = function (a) {
                return arguments.length
                    ? ((this._duration = this._totalDuration = a),
                      this._uncache(!0),
                      this._timeline.smoothChildTiming && this._time > 0 && this._time < this._duration && 0 !== a && this.totalTime(this._totalTime * (a / this._duration), !0),
                      this)
                    : ((this._dirty = !1), this._duration);
            }),
            (aG.totalDuration = function (a) {
                return (this._dirty = !1), arguments.length ? this.duration(a) : this._totalDuration;
            }),
            (aG.time = function (a, b) {
                return arguments.length ? (this._dirty && this.totalDuration(), this.totalTime(a > this._duration ? this._duration : a, b)) : this._time;
            }),
            (aG.totalTime = function (b, f, a) {
                if ((aF || aT.wake(), !arguments.length)) {
                    return this._totalTime;
                }
                if (this._timeline) {
                    if ((0 > b && !a && (b += this.totalDuration()), this._timeline.smoothChildTiming)) {
                        this._dirty && this.totalDuration();
                        var c = this._totalDuration,
                            d = this._timeline;
                        if ((b > c && !a && (b = c), (this._startTime = (this._paused ? this._pauseTime : d._time) - (this._reversed ? c - b : b) / this._timeScale), d._dirty || this._uncache(!1), d._timeline)) {
                            for (; d._timeline; ) {
                                d._timeline._time !== (d._startTime + d._totalTime) / d._timeScale && d.totalTime(d._totalTime, !0), (d = d._timeline);
                            }
                        }
                    }
                    this._gc && this._enabled(!0, !1), (this._totalTime !== b || 0 === this._duration) && (this.render(b, f, !1), au.length && af());
                }
                return this;
            }),
            (aG.progress = aG.totalProgress = function (a, b) {
                return arguments.length ? this.totalTime(this.duration() * a, b) : this._time / this.duration();
            }),
            (aG.startTime = function (a) {
                return arguments.length ? (a !== this._startTime && ((this._startTime = a), this.timeline && this.timeline._sortChildren && this.timeline.add(this, a - this._delay)), this) : this._startTime;
            }),
            (aG.endTime = function (a) {
                return this._startTime + (0 != a ? this.totalDuration() : this.duration()) / this._timeScale;
            }),
            (aG.timeScale = function (b) {
                if (!arguments.length) {
                    return this._timeScale;
                }
                if (((b = b || aU), this._timeline && this._timeline.smoothChildTiming)) {
                    var c = this._pauseTime,
                        a = c || 0 === c ? c : this._timeline.totalTime();
                    this._startTime = a - ((a - this._startTime) * this._timeScale) / b;
                }
                return (this._timeScale = b), this._uncache(!1);
            }),
            (aG.reversed = function (a) {
                return arguments.length
                    ? (a != this._reversed && ((this._reversed = a), this.totalTime(this._timeline && !this._timeline.smoothChildTiming ? this.totalDuration() - this._totalTime : this._totalTime, !0)), this)
                    : this._reversed;
            }),
            (aG.paused = function (b) {
                if (!arguments.length) {
                    return this._paused;
                }
                if (b != this._paused && this._timeline) {
                    aF || b || aT.wake();
                    var d = this._timeline,
                        a = d.rawTime(),
                        c = a - this._pauseTime;
                    !b && d.smoothChildTiming && ((this._startTime += c), this._uncache(!1)),
                        (this._pauseTime = b ? a : null),
                        (this._paused = b),
                        (this._active = this.isActive()),
                        !b && 0 !== c && this._initted && this.duration() && this.render(d.smoothChildTiming ? this._totalTime : (a - this._startTime) / this._timeScale, !0, !0);
                }
                return this._gc && !b && this._enabled(!0, !1), this;
            });
        var ao = ay("core.SimpleTimeline", function (a) {
            aa.call(this, 0, a), (this.autoRemoveChildren = this.smoothChildTiming = !0);
        });
        (aG = ao.prototype = new aa()),
            (aG.constructor = ao),
            (aG.kill()._gc = !1),
            (aG._first = aG._last = aG._recent = null),
            (aG._sortChildren = !1),
            (aG.add = aG.insert = function (b, d) {
                var a, c;
                if (
                    ((b._startTime = Number(d || 0) + b._delay),
                    b._paused && this !== b._timeline && (b._pauseTime = b._startTime + (this.rawTime() - b._startTime) / b._timeScale),
                    b.timeline && b.timeline._remove(b, !0),
                    (b.timeline = b._timeline = this),
                    b._gc && b._enabled(!0, !0),
                    (a = this._last),
                    this._sortChildren)
                ) {
                    for (c = b._startTime; a && a._startTime > c; ) {
                        a = a._prev;
                    }
                }
                return a ? ((b._next = a._next), (a._next = b)) : ((b._next = this._first), (this._first = b)), b._next ? (b._next._prev = b) : (this._last = b), (b._prev = a), (this._recent = b), this._timeline && this._uncache(!0), this;
            }),
            (aG._remove = function (a, b) {
                return (
                    a.timeline === this &&
                        (b || a._enabled(!1, !0),
                        a._prev ? (a._prev._next = a._next) : this._first === a && (this._first = a._next),
                        a._next ? (a._next._prev = a._prev) : this._last === a && (this._last = a._prev),
                        (a._next = a._prev = a.timeline = null),
                        a === this._recent && (this._recent = this._last),
                        this._timeline && this._uncache(!0)),
                    this
                );
            }),
            (aG.render = function (b, f, a) {
                var c,
                    d = this._first;
                for (this._totalTime = this._time = this._rawPrevTime = b; d; ) {
                    (c = d._next),
                        (d._active || (b >= d._startTime && !d._paused)) &&
                            (d._reversed ? d.render((d._dirty ? d.totalDuration() : d._totalDuration) - (b - d._startTime) * d._timeScale, f, a) : d.render((b - d._startTime) * d._timeScale, f, a)),
                        (d = c);
                }
            }),
            (aG.rawTime = function () {
                return aF || aT.wake(), this._totalTime;
            });
        var aj = ay(
                "TweenLite",
                function (h, d, f) {
                    if ((aa.call(this, d, f), (this.render = aj.prototype.render), null == h)) {
                        throw "Cannot tween a null target.";
                    }
                    this.target = h = "string" != typeof h ? h : aj.selector(h) || h;
                    var g,
                        k,
                        c,
                        j = h.jquery || (h.length && h !== aA && h[0] && (h[0] === aA || (h[0].nodeType && h[0].style && !h.nodeType))),
                        b = this.vars.overwrite;
                    if (((this._overwrite = b = null == b ? ab[aj.defaultOverwrite] : "number" == typeof b ? b >> 0 : ab[b]), (j || h instanceof Array || (h.push && aO(h))) && "number" != typeof h[0])) {
                        for (this._targets = c = az(h), this._propLookup = [], this._siblings = [], g = 0; c.length > g; g++) {
                            (k = c[g]),
                                k
                                    ? "string" != typeof k
                                        ? k.length && k !== aA && k[0] && (k[0] === aA || (k[0].nodeType && k[0].style && !k.nodeType))
                                            ? (c.splice(g--, 1), (this._targets = c = c.concat(az(k))))
                                            : ((this._siblings[g] = at(k, this, !1)), 1 === b && this._siblings[g].length > 1 && ak(k, this, null, 1, this._siblings[g]))
                                        : ((k = c[g--] = aj.selector(k)), "string" == typeof k && c.splice(g + 1, 1))
                                    : c.splice(g--, 1);
                        }
                    } else {
                        (this._propLookup = {}), (this._siblings = at(h, this, !1)), 1 === b && this._siblings.length > 1 && ak(h, this, null, 1, this._siblings);
                    }
                    (this.vars.immediateRender || (0 === d && 0 === this._delay && this.vars.immediateRender !== !1)) && ((this._time = -aU), this.render(-this._delay));
                },
                !0
            ),
            an = function (a) {
                return a && a.length && a !== aA && a[0] && (a[0] === aA || (a[0].nodeType && a[0].style && !a.nodeType));
            },
            ad = function (b, d) {
                var a,
                    c = {};
                for (a in b) {
                    al[a] || (a in d && "transform" !== a && "x" !== a && "y" !== a && "width" !== a && "height" !== a && "className" !== a && "border" !== a) || !(!X[a] || (X[a] && X[a]._autoCSS)) || ((c[a] = b[a]), delete b[a]);
                }
                b.css = c;
            };
        (aG = aj.prototype = new aa()),
            (aG.constructor = aj),
            (aG.kill()._gc = !1),
            (aG.ratio = 0),
            (aG._firstPT = aG._targets = aG._overwrittenProps = aG._startAt = null),
            (aG._notifyPluginsOfEnabled = aG._lazy = !1),
            (aj.version = "1.15.0"),
            (aj.defaultEase = aG._ease = new av(null, null, 1, 1)),
            (aj.defaultOverwrite = "auto"),
            (aj.ticker = aT),
            (aj.autoSleep = !0),
            (aj.lagSmoothing = function (a, b) {
                aT.lagSmoothing(a, b);
            }),
            (aj.selector =
                aA.$ ||
                aA.jQuery ||
                function (b) {
                    var a = aA.$ || aA.jQuery;
                    return a ? ((aj.selector = a), a(b)) : "undefined" == typeof document ? b : document.querySelectorAll ? document.querySelectorAll(b) : document.getElementById("#" === b.charAt(0) ? b.substr(1) : b);
                });
        var au = [],
            ag = {},
            ae = (aj._internals = { isArray: aO, isSelector: an, lazyTweens: au }),
            X = (aj._plugins = {}),
            am = (ae.tweenLookup = {}),
            aK = 0,
            al = (ae.reservedProps = {
                ease: 1,
                delay: 1,
                overwrite: 1,
                onComplete: 1,
                onCompleteParams: 1,
                onCompleteScope: 1,
                useFrames: 1,
                runBackwards: 1,
                startAt: 1,
                onUpdate: 1,
                onUpdateParams: 1,
                onUpdateScope: 1,
                onStart: 1,
                onStartParams: 1,
                onStartScope: 1,
                onReverseComplete: 1,
                onReverseCompleteParams: 1,
                onReverseCompleteScope: 1,
                onRepeat: 1,
                onRepeatParams: 1,
                onRepeatScope: 1,
                easeParams: 1,
                yoyo: 1,
                immediateRender: 1,
                repeat: 1,
                repeatDelay: 1,
                data: 1,
                paused: 1,
                reversed: 1,
                autoCSS: 1,
                lazy: 1,
                onOverwrite: 1,
            }),
            ab = { none: 0, all: 1, auto: 2, concurrent: 3, allOnStart: 4, preexisting: 5, true: 1, false: 0 },
            aD = (aa._rootFramesTimeline = new ao()),
            aq = (aa._rootTimeline = new ao()),
            af = (ae.lazyRender = function () {
                var a,
                    b = au.length;
                for (ag = {}; --b > -1; ) {
                    (a = au[b]), a && a._lazy !== !1 && (a.render(a._lazy[0], a._lazy[1], !0), (a._lazy = !1));
                }
                au.length = 0;
            });
        (aq._startTime = aT.time),
            (aD._startTime = aT.frame),
            (aq._active = aD._active = !0),
            setTimeout(af, 1),
            (aa._updateRoot = aj.render = function () {
                var b, c, a;
                if ((au.length && af(), aq.render((aT.time - aq._startTime) * aq._timeScale, !1, !1), aD.render((aT.frame - aD._startTime) * aD._timeScale, !1, !1), au.length && af(), !(aT.frame % 120))) {
                    for (a in am) {
                        for (c = am[a].tweens, b = c.length; --b > -1; ) {
                            c[b]._gc && c.splice(b, 1);
                        }
                        0 === c.length && delete am[a];
                    }
                    if (((a = aq._first), (!a || a._paused) && aj.autoSleep && !aD._first && 1 === aT._listeners.tick.length)) {
                        for (; a && a._paused; ) {
                            a = a._next;
                        }
                        a || aT.sleep();
                    }
                }
            }),
            aT.addEventListener("tick", aa._updateRoot);
        var at = function (b, f, a) {
                var c,
                    d,
                    g = b._gsTweenID;
                if ((am[g || (b._gsTweenID = g = "t" + aK++)] || (am[g] = { target: b, tweens: [] }), f && ((c = am[g].tweens), (c[(d = c.length)] = f), a))) {
                    for (; --d > -1; ) {
                        c[d] === f && c.splice(d, 1);
                    }
                }
                return am[g].tweens;
            },
            ah = function (d, h, c, f) {
                var g,
                    j,
                    b = d.vars.onOverwrite;
                return b && (g = b(d, h, c, f)), (b = aj.onOverwrite), b && (j = b(d, h, c, f)), g !== !1 && j !== !1;
            },
            ak = function (A, w, p, B, b) {
                var g, y, d, k;
                if (1 === B || B >= 4) {
                    for (k = b.length, g = 0; k > g; g++) {
                        if ((d = b[g]) !== w) {
                            d._gc || (ah(d, w) && d._enabled(!1, !1) && (y = !0));
                        } else {
                            if (5 === B) {
                                break;
                            }
                        }
                    }
                    return y;
                }
                var q,
                    z = w._startTime + aU,
                    j = [],
                    v = 0,
                    x = 0 === w._duration;
                for (g = b.length; --g > -1; ) {
                    (d = b[g]) === w ||
                        d._gc ||
                        d._paused ||
                        (d._timeline !== w._timeline
                            ? ((q = q || ai(w, 0, x)), 0 === ai(d, q, x) && (j[v++] = d))
                            : z >= d._startTime && d._startTime + d.totalDuration() / d._timeScale > z && (((x || !d._initted) && 2e-10 >= z - d._startTime) || (j[v++] = d)));
                }
                for (g = v; --g > -1; ) {
                    if (((d = j[g]), 2 === B && d._kill(p, A, w) && (y = !0), 2 !== B || (!d._firstPT && d._initted))) {
                        if (2 !== B && !ah(d, w)) {
                            continue;
                        }
                        d._enabled(!1, !1) && (y = !0);
                    }
                }
                return y;
            },
            ai = function (b, f, a) {
                for (var c = b._timeline, d = c._timeScale, g = b._startTime; c._timeline; ) {
                    if (((g += c._startTime), (d *= c._timeScale), c._paused)) {
                        return -100;
                    }
                    c = c._timeline;
                }
                return (g /= d), g > f ? g - f : (a && g === f) || (!b._initted && 2 * aU > g - f) ? aU : (g += b.totalDuration() / b._timeScale / d) > f + aU ? 0 : g - f - aU;
            };
        (aG._init = function () {
            var p,
                k,
                g,
                q,
                b,
                d = this.vars,
                m = this._overwrittenProps,
                c = this._duration,
                f = !!d.immediateRender,
                j = d.ease;
            if (d.startAt) {
                this._startAt && (this._startAt.render(-1, !0), this._startAt.kill()), (b = {});
                for (q in d.startAt) {
                    b[q] = d.startAt[q];
                }
                if (((b.overwrite = !1), (b.immediateRender = !0), (b.lazy = f && d.lazy !== !1), (b.startAt = b.delay = null), (this._startAt = aj.to(this.target, 0, b)), f)) {
                    if (this._time > 0) {
                        this._startAt = null;
                    } else {
                        if (0 !== c) {
                            return;
                        }
                    }
                }
            } else {
                if (d.runBackwards && 0 !== c) {
                    if (this._startAt) {
                        this._startAt.render(-1, !0), this._startAt.kill(), (this._startAt = null);
                    } else {
                        0 !== this._time && (f = !1), (g = {});
                        for (q in d) {
                            (al[q] && "autoCSS" !== q) || (g[q] = d[q]);
                        }
                        if (((g.overwrite = 0), (g.data = "isFromStart"), (g.lazy = f && d.lazy !== !1), (g.immediateRender = f), (this._startAt = aj.to(this.target, 0, g)), f)) {
                            if (0 === this._time) {
                                return;
                            }
                        } else {
                            this._startAt._init(), this._startAt._enabled(!1), this.vars.immediateRender && (this._startAt = null);
                        }
                    }
                }
            }
            if (
                ((this._ease = j = j ? (j instanceof av ? j : "function" == typeof j ? new av(j, d.easeParams) : ax[j] || aj.defaultEase) : aj.defaultEase),
                d.easeParams instanceof Array && j.config && (this._ease = j.config.apply(j, d.easeParams)),
                (this._easeType = this._ease._type),
                (this._easePower = this._ease._power),
                (this._firstPT = null),
                this._targets)
            ) {
                for (p = this._targets.length; --p > -1; ) {
                    this._initProps(this._targets[p], (this._propLookup[p] = {}), this._siblings[p], m ? m[p] : null) && (k = !0);
                }
            } else {
                k = this._initProps(this.target, this._propLookup, this._siblings, m);
            }
            if ((k && aj._onPluginEvent("_onInitAllProps", this), m && (this._firstPT || ("function" != typeof this.target && this._enabled(!1, !1))), d.runBackwards)) {
                for (g = this._firstPT; g; ) {
                    (g.s += g.c), (g.c = -g.c), (g = g._next);
                }
            }
            (this._onUpdate = d.onUpdate), (this._initted = !0);
        }),
            (aG._initProps = function (k, g, q, b) {
                var d, m, c, f, j, p;
                if (null == k) {
                    return !1;
                }
                ag[k._gsTweenID] && af(), this.vars.css || (k.style && k !== aA && k.nodeType && X.css && this.vars.autoCSS !== !1 && ad(this.vars, k));
                for (d in this.vars) {
                    if (((p = this.vars[d]), al[d])) {
                        p && (p instanceof Array || (p.push && aO(p))) && -1 !== p.join("").indexOf("{self}") && (this.vars[d] = p = this._swapSelfInParams(p, this));
                    } else {
                        if (X[d] && (f = new X[d]())._onInitTween(k, this.vars[d], this)) {
                            for (this._firstPT = j = { _next: this._firstPT, t: f, p: "setRatio", s: 0, c: 1, f: !0, n: d, pg: !0, pr: f._priority }, m = f._overwriteProps.length; --m > -1; ) {
                                g[f._overwriteProps[m]] = this._firstPT;
                            }
                            (f._priority || f._onInitAllProps) && (c = !0), (f._onDisable || f._onEnable) && (this._notifyPluginsOfEnabled = !0);
                        } else {
                            (this._firstPT = g[d] = j = { _next: this._firstPT, t: k, p: d, f: "function" == typeof k[d], n: d, pg: !1, pr: 0 }),
                                (j.s = j.f ? k[d.indexOf("set") || "function" != typeof k["get" + d.substr(3)] ? d : "get" + d.substr(3)]() : parseFloat(k[d])),
                                (j.c = "string" == typeof p && "=" === p.charAt(1) ? parseInt(p.charAt(0) + "1", 10) * Number(p.substr(2)) : Number(p) - j.s || 0);
                        }
                    }
                    j && j._next && (j._next._prev = j);
                }
                return b && this._kill(b, k)
                    ? this._initProps(k, g, q, b)
                    : this._overwrite > 1 && this._firstPT && q.length > 1 && ak(k, this, g, this._overwrite, q)
                    ? (this._kill(g, k), this._initProps(k, g, q, b))
                    : (this._firstPT && ((this.vars.lazy !== !1 && this._duration) || (this.vars.lazy && !this._duration)) && (ag[k._gsTweenID] = !0), c);
            }),
            (aG.render = function (y, v, k) {
                var z,
                    b,
                    d,
                    w,
                    c = this._time,
                    j = this._duration,
                    p = this._rawPrevTime;
                if (y >= j) {
                    (this._totalTime = this._time = j),
                        (this.ratio = this._ease._calcEnd ? this._ease.getRatio(1) : 1),
                        this._reversed || ((z = !0), (b = "onComplete")),
                        0 === j &&
                            (this._initted || !this.vars.lazy || k) &&
                            (this._startTime === this._timeline._duration && (y = 0),
                            (0 === y || 0 > p || (p === aU && "isPause" !== this.data)) && p !== y && ((k = !0), p > aU && (b = "onReverseComplete")),
                            (this._rawPrevTime = w = !v || y || p === y ? y : aU));
                } else {
                    if (1e-7 > y) {
                        (this._totalTime = this._time = 0),
                            (this.ratio = this._ease._calcEnd ? this._ease.getRatio(0) : 0),
                            (0 !== c || (0 === j && p > 0 && p !== aU)) && ((b = "onReverseComplete"), (z = this._reversed)),
                            0 > y && ((this._active = !1), 0 === j && (this._initted || !this.vars.lazy || k) && (p >= 0 && (p !== aU || "isPause" !== this.data) && (k = !0), (this._rawPrevTime = w = !v || y || p === y ? y : aU))),
                            this._initted || (k = !0);
                    } else {
                        if (((this._totalTime = this._time = y), this._easeType)) {
                            var x = y / j,
                                g = this._easeType,
                                q = this._easePower;
                            (1 === g || (3 === g && x >= 0.5)) && (x = 1 - x),
                                3 === g && (x *= 2),
                                1 === q ? (x *= x) : 2 === q ? (x *= x * x) : 3 === q ? (x *= x * x * x) : 4 === q && (x *= x * x * x * x),
                                (this.ratio = 1 === g ? 1 - x : 2 === g ? x : 0.5 > y / j ? x / 2 : 1 - x / 2);
                        } else {
                            this.ratio = this._ease.getRatio(y / j);
                        }
                    }
                }
                if (this._time !== c || k) {
                    if (!this._initted) {
                        if ((this._init(), !this._initted || this._gc)) {
                            return;
                        }
                        if (!k && this._firstPT && ((this.vars.lazy !== !1 && this._duration) || (this.vars.lazy && !this._duration))) {
                            return (this._time = this._totalTime = c), (this._rawPrevTime = p), au.push(this), (this._lazy = [y, v]), void 0;
                        }
                        this._time && !z ? (this.ratio = this._ease.getRatio(this._time / j)) : z && this._ease._calcEnd && (this.ratio = this._ease.getRatio(0 === this._time ? 0 : 1));
                    }
                    for (
                        this._lazy !== !1 && (this._lazy = !1),
                            this._active || (!this._paused && this._time !== c && y >= 0 && (this._active = !0)),
                            0 === c &&
                                (this._startAt && (y >= 0 ? this._startAt.render(y, v, k) : b || (b = "_dummyGS")),
                                this.vars.onStart && (0 !== this._time || 0 === j) && (v || this.vars.onStart.apply(this.vars.onStartScope || this, this.vars.onStartParams || Y))),
                            d = this._firstPT;
                        d;

                    ) {
                        d.f ? d.t[d.p](d.c * this.ratio + d.s) : (d.t[d.p] = d.c * this.ratio + d.s), (d = d._next);
                    }
                    this._onUpdate && (0 > y && this._startAt && y !== -0.0001 && this._startAt.render(y, v, k), v || ((this._time !== c || z) && this._onUpdate.apply(this.vars.onUpdateScope || this, this.vars.onUpdateParams || Y))),
                        b &&
                            (!this._gc || k) &&
                            (0 > y && this._startAt && !this._onUpdate && y !== -0.0001 && this._startAt.render(y, v, k),
                            z && (this._timeline.autoRemoveChildren && this._enabled(!1, !1), (this._active = !1)),
                            !v && this.vars[b] && this.vars[b].apply(this.vars[b + "Scope"] || this, this.vars[b + "Params"] || Y),
                            0 === j && this._rawPrevTime === aU && w !== aU && (this._rawPrevTime = 0));
                }
            }),
            (aG._kill = function (v, k, g) {
                if (("all" === v && (v = null), null == v && (null == k || k === this.target))) {
                    return (this._lazy = !1), this._enabled(!1, !1);
                }
                k = "string" != typeof k ? k || this._targets || this.target : aj.selector(k) || k;
                var w, b, d, m, c, f, j, p, q;
                if ((aO(k) || an(k)) && "number" != typeof k[0]) {
                    for (w = k.length; --w > -1; ) {
                        this._kill(v, k[w]) && (f = !0);
                    }
                } else {
                    if (this._targets) {
                        for (w = this._targets.length; --w > -1; ) {
                            if (k === this._targets[w]) {
                                (c = this._propLookup[w] || {}), (this._overwrittenProps = this._overwrittenProps || []), (b = this._overwrittenProps[w] = v ? this._overwrittenProps[w] || {} : "all");
                                break;
                            }
                        }
                    } else {
                        if (k !== this.target) {
                            return !1;
                        }
                        (c = this._propLookup), (b = this._overwrittenProps = v ? this._overwrittenProps || {} : "all");
                    }
                    if (c) {
                        if (((j = v || c), (p = v !== b && "all" !== b && v !== c && ("object" != typeof v || !v._tempKill)), g && (aj.onOverwrite || this.vars.onOverwrite))) {
                            for (d in j) {
                                c[d] && (q || (q = []), q.push(d));
                            }
                            if (!ah(this, g, k, q)) {
                                return !1;
                            }
                        }
                        for (d in j) {
                            (m = c[d]) &&
                                (m.pg && m.t._kill(j) && (f = !0),
                                (m.pg && 0 !== m.t._overwriteProps.length) || (m._prev ? (m._prev._next = m._next) : m === this._firstPT && (this._firstPT = m._next), m._next && (m._next._prev = m._prev), (m._next = m._prev = null)),
                                delete c[d]),
                                p && (b[d] = 1);
                        }
                        !this._firstPT && this._initted && this._enabled(!1, !1);
                    }
                }
                return f;
            }),
            (aG.invalidate = function () {
                return (
                    this._notifyPluginsOfEnabled && aj._onPluginEvent("_onDisable", this),
                    (this._firstPT = this._overwrittenProps = this._startAt = this._onUpdate = null),
                    (this._notifyPluginsOfEnabled = this._active = this._lazy = !1),
                    (this._propLookup = this._targets ? {} : []),
                    aa.prototype.invalidate.call(this),
                    this.vars.immediateRender && ((this._time = -aU), this.render(-this._delay)),
                    this
                );
            }),
            (aG._enabled = function (b, d) {
                if ((aF || aT.wake(), b && this._gc)) {
                    var a,
                        c = this._targets;
                    if (c) {
                        for (a = c.length; --a > -1; ) {
                            this._siblings[a] = at(c[a], this, !0);
                        }
                    } else {
                        this._siblings = at(this.target, this, !0);
                    }
                }
                return aa.prototype._enabled.call(this, b, d), this._notifyPluginsOfEnabled && this._firstPT ? aj._onPluginEvent(b ? "_onEnable" : "_onDisable", this) : !1;
            }),
            (aj.to = function (b, c, a) {
                return new aj(b, c, a);
            }),
            (aj.from = function (b, c, a) {
                return (a.runBackwards = !0), (a.immediateRender = 0 != a.immediateRender), new aj(b, c, a);
            }),
            (aj.fromTo = function (b, d, a, c) {
                return (c.startAt = a), (c.immediateRender = 0 != c.immediateRender && 0 != a.immediateRender), new aj(b, d, c);
            }),
            (aj.delayedCall = function (b, f, a, c, d) {
                return new aj(f, 0, {
                    delay: b,
                    onComplete: f,
                    onCompleteParams: a,
                    onCompleteScope: c,
                    onReverseComplete: f,
                    onReverseCompleteParams: a,
                    onReverseCompleteScope: c,
                    immediateRender: !1,
                    lazy: !1,
                    useFrames: d,
                    overwrite: 0,
                });
            }),
            (aj.set = function (a, b) {
                return new aj(a, 0, b);
            }),
            (aj.getTweensOf = function (b, f) {
                if (null == b) {
                    return [];
                }
                b = "string" != typeof b ? b : aj.selector(b) || b;
                var a, c, d, g;
                if ((aO(b) || an(b)) && "number" != typeof b[0]) {
                    for (a = b.length, c = []; --a > -1; ) {
                        c = c.concat(aj.getTweensOf(b[a], f));
                    }
                    for (a = c.length; --a > -1; ) {
                        for (g = c[a], d = a; --d > -1; ) {
                            g === c[d] && c.splice(a, 1);
                        }
                    }
                } else {
                    for (c = at(b).concat(), a = c.length; --a > -1; ) {
                        (c[a]._gc || (f && !c[a].isActive())) && c.splice(a, 1);
                    }
                }
                return c;
            }),
            (aj.killTweensOf = aj.killDelayedCallsTo = function (b, f, a) {
                "object" == typeof f && ((a = f), (f = !1));
                for (var c = aj.getTweensOf(b, f), d = c.length; --d > -1; ) {
                    c[d]._kill(a, b);
                }
            });
        var W = ay(
            "plugins.TweenPlugin",
            function (a, b) {
                (this._overwriteProps = (a || "").split(",")), (this._propName = this._overwriteProps[0]), (this._priority = b || 0), (this._super = W.prototype);
            },
            !0
        );
        if (
            ((aG = W.prototype),
            (W.version = "1.10.1"),
            (W.API = 2),
            (aG._firstPT = null),
            (aG._addTween = function (d, h, c, f, g, k) {
                var b, j;
                return null != f && (b = "number" == typeof f || "=" !== f.charAt(1) ? Number(f) - c : parseInt(f.charAt(0) + "1", 10) * Number(f.substr(2)))
                    ? ((this._firstPT = j = { _next: this._firstPT, t: d, p: h, s: c, c: b, f: "function" == typeof d[h], n: g || h, r: k }), j._next && (j._next._prev = j), j)
                    : void 0;
            }),
            (aG.setRatio = function (b) {
                for (var d, a = this._firstPT, c = 0.000001; a; ) {
                    (d = a.c * b + a.s), a.r ? (d = Math.round(d)) : c > d && d > -c && (d = 0), a.f ? a.t[a.p](d) : (a.t[a.p] = d), (a = a._next);
                }
            }),
            (aG._kill = function (b) {
                var d,
                    a = this._overwriteProps,
                    c = this._firstPT;
                if (null != b[this._propName]) {
                    this._overwriteProps = [];
                } else {
                    for (d = a.length; --d > -1; ) {
                        null != b[a[d]] && a.splice(d, 1);
                    }
                }
                for (; c; ) {
                    null != b[c.n] && (c._next && (c._next._prev = c._prev), c._prev ? ((c._prev._next = c._next), (c._prev = null)) : this._firstPT === c && (this._firstPT = c._next)), (c = c._next);
                }
                return !1;
            }),
            (aG._roundProps = function (b, c) {
                for (var a = this._firstPT; a; ) {
                    (b[this._propName] || (null != a.n && b[a.n.split(this._propName + "_").join("")])) && (a.r = c), (a = a._next);
                }
            }),
            (aj._onPluginEvent = function (d, h) {
                var c,
                    f,
                    g,
                    k,
                    b,
                    j = h._firstPT;
                if ("_onInitAllProps" === d) {
                    for (; j; ) {
                        for (b = j._next, f = g; f && f.pr > j.pr; ) {
                            f = f._next;
                        }
                        (j._prev = f ? f._prev : k) ? (j._prev._next = j) : (g = j), (j._next = f) ? (f._prev = j) : (k = j), (j = b);
                    }
                    j = h._firstPT = g;
                }
                for (; j; ) {
                    j.pg && "function" == typeof j.t[d] && j.t[d]() && (c = !0), (j = j._next);
                }
                return c;
            }),
            (W.activate = function (a) {
                for (var b = a.length; --b > -1; ) {
                    a[b].API === W.API && (X[new a[b]()._propName] = a[b]);
                }
                return !0;
            }),
            (aQ.plugin = function (d) {
                if (!(d && d.propName && d.init && d.API)) {
                    throw "illegal plugin definition.";
                }
                var h,
                    c = d.propName,
                    f = d.priority || 0,
                    g = d.overwriteProps,
                    k = { init: "_onInitTween", set: "setRatio", kill: "_kill", round: "_roundProps", initAll: "_onInitAllProps" },
                    b = ay(
                        "plugins." + c.charAt(0).toUpperCase() + c.substr(1) + "Plugin",
                        function () {
                            W.call(this, c, f), (this._overwriteProps = g || []);
                        },
                        d.global === !0
                    ),
                    j = (b.prototype = new W(c));
                (j.constructor = b), (b.API = d.API);
                for (h in k) {
                    "function" == typeof d[h] && (j[k[h]] = d[h]);
                }
                return (b.version = d.version), W.activate([b]), b;
            }),
            (aB = aA._gsQueue))
        ) {
            for (aC = 0; aB.length > aC; aC++) {
                aB[aC]();
            }
            for (aG in aR) {
                aR[aG].func || aA.console.log("GSAP encountered missing dependency: com.greensock." + aG);
            }
        }
        aF = !1;
    }
})("undefined" != typeof module && module.exports && "undefined" != typeof global ? global : this || window, "TweenLite");
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (function () {
        return (
            window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (a) {
                window.setTimeout(a, 1000 / 60);
            }
        );
    })();
}
window.Modernizr = (function (n, s, i) {
    var e = "2.8.3",
        l = {},
        C = s.documentElement,
        D = "modernizr",
        A = s.createElement(D),
        o = A.style,
        f,
        v = {}.toString,
        x = " -webkit- -moz- -o- -ms- ".split(" "),
        c = "Webkit Moz O ms",
        F = c.split(" "),
        p = c.toLowerCase().split(" "),
        j = {},
        d = {},
        t = {},
        z = [],
        u = z.slice,
        b,
        y = function (P, R, J, Q) {
            var I,
                O,
                L,
                M,
                H = s.createElement("div"),
                N = s.body,
                K = N || s.createElement("body");
            if (parseInt(J, 10)) {
                while (J--) {
                    L = s.createElement("div");
                    L.id = Q ? Q[J] : D + (J + 1);
                    H.appendChild(L);
                }
            }
            I = ["&#173;", '<style id="s', D, '">', P, "</style>"].join("");
            H.id = D;
            (N ? H : K).innerHTML += I;
            K.appendChild(H);
            if (!N) {
                K.style.background = "";
                K.style.overflow = "hidden";
                M = C.style.overflow;
                C.style.overflow = "hidden";
                C.appendChild(K);
            }
            O = R(H, P);
            if (!N) {
                K.parentNode.removeChild(K);
                C.style.overflow = M;
            } else {
                H.parentNode.removeChild(H);
            }
            return !!O;
        },
        r = {}.hasOwnProperty,
        B;
    if (!k(r, "undefined") && !k(r.call, "undefined")) {
        B = function (H, I) {
            return r.call(H, I);
        };
    } else {
        B = function (H, I) {
            return I in H && k(H.constructor.prototype[I], "undefined");
        };
    }
    if (!Function.prototype.bind) {
        Function.prototype.bind = function G(J) {
            var K = this;
            if (typeof K != "function") {
                throw new TypeError();
            }
            var H = u.call(arguments, 1),
                I = function () {
                    if (this instanceof I) {
                        var N = function () {};
                        N.prototype = K.prototype;
                        var M = new N();
                        var L = K.apply(M, H.concat(u.call(arguments)));
                        if (Object(L) === L) {
                            return L;
                        }
                        return M;
                    } else {
                        return K.apply(J, H.concat(u.call(arguments)));
                    }
                };
            return I;
        };
    }
    function q(H) {
        o.cssText = H;
    }
    function h(I, H) {
        return q(x.join(I + ";") + (H || ""));
    }
    function k(I, H) {
        return typeof I === H;
    }
    function m(I, H) {
        return !!~("" + I).indexOf(H);
    }
    function E(J, H) {
        for (var I in J) {
            var K = J[I];
            if (!m(K, "-") && o[K] !== i) {
                return H == "pfx" ? K : true;
            }
        }
        return false;
    }
    function w(I, L, K) {
        for (var H in I) {
            var J = L[I[H]];
            if (J !== i) {
                if (K === false) {
                    return I[H];
                }
                if (k(J, "function")) {
                    return J.bind(K || L);
                }
                return J;
            }
        }
        return false;
    }
    function a(L, H, K) {
        var I = L.charAt(0).toUpperCase() + L.slice(1),
            J = (L + " " + F.join(I + " ") + I).split(" ");
        if (k(H, "string") || k(H, "undefined")) {
            return E(J, H);
        } else {
            J = (L + " " + p.join(I + " ") + I).split(" ");
            return w(J, H, K);
        }
    }
    j.canvas = function () {
        var H = s.createElement("canvas");
        return !!(H.getContext && H.getContext("2d"));
    };
    j.canvastext = function () {
        return !!(l.canvas && k(s.createElement("canvas").getContext("2d").fillText, "function"));
    };
    j.csstransforms3d = function () {
        var H = !!a("perspective");
        if (H && "webkitPerspective" in C.style) {
            y("@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}", function (I, J) {
                H = I.offsetLeft === 9 && I.offsetHeight === 3;
            });
        }
        return H;
    };
    for (var g in j) {
        if (B(j, g)) {
            b = g.toLowerCase();
            l[b] = j[g]();
            z.push((l[b] ? "" : "no-") + b);
        }
    }
    l.addTest = function (I, J) {
        if (typeof I == "object") {
            for (var H in I) {
                if (B(I, H)) {
                    l.addTest(H, I[H]);
                }
            }
        } else {
            I = I.toLowerCase();
            if (l[I] !== i) {
                return l;
            }
            J = typeof J == "function" ? J() : J;
            if (typeof enableClasses !== "undefined" && enableClasses) {
                C.className += " " + (J ? "" : "no-") + I;
            }
            l[I] = J;
        }
        return l;
    };
    q("");
    A = f = null;
    l._version = e;
    l._prefixes = x;
    l._domPrefixes = p;
    l._cssomPrefixes = F;
    l.testProp = function (H) {
        return E([H]);
    };
    l.testAllProps = a;
    l.testStyles = y;
    return l;
})(this, this.document);
var CMUtiles =
    CMUtiles ||
    (function () {
        var e = {},
            t = ["webkit", "Moz", "ms", "O"];
        function s(x, y) {
            var w = x.style,
                u,
                v;
            y = y.charAt(0).toUpperCase() + y.slice(1);
            for (v = 0; v < t.length; v++) {
                u = t[v] + y;
                if (w[u] !== undefined) {
                    return u;
                }
            }
            if (w[y] !== undefined) {
                return y;
            }
        }
        function a(u) {
            u = u.split("+").join(" ");
            var x = {},
                w,
                v = /[?&]?([^=]+)=([^&]*)/g;
            while ((w = v.exec(u))) {
                x[decodeURIComponent(w[1])] = decodeURIComponent(w[2]);
            }
            return x;
        }
        function b(x, z, w, y) {
            var v = w - x,
                u = y - z,
                A = Math.sqrt(v * v + u * u);
            return A;
        }
        function k(v, x) {
            var w, u;
            u = document.createElement("script");
            u.type = "text/javascript";
            u.src = v;
            u.onload = x;
            w = document.getElementsByTagName("head")[0];
            w.appendChild(u);
            return u;
        }
        function q(v) {
            var u = v.parentNode;
            if (u) {
                u.removeChild(v);
            }
        }
        function l(y, D, C, x) {
            var w = y / D,
                v = C / x,
                B = y,
                u = D,
                A = 0,
                z = 0;
            if (v > w) {
                B = (0.5 + C * (D / x)) | 0;
                A = (0.5 + (y - B) / 2) | 0;
            } else {
                u = (0.5 + x * (y / C)) | 0;
                z = (0.5 + (D - u) / 2) | 0;
            }
            return { w: B, h: u, x: A, y: z };
        }
        function g(y, D, C, x) {
            var w = y / D,
                v = C / x,
                B = y,
                u = D,
                A = 0,
                z = 0;
            if (v < w) {
                B = (0.5 + C * (D / x)) | 0;
                A = (0.5 + (y - B) / 2) | 0;
            } else {
                u = (0.5 + x * (y / C)) | 0;
                z = (0.5 + (D - u) / 2) | 0;
            }
            return { w: B, h: u, x: A, y: z };
        }
        function h(v, u) {
            return (v + u * (Math.abs((v / 10) | 0) + 1)) % u;
        }
        function f(u, y, w, x, v) {
            return ((v - x) / (w - y)) * (u - y) + x;
        }
        function o(v, y, x, z) {
            var w = (v % y) * x,
                u = ((v / y) | 0) * z;
            return { x: w, y: u };
        }
        function m(w, v, x, u) {
            var z = (screen.width - x) >> 1,
                y = (screen.height - u) >> 1;
            window.open(w, v, "top=" + y + ",left=" + z + ",width=" + x + ",height=" + u);
        }
        function p(v, B) {
            var A = v.toString(),
                z = "",
                u = A.length,
                y = B + 1;
            if (u < y) {
                var x = y - u,
                    w;
                for (w = 1; w <= x; w++) {
                    z += "0";
                }
                A = z + A;
            }
            return A;
        }
        function c(x, w) {
            var v = x.toString().split(""),
                z = v.length,
                u = z / 3,
                y,
                A = u << 0;
            A = A == u ? A : A + 1;
            for (y = 1; y < A; y++) {
                v.splice(z - y * 3, 0, w);
            }
            return v.join("");
        }
        function n(u, v) {
            return (0.5 + (Math.random() * (v - u) + u)) | 0;
        }
        function r(u, v) {
            return u + Math.random() * (v - u);
        }
        function j(u) {
            return Object.prototype.toString.call(u) === "[object Array]";
        }
        function i(u) {
            return Object.prototype.toString.call(u) === "[object Object]";
        }
        function d(y) {
            var v = y.slice();
            var u = v.length;
            var x = u;
            while (x--) {
                var z = parseInt(Math.random() * u);
                var w = v[x];
                v[x] = v[z];
                v[z] = w;
            }
            return v;
        }
        e.domLoadScript = k;
        e.getFullSize = l;
        e.getFitSize = g;
        e.getInsideMax = h;
        e.openPopup = m;
        e.addZeros = p;
        e.addDots = c;
        e.getCurrent = f;
        e.getWallPosition = o;
        e.randomInteger = n;
        e.randomFloat = r;
        e.isArray = j;
        e.isObject = i;
        e.shuffle = d;
        e.removeDom = q;
        e.getQueryParams = a;
        e.vendor = s;
        e.distance = b;
        return e;
    })();
(function (c) {
    function i(s) {
        var w = Array.prototype.slice.call(arguments, 1),
            v,
            u,
            r = w.length;
        for (u = 0; u < r; u++) {
            v = typeof s[w[u]];
            if (!/^(?:function|object|unknown)$/.test(v)) {
                return false;
            }
        }
        return true;
    }
    var d = (function () {
        if (typeof document.documentElement.uniqueID !== "undefined") {
            return function (s) {
                return s.uniqueID;
            };
        }
        var r = 0;
        return function (s) {
            return s.__uniqueID || (s.__uniqueID = "uniqueID__" + r++);
        };
    })();
    var e, b;
    (function () {
        var r = {};
        e = function (s) {
            return r[s];
        };
        b = function (t, s) {
            r[t] = s;
        };
    })();
    function j(r, s) {
        return { handler: s, wrappedHandler: m(r, s) };
    }
    function m(r, s) {
        return function (t) {
            s.call(e(r), t || window.event);
        };
    }
    function k(s, r) {
        return function (w) {
            if (f[s] && f[s][r]) {
                var u = f[s][r];
                for (var v = 0, t = u.length; v < t; v++) {
                    u[v].call(this, w || window.event);
                }
            }
        };
    }
    function h(s, r, t) {
        if (!s.eventHolder) {
            s.eventHolder = [];
        }
        s.eventHolder[s.eventHolder.length] = new Array(r, t);
    }
    var a,
        l,
        g,
        p,
        q = i(document.documentElement, "addEventListener", "removeEventListener") && i(window, "addEventListener", "removeEventListener"),
        n = i(document.documentElement, "attachEvent", "detachEvent") && i(window, "attachEvent", "detachEvent"),
        o = {},
        f = {};
    g = function (t, r, u) {
        if (!t.eventHolder) {
            return false;
        } else {
            if (u) {
                for (var s = 0; s < t.eventHolder.length; s++) {
                    if (t.eventHolder[s][0] == r && String(t.eventHolder[s][1]) == String(u)) {
                        return true;
                    }
                }
            } else {
                for (var s = 0; s < t.eventHolder.length; s++) {
                    if (t.eventHolder[s][0] == r) {
                        return true;
                    }
                }
            }
        }
        return false;
    };
    p = function (t, r) {
        if (t.eventHolder) {
            var u = 0;
            for (var s = 0; s < t.eventHolder.length; s++) {
                if (t.eventHolder[s][0] == r) {
                    l(t, r, t.eventHolder[s][1]);
                    t.eventHolder.splice(s, 1);
                    u++;
                    s--;
                }
            }
            return u > 0 ? true : false;
        } else {
            return false;
        }
    };
    if (q) {
        a = function (s, r, t) {
            s.addEventListener(r, t, false);
            h(s, r, t);
        };
        l = function (s, r, t) {
            s.removeEventListener(r, t, false);
        };
    } else {
        if (n) {
            a = function (t, r, u) {
                var s = d(t);
                b(s, t);
                if (!o[s]) {
                    o[s] = {};
                }
                if (!o[s][r]) {
                    o[s][r] = [];
                }
                var v = j(s, u);
                o[s][r].push(v);
                t.attachEvent("on" + r, v.wrappedHandler);
            };
            l = function (v, s, w) {
                var u = d(v),
                    x;
                if (o[u] && o[u][s]) {
                    for (var t = 0, r = o[u][s].length; t < r; t++) {
                        x = o[u][s][t];
                        if (x && x.handler === w) {
                            v.detachEvent("on" + s, x.wrappedHandler);
                            o[u][s][t] = null;
                        }
                    }
                }
            };
        } else {
            a = function (t, r, u) {
                var s = d(t);
                if (!f[s]) {
                    f[s] = {};
                }
                if (!f[s][r]) {
                    f[s][r] = [];
                    var v = t["on" + r];
                    if (v) {
                        f[s][r].push(v);
                    }
                    t["on" + r] = k(s, r);
                }
                f[s][r].push(u);
            };
            l = function (w, t, x) {
                var v = d(w);
                if (f[v] && f[v][t]) {
                    var s = f[v][t];
                    for (var u = 0, r = s.length; u < r; u++) {
                        if (s[u] === x) {
                            s.splice(u, 1);
                        }
                    }
                }
            };
        }
    }
    c.addListener = a;
    c.removeListener = l;
    c.hasListener = g;
    c.removeListenerByType = p;
})(this);
(function () {
    function c(n, j) {
        var o;
        j = j || {};
        this.trackingClick = false;
        this.trackingClickStart = 0;
        this.targetElement = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.lastTouchIdentifier = 0;
        this.touchBoundary = j.touchBoundary || 10;
        this.layer = n;
        this.tapDelay = j.tapDelay || 200;
        if (c.notNeeded(n)) {
            return;
        }
        function p(l, i) {
            return function () {
                return l.apply(i, arguments);
            };
        }
        var h = ["onMouse", "onClick", "onTouchStart", "onTouchMove", "onTouchEnd", "onTouchCancel"];
        var m = this;
        for (var k = 0, g = h.length; k < g; k++) {
            m[h[k]] = p(m[h[k]], m);
        }
        if (b) {
            n.addEventListener("mouseover", this.onMouse, true);
            n.addEventListener("mousedown", this.onMouse, true);
            n.addEventListener("mouseup", this.onMouse, true);
        }
        n.addEventListener("click", this.onClick, true);
        n.addEventListener("touchstart", this.onTouchStart, false);
        n.addEventListener("touchmove", this.onTouchMove, false);
        n.addEventListener("touchend", this.onTouchEnd, false);
        n.addEventListener("touchcancel", this.onTouchCancel, false);
        if (!Event.prototype.stopImmediatePropagation) {
            n.removeEventListener = function (l, r, i) {
                var q = Node.prototype.removeEventListener;
                if (l === "click") {
                    q.call(n, l, r.hijacked || r, i);
                } else {
                    q.call(n, l, r, i);
                }
            };
            n.addEventListener = function (q, r, l) {
                var i = Node.prototype.addEventListener;
                if (q === "click") {
                    i.call(
                        n,
                        q,
                        r.hijacked ||
                            (r.hijacked = function (s) {
                                if (!s.propagationStopped) {
                                    r(s);
                                }
                            }),
                        l
                    );
                } else {
                    i.call(n, q, r, l);
                }
            };
        }
        if (typeof n.onclick === "function") {
            o = n.onclick;
            n.addEventListener(
                "click",
                function (i) {
                    o(i);
                },
                false
            );
            n.onclick = null;
        }
    }
    var b = navigator.userAgent.indexOf("Android") > 0;
    var f = /iP(ad|hone|od)/.test(navigator.userAgent);
    var d = f && /OS 4_\d(_\d)?/.test(navigator.userAgent);
    var e = f && /OS ([6-9]|\d{2})_\d/.test(navigator.userAgent);
    var a = navigator.userAgent.indexOf("BB10") > 0;
    c.prototype.needsClick = function (g) {
        switch (g.nodeName.toLowerCase()) {
            case "button":
            case "select":
            case "textarea":
                if (g.disabled) {
                    return true;
                }
                break;
            case "input":
                if ((f && g.type === "file") || g.disabled) {
                    return true;
                }
                break;
            case "label":
            case "video":
                return true;
        }
        return /\bneedsclick\b/.test(g.className);
    };
    c.prototype.needsFocus = function (g) {
        switch (g.nodeName.toLowerCase()) {
            case "textarea":
                return true;
            case "select":
                return !b;
            case "input":
                switch (g.type) {
                    case "button":
                    case "checkbox":
                    case "file":
                    case "image":
                    case "radio":
                    case "submit":
                        return false;
                }
                return !g.disabled && !g.readOnly;
            default:
                return /\bneedsfocus\b/.test(g.className);
        }
    };
    c.prototype.sendClick = function (h, i) {
        var g, j;
        if (document.activeElement && document.activeElement !== h) {
            document.activeElement.blur();
        }
        j = i.changedTouches[0];
        g = document.createEvent("MouseEvents");
        g.initMouseEvent(this.determineEventType(h), true, true, window, 1, j.screenX, j.screenY, j.clientX, j.clientY, false, false, false, false, 0, null);
        g.forwardedTouchEvent = true;
        h.dispatchEvent(g);
    };
    c.prototype.determineEventType = function (g) {
        if (b && g.tagName.toLowerCase() === "select") {
            return "mousedown";
        }
        return "click";
    };
    c.prototype.focus = function (g) {
        var h;
        if (f && g.setSelectionRange && g.type.indexOf("date") !== 0 && g.type !== "time") {
            h = g.value.length;
            g.setSelectionRange(h, h);
        } else {
            g.focus();
        }
    };
    c.prototype.updateScrollParent = function (h) {
        var i, g;
        i = h.fastClickScrollParent;
        if (!i || !i.contains(h)) {
            g = h;
            do {
                if (g.scrollHeight > g.offsetHeight) {
                    i = g;
                    h.fastClickScrollParent = g;
                    break;
                }
                g = g.parentElement;
            } while (g);
        }
        if (i) {
            i.fastClickLastScrollTop = i.scrollTop;
        }
    };
    c.prototype.getTargetElementFromEventTarget = function (g) {
        if (g.nodeType === Node.TEXT_NODE) {
            return g.parentNode;
        }
        return g;
    };
    c.prototype.onTouchStart = function (i) {
        var g, j, h;
        if (i.targetTouches.length > 1) {
            return true;
        }
        g = this.getTargetElementFromEventTarget(i.target);
        j = i.targetTouches[0];
        if (f) {
            h = window.getSelection();
            if (h.rangeCount && !h.isCollapsed) {
                return true;
            }
            if (!d) {
                if (j.identifier && j.identifier === this.lastTouchIdentifier) {
                    i.preventDefault();
                    return false;
                }
                this.lastTouchIdentifier = j.identifier;
                this.updateScrollParent(g);
            }
        }
        this.trackingClick = true;
        this.trackingClickStart = i.timeStamp;
        this.targetElement = g;
        this.touchStartX = j.pageX;
        this.touchStartY = j.pageY;
        if (i.timeStamp - this.lastClickTime < this.tapDelay) {
            i.preventDefault();
        }
        return true;
    };
    c.prototype.touchHasMoved = function (g) {
        var i = g.changedTouches[0],
            h = this.touchBoundary;
        if (Math.abs(i.pageX - this.touchStartX) > h || Math.abs(i.pageY - this.touchStartY) > h) {
            return true;
        }
        return false;
    };
    c.prototype.onTouchMove = function (g) {
        if (!this.trackingClick) {
            return true;
        }
        if (this.targetElement !== this.getTargetElementFromEventTarget(g.target) || this.touchHasMoved(g)) {
            this.trackingClick = false;
            this.targetElement = null;
        }
        return true;
    };
    c.prototype.findControl = function (g) {
        if (g.control !== undefined) {
            return g.control;
        }
        if (g.htmlFor) {
            return document.getElementById(g.htmlFor);
        }
        return g.querySelector("button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea");
    };
    c.prototype.onTouchEnd = function (i) {
        var k,
            j,
            h,
            m,
            l,
            g = this.targetElement;
        if (!this.trackingClick) {
            return true;
        }
        if (i.timeStamp - this.lastClickTime < this.tapDelay) {
            this.cancelNextClick = true;
            return true;
        }
        this.cancelNextClick = false;
        this.lastClickTime = i.timeStamp;
        j = this.trackingClickStart;
        this.trackingClick = false;
        this.trackingClickStart = 0;
        if (e) {
            l = i.changedTouches[0];
            g = document.elementFromPoint(l.pageX - window.pageXOffset, l.pageY - window.pageYOffset) || g;
            g.fastClickScrollParent = this.targetElement.fastClickScrollParent;
        }
        h = g.tagName.toLowerCase();
        if (h === "label") {
            k = this.findControl(g);
            if (k) {
                this.focus(g);
                if (b) {
                    return false;
                }
                g = k;
            }
        } else {
            if (this.needsFocus(g)) {
                if (i.timeStamp - j > 100 || (f && window.top !== window && h === "input")) {
                    this.targetElement = null;
                    return false;
                }
                this.focus(g);
                this.sendClick(g, i);
                if (!f || h !== "select") {
                    this.targetElement = null;
                    i.preventDefault();
                }
                return false;
            }
        }
        if (f && !d) {
            m = g.fastClickScrollParent;
            if (m && m.fastClickLastScrollTop !== m.scrollTop) {
                return true;
            }
        }
        if (!this.needsClick(g)) {
            i.preventDefault();
            this.sendClick(g, i);
        }
        return false;
    };
    c.prototype.onTouchCancel = function () {
        this.trackingClick = false;
        this.targetElement = null;
    };
    c.prototype.onMouse = function (g) {
        if (!this.targetElement) {
            return true;
        }
        if (g.forwardedTouchEvent) {
            return true;
        }
        if (!g.cancelable) {
            return true;
        }
        if (!this.needsClick(this.targetElement) || this.cancelNextClick) {
            if (g.stopImmediatePropagation) {
                g.stopImmediatePropagation();
            } else {
                g.propagationStopped = true;
            }
            g.stopPropagation();
            g.preventDefault();
            return false;
        }
        return true;
    };
    c.prototype.onClick = function (g) {
        var h;
        if (this.trackingClick) {
            this.targetElement = null;
            this.trackingClick = false;
            return true;
        }
        if (g.target.type === "submit" && g.detail === 0) {
            return true;
        }
        h = this.onMouse(g);
        if (!h) {
            this.targetElement = null;
        }
        return h;
    };
    c.prototype.destroy = function () {
        var g = this.layer;
        if (b) {
            g.removeEventListener("mouseover", this.onMouse, true);
            g.removeEventListener("mousedown", this.onMouse, true);
            g.removeEventListener("mouseup", this.onMouse, true);
        }
        g.removeEventListener("click", this.onClick, true);
        g.removeEventListener("touchstart", this.onTouchStart, false);
        g.removeEventListener("touchmove", this.onTouchMove, false);
        g.removeEventListener("touchend", this.onTouchEnd, false);
        g.removeEventListener("touchcancel", this.onTouchCancel, false);
    };
    c.notNeeded = function (h) {
        var g;
        var j;
        var i;
        if (typeof window.ontouchstart === "undefined") {
            return true;
        }
        j = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [, 0])[1];
        if (j) {
            if (b) {
                g = document.querySelector("meta[name=viewport]");
                if (g) {
                    if (g.content.indexOf("user-scalable=no") !== -1) {
                        return true;
                    }
                    if (j > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
                        return true;
                    }
                }
            } else {
                return true;
            }
        }
        if (a) {
            i = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);
            if (i[1] >= 10 && i[2] >= 3) {
                g = document.querySelector("meta[name=viewport]");
                if (g) {
                    if (g.content.indexOf("user-scalable=no") !== -1) {
                        return true;
                    }
                    if (document.documentElement.scrollWidth <= window.outerWidth) {
                        return true;
                    }
                }
            }
        }
        if (h.style.msTouchAction === "none") {
            return true;
        }
        return false;
    };
    c.attach = function (h, g) {
        return new c(h, g);
    };
    if (typeof define == "function" && typeof define.amd == "object" && define.amd) {
        define(function () {
            return c;
        });
    } else {
        if (typeof module !== "undefined" && module.exports) {
            module.exports = c.attach;
            module.exports.FastClick = c;
        } else {
            window.FastClick = c;
        }
    }
})();
var CMDetect = new (function () {
    this.isTouch = !!("ontouchstart" in window);
    this.isMouse = !!("onmousedown" in window);
    this.colors = ["#00a896", "#ea1b75", "#904199", "#204489", "#bacbe9"];
    this.APP_ID = "510775519064457";
    this.TITLE = "Material Interaction";
    this.SITE_URL = "http://material.cmiscm.com/";
    if (!Modernizr.csstransforms3d || !Modernizr.canvas || !Modernizr.canvastext) {
        this.VENDOR = "";
    } else {
        var a = window.getComputedStyle(document.documentElement, "");
        this.VENDOR = (Array.prototype.slice
            .call(a)
            .join("")
            .match(/-(moz|webkit|ms)-/) ||
            (a.OLink === "" && ["", "o"]))[1];
        if (this.VENDOR == "moz") {
            this.VENDOR = "Moz";
        }
        this.TRANSFORM = this.VENDOR + "Transform";
        this.DURATION = this.VENDOR + "TransitionDuration";
        this.ORIGIN = this.VENDOR + "TransformOrigin";
    }
})();
var UI = { item: null };
UI.PI2 = Math.PI * 2;
UI.item = function (b, a) {
    this.index = b | 0;
    this.color = a;
    this.dom = document.createElement("div");
    this.dom.id = "index-" + b;
    this.dom.className = "index-box";
    this.dom.className = "index-box";
    this.dom.style.backgroundColor = a;
    this.dom.setAttribute("data-id", b);
    this.over0 = document.createElement("div");
    this.over0.id = "index-line-0";
    this.over0.className = "index-line";
    this.over1 = document.createElement("div");
    this.over1.id = "index-line-1";
    this.over1.className = "index-line";
    this.over2 = document.createElement("div");
    this.over2.id = "index-line-2";
    this.over2.className = "index-line";
    this.over3 = document.createElement("div");
    this.over3.id = "index-line-3";
    this.over3.className = "index-line";
    this.con = document.createElement("div");
    this.con.className = "index-box-con";
    this.con.style.backgroundColor = a;
    this.dom.appendChild(this.con);
    this.dom.appendChild(this.over0);
    this.dom.appendChild(this.over1);
    this.dom.appendChild(this.over2);
    this.dom.appendChild(this.over3);
    switch (this.index) {
        case 0:
            this.curClass = SurfaceItem;
            break;
        case 1:
            this.curClass = ActionItem;
            break;
        case 2:
            this.curClass = MotionItem;
            break;
        case 3:
            this.curClass = ChangeItem;
            break;
        case 4:
            this.curClass = InteractionItem;
            break;
    }
    this.curClass.init(this.con);
    if (!CMDetect.isTouch) {
        addListener(this.dom, "mouseenter", this.onOver);
        addListener(this.dom, "mouseleave", this.onOut);
    }
    addListener(this.dom, "click", this.onClick);
    this.con.style[CMDetect.DURATION] = "0s";
    this.con.style.opacity = 0;
    this.con.style[CMDetect.TRANSFORM] = "translate3d(0px, 0px, 0px) scale3d(0.9, 0.9, 1)";
    return this;
};
UI.item.prototype = {
    setPos: function (b, c, a, d) {
        this.w = b;
        this.h = c;
        this.x = a;
        this.y = d;
        this.dom.style.width = b + "px";
        this.dom.style.height = c + "px";
        this.dom.style[CMDetect.TRANSFORM] = "translate3d(" + a + "px, " + d + "px, 0px)";
        this.curClass.setPos(b, c, a, d);
    },
    load: function (a) {
        var b = this;
        if (a > 0) {
            TweenLite.delayedCall(a, function () {
                b.show();
            });
        } else {
            b.show();
        }
    },
    hide: function () {
        this.con.style[CMDetect.DURATION] = ".3s";
        this.con.style.opacity = 0;
        this.con.style[CMDetect.TRANSFORM] = "translate3d(0px, 0px, 0px) scale3d(0.9, 0.9, 1)";
        this.over0.style[CMDetect.DURATION] = ".3s";
        this.over1.style[CMDetect.DURATION] = ".3s";
        this.over2.style[CMDetect.DURATION] = ".3s";
        this.over3.style[CMDetect.DURATION] = ".3s";
        if (CMDetect.isTouch) {
            this.over0.style[CMDetect.TRANSFORM] = "translate3d(0px, -20px, 0px)";
            this.over1.style[CMDetect.TRANSFORM] = "translate3d(20px, 0px, 0px)";
            this.over2.style[CMDetect.TRANSFORM] = "translate3d(0px, 20px, 0px)";
            this.over3.style[CMDetect.TRANSFORM] = "translate3d(-20px, 0px, 0px)";
        } else {
            this.over0.style[CMDetect.TRANSFORM] = "translate3d(0px, 0px, 0px)";
            this.over1.style[CMDetect.TRANSFORM] = "translate3d(0px, 0px, 0px)";
            this.over2.style[CMDetect.TRANSFORM] = "translate3d(0px, 0px, 0px)";
            this.over3.style[CMDetect.TRANSFORM] = "translate3d(0px, 0px, 0px)";
        }
    },
    show: function () {
        this.con.style[CMDetect.DURATION] = ".3s";
        this.con.style.opacity = 1;
        this.con.style[CMDetect.TRANSFORM] = "translate3d(0px, 0px, 0px) scale3d(1, 1, 1)";
    },
    over: function () {
        this.over0.style[CMDetect.DURATION] = ".3s";
        this.over1.style[CMDetect.DURATION] = ".3s";
        this.over2.style[CMDetect.DURATION] = ".3s";
        this.over3.style[CMDetect.DURATION] = ".3s";
        this.over0.style[CMDetect.TRANSFORM] = "translate3d(0px, -20px, 0px)";
        this.over1.style[CMDetect.TRANSFORM] = "translate3d(20px, 0px, 0px)";
        this.over2.style[CMDetect.TRANSFORM] = "translate3d(0px, 20px, 0px)";
        this.over3.style[CMDetect.TRANSFORM] = "translate3d(-20px, 0px, 0px)";
    },
    out: function () {
        this.over0.style[CMDetect.DURATION] = ".3s";
        this.over1.style[CMDetect.DURATION] = ".3s";
        this.over2.style[CMDetect.DURATION] = ".3s";
        this.over3.style[CMDetect.DURATION] = ".3s";
        this.over0.style[CMDetect.TRANSFORM] = "translate3d(0px, -40px, 0px)";
        this.over1.style[CMDetect.TRANSFORM] = "translate3d(40px, 0px, 0px)";
        this.over2.style[CMDetect.TRANSFORM] = "translate3d(0px, 40px, 0px)";
        this.over3.style[CMDetect.TRANSFORM] = "translate3d(-40px, 0px, 0px)";
    },
    onOver: function (a) {
        var b = a.currentTarget.getAttribute("data-id");
        Index.over(b);
    },
    onOut: function (a) {
        var b = a.currentTarget.getAttribute("data-id");
        Index.out(b);
    },
    onClick: function (a) {
        var b = a.currentTarget.getAttribute("data-id");
        Address.goSub(b);
    },
};
UI.ball = function (a, c, b) {
    this.x = a;
    this.y = c;
    this.vx = b;
    this.vy = b;
    return this;
};
UI.ball.prototype = {
    resize: function (a, b) {
        this.ctx = a;
        this.r = b;
    },
    draw: function () {
        if (!this.ctx) {
            return;
        }
        this.ctx.save();
        this.ctx.fillStyle = "#fcb447";
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.r, 0, UI.PI2, false);
        this.ctx.fill();
        this.ctx.restore();
    },
};
UI.wall = function () {
    this.color = "#fff";
    this.stroke = "#00a896";
    this.isDown = 0;
    this.offsetX;
    this.offsetY;
    this.shadow = 0;
    this.ctx = null;
    return this;
};
UI.wall.prototype = {
    update: function () {
        this.maxX = this.x + this.w;
        this.maxY = this.y + this.h;
        this.lineX1 = this.maxX - 22;
        this.lineX2 = this.lineX1 + 5;
        this.lineX3 = this.lineX2 + 5;
        this.lineX4 = this.lineX1 + 12;
        this.lineX5 = this.lineX4 - 5;
        this.lineY1 = this.maxY - 22;
        this.lineY2 = this.lineY1 + 5;
        this.lineY3 = this.lineY2 + 5;
        this.lineY4 = this.lineY1 + 12;
        this.lineY5 = this.lineY4 - 5;
    },
    resize: function (a) {
        this.ctx = a;
    },
    draw: function () {
        if (!this.ctx) {
            return;
        }
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.w, this.h);
        this.ctx.restore();
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.stroke;
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = "round";
        this.ctx.moveTo(this.lineX1, this.lineY1);
        this.ctx.lineTo(this.lineX4, this.lineY4);
        this.ctx.moveTo(this.lineX1, this.lineY1);
        this.ctx.lineTo(this.lineX1, this.lineY2);
        this.ctx.moveTo(this.lineX1, this.lineY1);
        this.ctx.lineTo(this.lineX2, this.lineY1);
        this.ctx.moveTo(this.lineX5, this.lineY4);
        this.ctx.lineTo(this.lineX4, this.lineY4);
        this.ctx.moveTo(this.lineX4, this.lineY5);
        this.ctx.lineTo(this.lineX4, this.lineY4);
        this.ctx.stroke();
        this.ctx.restore();
        if (this.isDown > 0) {
            this.shadow += 0.02;
            if (this.shadow > 0.25) {
                this.shadow = 0.25;
            }
        } else {
            this.shadow -= 0.02;
            if (this.shadow < 0) {
                this.shadow = 0;
            }
        }
        if (this.shadow > 0) {
            this.ctx.shadowOffsetX = 3;
            this.ctx.shadowOffsetY = 3;
            this.ctx.shadowBlur = 6;
            this.ctx.shadowColor = "rgba(0, 0, 0, " + this.shadow + ")";
        }
    },
    down: function (b, a) {
        if (b > this.x && b < this.maxX && a > this.y && a < this.maxY) {
            if (b > this.maxX - 50 && a > this.maxY - 50) {
                this.isDown = 2;
                this.offsetX = b;
                this.offsetY = a;
            } else {
                this.isDown = 1;
                this.shadow = 0;
                this.offsetX = b - this.x;
                this.offsetY = a - this.y;
            }
        }
    },
    move: function (b, a) {
        if (this.isDown == 0) {
            return;
        }
        if (this.isDown == 1) {
            this.x = b - this.offsetX;
            this.y = a - this.offsetY;
        } else {
            this.w += b - this.offsetX;
            this.h += a - this.offsetY;
            if (this.w < 80) {
                this.w = 80;
            }
            if (this.h < 80) {
                this.h = 80;
            }
            this.offsetX = b;
            this.offsetY = a;
        }
        this.update();
    },
    up: function () {
        this.isDown = 0;
    },
    checkMouse: function (b, a) {
        if (b > this.x && b < this.maxX && a > this.y && a < this.maxY) {
            if (b > this.maxX - 50 && a > this.maxY - 50) {
                Address.setCursor(2);
            } else {
                Address.setCursor(1);
            }
        } else {
            Address.setCursor(0);
        }
    },
};
UI.actionBall = function (d, b, g, c, a, f, e) {
    this.x = b;
    this.y = g;
    this.ctx = c;
    this.ballR = a;
    this.count = e;
    this.color = d;
    this.rotation = 0;
    this.update(f);
    this.friction = 0.99;
    this.hide = 0;
    return this;
};
UI.actionBall.prototype = {
    resize: function (c, e, b, a, d) {
        this.ctx = c;
        this.ballR = b;
        this.update(e);
        if (a != null) {
            this.x = a >> 1;
            this.y = d >> 1;
        }
    },
    update: function (c) {
        var a,
            b = this.ballR;
        for (a = 0; a < this.count; a++) {
            b = b >> 1;
        }
        this.r = b;
        this.vx = this.vy = c;
    },
    move: function (b, c, f) {
        if (f) {
            this.vx *= this.friction;
            this.vy *= this.friction;
        }
        this.x += this.vx;
        this.y += this.vy;
        var d = c - this.r,
            e = b - this.r,
            g = 1;
        if (f) {
            if (this.y > d) {
                this.y = d - g;
                this.vy *= -1;
            }
            if (this.y < this.r) {
                this.y = this.r + g;
                this.vy *= -1;
            }
            if (this.x > e) {
                this.x = e - g;
                this.vx *= -1;
            }
            if (this.x < this.r) {
                this.x = this.r + g;
                this.vx *= -1;
            }
        } else {
            if (this.x < -this.r || this.x > e + this.r || this.y < -this.r || this.y > d + this.r) {
                this.hide = 1;
                Action.checkHide();
            }
        }
        var a = Math.max(this.vx, this.vy) * 0.02;
        this.rotation += a;
    },
    draw: function () {
        this.ctx.save();
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.r, 0, UI.PI2, false);
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.restore();
        var d = this.r * 2,
            b = (d * 0.3) | 0,
            e = (d * 0.04) | 0,
            g = -(b >> 1),
            f = -(e >> 1),
            c = -(e >> 1),
            a = -(b >> 1);
        this.ctx.save();
        this.ctx.fillStyle = "#fff";
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.rotation * Math.PI);
        this.ctx.fillRect(g, f, b, e);
        this.ctx.fillRect(c, a, e, b);
        this.ctx.restore();
    },
};
UI.windowbox = function (a) {
    this.color = "#fff";
    this.isDown = 0;
    this.offsetX;
    this.offsetY;
    this.ctx = null;
    this.end = a;
    return this;
};
UI.windowbox.prototype = {
    update: function () {
        this.maxX = this.x + this.r;
        this.maxY = this.y + this.r;
    },
    updateSize: function (a) {
        this.r = a;
        this.update();
    },
    resize: function (b, d, a, c) {
        this.r = d;
        if (this.end) {
            if (c > a) {
                this.x = a;
                this.y = c;
            } else {
                this.x = (a - d) >> 1;
                this.y = c;
            }
        } else {
            this.ctx = b;
            if (this.x + this.r > a - 20) {
                this.x = a - this.r - 20;
            }
            if (this.y + this.r > c - 20) {
                this.y = c - this.r - 20;
            }
        }
        this.update();
    },
    draw: function () {
        if (!this.ctx) {
            return;
        }
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.r, this.r);
        this.ctx.restore();
    },
    down: function (b, a) {
        if (b > this.x && b < this.maxX && a > this.y && a < this.maxY) {
            this.isDown = 1;
            this.offsetX = b - this.x;
            this.offsetY = a - this.y;
        }
    },
    move: function (b, a) {
        if (this.isDown == 0) {
            return;
        }
        if (this.isDown == 1) {
            this.x = b - this.offsetX;
            this.y = a - this.offsetY;
        }
        this.update();
    },
    up: function () {
        this.isDown = 0;
    },
    checkMouse: function (b, a) {
        if (b > this.x && b < this.maxX && a > this.y && a < this.maxY) {
            Address.setCursor(1);
        } else {
            Address.setCursor(0);
        }
    },
};
UI.changeBall = function () {
    this.color = "rgba(255,255,255,0.12)";
    this.isDown = 0;
    this.offsetX;
    this.offsetY;
    this.ctx = null;
    return this;
};
UI.changeBall.prototype = {
    update: function () {
        this.maxX = this.x + this.r;
        this.maxY = this.y + this.r;
        this.minX = this.x - this.r;
        this.minY = this.y - this.r;
    },
    resize: function (b, d, a, c) {
        this.ctx = b;
        this.r = d;
        this.r2 = d * 2;
        if (this.maxX > a - 20) {
            this.x = a - this.r2 - 20;
        }
        if (this.maxY > c - 20) {
            this.y = c - this.r2 - 20;
        }
        this.update();
    },
    draw: function () {
        if (!this.ctx) {
            return;
        }
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.fillStyle = this.color;
        this.ctx.arc(this.x, this.y, this.r, 0, UI.PI2, false);
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.restore();
    },
    down: function (b, a) {
        if (b > this.minX && b < this.maxX && a > this.minY && a < this.maxY) {
            this.isDown = 1;
            this.offsetX = b - this.x;
            this.offsetY = a - this.y;
        }
    },
    move: function (b, a) {
        if (this.isDown == 0) {
            return;
        }
        if (this.isDown == 1) {
            this.x = b - this.offsetX;
            this.y = a - this.offsetY;
        }
        this.update();
    },
    up: function () {
        this.isDown = 0;
    },
    checkMouse: function (b, a) {
        if (b > this.minX && b < this.maxX && a > this.minY && a < this.maxY) {
            Address.setCursor(1);
        } else {
            Address.setCursor(0);
        }
    },
};
UI.plane = function (a) {
    this.color = a;
    this.ctx = null;
    this.isUsed = 0;
    this.moving = 1;
    return this;
};
UI.plane.prototype = {
    update: function () {
        this.a3 = this.tx + this.bw;
        this.a4 = this.ty;
        this.a7 = this.tx;
        this.a8 = this.ty + this.bh;
        this.b3 = this.tx + this.tw;
        this.b4 = this.ty + this.bh;
        this.b7 = this.tx + this.tw - this.bw;
        this.b8 = this.ty + this.bh + this.bh;
    },
    setting: function (c, a, b) {
        this.bw = c.bw;
        this.bh = c.bh;
        this.tw = c.tw;
        this.tx = c.tx;
        this.ty = c.ty;
        this.ctx = a;
        this.color = b;
        this.update();
    },
    resize: function (c, d, b, a, e, f) {
        this.ctx = c;
        this.bw = e;
        this.bh = f;
        this.tw = d;
        this.tx = b;
        this.ty = a;
        this.update();
    },
    draw: function () {
        if (!this.ctx) {
            return;
        }
        this.ctx.save();
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.moveTo(this.a7, this.a8);
        this.ctx.lineTo(this.a3, this.a4);
        this.ctx.lineTo(this.b3, this.b4);
        this.ctx.lineTo(this.b7, this.b8);
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.restore();
    },
    move: function () {
        this.update();
        this.draw();
    },
};
UI.share = function (c, b) {
    this.dom = c;
    var a = this.dom.getElementsByTagName("span")[0];
    if (!CMDetect.isTouch) {
        addListener(this.dom, "mouseenter", function (d) {
            TweenLite.to(a, 0.8, { css: { scale: 1.3 }, ease: Elastic.easeOut });
        });
        addListener(this.dom, "mouseleave", function (d) {
            TweenLite.to(a, 0.3, { css: { scale: 1 }, ease: Cubic.easeOut });
        });
    }
    addListener(this.dom, "click", b);
    return this;
};
UI.share.prototype = {};
var StageController =
    StageController ||
    (function () {
        var c = { stageWidth: 0, stageHeight: 0, maxWidth: 0, maxHeight: 0 },
            b = [],
            a = [],
            h;
        function g(i) {
            h = document.createElement("div");
            h.id = "check";
            document.body.appendChild(h);
            if (i) {
                c.maxWidth = i.maxw || 0;
                c.maxHeight = i.maxh || 0;
                c.minWidth = i.minw || 0;
                c.minHeight = i.minh || 0;
            }
            if (CMDetect.isTouch) {
                new FastClick(document.getElementById("root"));
            }
            window.addEventListener("resize", f, true);
            f();
            if (window.DeviceOrientationEvent) {
                window.addEventListener("orientationchange", f, false);
            }
        }
        function d(j, k) {
            var i = b.indexOf(j);
            if (i > -1) {
                return;
            }
            b.unshift(j);
            a.unshift(k);
            k();
        }
        function e(j) {
            var i = b.indexOf(j);
            if (i > -1) {
                b.splice(i, 1);
                a.splice(i, 1);
            }
        }
        function f() {
            var j = h.offsetWidth,
                l = h.offsetHeight;
            if (c.maxWidth > 0) {
                j = j > c.maxWidth ? c.maxWidth : j;
            }
            if (c.maxHeight > 0) {
                l = l > c.maxHeight ? c.maxHeight : l;
            }
            if (c.minWidth > 0) {
                j = j < c.minWidth ? c.minWidth : j;
            }
            if (c.minHeight > 0) {
                l = l < c.minHeight ? c.minHeight : l;
            }
            if (c.stageWidth == j && c.stageHeight == l) {
                return;
            }
            c.stageWidth = j;
            c.stageHeight = l;
            var k = a.length;
            while (k--) {
                a[k]();
            }
        }
        c.init = g;
        c.onResize = f;
        c.addResize = d;
        c.removeResize = e;
        return c;
    })();
var Address =
    Address ||
    (function () {
        var h = {},
            z,
            B,
            b,
            c = 0,
            l = 0,
            w = 0,
            x,
            p = true;
        function t() {
            B = document.getElementById("block");
            z = document.getElementById("root");
            b = document.createElement("div");
            b.id = "index-container";
            if (CMDetect.VENDOR != "webkit" && CMDetect.VENDOR != "Moz" && CMDetect.VENDOR != "ms") {
                CMUtiles.removeDom(B);
                z.className = "admin";
                z.innerHTML =
                    '<h1>Oops!</h1><div class="message">Material Interaction was created with HTML5 and CSS3.<br>It\'s a Chrome experiment and you can see perfectly on Chrome browser.<br>Please use <a href="http://www.google.com/chrome" target="_blank">Google Chrome browser</a>.</div>';
                return;
            }
            StageController.init({ minw: 320 });
            Index.init(z, b);
            About.init(z);
            Sub.init(z);
            Close.init(z);
            if (CMDetect.isTouch) {
                addListener(window.document, "touchstart", a);
                addListener(window.document, "touchmove", u);
                addListener(window.document, "touchend", e);
            }
            if (CMDetect.isMouse) {
                addListener(window.document, "mousedown", d);
                addListener(window.document, "mousemove", j);
                addListener(window.document, "mouseup", A);
            }
        }
        function m() {
            k();
            c = 2;
            About.show(b);
            TweenLite.delayedCall(1.9, o);
        }
        function o() {
            About.endShow();
            f();
        }
        function v() {
            k();
            About.hide();
            TweenLite.delayedCall(1.9, i);
        }
        function i() {
            z.appendChild(b);
            About.endHide();
            f();
        }
        function q(D) {
            c = 1;
            w = 0;
            k();
            About.hidePage();
            Index.goSub(D);
        }
        function g() {
            k();
            w = 0;
            if (c == 2) {
                v();
            } else {
                About.showPage(1.2);
                Sub.hide();
                x = null;
                c = 0;
                y(0);
            }
        }
        function y(D) {
            if (l == D) {
                return;
            }
            l = D;
            switch (l) {
                case 0:
                    z.className = "c-normal";
                    break;
                case 1:
                    z.className = "c-move";
                    break;
                case 2:
                    z.className = "c-resize";
                    break;
                case 3:
                    z.className = "c-slide";
                    break;
            }
        }
        function s() {
            w = 1;
        }
        function C() {
            w = 0;
        }
        function n(D) {
            x = D;
        }
        function r() {
            x = null;
        }
        function d(D) {
            if (w) {
                Sub.cancelGuide();
            }
            if (x) {
                x.downFn(D.pageX, D.pageY);
            }
        }
        function j(D) {
            if (x) {
                x.moveFn(D.pageX, D.pageY);
                x.checkMouse(D.pageX, D.pageY);
            }
        }
        function A(D) {
            if (x) {
                x.upFn();
            }
        }
        function a(D) {
            if (w) {
                Sub.cancelGuide();
            }
            var E = D.touches[0];
            if (x) {
                x.downFn(E.pageX, E.pageY);
            }
        }
        function u(D) {
            D.preventDefault();
            var E = D.touches[0];
            if (x) {
                x.moveFn(E.pageX, E.pageY);
            }
        }
        function e(D) {
            if (x) {
                x.upFn();
            }
        }
        function f() {
            p = true;
            B.style.display = "none";
        }
        function k() {
            p = false;
            B.style.display = "block";
        }
        h.init = t;
        h.able = f;
        h.unable = k;
        h.goSub = q;
        h.goClose = g;
        h.addEvent = n;
        h.removeEvent = r;
        h.showAbout = m;
        h.setCursor = y;
        h.addCancel = s;
        h.removeCancel = C;
        return h;
    })();
var Index =
    Index ||
    (function () {
        var B,
            d,
            m,
            w,
            i,
            u,
            p,
            j,
            s,
            a,
            x = 40,
            F = 80,
            z,
            I,
            e,
            E = [],
            f,
            K,
            G = 0,
            o = 1,
            v = 1;
        function H(M, L) {
            B = M;
            d = L;
            B.appendChild(d);
            var N, O;
            for (N = 0; N < 5; N++) {
                O = new UI.item(N, CMDetect.colors[N]);
                d.appendChild(O.dom);
                E.push(O);
            }
            m = document.createElement("canvas");
            m.id = "index-canvas";
            if (CMDetect.isTouch) {
                x = 20;
                F = 40;
            }
            StageController.addResize("index", t);
            if (StageController.stageWidth > 600 && StageController.stageHeight > 500) {
                f = document.createElement("div");
                f.id = "book";
                f.innerHTML =
                    '<div class="book-con"><a href="http://blog.cmiscm.com/?p=4844" target="_blank"></a><h2>Material Design Interaction</h2><p>This is a demonstration of Material Design, created by Jongmin Kim from <a href="https://material.cmiscm.com/">here</a>.</p></div><div id="close"><span></span><i></i></div>';
                document.body.appendChild(f);
                K = document.getElementById("close");
                addListener(K, "click", A);
                addListener(f, "click", A);
                TweenLite.set(f, { css: { opacity: 0 } });
                TweenLite.to(f, 0.2, { delay: 0.1, css: { opacity: 1 } });
            } else {
                Loading.init(B, m, i, u);
            }
        }
        function A(L) {
            removeListener(K, "click", A);
            removeListener(f, "click", A);
            Loading.init(B, m, i, u);
            TweenLite.to(f, 0.2, { css: { opacity: 0 }, onComplete: q });
        }
        function q() {
            CMUtiles.removeDom(f);
        }
        function n() {
            o = 0;
            CMUtiles.removeDom(m);
            About.loading();
            var L, M;
            for (L = 0; L < 5; L++) {
                M = E[L];
                M.load(L * 0.08);
            }
            TweenLite.delayedCall(0.08 * 4 + 0.3, function () {
                Address.able();
            });
        }
        function t() {
            i = StageController.stageWidth;
            u = StageController.stageHeight;
            p = Math.ceil(i / 2);
            j = Math.ceil(u / 2);
            s = Math.ceil(p / 2);
            a = Math.ceil(j / 2);
            m.width = i;
            m.height = u;
            w = m.getContext("2d");
            w.clearRect(0, 0, i, u);
            if (u > i) {
                r();
            } else {
                g();
            }
            if (o) {
                Loading.resize(w, i, u, p, j, s, a);
            }
        }
        function r() {
            E[0].setPos(i, j, 0, 0);
            E[1].setPos(p, j, 0, j);
            E[2].setPos(p, a, p, j);
            E[3].setPos(s, a, p, j + a);
            E[4].setPos(s, a, p + s, j + a);
        }
        function g() {
            E[0].setPos(p, u, 0, 0);
            E[1].setPos(p, j, p, 0);
            E[2].setPos(s, j, p, j);
            E[3].setPos(s, a, p + s, j);
            E[4].setPos(s, a, p + s, j + a);
        }
        function y(M) {
            e = M | 0;
            G = 1;
            k(M);
            var L = E[M];
            z = { x: L.x + x, y: L.y + x, w: L.w - F, h: L.h - F, color: L.color };
            I = { no: 0 };
            E[e].hide();
            TweenLite.delayedCall(0.3, c);
        }
        function c() {
            B.appendChild(m);
            TweenLite.to(z, 1, { x: 0, y: 0, w: i, h: u, alpha: 0.8, ease: Expo.easeInOut, onComplete: l });
            TweenLite.to(I, 1, { no: 0.8, ease: Cubic.easeOut });
            v = 0;
            J();
        }
        function l() {
            G = 0;
            v = 1;
            Sub.show(e);
            CMUtiles.removeDom(m);
            CMUtiles.removeDom(d);
            w.clearRect(0, 0, i, u);
            StageController.removeResize("index");
        }
        function J() {
            if (v) {
                return;
            }
            requestAnimationFrame(J);
            w.clearRect(0, 0, i, u);
            w.fillStyle = "rgba(0,0,0," + I.no + ")";
            w.fillRect(0, 0, i, u);
            w.fillStyle = z.color;
            w.fillRect(z.x, z.y, z.w, z.h);
        }
        function h(M) {
            StageController.addResize("index", t);
            var L = E[M];
            B.appendChild(d);
            B.appendChild(m);
            z = { x: 0, y: 0, w: i, h: u, color: L.color };
            TweenLite.to(z, 1, { x: L.x + x, y: L.y + x, w: L.w - F, h: L.h - F, alpha: 0.8, ease: Expo.easeInOut, onComplete: b });
            I.no = 0.8;
            TweenLite.to(I, 1, { no: 0, ease: Cubic.easeIn });
            v = 0;
            J();
        }
        function b() {
            CMUtiles.removeDom(m);
            E[e].show();
            k(-1);
            Address.able();
        }
        function D(L) {
            if (G) {
                return;
            }
            k(L);
        }
        function C(L) {
            if (G) {
                return;
            }
            k(-1);
        }
        function k(N) {
            var L, M;
            for (L = 0; L < 5; L++) {
                M = E[L];
                if (L == N) {
                    M.over();
                } else {
                    M.out();
                }
            }
        }
        return { init: H, over: D, out: C, goSub: y, goBack: h, endLoad: n };
    })();
var Sub =
    Sub ||
    (function () {
        var s,
            l,
            d,
            q,
            j,
            k,
            b,
            i,
            p,
            t = [1, 1, 1, 1, 1],
            c = 1;
        function n(u) {
            s = u;
            l = document.createElement("div");
            l.id = "sub-container";
            d = document.createElement("canvas");
            d.id = "sub-canvas";
            q = d.getContext("2d");
            j = document.createElement("canvas");
            j.id = "sub-guide";
            k = j.getContext("2d");
            Surface.init(l, d, q, j, k);
            Action.init(l, d, q, j, k);
            Motion.init(l, d, q, j, k);
            Change.init(l, d, q, j, k);
            Interaction.init(l, d, q, j, k);
        }
        function r(u) {
            i = u | 0;
            b = CMDetect.colors[i];
            l.style.backgroundColor = b;
            s.appendChild(l);
            switch (i) {
                case 0:
                    p = Surface;
                    break;
                case 1:
                    p = Action;
                    break;
                case 2:
                    p = Motion;
                    break;
                case 3:
                    p = Change;
                    break;
                case 4:
                    p = Interaction;
                    break;
            }
            p.ready(t[i]);
            t[i] = 0;
            TweenLite.delayedCall(0.1, m);
        }
        function m() {
            var u = p.show();
            TweenLite.delayedCall(u, o);
        }
        function o() {
            Close.show(0.6, i);
            p.endShow();
            Address.addEvent(p);
            Address.able();
        }
        function g() {
            Close.hide();
            p.hide();
        }
        function e() {
            Index.goBack(i);
            CMUtiles.removeDom(l);
            p.dispose();
        }
        function f() {
            l.appendChild(j);
            TweenLite.to(j, 0.6, {
                delay: 1,
                css: { opacity: 1 },
                ease: Cubic.easeOut,
                onStart: function () {
                    Address.addCancel();
                },
            });
            TweenLite.delayedCall(3, h);
        }
        function h() {
            Address.removeCancel();
            TweenLite.to(j, 0.3, {
                css: { opacity: 0 },
                ease: Cubic.easeOut,
                onComplete: function () {
                    CMUtiles.removeDom(j);
                },
            });
        }
        function a() {
            TweenLite.killDelayedCallsTo(o);
            TweenLite.killDelayedCallsTo(h);
            TweenLite.killTweensOf(j);
            h();
            TweenLite.delayedCall(0.3, o);
        }
        return { init: n, show: r, hide: g, endHide: e, showGuide: f, cancelGuide: a };
    })();
var About =
    About ||
    (function () {
        var x,
            B,
            P,
            H,
            O,
            a,
            y,
            E,
            D,
            q,
            p,
            h,
            f,
            m,
            t,
            N,
            K,
            i,
            g,
            z,
            k = 1.4,
            e = 100,
            C = 70,
            b,
            u = 0;
        function I(Q) {
            x = Q;
            P = document.getElementById("about");
            y = document.createElement("div");
            y.id = "page-flip";
            E = document.createElement("div");
            E.className = "flip";
            D = document.createElement("div");
            D.className = "flip";
            q = document.createElement("div");
            q.className = "page";
            p = document.createElement("div");
            p.className = "page";
            h = document.createElement("div");
            h.className = "page-con page-con-1";
            f = document.createElement("div");
            f.className = "page-con page-con-2";
            q.appendChild(h);
            E.appendChild(q);
            p.appendChild(f);
            D.appendChild(p);
            y.appendChild(E);
            y.appendChild(D);
            O = document.getElementById("about-logo");
            B = document.getElementById("about-button");
            H = B.getElementsByClassName("logo")[0];
            a = B.getElementsByTagName("span")[0];
            addListener(B, "click", n);
            new UI.share(P.getElementsByClassName("twitter")[0], d);
            new UI.share(P.getElementsByClassName("facebook")[0], c);
            new UI.share(P.getElementsByClassName("gplus")[0], F);
            new UI.share(P.getElementsByClassName("pinterest")[0], v);
            CMUtiles.removeDom(P);
            StageController.addResize("About", r);
        }
        function r() {
            m = StageController.stageWidth;
            t = StageController.stageHeight;
            var R = CMUtiles.distance(0, 0, m, t),
                Q = (R * 0.1) | 0;
            if (Q < 40) {
                Q = 40;
            } else {
                if (Q > 100) {
                    Q = 100;
                }
            }
            e = Q;
            C = ((e - 40) * 0.7 + 29) | 0;
            N = R << 1;
            K = t + N;
            i = m + N + C;
            g = R;
            z = i + (m - C);
            B.style.width = e + "px";
            B.style.height = e + "px";
            B.style[CMDetect.ORIGIN] = e + "px 0px";
            O.style.width = e + "px";
            O.style.height = e + "px";
        }
        function L() {
            B.style[CMDetect.TRANSFORM] = "translate3d(0px, 0px, 0px) scale3d(0, 0, 1)";
            B.style.visibility = "visible";
            J(0.5);
        }
        function J(Q) {
            TweenLite.delayedCall(Q, function () {
                B.style[CMDetect.DURATION] = ".3s";
                B.style[CMDetect.TRANSFORM] = "translate3d(0px, 0px, 0px) scale3d(1, 1, 1)";
            });
            TweenLite.delayedCall(Q + 0.3, function () {
                H.style.opacity = 1;
            });
        }
        function o() {
            H.style.opacity = 0;
            TweenLite.delayedCall(0.2, function () {
                B.style[CMDetect.DURATION] = ".3s";
                B.style[CMDetect.TRANSFORM] = "translate3d(0px, 0px, 0px) scale3d(0, 0, 1)";
            });
        }
        function j() {
            y.style.width = m + "px";
            y.style.height = t + "px";
            q.style.width = z - m + "px";
            q.style.height = K + "px";
            p.style.width = z - m + "px";
            p.style.height = K + "px";
            h.style.width = m + "px";
            h.style.height = t + "px";
            f.style.width = m + "px";
            f.style.height = t + "px";
            h.style[CMDetect.ORIGIN] = m + "px 0px";
            f.style[CMDetect.ORIGIN] = "0px 0px";
            w();
        }
        function A(Q) {
            x.appendChild(y);
            y.appendChild(P);
            h.appendChild(Q);
            CMUtiles.removeDom(B);
            b = { ox: i, oy: g, r1: -45, r2: 45, fx1: m - i, fy1: -g, px1: i - m, py1: g, fx2: m - i, fy2: -g, px2: i - C - C, py2: g };
            j();
            TweenLite.delayedCall(0.02, function () {
                y.className = "active";
                TweenLite.to(b, k, { ox: z, fx1: C - i, r1: 0, r2: 0, px1: i - C, fx2: m - z, px2: N, ease: Cubic.easeInOut });
                u = 0;
                M();
            });
        }
        function l() {
            u = 1;
            x.appendChild(P);
            y.className = "";
            CMUtiles.removeDom(y);
            Close.show(0, 5);
        }
        function G() {
            Close.hide();
            x.appendChild(y);
            y.appendChild(P);
            b = { ox: z, oy: g, r1: 0, r2: 0, fx1: C - i, fy1: -g, px1: i - C, py1: g, fx2: m - z, fy2: -g, px2: N, py2: g };
            j();
            TweenLite.delayedCall(0.02, function () {
                y.className = "active";
                TweenLite.to(b, k, { ox: i, fx1: m - i, r1: -45, r2: 45, px1: i - m, fx2: m - i, px2: i - C - C, ease: Cubic.easeInOut });
                u = 0;
                M();
            });
        }
        function s() {
            u = 1;
            x.appendChild(B);
            y.className = "";
            CMUtiles.removeDom(y);
        }
        function M() {
            if (u) {
                return;
            }
            requestAnimationFrame(M);
            w();
        }
        function w() {
            E.style[CMDetect.ORIGIN] = b.ox + "px " + b.oy + "px";
            E.style[CMDetect.TRANSFORM] = "translate3d(" + b.fx1 + "px, " + b.fy1 + "px, 0px) rotate(" + b.r1 + "deg)";
            h.style[CMDetect.TRANSFORM] = "translate3d(" + b.px1 + "px, " + b.py1 + "px, 0px) rotate(" + b.r2 + "deg)";
            D.style[CMDetect.ORIGIN] = b.ox + "px " + b.oy + "px";
            D.style[CMDetect.TRANSFORM] = "translate3d(" + b.fx2 + "px, " + b.fy2 + "px, 0px) rotate(" + b.r1 + "deg)";
            f.style[CMDetect.TRANSFORM] = "translate3d(" + b.px2 + "px, " + b.py2 + "px, 0px) rotate(" + b.r1 + "deg)";
        }
        function n(Q) {
            Address.showAbout();
        }
        function d() {
            var Q = "http://twitter.com/share?url=" + encodeURIComponent(CMDetect.SITE_URL) + "&text=" + encodeURIComponent("Interactive experiences for Google's Material Design Principles by @cmiscm");
            CMUtiles.openPopup(Q, "", 600, 260);
        }
        function c() {
            var Q =
                "https://www.facebook.com/dialog/feed?app_id=" +
                CMDetect.APP_ID +
                "&link=" +
                encodeURIComponent(CMDetect.SITE_URL) +
                "&picture=" +
                encodeURIComponent(CMDetect.SITE_URL + "images/share.png") +
                "&name=" +
                encodeURIComponent(CMDetect.TITLE) +
                "&caption=" +
                encodeURIComponent(CMDetect.SITE_URL) +
                "&description=" +
                encodeURIComponent("Interactive experiences for Google's Material Design Principles.") +
                "&redirect_uri=" +
                encodeURIComponent(CMDetect.SITE_URL + "close.html") +
                "&display=popup";
            CMUtiles.openPopup(Q, "", 600, 500);
        }
        function F() {
            var Q = "https://plus.google.com/share?url=" + encodeURIComponent(CMDetect.SITE_URL);
            CMUtiles.openPopup(Q, "", 600, 400);
        }
        function v() {
            var Q = "http://pinterest.com/pin/create/button/?url=" + encodeURIComponent(CMDetect.SITE_URL) + "&media=" + encodeURIComponent(CMDetect.SITE_URL + "images/share.png") + "&description=" + encodeURIComponent(CMDetect.TITLE);
            CMUtiles.openPopup(Q, "", 700, 300);
        }
        return { init: I, loading: L, show: A, endShow: l, hide: G, endHide: s, showPage: J, hidePage: o };
    })();
var Loading =
    Loading ||
    (function () {
        var s,
            e,
            j,
            g,
            q,
            m,
            d = 0,
            e,
            j,
            f,
            b,
            a,
            o,
            h,
            c,
            l = {},
            k = 1;
        function n(E, u, I, B) {
            s = E;
            g = u;
            m = document.getElementById("loading");
            s.appendChild(g);
            k = 0;
            i();
            s.style.visibility = "visible";
            var t = 1,
                z = 1.5,
                G = 0.22,
                v = 0.6,
                w = Expo.easeOut,
                J,
                C,
                H,
                A,
                F,
                y,
                D,
                x;
            TweenLite.delayedCall(t, function () {
                m.style.opacity = 0;
            });
            e = I;
            j = B;
            if (j > e) {
                l.x1 = e;
                l.y1 = j;
                l.x2 = e;
                l.y2 = j;
                l.x3 = f;
                l.y3 = b;
                l.x4 = f;
                l.y4 = o;
                l.tx2 = 0;
                l.ty2 = b;
                l.tx3 = f;
                l.ty3 = b;
                l.tx4 = f;
                l.ty4 = b + o;
                J = e;
                C = b;
                H = f;
                A = b;
                F = f;
                y = o;
                D = a;
                x = o;
            } else {
                l.x1 = e;
                l.y1 = j;
                l.x2 = e;
                l.y2 = j;
                l.x3 = f;
                l.y3 = b;
                l.x4 = a;
                l.y4 = b;
                l.tx2 = f;
                l.ty2 = 0;
                l.tx3 = f;
                l.ty3 = b;
                l.tx4 = h;
                l.ty4 = b;
                J = f;
                C = j;
                H = e;
                A = b;
                F = a;
                y = b;
                D = a;
                x = o;
            }
            TweenLite.to(l, v, { delay: z, x1: J, y1: C, ease: w });
            TweenLite.to(l, v, { delay: z + G, x2: H, y2: A, ease: w });
            TweenLite.to(l, v, { delay: z + G + G, x3: F, y3: y, ease: w });
            TweenLite.to(l, v, { delay: z + G + G + G, x4: D, y4: x, ease: w, onComplete: p });
        }
        function p() {
            k = 1;
            CMUtiles.removeDom(m);
            Index.endLoad();
        }
        function r(u, t, x, v, y, z, w) {
            q = u;
            e = t;
            j = x;
            f = v;
            b = y;
            a = z;
            o = w;
            h = f + a;
            c = b + o;
        }
        function i() {
            if (k || !q) {
                return;
            }
            requestAnimationFrame(i);
            q.fillStyle = CMDetect.colors[4];
            q.fillRect(0, 0, e, j);
            q.fillStyle = CMDetect.colors[3];
            q.fillRect(l.tx4, l.ty4, l.x4, l.y4);
            q.fillStyle = CMDetect.colors[2];
            q.fillRect(l.tx3, l.ty3, l.x3, l.y3);
            q.fillStyle = CMDetect.colors[1];
            q.fillRect(l.tx2, l.ty2, l.x2, l.y2);
            q.fillStyle = CMDetect.colors[0];
            q.fillRect(0, 0, l.x1, l.y1);
        }
        return { init: n, resize: r };
    })();
var SurfaceItem =
    SurfaceItem ||
    (function () {
        var c, f, b, d, a;
        function g(h) {
            c = h;
            f = document.createElement("div");
            f.className = "surface-box";
            b = document.createElement("div");
            b.className = "surface-circle";
            c.appendChild(f);
            c.appendChild(b);
        }
        function e(j, k, i, p) {
            if (k > j) {
                d = (j / 6) | 0;
            } else {
                d = (k / 6) | 0;
            }
            if (d > 120) {
                d = 120;
            }
            if (k > j) {
                a = j >> 1;
            } else {
                a = k >> 1;
            }
            if (a > 470) {
                a = 470;
            }
            var o = (j - a) >> 1,
                n = (((k / 3) | 0) - a / 2) | 0,
                m = (j - d) >> 1,
                l = k - ((k - (n + a)) >> 1) - (d >> 1);
            f.style.width = a + "px";
            f.style.height = a + "px";
            f.style[CMDetect.TRANSFORM] = "translate3d(" + o + "px,  " + n + "px, 0px)";
            b.style.width = d + "px";
            b.style.height = d + "px";
            b.style[CMDetect.TRANSFORM] = "translate3d(" + m + "px,  " + l + "px, 0px)";
        }
        return { init: g, setPos: e };
    })();
var ActionItem =
    ActionItem ||
    (function () {
        var b, a, c, g, f;
        function e(h) {
            b = h;
            a = document.createElement("div");
            a.className = "action-circle";
            g = document.createElement("div");
            g.className = "action-box";
            f = document.createElement("div");
            f.className = "action-box";
            b.appendChild(a);
            b.appendChild(g);
            b.appendChild(f);
        }
        function d(t, m, r, p) {
            var k, q;
            if (m > t) {
                k = t;
            } else {
                k = m;
            }
            q = k - 160 + 20;
            if (q > 70) {
                q = 70;
            }
            c = k - q;
            var o = (t - c) >> 1,
                n = (m - c) >> 1,
                s = (c * 0.3) | 0,
                l = (c * 0.04) | 0,
                j = o + ((c - s) >> 1),
                i = n + ((c - l) >> 1),
                v = o + ((c - l) >> 1),
                u = n + ((c - s) >> 1);
            a.style.width = c + "px";
            a.style.height = c + "px";
            a.style[CMDetect.TRANSFORM] = "translate3d(" + o + "px,  " + n + "px, 0px)";
            g.style.width = s + "px";
            g.style.height = l + "px";
            g.style[CMDetect.TRANSFORM] = "translate3d(" + j + "px,  " + i + "px, 0px)";
            f.style.width = l + "px";
            f.style.height = s + "px";
            f.style[CMDetect.TRANSFORM] = "translate3d(" + v + "px,  " + u + "px, 0px)";
        }
        return { init: e, setPos: d };
    })();
var MotionItem =
    MotionItem ||
    (function () {
        var c, f, a, d, b;
        function g(h) {
            c = h;
            f = document.createElement("div");
            f.className = "motion-box";
            d = document.createElement("canvas");
            d.className = "motion-canvas";
            c.appendChild(f);
            c.appendChild(d);
        }
        function e(s, n, r, q) {
            if (n > s) {
                a = (s / 3) | 0;
            } else {
                a = (n / 3) | 0;
            }
            var k = (a / 4) | 0,
                u = k + a,
                t = s * 1.2,
                o = n * 1.2,
                m = t,
                l = o - a,
                j = t - a,
                i = o,
                p;
            f.style.width = a + "px";
            f.style.height = a + "px";
            f.style[CMDetect.TRANSFORM] = "translate3d(" + k + "px,  " + k + "px, 0px)";
            d.width = s;
            d.height = n;
            b = d.getContext("2d");
            b.fillStyle = CMDetect.colors[2];
            b.fillRect(0, 0, s, n);
            b.save();
            if (n > s) {
                p = b.createLinearGradient(u, k, m, l);
            } else {
                p = b.createLinearGradient(k, u, j, i);
            }
            p.addColorStop(0, "#e5585f");
            p.addColorStop(1, "#904199");
            b.fillStyle = p;
            b.beginPath();
            b.moveTo(k, u);
            b.lineTo(u, k);
            b.lineTo(m, l);
            b.lineTo(j, i);
            b.fill();
            b.restore();
        }
        return { init: g, setPos: e };
    })();
var ChangeItem =
    ChangeItem ||
    (function () {
        var g,
            f,
            a,
            j,
            c = 6,
            b = 8,
            e = b * 2;
        function h(k) {
            g = k;
            f = document.createElement("canvas");
            f.className = "motion-canvas";
            g.appendChild(f);
            j = new UI.changeBall();
        }
        function i(v, q, u, t) {
            var s, p, n, k, z;
            f.width = v;
            f.height = q;
            a = f.getContext("2d");
            a.fillStyle = CMDetect.colors[3];
            a.strokeStyle = "#d24b80";
            a.lineWidth = 1.5;
            a.lineCap = "round";
            a.fillRect(0, 0, v, q);
            if (q > v) {
                s = (v / 5) | 0;
                p = v >> 1;
                n = q - ((q / 4) | 0);
            } else {
                s = (q / 5) | 0;
                p = v - ((v / 4) | 0);
                n = q >> 1;
            }
            if (s < 20) {
                s = 20;
            } else {
                if (s > 60) {
                    s = 60;
                }
            }
            j.resize(a, s, v, q);
            j.x = p;
            j.y = n;
            z = (v / e) | 0;
            k = (q / e) | 0;
            var A, l, o, m, r;
            for (o = 0; o <= z; o++) {
                for (m = 0; m <= k; m++) {
                    l = b + o * e;
                    A = b + m * e;
                    r = d(l - p, A - n);
                    a.save();
                    a.translate(l, A);
                    a.rotate(r.heading());
                    a.beginPath();
                    a.moveTo(-c, 0);
                    a.lineTo(c, 0);
                    a.stroke();
                    a.restore();
                }
            }
            j.draw();
        }
        function d(k, l) {
            return new p5.Vector(l - k, -k - l);
        }
        return { init: h, setPos: i };
    })();
var InteractionItem =
    InteractionItem ||
    (function () {
        var c, d, b, a, e, g;
        function h(i) {
            c = i;
            d = document.createElement("canvas");
            d.className = "motion-canvas";
            c.appendChild(d);
            a = new UI.plane("#ffffff");
            e = new UI.plane("#1f4388");
            g = new UI.plane("#ef4d80");
        }
        function f(t, o, s, r) {
            var p = 524,
                j = 514,
                n,
                l,
                q,
                u,
                k = 1,
                m,
                i;
            d.width = t;
            d.height = o;
            b = d.getContext("2d");
            b.fillStyle = CMDetect.colors[4];
            b.fillRect(0, 0, t, o);
            if (t - 40 < p) {
                p = t - 40;
                k = p / 524;
                if (514 * k > o) {
                    k = j / 514;
                }
            }
            if (o - 40 < j) {
                j = o - 40;
                k = j / 514;
                if (524 * k > t) {
                    k = p / 524;
                }
            }
            p = 524 * k;
            j = 514 * k;
            n = (t - p) >> 1;
            l = (o - j) >> 1;
            m = 240 * k;
            i = 142 * k;
            q = l + j - i * 2;
            u = l + ((q - l) >> 1);
            a.resize(b, p, n, l, m, i);
            e.resize(b, p, n, q, m, i);
            g.resize(b, p, n, u, m, i);
            e.draw();
            g.draw();
            a.draw();
        }
        return { init: h, setPos: f };
    })();
var Surface =
    Surface ||
    (function () {
        var d,
            k,
            t,
            w,
            f,
            g = 1,
            x = CMDetect.colors[0],
            i,
            r,
            m,
            j,
            l,
            o = 470,
            u = 100,
            K = 8,
            C,
            D,
            e,
            F,
            A,
            G,
            J,
            B = 0,
            s = 1;
        function N(S, U, R, Q, T) {
            d = S;
            k = U;
            t = R;
            w = Q;
            f = T;
            F = new UI.ball(0, 0, K);
            e = new UI.wall();
        }
        function P() {
            var T = m + (o >> 1) - 10,
                S = l + (o >> 1) - 10,
                R = (o / 6) | 0,
                Q = S + R + 25;
            f.clearRect(0, 0, i, r);
            f.save();
            f.beginPath();
            f.fillStyle = "rgba(0,0,0,0.8)";
            f.fillRect(i, 0, -i, r);
            f.globalCompositeOperation = "xor";
            f.arc(T, S, R, 0, UI.PI2, false);
            f.fill();
            f.restore();
            f.save();
            f.textAlign = "center";
            f.font = "bold 12px Arial";
            f.fillStyle = "#fff";
            f.fillText("MOVE & RESIZE", T, Q);
            f.restore();
        }
        function c(Q) {
            J = Q;
            StageController.addResize("Surface", p);
        }
        function p() {
            i = StageController.stageWidth;
            r = StageController.stageHeight;
            m = i >> 1;
            j = r >> 1;
            l = (r / 2.5) | 0;
            k.width = i;
            k.height = r;
            t = k.getContext("2d");
            t.fillStyle = x;
            t.fillRect(0, 0, i, r);
            w.width = i;
            w.height = r;
            f = w.getContext("2d");
            var Q = (CMUtiles.distance(0, 0, i, r) * 0.01) | 0;
            if (r > i) {
                u = (i / 12) | 0;
            } else {
                u = (r / 12) | 0;
            }
            if (u > 50) {
                u = 50;
            }
            if (r > i) {
                o = i - u * 6;
            } else {
                o = j;
            }
            if (o > 470) {
                o = 470;
            }
            K = Q;
            if (K > 12) {
                K = 12;
            }
            F.vx = F.vy = K;
            C = r - u;
            D = i - u;
            e.resize(t);
            F.resize(t, u);
            if (J) {
                P();
            }
        }
        function H() {
            var T = (i - o) >> 1,
                S = (l - o / 2) | 0,
                Q = CMUtiles.randomInteger(0, 3),
                R = 0.5;
            g = 1;
            B = 0;
            d.appendChild(k);
            e.w = 0;
            e.h = 0;
            e.x = m;
            e.y = l;
            e.update();
            TweenLite.to(e, R, { w: o, h: o, x: T, y: S, ease: Back.easeOut, easeParames: [2.2], onUpdate: M });
            if (Q == 1) {
                F.x = m;
                F.y = 0;
            } else {
                if (Q == 2) {
                    F.x = i;
                    F.y = j;
                } else {
                    if (Q == 3) {
                        F.x = m;
                        F.y = r;
                    } else {
                        F.x = 0;
                        F.y = j;
                    }
                }
            }
            s = 0;
            O();
            if (J) {
                R = 3.3;
                Sub.showGuide();
            }
            return R;
        }
        function M() {
            e.update();
        }
        function h() {
            B = 1;
            J = 0;
        }
        function L() {
            var R = e.x + (e.w >> 1),
                Q = e.y + (e.h >> 1);
            g = 0;
            A = 0;
            G = 0;
            TweenLite.to(e, 0.4, { w: 0, h: 0, x: R, y: Q, ease: Back.easeIn, easeParames: [1.2], onUpdate: M, onComplete: q });
        }
        function q() {
            A = 1;
            b();
        }
        function b() {
            if (!A || !G) {
                return;
            }
            Sub.endHide();
        }
        function v() {
            s = 1;
            StageController.removeResize("Surface");
        }
        function O() {
            if (s) {
                return;
            }
            requestAnimationFrame(O);
            t.fillStyle = x;
            t.fillRect(0, 0, i, r);
            e.draw();
            I();
        }
        function I() {
            var Q = 1;
            F.y += F.vy;
            F.x += F.vx;
            if (g) {
                if (F.y > C) {
                    F.y = C - Q;
                    F.vy *= -1;
                }
                if (F.y < u) {
                    F.y = u + Q;
                    F.vy *= -1;
                }
                if (F.x > D) {
                    F.x = D - Q;
                    F.vx *= -1;
                }
                if (F.x < u) {
                    F.x = u + Q;
                    F.vx *= -1;
                }
            }
            z(e, u, Q);
            F.draw();
            if (g || G) {
                return;
            }
            if (F.x < -u || F.x > D + u || F.y < -u || F.y > C + u) {
                G = 1;
                b();
            }
        }
        function z(X, W, Z) {
            var aa = X.x - W,
                Q = X.maxX + W,
                Y = X.y - W,
                ad = X.maxY + W;
            if (F.x > aa && F.x < Q && F.y > Y && F.y < ad) {
                var S = Math.abs(aa - F.x),
                    V = Math.abs(F.x - Q),
                    R = Math.abs(Y - F.y),
                    U = Math.abs(F.y - ad),
                    ac = Math.min(S, V),
                    ab = Math.min(R, U),
                    T = Math.min(ac, ab);
                if (T == S) {
                    F.x = aa - Z;
                    F.vx *= -1;
                } else {
                    if (T == V) {
                        F.x = Q + Z;
                        F.vx *= -1;
                    } else {
                        if (T == R) {
                            F.y = Y - Z;
                            F.vy *= -1;
                        } else {
                            if (T == U) {
                                F.y = ad + Z;
                                F.vy *= -1;
                            }
                        }
                    }
                }
            }
        }
        function n(R, Q) {
            e.down(R, Q);
        }
        function E(R, Q) {
            e.move(R, Q);
        }
        function a() {
            e.up();
        }
        function y(R, Q) {
            e.checkMouse(R, Q);
        }
        return { init: N, ready: c, show: H, endShow: h, hide: L, dispose: v, downFn: n, moveFn: E, upFn: a, checkMouse: y };
    })();
var Action =
    Action ||
    (function () {
        var h,
            p,
            z,
            E,
            k,
            l = 1,
            o,
            u,
            N = CMDetect.colors[1],
            M = "#fbb447",
            j,
            v,
            d = 0,
            w,
            A,
            P = 8,
            U = 0.4,
            y = 0,
            S = 5,
            c = {},
            J = [],
            K,
            b = 0,
            i = 0,
            O,
            H = 0,
            x = 1;
        function R(Y, aa, X, W, Z) {
            h = Y;
            p = aa;
            z = X;
            E = W;
            k = Z;
            if (CMDetect.isTouch) {
                w = "TOUCH";
            } else {
                w = "CLICK";
            }
        }
        function V() {
            var Z = o >> 1,
                Y = u >> 1,
                X = (A / 2) | 0,
                W = Y + X + 25;
            k.clearRect(0, 0, o, u);
            k.save();
            k.beginPath();
            k.fillStyle = "rgba(0,0,0,0.8)";
            k.fillRect(o, 0, -o, u);
            k.globalCompositeOperation = "xor";
            k.arc(Z, Y, X, 0, UI.PI2, false);
            k.fill();
            k.restore();
            k.save();
            k.textAlign = "center";
            k.font = "bold 12px Arial";
            k.fillStyle = "#fff";
            k.fillText(w, Z, W);
            k.restore();
        }
        function g(W) {
            O = W;
            d = 0;
            C();
            J = [new UI.actionBall(v, 0, 0, z, 0, P, 0)];
            K = 1;
            StageController.addResize("Action", s);
        }
        function s() {
            o = StageController.stageWidth;
            u = StageController.stageHeight;
            p.width = o;
            p.height = u;
            z = p.getContext("2d");
            z.fillStyle = j;
            z.fillRect(0, 0, o, u);
            E.width = o;
            E.height = u;
            k = E.getContext("2d");
            var W, X;
            if (u > o) {
                A = (o / 3) | 0;
            } else {
                A = (u / 3) | 0;
            }
            P = (CMUtiles.distance(0, 0, o, u) * 0.01) | 0;
            if (P > 8) {
                P = 8;
            }
            for (W = 0; W < K; W++) {
                X = J[W];
                if (H) {
                    X.resize(z, P, A, null, null);
                } else {
                    X.resize(z, P, A, o, u);
                }
            }
            if (O) {
                V();
            }
        }
        function L() {
            var X = J[0],
                W = 0.5;
            l = 1;
            H = 0;
            y = 0;
            b = 0;
            i = 0;
            h.appendChild(p);
            X.x = o >> 1;
            X.y = u >> 1;
            X.r = 0;
            TweenLite.to(X, W, { r: A, ease: Back.easeOut, easeParames: [2.2] });
            x = 0;
            T();
            if (O) {
                W = 3.3;
                Sub.showGuide();
            }
            return W;
        }
        function n() {}
        function Q() {
            var Z, aa, Y, X, W;
            l = 0;
            if (d) {
                if (K == 1) {
                    aa = J[0];
                    TweenLite.to(aa, 0.6, { r: 0, ease: Expo.easeInOut, onComplete: t });
                } else {
                    for (Z = 0; Z < K; Z++) {
                        aa = J[Z];
                        aa.vx = 60 * (Math.random() > 0.5 ? -1 : 1);
                        aa.vy = 60 * (Math.random() > 0.5 ? -1 : 1);
                    }
                }
            } else {
                b = 1;
                i = 1;
                Y = o - 58;
                X = u - 58;
                W = q(o, u, Y, X);
                c.r = 28;
                c.x = Y;
                c.y = X;
                TweenLite.to(c, 0.8, { r: W, ease: Expo.easeOut, onComplete: t });
            }
        }
        function t() {
            Sub.endHide();
        }
        function f() {
            if (i) {
                return;
            }
            var W, X;
            for (W = 0; W < K; W++) {
                X = J[W];
                if (!X.hide) {
                    return;
                }
            }
            t();
        }
        function B() {
            x = 1;
            StageController.removeResize("Action");
        }
        function T() {
            if (x) {
                return;
            }
            requestAnimationFrame(T);
            var W, X;
            z.fillStyle = j;
            z.fillRect(0, 0, o, u);
            if (H) {
                m();
            }
            for (W = 0; W < K; W++) {
                X = J[W];
                X.draw();
            }
            if (!b) {
                return;
            }
            z.save();
            z.fillStyle = v;
            z.beginPath();
            z.arc(c.x, c.y, c.r, 0, UI.PI2, false);
            z.fill();
            z.restore();
        }
        function m() {
            var Z, X, Y, aj, ah, af, ag, aa, ae, ac, W, ai, ad, ab;
            for (ad = 0; ad < K - 1; ad++) {
                Z = J[ad];
                for (ab = ad + 1; ab < K; ab++) {
                    X = J[ab];
                    aj = X.x - Z.x;
                    ah = X.y - Z.y;
                    af = Math.sqrt(aj * aj + ah * ah);
                    ag = Z.r + X.r;
                    if (af < ag) {
                        aa = Math.atan2(ah, aj);
                        ae = Z.x + Math.cos(aa) * ag;
                        ac = Z.y + Math.sin(aa) * ag;
                        W = (ae - X.x) * U;
                        ai = (ac - X.y) * U;
                        Z.vx -= W;
                        Z.vy -= ai;
                        X.vx += W;
                        X.vy += ai;
                    }
                }
            }
            for (ad = 0; ad < K; ad++) {
                Y = J[ad];
                Y.move(o, u, l);
            }
        }
        function a(X, Z, Y) {
            Address.unable();
            b = 1;
            i = 1;
            var W = q(o, u, X, Z);
            c.r = Y;
            c.x = X;
            c.y = Z;
            TweenLite.to(c, 0.8, { r: W, ease: Expo.easeOut, onComplete: G });
        }
        function G() {
            C();
            b = 0;
            y = 0;
            H = 0;
            J = [new UI.actionBall(v, 0, 0, z, 0, P, 0)];
            K = 1;
            s();
            var W = J[0];
            W.x = o >> 1;
            W.y = u >> 1;
            W.r = 0;
            TweenLite.to(W, 0.5, { r: A, ease: Back.easeOut, easeParames: [2.2], onComplete: D });
        }
        function D() {
            i = 0;
            Address.able();
        }
        function q(aa, Y, ae, ad) {
            var Z = CMUtiles.distance(0, 0, ae, ad),
                X = CMUtiles.distance(aa, 0, ae, ad),
                W = CMUtiles.distance(0, Y, ae, ad),
                af = CMUtiles.distance(aa, Y, ae, ad),
                ac = Math.max(Z, X),
                ab = Math.max(W, af);
            return (Math.max(ac, ab) + 0.5) | 0;
        }
        function C() {
            d = !d;
            if (d) {
                j = N;
                v = M;
            } else {
                j = M;
                v = N;
            }
        }
        function r(af, ae) {
            if (i) {
                return;
            }
            var aa, Z, ab, X, W, ad, ac, Y;
            for (aa = 0; aa < K; aa++) {
                Z = J[aa];
                ab = Z.r;
                X = Z.x - ab;
                W = Z.x + ab;
                ad = Z.y - ab;
                ac = Z.y + ab;
                if (af > X && af < W && ae > ad && ae < ac) {
                    if (!H) {
                        H = 1;
                    } else {
                        y += 2;
                    }
                    if (y > 28) {
                        y = 28;
                    }
                    Y = P + y;
                    Z.count += 1;
                    Z.update(Y);
                    if (Z.count >= S) {
                        a(Z.x, Z.y, Z.r);
                        return;
                    } else {
                        J.push(new UI.actionBall(v, af, ae, z, A, Y, Z.count));
                        K = J.length;
                    }
                    break;
                }
            }
        }
        function I(X, W) {}
        function e() {}
        function F(X, W) {}
        return { init: R, ready: g, show: L, endShow: n, hide: Q, checkHide: f, dispose: B, downFn: r, moveFn: I, upFn: e, checkMouse: F };
    })();
var Motion =
    Motion ||
    (function () {
        var u,
            j,
            A,
            q,
            s,
            b = 1,
            h = CMDetect.colors[2],
            d,
            n,
            t,
            z,
            r,
            f,
            e,
            H,
            g = 0,
            c = 0,
            p = 1;
        function w(K, M, J, I, L) {
            u = K;
            j = M;
            A = J;
            q = I;
            s = L;
            f = new UI.windowbox(0);
            e = new UI.windowbox(1);
        }
        function G() {
            var L = (t >> 1) + r,
                K = (t >> 1) + r,
                J = (t / 4) | 0,
                I = K + J + 25;
            s.clearRect(0, 0, d, n);
            s.save();
            s.beginPath();
            s.fillStyle = "rgba(0,0,0,0.8)";
            s.fillRect(d, 0, -d, n);
            s.globalCompositeOperation = "xor";
            s.arc(L, K, J, 0, UI.PI2, false);
            s.fill();
            s.restore();
            s.save();
            s.textAlign = "center";
            s.font = "bold 12px Arial";
            s.fillStyle = "#fff";
            s.fillText("MOVE", L, I);
            s.restore();
        }
        function o(I) {
            H = I;
            StageController.addResize("Motion", D);
        }
        function D() {
            d = StageController.stageWidth;
            n = StageController.stageHeight;
            j.width = d;
            j.height = n;
            A = j.getContext("2d");
            A.fillStyle = h;
            A.fillRect(0, 0, d, n);
            q.width = d;
            q.height = n;
            s = q.getContext("2d");
            if (n > d) {
                t = (d / 3) | 0;
            } else {
                t = (n / 3) | 0;
            }
            if (t > 240) {
                t = 240;
            }
            z = (t / 4) | 0;
            r = (t / 4) | 0;
            f.resize(A, t, d, n);
            e.resize(null, t, d, n);
            if (H) {
                G();
            }
        }
        function C() {
            var I = 0.8,
                J;
            b = 1;
            c = 0;
            g = 0;
            u.appendChild(j);
            f.r = 0;
            f.x = r + (t >> 1);
            f.y = r + (t >> 1);
            f.update();
            TweenLite.to(f, I - 0.2, {
                r: t,
                x: r,
                y: r,
                ease: Back.easeOut,
                easeParames: [2.2],
                onUpdate: function () {
                    f.update();
                },
            });
            e.x = r;
            e.y = r;
            e.update();
            if (n > d) {
                J = d;
            } else {
                J = (d - t) >> 1;
            }
            TweenLite.to(e, I - 0.2, {
                delay: 0.2,
                x: J,
                y: n,
                ease: Cubic.easeInOut,
                onUpdate: function () {
                    e.update();
                },
                onStart: function () {
                    g = 1;
                },
            });
            p = 0;
            l();
            if (H) {
                I = 3.3;
                Sub.showGuide();
            }
            return I;
        }
        function y() {
            c = 1;
        }
        function m() {
            var J = f.x + (f.r >> 1),
                I = f.y + (f.r >> 1);
            c = 0;
            b = 0;
            TweenLite.to(e, 0.4, {
                x: f.x,
                y: f.y,
                ease: Cubic.easeInOut,
                onUpdate: function () {
                    e.update();
                },
                onComplete: function () {
                    g = 0;
                },
            });
            TweenLite.to(f, 0.4, {
                delay: 0.2,
                r: 0,
                x: J,
                y: I,
                ease: Back.easeIn,
                easeParames: [1.2],
                onUpdate: function () {
                    f.update();
                },
                onComplete: k,
            });
        }
        function k() {
            Sub.endHide();
        }
        function F() {
            p = 1;
            StageController.removeResize("Motion");
        }
        function l() {
            if (p) {
                return;
            }
            requestAnimationFrame(l);
            A.fillStyle = h;
            A.fillRect(0, 0, d, n);
            if (c) {
                a();
            }
            if (g) {
                i();
            }
            f.draw();
        }
        function a() {
            var I = CMUtiles.distance(r, r, f.x, f.y),
                K = CMUtiles.distance(0, 0, d, n),
                J = CMUtiles.getCurrent(I, 0, K, t, z);
            f.updateSize(J);
            e.updateSize(J);
        }
        function i() {
            var L = d >> 1,
                N = t >> 1,
                K,
                J,
                I,
                S,
                R,
                Q,
                P,
                O,
                M;
            A.save();
            if (n > d) {
                K = f.x;
                J = f.maxY;
                I = f.maxX;
                S = f.y;
                R = e.maxX;
                Q = e.y;
                P = e.x;
                O = e.maxY;
                M = A.createLinearGradient(I, S, R, Q);
            } else {
                if (f.x + N < L) {
                    K = f.x;
                    J = f.maxY;
                    I = f.maxX;
                    S = f.y;
                    R = e.maxX;
                    Q = e.y;
                    P = e.x;
                    O = e.maxY;
                    M = A.createLinearGradient(I, S, R, Q);
                } else {
                    K = f.x;
                    J = f.y;
                    I = f.maxX;
                    S = f.maxY;
                    R = e.maxX;
                    Q = e.maxY;
                    P = e.x;
                    O = e.y;
                    M = A.createLinearGradient(K, J, P, O);
                }
            }
            M.addColorStop(0, "rgba(229, 88, 95, 1)");
            M.addColorStop(1, "rgba(229, 88, 95, 0)");
            A.fillStyle = M;
            A.beginPath();
            A.moveTo(K, J);
            A.lineTo(I, S);
            A.lineTo(R, Q);
            A.lineTo(P, O);
            A.fill();
            A.restore();
        }
        function v(J, I) {
            f.down(J, I);
        }
        function x(J, I) {
            f.move(J, I);
        }
        function B() {
            f.up();
        }
        function E(J, I) {
            f.checkMouse(J, I);
        }
        return { init: w, ready: o, show: C, endShow: y, hide: m, dispose: F, downFn: v, moveFn: x, upFn: B, checkMouse: E };
    })();
var Change =
    Change ||
    (function () {
        var e,
            k,
            q,
            w,
            f,
            g = 1,
            x = CMDetect.colors[3],
            j,
            o,
            r,
            u = 12,
            h = 17,
            I = h * 2,
            a,
            v,
            C,
            b = { no: 0 },
            E,
            A = 0,
            p = 1;
        function H(N, P, M, L, O) {
            e = N;
            k = P;
            q = M;
            w = L;
            f = O;
            C = new UI.changeBall();
        }
        function K() {
            var O = j - ((j / 5) | 0),
                N = o >> 1,
                M = (r * 1.5) | 0,
                L = N + M + 25;
            f.clearRect(0, 0, j, o);
            f.save();
            f.beginPath();
            f.fillStyle = "rgba(0,0,0,0.8)";
            f.fillRect(j, 0, -j, o);
            f.globalCompositeOperation = "xor";
            f.arc(O, N, M, 0, UI.PI2, false);
            f.fill();
            f.restore();
            f.save();
            f.textAlign = "center";
            f.font = "bold 12px Arial";
            f.fillStyle = "#fff";
            f.fillText("MOVE", O, L);
            f.restore();
        }
        function d(L) {
            E = L;
            StageController.addResize("Change", m);
        }
        function m() {
            j = StageController.stageWidth;
            o = StageController.stageHeight;
            k.width = j;
            k.height = o;
            q = k.getContext("2d");
            q.fillStyle = x;
            q.strokeStyle = "#d24b80";
            q.lineWidth = 3;
            q.lineCap = "round";
            q.fillRect(0, 0, j, o);
            w.width = j;
            w.height = o;
            f = w.getContext("2d");
            if (o > j) {
                r = (j / 12) | 0;
            } else {
                r = (o / 12) | 0;
            }
            if (r < 40) {
                r = 40;
            } else {
                if (r > 60) {
                    r = 60;
                }
            }
            C.resize(q, r, j, o);
            a = (j / I) | 0;
            v = (o / I) | 0;
            if (E) {
                K();
            }
        }
        function D() {
            var N = 0.8,
                M = j - ((j / 5) | 0),
                L = o >> 1;
            g = 1;
            A = 0;
            e.appendChild(k);
            C.r = 0;
            C.x = M;
            C.y = L;
            TweenLite.to(C, 0.4, { r: r, ease: Back.easeOut, easeParames: [2.2], onUpdate: G });
            TweenLite.to(b, 0.5, { delay: 0.3, no: 1, ease: Cubic.easeOut });
            p = 0;
            J();
            if (E) {
                N = 3.3;
                Sub.showGuide();
            }
            return N;
        }
        function G() {
            C.update();
        }
        function i() {
            A = 1;
            E = 0;
        }
        function F() {
            g = 0;
            TweenLite.to(C, 0.4, { r: 0, ease: Back.easeIn, easeParames: [2.2], onUpdate: G, onComplete: n });
            TweenLite.to(b, 0.3, { no: 0, ease: Cubic.easeOut });
        }
        function n() {
            Sub.endHide();
        }
        function t() {
            p = 1;
            StageController.removeResize("Change");
        }
        function J() {
            if (p) {
                return;
            }
            requestAnimationFrame(J);
            q.fillStyle = x;
            q.fillRect(0, 0, j, o);
            z();
            C.draw();
        }
        function z() {
            var S,
                P,
                M,
                R,
                O,
                L = u * b.no,
                Q = C.x,
                N = C.y;
            for (R = 0; R <= a; R++) {
                for (O = 0; O <= v; O++) {
                    P = h + R * I;
                    S = h + O * I;
                    M = s(P - Q, S - N);
                    q.save();
                    q.translate(P, S);
                    q.rotate(M.heading());
                    q.beginPath();
                    q.moveTo(-L, 0);
                    q.lineTo(L, 0);
                    q.stroke();
                    q.restore();
                }
            }
        }
        function s(L, M) {
            return new p5.Vector(M - L, -L - M);
        }
        function l(M, L) {
            C.down(M, L);
        }
        function B(M, L) {
            C.move(M, L);
        }
        function c() {
            C.up();
        }
        function y(M, L) {
            C.checkMouse(M, L);
        }
        return { init: H, ready: d, show: D, endShow: i, hide: F, dispose: t, downFn: l, moveFn: B, upFn: c, checkMouse: y };
    })();
var p5 = {};
var TWO_PI = Math.PI * 2;
var polarGeometry = function (a) {
    return {
        degreesToRadians: function (b) {
            return (2 * Math.PI * b) / 360;
        },
        radiansToDegrees: function (b) {
            return (360 * b) / (2 * Math.PI);
        },
    };
};
p5.Vector = function (a, c, b) {
    this.x = a;
    this.y = c;
    this.z = b;
};
p5.Vector.prototype.set = function (a, c, b) {
    if (a instanceof p5.Vector) {
        this.x = a.x || 0;
        this.y = a.y || 0;
        this.z = a.z || 0;
        return this;
    }
    if (a instanceof Array) {
        this.x = a[0] || 0;
        this.y = a[1] || 0;
        this.z = a[2] || 0;
        return this;
    }
    this.x = a || 0;
    this.y = c || 0;
    this.z = b || 0;
    return this;
};
p5.Vector.prototype.get = function () {
    if (this.p5) {
        return new p5.Vector(this.p5, [this.x, this.y, this.z]);
    } else {
        return new p5.Vector(this.x, this.y, this.z);
    }
};
p5.Vector.prototype.add = function (a, c, b) {
    if (a instanceof p5.Vector) {
        this.x += a.x || 0;
        this.y += a.y || 0;
        this.z += a.z || 0;
        return this;
    }
    if (a instanceof Array) {
        this.x += a[0] || 0;
        this.y += a[1] || 0;
        this.z += a[2] || 0;
        return this;
    }
    this.x += a || 0;
    this.y += c || 0;
    this.z += b || 0;
    return this;
};
p5.Vector.prototype.sub = function (a, c, b) {
    if (a instanceof p5.Vector) {
        this.x -= a.x || 0;
        this.y -= a.y || 0;
        this.z -= a.z || 0;
        return this;
    }
    if (a instanceof Array) {
        this.x -= a[0] || 0;
        this.y -= a[1] || 0;
        this.z -= a[2] || 0;
        return this;
    }
    this.x -= a || 0;
    this.y -= c || 0;
    this.z -= b || 0;
    return this;
};
p5.Vector.prototype.mult = function (a) {
    this.x *= a || 0;
    this.y *= a || 0;
    this.z *= a || 0;
    return this;
};
p5.Vector.prototype.div = function (a) {
    this.x /= a;
    this.y /= a;
    this.z /= a;
    return this;
};
p5.Vector.prototype.mag = function () {
    return Math.sqrt(this.magSq());
};
p5.Vector.prototype.magSq = function () {
    var a = this.x,
        c = this.y,
        b = this.z;
    return a * a + c * c + b * b;
};
p5.Vector.prototype.dot = function (a, c, b) {
    if (a instanceof p5.Vector) {
        return this.dot(a.x, a.y, a.z);
    }
    return this.x * (a || 0) + this.y * (c || 0) + this.z * (b || 0);
};
p5.Vector.prototype.cross = function (b) {
    var a = this.y * b.z - this.z * b.y;
    var d = this.z * b.x - this.x * b.z;
    var c = this.x * b.y - this.y * b.x;
    if (this.p5) {
        return new p5.Vector(this.p5, [a, d, c]);
    } else {
        return new p5.Vector(a, d, c);
    }
};
p5.Vector.prototype.dist = function (a) {
    var b = a.get().sub(this);
    return b.mag();
};
p5.Vector.prototype.normalize = function () {
    return this.div(this.mag());
};
p5.Vector.prototype.limit = function (b) {
    var a = this.magSq();
    if (a > b * b) {
        this.div(Math.sqrt(a));
        this.mult(b);
    }
    return this;
};
p5.Vector.prototype.setMag = function (a) {
    return this.normalize().mult(a);
};
p5.Vector.prototype.heading = function () {
    var a = Math.atan2(this.y, this.x);
    if (this.p5) {
        if (this.p5._angleMode === "radians") {
            return a;
        } else {
            return polarGeometry.radiansToDegrees(a);
        }
    } else {
        return a;
    }
};
p5.Vector.prototype.rotate = function (b) {
    if (this.p5) {
        if (this.p5._angleMode === "degrees") {
            b = polarGeometry.degreesToRadians(b);
        }
    }
    var c = this.heading() + b;
    var d = this.mag();
    this.x = Math.cos(c) * d;
    this.y = Math.sin(c) * d;
    return this;
};
p5.Vector.prototype.lerp = function (a, d, b, c) {
    if (a instanceof p5.Vector) {
        return this.lerp(a.x, a.y, a.z, d);
    }
    this.x += (a - this.x) * c || 0;
    this.y += (d - this.y) * c || 0;
    this.z += (b - this.z) * c || 0;
    return this;
};
p5.Vector.prototype.array = function () {
    return [this.x || 0, this.y || 0, this.z || 0];
};
p5.Vector.fromAngle = function (a) {
    if (this.p5) {
        if (this.p5._angleMode === "degrees") {
            a = polarGeometry.degreesToRadians(a);
        }
    }
    if (this.p5) {
        return new p5.Vector(this.p5, [Math.cos(a), Math.sin(a), 0]);
    } else {
        return new p5.Vector(Math.cos(a), Math.sin(a), 0);
    }
};
p5.Vector.random2D = function () {
    var a;
    if (this.p5) {
        if (this.p5._angleMode === "degrees") {
            a = this.p5.random(360);
        } else {
            a = this.p5.random(TWO_PI);
        }
    } else {
        a = Math.random() * Math.PI * 2;
    }
    return this.fromAngle(a);
};
p5.Vector.random3D = function () {
    var d, a;
    if (this.p5) {
        d = this.p5.random(0, TWO_PI);
        a = this.p5.random(-1, 1);
    } else {
        d = Math.random() * Math.PI * 2;
        a = Math.random() * 2 - 1;
    }
    var c = Math.sqrt(1 - a * a) * Math.cos(d);
    var b = Math.sqrt(1 - a * a) * Math.sin(d);
    if (this.p5) {
        return new p5.Vector(this.p5, [c, b, a]);
    } else {
        return new p5.Vector(c, b, a);
    }
};
p5.Vector.add = function (b, a) {
    return b.get().add(a);
};
p5.Vector.sub = function (b, a) {
    return b.get().sub(a);
};
p5.Vector.mult = function (a, b) {
    return a.get().mult(b);
};
p5.Vector.div = function (a, b) {
    return a.get().div(b);
};
p5.Vector.dot = function (b, a) {
    return b.dot(a);
};
p5.Vector.cross = function (b, a) {
    return b.cross(a);
};
p5.Vector.dist = function (b, a) {
    return b.dist(a);
};
p5.Vector.lerp = function (c, a, b) {
    return c.get().lerp(a, b);
};
p5.Vector.angleBetween = function (c, b) {
    var a = Math.acos(c.dot(b) / (c.mag() * b.mag()));
    if (this.p5) {
        if (this.p5._angleMode === "degrees") {
            a = polarGeometry.radiansToDegrees(a);
        }
    }
    return a;
};
var Interaction =
    Interaction ||
    (function () {
        var e,
            q,
            F,
            M,
            g,
            j = 1,
            N = CMDetect.colors[4],
            W = "#1f4388",
            V = "#ef4d80",
            T = 0,
            n,
            y,
            t,
            I,
            s,
            r,
            S,
            u,
            f,
            l = 0,
            i,
            Z,
            G,
            A,
            K,
            X = 40,
            h = 0.3,
            ak = Circ.easeOut,
            o = 524,
            E = 514,
            ae = 240,
            b = 142,
            aa,
            k,
            ag,
            H = [],
            z = [],
            a = 0,
            ab,
            R = 0,
            Y = 0,
            P = 0,
            B = 1;
        function ah(an, ap, am, al, ao) {
            e = an;
            q = ap;
            F = am;
            M = al;
            g = ao;
            aa = new UI.plane("#ffffff");
            k = new UI.plane(W);
            ag = new UI.plane(V);
        }
        function aj(ap) {
            var ao = n >> 1,
                an = y >> 1,
                am = (80 * ap) | 0,
                al = an + am + 25;
            g.clearRect(0, 0, n, y);
            g.save();
            g.beginPath();
            g.fillStyle = "rgba(0,0,0,0.8)";
            g.fillRect(n, 0, -n, y);
            g.globalCompositeOperation = "xor";
            g.arc(ao, an, am, 0, UI.PI2, false);
            g.fill();
            g.restore();
            g.save();
            g.textAlign = "center";
            g.font = "bold 12px Arial";
            g.fillStyle = "#fff";
            g.fillText("SLIDE", ao, al);
            g.restore();
        }
        function d(al) {
            ab = al;
            StageController.addResize("Interaction", x);
        }
        function x() {
            var am = o,
                ao = E,
                an,
                ar,
                aq = 1,
                ap,
                al;
            n = StageController.stageWidth;
            y = StageController.stageHeight;
            q.width = n;
            q.height = y;
            F = q.getContext("2d");
            F.fillStyle = N;
            F.fillRect(0, 0, n, y);
            M.width = n;
            M.height = y;
            g = M.getContext("2d");
            if (n - 40 < am) {
                am = n - 40;
                aq = am / o;
                if (E * aq > y) {
                    aq = ao / E;
                }
            }
            if (y - 40 < ao) {
                ao = y - 40;
                aq = ao / E;
                if (o * aq > n) {
                    aq = am / o;
                }
            }
            t = o * aq;
            I = E * aq;
            s = (n - t) >> 1;
            r = (y - I) >> 1;
            S = s + t;
            u = r + I;
            ap = ae * aq;
            al = b * aq;
            an = r + I - al * 2;
            ar = r + ((an - r) >> 1);
            aa.resize(F, t, s, r, ap, al);
            k.resize(F, t, s, an, ap, al);
            ag.resize(F, t, s, ar, ap, al);
            i = ag.ty;
            K = k.ty;
            Z = i - X;
            G = i + X;
            if (ab) {
                aj(aq);
            }
        }
        function U() {
            var am = 1,
                an = { a3: aa.a3, a4: aa.a4, a7: aa.a7, a8: aa.a8, b3: aa.b3, b4: aa.b4, b7: aa.b7, b8: aa.b8 },
                al = an.a7 + ((an.b3 - an.a7) >> 1),
                ao = an.a8;
            j = 1;
            P = 0;
            Y = 0;
            e.appendChild(q);
            aa.a3 = aa.a7 = aa.b3 = aa.b7 = al;
            aa.a4 = aa.a8 = aa.b4 = aa.b8 = ao;
            TweenLite.to(aa, 0.5, { a3: an.a3, a4: an.a4, a7: an.a7, a8: an.a8, b3: an.b3, b4: an.b4, b7: an.b7, b8: an.b8, ease: Back.easeOut, easeParames: [2.2], onComplete: p });
            B = 0;
            ai();
            if (ab) {
                am = 3.3;
                Sub.showGuide();
            }
            return am;
        }
        function p() {
            ag.ty = k.ty = aa.ty;
            ag.update();
            k.update();
            Y = 1;
            TweenLite.to(ag, 0.35, {
                delay: 0.15,
                ty: i,
                ease: ak,
                onUpdate: function () {
                    ag.update();
                },
            });
            TweenLite.to(k, 0.5, {
                ty: K,
                ease: ak,
                onUpdate: function () {
                    k.update();
                },
                onComplete: m,
            });
        }
        function m() {
            P = 1;
            ab = 0;
        }
        function ac() {
            j = 0;
            TweenLite.killTweensOf(ag);
            TweenLite.to(ag, 0.35, {
                ty: aa.ty,
                ease: ak,
                onUpdate: function () {
                    ag.update();
                },
            });
            TweenLite.to(k, 0.4, {
                ty: aa.ty,
                ease: ak,
                onUpdate: function () {
                    k.update();
                },
                onComplete: D,
            });
        }
        function D() {
            Y = 0;
            var al = aa.a7 + ((aa.b3 - aa.a7) >> 1),
                am = aa.a8;
            TweenLite.to(aa, 0.4, { a3: al, a4: am, a7: al, a8: am, b3: al, b4: am, b7: al, b8: am, ease: Back.easeIn, easeParames: [2.2], onComplete: w });
        }
        function w() {
            Sub.endHide();
        }
        function J() {
            B = 1;
            l = 0;
            a = 0;
            R = 0;
            z = [];
            var al,
                an = H.length,
                am;
            for (al = 0; al < an; al++) {
                am = H[al];
                am.isUsed = 0;
            }
            StageController.removeResize("Interaction");
        }
        function ai() {
            if (B) {
                return;
            }
            requestAnimationFrame(ai);
            F.fillStyle = N;
            F.fillRect(0, 0, n, y);
            if (Y) {
                k.draw();
                af(2);
                ag.draw();
                af(1);
            }
            aa.draw();
        }
        function af(ao) {
            var am,
                an = z.length,
                al;
            for (am = 0; am < an; am++) {
                al = z[am];
                if (al.moving == ao) {
                    al.draw();
                }
            }
        }
        function v(am, al) {
            if (!j) {
                return;
            }
            a = 1;
            f = al;
            A = ag.ty;
        }
        function Q(am, al) {
            if (!a || !j) {
                return;
            }
            l = al - f;
            f = al;
            var al = ag.ty + l;
            if (al < aa.ty) {
                al = aa.ty;
            } else {
                if (al > k.ty) {
                    al = k.ty;
                }
            }
            A = al;
            TweenLite.killTweensOf(ag);
            TweenLite.to(ag, h, {
                ty: A,
                ease: ak,
                onUpdate: function () {
                    ag.update();
                },
            });
        }
        function c() {
            if (!j) {
                return;
            }
            var am, ao, an, al;
            a = 0;
            TweenLite.killTweensOf(ag);
            if (A > Z && A < G) {
                TweenLite.to(ag, h, {
                    ty: i,
                    ease: ak,
                    onUpdate: function () {
                        ag.update();
                    },
                });
            } else {
                if (l < 0) {
                    T += 1;
                    R = 1;
                    am = aa.ty;
                } else {
                    T -= 1;
                    R = 2;
                    am = k.ty;
                }
                if (T % 2 == 0) {
                    an = W;
                    al = V;
                } else {
                    an = V;
                    al = W;
                }
                ao = C();
                ao.setting(ag, F, an);
                z.push(ao);
                if (R == 1) {
                    ag.setting(k, F, al);
                    k.color = an;
                } else {
                    ag.setting(aa, F, al);
                }
                ao.moving = R;
                TweenLite.to(ao, h, {
                    ty: am,
                    ease: ak,
                    onUpdate: function () {
                        ao.update();
                    },
                    onComplete: function () {
                        ao.isUsed = 0;
                        L(ao);
                        if (R == 2 && j) {
                            k.color = ao.color;
                        }
                    },
                });
                TweenLite.to(ag, h, {
                    ty: i,
                    ease: ak,
                    onUpdate: function () {
                        ag.update();
                    },
                    onComplete: ad,
                });
            }
        }
        function L(al) {
            var am,
                an = z.length;
            for (am = 0; am < an; am++) {
                if (z[am] === al) {
                    z.splice(am, 1);
                }
            }
        }
        function ad() {
            R = 0;
            l = 0;
            f = 0;
            a = 0;
        }
        function O(am, al) {
            if (am > s && am < S && al > r && al < u) {
                Address.setCursor(3);
            } else {
                Address.setCursor(0);
            }
        }
        function C() {
            var al,
                an = H.length,
                am;
            for (al = 0; al < an; al++) {
                am = H[al];
                if (!am.isUsed) {
                    am.isUsed = 1;
                    return am;
                    break;
                }
            }
            am = new UI.plane();
            am.isUsed = 1;
            H.push(am);
            return am;
        }
        return { init: ah, ready: d, show: U, endShow: m, hide: ac, dispose: J, downFn: v, moveFn: Q, upFn: c, checkMouse: O };
    })();
var Close =
    Close ||
    (function () {
        var f,
            k,
            b,
            g,
            d = ["#ef4d80", "#1f4388", "#00a896", "#fcb447", "#904199", "#ff4081"];
        function l(m) {
            f = m;
            k = document.createElement("div");
            k.id = "close";
            b = document.createElement("span");
            g = document.createElement("i");
            k.appendChild(b);
            k.appendChild(g);
            if (!CMDetect.isTouch) {
                addListener(k, "mouseenter", c);
                addListener(k, "mouseleave", a);
            }
            addListener(k, "click", h);
            TweenLite.set(k, { css: { scale: 0 } });
        }
        function j(n, m) {
            b.style.backgroundColor = d[m];
            f.appendChild(k);
            TweenLite.to(k, 1, { delay: n, css: { scale: 1 }, ease: Elastic.easeOut });
        }
        function e() {
            TweenLite.to(k, 0.3, { css: { scale: 0 }, ease: Back.easeIn, easeParams: [2.2], onComplete: i });
            TweenLite.to(b, 0.3, { css: { scale: 1 }, ease: Cubic.easeOut });
            TweenLite.to(g, 0.3, { css: { rotation: 0 }, ease: Cubic.easeOut });
        }
        function i() {
            CMUtiles.removeDom(k);
        }
        function c(m) {
            TweenLite.to(b, 0.8, { css: { scale: 1.3 }, ease: Elastic.easeOut });
            TweenLite.to(g, 0.5, { css: { rotation: 90 }, ease: Back.easeOut, easeParams: [4] });
        }
        function a(m) {
            TweenLite.to(b, 0.3, { css: { scale: 1 }, ease: Cubic.easeOut });
            TweenLite.to(g, 0.3, { css: { rotation: 0 }, ease: Cubic.easeOut });
        }
        function h(m) {
            Address.goClose();
        }
        return { init: l, show: j, hide: e };
    })();
