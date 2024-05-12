let canvas = document.getElementById("stage");
let ctx = canvas.getContext("2d");

let bounds = canvas.getBoundingClientRect();
console.log(bounds);

canvas.onmousedown = function(evt) {
    console.log(evt.clientX - bounds.x, evt.clientY - bounds.y);
}








/*
let p0 = new Point(20, 400);
let p1 = new Point(300, 200);
let p2 = new Point(500, 400);
let p3 = new Point(700, 300);

function drawPoint(p)
{
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

let curve = new bzCurveCubic(p0, p1, p2, p3);

drawPoint(p0);
drawPoint(p1);
drawPoint(p2);
drawPoint(p3);


ctx.beginPath();
ctx.moveTo(p0.x, p0.y);
ctx.lineTo(p1.x, p1.y);
ctx.lineTo(p2.x, p2.y);
ctx.lineTo(p3.x, p3.y);
ctx.stroke();


ctx.strokeStyle = "blue";
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(p0.x, p0.y);

let divs = 8;
let p;
for (let i=0; i < divs; i++)
{
    p = curve.getPointAt(i/divs);
    if (p)
    {
        ctx.lineTo(p.x, p.y);
    }
}
ctx.lineTo(p3.x, p3.y);

ctx.stroke();
*/