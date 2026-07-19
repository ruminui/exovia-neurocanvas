(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const now = () => new Date().toISOString();
  const uid = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  let pdfDoc = null;
  let pdfFile = null;
  let pdfPage = 1;
  let wikipediaResults = [];

  function notify(message, kind = 'info') {
    const status = $('brainStatus');
    if (status) {
      status.textContent = message;
      status.dataset.kind = kind;
    }
    if (window.ExoviaNotify) window.ExoviaNotify(message, kind);
  }

  function getMap() { return window.ExoviaRuntime?.getMap?.() || null; }
  function loadMap(map, view = 'network') { return window.ExoviaRuntime?.loadMap?.(map, view); }

  function tokenize(text) {
    return (String(text).toLowerCase().match(/[a-záéíóúñü0-9_-]{3,}/g) || []).slice(0, 16);
  }

  function ensureMap(title = 'Secondary Brain') {
    const existing = getMap();
    if (existing) return existing;
    return {
      format: 'neurocanvas-v3',
      title,
      kind: 'memory',
      createdAt: now(),
      updatedAt: now(),
      nodes: [{id:'root',type:'corpus',title,summary:'Connected secondary brain',text:'Local-first connected knowledge workspace.',keywords:['secondary','brain','knowledge'],parent:null,level:0,x:0,y:0}],
      edges: [], events: [], audit: []
    };
  }

  function addKnowledgeNode(map, data, parent = 'root') {
    const id = uid(data.type || 'source');
    const node = {
      id,
      type: data.type || 'source',
      title: data.title || 'Untitled source',
      summary: data.summary || String(data.text || '').slice(0,160),
      text: String(data.text || ''),
      keywords: data.keywords || tokenize(`${data.title || ''} ${data.text || ''}`),
      parent,
      level: 1,
      source: data.source || null,
      metadata: data.metadata || {},
      x: 0,
      y: 0
    };
    map.nodes.push(node);
    map.edges.push({a:parent,b:id,type:'hierarchical',weight:1});
    return node;
  }

  function connectWikilinks(map, records) {
    const byTitle = new Map(records.map(record => [record.title.toLowerCase(), record.node.id]));
    records.forEach(record => {
      const links = [...record.text.matchAll(/\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g)].map(match => match[1].trim().toLowerCase());
      links.forEach(target => {
        const targetId = byTitle.get(target);
        if (targetId && targetId !== record.node.id && !map.edges.some(edge => edge.a === record.node.id && edge.b === targetId && edge.type === 'wikilink')) {
          map.edges.push({a:record.node.id,b:targetId,type:'wikilink',weight:1});
        }
      });
    });
  }

  async function importMarkdownDirectory(files) {
    const markdownFiles = [...files].filter(file => /\.(md|markdown|txt)$/i.test(file.name));
    if (!markdownFiles.length) throw new Error('No Markdown or text notes were found.');
    const map = ensureMap('Imported Secondary Brain');
    const collection = addKnowledgeNode(map, {
      type:'notebook', title:`Imported vault · ${markdownFiles.length} notes`,
      text:'Directory import compatible with Obsidian-style Markdown vaults and Joplin Markdown exports.',
      source:'local-directory', keywords:['obsidian','joplin','markdown','vault']
    });
    const records = [];
    for (const file of markdownFiles) {
      const text = await file.text();
      const relativePath = file.webkitRelativePath || file.name;
      const title = (text.match(/^#\s+(.+)$/m)?.[1] || file.name.replace(/\.[^.]+$/,'')).trim();
      const tags = [...new Set([...text.matchAll(/(?:^|\s)#([\p{L}\d_/-]+)/gu)].map(match => match[1]))];
      const node = addKnowledgeNode(map, {
        type:'note', title, text,
        source:'markdown-vault',
        metadata:{path:relativePath,tags,originalFormat:'markdown'},
        keywords:[...tags.slice(0,8), ...tokenize(text).slice(0,8)]
      }, collection.id);
      records.push({title,text,node});
    }
    connectWikilinks(map, records);
    map.audit.push({time:now(),action:'SECONDARY_BRAIN_IMPORT',detail:`Imported ${records.length} Markdown notes with wikilink reconstruction`});
    loadMap(map,'network');
    notify(`Imported ${records.length} notes and reconstructed internal links.`, 'success');
  }

  async function searchWikipedia() {
    const query = $('wikiQuery').value.trim();
    const lang = $('wikiLanguage').value || 'es';
    if (!query) return notify('Write a Wikipedia topic first.', 'warn');
    notify('Searching Wikipedia…');
    const endpoint = `https://${encodeURIComponent(lang)}.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(query)}&limit=8`;
    const response = await fetch(endpoint, {headers:{'Api-User-Agent':'Exovia-NeuroCanvas/1.0 (knowledge research tool)'}});
    if (!response.ok) throw new Error(`Wikipedia search failed (${response.status}).`);
    const data = await response.json();
    wikipediaResults = data.pages || [];
    $('wikiResults').innerHTML = wikipediaResults.length ? wikipediaResults.map((item,index) => `
      <button type="button" data-wiki-index="${index}">
        <strong>${escapeHtml(item.title)}</strong><br><small>${escapeHtml((item.excerpt || '').replace(/<[^>]+>/g,''))}</small>
      </button>`).join('') : '<p class="productEmpty">No results.</p>';
    $('wikiResults').querySelectorAll('[data-wiki-index]').forEach(button => button.addEventListener('click', () => importWikipediaPage(wikipediaResults[Number(button.dataset.wikiIndex)], lang).catch(error => notify(error.message,'error'))));
    notify(`${wikipediaResults.length} Wikipedia results found.`, 'success');
  }

  async function importWikipediaPage(item, lang) {
    notify(`Importing ${item.title}…`);
    const endpoint = `https://${encodeURIComponent(lang)}.wikipedia.org/w/api.php?action=query&prop=extracts|info&inprop=url&explaintext=1&exsectionformat=plain&titles=${encodeURIComponent(item.title)}&format=json&origin=*`;
    const response = await fetch(endpoint, {headers:{'Api-User-Agent':'Exovia-NeuroCanvas/1.0 (knowledge research tool)'}});
    if (!response.ok) throw new Error(`Wikipedia content request failed (${response.status}).`);
    const data = await response.json();
    const page = Object.values(data.query?.pages || {})[0];
    if (!page || page.missing !== undefined) throw new Error('Wikipedia page not found.');
    const map = ensureMap('Wikipedia Research Brain');
    let parent = map.nodes.find(node => node.type === 'collection' && node.title === 'Wikipedia Research');
    if (!parent) parent = addKnowledgeNode(map,{type:'collection',title:'Wikipedia Research',text:'Imported public encyclopedia sources with attribution and source URLs.',source:'wikipedia',keywords:['wikipedia','research','sources']});
    addKnowledgeNode(map,{
      type:'article', title:page.title, text:page.extract || '', summary:(page.extract || '').slice(0,180), source:'wikipedia',
      metadata:{language:lang,pageid:page.pageid,url:page.fullurl,retrievedAt:now(),license:'CC BY-SA / Wikipedia terms'},
      keywords:tokenize(`${page.title} ${page.extract || ''}`)
    }, parent.id);
    map.audit.push({time:now(),action:'WIKIPEDIA_IMPORT',detail:`Imported ${page.title} from ${page.fullurl || 'Wikipedia'}`});
    loadMap(map,'network');
    notify(`Wikipedia article “${page.title}” added with source metadata.`, 'success');
  }

  async function loadPdf(file) {
    pdfFile = file;
    pdfPage = 1;
    notify('Loading interactive PDF…');
    try {
      const pdfjsLib = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.min.mjs');
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs';
      const bytes = new Uint8Array(await file.arrayBuffer());
      pdfDoc = await pdfjsLib.getDocument({data:bytes}).promise;
      $('pdfPageCount').textContent = `${pdfDoc.numPages} pages`;
      await renderPdfPage();
      $('pdfImportBtn').disabled = false;
      notify(`PDF ready: ${pdfDoc.numPages} pages.`, 'success');
    } catch (error) {
      pdfDoc = null;
      $('pdfPreview').innerHTML = `<object data="${URL.createObjectURL(file)}" type="application/pdf" width="100%" height="420"><p>Native PDF preview unavailable.</p></object>`;
      $('pdfPageCount').textContent = 'Native preview mode';
      $('pdfImportBtn').disabled = false;
      notify('PDF opened in native preview. Text extraction requires PDF.js network access.', 'warn');
    }
  }

  async function renderPdfPage() {
    if (!pdfDoc) return;
    const page = await pdfDoc.getPage(pdfPage);
    const base = page.getViewport({scale:1});
    const host = $('pdfPreview');
    const width = Math.max(280, host.clientWidth - 20);
    const viewport = page.getViewport({scale:Math.min(2,width/base.width)});
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    host.replaceChildren(canvas);
    await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
    $('pdfPageLabel').textContent = `Page ${pdfPage}`;
  }

  async function extractPdfPages() {
    if (!pdfFile) return;
    const map = ensureMap(pdfFile.name.replace(/\.pdf$/i,''));
    const documentNode = addKnowledgeNode(map,{
      type:'pdf',title:pdfFile.name,text:'Interactive PDF source. Each extracted page is represented as evidence-preserving text and page metadata.',
      source:'local-pdf',metadata:{filename:pdfFile.name,size:pdfFile.size,pageCount:pdfDoc?.numPages || null,importedAt:now()},keywords:['pdf','document','interactive']
    });
    if (pdfDoc) {
      for (let number=1; number<=pdfDoc.numPages; number++) {
        const page = await pdfDoc.getPage(number);
        const content = await page.getTextContent();
        const text = content.items.map(item => item.str).join(' ').replace(/\s+/g,' ').trim();
        addKnowledgeNode(map,{
          type:'pdf-page',title:`${pdfFile.name} · Page ${number}`,text,summary:text.slice(0,180),source:'local-pdf',
          metadata:{filename:pdfFile.name,page:number},keywords:tokenize(text)
        },documentNode.id);
      }
      map.audit.push({time:now(),action:'PDF_IMPORTED',detail:`Extracted ${pdfDoc.numPages} pages from ${pdfFile.name}`});
    } else {
      map.audit.push({time:now(),action:'PDF_ATTACHED',detail:`Attached ${pdfFile.name} without text extraction`});
    }
    loadMap(map,'tree');
    notify(pdfDoc ? `Imported ${pdfDoc.numPages} PDF pages as interactive evidence nodes.` : 'PDF source attached without extracted text.', pdfDoc ? 'success':'warn');
  }

  function openDialog() { $('brainDialog').showModal(); }

  function wire() {
    $('brainBtn')?.addEventListener('click',openDialog);
    $('brainCloseBtn')?.addEventListener('click',()=>$('brainDialog').close());
    $('wikiSearchBtn')?.addEventListener('click',()=>searchWikipedia().catch(error=>notify(error.message,'error')));
    $('wikiQuery')?.addEventListener('keydown',event=>{if(event.key==='Enter')searchWikipedia().catch(error=>notify(error.message,'error'));});
    $('vaultInput')?.addEventListener('change',event=>importMarkdownDirectory(event.target.files).catch(error=>notify(error.message,'error')));
    $('pdfInput')?.addEventListener('change',event=>{const file=event.target.files?.[0];if(file)loadPdf(file).catch(error=>notify(error.message,'error'));});
    $('pdfPrevBtn')?.addEventListener('click',async()=>{if(pdfDoc&&pdfPage>1){pdfPage--;await renderPdfPage();}});
    $('pdfNextBtn')?.addEventListener('click',async()=>{if(pdfDoc&&pdfPage<pdfDoc.numPages){pdfPage++;await renderPdfPage();}});
    $('pdfImportBtn')?.addEventListener('click',()=>extractPdfPages().catch(error=>notify(error.message,'error')));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',wire); else wire();
})();