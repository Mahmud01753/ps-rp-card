const $ = s => document.querySelector(s);
const poster = $('#poster');
const portrait = $('#portrait');
const leftLogo = $('#leftLogo');
const rightLogo = $('#rightLogo');

const textMap = {
  collegeInput:'collegeText', committeeInput:'committeeText', nameInput:'nameText',
  roleInput:'roleText', batchInput:'batchText', departmentInput:'departmentText'
};
const photoState = {scale:1,x:0,y:0};

function fitText(el, min=11){
  const base = parseFloat(getComputedStyle(el).fontSize);
  let size = base;
  el.style.fontSize = size+'px';
  while(el.scrollWidth > el.clientWidth && size > min){ size -= .35; el.style.fontSize=size+'px'; }
}
function updateText(id){
  const input=$('#'+id), el=$('#'+textMap[id]);
  el.textContent=input.value || '';
  requestAnimationFrame(()=>fitText(el));
}
Object.keys(textMap).forEach(id=>{ updateText(id); $('#'+id).addEventListener('input',()=>updateText(id)); });

function applyPhoto(){
  portrait.style.transform=`translate(-50%,-50%) translate(${photoState.x}px,${photoState.y}px) scale(${photoState.scale})`;
}
function photoAction(a){
  if(a==='zoomIn') photoState.scale=Math.min(4,photoState.scale+.1);
  if(a==='zoomOut') photoState.scale=Math.max(.5,photoState.scale-.1);
  if(a==='left') photoState.x-=12;
  if(a==='right') photoState.x+=12;
  if(a==='up') photoState.y-=12;
  if(a==='down') photoState.y+=12;
  if(a==='reset'){photoState.scale=1;photoState.x=0;photoState.y=0;}
  applyPhoto();
}
document.querySelectorAll('[data-photo]').forEach(b=>b.addEventListener('click',()=>photoAction(b.dataset.photo)));

function readImage(file, cb){
  if(!file)return;
  const r=new FileReader(); r.onload=()=>cb(r.result); r.readAsDataURL(file);
}
$('#photoUpload').addEventListener('change',e=>readImage(e.target.files[0],src=>{
  portrait.src=src; photoState.scale=1; photoState.x=0; photoState.y=0; applyPhoto();
}));
$('#leftLogoUpload').addEventListener('change',e=>readImage(e.target.files[0],src=>leftLogo.src=src));
$('#rightLogoUpload').addEventListener('change',e=>readImage(e.target.files[0],src=>rightLogo.src=src));

function loadImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src;});}
function pct(v,total){return v*total/100;}
function fitCanvasText(ctx,text,box,size,color,shadow=false){
  let s=size; const family='Georgia, "Times New Roman", serif';
  ctx.font=`700 ${s}px ${family}`;
  while(ctx.measureText(text).width>box.w && s>12){s-=.35;ctx.font=`700 ${s}px ${family}`;}
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;
  if(shadow){ctx.shadowColor='rgba(0,0,0,.75)';ctx.shadowBlur=1;ctx.shadowOffsetY=2;} else {ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0;}
  ctx.fillText(text,box.x+box.w/2,box.y+box.h/2);
  ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0;
}
function cover(ctx,x,y,w,h,fill){ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);}
function drawPhoto(ctx,img,frame){
  ctx.save();ctx.beginPath();ctx.rect(frame.x,frame.y,frame.w,frame.h);ctx.clip();
  const iw=img.naturalWidth||img.width, ih=img.naturalHeight||img.height;
  const fit=Math.max(frame.w/iw,frame.h/ih); const dw=iw*fit, dh=ih*fit;
  const cx=frame.x+frame.w/2, cy=frame.y+frame.h/2;
  ctx.translate(cx,cy);ctx.scale(photoState.scale,photoState.scale);ctx.translate(-cx,-cy);
  ctx.drawImage(img,frame.x+(frame.w-dw)/2+photoState.x,frame.y+(frame.h-dh)/2+photoState.y,dw,dh);
  ctx.restore();
}
function drawContain(ctx,img,box){
  const iw=img.naturalWidth||img.width, ih=img.naturalHeight||img.height;
  const s=Math.min(box.w/iw,box.h/ih), w=iw*s,h=ih*s;
  ctx.drawImage(img,box.x+(box.w-w)/2,box.y+(box.h-h)/2,w,h);
}

async function renderPngBlob(){
  const W=1024,H=1536,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d',{alpha:false});
  // Same fixed Design-2 base used by the editor.
  const baseSrc=getComputedStyle(poster).backgroundImage.match(/url\(["']?(.*?)["']?\)/)[1];
  const [base,p,l,r]=await Promise.all([loadImage(baseSrc),loadImage(portrait.src),loadImage(leftLogo.src),loadImage(rightLogo.src)]);
  ctx.drawImage(base,0,0,W,H);

  // Only the editable artwork areas are covered. The fixed forum title, borders and frame stay untouched.
  cover(ctx,pct(29.3,W),pct(19.75,H),pct(41.5,W),pct(4.2,H),'#0b2d55');
  cover(ctx,pct(27.8,W),pct(24.9,H),pct(44.4,W),pct(4.3,H),'#efd18a');
  cover(ctx,pct(15.9,W),pct(69.7,H),pct(68.2,W),pct(6.5,H),'#0a315b');
  cover(ctx,pct(33.4,W),pct(76.65,H),pct(33.2,W),pct(3.5,H),'#f1d28a');
  cover(ctx,pct(29,W),pct(82.35,H),pct(52.5,W),pct(4.6,H),'#fff');
  cover(ctx,pct(29,W),pct(89.25,H),pct(53.2,W),pct(4.7,H),'#fff');
  cover(ctx,pct(4.5,W),pct(7,H),pct(18,W),pct(15.8,H),'#fff');
  cover(ctx,pct(77,W),pct(6.6,H),pct(19,W),pct(15.8,H),'#fff');

  drawPhoto(ctx,p,{x:pct(25.45,W),y:pct(34.25,H),w:pct(49.1,W),h:pct(32,H)});
  drawContain(ctx,l,{x:pct(4.35,W),y:pct(6.8,H),w:pct(18.2,W),h:pct(17.2,H)});
  drawContain(ctx,r,{x:pct(77.2,W),y:pct(6.4,H),w:pct(18.2,W),h:pct(17.2,H)});

  const T=[
    ['collegeInput',29.4,20.15,41.3,3.4,25,'#fff',true],
    ['committeeInput',27.9,25.25,44.2,3.4,28,'#092e58',false],
    ['nameInput',16.2,70.15,67.6,5.5,41,'#f7e9c7',true],
    ['roleInput',33.8,77,32.4,2.8,26,'#092e58',false],
    ['batchInput',29.1,82.75,52,3.7,22,'#0d315b',false],
    ['departmentInput',29.1,89.65,52.8,3.7,21,'#0d315b',false]
  ];
  for(const [id,x,y,w,h,size,color,shadow] of T){
    fitCanvasText(ctx,$('#'+id).value||'',{x:pct(x,W),y:pct(y,H),w:pct(w,W),h:pct(h,H)},size,color,shadow);
  }
  return await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('PNG Blob failed')),'image/png'));
}

async function downloadPng(){
  const btn=$('#downloadBtn');btn.disabled=true;btn.textContent='RENDERING…';$('#fallbackBtn').classList.add('hidden');
  try{
    const blob=await renderPngBlob();
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='political-science-forum-card.png';a.rel='noopener';a.style.display='none';
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),15000);
  }catch(e){console.error(e);$('#fallbackBtn').classList.remove('hidden');}
  finally{btn.disabled=false;btn.textContent='DOWNLOAD PNG';}
}
$('#downloadBtn').addEventListener('click',downloadPng);
$('#fallbackBtn').addEventListener('click',async()=>{
  try{const b=await renderPngBlob(),u=URL.createObjectURL(b);window.open(u,'_blank','noopener');setTimeout(()=>URL.revokeObjectURL(u),60000);}
  catch(e){alert('PNG could not be generated. Please use Chrome or Edge.');}
});
window.addEventListener('resize',()=>Object.keys(textMap).forEach(id=>fitText($('#'+textMap[id]))));
applyPhoto();
