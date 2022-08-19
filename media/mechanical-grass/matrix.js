(function(window){var Matrix2D=function(a,b,c,d,tx,ty){this.initialize(a,b,c,d,tx,ty);}
var p=Matrix2D.prototype;Matrix2D.identity=null;Matrix2D.DEG_TO_RAD=Math.PI/180;p.a=1;p.b=0;p.c=0;p.d=1;p.tx=0;p.ty=0;p.alpha=1;p.shadow=null;p.compositeOperation=null;p.initialize=function(a,b,c,d,tx,ty){if(a!=null){this.a=a;}
this.b=b||0;this.c=c||0;if(d!=null){this.d=d;}
this.tx=tx||0;this.ty=ty||0;}
p.prepend=function(a,b,c,d,tx,ty){var n11=a*this.a+b*this.c;var n12=a*this.b+b*this.d;var n21=c*this.a+d*this.c;var n22=c*this.b+d*this.d;var n31=tx*this.a+ty*this.c+this.tx;var n32=tx*this.b+ty*this.d+this.ty;this.a=n11;this.b=n12;this.c=n21;this.d=n22;this.tx=n31;this.ty=n32;}
p.append=function(a,b,c,d,tx,ty){var a1=this.a;var b1=this.b;var c1=this.c;var d1=this.d;this.a=a*a1+b*c1;this.b=a*b1+b*d1;this.c=c*a1+d*c1;this.d=c*b1+d*d1;this.tx=tx*a1+ty*c1+this.tx;this.ty=tx*b1+ty*d1+this.ty;}
p.prependMatrix=function(matrix){this.prepend(matrix.a,matrix.b,matrix.c,matrix.d,matrix.tx,matrix.ty);this.prependProperties(matrix.alpha,matrix.shadow,matrix.compositeOperation);}
p.appendMatrix=function(matrix){this.append(matrix.a,matrix.b,matrix.c,matrix.d,matrix.tx,matrix.ty);this.appendProperties(matrix.alpha,matrix.shadow,matrix.compositeOperation);}
p.prependTransform=function(x,y,scaleX,scaleY,rotation,skewX,skewY,regX,regY){if(rotation%360){var r=rotation*Matrix2D.DEG_TO_RAD;var cos=Math.cos(r);var sin=Math.sin(r);}else{cos=1;sin=0;}
if(regX||regY){this.tx-=regX;this.ty-=regY;}
if(skewX||skewY){skewX*=Matrix2D.DEG_TO_RAD;skewY*=Matrix2D.DEG_TO_RAD;this.prepend(cos*scaleX,sin*scaleX,-sin*scaleY,cos*scaleY,0,0);this.prepend(Math.cos(skewY),Math.sin(skewY),-Math.sin(skewX),Math.cos(skewX),x,y);}else{this.prepend(cos*scaleX,sin*scaleX,-sin*scaleY,cos*scaleY,x,y);}}
p.appendTransform=function(x,y,scaleX,scaleY,rotation,skewX,skewY,regX,regY){if(rotation%360==0&&scaleX==1&&scaleY==1&&skewX==0&&skewY==0){this.tx+=x-regX;this.ty+=y-regY;return;}
if(rotation%360){var r=rotation*Matrix2D.DEG_TO_RAD;var cos=Math.cos(r);var sin=Math.sin(r);}else{cos=1;sin=0;}
if(skewX||skewY){skewX*=Matrix2D.DEG_TO_RAD;skewY*=Matrix2D.DEG_TO_RAD;this.append(Math.cos(skewY),Math.sin(skewY),-Math.sin(skewX),Math.cos(skewX),x,y);this.append(cos*scaleX,sin*scaleX,-sin*scaleY,cos*scaleY,0,0);}else{this.append(cos*scaleX,sin*scaleX,-sin*scaleY,cos*scaleY,x,y);}
if(regX||regY){this.tx-=regX*this.a+regY*this.c;this.ty-=regX*this.b+regY*this.d;}}
p.rotate=function(angle){var sin=Math.sin(angle);var cos=Math.cos(angle);var n11=cos*this.a+sin*this.c;var n12=cos*this.b+sin*this.d;var n21=-sin*this.a+cos*this.c;var n22=-sin*this.b+cos*this.d;this.a=n11;this.b=n12;this.c=n21;this.d=n22;}
p.skew=function(skewX,skewY){skewX=skewX*Matrix2D.DEG_TO_RAD;skewY=skewY*Matrix2D.DEG_TO_RAD;this.append(Math.cos(skewY),Math.sin(skewY),-Math.sin(skewX),Math.cos(skewX),0,0);}
p.scale=function(x,y){this.a*=x;this.d*=y;this.tx*=x;this.ty*=y;}
p.translate=function(x,y){this.tx+=x;this.ty+=y;}
p.identity=function(){this.alpha=this.a=this.d=1;this.b=this.c=this.tx=this.ty=0;this.shadow=this.compositeOperation=null;}
p.invert=function(){var a1=this.a;var b1=this.b;var c1=this.c;var d1=this.d;var tx1=this.tx;var n=a1*d1-b1*c1;this.a=d1/n;this.b=-b1/n;this.c=-c1/n;this.d=a1/n;this.tx=(c1*this.ty-d1*tx1)/n;this.ty=-(a1*this.ty-b1*tx1)/n;}
p.isIdentity=function(){return this.tx==0&&this.ty==0&&this.a==1&&this.b==0&&this.c==0&&this.d==1;}
p.decompose=function(target){if(target==null){target={};}
target.x=this.tx;target.y=this.ty;target.scaleX=Math.sqrt(this.a*this.a+this.b*this.b);target.scaleY=Math.sqrt(this.c*this.c+this.d*this.d);var skewX=Math.atan2(-this.c,this.d);var skewY=Math.atan2(this.b,this.a);if(skewX==skewY){target.rotation=skewY/Matrix2D.DEG_TO_RAD;if(this.a<0&&this.d>=0){target.rotation+=(target.rotation<=0)?180:-180;}
target.skewX=target.skewY=0;}else{target.skewX=skewX/Matrix2D.DEG_TO_RAD;target.skewY=skewY/Matrix2D.DEG_TO_RAD;}
return target;}
p.reinitialize=function(a,b,c,d,tx,ty,alpha,shadow,compositeOperation){this.initialize(a,b,c,d,tx,ty);this.alpha=alpha||1;this.shadow=shadow;this.compositeOperation=compositeOperation;return this;}
p.appendProperties=function(alpha,shadow,compositeOperation){this.alpha*=alpha;this.shadow=shadow||this.shadow;this.compositeOperation=compositeOperation||this.compositeOperation;}
p.prependProperties=function(alpha,shadow,compositeOperation){this.alpha*=alpha;this.shadow=this.shadow||shadow;this.compositeOperation=this.compositeOperation||compositeOperation;}
p.clone=function(){var mtx=new Matrix2D(this.a,this.b,this.c,this.d,this.tx,this.ty);mtx.shadow=this.shadow;mtx.alpha=this.alpha;mtx.compositeOperation=this.compositeOperation;return mtx;}
p.toString=function(){return "[Matrix2D (a="+this.a+" b="+this.b+" c="+this.c+" d="+this.d+" tx="+this.tx+" ty="+this.ty+")]";}
Matrix2D.identity=new Matrix2D(1,0,0,1,0,0);window.Matrix2D=Matrix2D;}(window));