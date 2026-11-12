/* Ícono de la pestaña (tu logo) en TODAS las páginas */
document.querySelectorAll('link[rel~="icon"]').forEach(l=>l.remove());
[['icon','image/png'],['apple-touch-icon','']].forEach(([rel,type])=>{
  const l=document.createElement('link'); l.rel=rel; if(type) l.type=type; l.href='img/logo.png';
  document.head.appendChild(l);
});
/* ===== Páginas del sitio ===== */
const pages=[['index.html','Inicio','inicio'],['sobre-mi.html','Sobre mí','sobre-mi'],['proyectos.html','Proyectos','proyectos'],
 ['portafolio.html','Portafolio','portafolio'],['servicios.html','Servicios','servicios'],['contacto.html','Contacto','contacto']];
const current=document.body.dataset.page;
const firstVisit=true;   /* el loader aparece en cada cambio de página */

/* ===== Elementos compartidos (fondo, loader, cursor, lightbox, menú, pie) ===== */
document.body.insertAdjacentHTML('afterbegin',`
<div class="bg-fx"><i></i><i></i><i></i></div>
<div id="cursor"><svg viewBox="0 0 24 24"><path d="M2 22l1.5-6L18 1.5l4.5 4.5L8 20.5 2 22z"/></svg></div>
<div id="lightbox"><button id="lb-close">✕</button><div class="lb-box" id="lb-content"></div></div>
<button id="sound-btn" aria-label="Activar o silenciar el sonido" title="Sonido"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path class="w" d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/><path class="x" d="M17 9l5 6M22 9l-5 6"/></svg></button>
<button id="to-top" aria-label="Volver arriba" title="Volver arriba"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>
<div id="scroll-track"><div id="scroll-fill"></div></div>
<nav id="nav"><div class="wrap">
  <a href="index.html" class="brand">IVANA <span>PECH LEE</span></a>
  <ul class="nav-links" id="navLinks">${pages.map(p=>`<li><a href="${p[0]}" class="${p[2]===current?'active':''}">${p[1]}</a></li>`).join('')}</ul>
  <button id="menu-btn" aria-label="Menú"><svg viewBox="0 0 24 16" width="22" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1,2 Q6,5 12,2 T23,3"/><path d="M1,8 Q6,11 12,8 T23,9"/><path d="M1,14 Q6,17 12,14 T23,15"/></svg></button>
</div></nav>`);
document.body.insertAdjacentHTML('beforeend',`<footer><div class="sig-ph"><img src="img/firma.png" alt="Logo de Ivana Pech Lee" onerror="this.closest('.sig-ph').remove()"></div><div class="foot-links"><a href="servicios.html#terminos">Términos y condiciones</a></div>© 2026 IVANA PECH LEE — ARTISTA 2D Y 3D · ANIMACIÓN Y CONTENIDO VISUAL</footer>`);

/* ===== Loader (solo la primera vez por sesión) ===== */
const loader=document.getElementById('loader');
if(loader){
  window.addEventListener('load',()=>setTimeout(()=>{loader.classList.add('hide');sfx.ready();window.loaderDone=true;document.dispatchEvent(new Event('loader-done'));},2600));
  const uPath=document.querySelector('.uline path'), uPencil=document.querySelector('.loader-pencil');
  const uLen=uPath.getTotalLength(); uPath.style.strokeDasharray=uLen; uPath.style.strokeDashoffset=uLen;
  let uStart=null; const uDur=1200,uHold=250;
  const uStep=ts=>{
    if(loader.classList.contains('hide')) return;
    if(uStart===null) uStart=ts;
    const el=ts-uStart; let t;
    if(el<uDur){t=el/uDur;uPencil.style.opacity=1;}
    else if(el<uDur+uHold){t=1;uPencil.style.opacity=(el-uDur)<uHold*.6?1:0;}
    else{uStart=ts;t=0;}
    const d=t*uLen,p1=uPath.getPointAtLength(d),p2=uPath.getPointAtLength(Math.min(d+1,uLen));
    uPath.style.strokeDashoffset=uLen*(1-t);
    uPencil.style.left=(p1.x-2)+'px'; uPencil.style.top=(p1.y-22)+'px';
    uPencil.style.transform=`rotate(${Math.atan2(p2.y-p1.y,p2.x-p1.x)*180/Math.PI}deg)`;
    requestAnimationFrame(uStep);
  };
  requestAnimationFrame(uStep);
}

/* ===== Cursor y estela ===== */
const cur=document.getElementById('cursor');
let lastStar=0;
window.addEventListener('mousemove',e=>{
  cur.style.left=e.clientX+'px'; cur.style.top=e.clientY+'px';
  const now=Date.now();
  if(now-lastStar>=85){
    lastStar=now;
    const s=document.createElement('div'); s.className='ink-trail';
    s.style.left=e.clientX+'px'; s.style.top=e.clientY+'px';
    document.body.appendChild(s); setTimeout(()=>s.remove(),650);
  }
});

/* ===== Sonido: efectos sintetizados con Web Audio (no necesita archivos) ===== */
let actx,master,noiseBuf,soundOn=true;
try{soundOn=localStorage.getItem('snd')!=='0';}catch(e){}
const PENTA=[523.25,587.33,659.25,783.99,880,1046.5,1174.66,1318.5];   /* escala pentatónica: suena bien en cualquier orden */
function audioInit(){
  if(!actx){
    actx=new (window.AudioContext||window.webkitAudioContext)();
    const comp=actx.createDynamicsCompressor(); comp.threshold.value=-8; comp.knee.value=10; comp.ratio.value=6;
    master=actx.createGain(); master.gain.value=2.4;   /* VOLUMEN GENERAL: sube o baja este número */
    master.connect(comp); comp.connect(actx.destination);
    const len=Math.floor(actx.sampleRate*.5); noiseBuf=actx.createBuffer(1,len,actx.sampleRate);
    const d=noiseBuf.getChannelData(0); for(let i=0;i<len;i++) d[i]=Math.random()*2-1;
  }
  if(actx.state==='suspended') actx.resume();
}
const ok=()=>soundOn&&actx&&actx.state==='running';
function panned(g,pan){
  if(pan&&actx.createStereoPanner){const p=actx.createStereoPanner(); p.pan.value=pan; g.connect(p); return p;}
  return g;
}
function tone(f,{type='sine',dur=.12,vol=.05,to=null,delay=0,pan=0}={}){
  if(!ok()) return;
  const t=actx.currentTime+delay, o=actx.createOscillator(), g=actx.createGain();
  o.type=type; o.frequency.setValueAtTime(f,t);
  if(to) o.frequency.exponentialRampToValueAtTime(to,t+dur);
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.008); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g); panned(g,pan).connect(master); o.start(t); o.stop(t+dur+.02);
}
function swish({from=1200,to=3200,dur=.22,vol=.05,pan=0,delay=0}={}){   /* "trazo" de lápiz / aire */
  if(!ok()) return;
  const t=actx.currentTime+delay, src=actx.createBufferSource(); src.buffer=noiseBuf;
  const bp=actx.createBiquadFilter(); bp.type='bandpass'; bp.Q.value=4;
  bp.frequency.setValueAtTime(from,t); bp.frequency.exponentialRampToValueAtTime(to,t+dur);
  const g=actx.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+dur*.4); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  src.connect(bp); bp.connect(g); panned(g,pan).connect(master); src.start(t); src.stop(t+dur+.05);
}
const sfx={
  hover(el,pan=0){   /* la nota depende del botón (su posición) y del lado de la pantalla donde está el mouse */
    const i=el&&el.parentElement?[...el.parentElement.children].indexOf(el):0;
    tone(PENTA[(Math.max(i,0)*2+Math.floor(Math.random()*3))%PENTA.length],{type:'triangle',dur:.12,vol:.05,pan});
  },
  click(){ tone(700,{to:180,dur:.14,vol:.07}); swish({from:2500,to:900,dur:.09,vol:.03}); },
  nav(){ swish({from:500,to:4200,dur:.28,vol:.07}); tone(392,{dur:.2,vol:.04,to:784}); },
  open(){ swish({from:800,to:3000,dur:.25,vol:.06}); tone(659,{dur:.16,vol:.04,delay:.03}); tone(988,{dur:.2,vol:.035,delay:.09}); },
  close(){ swish({from:3000,to:700,dur:.2,vol:.05}); tone(523,{dur:.14,vol:.035,to:330}); },
  next(){ swish({from:900,to:3500,dur:.22,vol:.05,pan:.5}); tone(880,{type:'triangle',dur:.1,vol:.04,pan:.5}); },
  prev(){ swish({from:3500,to:900,dur:.22,vol:.05,pan:-.5}); tone(660,{type:'triangle',dur:.1,vol:.04,pan:-.5}); },
  ready(){ [523.25,659.25,783.99,1046.5].forEach((f,i)=>tone(f,{type:'triangle',dur:.28,vol:.04,delay:i*.09})); },
  success(){ [659.25,880,1318.5].forEach((f,i)=>tone(f,{dur:.3,vol:.05,delay:i*.1})); }
};
['pointerdown','keydown','touchstart'].forEach(ev=>window.addEventListener(ev,audioInit,{passive:true}));
try{audioInit();}catch(e){}

/* sonido al pasar el mouse por botones y tarjetas (nunca en espacios vacíos) */
const HOVER_SEL='a,button,.lb,.ph-img,.serv-card,.car-card,.home-card,.pf-frame';
let lastHover=null,lastTick=0;
document.addEventListener('mouseover',e=>{
  const el=e.target.closest(HOVER_SEL);
  cur.classList.toggle('hover',!!el);
  cur.classList.toggle('on-video',!!e.target.closest('video'));
  if(el!==lastHover){
    lastHover=el;
    const now=Date.now();
    if(el&&!el.closest('#terminos')&&now-lastTick>60){lastTick=now;sfx.hover(el,(e.clientX/innerWidth*2-1)*.6);}
  }
});

/* sonido al hacer clic (y pequeña pausa al cambiar de página para que se escuche) */
document.addEventListener('click',e=>{
  if(e.target.closest('#lb-close,#sound-btn,#terminos,#svc-modal')) return;   /* términos y condiciones: sin sonido */
  const btn=e.target.closest('button'), a=e.target.closest('a[href]');
  if(e.target.closest('.lb')&&!btn&&!a) return;          /* la lightbox pone su propio sonido */
  if(a&&!a.target&&e.button===0&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey){
    const u=new URL(a.href,location.href);
    if(u.pathname.endsWith('.html')&&u.pathname!==location.pathname&&ok()){
      e.preventDefault(); sfx.nav(); setTimeout(()=>{location.href=a.href;},180); return;
    }
  }
  if(btn){ if(btn.id==='carPrev') sfx.prev(); else if(btn.id==='carNext') sfx.next(); else sfx.click(); }
  else if(a) sfx.click();
});

/* botón para silenciar / activar el sonido */
const sbtn=document.getElementById('sound-btn');
const paintSound=()=>{sbtn.classList.toggle('off',!soundOn);sbtn.setAttribute('aria-pressed',String(soundOn));};
paintSound();
sbtn.addEventListener('click',()=>{
  soundOn=!soundOn;
  try{localStorage.setItem('snd',soundOn?'1':'0');}catch(e){}
  paintSound();
  if(soundOn){audioInit();sfx.click();}
});

/* ===== Línea lateral: cuánto falta de la página ===== */
const sfill=document.getElementById('scroll-fill'), strack=document.getElementById('scroll-track'), toTop=document.getElementById('to-top');
toTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
const updateBar=()=>{
  const max=document.documentElement.scrollHeight-innerHeight;
  sfill.style.height=(max>0?Math.min(scrollY/max,1)*100:0)+'%';
  strack.classList.toggle('idle',max<=0);
  toTop.classList.toggle('show',scrollY>500);   /* la flecha aparece al bajar */
};
window.addEventListener('scroll',updateBar,{passive:true});
window.addEventListener('resize',updateBar);
window.addEventListener('load',updateBar);
new ResizeObserver(updateBar).observe(document.body);   /* el contenido se carga después: se recalcula */
updateBar();

/* ===== Menú, scroll, reveal ===== */
const navLinks=document.getElementById('navLinks');
document.getElementById('menu-btn').addEventListener('click',()=>navLinks.classList.toggle('open'));
const nav=document.getElementById('nav');
const onScroll=()=>nav.classList.toggle('scrolled',window.scrollY>40);
window.addEventListener('scroll',onScroll); onScroll();
const obs=new IntersectionObserver(es=>es.forEach(en=>{
  const t=en.target; if(!en.isIntersecting||t.classList.contains('show')) return;
  const i=Math.min([...t.parentElement.children].indexOf(t),7);   /* retraso según su posición */
  t.style.transitionDelay=(i*90)+'ms'; t.classList.add('show'); obs.unobserve(t);
  setTimeout(()=>t.style.transitionDelay='',900+i*90);
}),{threshold:0});
const watchReveal=()=>document.querySelectorAll('.reveal:not(.show)').forEach(el=>obs.observe(el));
watchReveal();

/* ===== Lightbox (delegado: funciona con contenido dinámico) ===== */
const lb=document.getElementById('lightbox'), lbC=document.getElementById('lb-content');
const closeLB=()=>{if(lb.classList.contains('open')){lb.classList.remove('open');sfx.close();}};
document.getElementById('lb-close').addEventListener('click',closeLB);
lb.addEventListener('click',e=>{if(e.target===lb)closeLB();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLB();});
document.addEventListener('click',e=>{
  const el=e.target.closest('.lb'); if(!el||e.target.closest('a,button,video')) return;
  const img=el.querySelector('img'), title=el.dataset.title||'Imagen', desc=el.dataset.desc;
  lbC.innerHTML=img?`<img src="${img.src}" alt="${title}"><div class="lb-desc">${title}${desc?`<br>${desc}`:''}</div>`:`<b>${title}</b>`+(desc?`<div class="lb-desc">${desc}</div>`:'');
  lb.classList.add('open'); sfx.open();
});

/* ===== PORTAFOLIO: datos compartidos (portafolio, categorías y demoreel) ===== */
const IMG='img/';

/* ===== VIDEOS EN YOUTUBE =====
   Para cada video pesado, pega aquí su enlace de YouTube (entre las comillas).
   - Si el enlace está vacío (''), el video se reproduce desde la carpeta videos/ como antes.
   - Si tiene enlace, en la página sale una portada con botón ▶ y al hacer clic se abre el video en YouTube.
   - La portada se toma sola de YouTube. Si quieres otra imagen: ['enlace','mi-portada.jpg'] (el archivo va en la carpeta img/). */
const YT={
  'demoreel.mp4':['https://youtu.be/m2MERpaP0tM','portada-demoreel.PNG'],
  'javi.mp4':'https://youtu.be/yQT7oiLGN2Q',              /* ← iluminación y render */
  'morado.mp4':'https://youtu.be/S0QL5QCBXWE',            /* ← ajedrez */
  'venta.mp4':'https://youtube.com/shorts/ocxEJthSosU',             /* ← distribuidora coreana */
  'palomita.mp4':'https://youtube.com/shorts/ACJ8EK-QjhA',          /* ← Netflix */
  'seollal.mp4':'https://youtube.com/shorts/Zd1z3SMXeSM',           /* ← Seollal */
  'miles.mp4':'https://youtu.be/Cn2TAw4_muQ',             /* ← Spider-Man motion graphics */
  'libro johana.mp4':'https://youtu.be/QzDm4UXrg0I',      /* ← intro XV años */
  'dormir.mp4':'https://youtu.be/THjV5-8kr-M',   /* ← ENLACE DE PRUEBA: bórralo (deja '') cuando pongas el tuyo */
  'yucacoreanos.mp4':'https://youtu.be/331L_Uk_JYA',
  'animacion.MOV':'',
  'kaizoo.mp4':'',
  'Afrodita.mp4':''
};
const ytId=u=>{const m=(u||'').match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/);return m?m[1]:'';};
const ytFrame=(file,title)=>{
  const [rawUrl,cover]=[].concat(YT[file]||[]); const url=(rawUrl||'').trim();
  if(!ytId(url)) return '';
  const src=cover?`img/${cover}`:`https://img.youtube.com/vi/${ytId(url)}/hqdefault.jpg`;
  return `<a class="yt-link" href="${url}" target="_blank" rel="noopener" aria-label="Ver ${title} en YouTube"><img src="${src}" alt="${title}" loading="lazy" onload="if(this.naturalHeight>this.naturalWidth)this.closest('.pf-card,.pf-reel').classList.add('is-vertical')"><span class="yt-play">▶</span><span class="yt-badge">Ver en YouTube</span></a>`;
};

document.head.insertAdjacentHTML('beforeend',`<style>
.yt-link{position:relative;display:block;border-radius:8px;overflow:hidden;background:#000;}
.yt-link img{transition:transform .5s ease,filter .3s;filter:brightness(.8);}
.yt-link:hover img{transform:scale(1.04);filter:none;}
.yt-play{position:absolute;left:50%;top:50%;width:64px;height:64px;margin:-32px 0 0 -32px;border-radius:50%;background:rgba(10,11,20,.7);border:2px solid #fff;color:#fff;display:flex;align-items:center;justify-content:center;font-size:24px;padding-left:4px;transition:.25s;}
.yt-link:hover .yt-play{background:var(--purple-2);transform:scale(1.1);}
.yt-badge{position:absolute;right:10px;bottom:10px;padding:4px 10px;border-radius:20px;background:rgba(10,11,20,.75);color:#fff;font-size:11px;}
</style>`);

const projects=[
 {cat:'demoreel',name:'Demoreel',video:'videos/demoreel.mp4',alt:'Demoreel de Ivana Pech Lee con proyectos de animación e ilustración'},
 {cat:'foto',name:'Fotografía',imgs:[
   ['foto-1.png','Fotografía de retrato | Edición Tipo Poster'],
   ['foto-2.png','Miniaturas – Fotografía | Maqueta editada para concepto de mundo de fantasía'],
   ['johana.png','Collage de Fotografía | Evento XV años']]},
 {cat:'ilustracion',name:'Ilustración Digital',imgs:[
   ['etapas.png','Proceso de ilustración – Ilustración digital | Desarrollo visual de un personaje: boceto inicial, boceto limpio, aplicación de color base y acabado final.'],
   ['tamon.png','Tamon B-Side – Ilustración de personaje | Interpretación personal de un personaje de la serie Tamon B-Side, desarrollada como ejercicio de exploración e interpretación visual'],
   ['f.png','Frankelda – Ilustración digital | Ilustración inspirada en Frankelda, realizada como pieza personal']]},
 {cat:'personajes',name:'Diseño de Personajes',imgs:[
   ['palomita.png','Comunicación del personaje – Diseño de personajes | Presentación de personaje mediante poses y expresiones, acompañada de una propuesta de aplicación gráfica desarrollada como ejercicio académico'],
   ['kiin.png','Model Sheet – Diseño de personajes | Hoja de modelo del protagonista Kiin, desarrollada para el webcómic vertical del Tren Maya, estableciendo sus características visuales, proporciones y elementos distintivos'],
   ['mestizas.png','Propuestas de personajes – Diseño de personajes | Exploración visual de tres propuestas para dos personajes de mestizas, desarrolladas con color y sombras simples para definir su apariencia y acabado final.']]},
 {cat:'Flyers',name:'Flyers',imgs:[
   ['spiderman.png','Spider-Man – Flyer | Composición tipo collage que integra al personaje de Spider-Man con diversos recursos gráficos para construir una propuesta visual dinámica y de carácter editorial'],
   ['canon.png','Canon – Flyer | Reinterpretación de Mujeres en la ventana mediante una intervención visual de estilo barroco'],
   ['cartel loandy.png','Gyeongju – Flyer informativo | Cartel informativo sobre Gyeongju, Corea del Sur, utilizando el Palacio Donggung como elemento visual principal para comunicar aspectos culturales y turísticos de la región']]},
 {cat:'3d',name:'Modelado 3D',videos:[
   ['dormir.mp4','Personaje – Modelado 3D | Animación de un personaje en una escena del cortometraje El valor de ser yo (2024), con actuación facial y movimiento sincronizado para representar un diálogo'],
   ['morado.mp4','Juego de ajedrez – Modelado 3D | Animación de una escena de ajedrez con movimiento autónomo de las piezas y desplazamiento de cámara para reforzar la dinámica y presentación de la composición'],
   ['javi.mp4','Iluminación y render –  Escenario | Modelo 3D de una habitación con diferentes iluminaciones y movimiento de cámaras.']]},
 {cat:'Reels',name:'Reels',videos:[
  ['venta.mp4','Promoción de productos coreanos – Reel publicitario | Pieza audiovisual promocional para una distribuidora coreana, enfocada en presentar y dar visibilidad a sus productos mediante contenido visual para redes sociales.'],
  ['palomita.mp4','Netflix – Reel publicitario | Propuesta audiovisual inspirada en la identidad gráfica y el estilo promocional de Netflix, desarrollada como ejercicio académico para explorar recursos de edición y comunicación publicitaria.'],
  ['seollal.mp4','Seollal – Contenido para redes sociales | Reel audiovisual realizado para las redes sociales de YucaCoreanos, enfocado en difundir la cultura y las tradiciones de Corea del Sur mediante contenido visual.']
]},
 {cat:'motion',name:'Motion Graphics',videos:[
  ['yucacoreanos.mp4','Identidad animada – YucaCoreanos | Animación del logotipo de la asociación YucaCoreanos, desarrollada para dar movimiento a su identidad visual y fortalecer su presentación audiovisual.'],
  ['miles.mp4','Spider-Man – Motion Graphics | Edición audiovisual inspirada en Spider-Man, con integración de recursos gráficos, transiciones y efectos de movimiento para crear una composición dinámica con estética de contenido digital para redes sociales.'],
  ['libro johana.mp4','Intro audiovisual – XV años | Animación de un libro que se abre y presenta fotografías de la festejada mediante una secuencia visual, diseñada como introducción para un video conmemorativo de XV años.']
]},
 {cat:'animacion',name:'Animación / Storyboard',videos:[
  ['animacion.MOV','Krampus – Storyboard | Desarrollo de storyboard basado en una canción temática de Krampus, mediante la planificación visual de escenas y secuencias para representar su narrativa.'],
  ['kaizoo.mp4','Kaizoo – Comercial animado | Video animado para comercial de la marca Kaizoo.'],
  ['Afrodita.mp4','Afrodita – Animación musical | Proyecto de animación fan desarrollado a partir de la canción Afrodita, con una propuesta visual que interpreta musicalmente la narrativa y el ritmo de la composición.']
]},
];
const catPages={foto:'foto.html',ilustracion:'ilustracion.html',personajes:'personajes.html',Flyers:'flyers.html',
  '3d':'modelado-3d.html',Reels:'reels.html',motion:'motion-graphics.html',animacion:'animacion.html'};
const cats=projects.filter(p=>p.cat!=='demoreel');
const labels={foto:'Fotografía',ilustracion:'Ilustración',personajes:'Personajes',Flyers:'Flyers',
  '3d':'Modelado 3D',Reels:'Reels',motion:'Motion',animacion:'Animación'};
const intros={
  foto:'Retrato, edición y cobertura de eventos.',
  ilustracion:'Procesos y personajes ilustrados digitalmente.',
  personajes:'Model sheets, poses y propuestas de personajes originales.',
  Flyers:'Composición gráfica, collage y diseño informativo.',
  '3d':'Personajes, escenas y modelos 3D animados.',
  Reels:'Piezas cortas de animación para redes.',
  motion:'Gráficos en movimiento para marcas y proyectos.',
  animacion:'Animación 2D, storyboard y ejercicios de movimiento.'};
const split=t=>{const i=t.indexOf(' | ');return i<0?[t,'']:[t.slice(0,i),t.slice(i+3)];};
const card=(f,a,isVid,tag='',btn='')=>{
  const [t,d]=split(a);
  const frame=isVid
    ?`<div class="pf-frame">${ytFrame(f,t)||`<video controls playsinline preload="metadata" aria-label="${t}"><source src="videos/${f}#t=0.001" type="video/mp4"></video>`}</div>`
    :`<div class="pf-frame lb" data-title="${a}"><img src="${IMG}${f}" alt="${t}" loading="lazy"></div>`;
  return `<figure class="pf-card reveal">${frame}<figcaption class="pf-cap">${tag?`<small class="pf-tag">${tag}</small>`:''}<b>${t}</b>${d?`<span>${d}</span>`:''}${btn}</figcaption></figure>`;
};
const curCat=document.body.dataset.cat;
document.addEventListener('loadedmetadata',e=>{          /* los eventos de video no "suben": se capturan */
  const v=e.target;
  if(v.tagName!=='VIDEO'||!v.closest('.pf-frame')) return;
  v.style.aspectRatio=`${v.videoWidth} / ${v.videoHeight}`;
  if(v.videoHeight>v.videoWidth) v.closest('.pf-card,.pf-reel').classList.add('is-vertical');
},true);

/* Demoreel (portafolio.html) */
const reelEl=document.getElementById('reel');
if(reelEl){
  const r=projects.find(p=>p.cat==='demoreel');
reelEl.innerHTML=`<div class="pf-frame pf-frame-demoreel">${ytFrame('demoreel.mp4','Demoreel')||`<video controls playsinline preload="metadata" aria-label="${r.alt}"><source src="${r.video}#t=0.001" type="video/mp4"></video>`}</div>`;
}

/* Menú de categorías (portafolio y páginas de categoría) */
const pfNav=document.getElementById('pfNav');
if(pfNav){
  pfNav.innerHTML=`<div class="wrap"><div class="pf-chips"><a href="portafolio.html" class="${curCat?'':'active'}">Demoreel</a>${cats.map(p=>`<a href="${catPages[p.cat]}" class="${p.cat===curCat?'active':''}">${labels[p.cat]}</a>`).join('')}</div></div>`;
  const act=pfNav.querySelector('a.active'), box=pfNav.querySelector('.pf-chips');
  if(act) box.scrollLeft=act.offsetLeft-20;
}

/* Página de una categoría (foto.html, reels.html, ...) */
const catGrid=document.getElementById('catGrid');
if(catGrid){
  const i=cats.findIndex(p=>p.cat===curCat), p=cats[i];
  document.getElementById('catTitle').textContent=p.name;
  document.getElementById('catIntro').textContent=intros[p.cat];
  catGrid.innerHTML=(p.imgs||p.videos).map(([f,a])=>card(f,a,!!p.videos)).join('');
  watchReveal();
  const prev=cats[(i-1+cats.length)%cats.length], next=cats[(i+1)%cats.length];
  document.getElementById('catPager').innerHTML=`<a class="btn ghost" href="${catPages[prev.cat]}">← ${prev.name}</a><a class="btn ghost" href="${catPages[next.cat]}">${next.name} →</a>`;
}

/* ===== SERVICIOS (solo en servicios.html) ===== */
const servGrid=document.getElementById('servGrid');
if(servGrid){
  const services=[
   ['✎','Ilustración Personalizada','Piezas únicas hechas a tu medida, desde retratos hasta escenas completas.'],
   ['◐','Diseño de Personajes','Creación de personajes originales con hojas de modelo y expresiones.'],
   ['▶','Animación 2D','Animación cuadro a cuadro o rigging para historias, redes y más.'],
   ['◆','Animación 3D','Modelado y animación 3D para proyectos y productos.'],
   ['▭','Animatic','Previsualización animada de tu historia antes de producción.'],
   ['▤','Storyboard','Planeación visual de escenas para cine, animación o publicidad.'],
   ['✳','Motion Graphics','Gráficos en movimiento para marcas, redes e intros.'],
   ['▭','Edición de Video','Edición profesional con ritmo, color y efectos.'],
   ['◈','Fotografía para Eventos','Fotografía y video de tu evento, con paquete todo incluido.'],
   ['▦','Flyer','Diseño de flyers y material promocional impreso o digital.'],
   ['◎','Contenido para Redes Sociales','Piezas visuales pensadas para tu estrategia en redes.'],
  ];
  /* Una imagen por servicio, en la carpeta img/ (el nombre va SIN extensión; acepta .png, .jpg, .jpeg o .webp) */
  const servImg={
    'Ilustración Personalizada':'servicio-ilustracion','Diseño de Personajes':'servicio-personajes',
    'Animación 2D':'servicio-2d','Animación 3D':'servicio-3d','Animatic':'servicio-animatic','Storyboard':'servicio-storyboard',
    'Motion Graphics':'servicio-motion','Edición de Video':'servicio-video','Fotografía para Eventos':'servicio-foto',
    'Flyer':'servicio-flyer','Contenido para Redes Sociales':'servicio-redes'};
  document.addEventListener('error',e=>{                       /* si la imagen no existe, prueba otra extensión */
    const im=e.target; if(!(im instanceof HTMLImageElement)||!im.dataset.base) return;
    const exts=['png','jpg','jpeg','webp'], n=+im.dataset.ext+1;
    if(n<exts.length){im.dataset.ext=n; im.src=`img/${im.dataset.base}.${exts[n]}`;} else im.remove();   /* sin imagen: se queda el ícono */
  },true);
  servGrid.innerHTML=services.map(s=>`<div class="serv-card reveal" tabindex="0" role="button" data-title="${s[1]}" data-desc="${s[2]}"><div class="serv-bg">${s[0]}${servImg[s[1]]?`<img src="img/${servImg[s[1]]}.png" alt="" loading="lazy" data-base="${servImg[s[1]]}" data-ext="0">`:''}</div><h4>${s[1]}</h4></div>`).join('');
  watchReveal();
  /* ---- Ventana con los precios de cada servicio ----
     EDITA AQUÍ tus precios (pesos mexicanos). Formato: ['Nombre de la opción', precio, 'detalle opcional']
     Si pones null en lugar del precio, muestra "A cotizar". */
  const PRICES={
    'Ilustración Personalizada':[['Busto o retrato',350,'1 personaje, fondo simple'],['Cuerpo completo',600],['Escena con fondo',900,'personajes y fondo detallado']],
    'Diseño de Personajes':[['Personaje original',700,'diseño y color'],['Hoja de modelo',1200,'poses y expresiones'],['Pack de personaje',1800,'hoja de modelo y variantes']],
    'Animación 2D':[['Loop corto',700,'3 a 5 segundos'],['Animación corta',1800,'10 a 15 segundos'],['Proyecto largo',null]],
    'Animación 3D':[['Modelo 3D sencillo',1500],['Personaje 3D',2200,'modelo sin rig'],['Animación 3D corta',2500,'hasta 10 segundos']],
    'Animatic':[['Animatic corto',900,'hasta 30 segundos'],['Animatic de 1 minuto',1600],['Animatic largo',null]],
    'Storyboard':[['10 viñetas',500],['20 viñetas',900],['Storyboard largo',null]],
    'Motion Graphics':[['Logo o intro animada',900,'hasta 5 segundos'],['Video promocional',2200,'hasta 15 segundos'],['Paquete para redes',1800,'3 piezas']],
    'Edición de Video':[['Video corto o reel',400,'hasta 1 minuto'],['Video de 5 minutos',900,'hasta 5 minutos'],['Video largo',null]],
    'Fotografía para Eventos':[['Diseño de invitación',500],['Fotos antes de la fiesta',1200,'sesión previa'],['Fotos durante la fiesta',2000],['Video corto (hasta 3 min)',900,'ceremonia, vals o fiesta'],['Video de ceremonia (hasta 10 min)',1800,'por ejemplo, iglesia'],['Paquete todo incluido',8000,'invitación, fotos, videos y página web']],
    'Flyer':[['Flyer sencillo',250],['Flyer ilustrado',450],['Cartel o póster',600]],
    'Contenido para Redes Sociales':[['Post individual',150],['Pack de 5 piezas',650],['Paquete de 12 piezas',1500]]
  };
  const money=n=>'$'+n.toLocaleString('es-MX')+' MXN';
  /* Botones que llevan al portafolio desde la ventana (cada servicio puede tener uno o más) */
  const PORT={
    'Ilustración Personalizada':[['Ver ilustraciones','ilustracion.html']],
    'Diseño de Personajes':[['Ver personajes','personajes.html']],
    'Animación 2D':[['Ver animaciones','https://www.instagram.com/reel/DPzwqxVEWDh/?cplk=YnFtc3F1cnYxOWV4']],
    'Animación 3D':[['Ver modelado 3D','modelado-3d.html']],
    'Animatic':[['Ver animatics','animacion.html']],
    'Storyboard':[['Ver storyboards','animacion.html']],
    'Motion Graphics':[['Ver motion graphics','motion-graphics.html']],
    'Edición de Video':[['Ver videos','reels.html']],
    'Fotografía para Eventos':[['Ver paquete todo incluido','https://indrawlee.github.io/Johana-Mis-XV-A-os-InDraw_Lee/']],
    'Flyer':[['Ver flyers','flyers.html']],
    'Contenido para Redes Sociales':[['Ver reels','reels.html'],['Ver flyers','flyers.html']]
  };
  document.body.insertAdjacentHTML('beforeend',`<div class="quote-modal" id="svc-modal" hidden>
    <div class="quote-box svc-box" role="dialog" aria-modal="true" aria-labelledby="svcTitle">
      <button type="button" class="quote-close" id="svcClose" aria-label="Cerrar">✕</button>
      <div class="svc-layout">
        <div class="svc-side">
          <div class="svc-banner" id="svcBanner"></div>
          <h3 id="svcTitle"></h3>
          <p id="svcDesc"></p>
          <div class="svc-from" id="svcFrom"></div>
        </div>
        <div class="svc-main">
          <ul class="svc-prices" id="svcPrices"></ul>
          <p class="svc-note">Precios aproximados en pesos mexicanos (MXN). El precio final depende de tu proyecto y se confirma en la cotización.</p>
          <div class="svc-actions" id="svcActions"></div>
        </div>
      </div>
    </div></div>`);
  const svcModal=document.getElementById('svc-modal'), svcActions=document.getElementById('svcActions');
  let svcCurrent='';
  const openSvc=card=>{
    const title=card.dataset.title, tiers=PRICES[title]||[], bg=card.querySelector('.serv-bg'), img=bg.querySelector('img');
    svcCurrent=title;
    document.getElementById('svcTitle').textContent=title;
    document.getElementById('svcDesc').textContent=card.dataset.desc;
    document.getElementById('svcBanner').innerHTML=img?`<img src="${img.src}" alt="${title}">`:`<span>${bg.firstChild.textContent}</span>`;
    const nums=tiers.map(t=>t[1]).filter(n=>typeof n==='number');
    document.getElementById('svcFrom').innerHTML=nums.length?`Desde <b>${money(Math.min(...nums))}</b>`:'Precio a cotizar';
    document.getElementById('svcPrices').innerHTML=tiers.map(([name,price,detail])=>
      `<li><span>${name}${detail?`<small>${detail}</small>`:''}</span><b>${typeof price==='number'?money(price):'A cotizar'}</b></li>`).join('');
    svcActions.innerHTML='<button type="button" class="btn" id="svcCta">Pedir cotización →</button>'+
      (PORT[title]||[]).map(([label,href])=>`<a class="btn ghost" href="${href}">${label} →</a>`).join('');
    svcModal.hidden=false; document.body.style.overflow='hidden'; sfx.open();
  };
  const closeSvc=()=>{ if(svcModal.hidden) return; svcModal.hidden=true; document.body.style.overflow=''; sfx.close(); };
  servGrid.addEventListener('click',e=>{const c=e.target.closest('.serv-card'); if(c) openSvc(c);});
  servGrid.addEventListener('keydown',e=>{
    if((e.key==='Enter'||e.key===' ')&&e.target.classList.contains('serv-card')){e.preventDefault();openSvc(e.target);}
  });
  document.getElementById('svcClose').addEventListener('click',closeSvc);
  svcModal.addEventListener('click',e=>{if(e.target===svcModal)closeSvc();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSvc();});
  svcActions.addEventListener('click',e=>{                         /* "Pedir cotización": va al formulario con el servicio elegido */
    if(!e.target.closest('#svcCta')) return;
    const sel=document.querySelector('#quoteForm select[name=servicio]'); if(sel) sel.value=svcCurrent;
    closeSvc();
    const t=document.getElementById('terminos'); if(t) t.scrollIntoView({behavior:'smooth'});
  });
}

/* ===== PROYECTOS / carrusel (solo en proyectos.html) ===== */
const carTrack=document.getElementById('carTrack');
if(carTrack){
  const lista=[
   {title:'Libro infantil 베베네 가족 여행은 이렇게',meta:'Editorial La Planta (Corea del Sur) · Remoto · 2025',img:'libro vero.png',alt:'Portada del libro infantil de Editorial La Planta',link:'https://www.instagram.com/p/DS7sEv5DWsl/?stkn=dHk1M3ZvemJsMzQw'},
   {title:'Cortometraje: El valor de ser yo',meta:'TecNM Progreso, Yucatán · 2024',img:'Milton.jpeg',alt:'Fotograma del cortometraje El valor de ser yo',link:'https://www.youtube.com/watch?v=yRpxiFb_x74'},
   {title:'Proyecto Editorial: Tren Maya',meta:'Servicio Social · TecNM Progreso, Yucatán · 2025',img:'tren maya.png',alt:'Página del proyecto editorial del Tren Maya',link:'https://canva.link/e0v3l75wvg140hk'},
   {title:'Libro Cuéntame Corea',meta:'Co-autora · identidad, raíces y memoria yuca-coreana',img:'cc.png',alt:'Portada del libro Cuéntame Corea',link:'https://drive.google.com/file/d/1pWYTzhBcmMHFAPH-EIG0BI5PrAHX17Ja/view'},
   {title:'Pekis: Apoyo emocional',meta:'Niños migrantes · Rally Latinoamericano de Innovación 2025',img:'pekis.png',alt:'Imagen del proyecto Pekis de apoyo emocional para niños migrantes',link:'https://www.youtube.com/watch?v=Jcl8fNclnyg'},
   {title:'Animación 2D para Redes Sociales',meta:'Editorial La Planta (Corea del Sur) · 2024–Actualidad · Remoto',img:'yt.png',alt:'Cuadro de animación 2D para redes sociales',link:'https://www.youtube.com/shorts/F4ewwZclo1A'},
  ];
  carTrack.innerHTML=lista.map(p=>`<a class="car-card" href="${p.link}" target="_blank" rel="noopener">
    <div class="car-img"><img src="img/${p.img}" alt="${p.alt}" loading="lazy"></div><b>${p.title}</b><small>${p.meta}</small><span class="car-arrow">Ver trabajo →</span></a>`).join('');
  document.getElementById('carPrev').addEventListener('click',()=>carTrack.scrollBy({left:-360,behavior:'smooth'}));
  document.getElementById('carNext').addEventListener('click',()=>carTrack.scrollBy({left:360,behavior:'smooth'}));
}


/* ===== Formularios: el mensaje llega a tu correo (servicio Web3Forms) =====
   1) Entra a web3forms.com, escribe ipechlee@gmail.com y pide tu Access Key: te llega por correo.
   2) Pégala abajo, en WEB3FORMS_KEY, y guarda. Es una clave pública: puede ir en el código. */
const CONTACT_EMAIL='ipechlee@gmail.com';        /* solo se usa si falla el envío (enlace para escribirte directo) */
const WEB3FORMS_KEY='425af05b-c20d-4a8a-b9a7-7079e10680eb';   /* ← aquí tu Access Key de web3forms.com */
async function sendForm(form,status,subject){
  const btn=form.querySelector('[type=submit]'), label=btn.textContent;
  const data=Object.fromEntries(new FormData(form).entries());
  if(data._honey) return;                                   /* anti-spam: los bots llenan este campo oculto */
  btn.disabled=true; btn.textContent='Enviando...'; status.className='form-status'; status.textContent='';
  try{
    const r=await fetch('https://api.web3forms.com/submit',{method:'POST',
      headers:{'Content-Type':'application/json',Accept:'application/json'},
      body:JSON.stringify({access_key:WEB3FORMS_KEY,subject,from_name:'Portafolio Ivana Pech Lee',
        name:data.nombre,email:data.email,
        message:(data.servicio?'Servicio: '+data.servicio+'\n\n':'')+(data.mensaje||'')})});
    const j=await r.json().catch(()=>({}));
    if(!r.ok||!j.success) throw new Error(j.message||'error');
    form.reset(); status.classList.add('ok');
    status.textContent='¡Listo! Tu mensaje fue enviado. Te responderé pronto al correo que dejaste.';
    if(!form.closest('#terminos')) sfx.success();
  }catch(err){
    console.warn('No se pudo enviar el formulario:',err.message);   /* aquí ves el motivo (F12 → Console) */
    const body=encodeURIComponent(`Nombre: ${data.nombre||''}\nCorreo: ${data.email||''}\n${data.servicio?'Servicio: '+data.servicio+'\n':''}\n${data.mensaje||''}`);
    status.classList.add('err');
    const mail=`<a href="mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${body}">Haz clic aquí para enviarlo desde tu correo</a>.`;
    status.innerHTML=(location.protocol==='file:'
      ?'Estás viendo la página como archivo local y así no se puede enviar: funciona cuando está publicada (por ejemplo en GitHub Pages) o con Live Server. '
      :'No se pudo enviar desde la página. ')+mail;
  }finally{ btn.disabled=false; btn.textContent=label; }
}

/* contacto.html */
const contactForm=document.getElementById('contactForm');
if(contactForm) contactForm.addEventListener('submit',e=>{
  e.preventDefault();
  sendForm(contactForm,document.getElementById('contactStatus'),'Nuevo mensaje desde tu portafolio');
});

/* servicios.html: Pedir cotización (2 efectos de JavaScript) */
const acceptTerms=document.getElementById('acceptTerms');
if(acceptTerms){
  const qBtn=document.getElementById('quoteBtn'), hint=document.getElementById('quoteHint');
  const modal=document.getElementById('quote-modal'), qForm=document.getElementById('quoteForm');
  /* Efecto 1: la casilla activa o desactiva el botón */
  const syncAccept=()=>{
    qBtn.disabled=!acceptTerms.checked;
    hint.textContent=acceptTerms.checked?'Listo, ya puedes pedir tu cotización.':'Marca la casilla para poder pedir tu cotización.';
    hint.classList.toggle('ready',acceptTerms.checked);
  };
  acceptTerms.addEventListener('change',syncAccept); syncAccept();
  /* Efecto 2: ventana con el formulario de cotización */
  const openQ=()=>{modal.hidden=false;document.body.style.overflow='hidden';qForm.querySelector('input').focus();};
  const closeQ=()=>{modal.hidden=true;document.body.style.overflow='';};
  qBtn.addEventListener('click',openQ);
  document.getElementById('qClose').addEventListener('click',closeQ);
  modal.addEventListener('click',e=>{if(e.target===modal)closeQ();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)closeQ();});
  qForm.addEventListener('submit',e=>{
    e.preventDefault();
    sendForm(qForm,document.getElementById('quoteStatus'),'Solicitud de cotización desde tu portafolio');
  });
}


/* ===== Animaciones con JavaScript ===== */
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Inicio: efecto de máquina de escribir RÁPIDO en la presentación (~1.5 s) */
const heroText=document.querySelector('.tag-bubble');
if(heroText&&!reduceMotion){
  const full=heroText.textContent.trim();
  heroText.setAttribute('aria-label',full);
  document.fonts.ready.then(()=>{
    heroText.style.minHeight=heroText.offsetHeight+'px';   /* evita que la página "salte" al escribir */
    heroText.textContent='';
    const type=()=>{
      let i=0;
      const step=()=>{
        i=Math.min(i+2,full.length);                         /* 2 letras cada 20 ms */
        heroText.textContent=full.slice(0,i)+(i<full.length?'▌':'');
        if(i<full.length) setTimeout(step,20);
      };
      step();
    };
    if(window.loaderDone||!loader) type(); else document.addEventListener('loader-done',type,{once:true});
  });
}

/* Animación 1 (términos en servicios.html): las tarjetas entran en cascada */
const termsSec=document.getElementById('terminos');
if(termsSec&&!reduceMotion){
  termsSec.querySelectorAll('.terms-list').forEach(ul=>{
    const items=[...ul.children]; items.forEach(li=>li.style.opacity=0);
    new IntersectionObserver((es,o)=>{
      if(!es[0].isIntersecting) return; o.disconnect();
      items.forEach((li,i)=>{
        li.animate([{opacity:0,transform:'translateY(28px) scale(.95)'},{opacity:1,transform:'none'}],
          {duration:650,delay:i*150,easing:'cubic-bezier(.2,.8,.2,1)',fill:'backwards'});
        li.style.opacity=1;
      });
    },{threshold:.25}).observe(ul);
  });
}

/* Animación 2 (términos y servicios): inclinación 3D con un brillo que sigue al cursor */
function tiltCards(sel,max=8){
  if(reduceMotion||!matchMedia('(hover:hover)').matches) return;
  document.querySelectorAll(sel).forEach(el=>{
    el.addEventListener('mousemove',e=>{
      const r=el.getBoundingClientRect(), px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height;
      el.style.transition='transform .15s ease-out, opacity .7s';
      el.style.transform=`perspective(700px) rotateX(${(.5-py)*max*2}deg) rotateY(${(px-.5)*max*2}deg)`;
      el.style.setProperty('--mx',(px*100)+'%'); el.style.setProperty('--my',(py*100)+'%');
    });
    el.addEventListener('mouseleave',()=>{
      el.style.transition='transform .5s ease, opacity .7s'; el.style.transform='';
      setTimeout(()=>{el.style.transition='';},520);
    });
  });
}
tiltCards('#terminos .terms-list li',7);
tiltCards('.serv-card',9);
tiltCards('.avatar-ph',8);   /* Sobre mí: la imagen con el mismo efecto que las tarjetas de servicios */

/* Inicio: el brillo recorre las letras de tu nombre siguiendo al cursor */
const wordmark=document.querySelector('.wordmark-overlay');
if(wordmark){
  const wrapLetters=node=>[...node.childNodes].forEach(n=>{
    if(n.nodeType===3){                                         /* texto: cada letra va en su <span class="ltr"> */
      const frag=document.createDocumentFragment();
      [...n.textContent].forEach(ch=>{
        if(ch===' '){frag.append(' ');return;}
        const sp=document.createElement('span'); sp.className='ltr'; sp.textContent=ch; frag.append(sp);
      });
      n.replaceWith(frag);
    }else if(n.nodeType===1&&n.tagName!=='BR') wrapLetters(n);
  });
  wrapLetters(wordmark);
  const letters=[...wordmark.querySelectorAll('.ltr')];
  if(matchMedia('(hover:hover)').matches){
    wordmark.addEventListener('mousemove',e=>letters.forEach(l=>{
      const r=l.getBoundingClientRect();
      const d=Math.hypot(e.clientX-(r.left+r.width/2),e.clientY-(r.top+r.height/2));
      l.style.setProperty('--g',Math.max(0,1-d/110).toFixed(2));   /* 1 = letra bajo el cursor, 0 = lejos */
    }));
    wordmark.addEventListener('mouseleave',()=>letters.forEach(l=>l.style.setProperty('--g',0)));
  }
}
/* Pantalla completa: el cursor normal vuelve y se oculta el cursor dibujado */
['fullscreenchange','webkitfullscreenchange'].forEach(ev=>document.addEventListener(ev,()=>{
  document.documentElement.classList.toggle('is-fs',!!(document.fullscreenElement||document.webkitFullscreenElement));
}));