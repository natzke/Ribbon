import * as THREE from './three.module.js';
const $=id=>document.getElementById(id);
const viewport=$('viewport');let W=viewport.clientWidth,H=viewport.clientHeight;
const scene=new THREE.Scene();
const camera=new THREE.OrthographicCamera(0,W,0,H,.1,100);camera.position.z=10;
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));viewport.append(renderer.domElement);
const group=new THREE.Group();scene.add(group);
const fill=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.25,side:THREE.DoubleSide,depthTest:false,depthWrite:false});
const edge=new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.85,depthTest:false,depthWrite:false});
let particles=[],count=0,paused=false,emissionElapsed=0,time=0,acc=0,last=performance.now();let pointer={x:W*.5,y:H*.4};
const head={...pointer,r:0,a:0};
let study='03';
const settings={ '01':{name:'Particle',version:'12',limit:250,interval:.025,gravity:.5,opacity:1},'02':{name:'Cord',version:'10',limit:25,interval:.1,gravity:.5,opacity:1},'03':{name:'Ribbon',version:'16',limit:25,interval:.1,gravity:.5,opacity:.25},'04':{name:'Bitmap Draw',version:'09',limit:15,interval:.1,gravity:.05,opacity:.06}};
let emissionInterval=.1;
const sampleCanvas=document.createElement('canvas');sampleCanvas.width=512;sampleCanvas.height=512;
const sampleContext=sampleCanvas.getContext('2d',{willReadFrequently:true});
const gradient=sampleContext.createLinearGradient(0,0,512,512);['#ED2024','#FFC233','#A8CF45','#72CAC3','#65A1D7','#F095B8'].forEach((c,i)=>gradient.addColorStop(i/5,c));sampleContext.fillStyle=gradient;sampleContext.fillRect(0,0,512,512);
let samplePixels=sampleContext.getImageData(0,0,512,512).data;
function sampleColor(x,y){const i=(Math.max(0,Math.min(511,Math.floor(y/H*512)))*512+Math.max(0,Math.min(511,Math.floor(x/W*512))))*4;return new THREE.Color().setRGB(samplePixels[i]/255,samplePixels[i+1]/255,samplePixels[i+2]/255,THREE.SRGBColorSpace)}
$('sample').onchange=async()=>{const file=$('sample').files[0];if(!file)return;try{const bitmap=await createImageBitmap(file);sampleContext.drawImage(bitmap,0,0,512,512);bitmap.close();samplePixels=sampleContext.getImageData(0,0,512,512).data;$('sample-note').textContent=file.name;renderer.clear()}catch{$('sample-note').textContent='Could not read this image. Try PNG or JPEG.'}};
$('clear').onclick=()=>renderer.clear(); // Trail sampling is independent of the live head. 
function resize(){W=viewport.clientWidth;H=viewport.clientHeight;renderer.setSize(W,H);camera.right=W;camera.bottom=H;camera.updateProjectionMatrix()}resize();addEventListener('resize',resize);new ResizeObserver(resize).observe(viewport);
function cursor(e){const rect=viewport.getBoundingClientRect();return {x:e.clientX-rect.left,y:e.clientY-rect.top}}
renderer.domElement.addEventListener('pointermove',e=>{if($('mode').value==='pointer')pointer=cursor(e);});
renderer.domElement.addEventListener('pointerdown',e=>{pointer=cursor(e);$('mode').value='pointer'});
for(const id of ['gravity','width','opacity']) $(id).oninput=()=>{$(id+'Out').value=Number($(id).value).toFixed(id==='width'?1:2)};
function pause(){paused=!paused;$('pause').textContent=paused?'Resume':'Pause'}$('pause').onclick=pause;
addEventListener('keydown',e=>{if(e.code==='Space'&&!['INPUT','SELECT','BUTTON'].includes(document.activeElement.tagName)){e.preventDefault();pause()}});
$('reset').onclick=()=>{particles=[];count=0;emissionElapsed=0;time=0;acc=0;for(const [id,value] of Object.entries({gravity:settings[study].gravity,width:1,opacity:settings[study].opacity})){$(id).value=value;$(id).oninput()}$('mode').value='demo';renderer.clear();if(paused)pause()};
function updateHead(dt){
 time+=dt;
 if($('mode').value==='demo'){
  pointer.x=W*.44+Math.sin(time*1.8)*Math.min(W*.27,320);
  pointer.y=H*.42+Math.sin(time*2.9)*Math.min(H*.22,170);
 }
 head.x=pointer.x;head.y=pointer.y;
 emissionElapsed+=dt;
 if(!particles.length || emissionElapsed>=emissionInterval){
  emissionElapsed%=emissionInterval;
  const mag=Math.random()*(study==='01'?10:2),dir=Math.random()*Math.PI*2;
  particles.push({id:count++,x:head.x,y:head.y,vx:Math.cos(dir)*mag,vy:Math.sin(dir)*mag,r:0,a:0,growth:Math.random()*2});
  if(particles.length>settings[study].limit)particles.shift();
 }
}
function step(){
 if(study==='01'){
  for(const p of particles){p.vy+=Number($('gravity').value);p.vx*=.97;p.vy*=.97;p.x+=p.vx;p.y+=p.vy;if(p.y>H-70){p.y=H-70;p.vy*=-1}}return;
 }
 if(study==='02'){
  const min=Math.max(0,count-25);
  for(let i=particles.length-1;i>0;i--){const p=particles[i],n=particles[i-1];p.vy+=Number($('gravity').value);p.vx*=.97;p.vy*=.97;p.x+=p.vx;p.y+=p.vy;if(p.id>count-12.5)p.r+=.5;else p.r*=.95;if(p.y>H-70){p.y=H-70;p.vy*=-1}const dx=p.x-n.x,dy=p.y-n.y,d=Math.hypot(dx,dy);if(d>100){const ox=p.x,oy=p.y;p.x=n.x+dx/d*100;p.y=n.y+dy/d*100;p.vx+=(p.x-ox)*.05;p.vy+=(p.y-oy)*.05;n.vy-=(p.x-ox)*.1;n.vx-=(p.y-oy)*.1}}return;
 }

const min=Math.max(0,count-settings[study].limit);
for(let i=1;i<particles.length;i++){const p=particles[i],n=particles[i+1]??head;p.vy+=Number($('gravity').value);p.vx*=.97;p.vy*=.97;p.x+=p.vx;p.y+=p.vy;if(p.id<min+5){p.x-=(p.x-n.x)*.6;p.y-=(p.y-n.y)*.6}if(p.id>count-settings[study].limit*.5)p.r+=(study==='04'?p.growth:1.5);else p.r*=.85;if(p.y>H-70){p.y=H-70;p.vy*=-1}const dx=p.x-n.x,dy=p.y-n.y,d=Math.hypot(dx,dy);p.a=Math.atan2(dy,dx);if(d>100){const ox=p.x,oy=p.y;p.x=n.x+100*Math.cos(p.a);p.y=n.y+100*Math.sin(p.a);p.vx+=(p.x-ox)*.1;p.vy+=(p.y-oy)*.1}}}
function side(p,s){const r=p.r*Number($('width').value)*s;return new THREE.Vector2(p.x+r*Math.cos(p.a+Math.PI/2),p.y+r*Math.sin(p.a+Math.PI/2))}const mid=(a,b)=>a.clone().add(b).multiplyScalar(.5);
function draw(){for(const obj of [...group.children]){group.remove(obj);obj.geometry.dispose();if(obj.userData.ownedMaterial)obj.material.dispose()}fill.opacity=Number($('opacity').value);
if(study==='01'||study==='02'){drawSimple();return;}
for(let i=particles.length-1;i>1;i--){const p=particles[i],n=particles[i-1],b=particles[i+1]??head;const a=side(b,1),bb=side(b,-1),c=side(p,1),d=side(p,-1),e=side(n,1),f=side(n,-1);const tip=i===particles.length-1;const ac=tip?new THREE.Vector2(head.x,head.y):mid(a,c),ce=mid(c,e),bd=tip?new THREE.Vector2(head.x,head.y):mid(bb,d),df=mid(d,f);const shape=new THREE.Shape();shape.moveTo(bd.x,bd.y);shape.quadraticCurveTo(d.x,d.y,df.x,df.y);shape.lineTo(ce.x,ce.y);shape.quadraticCurveTo(c.x,c.y,ac.x,ac.y);shape.closePath();const mesh=new THREE.Mesh(new THREE.ShapeGeometry(shape,12),study==='04'?new THREE.MeshBasicMaterial({color:sampleColor(p.x,p.y),transparent:true,opacity:fill.opacity,side:THREE.DoubleSide,depthTest:false,depthWrite:false}):fill);mesh.userData.ownedMaterial=study==='04';mesh.renderOrder=(particles.length-i)*2;group.add(mesh);const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(shape.getPoints(12)),edge);line.renderOrder=mesh.renderOrder+1;if(study!=='04')group.add(line);else line.geometry.dispose()}}
function frame(now){
 requestAnimationFrame(frame);
 const dt=Math.min((now-last)/1000,.1);last=now;
 if(!paused){
  updateHead(dt);acc+=dt;
  while(acc>=1/30){step();acc-=1/30;}
  // Reorient the newest panel and redraw even between physics ticks.
  const newest=particles.at(-1);
  if(newest)newest.a=Math.atan2(newest.y-head.y,newest.x-head.x);
  draw();
 }else acc=0;
 renderer.autoClear=study!=='04';if(!paused||study!=='04')renderer.render(scene,camera);
 $('status').textContent=paused?'Paused':$('mode').value==='demo'?'Auto':'Mouse';
}
requestAnimationFrame(frame);

function applyTheme(light){document.documentElement.dataset.theme=light?'light':'dark';fill.color.set(light?0x4e5054:0xffffff);edge.color.copy(fill.color);$('theme').textContent=light?'☾ Dark mode':'☀ Light mode';$('theme').setAttribute('aria-label',light?'Switch to dark mode':'Switch to light mode');}
let light=false;try{light=localStorage.getItem('ribbon-theme')==='light'}catch{}applyTheme(light);
$('theme').onclick=()=>{light=!light;applyTheme(light);try{localStorage.setItem('ribbon-theme',light?'light':'dark')}catch{}};

function ring(p,r){const shape=new THREE.Shape();shape.absarc(p.x,p.y,r,0,Math.PI*2);const hole=new THREE.Path();hole.absarc(p.x,p.y,Math.max(.1,r-1.5),0,Math.PI*2,true);shape.holes.push(hole);group.add(new THREE.Mesh(new THREE.ShapeGeometry(shape,12),fill))}
function drawSimple(){
 const width=Number($('width').value);
 if(study==='01'){for(const p of particles)ring(p,10*width);return}
 const points=[head,...particles.slice().reverse()];
 for(let i=1;i<points.length-1;i++){
  const a=i===1?new THREE.Vector2(head.x,head.y):mid(new THREE.Vector2(points[i-1].x,points[i-1].y),new THREE.Vector2(points[i].x,points[i].y));
  const b=new THREE.Vector2(points[i].x,points[i].y),c=mid(b,new THREE.Vector2(points[i+1].x,points[i+1].y));
  const curve=new THREE.QuadraticBezierCurve(a,b,c),left=[],right=[],radius=Math.max(.5,points[i].r*.5*width);
  for(let j=0;j<=12;j++){const t=j/12,p=curve.getPoint(t),v=curve.getTangent(t);left.push(new THREE.Vector2(p.x-v.y*radius,p.y+v.x*radius));right.push(new THREE.Vector2(p.x+v.y*radius,p.y-v.x*radius))}
  const shape=new THREE.Shape([...left,...right.reverse()]);group.add(new THREE.Mesh(new THREE.ShapeGeometry(shape),fill));
 }
 for(const p of particles)ring(p,6*width);
}
function selectStudy(value){study=settings[value]?value:'03';emissionInterval=settings[study].interval;document.querySelector('h1').textContent=study+' — '+settings[study].name;$('version').textContent='STUDY '+settings[study].version;document.querySelectorAll('[data-study]').forEach(b=>{b.classList.toggle('active',b.dataset.study===study);b.setAttribute('aria-pressed',String(b.dataset.study===study))});$('bitmap-tools').hidden=study!=='04';history.replaceState(null,'','#'+study);$('reset').onclick();}
document.querySelectorAll('[data-study]').forEach(b=>b.onclick=()=>selectStudy(b.dataset.study));selectStudy(location.hash.slice(1)||'03');
