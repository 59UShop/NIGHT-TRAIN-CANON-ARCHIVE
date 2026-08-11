
(function(){
 const T={};
 const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
 const short=(s,n=165)=>{s=(s||'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n)+'…':s};
 T.render=function(containerId,detailId,history,migrationHtml){
   const host=document.getElementById(containerId), detail=document.getElementById(detailId); if(!host)return;
   const years=history.map(x=>x.year); const min=Math.min(...years)-5,max=Math.max(...years)+5; const pad=5;
   const pos=y=>pad+(y-min)/(max-min)*(100-pad*2);
   const positions=history.map(e=>pos(e.year));
   const laneGap=10; const laneLast=[]; const lanes=[];
   positions.forEach((x,i)=>{let lane=0; while(laneLast[lane]!=null && x-laneLast[lane] < laneGap) lane++; laneLast[lane]=x; lanes[i]=lane;});
   const maxLane=Math.max(0,...lanes); host.style.height=(250 + maxLane*30)+'px';
   const rangeStart=616, rangeEnd=700;
   host.innerHTML=`<div class="timeline-axis"></div><div class="timeline-range" style="left:${pos(rangeStart)}%;width:${pos(rangeEnd)-pos(rangeStart)}%"></div><div class="timeline-range-label" style="left:${(pos(rangeStart)+pos(rangeEnd))/2}%">《月の心臓》移設時期：詳細未確定</div>`+
   history.map((e,i)=>`<button class="timeline-dot" data-i="${i}" aria-label="${esc(e.label)}" style="left:${positions[i]}%"></button><div class="timeline-year lane-${lanes[i]}" style="left:${positions[i]}%"><b>${esc(e.label)}</b><small>${esc(e.relative)}</small></div>`).join('');
   const tooltip=document.getElementById('timelineTooltip');
   host.querySelectorAll('.timeline-dot').forEach(dot=>{
     const i=Number(dot.dataset.i),e=history[i];
     dot.addEventListener('mouseenter',ev=>showTooltip(ev,e));
     dot.addEventListener('mousemove',ev=>positionTooltip(ev));
     dot.addEventListener('mouseleave',hideTooltip);
     dot.addEventListener('focus',ev=>{const r=dot.getBoundingClientRect();showTooltip({clientX:r.left+r.width/2,clientY:r.top},e)});
     dot.addEventListener('blur',hideTooltip);
     dot.addEventListener('click',()=>{
       host.querySelectorAll('.timeline-dot').forEach(x=>x.classList.remove('active'));dot.classList.add('active');
       detail.classList.remove('empty'); detail.innerHTML=`<div class="article"><div class="eyebrow">${esc(e.label)} · ${esc(e.relative)}</div><h2>${esc(e.title)}</h2>${e.html}</div>`;
     });
   });
   function showTooltip(ev,e){tooltip.innerHTML=`<b>${esc(e.title)}</b><p>${esc(short(e.text,210))}</p>`;tooltip.classList.add('show');positionTooltip(ev)}
   function positionTooltip(ev){let x=ev.clientX+16,y=ev.clientY+16;const w=360,h=150;if(x+w>window.innerWidth)x=ev.clientX-w-16;if(y+h>window.innerHeight)y=ev.clientY-h-16;tooltip.style.left=Math.max(8,x)+'px';tooltip.style.top=Math.max(8,y)+'px'}
   function hideTooltip(){tooltip.classList.remove('show')}
 };
 window.NT_TIMELINE=T;
})();
