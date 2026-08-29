// ═══ FutureTrack Teacher Research Initiative — page logic ═══════

// Single source of truth for the official application form URL.
const TEACHER_APPLICATION_FORM_URL = "https://forms.gle/ckmBFMoYPyfYpQMn8";

document.querySelectorAll('.js-apply-btn').forEach(function(btn){
  btn.href = TEACHER_APPLICATION_FORM_URL;
  btn.target = '_blank';
  btn.rel = 'noopener';
});

// ── FAQ accordion ────────────────────────────────────────────────
document.querySelectorAll('.tr-faq-item').forEach(function(item){
  var q = item.querySelector('.tr-faq-q');
  var a = item.querySelector('.tr-faq-a');
  q.addEventListener('click', function(){
    var isOpen = item.classList.contains('open');
    document.querySelectorAll('.tr-faq-item.open').forEach(function(other){
      if (other !== item){
        other.classList.remove('open');
        other.querySelector('.tr-faq-a').style.maxHeight = null;
        other.querySelector('.tr-faq-q').setAttribute('aria-expanded','false');
      }
    });
    if (isOpen){
      item.classList.remove('open');
      a.style.maxHeight = null;
      q.setAttribute('aria-expanded','false');
    } else {
      item.classList.add('open');
      a.style.maxHeight = a.scrollHeight + 'px';
      q.setAttribute('aria-expanded','true');
    }
  });
});

// ── Floating apply button ─────────────────────────────────────────
(function(){
  var floatBtn = document.getElementById('trFloatApply');
  if (!floatBtn) return;
  var hero = document.getElementById('home');
  var footer = document.querySelector('.footer');

  var pastHero = false;
  var nearFooter = false;

  function sync(){
    floatBtn.classList.toggle('show', pastHero && !nearFooter);
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function(entries){
      pastHero = !entries[0].isIntersecting;
      sync();
    }, {rootMargin: '-80% 0px 0px 0px'}).observe(hero);

    new IntersectionObserver(function(entries){
      nearFooter = entries[0].isIntersecting;
      sync();
    }, {rootMargin: '0px 0px -20% 0px'}).observe(footer);
  } else {
    pastHero = true;
    sync();
  }
})();

// ── Share button (Web Share API with clipboard fallback) ─────────
var shareBtn = document.getElementById('trShareBtn');
if (shareBtn) {
  shareBtn.addEventListener('click', function(){
    var shareData = {
      title: 'FutureTrack Teacher Research Initiative',
      text: 'Turn student screen time into learning time — join FutureTrack as a research teacher.',
      url: window.location.href
    };
    if (navigator.share) {
      navigator.share(shareData).catch(function(){});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareData.url).then(function(){
        shareBtn.textContent = 'Link Copied!';
        setTimeout(function(){ shareBtn.textContent = 'Share This Opportunity'; }, 2000);
      });
    }
  });
}
