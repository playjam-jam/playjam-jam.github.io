'use strict';
// Desktop practices A S D F and mouse placement, then playback and view mode. Mobile practices Type and Draw first.
// Each highlighted button gets the same snow and dotted ring. The help button only glows at the end.
// The user's score is set aside during practice and restored even after a reload.
(()=>{
const STASH='mobile12.playjam.tutorial.stash';
const $=id=>document.getElementById(id);
// four guides from the start of the first line, close together (3 slots apart), one per key A S D F
const GUIDES=[{icon:'0-1',x:1/32,y:8},{icon:'1-1',x:4/32,y:6},{icon:'2-1',x:7/32,y:7},{icon:'3-1',x:10/32,y:4}];
let i=-1,keys,ring,spot,timer,placed=0,stepAt=0,bypass=false,previousTarget=null,snowCanvas=null,practiceZoom=null;
let drawnPracticeNotes=[],notesBeforeExcerpt=null;
const stored=k=>{try{return localStorage.getItem(k);}catch{return null;}};
const store=(k,v)=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v);}catch{}};

// put the user's own score back (also after a reload in the middle of the tutorial)
function restore(){const raw=stored(STASH);if(!raw||!window.Jam)return;try{const st=JSON.parse(raw),s=window.Jam.state;s.notes=st.notes||[];s.eggs=st.eggs||[];}catch{}store(STASH,null);window.Jam.guides?.([]);window.Jam.render();}
restore();

const mobile=matchMedia('(max-width:600px) and (pointer:coarse)');
const snowFly=500,snowStagger=160,snowTail=650;
const practiceGuides=()=>mobile.matches?GUIDES.slice(0,2):GUIDES;
const spotlightTargets={1:'#play',2:'#png',3:'#save-dialog[open] .save-x',4:'#wide',6:'#wide'};
const mousePractice=14;
let restoreDeleteMode=false;
const typeSteps=new Set([5,9]);
const drawSteps={
 8:{index:1,gesture:'place',label:'터치·드래그',hint:'한 손가락으로 누르거나 끌어 보세요'},
 11:{index:2,gesture:'scroll',label:'스크롤',hint:'두 손가락을 같은 방향으로 밀어 보세요'},
 12:{index:3,gesture:'pinch',label:'오므리기·벌리기',hint:'두 손가락을 오므리거나 벌려 보세요'},
};
const mobileInputs={5:'[data-mobile-mode="type"]',7:'[data-mobile-mode="draw"]'};
function currentSpotlight(step){
 const selector=spotlightTargets[step]||(mobile.matches?mobileInputs[step]:null);
 return selector?document.querySelector(selector):null;
}
let playHint;
function build(){
 keys=document.createElement('div');keys.id='coach-keys';keys.setAttribute('aria-hidden','true');
 keys.innerHTML='<span class="touch-instruction"></span><div class="coach-caps"><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><kbd>F</kbd></div><div class="coach-steps"><i></i><i></i><i></i><i></i></div>';
 ring=document.createElement('div');ring.id='coach-ring';ring.setAttribute('aria-hidden','true');ring.innerHTML='<i class="coach-glow"></i><i class="coach-dash"></i><b class="coach-num"></b>';
 spot=document.createElement('div');spot.id='coach-spot';spot.setAttribute('aria-hidden','true');spot.hidden=true;
 playHint=document.createElement('div');
 playHint.id='coach-play-shortcut';
 playHint.setAttribute('role','status');
 playHint.hidden=true;
 document.body.append(spot,ring,keys,playHint);
 // keys: during ① any letter/number key places the next guide; other keys are paused until the save window
 addEventListener('keydown',e=>{
  if(i<0||typeSteps.has(i)&&(e.target.matches?.('.native-typing')||!e.isTrusted))return;
  if(e.key==='Escape'){if(i===4||i===13)return;if((i<=2||i===6||i===7||i===mousePractice||drawSteps[i])&&!document.querySelector('dialog[open]')){e.preventDefault();finish(false);}return;}
  if(i===3)return;                                   // the save window handles its own keys
  if(i===1&&e.code==='Space'&&e.shiftKey&&!e.metaKey&&!e.ctrlKey&&!e.altKey){
   e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)startPlayback();return;
  }
  if(e.metaKey||e.ctrlKey)return;
  e.preventDefault();e.stopImmediatePropagation();
  if(i===0&&!e.repeat&&e.key.length===1)placeNext(e.code);
 },true);
 // clicks: only the highlighted button works during ②–③; nothing during ①
 const gate=e=>{
  if(i<0||i===3||bypass)return;
  const allowed={
   1:'#play',
   2:'#png',
   4:'#wide, #edit-shared',
   13:'#wide, #edit-shared',
   5:'[data-mobile-mode="type"]',
   6:'#wide',
   7:'[data-mobile-mode="draw"]',
   9:'.native-typing, [data-mobile-mode="type"], #mobile-quick, .dock-chips',
  };
  if(i===mousePractice&&e.target.closest?.('.staff[data-row="0"]')&&!e.target.closest('button,input,.playhead'))return;
  if(allowed[i]&&e.target.closest?.(allowed[i]))return;
  if(drawSteps[i]&&e.target.closest?.('#viewport')&&!e.target.closest('input,button:not(.note)'))return;
  e.preventDefault();e.stopImmediatePropagation();
 };
 for(const t of ['pointerdown','mousedown','click','dblclick'])addEventListener(t,gate,{capture:true});
 addEventListener('resize',place);
 window.visualViewport?.addEventListener('resize',()=>requestAnimationFrame(place));
 window.visualViewport?.addEventListener('scroll',()=>requestAnimationFrame(place));
 document.addEventListener('scroll',event=>{if(event.target===$('viewport')||event.target.id==='save-dialog')place();},true);
 const input=document.querySelector('.native-typing');
 input.addEventListener('focus',()=>{
  if(i===5){
   window.Jam.guides(practiceGuides().slice(placed).map(x=>({...x,row:0})));
   show(9);
  }
  requestAnimationFrame(place);
 });
 input.addEventListener('blur',()=>{
  if(i===9&&placed<practiceGuides().length)show(5);
  requestAnimationFrame(place);
 });
 input.addEventListener('typepractice',event=>{
  if(!mobile.matches||i<0)return;
  event.preventDefault();
  if(i===9&&/^[a-z]$/i.test(event.detail))placeNext('Key'+event.detail.toUpperCase());
 });
 document.querySelector('[data-mobile-mode="draw"]').addEventListener('click',()=>{
  if(i===7)requestAnimationFrame(()=>{if(i===7)show(8);});
 });
 const advanceGesture=event=>{
  if(i===mousePractice&&event.type==='drawinput'){show(1);return;}
  const expected=drawSteps[i]?.gesture;
  const action=event.detail==='tap'||event.detail==='drag'?'place':event.detail;
  if(expected!==action)return;
  if(i===8)drawnPracticeNotes=window.Jam.state.notes.filter(note=>!note.id.startsWith('tut-'));
  show(({8:11,11:12,12:1})[i]);
 };
 for(const event of ['drawinput','drawnavigation'])$('viewport').addEventListener(event,advanceGesture);
 $('viewport').addEventListener('playbackend',event=>{
  if(i!==13)return;
  event.preventDefault();
  show(4);
 });
 $('play').addEventListener('click',e=>{if(i===1){e.stopImmediatePropagation();startPlayback();}},true);
 $('wide').addEventListener('click',e=>{if(i===6&&!bypass){e.stopImmediatePropagation();preview();}},true);
 $('png').addEventListener('click',()=>{if(i===2)requestAnimationFrame(()=>{if(i===2&&currentSpotlight(3))show(3);});},true);
}
function placeNext(code){
 const g=practiceGuides()[placed];if(!g)return;
 window.Jam.addNote({...g,row:0,id:'tut-'+placed});placed++;
 window.Jam.guides(practiceGuides().slice(placed).map(x=>({...x,row:0})));
 const k=/^Key([A-Z])$/.exec(code||'')?.[1]||'';keys.querySelectorAll('kbd').forEach((el,n)=>{if(el.textContent===k||(!'ASDF'.includes(k||'-')&&n===placed-1)){el.classList.remove('hit');void el.offsetWidth;el.classList.add('hit');}});
 keys.querySelectorAll('.coach-steps i').forEach((el,n)=>el.classList.toggle('on',n<placed));
 if(placed===practiceGuides().length){
  const step=i;
  setTimeout(()=>{
   if(i!==step)return;
   show(step===9?7:mousePractice);
   if(step===9)document.querySelector('.native-typing').blur();
  },450);
 }
}
const mobileHints={
 1:'▶를 눌러 감상해 보세요',
 2:'악보를 저장해 보세요',
 4:'편집으로 돌아가 보세요',
 5:'Type을 눌러 키보드를 열어 보세요',
 7:'Draw를 눌러 보세요',
 9:'글자를 입력해 반투명 기호를 채워 보세요',
};
function spotlightLayer(dialog){
 if(!dialog)return document.body;
 let layer=dialog.querySelector('.coach-effects-layer');
 if(!layer){
  layer=document.createElement('div');
  layer.className='coach-effects-layer';
  layer.setAttribute('aria-hidden','true');
  dialog.append(layer);
 }
 return layer;
}
function show(n){i=n;document.body.classList.toggle('coach-on',n>=0);
 document.body.classList.toggle('coach-play',n===1);
 document.body.classList.toggle('coach-view',n===6);
 const gesture=mobile.matches&&drawSteps[n];
 playHint.hidden=mobile.matches?!mobileHints[n]&&!gesture:![1,4,6].includes(n);
 if(n===mousePractice)playHint.hidden=false;
 playHint.classList.toggle('coach-draw-gesture',Boolean(gesture));
 if(gesture){
  const twoFingers=gesture.gesture==='scroll'||gesture.gesture==='pinch';
  playHint.innerHTML=`<div class="gesture-demo gesture-${gesture.gesture}" aria-hidden="true"><i></i>${twoFingers?'<i></i>':''}</div>
   <div><strong>${gesture.index}/3 · ${gesture.label}</strong><span>${gesture.hint}</span></div>`;
 }else if(n===mousePractice)playHint.textContent='첫 오선의 빈 곳을 클릭하거나 드래그해 기호를 놓아 보세요';
 else if(mobile.matches)playHint.textContent=mobileHints[n]||'';
 else if(n===1)playHint.innerHTML='<kbd>Shift</kbd> + <kbd>Space</kbd>로 재생';
 else if(n===6)playHint.innerHTML='<kbd>Shift</kbd> + <kbd>F</kbd>로 감상';
 else if(n===4)playHint.innerHTML='<kbd>Esc</kbd>';
 const target=currentSpotlight(n);
 const dialog=target?.closest('dialog');
 const host=spotlightLayer(dialog);
 if(ring.parentElement!==host)host.append(ring);
 ring.style.position=dialog?'absolute':'';
 keys.hidden=n!==0;ring.hidden=!target;
 spot.classList.toggle('coach-score',n===0||n===mousePractice);
 spot.hidden=n!==0&&n!==mousePractice&&(!target||Boolean(dialog));
 snowCanvas?.remove();
 if(target){
  const steps=mobile.matches?[5,7,1,4,2,3]:[1,6,4,2,3];
  ring.querySelector('.coach-num').textContent=steps.indexOf(n)+1;
  ring.classList.remove('urge','soft');stepAt=performance.now();
  requestAnimationFrame(()=>{
   if(i!==n)return;
   place();
   const notes=n===1?[...document.querySelectorAll('.note[data-note]')].map(note=>note.getBoundingClientRect())
    .filter(rect=>rect.bottom>0&&rect.top<innerHeight).slice(0,4):[];
   const fallback=(dialog||$('viewport')).getBoundingClientRect();
   const from=notes.length?notes:[dialog?fallback:previousTarget||fallback];
   const rect=target.getBoundingClientRect();
   flow(from,rect,host);
   previousTarget=rect;
  });
  setTimeout(()=>{if(i===n)chime();},snowFly+snowStagger);
 }
 place();
}
function placeMobileHint(){
 if(!mobile.matches||playHint.hidden)return;
 const viewport=window.visualViewport;
 const left=viewport?.offsetLeft??0,width=viewport?.width??innerWidth,top=viewport?.offsetTop??0;
 const anchor=(currentSpotlight(i)||(i===9||drawSteps[i]?$('viewport'):null))?.getBoundingClientRect();
 if(!anchor)return;
 playHint.style.setProperty('--coach-visible-width',width+'px');
 const hint=playHint.getBoundingClientRect();
 const center=Math.max(left+hint.width/2+8,Math.min(left+width-hint.width/2-8,anchor.left+anchor.width/2));
 const y=mobileInputs[i]?anchor.top-hint.height-18:drawSteps[i]?anchor.bottom-hint.height-10:i===9?anchor.top+8:anchor.bottom+18;
 playHint.style.left=center+'px';
 playHint.style.top=Math.max(top+8,y)+'px';
}
function place(){
 if(i<0||!keys)return;
 placeMobileHint();
 if(i===9){
  const score=$('viewport'),staff=score.querySelector('.staff[data-row="0"][data-part="0"]');
  if(staff){
   const row=staff.getBoundingClientRect(),view=score.getBoundingClientRect();
   const delta=(row.top+row.bottom-view.top-view.bottom)/2;
   if(Math.abs(delta)>2)score.scrollTop+=delta;
  }
  return;
 }
 if(i===mousePractice){
  const staff=$('viewport').querySelector('.staff[data-row="0"][data-part="0"]');
  if(!staff)return;
  const r=staff.getBoundingClientRect();
  Object.assign(spot.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});
  playHint.style.left=r.left+r.width/2+'px';
  playHint.style.top=Math.max($('viewport').getBoundingClientRect().top+4,r.top-playHint.offsetHeight-8)+'px';
  return;
 }
 if(i===0){
  const {left,top,width,height}=$('viewport').getBoundingClientRect();
  Object.assign(spot.style,{left:left+'px',top:top+'px',width:width+'px',height:height+'px'});
  keys.style.left=left+width/2+'px';
  keys.style.top=top+height*.6+'px';
  return;
 }
 const target=currentSpotlight(i);if(!target)return;
 const r=target.getBoundingClientRect(),d=Math.hypot(r.width,r.height)+12,cx=r.left+r.width/2,cy=r.top+r.height/2;
 const insideDialog=ring.parentElement!==document.body;
 const bounds=insideDialog?ring.parentElement.getBoundingClientRect():null;
 const originX=bounds?.left??0,originY=bounds?.top??0;
 Object.assign(ring.style,{left:cx-d/2-originX+'px',top:cy-d/2-originY+'px',width:d+'px',height:d+'px',visibility:''});
 Object.assign(spot.style,{left:cx-d/2+'px',top:cy-d/2+'px',width:d+'px',height:d+'px'});
 if(!mobile.matches&&[1,4,6].includes(i)){
  const bar=target.closest('.playback-buttons').getBoundingClientRect();
  playHint.style.left=cx+'px';
  playHint.style.top=Math.max(bar.bottom,cy+d/2)+6+'px';
 }
}
// Snow gathers around the target and briefly scatters.
function flow(fromRects,to,host){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||!fromRects.length)return;
 const c=document.createElement('canvas'),x=c.getContext('2d'),dpr=Math.min(devicePixelRatio||1,2);
 const bounds=host===document.body?null:host.getBoundingClientRect();
 const W=bounds?.width??innerWidth,H=bounds?.height??innerHeight;
 const originX=bounds?.left??0,originY=bounds?.top??0;
 c.className='coach-flow';c.width=W*dpr;c.height=H*dpr;x.setTransform(dpr,0,0,dpr,0,0);
 c.setAttribute('aria-hidden','true');
 host.append(c);snowCanvas=c;
 const tx=to.left+to.width/2-originX,ty=to.top+to.height/2-originY,parts=[],burst=[];
 fromRects.forEach(r=>{for(let k=0;k<12;k++){const sx=r.left+r.width/2-originX+(Math.random()-.5)*14,sy=r.top+r.height/2-originY+(Math.random()-.5)*14;parts.push({sx,sy,cx:(sx+tx)/2+(Math.random()-.5)*160,cy:Math.min(sy,ty)-40-Math.random()*90,d:Math.random()*snowStagger,s:.7+Math.random()*1.1});}});
 const start=performance.now(),arrive=snowFly+snowStagger;let last=start,burstDone=false;
 const dot=(px,py,r,a)=>{x.globalAlpha=a*.18;x.fillStyle='#fff';x.beginPath();x.arc(px,py,r*2.6,0,Math.PI*2);x.fill();x.globalAlpha=a;x.beginPath();x.arc(px,py,r,0,Math.PI*2);x.fill();};
 (function frame(now){if(!c.isConnected)return;const t=now-start,dt=Math.min(.05,(now-last)/1000);last=now;x.clearRect(0,0,W,H);x.globalCompositeOperation='lighter';
  for(const p of parts){const u=Math.min(1,Math.max(0,(t-p.d)/snowFly));if(!u||u>=1)continue;const e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2,a=(1-e)*(1-e),b=2*e*(1-e),q=e*e;
   dot(a*p.sx+b*p.cx+q*tx,a*p.sy+b*p.cy+q*ty,p.s,.55);}
  if(t>=arrive&&!burstDone){burstDone=true;for(let k=0;k<40;k++){const an=Math.random()*Math.PI*2,sp=50+Math.random()*120;burst.push({x:tx,y:ty,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp,life:0,max:.38+Math.random()*.24,s:.6+Math.random()*1});}}
  for(const b of burst){b.life+=dt;b.vx*=Math.exp(-2.6*dt);b.vy=b.vy*Math.exp(-2.6*dt)+30*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;const f=Math.max(0,1-b.life/b.max);if(f)dot(b.x,b.y,b.s*(.6+.4*f),.6*f);}
  if(t<arrive+snowTail)requestAnimationFrame(frame);else c.remove();})(start);
}
// A soft two-note bell ("띵–동", quiet sine tones with a gentle fade) that says "press something now".
let actx=null;
function chime(gain=.05){try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume();const t0=actx.currentTime+.02;
 [[1318.5,0],[1760,.16]].forEach(([f,d])=>{const o=actx.createOscillator(),g=actx.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,t0+d);g.gain.linearRampToValueAtTime(gain,t0+d+.015);g.gain.exponentialRampToValueAtTime(.0001,t0+d+.9);o.connect(g).connect(actx.destination);o.start(t0+d);o.stop(t0+d+1);});}catch{}}
function startPlayback(){
 if(mobile.matches){preview();return;}
 window.Jam.play?.();
 show(6);
}
function preview(){
 bypass=true;
 try{
  if(!document.body.classList.contains('shared-view'))$('view-mode').click();
  show(13);
  const last=drawnPracticeNotes.at(-1);
  if(mobile.matches&&last){
   const jam=window.Jam;
   // Rehearse only the part of the staff where the user finished drawing.
   const part=jam.segmentOf(last.x);
   const excerpt=drawnPracticeNotes.filter(note=>note.row===last.row&&jam.segmentOf(note.x)===part);
   notesBeforeExcerpt=jam.state.notes;
   jam.state.notes=excerpt;
   jam.render();
   jam.playFrom(Math.min(...excerpt.map(note=>note.row*8+note.x*8)));
  }else $('restart').click();
 }finally{bypass=false;}
}
function tick(){
 if(i<0)return;
 if(currentSpotlight(i)&&performance.now()-stepAt>5000&&!ring.classList.contains('urge')){ring.classList.add('urge');chime(.035);}
 if((i===4||i===13)&&!document.body.classList.contains('shared-view')){
  if(notesBeforeExcerpt){
   window.Jam.state.notes=notesBeforeExcerpt;
   notesBeforeExcerpt=null;
   window.Jam.render();
  }
  show(2);
 }
 else if(i===3&&!document.querySelector('#save-dialog[open]'))finish(true);
}
function begin(){
 if(!window.Jam)return;if(!keys)build();
 if(mobile.matches){
  practiceZoom??=window.Jam.zoomRatio;
  window.Jam.setMobileMode('type');
  if(window.Jam.zoomRatio!==1)window.Jam.setZoomRatio(1);
 }
 if(mobile.matches&&document.body.classList.contains('dock-collapsed'))document.querySelector('.dock-min').click();
 const s=window.Jam.state;window.Jam.pause?.();
 restoreDeleteMode=!mobile.matches&&document.body.classList.contains('delete-mode');
 if(restoreDeleteMode)$('delete-mode').click();
 if(!stored(STASH))store(STASH,JSON.stringify({notes:s.notes,eggs:s.eggs||[]}));
 s.notes=[];s.eggs=[];placed=0;previousTarget=null;drawnPracticeNotes=[];notesBeforeExcerpt=null;window.Jam.render();window.Jam.guides(mobile.matches?[]:GUIDES.map(g=>({...g,row:0})));
 $('viewport').scrollTop=0;show(mobile.matches?5:0);clearInterval(timer);timer=setInterval(tick,200);
}
function finish(completed){
 clearInterval(timer);i=-1;document.body.classList.remove('coach-on','coach-play','coach-view');
 if(keys){
  keys.hidden=true;ring.hidden=true;spot.hidden=true;playHint.hidden=true;ring.classList.remove('urge','soft');
  if(ring.parentElement!==document.body)document.body.append(ring);
  ring.style.position='';
 }
 snowCanvas?.remove();
 if(document.body.classList.contains('shared-view')&&!window.Jam?.state?.__shared){bypass=true;try{document.querySelector('.mode-switch [data-mode="edit"]')?.click();}finally{bypass=false;}}
 window.Jam?.pause?.();restore();
 drawnPracticeNotes=[];notesBeforeExcerpt=null;
 if(practiceZoom!==null){window.Jam.setZoomRatio(practiceZoom);practiceZoom=null;}
 if(restoreDeleteMode){$('delete-mode').click();restoreDeleteMode=false;}
 if(completed){
  window.JamEaster?.say?.('타이핑 연주 중 겨울 단어를 발견해보세요','',{ms:3800,compact:!mobile.matches,snowflake:true});
  hintHelp();
 }
 window.dispatchEvent(new Event('playjam:tutorial-ended'));
}
// After finishing, the ? (help) button glows softly for ~3s, without a number — a light hint, not a step.
function hintHelp(){setTimeout(()=>{const t=$('help');if(i>=0||!t||!ring)return;const r=t.getBoundingClientRect(),d=Math.max(r.width,r.height)+30;
 Object.assign(ring.style,{left:r.left+r.width/2-d/2+'px',top:r.top+r.height/2-d/2+'px',width:d+'px',height:d+'px',visibility:''});
 ring.classList.add('soft');ring.hidden=false;setTimeout(()=>{if(i<0&&ring.classList.contains('soft')){ring.hidden=true;ring.classList.remove('soft');}},3200);},600);}
$('welcome-tutorial').addEventListener('click',()=>{
 if(document.body.classList.contains('shared-view'))$('edit-shared').click();
 begin();
});
window.JamTutorial={begin,finish};
})();
