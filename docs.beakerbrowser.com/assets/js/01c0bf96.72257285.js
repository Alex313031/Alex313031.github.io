"use strict";(self.webpackChunkdocs_beakerbrowser_com=self.webpackChunkdocs_beakerbrowser_com||[]).push([[786],{3905:function(e,a,t){t.d(a,{Zo:function(){return c},kt:function(){return m}});var n=t(7294);function r(e,a,t){return a in e?Object.defineProperty(e,a,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[a]=t,e}function l(e,a){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);a&&(n=n.filter((function(a){return Object.getOwnPropertyDescriptor(e,a).enumerable}))),t.push.apply(t,n)}return t}function s(e){for(var a=1;a<arguments.length;a++){var t=null!=arguments[a]?arguments[a]:{};a%2?l(Object(t),!0).forEach((function(a){r(e,a,t[a])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):l(Object(t)).forEach((function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(t,a))}))}return e}function i(e,a){if(null==e)return{};var t,n,r=function(e,a){if(null==e)return{};var t,n,r={},l=Object.keys(e);for(n=0;n<l.length;n++)t=l[n],a.indexOf(t)>=0||(r[t]=e[t]);return r}(e,a);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(n=0;n<l.length;n++)t=l[n],a.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(r[t]=e[t])}return r}var p=n.createContext({}),o=function(e){var a=n.useContext(p),t=a;return e&&(t="function"==typeof e?e(a):s(s({},a),e)),t},c=function(e){var a=o(e.components);return n.createElement(p.Provider,{value:a},e.children)},u="mdxType",d={inlineCode:"code",wrapper:function(e){var a=e.children;return n.createElement(n.Fragment,{},a)}},k=n.forwardRef((function(e,a){var t=e.components,r=e.mdxType,l=e.originalType,p=e.parentName,c=i(e,["components","mdxType","originalType","parentName"]),u=o(t),k=r,m=u["".concat(p,".").concat(k)]||u[k]||d[k]||l;return t?n.createElement(m,s(s({ref:a},c),{},{components:t})):n.createElement(m,s({ref:a},c))}));function m(e,a){var t=arguments,r=a&&a.mdxType;if("string"==typeof e||r){var l=t.length,s=new Array(l);s[0]=k;var i={};for(var p in a)hasOwnProperty.call(a,p)&&(i[p]=a[p]);i.originalType=e,i[u]="string"==typeof e?e:r,s[1]=i;for(var o=2;o<l;o++)s[o]=t[o];return n.createElement.apply(null,s)}return n.createElement.apply(null,t)}k.displayName="MDXCreateElement"},9150:function(e,a,t){t.r(a),t.d(a,{assets:function(){return c},contentTitle:function(){return p},default:function(){return m},frontMatter:function(){return i},metadata:function(){return o},toc:function(){return u}});var n=t(7462),r=t(3366),l=(t(7294),t(3905)),s=["components"],i={title:"beaker.panes",description:"Attach to other active panes, coordinate navigation, and inject code"},p=void 0,o={unversionedId:"apis/beaker.panes",id:"apis/beaker.panes",title:"beaker.panes",description:"Attach to other active panes, coordinate navigation, and inject code",source:"@site/docs/apis/beaker.panes.md",sourceDirName:"apis",slug:"/apis/beaker.panes",permalink:"/docs.beakerbrowser.com/apis/beaker.panes",draft:!1,editUrl:"https://github.com/Alex313031/docs.beakerbrowser.com/edit/master/docs/apis/beaker.panes.md",tags:[],version:"current",frontMatter:{title:"beaker.panes",description:"Attach to other active panes, coordinate navigation, and inject code"},sidebar:"docs",previous:{title:"beaker.markdown",permalink:"/docs.beakerbrowser.com/apis/beaker.markdown"},next:{title:"beaker.peersockets",permalink:"/docs.beakerbrowser.com/apis/beaker.peersockets"}},c={},u=[{value:"API",id:"api",level:2},{value:"beaker.panes.setAttachable()",id:"beakerpanessetattachable",level:3},{value:"beaker.panes.getAttachedPane()",id:"beakerpanesgetattachedpane",level:3},{value:"beaker.panes.attachToLastActivePane()",id:"beakerpanesattachtolastactivepane",level:3},{value:"beaker.panes.create(url, {attach: boolean})",id:"beakerpanescreateurl-attach-boolean",level:3},{value:"beaker.panes.navigate(paneId, url)",id:"beakerpanesnavigatepaneid-url",level:3},{value:"beaker.panes.focus(paneId)",id:"beakerpanesfocuspaneid",level:3},{value:"beaker.panes.executeJavaScript(paneId, script)",id:"beakerpanesexecutejavascriptpaneid-script",level:3},{value:"beaker.panes.injectCss(paneId, styles)",id:"beakerpanesinjectcsspaneid-styles",level:3},{value:"beaker.panes.uninjectCss(paneId, cssId)",id:"beakerpanesuninjectcsspaneid-cssid",level:3},{value:"&quot;pane-attached&quot; event",id:"pane-attached-event",level:3},{value:"&quot;pane-detached&quot; event",id:"pane-detached-event",level:3},{value:"&quot;pane-navigated&quot; event",id:"pane-navigated-event",level:3},{value:"Example app",id:"example-app",level:2}],d={toc:u},k="wrapper";function m(e){var a=e.components,t=(0,r.Z)(e,s);return(0,l.kt)(k,(0,n.Z)({},d,t,{components:a,mdxType:"MDXLayout"}),(0,l.kt)("p",null,'Beaker includes the ability to split the page into multiple panes which navigate independently. This API gives applications the ability to "attach" to other panes and coordinate their browsing as well as inject JS/CSS.'),(0,l.kt)("p",null,"Currently each pane can attach and manage one other pane at a time. The user must grant permission to use the panes API."),(0,l.kt)("h2",{id:"api"},"API"),(0,l.kt)("h3",{id:"beakerpanessetattachable"},"beaker.panes.setAttachable()"),(0,l.kt)("p",null,'Mark the pane as "attachable." This will cause the attachment UI to display in the app\'s status bar, even if the pane is not attached to anything.'),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},"Returns ",(0,l.kt)("strong",{parentName:"li"},"Void"),".")),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-javascript"},"beaker.panes.setAttachable()\n")),(0,l.kt)("h3",{id:"beakerpanesgetattachedpane"},"beaker.panes.getAttachedPane()"),(0,l.kt)("p",null,"Get the currently attached pane. Returns undefined if no pane is attached."),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},"Returns ",(0,l.kt)("strong",{parentName:"li"},"Void|Object"),".",(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},"id")," Number. The pane's identifier."),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},"url")," String. The pane's current location.")))),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-javascript"},"var pane = beaker.panes.getAttachedPane()\nif (pane) {\n  console.log(pane.id) // some number\n  console.log(pane.url) // the current address of the pane\n}\n")),(0,l.kt)("h3",{id:"beakerpanesattachtolastactivepane"},"beaker.panes.attachToLastActivePane()"),(0,l.kt)("p",null,"Attempts to attach to the pane that was active prior to the current pane. Can be used during setup to automatically attach to the pane in use."),(0,l.kt)("p",null,"Requires permission from the user."),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},"Returns ",(0,l.kt)("strong",{parentName:"li"},"Promise","<","Void|Object",">"),".",(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},"id")," Number. The pane's identifier."),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},"url")," String. The pane's current location.")))),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-javascript"},"var pane = await beaker.panes.attachToLastActivePane()\nif (pane) {\n  console.log(pane.id) // some number\n  console.log(pane.url) // the current address of the pane\n}\n")),(0,l.kt)("h3",{id:"beakerpanescreateurl-attach-boolean"},"beaker.panes.create(url, {attach: boolean})"),(0,l.kt)("p",null,"Creates a new pane and optionally attaches to the pane automatically."),(0,l.kt)("p",null,"Requires permission from the user."),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},"url")," String. The URL to open in the new pane."),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},"opts")," Object.",(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},"attach")," Boolean. Attach to the new pane. Defaults to false."))),(0,l.kt)("li",{parentName:"ul"},"Returns ",(0,l.kt)("strong",{parentName:"li"},"Promise","<","Object",">"),".",(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},"id")," Number. The pane's identifier."),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},"url")," String. The pane's current location.")))),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-javascript"},"var pane = await beaker.panes.create('https://beakerbrowser.com', {attach: true})\nconsole.log(pane.id) // some number\nconsole.log(pane.url) // the current address of the pane\n")),(0,l.kt)("h3",{id:"beakerpanesnavigatepaneid-url"},"beaker.panes.navigate(paneId, url)"),(0,l.kt)("p",null,"Navigates the pane to the given URL. The given pane must be attached."),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},"paneId")," Number. The ID of the pane to navigate."),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},"url")," String. The URL to open in the target pane."),(0,l.kt)("li",{parentName:"ul"},"Returns ",(0,l.kt)("strong",{parentName:"li"},"Promise","<","Void",">"),".")),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-javascript"},"await beaker.panes.create(pane.id, 'https://beakerbrowser.com')\n")),(0,l.kt)("h3",{id:"beakerpanesfocuspaneid"},"beaker.panes.focus(paneId)"),(0,l.kt)("p",null,"Gives focus to a different pane. The given pane must be attached."),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},"paneId")," Number. The ID of the pane to navigate."),(0,l.kt)("li",{parentName:"ul"},"Returns ",(0,l.kt)("strong",{parentName:"li"},"Promise","<","Void",">"),".")),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-javascript"},"await beaker.panes.focus(pane.id)\n")),(0,l.kt)("h3",{id:"beakerpanesexecutejavascriptpaneid-script"},"beaker.panes.executeJavaScript(paneId, script)"),(0,l.kt)("p",null,"Runs the given javascript in a different pane. The given pane must be attached."),(0,l.kt)("p",null,"Requires permission from the user."),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},"paneId")," Number. The ID of the pane to navigate."),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},"script")," String. The script to execute."),(0,l.kt)("li",{parentName:"ul"},"Returns ",(0,l.kt)("strong",{parentName:"li"},"Promise","<","Any",">"),".")),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-javascript"},"var res = await beaker.panes.executeJavaScript(pane.id, 'alert(\"hello!\")')\nconsole.log(res) // undefined\nvar res = await beaker.panes.executeJavaScript(pane.id, 'window.location.toString()')\nconsole.log(typeof res) // string\n")),(0,l.kt)("h3",{id:"beakerpanesinjectcsspaneid-styles"},"beaker.panes.injectCss(paneId, styles)"),(0,l.kt)("p",null,"Inserts CSS into a different pane. The given pane must be attached."),(0,l.kt)("p",null,"Requires permission from the user."),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},"paneId")," Number. The ID of the pane to navigate."),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},"styles")," String. The styles to inject."),(0,l.kt)("li",{parentName:"ul"},"Returns ",(0,l.kt)("strong",{parentName:"li"},"Promise","<","Number",">"),". An ID which can be used to uninject the styles.")),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-javascript"},"var cssId = await beaker.panes.injectCss(pane.id, 'body { color: red; }')\nconsole.log(typeof cssId) // number\n")),(0,l.kt)("h3",{id:"beakerpanesuninjectcsspaneid-cssid"},"beaker.panes.uninjectCss(paneId, cssId)"),(0,l.kt)("p",null,"Removes injected CSS from a pane. The given pane must be attached."),(0,l.kt)("p",null,"Requires permission from the user."),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},"paneId")," Number. The ID of the pane to navigate."),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},"cssId")," Number. The ID of the injected styles to remove."),(0,l.kt)("li",{parentName:"ul"},"Returns ",(0,l.kt)("strong",{parentName:"li"},"Promise","<","Void",">"),".")),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-javascript"},"var cssId = await beaker.panes.injectCss(pane.id, 'body { color: red; }')\nconsole.log(typeof cssId) // number\nawait beaker.panes.uninjectCss(pane.id, cssId)\n")),(0,l.kt)("h3",{id:"pane-attached-event"},'"pane-attached" event'),(0,l.kt)("p",null,"Emitted when a pane has been attached to the current app."),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},"detail.id")," Number. The ID of the attached pane.")),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-js"},"beaker.panes.addEventListener('pane-attached', e => {\n  console.log(e.detail.id) // some number\n})\n")),(0,l.kt)("h3",{id:"pane-detached-event"},'"pane-detached" event'),(0,l.kt)("p",null,"Emitted when a pane has been detached from the current app."),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-js"},"beaker.panes.addEventListener('pane-detached', e => {\n  // ...\n})\n")),(0,l.kt)("h3",{id:"pane-navigated-event"},'"pane-navigated" event'),(0,l.kt)("p",null,"Emitted when the attached pane has changed its current location."),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("strong",{parentName:"li"},"detail.url")," String. The new URL of the attached pane.")),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-js"},"beaker.panes.addEventListener('pane-navigated', e => {\n  console.log('navigated to', e.detail.url)\n})\n")),(0,l.kt)("h2",{id:"example-app"},"Example app"),(0,l.kt)("p",null,"This example app can help you familiarize with the panes API."),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-html"},"<!doctype html>\n<html>\n  <head>\n    <title>Panes Demo</title>\n    <style>\n      body {\n        font-family: sans-serif;\n        text-align: center;\n        max-width: 600px;\n        margin: 0 auto;\n      }\n\n      button {\n        display: block;\n        padding: 10px;\n        width: 100%;\n        margin-bottom: 10px;\n        font-size: 16px;\n      }\n    </style>\n  </head>\n  <body>\n    <h1>beaker.panes API Demo</h1>\n    <button id=\"create\">Create Attached Pane</button>\n    <button id=\"nav1\" class=\"requires-attached\" disabled>Navigate pane to beaker.dev</button>\n    <button id=\"nav2\" class=\"requires-attached\" disabled>Navigate pane to example.com</button>\n    <button id=\"exec\" class=\"requires-attached\" disabled>Execute JS in pane</button>\n    <button id=\"inject\" class=\"requires-attached\" disabled>Inject CSS in pane</button>\n\n    <script type=\"module\">\n      function setDisabled (b) {\n        if (b) Array.from(document.body.querySelectorAll('.requires-attached'), el => el.setAttribute('disabled', 'disabled'))\n        else Array.from(document.body.querySelectorAll('.requires-attached'), el => el.removeAttribute('disabled'))\n      }\n\n      setDisabled(true)\n      beaker.panes.setAttachable()\n      beaker.panes.attachToLastActivePane().then(res => {\n        if (res) setDisabled(false)\n      })\n      const on = (el, evt, fn) => el.addEventListener(evt, fn)\n      on(create, 'click', e => beaker.panes.create('https://example.com', {attach: true}))\n      on(nav1, 'click', e => beaker.panes.navigate(beaker.panes.getAttachedPane().id, 'https://beaker.dev'))\n      on(nav2, 'click', e => beaker.panes.navigate(beaker.panes.getAttachedPane().id, 'https://example.com'))\n      on(exec, 'click', e => beaker.panes.executeJavaScript(beaker.panes.getAttachedPane().id, 'alert(\"hello from \" + location.toString())'))\n      on(inject, 'click', e => beaker.panes.injectCss(beaker.panes.getAttachedPane().id, 'body { color: red !important; }'))\n\n      beaker.panes.addEventListener('pane-attached', e => {\n        console.log('pane attached')\n        setDisabled(false)\n      })\n      beaker.panes.addEventListener('pane-detached', e => {\n        console.log('pane detached')\n        setDisabled(true)\n      })\n      beaker.panes.addEventListener('pane-navigated', e => {\n        console.log('pane has changed url', e.detail.url)\n      })\n    <\/script>\n  </body>\n</html>\n")))}m.isMDXComponent=!0}}]);