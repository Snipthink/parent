// Navbar scroll effect
window.addEventListener('scroll',function(){
var nav=document.getElementById('navbar');
if(window.scrollY>50) nav.classList.add('scrolled');
else nav.classList.remove('scrolled');
});

// Mobile menu
function toggleMenu(){
document.getElementById('navLinks').classList.toggle('open');
}
function closeMenu(){
document.getElementById('navLinks').classList.remove('open');
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(function(a){
a.addEventListener('click',function(e){
e.preventDefault();
var target=document.querySelector(this.getAttribute('href'));
if(target){
target.scrollIntoView({behavior:'smooth',block:'start'});
}
});
});

// Scroll animations
function checkAOS(){
var els=document.querySelectorAll('[data-aos]');
for(var i=0;i<els.length;i++){
var rect=els[i].getBoundingClientRect();
if(rect.top<window.innerHeight-80){
els[i].classList.add('visible');
}
}
}
window.addEventListener('scroll',checkAOS);
window.addEventListener('load',checkAOS);

// Counter animation
function animateCounters(){
var nums=document.querySelectorAll('.stat-num');
nums.forEach(function(el){
var target=parseInt(el.getAttribute('data-target'));
if(!target) return;
var rect=el.getBoundingClientRect();
if(rect.top>window.innerHeight||el.dataset.done) return;
el.dataset.done='1';
var current=0;
var step=Math.ceil(target/40);
var timer=setInterval(function(){
current+=step;
if(current>=target){current=target;clearInterval(timer);}
el.textContent=current;
},30);
});
}
window.addEventListener('scroll',animateCounters);
window.addEventListener('load',function(){setTimeout(animateCounters,500);});

// Active nav link highlight
window.addEventListener('scroll',function(){
var sections=document.querySelectorAll('section[id]');
var links=document.querySelectorAll('.nav-links a');
var scrollY=window.scrollY+100;

sections.forEach(function(section){
var top=section.offsetTop-100;
var bottom=top+section.offsetHeight;
var id=section.getAttribute('id');

links.forEach(function(link){
if(link.getAttribute('href')=='#'+id){
if(scrollY>=top&&scrollY<bottom){
link.style.color='#27ae60';
link.style.background='rgba(39,174,96,0.08)';
}else{
link.style.color='';
link.style.background='';
}
}
});
});
});
