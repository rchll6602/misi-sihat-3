(()=>{'use strict';
const game=document.getElementById('game');const hint=document.getElementById('rotateHint');
function fit(){const w=window.innerWidth,h=window.innerHeight;const scale=Math.min(w/1200,h/700);game.style.transform=`translate(${Math.max(0,(w-1200*scale)/2)}px,${Math.max(0,(h-700*scale)/2)}px) scale(${scale})`;}
window.addEventListener('resize',fit);window.addEventListener('orientationchange',()=>setTimeout(fit,150));
if(window.visualViewport)window.visualViewport.addEventListener('resize',fit);fit();
document.getElementById('rotateContinue').addEventListener('click',()=>hint.classList.add('dismissed'));
document.getElementById('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();if(screen.orientation&&screen.orientation.lock){try{await screen.orientation.lock('landscape')}catch(e){}}}catch(e){}fit()});
// Invisible drag joystick. No visual joystick is drawn: the finger itself is the handle.
// Existing touch buttons remain available at all times.
const canvas=document.getElementById('world');
const level=document.getElementById('level');
let active=null, repeat=null, lastRaceDirection='';
const currentStage=()=>Number((level.textContent.match(/\d+/)||[])[0]||0);
function key(k){window.dispatchEvent(new KeyboardEvent('keydown',{key:k,bubbles:true}));}
function stop(){active=null;if(repeat){clearInterval(repeat);repeat=null;}}
function move(e){
 if(!active||active.id!==e.pointerId)return;
 const dx=e.clientX-active.x,dy=e.clientY-active.y;
 const stage=currentStage();
 if(stage===2){
   // Drag alternately left/right to simulate alternating feet, with a short cooldown.
   const dir=dx>22?'R':dx< -22?'L':'';
   if(dir&&dir!==lastRaceDirection&&performance.now()-active.lastStep>125){
     key(dir==='L'?'ArrowLeft':'ArrowRight');lastRaceDirection=dir;active.lastStep=performance.now();
   }
 }else if(stage===3||stage===4){
   active.direction=Math.abs(dx)>20?(dx<0?'ArrowLeft':'ArrowRight'):null;
 }
 e.preventDefault();
}
canvas.addEventListener('pointerdown',e=>{
 if(e.pointerType==='mouse')return;
 if(![2,3,4].includes(currentStage()))return;
 stop();active={id:e.pointerId,x:e.clientX,y:e.clientY,direction:null,lastStep:0};
 lastRaceDirection='';canvas.setPointerCapture?.(e.pointerId);
 if(currentStage()===3||currentStage()===4){repeat=setInterval(()=>{
   if(active&&active.direction&&document.getElementById('panel').classList.contains('hidden'))key(active.direction);
 },135);}
 e.preventDefault();
},{passive:false});
canvas.addEventListener('pointermove',move,{passive:false});
canvas.addEventListener('pointerup',stop);canvas.addEventListener('pointercancel',stop);
window.addEventListener('blur',stop);
// Bigger text in the first level on touch devices; CSS applies only to the first level.
const updateLevel=()=>{game.classList.toggle('mobile-level-one',currentStage()===1);};
new MutationObserver(updateLevel).observe(level,{childList:true,subtree:true});updateLevel();
document.addEventListener('touchmove',e=>{if(!e.target.closest('.panel'))e.preventDefault()},{passive:false});
})();