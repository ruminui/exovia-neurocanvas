(() => {
  const STOP = new Set('the and for that with from this into are was were have has had not but you your our their its can will would should could about over under between through como para que una del las los por con sin sus este esta desde sobre entre donde cuando porque muy más pero'.split(' '));
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const state = { map:null, view:'network', scale:1, x:0, y:0, dragging:false, lastX:0, lastY:0, selected:null, highlighted:new Set() };

  const demoText = `Exovia NeuroCanvas is a visual memory system for navigating complex knowledge. Traditional documents force people to scroll linearly, while conversations bury useful context in endless histories. NeuroCanvas turns information into a territory.

The ingestion layer accepts notes, documentation, conversations and source code. It preserves headings and original text, divides content into stable fragments and extracts useful local metadata. Every fragment remains traceable to its source.

The semantic layer identifies important keywords and measures relationships between fragments. In offline mode it uses weighted token overlap. An optional AI adapter can later add embeddings, structured summaries and richer concept extraction without replacing the local engine.

The hierarchy begins with a corpus root. Topics become branches, related fragments become leaves, and cross-topic similarities become semantic connections. The tree communicates structure while the neural graph reveals unexpected relationships.

The infinite canvas uses pan, zoom and progressive detail. At a distance the user sees the whole corpus. Closer views reveal clusters and labels. Selecting a node opens exact evidence instead of presenting an unverifiable visual abstraction.

Zoom to Answer connects search and navigation. A query is scored against every node, the most relevant evidence is highlighted, and the camera moves to the strongest result. The user can then inspect the semantic path from corpus to source fragment.

Privacy is central to the offline-first design. Documents can remain in the browser, project files can be exported locally, and no secret is required for the core demonstration. External AI services are optional and must be called through a secure server.

Future versions can support collaborative knowledge spaces, codebase maps, company memory, educational atlases and multimodal evidence. The long-term vision is a universal interface where knowledge is navigated rather than merely scrolled.`;

  function words(text){ return (text.toLowerCase().match(/[a-záéíóúñü0-9]{3,}/g)||[]).filter(w=>!STOP.has(w)); }
  function keywords(text, limit=6){ const f={}; words(text).forEach(w=>f[w]=(f[w]||0)+1); return Object.entries(f).sort((a,b)=>b[1]-a[1]).slice(0,limit).map(x=>x[0]); }
  function similarity(a,b){ const A=new Set(a), B=new Set(b); let n=0; A.forEach(x=>{if(B.has(x))n++}); return n/Math.max(1,new Set([...A,...B]).size); }
  function chunks(text){
    const paras=text.replace(/\r/g,'').split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean);
    const out=[];
    paras.forEach(p=>{ if(p.length<900) out.push(p); else { const sentences=p.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[p]; let cur=''; sentences.forEach(s=>{ if((cur+s).length>700&&cur){out.push(cur.trim());cur='';} cur+=s; }); if(cur.trim())out.push(cur.trim()); }});
    return out;
  }
  function titleFor(text, i){ const first=(text.split(/[.!?\n]/)[0]||'').trim(); return first.length>64 ? first.slice(0,61)+'…' : first || `Fragment ${i+1}`; }
  function buildMap(title,text){
    const parts=chunks(text); const nodes=[]; const edges=[];
    const root={id:'root',type:'corpus',title,summary:`${parts.length} source fragments`,text,keywords:keywords(text,8),x:0,y:0,parent:null,level:0}; nodes.push(root);
    const raw=parts.map((p,i)=>({id:`chunk-${i}`,type:'chunk',title:titleFor(p,i),summary:p.slice(0,150),text:p,keywords:keywords(p),parent:null,level:2}));
    const groups=new Map(); raw.forEach(n=>{const key=n.keywords[0]||'context'; if(!groups.has(key))groups.set(key,[]); groups.get(key).push(n);});
    let gi=0; for(const [key,list] of groups){ const id=`topic-${gi++}`; const topic={id,type:'topic',title:key[0].toUpperCase()+key.slice(1),summary:`${list.length} related fragments`,text:list.map(x=>x.text).join('\n\n'),keywords:keywords(list.map(x=>x.text).join(' ')),parent:'root',level:1}; nodes.push(topic); edges.push({a:'root',b:id,type:'hierarchical',weight:1}); list.forEach(n=>{n.parent=id;nodes.push(n);edges.push({a:id,b:n.id,type:'hierarchical',weight:1});}); }
    for(let i=0;i<raw.length;i++) for(let j=i+1;j<raw.length;j++){ const s=similarity(raw[i].keywords,raw[j].keywords); if(s>=.16)edges.push({a:raw[i].id,b:raw[j].id,type:'semantic',weight:s}); }
    return {title,createdAt:new Date().toISOString(),nodes,edges};
  }
  function layout(){ if(!state.map)return; const topics=state.map.nodes.filter(n=>n.type==='topic'); const root=state.map.nodes[0]; root.x=0;root.y=0;
    if(state.view==='tree'){
      root.x=-430;root.y=0; topics.forEach((t,i)=>{t.x=-120;t.y=(i-(topics.length-1)/2)*150; const kids=state.map.nodes.filter(n=>n.parent===t.id); kids.forEach((n,j)=>{n.x=250+(j%2)*190;n.y=t.y+(j-(kids.length-1)/2)*72;});});
    } else {
      topics.forEach((t,i)=>{const a=i/Math.max(1,topics.length)*Math.PI*2;t.x=Math.cos(a)*260;t.y=Math.sin(a)*220; const kids=state.map.nodes.filter(n=>n.parent===t.id); kids.forEach((n,j)=>{const aa=a+(j-(kids.length-1)/2)*.18; const r=430+(j%3)*55;n.x=Math.cos(aa)*r;n.y=Math.sin(aa)*r*.78;});});
    }
  }
  function resize(){const r=canvas.getBoundingClientRect(),d=devicePixelRatio||1;canvas.width=r.width*d;canvas.height=r.height*d;ctx.setTransform(d,0,0,d,0,0);draw();}
  function screen(n){const r=canvas.getBoundingClientRect();return{x:r.width/2+state.x+n.x*state.scale,y:r.height/2+state.y+n.y*state.scale};}
  function draw(){ const r=canvas.getBoundingClientRect();ctx.clearRect(0,0,r.width,r.height); if(!state.map)return;
    ctx.save(); state.map.edges.forEach(e=>{const a=state.map.nodes.find(n=>n.id===e.a),b=state.map.nodes.find(n=>n.id===e.b);if(!a||!b)return;const A=screen(a),B=screen(b);ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.strokeStyle=e.type==='semantic'?`rgba(216,170,66,${.08+e.weight*.34})`:'rgba(216,170,66,.2)';ctx.lineWidth=e.type==='semantic'?1:1.4;ctx.stroke();});
    state.map.nodes.forEach(n=>{const p=screen(n), rad=(n.type==='corpus'?25:n.type==='topic'?16:8)*Math.max(.75,Math.min(1.4,state.scale));const selected=state.selected===n.id, hi=state.highlighted.has(n.id);ctx.beginPath();ctx.arc(p.x,p.y,rad,0,Math.PI*2);ctx.fillStyle=n.type==='corpus'?'#d8aa42':n.type==='topic'?'#8d6d27':'#201b10';ctx.fill();ctx.strokeStyle=selected?'#fff3c8':hi?'#f0d28a':'#d8aa42';ctx.lineWidth=selected||hi?3:1.2;ctx.stroke(); if(state.scale>.62||n.type!=='chunk'){ctx.fillStyle=selected||hi?'#fff3c8':'#d8d2c3';ctx.font=`${n.type==='corpus'?14:n.type==='topic'?12:10}px system-ui`;ctx.textAlign='center';ctx.fillText(n.title.slice(0,34),p.x,p.y+rad+15);}});ctx.restore(); }
  function fit(){ if(!state.map)return;const xs=state.map.nodes.map(n=>n.x),ys=state.map.nodes.map(n=>n.y),r=canvas.getBoundingClientRect();const w=Math.max(...xs)-Math.min(...xs)+180,h=Math.max(...ys)-Math.min(...ys)+180;state.scale=Math.max(.25,Math.min(1.2,Math.min(r.width/w,r.height/h)));state.x=0;state.y=0;draw();}
  function inspect(n){state.selected=n.id;const path=[];let cur=n;while(cur){path.unshift(cur.title);cur=state.map.nodes.find(x=>x.id===cur.parent)}document.getElementById('details').className='details';document.getElementById('details').innerHTML=`<div class="type">${n.type}</div><h2>${escapeHtml(n.title)}</h2><div class="path">${path.map(escapeHtml).join(' → ')}</div><div class="chips">${n.keywords.map(k=>`<span class="chip">${escapeHtml(k)}</span>`).join('')}</div><div class="source">${escapeHtml(n.text)}</div>`;draw();}
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
  function updateUI(){const m=state.map;document.getElementById('emptyState').classList.toggle('hidden',!!m); if(!m)return; const topics=m.nodes.filter(n=>n.type==='topic').length,ch=m.nodes.filter(n=>n.type==='chunk').length;document.getElementById('stats').innerHTML=`<div class="stat"><strong>${m.nodes.length}</strong><span>nodes</span></div><div class="stat"><strong>${m.edges.length}</strong><span>connections</span></div><div class="stat"><strong>${topics}</strong><span>topics</span></div><div class="stat"><strong>${ch}</strong><span>sources</span></div>`;}
  function load(title,text){state.map=buildMap(title,text);state.highlighted.clear();state.selected=null;layout();updateUI();fit();}
  function search(){if(!state.map)return;const q=document.getElementById('searchInput').value.trim();if(!q)return;const qk=keywords(q,8),ql=q.toLowerCase();const scored=state.map.nodes.filter(n=>n.type!=='corpus').map(n=>({n,s:(n.text.toLowerCase().includes(ql)?2:0)+similarity(qk,n.keywords)+(n.title.toLowerCase().includes(ql)?1:0)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,6);state.highlighted=new Set(scored.map(x=>x.n.id));document.getElementById('results').innerHTML=scored.length?scored.map((x,i)=>`<div class="result" data-id="${x.n.id}"><strong>${i+1}. ${escapeHtml(x.n.title)}</strong><small>${x.n.type} · relevance ${x.s.toFixed(2)}</small></div>`).join(''):'<div class="hint">No evidence found in this corpus.</div>';document.querySelectorAll('.result').forEach(el=>el.onclick=()=>focusNode(el.dataset.id));if(scored[0])focusNode(scored[0].n.id);draw();}
  function focusNode(id){const n=state.map.nodes.find(x=>x.id===id);if(!n)return;state.scale=Math.max(state.scale,1.15);state.x=-n.x*state.scale;state.y=-n.y*state.scale;inspect(n);draw();}
  function hit(x,y){if(!state.map)return null;for(let i=state.map.nodes.length-1;i>=0;i--){const n=state.map.nodes[i],p=screen(n),r=n.type==='corpus'?28:n.type==='topic'?20:13;if(Math.hypot(x-p.x,y-p.y)<r)return n;}return null;}
  canvas.addEventListener('mousedown',e=>{const n=hit(e.offsetX,e.offsetY);if(n){inspect(n);return;}state.dragging=true;state.lastX=e.clientX;state.lastY=e.clientY});
  window.addEventListener('mousemove',e=>{if(!state.dragging)return;state.x+=e.clientX-state.lastX;state.y+=e.clientY-state.lastY;state.lastX=e.clientX;state.lastY=e.clientY;draw();});window.addEventListener('mouseup',()=>state.dragging=false);
  canvas.addEventListener('wheel',e=>{e.preventDefault();const old=state.scale;state.scale=Math.max(.18,Math.min(3.5,state.scale*Math.exp(-e.deltaY*.001)));const r=canvas.getBoundingClientRect(),mx=e.clientX-r.left-r.width/2,my=e.clientY-r.top-r.height/2;state.x=mx-(mx-state.x)*(state.scale/old);state.y=my-(my-state.y)*(state.scale/old);draw();},{passive:false});
  document.getElementById('demoBtn').onclick=document.getElementById('emptyDemoBtn').onclick=()=>load('Exovia NeuroCanvas Vision',demoText);
  document.getElementById('pasteBtn').onclick=()=>document.getElementById('pasteDialog').showModal();
  document.getElementById('buildBtn').onclick=e=>{const t=document.getElementById('textInput').value.trim();if(t){e.preventDefault();load(document.getElementById('docTitle').value||'Knowledge map',t);document.getElementById('pasteDialog').close();}};
  document.getElementById('fileInput').onchange=async e=>{const f=e.target.files[0];if(!f)return;const text=await f.text();if(f.name.endsWith('.json')){try{state.map=JSON.parse(text);layout();updateUI();fit();}catch{alert('Invalid NeuroCanvas JSON file.')}}else load(f.name.replace(/\.[^.]+$/,''),text);};
  document.getElementById('exportBtn').onclick=()=>{if(!state.map)return;const b=new Blob([JSON.stringify(state.map,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='exovia-neurocanvas-map.json';a.click();URL.revokeObjectURL(a.href);};
  document.getElementById('fitBtn').onclick=fit;document.getElementById('searchBtn').onclick=search;document.getElementById('searchInput').onkeydown=e=>{if(e.key==='Enter')search();};
  document.getElementById('networkView').onclick=()=>{state.view='network';document.getElementById('networkView').classList.add('active');document.getElementById('treeView').classList.remove('active');layout();fit();};
  document.getElementById('treeView').onclick=()=>{state.view='tree';document.getElementById('treeView').classList.add('active');document.getElementById('networkView').classList.remove('active');layout();fit();};
  window.addEventListener('resize',resize);resize();
})();
