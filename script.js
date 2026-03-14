'use strict';

let isMuted = false;
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function initAudio() {
  if (!audioCtx) { try { audioCtx = new AudioCtx(); } catch(e) {} }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

function playTone(freq, dur, type = 'sine', vol = 0.06) {
  if (isMuted || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.type = type;
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    osc.start(audioCtx.currentTime); osc.stop(audioCtx.currentTime + dur);
  } catch(e) {}
}

function playClick() { initAudio(); playTone(760,0.07,'sine',0.07); setTimeout(()=>playTone(980,0.05,'sine',0.04),45); }
function playToggle(cb) { initAudio(); if(cb&&cb.checked){playTone(580,0.09,'sine',0.06);setTimeout(()=>playTone(880,0.07,'sine',0.04),55);}else{playTone(680,0.07,'sine',0.05);setTimeout(()=>playTone(480,0.09,'sine',0.04),55);} }
function playHover() { initAudio(); playTone(1100,0.035,'sine',0.018); }
function playCardInteract() { initAudio(); playTone(420,0.045,'sine',0.035); setTimeout(()=>playTone(530,0.055,'sine',0.028),38); setTimeout(()=>playTone(640,0.07,'sine',0.025),75); }

window.playClick = playClick;
window.playToggle = playToggle;
window.playCardInteract = playCardInteract;

const muteBtn = document.getElementById('muteBtn');
const muteIcon = muteBtn ? muteBtn.querySelector('.mute-icon') : null;
if (muteBtn) {
  muteBtn.addEventListener('click', () => {
    initAudio(); isMuted = !isMuted;
    if (muteIcon) muteIcon.textContent = isMuted ? '🔇' : '🔊';
    muteBtn.title = isMuted ? 'Unmute Sound' : 'Mute Sound';
    if (!isMuted) playTone(880,0.08,'sine',0.07);
  });
}

const styleFilterBtn = document.getElementById('styleFilterBtn');
const styleFilterPanel = document.getElementById('styleFilterPanel');
if (styleFilterBtn && styleFilterPanel) {
  styleFilterBtn.addEventListener('click', (e) => {
    e.stopPropagation(); initAudio(); playClick();
    const open = styleFilterPanel.classList.toggle('open');
    styleFilterPanel.setAttribute('aria-hidden', String(!open));
  });
  document.addEventListener('click', () => { styleFilterPanel.classList.remove('open'); styleFilterPanel.setAttribute('aria-hidden','true'); });
  styleFilterPanel.addEventListener('click', (e) => e.stopPropagation());
  styleFilterPanel.querySelectorAll('.filter-item').forEach(item => item.addEventListener('click', () => { styleFilterPanel.classList.remove('open'); playClick(); }));
}

const mainNav = document.getElementById('mainNav');
window.addEventListener('scroll', () => { if(mainNav) mainNav.classList.toggle('scrolled', window.pageYOffset>50); updateActiveTab(); }, {passive:true});

const styleTabs = document.querySelectorAll('.style-tab');
const sections = document.querySelectorAll('.ui-section');

function updateActiveTab() {
  const pos = window.pageYOffset + 180;
  let activeId = null;
  sections.forEach(s => { if(pos>=s.offsetTop && pos<s.offsetTop+s.offsetHeight) activeId=s.id; });
  if (activeId) styleTabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-style')===activeId));
}

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    animateSection(entry.target);
    revealObs.unobserve(entry.target);
  });
}, {threshold:0.08, rootMargin:'0px 0px -40px 0px'});
sections.forEach(s => revealObs.observe(s));

function animateSection(section) {
  section.querySelectorAll('.ring-fill').forEach(ring => {
    const finalOff = parseFloat(ring.getAttribute('stroke-dashoffset')||'0');
    const dash = parseFloat(ring.getAttribute('stroke-dasharray')||'213.6');
    ring.style.strokeDashoffset = String(dash);
    setTimeout(() => { ring.style.transition='stroke-dashoffset 1.3s cubic-bezier(0.34,1.2,0.64,1)'; ring.style.strokeDashoffset=String(finalOff); }, 350);
  });
  section.querySelectorAll('.brutal-mini-chart .bar').forEach((bar,i) => {
    const h=bar.style.height; bar.style.height='0%';
    setTimeout(()=>{ bar.style.transition='height 0.55s cubic-bezier(0.34,1.56,0.64,1)'; bar.style.height=h; },250+i*90);
  });
  section.querySelectorAll('.clay-bar-fill').forEach((bar,i) => {
    const h=bar.style.height; bar.style.height='0%';
    setTimeout(()=>{ bar.style.transition='height 0.6s cubic-bezier(0.34,1.56,0.64,1)'; bar.style.height=h; },200+i*80);
  });
  section.querySelectorAll('.aurora-progress-fill').forEach((fill,i) => {
    const w=fill.style.width; fill.style.width='0%';
    setTimeout(()=>{ fill.style.transition='width 0.85s cubic-bezier(0.34,1.2,0.64,1)'; fill.style.width=w; },200+i*120);
  });
}

function addRipple(btn, e) {
  const old = btn.querySelector('.ripple'); if(old) old.remove();
  const rect = btn.getBoundingClientRect();
  const r = document.createElement('span'); r.className='ripple';
  const size = Math.max(rect.width,rect.height)*2.2;
  r.style.cssText=`width:${size}px;height:${size}px;top:${e.clientY-rect.top-size/2}px;left:${e.clientX-rect.left-size/2}px;`;
  btn.appendChild(r);
  r.addEventListener('animationend',()=>r.remove(),{once:true});
}
document.querySelectorAll('button').forEach(btn => btn.addEventListener('click',(e)=>{ initAudio(); addRipple(btn,e); }));

let hoverTimer=null;
document.querySelectorAll('.glass-btn,.brutal-btn,.aurora-btn,.neo-btn,.clay-btn,.gradient-btn,.dark-btn,.minimal-btn,.liquid-nav-btn,.threed-btn').forEach(el=>{
  el.addEventListener('mouseenter',()=>{ clearTimeout(hoverTimer); hoverTimer=setTimeout(playHover,80); });
});

const panel3d = document.querySelector('.threed-panel');
if (panel3d) {
  panel3d.addEventListener('mousemove',(e)=>{ const r=panel3d.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-0.5,y=(e.clientY-r.top)/r.height-0.5; panel3d.style.transition='transform 0.08s ease'; panel3d.style.transform=`perspective(900px) rotateX(${-y*12}deg) rotateY(${x*16}deg) translateZ(12px)`; });
  panel3d.addEventListener('mouseleave',()=>{ panel3d.style.transition='transform 0.6s cubic-bezier(0.23,1,0.32,1)'; panel3d.style.transform='perspective(900px) rotateX(2deg) rotateY(-2deg)'; });
}

document.querySelectorAll('.glass-card').forEach(card=>{
  card.addEventListener('mousemove',(e)=>{ const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-0.5,y=(e.clientY-r.top)/r.height-0.5; card.style.transform=`translateY(-4px) rotateX(${-y*4}deg) rotateY(${x*4}deg)`; });
  card.addEventListener('mouseleave',()=>{ card.style.transform=''; });
});

document.querySelectorAll('.liquid-card').forEach(card=>{
  card.addEventListener('mousemove',(e)=>{ const r=card.getBoundingClientRect(),x=((e.clientX-r.left)/r.width)*100,y=((e.clientY-r.top)/r.height)*100,g=card.querySelector('.liquid-card-glow'); if(g) g.style.background=`radial-gradient(ellipse at ${x}% ${y}%, rgba(255,255,255,0.5), transparent 55%)`; });
});

document.querySelectorAll('.liquid-blob-card').forEach(card=>{
  card.addEventListener('mousemove',(e)=>{ const r=card.getBoundingClientRect(),x=((e.clientX-r.left)/r.width)*100,y=((e.clientY-r.top)/r.height)*100,s=card.querySelector('.blob-shimmer'); if(s) s.style.background=`radial-gradient(ellipse at ${x}% ${y}%, rgba(255,255,255,0.55), rgba(255,255,255,0.1) 35%, transparent 65%)`; });
  card.addEventListener('mouseleave',()=>{ const s=card.querySelector('.blob-shimmer'); if(s) s.style.background=''; });
});

function createParticle(x,y,color) {
  const p=document.createElement('div');
  p.style.cssText=`position:fixed;width:5px;height:5px;border-radius:50%;background:${color};pointer-events:none;z-index:9999;left:${x}px;top:${y}px;box-shadow:0 0 8px ${color};`;
  document.body.appendChild(p);
  const a=Math.random()*Math.PI*2,d=Math.random()*70+25,dur=Math.random()*500+350;
  p.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d}px) scale(0)`,opacity:0}],{duration:dur,easing:'ease-out',fill:'forwards'}).onfinish=()=>p.remove();
}

document.querySelectorAll('.aurora-btn').forEach(btn=>{ btn.addEventListener('click',(e)=>{ const cols=['#00ffcc','#7b00ff','#ff60aa','#60ff80','#00ccff'],c=cols[Math.floor(Math.random()*cols.length)]; for(let i=0;i<8;i++) setTimeout(()=>createParticle(e.clientX,e.clientY,c),i*28); }); });
document.querySelectorAll('.liquid-bubble').forEach(btn=>{ btn.addEventListener('click',(e)=>{ const cols=['#ff00cc','#00ddff','#ffaa00','#aa00ff','#00ffaa'],c=cols[Math.floor(Math.random()*cols.length)]; for(let i=0;i<10;i++) setTimeout(()=>createParticle(e.clientX,e.clientY,c),i*22); }); });

document.querySelectorAll('[tabindex="0"]').forEach(el=>{
  el.addEventListener('keydown',(e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); el.click(); initAudio(); playCardInteract(); } });
});

document.querySelectorAll('.toggle-input').forEach(input=>{
  input.addEventListener('focus',()=>{ const t=input.nextElementSibling; if(t){t.style.outline='2px solid rgba(123,97,255,0.7)';t.style.outlineOffset='2px';} });
  input.addEventListener('blur',()=>{ const t=input.nextElementSibling; if(t){t.style.outline='';t.style.outlineOffset='';} });
});

const primaryCta = document.querySelector('.primary-cta');
if (primaryCta) {
  let dir=1,intensity=0.4;
  (function pulse(){ intensity+=dir*0.004; if(intensity>0.65)dir=-1; if(intensity<0.28)dir=1; primaryCta.style.boxShadow=`0 8px 32px rgba(123,97,255,${intensity.toFixed(3)})`; requestAnimationFrame(pulse); })();
}

document.querySelectorAll('.dark-card-circuit').forEach(circuit=>{
  let off=0;
  (function drift(){ off=(off+0.25)%20; circuit.style.backgroundPosition=`${off}px ${off}px, ${-off}px ${off}px`; requestAnimationFrame(drift); })();
});

document.querySelectorAll('.clay-app-card,.clay-btn').forEach(el=>el.addEventListener('mouseenter',()=>{ initAudio(); playHover(); }));

const auroraObs = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{ if(!entry.isIntersecting)return; entry.target.querySelectorAll('.aurora-stat-val').forEach(el=>{ const txt=el.textContent.trim(),orig=txt; if(txt==='2,450'){const s=performance.now();(function t(now){const p=Math.min((now-s)/1300,1),e=1-Math.pow(1-p,3);el.textContent=Math.round(2450*e).toLocaleString();if(p<1)requestAnimationFrame(t);else el.textContent=orig;})(s);} if(txt==='120'){const s=performance.now();(function t(now){const p=Math.min((now-s)/1000,1),e=1-Math.pow(1-p,3);el.textContent=Math.round(120*e);if(p<1)requestAnimationFrame(t);else el.textContent=orig;})(s);} }); auroraObs.unobserve(entry.target); });
},{threshold:0.4});
const auroraSec=document.getElementById('aurora'); if(auroraSec) auroraObs.observe(auroraSec);

document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',function(e){ const target=document.querySelector(this.getAttribute('href')); if(!target)return; e.preventDefault(); const off=target.id==='hero'?0:130; window.scrollTo({top:target.getBoundingClientRect().top+window.pageYOffset-off,behavior:'smooth'}); initAudio(); playClick(); });
});

document.addEventListener('DOMContentLoaded',()=>{
  updateActiveTab();
  document.body.insertAdjacentHTML('afterbegin','<svg style="width:0;height:0;position:absolute;overflow:hidden" aria-hidden="true"><defs><linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#7b61ff"/><stop offset="100%" stop-color="#00d4ff"/></linearGradient><linearGradient id="darkGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00d4ff"/><stop offset="50%" stop-color="#7b61ff"/><stop offset="100%" stop-color="#ff60aa"/></linearGradient></defs></svg>');
  console.log('%c UIVerse ✦ ','background:#7b61ff;color:#fff;font-weight:bold;padding:4px 8px;border-radius:4px;');
});

window.addEventListener('resize', updateActiveTab, {passive:true});
