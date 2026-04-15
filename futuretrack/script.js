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

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(function(a){
a.addEventListener('click',function(e){
e.preventDefault();
var t=document.querySelector(this.getAttribute('href'));
if(t) t.scrollIntoView({behavior:'smooth',block:'start'});
closeMenu();
});
});

// AOS scroll animations
function checkAOS(){
document.querySelectorAll('[data-aos]').forEach(function(el){
var r=el.getBoundingClientRect();
if(r.top<window.innerHeight-80) el.classList.add('visible');
});
}
window.addEventListener('scroll',checkAOS);
window.addEventListener('load',checkAOS);

// Counter animation
function animateCounters(){
document.querySelectorAll('.stat-num[data-target]').forEach(function(el){
var target=parseInt(el.getAttribute('data-target'));
if(!target||el.dataset.done) return;
var r=el.getBoundingClientRect();
if(r.top>window.innerHeight) return;
el.dataset.done='1';
var cur=0,step=Math.ceil(target/50);
var iv=setInterval(function(){
cur+=step;
if(cur>=target){cur=target;clearInterval(iv);}
el.textContent=cur;
},28);
});
}
window.addEventListener('scroll',animateCounters);
window.addEventListener('load',function(){setTimeout(animateCounters,600);});

// Active nav highlight
window.addEventListener('scroll',function(){
var sections=document.querySelectorAll('section[id]');
var links=document.querySelectorAll('.nav-links a');
var y=window.scrollY+100;
sections.forEach(function(s){
var top=s.offsetTop-100,bot=top+s.offsetHeight,id=s.getAttribute('id');
links.forEach(function(l){
if(l.getAttribute('href')==='#'+id){
if(y>=top&&y<bot){l.style.color='#46d5f9';l.style.background='rgba(70,213,249,0.08)';}
else{l.style.color='';l.style.background='';}
}
});
});
});
