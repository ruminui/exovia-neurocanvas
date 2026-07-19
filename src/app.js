(() => {
  'use strict';
  const STOP = new Set('the and for that with from this into are was were have has had not but you your our their its can will would should could about over under between through como para que una del las los por con sin sus este esta desde sobre entre donde cuando porque muy más pero'.split(' '));
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const state = {map:null, view:'network', scale:1, x:0, y:0, dragging:false, lastX:0, lastY:0, selected:null, highlighted:new Set(), pulseIndex:-1, pulseTimer:null, intentHits:[]};

  const demoText = `Exovia NeuroCanvas is a visual memory system for navigating complex knowledge. Traditional documents force people to scroll linearly, while conversations bury useful context in endless histories. NeuroCanvas turns information into a territory.

The ingestion layer accepts notes, documentation, conversations and source code. It preserves headings and original text, divides content into stable fragments and extracts useful local metadata. Every fragment remains traceable to its source.

The semantic layer identifies important keywords and measures relationships between fragments. In offline mode it uses weighted token overlap. An optional AI adapter can later add embeddings, structured summaries and richer concept extraction without replacing the local engine.

ExiaL adds compact observable pulses for agent handoffs, evidence retrieval, health checks and route decisions. EXIR-style validation converts each pulse into a canonical event before it changes the graph.

FAPI contributes a capability mesh. Tools, services and agents can declare ROUTE, GENERATE, STREAM, HEALTH, BUDGET and WARMUP capabilities. NeuroCanvas displays them without executing anything automatically.

Exil is used as a safe declarative intent preview. A constrained intent can search, focus and propose semantic links, but it cannot call external services. Mutations require validation and explicit approval.

The infinite canvas uses pan, zoom and progressive detail. At a distance the user sees the whole corpus. Closer views reveal clusters and labels. Selecting a node opens exact evidence instead of presenting an unverifiable visual abstraction.

Zoom to Answer connects search and navigation. A query is scored against every node, the most relevant evidence is highlighted, and the camera moves to the strongest result.

Privacy is central to the offline-first design. Documents remain in the browser, project files export locally, and no secret is required for the core demonstration.`;

  const pulseDemo = `>>1|S>User|A>INGEST|P>{"target":"NeuroCanvas","document":"Exovia architecture"}
>>2|S>NeuroCanvas|A>CHUNK|P>{"fragments":8,"status":"ok"}
>>3|S>NeuroCanvas|A>ROUTE|P>{"to":"FAPI","request":"capability discovery"}
>>4|S>FAPI|A>FAPI_HELLO|P>{"version":1,"actions":["ROUTE","GENERATE","STREAM","HEALTH","BUDGET","WARMUP"]}
>>5|S>FAPI|A>HEALTH|P>{"service":"local-router","status":"ok"}
>>6|S>ResearchAgent|A>ASSIGN|P>{"task":"find ExiaL evidence","status":"accepted"}
>>7|S>ResearchAgent|A>EVIDENCE|P>{"source":"Drive","result":"EXIR 33/33 tests PASS"}
>>8|S>EXIR|A>VALIDATE|P>{"event":"EVIDENCE","status":"canonical"}
>>9|S>NeuroCanvas|A>ZOOM_TO_ANSWER|P>{"query":"low overhead agent memory","hits":["FAPI","ExiaL","EXIR"]}
>>10|S>Policy|A>BUDGET|P>{"mode":"offline","tokens":0,"status":"allowed"}`;

  const capabilities = [
    {name:'FAPI Router', actions:['ROUTE','HEALTH','BUDGET'], status:'ready', description:'Local capability discovery and routing plane.'},
    {name:'Generator Adapter', actions:['GENERATE','STREAM'], status:'optional', description:'Server-side model adapter; disabled in offline mode.'},
    {name:'Warmup Manager', actions:['WARMUP','HEALTH'], status:'ready', description:'Tracks service readiness without invoking remote APIs.'},
    {name:'EXIR Validator', actions:['PARSE','VALIDATE','NORMALIZE'], status:'ready', description:'Canonicalizes ExiaL events before graph mutation.'},
    {name:'Exil Preview', actions:['FIND','FOCUS','LINK','EXPLAIN'], status:'sandboxed', description:'Safe declarative graph-intent preview; no external execution.'}
  ];

  function words(text){return (String(text).toLowerCase().match(/[a-záéíóúñü0-9_:-]{3,}/g)||[]).filter(w=>!STOP.has(w));}
  function keywords(text,limit=6){const f={};words(text).forEach(w=>f[w]=(f[w]||0)+1);return Object.entries(f).sort((a,b)=>b[1]-a[1]).slice(0,limit).map(x=>x[0]);}
  function similarity(a,b){const A=new Set(a),B=new Set(b);let n=0;A.forEach(x=>{if(B.has(x))n++;});return n/Math.max(1,new Set([...A,...B]).size);}
  function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
  function chunks(text){const paras=String(text).replace(/\r/g,'').split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean),out=[];paras.forEach(p=>{if(p.length<900)out.push(p);else{const sentences=p.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[p];let cur='';sentences.forEach(s=>{if((cur+s).length>700&&cur){out.push(cur.trim());cur='';}cur+=s;});if(cur.trim())out.push(cur.trim());}});return out;}
  function titleFor(text,i){const first=(text.split(/[.!?\n]/)[0]||'').trim();return first.length>64?first.slice(0,61)+'…':first||`Fragment ${i+1}`;}

  function buildMap(title,text){
    const parts=chunks(text),nodes=[],edges=[];
    nodes.push({id:'root',type:'corpus',title,summary:`${parts.length} source fragments`,text,keywords:keywords(text,8),x:0,y:0,parent:null,level:0});
    const raw=parts.map((p,i)=>({id:`chunk-${i}`,type:'chunk',title:titleFor(p,i),summary:p.slice(0,150),text:p,keywords:keywords(p),parent:null,level:2}));
    const groups=new Map();raw.forEach(n=>{const key=n.keywords[0]||'context';if(!groups.has(key))groups.set(key,[]);groups.get(key).push(n);});
    let gi=0;for(const [key,list] of groups){const id=`topic-${gi++}`,joined=list.map(x=>x.text).join('\n\n');nodes.push({id,type:'topic',title:key[0].toUpperCase()+key.slice(1),summary:`${list.length} related fragments`,text:joined,keywords:keywords(joined),parent:'root',level:1});edges.push({a:'root',b:id,type:'hierarchical',weight:1});list.forEach(n=>{n.parent=id;nodes.push(n);edges.push({a:id,b:n.id,type:'hierarchical',weight:1});});}
    for(let i=0;i<raw.length;i++)for(let j=i+1;j<raw.length;j++){const s=similarity(raw[i].keywords,raw[j].keywords);if(s>=.16)edges.push({a:raw[i].id,b:raw[j].id,type:'semantic',weight:s});}
    return {format:'neurocanvas-v2',title,createdAt:new Date().toISOString(),kind:'memory',nodes,edges,events:[],audit:[{time:new Date().toISOString(),action:'MAP_CREATED',detail:`${nodes.length} nodes generated locally`} ]};
  }

  function parseExialLine(line,index){
    const trimmed=line.trim();if(!trimmed||!trimmed.startsWith('>>'))return null;
    const version=(trimmed.match(/^>>(\d+)/)||[])[1]||'1';
    const body=trimmed.replace(/^>>\d+\|?/,'');
    const source=(body.match(/(?:^|\|)S>([^|]+)/)||body.match(/^([^>|]+)>/)||[])[1]?.trim()||'unknown';
    const action=(body.match(/(?:^|\|)A>([^|]+)/)||body.match(/^[^>]+>[^|]+\|([^|]+)/)||[])[1]?.trim()||'EVENT';
    let payloadRaw=(body.match(/(?:^|\|)P>(.*)$/)||[])[1]?.trim()||'';
    if(!payloadRaw){const bits=body.split('|');payloadRaw=bits.slice(2).join('|');}
    let payload=payloadRaw;try{payload=JSON.parse(payloadRaw);}catch{}
    return {id:`event-${index}`,version,source,action,payload,payloadRaw,timestamp:new Date(Date.now()+index).toISOString(),status:'observed',traceId:`trace-${String(index+1).padStart(3,'0')}`};
  }

  function buildPulseMap(title,text){
    const events=text.split(/\r?\n/).map(parseExialLine).filter(Boolean);if(!events.length)throw new Error('No valid ExiaL pulses found.');
    const nodes=[{id:'root',type:'corpus',title,summary:`${events.length} validated pulses`,text,keywords:['exial','pulse','audit'],parent:null,level:0}],edges=[];
    const actorIds=new Map();
    function actor(name){if(actorIds.has(name))return actorIds.get(name);const id=`actor-${actorIds.size}`;actorIds.set(name,id);nodes.push({id,type:name==='FAPI'?'capability':'agent',title:name,summary:'ExiaL actor',text:`Actor: ${name}`,keywords:keywords(name),parent:'root',level:1});edges.push({a:'root',b:id,type:'hierarchical',weight:1});return id;}
    events.forEach((ev,i)=>{const from=actor(ev.source);let target='NeuroCanvas';if(ev.payload&&typeof ev.payload==='object')target=ev.payload.to||ev.payload.target||ev.payload.service||target;const to=actor(String(target));const id=`pulse-${i}`;nodes.push({id,type:'event',title:ev.action,summary:`${ev.source} → ${target}`,text:ev.payloadRaw||JSON.stringify(ev.payload),keywords:keywords(`${ev.source} ${ev.action} ${ev.payloadRaw}`),parent:from,level:2,event:ev});edges.push({a:from,b:id,type:'pulse-source',weight:1,eventIndex:i});edges.push({a:id,b:to,type:'pulse-target',weight:1,eventIndex:i});});
    return {format:'neurocanvas-v2',title,createdAt:new Date().toISOString(),kind:'pulse',nodes,edges,events,audit:events.map(e=>({time:e.timestamp,action:e.action,detail:`${e.source}: ${e.payloadRaw}`}))};
  }

  function buildCapabilityMap(){
    const nodes=[{id:'root',type:'corpus',title:'FAPI Capability Mesh',summary:`${capabilities.length} local capability declarations`,text:'Read-only capability map. No action executes from this view.',keywords:['fapi','capabilities','routing'],parent:null,level:0}],edges=[];
    capabilities.forEach((c,i)=>{const id=`cap-${i}`;nodes.push({id,type:'capability',title:c.name,summary:c.description,text:JSON.stringify(c,null,2),keywords:c.actions.map(x=>x.toLowerCase()),parent:'root',level:1,capability:c});edges.push({a:'root',b:id,type:'capability',weight:1});c.actions.forEach((a,j)=>{const aid=`action-${i}-${j}`;nodes.push({id:aid,type:'action',title:a,summary:`${c.name} supports ${a}`,text:`Capability: ${c.name}\nAction: ${a}\nStatus: ${c.status}`,keywords:[a.toLowerCase(),c.status],parent:id,level:2});edges.push({a:id,b:aid,type:'hierarchical',weight:1});});});
    return {format:'neurocanvas-v2',title:'FAPI Capability Mesh',createdAt:new Date().toISOString(),kind:'capability',nodes,edges,events:[],audit:[{time:new Date().toISOString(),action:'CAPABILITY_DISCOVERY',detail:'Loaded local declarations in read-only mode'}]};
  }

  function setView(view){state.view=view;['network','tree','pulse','capability'].forEach(v=>document.getElementById(`${v}View`)?.classList.toggle('active',v===view));document.getElementById('pulseControls').classList.toggle('hidden',view!=='pulse');layout();fit();}
  function layout(){
    if(!state.map)return;const root=state.map.nodes.find(n=>n.id==='root')||state.map.nodes[0],level1=state.map.nodes.filter(n=>n.parent==='root');root.x=0;root.y=0;
    if(state.view==='tree'){
      root.x=-470;level1.forEach((t,i)=>{t.x=-150;t.y=(i-(level1.length-1)/2)*150;const kids=state.map.nodes.filter(n=>n.parent===t.id);kids.forEach((n,j)=>{n.x=250+(j%2)*180;n.y=t.y+(j-(kids.length-1)/2)*70;});});
    }else if(state.view==='pulse'&&state.map.kind==='pulse'){
      const actors=state.map.nodes.filter(n=>['agent','capability'].includes(n.type));actors.forEach((n,i)=>{n.x=-360+(i%3)*360;n.y=-220+Math.floor(i/3)*280;});state.map.nodes.filter(n=>n.type==='event').forEach((n,i)=>{const a=state.map.nodes.find(x=>x.id===n.parent);n.x=(a?.x||0)+120+(i%4)*75;n.y=(a?.y||0)+50+(i%3)*55;});
    }else{
      level1.forEach((t,i)=>{const a=i/Math.max(1,level1.length)*Math.PI*2;t.x=Math.cos(a)*270;t.y=Math.sin(a)*220;const kids=state.map.nodes.filter(n=>n.parent===t.id);kids.forEach((n,j)=>{const aa=a+(j-(kids.length-1)/2)*.18,r=430+(j%3)*55;n.x=Math.cos(aa)*r;n.y=Math.sin(aa)*r*.78;});});
    }
  }

  function resize(){const r=canvas.getBoundingClientRect(),d=devicePixelRatio||1;canvas.width=r.width*d;canvas.height=r.height*d;ctx.setTransform(d,0,0,d,0,0);draw();}
  function screen(n){const r=canvas.getBoundingClientRect();return{x:r.width/2+state.x+(n.x||0)*state.scale,y:r.height/2+state.y+(n.y||0)*state.scale};}
  function nodeStyle(n){if(n.type==='corpus')return['#d8aa42',25];if(n.type==='topic')return['#8d6d27',16];if(n.type==='agent')return['#5e512e',17];if(n.type==='capability')return['#7d6427',18];if(n.type==='event')return['#211b0d',9];if(n.type==='action')return['#15130e',8];return['#201b10',8];}
  function draw(){
    const r=canvas.getBoundingClientRect();ctx.clearRect(0,0,r.width,r.height);if(!state.map)return;
    state.map.edges.forEach(e=>{const a=state.map.nodes.find(n=>n.id===e.a),b=state.map.nodes.find(n=>n.id===e.b);if(!a||!b)return;const A=screen(a),B=screen(b),active=Number.isInteger(e.eventIndex)&&e.eventIndex===state.pulseIndex;ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.strokeStyle=active?'rgba(255,244,198,.95)':e.type==='semantic'?`rgba(216,170,66,${.08+e.weight*.34})`:e.type.startsWith('pulse')?'rgba(216,170,66,.28)':'rgba(216,170,66,.2)';ctx.lineWidth=active?4:e.type==='semantic'?1:1.4;ctx.stroke();if(active){const t=.55,px=A.x+(B.x-A.x)*t,py=A.y+(B.y-A.y)*t;ctx.beginPath();ctx.arc(px,py,6,0,Math.PI*2);ctx.fillStyle='#fff3c8';ctx.fill();}});
    state.map.nodes.forEach(n=>{const p=screen(n),[fill,base]=nodeStyle(n),rad=base*Math.max(.75,Math.min(1.4,state.scale)),selected=state.selected===n.id,hi=state.highlighted.has(n.id),pulse=n.type==='event'&&n.event&&Number(n.id.split('-')[1])===state.pulseIndex;ctx.beginPath();ctx.arc(p.x,p.y,rad,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=selected?'#fff3c8':pulse?'#ffffff':hi?'#f0d28a':'#d8aa42';ctx.lineWidth=selected||hi||pulse?3:1.2;ctx.stroke();if(state.scale>.62||n.type!=='chunk'){ctx.fillStyle=selected||hi||pulse?'#fff3c8':'#d8d2c3';ctx.font=`${n.type==='corpus'?14:['topic','agent','capability'].includes(n.type)?12:10}px system-ui`;ctx.textAlign='center';ctx.fillText(n.title.slice(0,34),p.x,p.y+rad+15);}});
  }
  function fit(){if(!state.map||!state.map.nodes.length)return;const xs=state.map.nodes.map(n=>n.x||0),ys=state.map.nodes.map(n=>n.y||0),r=canvas.getBoundingClientRect(),w=Math.max(...xs)-Math.min(...xs)+180,h=Math.max(...ys)-Math.min(...ys)+180;state.scale=Math.max(.22,Math.min(1.2,Math.min(r.width/w,r.height/h)));state.x=0;state.y=0;draw();}

  function inspect(n){
    state.selected=n.id;const path=[];let cur=n;while(cur){path.unshift(cur.title);cur=state.map.nodes.find(x=>x.id===cur.parent);}const extra=n.event?`<dl><dt>Source</dt><dd>${escapeHtml(n.event.source)}</dd><dt>Action</dt><dd>${escapeHtml(n.event.action)}</dd><dt>Trace</dt><dd>${escapeHtml(n.event.traceId)}</dd><dt>Status</dt><dd>${escapeHtml(n.event.status)}</dd></dl>`:n.capability?`<dl><dt>Status</dt><dd>${escapeHtml(n.capability.status)}</dd><dt>Actions</dt><dd>${escapeHtml(n.capability.actions.join(', '))}</dd><dt>Execution</dt><dd>Read-only declaration</dd></dl>`:'';document.getElementById('details').className='details';document.getElementById('details').innerHTML=`<div class="type">${escapeHtml(n.type)}</div><h2>${escapeHtml(n.title)}</h2><div class="path">${path.map(escapeHtml).join(' → ')}</div>${extra}<div class="chips">${(n.keywords||[]).map(k=>`<span class="chip">${escapeHtml(k)}</span>`).join('')}</div><div class="source">${escapeHtml(n.text||n.summary||'')}</div>`;draw();
  }
  function updateUI(){const m=state.map;document.getElementById('emptyState').classList.toggle('hidden',!!m);if(!m)return;const topics=m.nodes.filter(n=>n.type==='topic').length,sources=m.nodes.filter(n=>['chunk','event','action'].includes(n.type)).length;document.getElementById('stats').innerHTML=`<div class="stat"><strong>${m.nodes.length}</strong><span>nodes</span></div><div class="stat"><strong>${m.edges.length}</strong><span>connections</span></div><div class="stat"><strong>${topics||m.events?.length||0}</strong><span>${m.kind==='pulse'?'pulses':'topics'}</span></div><div class="stat"><strong>${sources}</strong><span>evidence</span></div>`;document.getElementById('pulseStatus').textContent=`${m.events?.length||0} events`;document.getElementById('auditTrail').innerHTML=(m.audit||[]).slice(-8).reverse().map(a=>`<div class="auditItem"><time>${escapeHtml(new Date(a.time).toLocaleTimeString())}</time><strong>${escapeHtml(a.action)}</strong><span>${escapeHtml(a.detail)}</span></div>`).join('');}
  function loadMap(map,view){stopPulses();state.map=map;state.highlighted.clear();state.selected=null;state.pulseIndex=-1;setView(view||map.kind==='pulse'?'pulse':'network');layout();updateUI();fit();}
  function loadText(title,text){loadMap(buildMap(title,text),'network');}

  function searchMap(query,limit=6){if(!state.map)return[];const q=query.trim();if(!q)return[];const qk=keywords(q,8),ql=q.toLowerCase();return state.map.nodes.filter(n=>n.type!=='corpus').map(n=>({n,s:(String(n.text).toLowerCase().includes(ql)?2:0)+similarity(qk,n.keywords||[])+(n.title.toLowerCase().includes(ql)?1:0)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,limit);}
  function renderResults(scored){state.highlighted=new Set(scored.map(x=>x.n.id));document.getElementById('results').innerHTML=scored.length?scored.map((x,i)=>`<div class="result" data-id="${x.n.id}"><strong>${i+1}. ${escapeHtml(x.n.title)}</strong><small>${escapeHtml(x.n.type)} · relevance ${x.s.toFixed(2)}</small></div>`).join(''):'<div class="hint">No evidence found in this map.</div>';document.querySelectorAll('.result').forEach(el=>el.onclick=()=>focusNode(el.dataset.id));if(scored[0])focusNode(scored[0].n.id);draw();}
  function search(){renderResults(searchMap(document.getElementById('searchInput').value));}
  function focusNode(id){const n=state.map?.nodes.find(x=>x.id===id);if(!n)return;state.scale=Math.max(state.scale,1.15);state.x=-(n.x||0)*state.scale;state.y=-(n.y||0)*state.scale;inspect(n);draw();}
  function hit(x,y){if(!state.map)return null;for(let i=state.map.nodes.length-1;i>=0;i--){const n=state.map.nodes[i],p=screen(n),r=nodeStyle(n)[1]+6;if(Math.hypot(x-p.x,y-p.y)<r)return n;}return null;}

  function playPulses(){if(!state.map?.events?.length)return;stopPulses();state.pulseIndex=-1;state.pulseTimer=setInterval(()=>{state.pulseIndex++;if(state.pulseIndex>=state.map.events.length){stopPulses();return;}const n=state.map.nodes.find(x=>x.id===`pulse-${state.pulseIndex}`);if(n){inspect(n);document.getElementById('pulseStatus').textContent=`${state.pulseIndex+1}/${state.map.events.length} · ${n.event.action}`;}draw();},850);}
  function stopPulses(){if(state.pulseTimer)clearInterval(state.pulseTimer);state.pulseTimer=null;if(document.getElementById('pulseStatus'))document.getElementById('pulseStatus').textContent=`${state.map?.events?.length||0} events`;draw();}

  function parseIntent(text){
    const result={map:'current',query:'',top:5,threshold:.2,evidence:true,errors:[]};
    text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).forEach((line,i)=>{const [cmd,...rest]=line.split(/\s+/),tail=rest.join(' ');switch(cmd.toUpperCase()){
      case'MAP':result.map=tail||'current';break;
      case'FIND':{const m=tail.match(/(?:topic:)?["']([^"']+)["']/)||tail.match(/(?:topic:)?(.+)/);result.query=m?.[1]?.trim()||'';break;}
      case'FOCUS':{const m=tail.match(/top:(\d+)/i);if(m)result.top=Math.max(1,Math.min(20,Number(m[1])));else result.errors.push(`Line ${i+1}: FOCUS requires top:N`);break;}
      case'LINK':{const m=tail.match(/threshold:([0-9.]+)/i);if(m)result.threshold=Math.max(0,Math.min(1,Number(m[1])));else result.errors.push(`Line ${i+1}: LINK requires threshold:N`);break;}
      case'EXPLAIN':result.evidence=!/false/i.test(tail);break;
      default:result.errors.push(`Line ${i+1}: unsupported command ${cmd}`);
    }});if(!result.query)result.errors.push('FIND query is required');return result;
  }
  function previewIntent(){const intent=parseIntent(document.getElementById('intentInput').value),preview=document.getElementById('intentPreview'),apply=document.getElementById('applyIntentBtn');if(intent.errors.length){state.intentHits=[];preview.textContent=`INVALID INTENT\n${intent.errors.join('\n')}`;apply.disabled=true;return;}const hits=searchMap(intent.query,intent.top);state.intentHits=hits.map(x=>x.n.id);preview.textContent=JSON.stringify({status:'VALIDATED_PREVIEW',execution:'none',map:intent.map,operation:'semantic_focus',query:intent.query,top:intent.top,linkThreshold:intent.threshold,requireEvidence:intent.evidence,affectedNodes:hits.map(x=>({id:x.n.id,title:x.n.title,score:Number(x.s.toFixed(3))}))},null,2);apply.disabled=!hits.length;}
  function applyIntentFocus(){const scored=state.intentHits.map(id=>({n:state.map.nodes.find(x=>x.id===id),s:1})).filter(x=>x.n);renderResults(scored);state.map.audit=state.map.audit||[];state.map.audit.push({time:new Date().toISOString(),action:'EXIL_VISUAL_FOCUS',detail:`Preview applied to ${scored.length} nodes; no external execution`});updateUI();document.getElementById('intentDialog').close();}

  canvas.addEventListener('mousedown',e=>{const n=hit(e.offsetX,e.offsetY);if(n){inspect(n);return;}state.dragging=true;state.lastX=e.clientX;state.lastY=e.clientY;});
  window.addEventListener('mousemove',e=>{if(!state.dragging)return;state.x+=e.clientX-state.lastX;state.y+=e.clientY-state.lastY;state.lastX=e.clientX;state.lastY=e.clientY;draw();});
  window.addEventListener('mouseup',()=>state.dragging=false);
  canvas.addEventListener('wheel',e=>{e.preventDefault();const old=state.scale;state.scale=Math.max(.18,Math.min(3.5,state.scale*Math.exp(-e.deltaY*.001)));const r=canvas.getBoundingClientRect(),mx=e.clientX-r.left-r.width/2,my=e.clientY-r.top-r.height/2;state.x=mx-(mx-state.x)*(state.scale/old);state.y=my-(my-state.y)*(state.scale/old);draw();},{passive:false});

  document.getElementById('demoBtn').onclick=document.getElementById('emptyDemoBtn').onclick=()=>loadText('Exovia NeuroCanvas Vision',demoText);
  document.getElementById('pulseDemoBtn').onclick=document.getElementById('emptyPulseBtn').onclick=()=>loadMap(buildPulseMap('ExiaL Operational Pulse Demo',pulseDemo),'pulse');
  document.getElementById('pasteBtn').onclick=()=>document.getElementById('pasteDialog').showModal();
  document.getElementById('intentBtn').onclick=()=>document.getElementById('intentDialog').showModal();
  document.getElementById('previewIntentBtn').onclick=previewIntent;document.getElementById('applyIntentBtn').onclick=applyIntentFocus;
  document.getElementById('buildBtn').onclick=e=>{const t=document.getElementById('textInput').value.trim();if(!t)return;e.preventDefault();try{if(t.split(/\r?\n/).some(x=>x.trim().startsWith('>>')))loadMap(buildPulseMap(document.getElementById('docTitle').value||'ExiaL map',t),'pulse');else loadText(document.getElementById('docTitle').value||'Knowledge map',t);document.getElementById('pasteDialog').close();}catch(err){alert(err.message);}};
  document.getElementById('fileInput').onchange=async e=>{const f=e.target.files[0];if(!f)return;const text=await f.text();try{if(f.name.endsWith('.json'))loadMap(JSON.parse(text));else if(/\.(exial|log)$/i.test(f.name)||text.split(/\r?\n/).some(x=>x.trim().startsWith('>>')))loadMap(buildPulseMap(f.name,text),'pulse');else loadText(f.name.replace(/\.[^.]+$/,''),text);}catch(err){alert(`Unable to load file: ${err.message}`);}finally{e.target.value='';}};
  document.getElementById('exportBtn').onclick=()=>{if(!state.map)return;const b=new Blob([JSON.stringify(state.map,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`${state.map.kind||'map'}-exovia-neurocanvas.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),0);};
  document.getElementById('fitBtn').onclick=fit;document.getElementById('searchBtn').onclick=search;document.getElementById('searchInput').onkeydown=e=>{if(e.key==='Enter')search();};
  document.getElementById('networkView').onclick=()=>setView('network');document.getElementById('treeView').onclick=()=>setView('tree');document.getElementById('pulseView').onclick=()=>{if(state.map?.kind!=='pulse')loadMap(buildPulseMap('ExiaL Operational Pulse Demo',pulseDemo),'pulse');else setView('pulse');};document.getElementById('capabilityView').onclick=()=>loadMap(buildCapabilityMap(),'capability');
  document.getElementById('playPulsesBtn').onclick=playPulses;document.getElementById('stopPulsesBtn').onclick=stopPulses;
  window.addEventListener('resize',resize);resize();
})();