"use strict";(self.webpackChunkdocs_beakerbrowser_com=self.webpackChunkdocs_beakerbrowser_com||[]).push([[700],{3905:function(e,t,r){r.d(t,{Zo:function(){return u},kt:function(){return h}});var a=r(7294);function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function n(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?n(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):n(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,a,i=function(e,t){if(null==e)return{};var r,a,i={},n=Object.keys(e);for(a=0;a<n.length;a++)r=n[a],t.indexOf(r)>=0||(i[r]=e[r]);return i}(e,t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);for(a=0;a<n.length;a++)r=n[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var p=a.createContext({}),s=function(e){var t=a.useContext(p),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},u=function(e){var t=s(e.components);return a.createElement(p.Provider,{value:t},e.children)},m="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},d=a.forwardRef((function(e,t){var r=e.components,i=e.mdxType,n=e.originalType,p=e.parentName,u=o(e,["components","mdxType","originalType","parentName"]),m=s(r),d=i,h=m["".concat(p,".").concat(d)]||m[d]||k[d]||n;return r?a.createElement(h,l(l({ref:t},u),{},{components:r})):a.createElement(h,l({ref:t},u))}));function h(e,t){var r=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var n=r.length,l=new Array(n);l[0]=d;var o={};for(var p in t)hasOwnProperty.call(t,p)&&(o[p]=t[p]);o.originalType=e,o[m]="string"==typeof e?e:i,l[1]=o;for(var s=2;s<n;s++)l[s]=r[s];return a.createElement.apply(null,l)}return a.createElement.apply(null,r)}d.displayName="MDXCreateElement"},7141:function(e,t,r){r.r(t),r.d(t,{assets:function(){return u},contentTitle:function(){return p},default:function(){return h},frontMatter:function(){return o},metadata:function(){return s},toc:function(){return m}});var a=r(7462),i=r(3366),n=(r(7294),r(3905)),l=["components"],o={title:"beaker.hyperdrive",description:"This API provides read and write access to hyperdrives."},p=void 0,s={unversionedId:"apis/beaker.hyperdrive",id:"apis/beaker.hyperdrive",title:"beaker.hyperdrive",description:"This API provides read and write access to hyperdrives.",source:"@site/docs/apis/beaker.hyperdrive.md",sourceDirName:"apis",slug:"/apis/beaker.hyperdrive",permalink:"/docs.beakerbrowser.com/apis/beaker.hyperdrive",draft:!1,editUrl:"https://github.com/Alex313031/docs.beakerbrowser.com/edit/master/docs/apis/beaker.hyperdrive.md",tags:[],version:"current",frontMatter:{title:"beaker.hyperdrive",description:"This API provides read and write access to hyperdrives."},sidebar:"docs",previous:{title:"beaker.contacts",permalink:"/docs.beakerbrowser.com/apis/beaker.contacts"},next:{title:"beaker.markdown",permalink:"/docs.beakerbrowser.com/apis/beaker.markdown"}},u={},m=[{value:"API",id:"api",level:2},{value:"beaker.hyperdrive.drive(url)",id:"beakerhyperdrivedriveurl",level:3},{value:"beaker.hyperdrive.createDrive([settings])",id:"beakerhyperdrivecreatedrivesettings",level:3},{value:"beaker.hyperdrive.forkDrive(url[, opts])",id:"beakerhyperdriveforkdriveurl-opts",level:3},{value:"beaker.hyperdrive.getInfo(url[, opts])",id:"beakerhyperdrivegetinfourl-opts",level:3},{value:"beaker.hyperdrive.stat(url[, opts])",id:"beakerhyperdrivestaturl-opts",level:3},{value:"beaker.hyperdrive.readFile(url[, opts])",id:"beakerhyperdrivereadfileurl-opts",level:3},{value:"beaker.hyperdrive.readdir(url[, opts])",id:"beakerhyperdrivereaddirurl-opts",level:3},{value:"beaker.hyperdrive.query(query)",id:"beakerhyperdrivequeryquery",level:3},{value:"beaker.hyperdrive.diff(url, other[, prefix, opts])",id:"beakerhyperdrivediffurl-other-prefix-opts",level:3},{value:"beaker.hyperdrive.configure(url, settings[, opts])",id:"beakerhyperdriveconfigureurl-settings-opts",level:3},{value:"beaker.hyperdrive.writeFile(url, data[, opts])",id:"beakerhyperdrivewritefileurl-data-opts",level:3},{value:"beaker.hyperdrive.mkdir(url[, opts])",id:"beakerhyperdrivemkdirurl-opts",level:3},{value:"beaker.hyperdrive.symlink(target, url[, opts])",id:"beakerhyperdrivesymlinktarget-url-opts",level:3},{value:"beaker.hyperdrive.mount(url, mount[, opts])",id:"beakerhyperdrivemounturl-mount-opts",level:3},{value:"beaker.hyperdrive.copy(src, dst[, opts])",id:"beakerhyperdrivecopysrc-dst-opts",level:3},{value:"beaker.hyperdrive.rename(src, dst[, opts])",id:"beakerhyperdriverenamesrc-dst-opts",level:3},{value:"beaker.hyperdrive.updateMetadata(url, metadata[, opts])",id:"beakerhyperdriveupdatemetadataurl-metadata-opts",level:3},{value:"beaker.hyperdrive.unlink(url[, opts])",id:"beakerhyperdriveunlinkurl-opts",level:3},{value:"beaker.hyperdrive.rmdir(url[, opts])",id:"beakerhyperdrivermdirurl-opts",level:3},{value:"beaker.hyperdrive.unmount(url[, opts])",id:"beakerhyperdriveunmounturl-opts",level:3},{value:"beaker.hyperdrive.deleteMetadata(url, keys[, opts])",id:"beakerhyperdrivedeletemetadataurl-keys-opts",level:3}],k={toc:m},d="wrapper";function h(e){var t=e.components,r=(0,i.Z)(e,l);return(0,n.kt)(d,(0,a.Z)({},k,r,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("p",null,"The Hyperdrive API provides read and write access to hyperdrives."),(0,n.kt)("p",null,"You can use the API by instantiating Hyperdrive instances using ",(0,n.kt)("a",{parentName:"p",href:"/docs.beakerbrowser.com/apis/beaker.hyperdrive#beakerhyperdrivedriveurl"},".drive()")," or by using the global methods. The global methods can accept paths or URLs. If you pass a path into a global method, the current drive will be used as the target. For example, if you were on a drive ",(0,n.kt)("inlineCode",{parentName:"p"},"hyper://foobar/"),", the following three would be equivalent:"),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-javascript"},"await beaker.hyperdrive.readdir('/')\nawait beaker.hyperdrive.readdir('hyper://foobar/')\nawait beaker.hyperdrive.drive('hyper://foobar/').readdir('/')\n")),(0,n.kt)("p",null,"A hyperdrive is always allowed to read and write its own files. Applications must ask permission before writing to other hyperdrives."),(0,n.kt)("h2",{id:"api"},"API"),(0,n.kt)("h3",{id:"beakerhyperdrivedriveurl"},"beaker.hyperdrive.drive(url)"),(0,n.kt)("p",null,"Create a Hyperdrive instance. The instance provides most methods in ",(0,n.kt)("inlineCode",{parentName:"p"},"beaker.hyperdrive")," but scoped to the given drive's URL. Unlike the unscoped ",(0,n.kt)("inlineCode",{parentName:"p"},"beaker.hyperdrive")," calls, only paths can be provided to the operations."),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"url")," String. The URL of the drive to access."),(0,n.kt)("li",{parentName:"ul"},"Returns ",(0,n.kt)("strong",{parentName:"li"},"Hyperdrive"),".",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"url")," String. The URL of the hyperdrive."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"version")," String. The checked-out version of the instance. Will be undefined if using latest."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"checkout"),"(version): Hyperdrive. Returns a ",(0,n.kt)("inlineCode",{parentName:"li"},"Hyperdrive")," instance at the given version."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"watch"),"(path, onChanged): EventTarget. Emits a 'changed' event when writes occur. Does not emit any change events for mounted drives within the parent drive."),(0,n.kt)("li",{parentName:"ul"},"...most methods on ",(0,n.kt)("inlineCode",{parentName:"li"},"beaker.hyperdrive"),".")))),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-javascript"},"var drive = beaker.hyperdrive.drive('hyper://1234..ef')\nawait drive.readdir('/')\n")),(0,n.kt)("h3",{id:"beakerhyperdrivecreatedrivesettings"},"beaker.hyperdrive.createDrive(","[","settings","]",")"),(0,n.kt)("p",null,"Create a new Hyperdrive."),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"settings")," Object.",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"title")," String. The title of the hyperdrive."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"description")," String. The description of the hyperdrive."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"tags")," String. A space-separated list of tags to assign to the drive in the library."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"prompt")," Boolean. Should the creation prompt show? If false, permission will still be requested."))),(0,n.kt)("li",{parentName:"ul"},"Returns ",(0,n.kt)("strong",{parentName:"li"},"Promise","<","Hyperdrive",">"),".")),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-javascript"},"var drive = await beaker.hyperdrive.createDrive({\n  title: 'My cool website',\n  description: 'Demonstrating how to create Hyperdrives'\n})\n")),(0,n.kt)("h3",{id:"beakerhyperdriveforkdriveurl-opts"},"beaker.hyperdrive.forkDrive(url","[",", opts","]",")"),(0,n.kt)("p",null,'Creates a "fork or copy drive" prompt. The user will use this to copy the files and settings of a hyperdrive into a new drive, optionally overriding some settings.'),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"url")," String. The URL of the drive to fork."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"opts")," Object.",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"detached"),' Boolean. If false, will create an "attached" fork. If true, will create a detached copy. Default false.'),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"title")," String. Overrides the title. Only applies if ",(0,n.kt)("inlineCode",{parentName:"li"},"detached")," is true."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"description")," String. Overrides the description. Only applies if ",(0,n.kt)("inlineCode",{parentName:"li"},"detached")," is true."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"tags")," String. A space-separated list of tags to assign to the drive in the library."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"prompt"),' Boolean. If true, shows the "fork" modal. If false, only asks the user for permission. Default true.'))),(0,n.kt)("li",{parentName:"ul"},"Returns ",(0,n.kt)("strong",{parentName:"li"},"Promise","<","Hyperdrive",">"),".")),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-javascript"},"var myFork = await beaker.hyperdrive.forkDrive(existingDriveUrl)\nvar myCopy = await beaker.hyperdrive.forkDrive(existingDriveUrl, {detached: true})\n")),(0,n.kt)("h3",{id:"beakerhyperdrivegetinfourl-opts"},"beaker.hyperdrive.getInfo(url","[",", opts","]",")"),(0,n.kt)("p",null,"Fetch metadata and system information about the hyperdrive."),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"url")," String. The URL of the hyperdrive to query. (Not required on ",(0,n.kt)("inlineCode",{parentName:"li"},"Hyperdrive")," objects returned by ",(0,n.kt)("a",{parentName:"li",href:"/docs.beakerbrowser.com/apis/beaker.hyperdrive#beakerhyperdrivedriveurl"},"beaker.hyperdrive.drive()"),".)"),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"opts")," Object.",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"timeout")," Number (ms). How long to wait for the operation to complete before throwing a timeout error. Defaults to 60000."))),(0,n.kt)("li",{parentName:"ul"},"Returns ",(0,n.kt)("strong",{parentName:"li"},"Promise","<","Object",">"),".",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"key")," String. The key of the hyperdrive."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"url")," String. The URL of the hyperdrive."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"writable")," Boolean. Can the local user modify the hyperdrive?"),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"version")," Number. The latest revision number of the hyperdrive."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"title")," String. The title of the hyperdrive."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"description")," String. The description of the hyperdrive.")))),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-javascript"},"var info = await beaker.hyperdrive.getInfo('hyper://1234..ef')\n")),(0,n.kt)("h3",{id:"beakerhyperdrivestaturl-opts"},"beaker.hyperdrive.stat(url","[",", opts","]",")"),(0,n.kt)("p",null,"Get metadata about a file."),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"url")," String. The url to the file."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"opts")," Object.",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"lstat")," Boolean. If the file is a symlink, give information about the symlink instead of the link target."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"timeout")," Number (ms). How long to wait for the operation to complete before throwing a timeout error. Defaults to 60000."))),(0,n.kt)("li",{parentName:"ul"},"Returns ",(0,n.kt)("strong",{parentName:"li"},"Promise","<","Object",">"),".",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"isFile()")," Function(): Boolean. Is the entry a file?"),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"isDirectory()")," Function(): Boolean. Is the entry a directory?"),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"size")," Number. The size of the file in bytes."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"blocks")," Number. The size of the file in blocks in the content hypercore."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"mtime")," Number. The timestamp of the last modification of the file."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"ctime")," Number. The timestamp of the creation of the file."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"mount")," Object. Information about the target mount if the entry is a mount.",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"key")," String. The key of the mount target."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"version")," Number. The version of the mount target, if specified."))),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"metadata")," Object. User metadata attached to the entry."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"linkname")," String. If a symlink, gives the target path.")))),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-javascript"},"var stat = await beaker.hyperdrive.stat('hyper://1234..ef/index.json')\n")),(0,n.kt)("h3",{id:"beakerhyperdrivereadfileurl-opts"},"beaker.hyperdrive.readFile(url","[",", opts","]",")"),(0,n.kt)("p",null,"Read the contents of a file."),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"url")," String. The url to the file."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"opts")," Object ","|"," String. If a String, will act as the 'encoding' option.",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"encoding")," String. Desired output encoding. May be 'binary', 'utf8', 'hex', 'json', or 'base64'. Default 'utf8'."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"timeout")," Number (ms). How long to wait for the operation to complete before throwing a timeout error. Defaults to 60000."))),(0,n.kt)("li",{parentName:"ul"},"Returns ",(0,n.kt)("strong",{parentName:"li"},"Promise","<","String ","|"," Uint8Array",">"))),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-javascript"},"var fileStr = await beaker.hyperdrive.readFile('hyper://1234..ef/foo.txt')\nvar fileObj = await beaker.hyperdrive.readFile('hyper://1234..ef/foo.json', 'json')\nvar imgBuf = await beaker.hyperdrive.readFile('hyper://1234..ef/bar.png', 'binary')\nvar imgBase64 = await beaker.hyperdrive.readFile('hyper://1234..ef/bar.png', 'base64')\n")),(0,n.kt)("h3",{id:"beakerhyperdrivereaddirurl-opts"},"beaker.hyperdrive.readdir(url","[",", opts","]",")"),(0,n.kt)("p",null,"Read the contents of a directory."),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"url")," String. The url to the directory."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"opts")," Object.",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"includeStats")," Boolean. Should the output include the 'stats' object for each entry?"),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"recursive")," Boolean. Recurse into subfolders?",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},"Note: does not recurse into child mounts."))),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"timeout")," Number (ms). How long to wait for the operation to complete before throwing a timeout error. Defaults to 60000."))),(0,n.kt)("li",{parentName:"ul"},"Returns ",(0,n.kt)("strong",{parentName:"li"},"Promise","<","Array","<","String ","|"," Object",">",">"),(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},"If an object, the shape will be ",(0,n.kt)("inlineCode",{parentName:"li"},"{ name, stat }"))))),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-javascript"},"var files = await beaker.hyperdrive.readdir('hyper://1234..ef/')\nvar allFiles = await beaker.hyperdrive.readdir('hyper://1234..ef/', {recursive: true})\nvar filesWithStats = await beaker.hyperdrive.readdir('hyper://1234..ef/', {includeStats: true})\n")),(0,n.kt)("h3",{id:"beakerhyperdrivequeryquery"},"beaker.hyperdrive.query(query)"),(0,n.kt)("p",null,"Read the contents of a drive or drives across multiple specified paths. This function can be used to read a wide range of files while filtering by multiple various attributes. If Hyperdrive were a SQL database, this would be the SELECT function."),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"query")," Object.",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"drive")," String ","|"," Array","<","String",">",". The drive(s) to query against."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"path")," String ","|"," Array","<","String",">",". The path(s) to query against. May use globbing patterns ('","*","') to specify multiple files."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"type")," String. Filters results to entries of this type. May be 'file', 'directory', or 'mount'."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"mount")," String (URL). Filters results to mounts which point to the drive specified here."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"metadata")," Object. Filters results by their metadata against the key-values specified here."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"sort")," String. Specifies which attribute to sort the results by. May be 'name', 'ctime', or 'mtime'."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"reverse")," Boolean. If true, the result order will be reversed."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"limit")," Number. Specifies a maximum number of results to return."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"offset")," Number. Specifies a starting offset within the results. Used for pagination."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"timeout")," Number (ms). How long to wait for the operation to complete before throwing a timeout error. Defaults to 60000."))),(0,n.kt)("li",{parentName:"ul"},"Returns ",(0,n.kt)("strong",{parentName:"li"},"Promise","<","Array","<","Object",">",">"),(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"type")," String. The type of the entry. Must be 'file', 'directory', or 'mount'."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"path")," String. The path of the entry relative to the queried drive."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"url")," String. The URL of the entry relative to the queried drive."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"stat")," Object. The entry's Stat object, see stat()."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"drive")," String. The URL of the queried drive."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"mount")," String. The URL of the target drive if the entry is a mount."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"origin")," Object.",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"path")," String. The path of the entry relative to its owning drive."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"drive")," String. The URL of the entry's owning drive."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"url")," String. The URL of the entry relative to its owning drive.")))))),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-javascript"},"var rootFiles = await beaker.hyperdrive.query({\n  drive: 'hyper://1234..ef',\n  path: '/*',\n  type: 'file'\n})\nvar rootImgs = await beaker.hyperdrive.query({\n  drive: 'hyper://1234..ef',\n  path: ['/*.png', '/*.jpg', '/*.jpeg']\n})\nvar postFiles = await beaker.hyperdrive.query({\n  drive: 'hyper://1234..ef',\n  path: '/microblog/*',\n  sort: 'ctime'\n})\nvar followMounts = await beaker.hyperdrive.query({\n  drive: 'hyper://1234..ef',\n  path: '/follows/*',\n  type: 'mount'\n})\nvar bobFollow = await beaker.hyperdrive.query({\n  drive: 'hyper://1234..ef',\n  path: '/follows/*',\n  mount: bobsUrl\n})\nvar commentsOnBeaker = await beaker.hyperdrive.query({\n  drive: 'hyper://1234..ef',\n  path: '/comments/*', \n  metadata: {href: 'https://beakerbrowser.com'}\n})\n")),(0,n.kt)("h3",{id:"beakerhyperdrivediffurl-other-prefix-opts"},"beaker.hyperdrive.diff(url, other","[",", prefix, opts","]",")"),(0,n.kt)("p",null,"List the changes that have occurred between two versions of the drive."),(0,n.kt)("p",null,"Note: this method can only compare drives to other versions of itself. It cannot be used to compare two different drives."),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"url")," String. The URL to diff."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"other")," Number","|","String","|","Hyperdrive. The version ID or hyperdrive instance to compare against."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"opts")," Object.",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"timeout")," Number (ms). How long to wait for the operation to complete before throwing a timeout error. Defaults to 60000."))),(0,n.kt)("li",{parentName:"ul"},"Returns ",(0,n.kt)("strong",{parentName:"li"},"Promise","<","Array","<","Object",">",">"),(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},"type String. What operation occurred. One of: 'put', 'del', 'mount', 'unmount'."),(0,n.kt)("li",{parentName:"ul"},"name String. The path of the modified entry."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"value")," Object. Information related to the change (e.g. the 'stat' object of a put file).")))),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-javascript"},"var changes = await beaker.hyperdrive.diff('hyper://1234..ef', 5) // diff latest against revision 5\n")),(0,n.kt)("h3",{id:"beakerhyperdriveconfigureurl-settings-opts"},"beaker.hyperdrive.configure(url, settings","[",", opts","]",")"),(0,n.kt)("p",null,"Update the settings and/or manifest (index.json) of the drive."),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"url")," String. The URL of the drive to configure."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"settings")," Object.",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"title")," String. The title of the drive."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"description")," String. The description of the drive."))),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"opts")," Object.",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"timeout")," Number (ms). How long to wait for the operation to complete before throwing a timeout error. Defaults to 60000."))),(0,n.kt)("li",{parentName:"ul"},"Returns ",(0,n.kt)("strong",{parentName:"li"},"Promise","<","Void",">"))),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-javascript"},"await beaker.hyperdrive.configure('hyper://1234..ef', {\n  title: 'The drive title',\n  description: 'The drive description'\n})\n")),(0,n.kt)("h3",{id:"beakerhyperdrivewritefileurl-data-opts"},"beaker.hyperdrive.writeFile(url, data","[",", opts","]",")"),(0,n.kt)("p",null,"Write a file to the drive."),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"url")," String. The URL of the file to write."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"data")," String","|","Uint8Array. The content to write."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"opts")," String","|","Object. If a string, acts as the encoding parameter.",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"encoding")," String. The encoding of the data parameter. Must be 'utf8', 'base64', 'hex', 'json', or 'binary'. Defaults to 'utf8' if data is a string and 'binary' if data is an Uint8Array."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"metadata")," Object. The metadata to write to the file. Even if unspecified"),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"timeout")," Number (ms). How long to wait for the operation to complete before throwing a timeout error. Defaults to 60000."))),(0,n.kt)("li",{parentName:"ul"},"Returns ",(0,n.kt)("strong",{parentName:"li"},"Promise","<","Void",">"))),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-javascript"},"await beaker.hyperdrive.writeFile('hyper://1234..ef/foo.txt', 'Foo')\nawait beaker.hyperdrive.writeFile('hyper://1234..ef/foo.json', {hello: 'world'}, 'json')\nawait beaker.hyperdrive.writeFile('hyper://1234..ef/foo.png', imgPngBase64, 'base64')\nawait beaker.hyperdrive.writeFile('hyper://1234..ef/foo.jpg', imgJpgUint8Array, {encoding: 'binary'})\nawait beaker.hyperdrive.writeFile('hyper://1234..ef/foo.md', '# Markdown Doc', {\n  metadata: {title: 'Markdown Doc'}\n})\n")),(0,n.kt)("h3",{id:"beakerhyperdrivemkdirurl-opts"},"beaker.hyperdrive.mkdir(url","[",", opts","]",")"),(0,n.kt)("p",null,"Create a folder on the drive."),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"url")," String. The URL of the folder to create."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"opts")," Object.",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"timeout")," Number (ms). How long to wait for the operation to complete before throwing a timeout error. Defaults to 60000."))),(0,n.kt)("li",{parentName:"ul"},"Returns ",(0,n.kt)("strong",{parentName:"li"},"Promise","<","Void",">"))),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-javascript"},"await beaker.hyperdrive.mkdir('hyper://1234..ef/sub')\n")),(0,n.kt)("h3",{id:"beakerhyperdrivesymlinktarget-url-opts"},"beaker.hyperdrive.symlink(target, url","[",", opts","]",")"),(0,n.kt)("p",null,"Create a symlink on the drive. Good luck getting the argument order right the first time!"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"target")," String. The URL which the symlink should point to."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"url")," String. Where to place the symlink."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"opts")," Object.",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"timeout")," Number (ms). How long to wait for the operation to complete before throwing a timeout error. Defaults to 60000."))),(0,n.kt)("li",{parentName:"ul"},"Returns ",(0,n.kt)("strong",{parentName:"li"},"Promise","<","Void",">"))),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-javascript"},"await beaker.hyperdrive.symlink('hyper://1234..ef/this-file-already-exists.txt', 'hyper://1234..ef/the-symlink.txt')\n")),(0,n.kt)("h3",{id:"beakerhyperdrivemounturl-mount-opts"},"beaker.hyperdrive.mount(url, mount","[",", opts","]",")"),(0,n.kt)("p",null,"Create a mount on the drive to some other drive. (Mounts are like symlinks that work across hyperdrives.) Note: we know, we know, the argument order is the opposite of symlink."),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"url")," String. Where to place the mount."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"mount")," String","|","Object","|","Hyperdrive. The drive to mount. If a String or Hyperdrive, acts as the key attribute.",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"key")," String. The key of the drive to mount."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"version")," Number","|","String. The version to pin the mount to. If undefined, the mount will point to latest."))),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"opts")," Object.",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"timeout")," Number (ms). How long to wait for the operation to complete before throwing a timeout error. Defaults to 60000."))),(0,n.kt)("li",{parentName:"ul"},"Returns ",(0,n.kt)("strong",{parentName:"li"},"Promise","<","Void",">"))),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-javascript"},"await beaker.hyperdrive.mount('hyper://1234..ef/mount', 'hyper://fedcb..12')\nawait beaker.hyperdrive.mount('hyper://1234..ef/mount2', {key: 'fedcb..12', version: 10})\n")),(0,n.kt)("h3",{id:"beakerhyperdrivecopysrc-dst-opts"},"beaker.hyperdrive.copy(src, dst","[",", opts","]",")"),(0,n.kt)("p",null,"Copy a file or folder. Works across hyperdrives."),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"src")," String. Where to copy the files from."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"dst")," String. Where to copy the files to."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"opts")," Object.",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"timeout")," Number (ms). How long to wait for the operation to complete before throwing a timeout error. Defaults to 60000."))),(0,n.kt)("li",{parentName:"ul"},"Returns ",(0,n.kt)("strong",{parentName:"li"},"Promise","<","Void",">"))),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-javascript"},"await beaker.hyperdrive.copy('hyper://1234..ef/foo.txt', 'hyper://1234..ef/bar.txt')\n")),(0,n.kt)("h3",{id:"beakerhyperdriverenamesrc-dst-opts"},"beaker.hyperdrive.rename(src, dst","[",", opts","]",")"),(0,n.kt)("p",null,"Move a file or folder. Works across hyperdrives."),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"src")," String. Where to move the files from."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"dst")," String. Where to move the files to."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"opts")," Object.",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"timeout")," Number (ms). How long to wait for the operation to complete before throwing a timeout error. Defaults to 60000."))),(0,n.kt)("li",{parentName:"ul"},"Returns ",(0,n.kt)("strong",{parentName:"li"},"Promise","<","Void",">"))),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-javascript"},"await beaker.hyperdrive.rename('hyper://1234..af/foo.txt', 'hyper://1234..af/bar.txt')\n")),(0,n.kt)("h3",{id:"beakerhyperdriveupdatemetadataurl-metadata-opts"},"beaker.hyperdrive.updateMetadata(url, metadata","[",", opts","]",")"),(0,n.kt)("p",null,"Modify the metadata on a file. Merges into the existing metadata of the file."),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"url")," String. The URL of the file to modify."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"metadata")," Object. The metadata values to set."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"opts")," Object.",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"timeout")," Number (ms). How long to wait for the operation to complete before throwing a timeout error. Defaults to 60000."))),(0,n.kt)("li",{parentName:"ul"},"Returns ",(0,n.kt)("strong",{parentName:"li"},"Promise","<","Void",">"))),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-javascript"},"await beaker.hyperdrive.updateMetadata('hyper://1234..ef/foo.txt', {title: 'Foo'})\n")),(0,n.kt)("h3",{id:"beakerhyperdriveunlinkurl-opts"},"beaker.hyperdrive.unlink(url","[",", opts","]",")"),(0,n.kt)("p",null,"Deletes a file on the drive."),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"url")," String. The URL of the file to delete."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"opts")," Object.",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"timeout")," Number (ms). How long to wait for the operation to complete before throwing a timeout error. Defaults to 60000."))),(0,n.kt)("li",{parentName:"ul"},"Returns ",(0,n.kt)("strong",{parentName:"li"},"Promise","<","Void",">"))),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-javascript"},"await beaker.hyperdrive.unlink('hyper://1234..ef/foo.txt')\n")),(0,n.kt)("h3",{id:"beakerhyperdrivermdirurl-opts"},"beaker.hyperdrive.rmdir(url","[",", opts","]",")"),(0,n.kt)("p",null,"Deletes a folder on the drive."),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"url")," String. The URL of the folder to delete."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"opts")," Object.",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"recursive")," Boolean. Delete the files within the folder if it's not empty. Default false."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"timeout")," Number (ms). How long to wait for the operation to complete before throwing a timeout error. Defaults to 60000."))),(0,n.kt)("li",{parentName:"ul"},"Returns ",(0,n.kt)("strong",{parentName:"li"},"Promise","<","Void",">"))),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-javascript"},"await beaker.hyperdrive.rmdir('hyper://1234..ef/sub')\nawait beaker.hyperdrive.rmdir('hyper://1234..ef/sub2', {recursive: true})\n")),(0,n.kt)("h3",{id:"beakerhyperdriveunmounturl-opts"},"beaker.hyperdrive.unmount(url","[",", opts","]",")"),(0,n.kt)("p",null,"Remove a mount on the drive."),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"url")," String. The URL of the mount to delete."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"opts")," Object.",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"timeout")," Number (ms). How long to wait for the operation to complete before throwing a timeout error. Defaults to 60000."))),(0,n.kt)("li",{parentName:"ul"},"Returns ",(0,n.kt)("strong",{parentName:"li"},"Promise","<","Void",">"))),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-javascript"},"await beaker.hyperdrive.unmount('hyper://1234..ef/mount')\n")),(0,n.kt)("h3",{id:"beakerhyperdrivedeletemetadataurl-keys-opts"},"beaker.hyperdrive.deleteMetadata(url, keys","[",", opts","]",")"),(0,n.kt)("p",null,"Remove metadata keys from the file."),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"url")," String. The URL of the file to modify."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"keys")," String","|","Array","<","String",">",". The key or keys to delete."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"opts")," Object.",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"timeout")," Number (ms). How long to wait for the operation to complete before throwing a timeout error. Defaults to 60000."))),(0,n.kt)("li",{parentName:"ul"},"Returns ",(0,n.kt)("strong",{parentName:"li"},"Promise","<","Void",">"))),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-javascript"},"await beaker.hyperdrive.deleteMetadata('hyper://1234..ef/foo.txt', 'title')\nawait beaker.hyperdrive.deleteMetadata('hyper://1234..ef/bar.txt', ['title', 'href'])\n")))}h.isMDXComponent=!0}}]);