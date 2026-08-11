(function(){
const M=window.NT_MAPS;
const S={scope:'facility',mapId:'shop1f',variant:null,selected:null};
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function scoped(){return M.maps.filter(x=>(x.scope||'facility')===S.scope)}
function getMap(){const a=scoped();return a.find(x=>x.id===S.mapId)||a[0]||M.maps[0]}
function statusLabel(s){return s==='canon'?'正史確定':s==='author'?'今回確定':'配置案'}
function statusClass(s){return s==='canon'?'map-canon':s==='author'?'map-author':'map-layout'}
function visible(room){return !room.variants||room.variants.includes(S.variant)}
function center(r){return [r.x+(r.w||0)/2,r.y+(r.h||0)/2]}
function roomSvg(r){
 if(!visible(r))return''; const c=statusClass(r.status),[cx,cy]=center(r),kind=r.kind||'room';
 const shape=kind==='courtyard'?`<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="70"/>`:`<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="${kind==='track'?8:18}"/>`;
 const font=r.w<100?12:r.w<160?14:17;
 return `<g class="map-room ${c} kind-${kind}" data-room="${esc(r.id)}">${shape}<text x="${cx}" y="${cy-3}" text-anchor="middle" class="map-room-title" style="font-size:${font}px">${esc(r.name)}</text><text x="${cx}" y="${cy+19}" text-anchor="middle" class="map-room-status">${statusLabel(r.status)}</text></g>`;
}
function renderScope(){
 const el=document.getElementById('mapScope'); if(!el)return;
 el.querySelectorAll('button[data-map-scope]').forEach(b=>{b.classList.toggle('active',b.dataset.mapScope===S.scope);b.onclick=()=>{S.scope=b.dataset.mapScope;const first=scoped()[0];if(first)S.mapId=first.id;S.variant=null;S.selected=null;render();};});
}
function renderTabs(){
 const el=document.getElementById('mapTabs');if(!el)return;const items=scoped();
 el.style.gridTemplateColumns=`repeat(${Math.min(Math.max(items.length,1),6)},minmax(0,1fr))`;
 el.innerHTML=items.map(x=>`<button class="map-tab ${x.id===S.mapId?'active':''}" data-map="${x.id}"><span>${esc(x.code)}</span><b>${esc(x.label)}</b></button>`).join('');
 el.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{S.mapId=b.dataset.map;S.variant=null;S.selected=null;render();}));
}
function renderVariants(map){const el=document.getElementById('mapVariants');if(!S.variant)S.variant=map.defaultVariant||map.variants?.[0]?.id||'current';el.innerHTML=(map.variants||[]).map(v=>`<button class="filterbtn ${v.id===S.variant?'active':''}" data-v="${v.id}">${esc(v.label)}</button>`).join('');el.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{S.variant=b.dataset.v;S.selected=null;draw(map);}));}
function defs(){return `<defs><pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="currentColor" stroke-width="0.6" opacity=".16"/></pattern><linearGradient id="seaGrad" x1="0" x2="1"><stop offset="0" stop-color="#0a2636"/><stop offset="1" stop-color="#123348"/></linearGradient><linearGradient id="landGrad" x1="0" x2="1"><stop offset="0" stop-color="#14212a"/><stop offset="1" stop-color="#24231f"/></linearGradient><filter id="poiGlow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><marker id="mapArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>`}
function drawFacility(map,svg,vb){
 svg.classList.remove('city-map','regional-map');
 const lines=(map.connections||[]).map(x=>`<g class="map-connection ${statusClass(x.status)}"><line x1="${x.x1}" y1="${x.y1}" x2="${x.x2}" y2="${x.y2}" marker-end="url(#mapArrow)"/>${x.label?`<text x="${(x.x1+x.x2)/2+8}" y="${(x.y1+x.y2)/2-8}">${esc(x.label)}</text>`:''}</g>`).join('');
 svg.innerHTML=`${defs()}<rect x="0" y="0" width="${vb[2]}" height="${vb[3]}" class="map-grid-bg"/>${lines}${map.rooms.map(roomSvg).join('')}`;
 svg.querySelectorAll('.map-room').forEach(g=>{const room=map.rooms.find(r=>r.id===g.dataset.room);g.addEventListener('click',()=>selectItem(room,g));g.addEventListener('pointerenter',()=>showHover(room));g.addEventListener('pointerleave',hideHover);});
}
function districtSvg(d){return `<g class="city-district ${statusClass(d.status)}"><polygon points="${d.points}"/><text x="${districtCentroid(d.points)[0]}" y="${districtCentroid(d.points)[1]}" class="city-district-label">${esc(d.name)}</text></g>`}
function districtCentroid(points){const p=points.trim().split(/\s+/).map(x=>x.split(',').map(Number));return [p.reduce((s,x)=>s+x[0],0)/p.length,p.reduce((s,x)=>s+x[1],0)/p.length]}
function poiSvg(p){const c=statusClass(p.status),pos=p.labelPos||'bottom',w=p.labelWidth||148,h=28,pad=10;let x=-w/2,y=27,tx=0,ty=46,cls='';if(pos==='top'){y=-38;ty=-19;}else if(pos==='left'){x=-(w+pad+24);y=-14;tx=x+w/2;ty=5;}else if(pos==='right'){x=pad+24;y=-14;tx=x+w/2;ty=5;}else if(pos==='bottom-left'){x=-(w+10);y=27;tx=x+w/2;ty=46;}else if(pos==='bottom-right'){x=10;y=27;tx=x+w/2;ty=46;}else if(pos==='top-left'){x=-(w+10);y=-38;tx=x+w/2;ty=-19;}else if(pos==='top-right'){x=10;y=-38;tx=x+w/2;ty=-19;}else{tx=0;ty=46;}return `<g class="city-poi ${c}" data-poi="${esc(p.id)}" transform="translate(${p.x} ${p.y})"><circle class="poi-pulse" r="28"/><circle class="poi-core" r="18"/><text class="poi-icon" y="6">${esc(p.icon||'•')}</text><rect class="poi-label-bg" x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/><text class="poi-label" x="${tx}" y="${ty}">${esc(p.name)}</text></g>`}
function drawCity(map,svg,vb){
 svg.classList.remove('regional-map');svg.classList.add('city-map');
 const sea=`<path class="city-sea" d="M0 0 H205 C245 120 205 215 245 315 C280 405 235 530 280 760 H0 Z"/><g class="sea-waves">${[110,180,250,320,390,460,530,600,670].map((y,i)=>`<path d="M25 ${y} C75 ${y-14} 125 ${y+14} 180 ${y} S245 ${y-8} 275 ${y}"/>`).join('')}</g><text x="80" y="92" class="sea-label">WESTERN SEA</text>`;
 const terrain=`<path class="city-land" d="M205 0 H1200 V760 H280 C235 530 280 405 245 315 C205 215 245 120 205 0 Z"/><g class="contours"><path d="M310 60 C440 120 500 80 620 145 S830 120 980 180 S1090 160 1190 185"/><path d="M300 135 C455 200 520 160 680 225 S900 205 1180 260"/><path d="M310 225 C475 270 600 265 735 320 S950 300 1170 350"/><path d="M315 330 C485 365 610 390 760 430 S970 410 1175 455"/></g>`;
 const districts=(map.districts||[]).map(districtSvg).join('');
 const roads=(map.roads||[]).map(r=>`<g class="city-road ${r.kind||''}"><path d="${r.d}"/><text><textPath href="#road-${Math.random().toString(36).slice(2)}"></textPath></text></g>`).join('');
 // Roads with deterministic ids + labels.
 const roads2=(map.roads||[]).map((r,i)=>`<g class="city-road ${r.kind||''}"><path id="city-road-${i}" d="${r.d}"/>${r.label?`<text><textPath href="#city-road-${i}" startOffset="46%">${esc(r.label)}</textPath></text>`:''}</g>`).join('');
 const walls=(map.walls||[]).map(w=>`<g class="city-wall"><path d="${w.d}"/>${w.label?`<text x="1080" y="390">${esc(w.label)}</text>`:''}</g>`).join('');
 const buildings=`<g class="city-blocks">${[[335,260],[385,285],[455,230],[500,310],[585,225],[635,255],[700,205],[760,240],[815,290],[530,500],[610,535],[700,525],[845,500],[950,330],[1010,290]].map(([x,y],i)=>`<path d="M${x} ${y} l18 -10 18 10 v20 l-18 10 -18-10z"/>`).join('')}</g>`;
 const pois=(map.pois||[]).map(poiSvg).join('');
 svg.innerHTML=`${defs()}${terrain}${sea}${districts}${buildings}${roads2}${walls}${pois}<g class="city-compass"><circle cx="1148" cy="698" r="33"/><text x="1148" y="678" class="compass-main">N</text><text x="1148" y="726" class="compass-main">S</text><text x="1122" y="703" class="compass-side">W</text><text x="1174" y="703" class="compass-side">E</text><path d="M1148 682 L1148 716 M1132 698 L1164 698"/></g>`;
 svg.querySelectorAll('.city-poi').forEach(g=>{const item=map.pois.find(p=>p.id===g.dataset.poi);g.addEventListener('click',()=>selectItem(item,g));g.addEventListener('pointerenter',()=>showHover(item));g.addEventListener('pointerleave',hideHover);});
}
function regionalRouteSvg(r,i){const cls=r.kind==='nighttrain'?'nighttrain':'rail';return `<g class="regional-route ${cls} ${statusClass(r.status)}"><path id="regional-route-${i}" d="${r.d}"/>${r.label?`<text dy="${r.labelDy||0}"><textPath href="#regional-route-${i}" startOffset="${r.labelOffset||'50%'}">${esc(r.label)}</textPath></text>`:''}</g>`}
function regionSvg(r){return `<g class="regional-region ${statusClass(r.status)}"><polygon points="${r.points}"/><text x="${r.labelX}" y="${r.labelY}" class="regional-region-label">${esc(r.name)}</text></g>`}
function unknownCardSvg(u,i){const x=850,y=535+i*58,w=250,h=48;return `<g class="regional-unknown ${statusClass(u.status)}" data-unknown="${esc(u.id)}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/><text x="${x+14}" y="${y+18}" class="regional-unknown-kicker">LOCATION UNKNOWN</text><text x="${x+14}" y="${y+36}" class="regional-unknown-name">${esc(u.name)}</text></g>`}
function drawRegional(map,svg,vb){
 svg.classList.remove('city-map');svg.classList.add('regional-map');
 const sea=`<path class="regional-sea" d="M0 0 H205 C230 95 205 195 235 300 C260 405 225 540 260 760 H0 Z"/><text x="58" y="88" class="regional-sea-label">WESTERN SEA</text><g class="regional-waves">${[120,190,260,330,400,470,540,610,680].map(y=>`<path d="M20 ${y} C70 ${y-12} 120 ${y+12} 185 ${y} S235 ${y-8} 260 ${y}"/>`).join('')}</g>`;
 const terrain=`<rect x="205" y="0" width="995" height="760" class="regional-land"/><g class="regional-contours"><path d="M265 155 C430 205 555 180 710 220 S930 220 1160 280"/><path d="M275 245 C470 290 615 275 760 330 S950 320 1170 380"/><path d="M300 360 C480 405 620 410 790 455 S1010 450 1175 500"/><path d="M310 505 C505 535 650 565 825 605 S1000 610 1160 640"/></g><g class="regional-terrain-labels"><text x="655" y="135">NORTHERN COLD PLAINS</text><text x="575" y="395">CENTRAL PLAINS</text><text x="955" y="330">EASTERN INLAND</text></g>`;
 const regions=(map.regions||[]).map(regionSvg).join('');
 const routes=(map.routes||[]).map(regionalRouteSvg).join('');
 const stops=(map.stops||[]).map(s=>`<g class="regional-stop ${s.kind||''}" transform="translate(${s.x} ${s.y})"><circle r="6"/><text x="10" y="-9">${esc(s.name)}</text></g>`).join('');
 const pois=(map.pois||[]).map(poiSvg).join('');
 const unknowns=(map.unknowns||[]).map(unknownCardSvg).join('');
 svg.innerHTML=`${defs()}${terrain}${sea}${regions}${routes}${stops}${pois}<g class="regional-unknown-head"><text x="850" y="515">UNLOCATED ARCHIVE</text></g>${unknowns}<g class="city-compass"><circle cx="1150" cy="710" r="33"/><text x="1150" y="690" class="compass-main">N</text><text x="1150" y="738" class="compass-main">S</text><text x="1124" y="715" class="compass-side">W</text><text x="1176" y="715" class="compass-side">E</text><path d="M1150 694 L1150 728 M1134 710 L1166 710"/></g>`;
 svg.querySelectorAll('.city-poi').forEach(g=>{const item=map.pois.find(p=>p.id===g.dataset.poi);g.addEventListener('click',()=>selectItem(item,g));g.addEventListener('pointerenter',()=>showHover(item));g.addEventListener('pointerleave',hideHover);});
 svg.querySelectorAll('.regional-unknown').forEach(g=>{const item=map.unknowns.find(p=>p.id===g.dataset.unknown);g.addEventListener('click',()=>selectItem(item,g));g.addEventListener('pointerenter',()=>showHover(item));g.addEventListener('pointerleave',hideHover);});
}
function draw(map){
 const svg=document.getElementById('mapSvg');if(!svg)return;const vb=map.viewBox||[0,0,1000,700];svg.setAttribute('viewBox',vb.join(' '));
 if(map.type==='city')drawCity(map,svg,vb);else if(map.type==='regional')drawRegional(map,svg,vb);else drawFacility(map,svg,vb);
 const coord=document.querySelector('.map-coordinate');if(coord)coord.textContent=map.coordinate||map.code||'NIGHT TRAIN // LOCAL MAP';
 document.getElementById('mapNote').innerHTML=`<b>${esc(map.label)}</b>${esc(map.note||'')}`;
 const items=(map.type==='city'||map.type==='regional')?[...(map.pois||[]),...(map.unknowns||[]) ]:(map.rooms||[]);if(S.selected){const r=items.find(x=>x.id===S.selected&&visible(x));if(r)showInspector(r,map);else showMapOverview(map);}else showMapOverview(map);
}
function render(){renderScope();const map=getMap();S.mapId=map.id;renderTabs();renderVariants(map);draw(map);}
function selectItem(item,g){S.selected=item.id;document.querySelectorAll('.map-room,.city-poi,.regional-unknown').forEach(x=>x.classList.toggle('selected',x===g));showInspector(item,getMap())}
function showMapOverview(map){const el=document.getElementById('mapInspector');const title=map.type==='city'?'CITY DATABASE':map.type==='regional'?'REGIONAL DATABASE':'MAP DATABASE';const copy=map.type==='city'?'地点にカーソルを合わせると名称を確認でき、クリックすると詳細を固定表示します。地区の輪郭は都市構造を読みやすくするための模式表示です。':map.type==='regional'?'都市・国家ノードにカーソルを合わせると名称を確認でき、クリックすると詳細を固定表示します。右下の LOCATION UNKNOWN は地理をまだ固定していない項目です。':'マップ上の区画にカーソルを合わせると名称を確認でき、クリックすると詳細を固定表示します。';el.innerHTML=`<div class="map-image map-image-empty"><img src="assets/images/locations/_placeholder.svg" alt="未登録のイメージ"></div><div class="eyebrow">${title}</div><h3>${esc(map.label)}</h3><div class="map-badges"><span class="badge confirm">正史確定</span><span class="badge map-author-badge">今回確定</span><span class="badge unknown">配置案</span></div><p>${copy}</p><div class="map-tip">正史資料にない厳密な方角・寸法・道路形状は「配置案」として扱います。作者回答で今回確定した立地や地区構成とは区別しています。</div>`;}
function showInspector(r,map){const el=document.getElementById('mapInspector');const img=r.image||'assets/images/locations/_placeholder.svg';const ppl=(r.people||[]).length?`<dl class="map-kv"><dt>主な人物</dt><dd>${r.people.map(esc).join(' / ')}</dd></dl>`:'';const district=r.district?`<dl class="map-kv"><dt>地区</dt><dd>${esc(r.district)}</dd></dl>`:'';const locBtn=r.location?`<button class="map-open-entry" data-loc="${esc(r.location)}">資料項目を開く →</button>`:'';el.innerHTML=`<div class="map-image"><div class="map-image-fallback">IMAGE // NOT REGISTERED</div><img src="${esc(img)}" alt="${esc(r.name)}のイメージ"></div><div class="eyebrow">${map?.type==='city'?'CITY LOCATION':map?.type==='regional'?'REGIONAL LOCATION':'LOCATION DATA'}</div><h3>${esc(r.name)}</h3><div class="map-badges"><span class="badge ${r.status==='canon'?'confirm':r.status==='author'?'gold':'unknown'}">${statusLabel(r.status)}</span></div><p>${esc(r.desc||'')}</p>${district}${ppl}${locBtn}`;const im=el.querySelector('.map-image img');if(im){im.addEventListener('load',()=>im.parentElement.classList.add('loaded'));im.addEventListener('error',()=>{if(!im.src.endsWith('_placeholder.svg'))im.src='assets/images/locations/_placeholder.svg';else im.remove()})}const btn=el.querySelector('.map-open-entry');if(btn)btn.addEventListener('click',()=>openArchiveLocation(btn.dataset.loc));}
function openArchiveLocation(title){const D=window.NT_DATA;const i=D.locations.findIndex(x=>x.title===title);if(i>=0&&typeof window.openLocation==='function')window.openLocation(i);}
function showHover(r){const el=document.getElementById('mapHover');if(!el)return;el.textContent=`${r.name}  //  ${statusLabel(r.status)}`;el.classList.add('show')}
function hideHover(){const el=document.getElementById('mapHover');if(el)el.classList.remove('show')}
window.NT_MAPS_UI={render,setScope:(scope)=>{S.scope=scope;const f=scoped()[0];if(f)S.mapId=f.id;S.variant=null;S.selected=null;render();}};
})();
