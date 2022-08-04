
let highscore_share = 0;
var savedscore = getCookie("highscore");
if(savedscore != ""){
   highscore_share = parseInt(savedscore);
}


let homePage = chrome.runtime.getManifest().homepage_url;
let shareText = "I just scored "+highscore_share+" points in the HTML5 Flappy Bird game! ";
let Fb = "https://facebook.com/sharer/sharer.php?u=" + encodeURI(homePage);
let Twitter = "https://twitter.com/intent/tweet/?text=" + encodeURI(shareText) + "&url=" + encodeURI(homePage)+"&via=w3technic";
let sendMail = "mailto:?subject=" + encodeURI(shareText) + "&body=" + encodeURI(homePage);
let Pinterest = "https://pinterest.com/pin/create/button/?url=" + encodeURI(homePage) + "&media=" + encodeURI(homePage) + "&description=" + encodeURI(shareText);
let Whatsapp = "whatsapp://send?text=" + encodeURI(shareText) + encodeURI(homePage);
let VK = "http://vk.com/share.php?title=" + encodeURI(shareText) + "&url=" + encodeURI(homePage);
let Telegram = "https://telegram.me/share/url?text=" + encodeURI(shareText) + "&url=" + encodeURI(homePage);


var myParam = location.search.split('mode=')[1];
var fullBtn = document.querySelector("#fullbtn");

var coverEle = document.querySelectorAll(".cover");
if(myParam == "full"){
    fullBtn.innerHTML = "Online/mobile";
	
    fullBtn.setAttribute("href", "https://flappybird.w3technic.com"); 
	

}else{
    fullBtn.setAttribute("href", "index.html?mode=full");
    [].forEach.call(coverEle, function(div) {
        // do whatever
        div.style.display = "none";
      });
}



document.querySelector("#more-game").setAttribute("href", "https://game.w3technic.com");


document.querySelector("#fb").setAttribute("href", Fb);
document.querySelector("#twitter").setAttribute("href", Twitter);
document.querySelector("#mail").setAttribute("href", sendMail);
document.querySelector("#pinterest").setAttribute("href", Pinterest);
document.querySelector("#whatsapp").setAttribute("href", Whatsapp);
document.querySelector("#vk").setAttribute("href", VK);
document.querySelector("#telegram").setAttribute("href", Telegram);
function getCookie(cname)
{
   var name = cname + "=";
   var ca = document.cookie.split(';');
   for(var i=0; i<ca.length; i++)
   {
      var c = ca[i].trim();
      if (c.indexOf(name)==0) return c.substring(name.length,c.length);
   }
   return "";
}


