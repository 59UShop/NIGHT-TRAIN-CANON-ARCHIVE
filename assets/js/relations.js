
(function(){
 const R={}; const NS='http://www.w3.org/2000/svg';
 const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
 R.render=function(){
   const svg=document.getElementById('relationSvg'),side=document.getElementById('relationSide'); if(!svg)return;
   const data=window.NT_RELATIONS||{edges:[],positions:{}}; const chars=window.NT_DATA.characters;
   const names=[...new Set(data.edges.flatMap(e=>[e.a,e.b]))];
   const byName=Object.fromEntries(chars.map(c=>[c.name,c]));
   svg.innerHTML='';
   const edgeEls=[];
   data.edges.forEach((e,i)=>{
      const a=data.positions[e.a],b=data.positions[e.b]; if(!a||!b)return;
      const line=document.createElementNS(NS,'line');line.setAttribute('x1',a[0]);line.setAttribute('y1',a[1]);line.setAttribute('x2',b[0]);line.setAttribute('y2',b[1]);line.setAttribute('class',`rel-edge ${e.type}`);line.dataset.a=e.a;line.dataset.b=e.b;svg.appendChild(line);
      const label=document.createElementNS(NS,'text');label.setAttribute('x',(a[0]+b[0])/2);label.setAttribute('y',(a[1]+b[1])/2-7);label.setAttribute('class','rel-label');label.textContent=e.label;label.dataset.a=e.a;label.dataset.b=e.b;svg.appendChild(label);edgeEls.push({e,line,label});
   });
   names.forEach((name,idx)=>{
      const p=data.positions[name];if(!p)return; const g=document.createElementNS(NS,'g');g.setAttribute('class','rel-node');g.dataset.name=name;g.setAttribute('transform',`translate(${p[0]},${p[1]})`);
      const halo=document.createElementNS(NS,'circle');halo.setAttribute('r',50);halo.setAttribute('class','halo');g.appendChild(halo);
      const core=document.createElementNS(NS,'circle');core.setAttribute('r',38);core.setAttribute('class','core');g.appendChild(core);
      const t=document.createElementNS(NS,'text');t.setAttribute('y',-2);const shortName=name.replace('・アステラ','').replace('・ヴァレン','').replace('・クロウリー','').replace('・アルシェ','');t.textContent=shortName.length>9?shortName.slice(0,8)+'…':shortName;g.appendChild(t);
      const s=document.createElementNS(NS,'text');s.setAttribute('y',16);s.setAttribute('class','small');s.textContent=(byName[name]?.role||'').slice(0,12);g.appendChild(s);
      g.addEventListener('click',()=>focus(name));svg.appendChild(g);
   });
   function focus(name){
      const connected=data.edges.filter(e=>e.a===name||e.b===name); const related=new Set(connected.flatMap(e=>[e.a,e.b]));
      svg.querySelectorAll('.rel-node').forEach(n=>{n.classList.toggle('active',n.dataset.name===name);n.classList.toggle('dim',!related.has(n.dataset.name))});
      edgeEls.forEach(x=>{const active=x.e.a===name||x.e.b===name;x.line.classList.toggle('active',active);x.line.classList.toggle('dim',!active);x.label.classList.toggle('active',active)});
      const c=byName[name]||{};
      side.innerHTML=`<div class="eyebrow">RELATION FOCUS</div><h3>${esc(name)}</h3><p>${esc(c.role||c.category||'')}</p><div class="relation-list">${connected.length?connected.map(e=>{const other=e.a===name?e.b:e.a;return `<button class="relation-row" data-name="${esc(other)}"><b>${esc(other)}</b><small>${esc(e.label)}</small></button>`}).join(''):'<div class="notice">登録済みの直接関係はありません。</div>'}</div><button class="filterbtn" id="clearRelation" style="margin-top:12px">全体表示へ戻す</button>`;
      side.querySelectorAll('.relation-row').forEach(b=>b.onclick=()=>focus(b.dataset.name));document.getElementById('clearRelation').onclick=clear;
   }
   function clear(){svg.querySelectorAll('.rel-node,.rel-edge').forEach(x=>x.classList.remove('active','dim'));svg.querySelectorAll('.rel-label').forEach(x=>x.classList.remove('active'));side.innerHTML=`<div class="eyebrow">RELATION MAP</div><h3>人物相関図</h3><p>人物ノードを選ぶと、その人物に直接つながる関係だけを強調してラベル表示します。</p><div class="legend"><span>家族</span><span>恋愛</span><span>友情</span><span>仕事</span><span>特別</span><span>芽</span></div><div class="notice">関係は「正史資料に明示されたもの」を中心に登録しています。今後の設定更新で edges を増やせます。</div>`}
   clear();
   R.focus=focus;
 };
 window.NT_RELATIONS_UI=R;
})();
