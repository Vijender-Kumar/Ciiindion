(function(){
"use strict";
var C=window.SITE_CONFIG,$=function(s){return document.querySelector(s)};
$("#yr").textContent=new Date().getFullYear();

/* Navigation */
var nav=$("#nav"),burger=$("#burger");
burger.addEventListener("click",function(){var o=nav.classList.toggle("open");burger.setAttribute("aria-expanded",o)});
nav.addEventListener("click",function(e){if(e.target.tagName==="A"){nav.classList.remove("open");burger.setAttribute("aria-expanded","false")}});
var links=[].slice.call(nav.querySelectorAll("a"));
function setActive(){var y=window.scrollY+90,cur="home";
  ["home","products","about"].forEach(function(id){if($("#"+id).offsetTop<=y)cur=id});
  if($("#location").offsetTop<=y)cur="contact";
  links.forEach(function(a){a.classList.toggle("active",a.getAttribute("href")==="#"+cur)})}
window.addEventListener("scroll",setActive,{passive:true});setActive();

/* WhatsApp + address links */
var wa="https://wa.me/"+C.WHATSAPP_NUMBER+"?text="+encodeURIComponent(C.WHATSAPP_MESSAGE);
[].forEach.call(document.querySelectorAll("[data-wa]"),function(a){a.href=wa;a.target="_blank";a.rel="noopener"});
[].forEach.call(document.querySelectorAll("[data-addr]"),function(el){if(C.ADDRESS_LINE)el.textContent=C.ADDRESS_LINE});

/* Map */
var q=encodeURIComponent(C.MAP_QUERY);
$("#map").src=C.MAP_URL||("https://www.google.com/maps?q="+q+"&z="+(C.MAP_ZOOM||16)+"&output=embed");
$("#directions").href="https://www.google.com/maps/dir/?api=1&destination="+q;
if(C.ADDRESS_LINE){var ad=$("#addr");ad.textContent=C.ADDRESS_LINE;ad.className=""}

/* Contact form */
var form=$("#form"),status=$("#status"),btn=$("#send"),started=Date.now(),busy=false;
var rules={
 name:function(v){return v.length<2?"Enter your name (at least 2 characters).":/^[\p{L}\p{M}.'\- ]+$/u.test(v)?"":"Use letters, spaces and . ' - only."},
 email:function(v){return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)?"":"Enter a valid email address, e.g. name@company.com."},
 phone:function(v){var d=v.replace(/\D/g,"");return /^[+\d][\d\s\-()]*$/.test(v)&&d.length>=10&&d.length<=15?"":"Enter a valid number with 10 to 15 digits."},
 message:function(v){return v.length<10?"Enter a message (at least 10 characters).":""}
};
function check(n){var el=form.elements[n],m=rules[n](el.value.trim());
  form.querySelector('[data-for="'+n+'"]').textContent=m;el.classList.toggle("invalid",!!m);el.setAttribute("aria-invalid",!!m);return !m}
Object.keys(rules).forEach(function(n){form.elements[n].addEventListener("blur",function(){check(n)})});
function show(t,c){status.className=c;status.textContent=t}
function busyUI(b){busy=b;btn.disabled=b;btn.querySelector(".spin").hidden=!b;$("#sendtxt").textContent=b?"Sending…":"Send message"}
var OK="Thank you for contacting CIIINDION! Your message has been submitted successfully. Our team will get back to you soon.",
    BAD="Sorry, we couldn't submit your enquiry due to a technical issue. Please try again or contact us directly at "+C.PHONE+".";
form.addEventListener("submit",function(e){
  e.preventDefault();if(busy)return;
  var ok=Object.keys(rules).map(check).every(Boolean);
  if(!ok){show("Please correct the highlighted fields.","bad");return}
  if(form.elements.website.value)return; /* honeypot: bots get no feedback */
  if(/PASTE_APPS_SCRIPT/.test(C.APPS_SCRIPT_URL)){show(BAD,"bad");console.error("Set APPS_SCRIPT_URL in js/config.js");return}
  busyUI(true);show("","");
  var body=JSON.stringify({name:form.elements.name.value.trim(),email:form.elements.email.value.trim(),phone:form.elements.phone.value.trim(),
    message:form.elements.message.value.trim(),website:"",elapsed:Date.now()-started});
  var ctl=new AbortController(),t=setTimeout(function(){ctl.abort()},20000);
  /* text/plain = "simple" request, so no CORS preflight; Apps Script's JSON reply is readable (not opaque). */
  fetch(C.APPS_SCRIPT_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:body,redirect:"follow",signal:ctl.signal})
   .then(function(r){if(!r.ok)throw new Error("HTTP "+r.status);return r.json()})
   .then(function(j){if(j&&j.status==="success"){show(OK,"ok");form.reset();started=Date.now()}else{throw new Error(j&&j.message||"Rejected")}})
   .catch(function(err){console.error(err);show(BAD,"bad")})
   .then(function(){clearTimeout(t);busyUI(false)});
});
})();
