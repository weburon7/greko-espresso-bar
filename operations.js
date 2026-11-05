/* Booking requests and content editing are isolated to the presenter's browser. */
(() => {
  const places = {'model-town':'Model Town','eastwood-village':'Eastwood Village'};
  const exampleNotice = 'Demo preview — no booking or order has been placed.';
  const pending = 'Pending staff confirmation';
  const requestKey = 'greko-requests';
  const draftKey = 'greko-editor-draft';
  const clone = value => JSON.parse(JSON.stringify(value));
  function read(key, fallback) {
    try { return JSON.parse(sessionStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }
  const write = (key,value) => sessionStorage.setItem(key,JSON.stringify(value));
  const html = v => esc(String(v ?? ''));
  const label = s => String(s).replace(/([a-z])([A-Z])/g,'$1 $2').replaceAll(/[-_]/g,' ').replace(/^./,l=>l.toUpperCase());
  const options = (values,selected) => values.map(([v,text])=>'<option value="'+html(v)+'"'+(v===selected?' selected':'')+'>'+html(text)+'</option>').join('');
  const tag = s => '<span class="op-tag">'+html(s)+'</span>';
  const msg = () => '<p class="op-note">'+exampleNotice+'</p>';
  const styles = `<style>
  .op-shell {
    --op-ink:#182f45; --op-brass:#856633; --op-paper:#fffcf4; --op-rule:#d8cbb5;
    max-width:1250px; margin:auto; padding:clamp(30px,5vw,78px) clamp(18px,5vw,74px);
    color:var(--op-ink); font-family:var(--sign,Arial,sans-serif);
  }
  .op-shell h1,.op-shell h2,.op-shell h3,.op-shell legend {font-family:Georgia,serif;font-weight:400;line-height:1.1;color:var(--op-ink)}
  .op-mast {margin-bottom:clamp(20px,3.5vw,45px);border-bottom:1px solid var(--op-rule);padding-bottom:clamp(20px,2.5vw,30px)}
  .op-mast h1 {font-size:clamp(49px,6.5vw,89px);letter-spacing:-.06em;margin:12px 0}
  .op-mast .op-intro {max-width:620px;color:#425263;font-size:clamp(16px,1.5vw,19px);line-height:1.55;margin:0}
  .op-shell h2 {font-size:clamp(29px,3vw,42px);margin:0 0 14px;letter-spacing:-.04em}
  .op-shell h3,.op-shell legend {font-size:24px;margin:0 0 10px}.op-shell p{line-height:1.55;margin:0 0 14px}
  .op-shell .op-eye {display:flex;align-items:center;gap:10px;color:var(--op-brass);font:650 11px/1.4 var(--sign,Arial,sans-serif);letter-spacing:.15em;text-transform:uppercase;margin:0}
  .op-eye::before {content:'';width:32px;height:1px;background:currentColor}
  .op-cols {display:grid;grid-template-columns:minmax(0,1.65fr) minmax(260px,1fr);gap:clamp(16px,2.5vw,36px);align-items:start}
  #main .op-panel,.op-side,.op-card {min-width:0;border:1px solid var(--op-rule);border-radius:4px;padding:clamp(19px,3vw,34px);background:var(--op-paper)}
  .op-side {background:#ecdfc6;border-top:3px solid var(--op-brass)}.op-side .op-small{margin:0}
  .op-grid {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px 18px;margin:15px 0}.op-full {grid-column:1 / -1}
  .op-shell label,.op-caption {display:block;font:600 14px/1.45 var(--sign,Arial,sans-serif);color:var(--op-ink)}
  .op-shell select,.op-shell input:not([type=checkbox]),.op-shell textarea {width:100%;min-width:0;max-width:100%;display:block;min-height:46px;border:1px solid #afa898;border-radius:3px;background:#fffefa;color:var(--op-ink);padding:10px 11px;margin-top:5px;font:400 16px/1.35 var(--sign,Arial,sans-serif);box-sizing:border-box}
  .op-shell input[readonly] {color:#485561;background:#f2eee5}.op-shell input[type=checkbox]{width:18px;height:18px;margin:0 9px 0 0;vertical-align:middle;accent-color:var(--op-ink)}
  .op-shell .op-check {display:flex;align-items:flex-start;margin:0;padding:10px 0;line-height:1.6}.op-check input[type=checkbox]{flex:none;margin-top:3px}
  .op-shell textarea {min-height:86px;resize:vertical}.op-shell fieldset{margin:22px 0;padding:0;border:0;min-width:0}
  .op-shell .op-note {border-left:3px solid var(--op-brass);padding:10px 15px;background:#efe7d6;font-size:13px;line-height:1.5;color:#3a4854;margin:0 0 18px}
  .op-actions {display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin:18px 0 0}
  #main .op-shell .op-btn {display:inline-flex;align-items:center;justify-content:center;text-decoration:none;min-height:44px;border:1px solid #929b9f;border-radius:3px;padding:10px 16px;background:transparent;color:var(--op-ink);font:600 14px/1.35 var(--sign,Arial,sans-serif);cursor:pointer;transition:background .15s}
  #main .op-shell .op-btn:hover {background:#e8e3d6}
  #main .op-shell .op-btn.primary,#main .op-shell .op-btn[aria-pressed=true] {color:var(--op-paper);background:var(--op-ink);border-color:var(--op-ink)}
  .op-shell :focus-visible {outline:3px solid #88621b;outline-offset:3px}.op-tag {display:inline-block;background:#ebe1c8;color:#5b4928;padding:4px 9px;margin-bottom:10px;font:650 12px/1.4 var(--sign,Arial,sans-serif)}
  .op-dl{margin:0 0 17px}.op-dl>div {display:grid;grid-template-columns:minmax(83px,.75fr) 1.2fr;gap:12px;padding:9px 0;border-bottom:1px solid var(--op-rule);overflow-wrap:anywhere;font-size:14px;line-height:1.45}.op-dl dt{font-weight:600}.op-dl dd{margin:0}
  .op-small {font-size:13px;line-height:1.55;color:#4e5860}.op-shell #op-tables>.op-small {margin:7px 0 0}
  .op-section{margin:22px 0}.op-card{padding:14px 16px;margin:10px 0}.op-card summary,.op-guide summary{cursor:pointer;font-size:15px;font-weight:650;overflow-wrap:anywhere}.op-card[open]>summary{border-bottom:1px solid var(--op-rule);padding-bottom:10px;margin-bottom:12px}
  .op-guide {padding:15px 0;margin-top:10px;border-bottom:1px solid var(--op-rule)}.op-guide li {margin-bottom:8px}.op-shell button[disabled]{opacity:.5;cursor:not-allowed}
  .op-error{font-size:14px;font-weight:600;color:#922f28}.op-shell .op-error:empty{margin:0}.op-shell .op-error:not(:empty){margin:12px 0}.op-shell .op-lock button{margin-top:14px}
  .op-editor{min-width:0}.op-lock{max-width:580px}.op-receipt{max-width:820px}
  @media(max-width:760px){.op-cols{grid-template-columns:minmax(0,1fr)}.op-shell{padding-bottom:34px}}
  @media(max-width:500px){.op-grid{grid-template-columns:minmax(0,1fr)}.op-card .op-grid{gap:11px}.op-dl>div{gap:8px}.op-shell .op-card{padding:12px}.op-shell .op-actions{gap:8px}}
  </style>`;
  const shell = (eye,title,intro,content) => styles+'<section class="op-shell '+(title==='Book a table'?'op-booking':'op-studio')+'"><header class="op-mast"><p class="op-eye">'+html(eye)+'</p><h1 tabindex="-1">'+html(title)+'</h1><p class="op-intro">'+html(intro)+'</p></header>'+content+'</section>';
  window.opsSeed = {
    bookingPolicy:'Draft for client approval. Staff will review your request. Change, cancellation and event-service terms will be added before launch.',
    tables: Object.keys(places).flatMap(outlet=>[
      {id:outlet+'-window',outlet,name:'Window table',capacity:4,features:'Indoor · window seat'},
      {id:outlet+'-terrace',outlet,name:'Terrace table',capacity:8,features:'Outdoor · open air'},
      {id:outlet+'-group',outlet,name:'Gathering table',capacity:16,features:'Indoor · semi-private'}
    ]),
    services:['Cake','Decorations','Flowers','Custom menu','Other service'].map((name,i)=>({id:'service-'+(i+1),name,charge:'Quote pending client approval'}))
  };
  let formState=null,stage='form',lastId='',staffTab='requests',collection=null;
  let unlocked=false,editData=null;
  const clock = () => new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',hourCycle:'h23',hour:'2-digit',minute:'2-digit'}).format(new Date());
  const slots = ['10:00','11:30','13:00','14:30','16:00','17:30','19:00','20:30'];
  const localDate = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  function startingForm() {
    return {outlet:outlet(),type:'Regular table',date:'',time:'',adults:'2',children:'0',seating:'Any seating',table:'',services:[],name:'',email:'',phone:'',requests:''};
  }
  const fields = (name,text,type,val,attrs='') => '<label>'+html(text)+'<input type="'+type+'" name="'+name+'" value="'+html(val)+'" '+attrs+'></label>';
  function choose(name,title,values,current) {return '<label>'+html(title)+'<select name="'+name+'">'+options(values,current)+'</select></label>';}
  const pairs = values => values.map(a=>[a,a]);
  const suitable = f => G.tables.filter(t=>t.outlet===f.outlet && Number(t.capacity)>=Number(f.adults)+Number(f.children) && (f.seating==='Any seating'||String(t.features).toLowerCase().includes(f.seating.toLowerCase())));
  const serviceSummary = f => G.services.filter(s=>f.services.includes(s.id)).map(s=>s.name+' · '+s.charge).join(', ')||'None';
  function summary(rows) {
    return '<dl class="op-dl">'+rows.map(([k,v])=>'<div><dt>'+html(k)+'</dt><dd>'+html(v)+'</dd></div>').join('')+'</dl>';
  }
  function requestRows(f) {
    const t=suitable(f).find(t=>t.id===f.table);
    return [['Outlet',places[f.outlet]],['Visit',f.type],['Date & time',[f.date,f.time].filter(Boolean).join(' · ')||'Choose a date and time'],['Guests',f.adults+' adults · '+f.children+' children'],['Seating',f.seating],['Table',t?t.name+' · seats '+t.capacity:'Staff to suggest'],['Optional services',serviceSummary(f)],['Contact',[f.name,f.email,f.phone].filter(Boolean).join(' · ')||'Add sample details'],['Special requests',f.requests||'None']];
  }
  function tableFields(f) {
    const list=suitable(f);
    if(!list.some(t=>t.id===f.table))f.table='';
    return choose('table','Table preference',[['','Ask staff to suggest a table'],...list.map(t=>[t.id,t.name+' · seats '+t.capacity+' · '+t.features])],f.table)+'<p class="op-small">'+(list.length?'These example tables fit your party. Availability is simulated.':'No example table matches this party and seating choice. Staff can review a custom arrangement.')+'</p>';
  }
  function timeOptions(f) {
    const available=f.date===localDate()?slots.filter(t=>t>clock()):slots;
    if(!available.includes(f.time))f.time='';
    return options([['',available.length?'Select a time':'Choose a later date'],...pairs(available)],f.time);
  }
  function requestForm(f) {
    return '<div class="op-cols"><form id="greko-book" class="op-panel"><h2>Plan your visit</h2><div class="op-grid">'+choose('outlet','Outlet',Object.entries(places),f.outlet)+choose('type','Occasion',pairs(['Regular table','Birthday','Anniversary','Other event']),f.type)+fields('date','Preferred date','date',f.date,'required min="'+localDate()+'"')+'<label>Preferred time · sample slots<select name="time" required>'+timeOptions(f)+'</select></label>'+fields('adults','Adults','number',f.adults,'required min="1" max="999"')+fields('children','Children','number',f.children,'required min="0" max="999"')+choose('seating','Seating preference',pairs(['Any seating','Indoor','Outdoor','Semi-private']),f.seating)+'<div id="op-tables">'+tableFields(f)+'</div></div><fieldset><legend>Optional services</legend><p class="op-small">Examples for your enquiry. Staff will advise on availability and charges.</p>'+G.services.map(s=>'<label class="op-check"><input type="checkbox" name="service" value="'+html(s.id)+'" '+(f.services.includes(s.id)?'checked':'')+'>'+html(s.name)+' · '+html(s.charge)+'</label>').join('')+'</fieldset><h3>Contact details</h3><p class="op-small">Use fictional contact details for this presentation.</p><div class="op-grid">'+fields('name','Guest name','text',f.name,'required maxlength="100" placeholder="Demo Guest" autocomplete="off"')+fields('email','Email','email',f.email,'required maxlength="150" placeholder="guest@example.com" autocomplete="off"')+fields('phone','Phone (optional)','tel',f.phone,'maxlength="24" inputmode="tel" autocomplete="off"')+'<label class="op-full">Special requests<textarea name="requests" maxlength="600">'+html(f.requests)+'</textarea></label></div><button class="op-btn primary">Review request</button></form><aside class="op-side"><h2>Your visit</h2><div id="op-summary">'+summary(requestRows(f).slice(0,7))+'</div>'+policy()+'</aside></div>';
  }
  const transferFocus=()=>document.querySelector('.op-mast h1')?.focus({preventScroll:true});
  function policy(){return '<h3>Booking policy</h3><p class="op-small">'+html(G.bookingPolicy||'Draft for client approval. A request is subject to staff review. Greko will supply its change, cancellation and event-service terms before launch.')+'</p>';}
  function booking() {
    if(!formState || formState.outlet!==outlet()){formState=startingForm();stage='form';}
    let body;
    if(stage==='review')body='<div class="op-panel op-receipt"><h2>Review your request</h2>'+summary(requestRows(formState))+policy()+'<div class="op-actions"><button class="op-btn" data-op="back">Edit details</button><button class="op-btn primary" data-op="submit">Request booking</button></div></div>';
    else if(stage==='done'){
      const rec=read(requestKey,[]).find(r=>r.id===lastId);
      body='<div class="op-panel op-receipt">'+tag(rec?.status||pending)+'<h2>Request saved for the demo</h2><p>Reference '+html(lastId)+'. Staff can review this enquiry in the presentation dashboard.</p>'+summary(rec?.rows||requestRows(formState))+(rec?.note?'<p><strong>Staff note</strong> '+html(rec.note)+'</p>':'')+'<button class="op-btn" data-op="new">Start another request</button></div>';
    } else body=requestForm(formState);
    return shell('Hestia’s table','Book a table','Gather around Greko’s table. Choose a café, explore seating and request a table or a celebration.',msg()+body);
  }
  function capture(form){
    const data=new FormData(form);
    for(const key of Object.keys(formState)) if(key!=='services' && data.has(key))formState[key]=String(data.get(key)).trim();
    formState.services=data.getAll('service');
  }
  document.addEventListener('input',event=>{
    const el=event.target, form=el.closest('#greko-book');
    if(!form)return;
    capture(form);
    if(el.name==='date')form.elements.time.innerHTML=timeOptions(formState);
    if(el.setCustomValidity)el.setCustomValidity('');
    if(['adults','children','outlet','seating'].includes(el.name))document.querySelector('#op-tables').innerHTML=tableFields(formState);
    document.querySelector('#op-summary').innerHTML=summary(requestRows(formState).slice(0,7));
  });
  document.addEventListener('change',e=>{
    if(e.target.matches('#greko-book [name=outlet]')){const id=e.target.value;formState.outlet=id;selectOutlet(id);}
  });
  function checkBooking(form) {
    capture(form);
    const f=formState;
    form.elements.name.setCustomValidity(f.name ? '' : 'Enter a sample guest name.');
    form.elements.phone.setCustomValidity(!f.phone || /^[+()\d. -]+$/.test(f.phone) && f.phone.replace(/\D/g,'').length>=7 && f.phone.replace(/\D/g,'').length<=15 ? '' : 'Use a phone number with 7 to 15 digits, or leave this blank.');
    form.elements.time.setCustomValidity(f.date===localDate() && f.time<=clock() ? 'Choose a future sample slot.' : '');
    if(!form.reportValidity())return false;
    selectOutlet(f.outlet);
    if(!suitable(f).some(t=>t.id===f.table))f.table='';
    return true;
  }
  const uid=()=>hex(crypto.getRandomValues(new Uint8Array(8)));
  const lockKey='greko-local-lock';
  const hex=bytes=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
  async function passwordHash(value,salt) {
    const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(value),'PBKDF2',false,['deriveBits']);
    const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:150000,hash:'SHA-256'},material,256);
    return hex(bits);
  }
  let transientPassphrase=null;
  function lockScreen() {
    const exists=!!read(lockKey,null)||transientPassphrase!==null;
    return '<form class="op-panel op-lock" id="op-unlock"><h2>'+ (exists?'Unlock editor':'Set up this demo editor')+'</h2><p class="op-small">The presenter sets a temporary passphrase for this tab. Use a made-up phrase of eight or more characters. Staff access on the live site will require a managed account.</p>'+fields('pass','Demo passphrase','password','','required minlength="8" maxlength="150" autocomplete="off"')+'<p role="alert" class="op-error" id="op-error"></p><button class="op-btn primary">'+(exists?'Unlock editor':'Set passphrase & open editor')+'</button></form>';
  }
  const protectedNames=new Set(['id','slug']);
  const getAt=(o,keys)=>keys.reduce((v,k)=>v?.[k],o);
  const pack=path=>html(JSON.stringify(path));
  const btn=(op,title,extra='')=>'<button type="button" class="op-btn" data-op="'+op+'" '+extra+'>'+html(title)+'</button>';
  const displayName=(v,i)=>v && typeof v==='object' ? (v.name||v.title||v.question||v.code||v.label||v.id||('Entry '+(i+1))) : String(v ?? '');
  function editorField(value,path,title) {
    const key=path.at(-1);
    if(Array.isArray(value))return '<fieldset><legend>'+html(title)+'</legend>'+value.map((item,index)=>{
      const subpath=[...path,index];
      return '<details class="op-card"><summary>'+html(displayName(item,index))+'</summary>'+editorField(item,subpath,typeof item==='object'?'Details':'Value')+
        (path[0]==='outlets'?'':btn('remove','Remove entry','data-path="'+pack(subpath)+'"'))+'</details>';
    }).join('')+(path[0]==='outlets'?'':btn('add','Add entry','data-path="'+pack(path)+'"'))+'</fieldset>';
    if(value && typeof value==='object')return '<div class="op-grid">'+Object.entries(value).map(([k,v])=>'<div '+(typeof v==='object'?'class="op-full"':'')+'>'+editorField(v,[...path,k],label(k))+'</div>').join('')+'</div>';
    const identity=protectedNames.has(key);
    const attrs=' data-content="'+pack(path)+'"'+(identity?' readonly':'');
    let choices=null;
    if(key==='outlet'||path.at(-2)==='outlets')choices=Object.entries(places);
    if(path[0]==='menu' && key==='category')choices=pairs(editData.categories);
    if(path[0]==='offers' && path.at(-2)==='items')choices=editData.menu.map(item=>[item.id,item.name]);
    if(choices)return '<label>'+html(title)+'<select'+attrs+'>'+options([['','Choose…'],...choices],value)+'</select></label>';
    if(typeof value==='boolean')return '<label class="op-check"><input type="checkbox" '+attrs+(value?' checked':'')+'>'+html(title)+'</label>';
    return '<label>'+html(title)+(typeof value==='string'&&value.length>90?'<textarea'+attrs+'>'+html(value)+'</textarea>':'<input'+attrs+' type="'+(typeof value==='number'?'number':'text')+'" value="'+html(value)+'"'+(typeof value==='number'?' min="0" step="any"':'')+'>')+'</label>';
  }
  function editor() {
    editData ||= read(draftKey,null) || clone(G);
    const keys=Object.keys(editData);
    if(!keys.includes(collection))collection=keys[0];
    return '<div class="op-cols"><div class="op-panel"><h2>Edit content</h2><label>Content section<select id="op-collection">'+options(keys.map(k=>[k,label(k)]),collection)+'</select></label><div class="op-editor">'+editorField(editData[collection],[collection],label(collection))+'</div><p role="alert" class="op-error" id="op-error"></p><div class="op-actions">'+btn('preview','Preview draft')+btn('publish','Publish to demo')+'</div></div><aside class="op-side"><h3>Preview and publish</h3><p>Edits save to a draft in this tab. Preview the guest experience, then return here to publish the draft to this browser session.</p><p class="op-small">The content editor changes text, records and approved asset links. Design controls are restricted.</p>'+(sessionStorage.getItem('greko-preview')?btn('close-preview','End draft preview'):'')+'</aside></div>';
  }
  function requests() {
    const list=read(requestKey,[]);
    return '<div class="op-panel"><h2>Booking enquiries</h2><p>Review simulated requests submitted in this tab. Status changes appear in the local record.</p>'+(list.length?list.slice().reverse().map(r=>'<details class="op-card"><summary>'+html(r.name)+' · '+html(places[r.outlet])+' · '+html(r.type)+' · '+html(r.status)+'</summary><p class="op-small">'+html(r.id)+'</p>'+summary(r.rows)+'<form class="op-decision" data-id="'+html(r.id)+'"><label>Staff note<textarea name="note" maxlength="400" placeholder="Include a reason when requesting changes.">'+html(r.note||'')+'</textarea></label><div class="op-actions">'+[['Approved in demo','Approve'],['Declined in demo','Decline'],['Changes requested','Request changes']].map(([value,title])=>'<button class="op-btn" name="decision" value="'+value+'">'+title+'</button>').join('')+'</div></form></details>').join(''):'<p class="op-note">Your queue is empty. Send a sample enquiry to see it here.</p><a class="op-btn" href="'+html(siteHref('/book/'))+'">Open booking form</a>')+'</div>';
  }
  function activity(){
    const counts=read('greko-events',{}),names={menu_view:'Menu views',directions:'Directions taps',call:'Calls',booking_request:'Booking requests',order_click:'Order clicks',offer_code_use:'Offer code use',membership_signup:'Membership sign-ups'};
    return '<div class="op-panel"><h2>Demo activity</h2><p>Preview counts for this tab. Production measurement requires an approved analytics setup.</p>'+summary(Object.entries({...Object.fromEntries(Object.keys(names).map(k=>[k,0])),...counts}).map(([key,n])=>[names[key]||label(key),n]))+'</div>';
  }
  function staff(){
    return shell('Greko · staff workspace','Staff editor','Manage café content and review guest enquiries.',msg()+(unlocked?'<div class="op-actions">'+['requests','content','metrics'].map((key,index)=>btn(key,['Enquiry queue','Content editor','Demo activity'][index],'aria-pressed="'+(staffTab===key)+'"')).join('')+btn('lock','Lock editor')+'</div><details class="op-guide"><summary>How to update the site</summary><ol><li>Open Content editor and choose the section you want to update.</li><li>Change the example fields. Use outlet identifiers exactly as shown when editing eligibility.</li><li>Select Preview draft and check the affected page. Return to Staff editor for further edits.</li><li>Select Publish to demo to apply the changes in this tab. For a booking, open the enquiry queue and record a decision.</li></ol><p class="op-small">Demo storage is temporary. Live publishing requires staff sign-in, server-enforced editor permissions, durable records and an audit log.</p></details><div class="op-section">'+(staffTab==='requests'?requests():staffTab==='metrics'?activity():editor())+'</div>':lockScreen()));
  }
  function saveField(el){
    if(!unlocked||!editData||el.readOnly)return;
    const keys=JSON.parse(el.dataset.content),parent=getAt(editData,keys.slice(0,-1)),key=keys.at(-1);
    if(!parent||protectedNames.has(key))return;
    const value=el.type==='checkbox'?el.checked:el.type==='number'?Number(el.value):el.value;
    parent[key]=value;
    if(typeof key==='number' && keys.length===2 && keys[0]==='categories'){
      const oldName=el.defaultValue;
      for(const item of editData.menu)if(item.category===oldName)item.category=value;
      el.defaultValue=value;
    }
    write(draftKey,editData);
  }
  document.addEventListener('input',e=>{if(e.target.hasAttribute('data-content'))saveField(e.target);});
  document.addEventListener('change',e=>{if(unlocked&&e.target.id==='op-collection'){collection=e.target.value;render();}});
  function checkContent(data){
    const invalid=invalidData(data);if(invalid)return invalid;
    const hasEmpty=records=>records.some(value=>!String(value).trim());
    if(hasEmpty(data.categories) || new Set(data.categories).size!==data.categories.length)return 'Each category needs a distinct name.';
    if(data.menu.some(item=>!item.name.trim() || !data.categories.includes(item.category) || !item.outlets.length || item.outlets.some(id=>!places[id])))return 'Every menu item needs a name, listed category and eligible outlet.';
    if(data.tables.some(t=>!places[t.outlet] || !t.name.trim()))return 'Choose an outlet and name for every table.';
    if(data.services.some(s=>!s.name.trim() || !String(s.charge).trim()))return 'Include a name and charge or quote note for every service.';
    if(data.offers.some(o=>!o.code.trim() || o.percent>100 || !/^\d{4}-\d{2}-\d{2}$/.test(o.start) || !/^\d{4}-\d{2}-\d{2}$/.test(o.end) || o.start>o.end || !o.outlets.length || o.outlets.some(id=>!places[id]) || !o.items.length || o.items.some(id=>!data.menu.some(item=>item.id===id))))return 'Check offer dates, percentage, codes, eligible outlets and menu items.';
    const codes=data.offers.map(o=>o.code.trim().toUpperCase());
    if(new Set(codes).size!==codes.length || data.offers.some(o=>o.code!==o.code.trim().toUpperCase()))return 'Offer codes must be unique and uppercase.';
    return '';
  }
  function invalidData(data){
    if(!data||typeof data!=='object')return '';
    for(const [k,v] of Object.entries(data)){
      if(typeof v==='number' && (!Number.isFinite(v)||v<0||(k==='capacity' && (!Number.isInteger(v)||v<1))))return 'Enter valid numbers and a positive whole table capacity.';
      if(typeof v==='string' && /(?:url|link|photo|image|provider|src)$/i.test(k) && /^(?:javascript|data|vbscript|file):/i.test(v.trim()))return 'Use a site asset path or secure web address for links and images.';
      const issue=invalidData(v);if(issue)return issue;
    }
    return '';
  }
  document.addEventListener('submit',async e=>{
    const f=e.target;
    if(f.id==='greko-book'){
      e.preventDefault();if(!checkBooking(f))return;stage='review';render();transferFocus();window.scrollTo(0,0);
    }else if(f.id==='op-unlock'){
      e.preventDefault();
      const button=f.querySelector('button');button.disabled=true;
      try{
        const pass=new FormData(f).get('pass'),old=read(lockKey,null),salt=old?.salt||hex(crypto.getRandomValues(new Uint8Array(16)));
        if(pass.trim().length<8){f.querySelector('#op-error').textContent='Use at least eight characters for the demo passphrase.';return;}
        // Local emulator previews on HTTP lack WebCrypto's subtle API. Keep their lock in memory.
        if(!crypto.subtle && old){f.querySelector('#op-error').textContent='Reopen this preview over HTTPS to use the saved demo lock.';return;}
        const digest=crypto.subtle?await passwordHash(pass,salt):null;
        if((old && digest!==old.digest) || (!crypto.subtle && transientPassphrase!==null && pass!==transientPassphrase)){f.querySelector('#op-error').textContent='That demo passphrase did not match.';return;}
        if(!old && digest)write(lockKey,{salt,digest});
        if(!crypto.subtle)transientPassphrase=pass;
        unlocked=true;render();
      }catch{f.querySelector('#op-error').textContent='Open the secure hosted preview or localhost to unlock the editor.';}
      finally{button.disabled=false;}
    }else if(f.matches('.op-decision') && unlocked){
      e.preventDefault();
      const state=e.submitter?.value,textarea=f.elements.note;
      if(!['Changes requested','Approved in demo','Declined in demo'].includes(state))return;
      if(state==='Changes requested'&&!textarea.value.trim()){textarea.setCustomValidity('Explain the requested change.');textarea.reportValidity();textarea.addEventListener('input',()=>textarea.setCustomValidity(''),{once:true});return;}
      const all=read(requestKey,[]),r=all.find(row=>row.id===f.dataset.id);
      if(r){r.status=state;r.note=textarea.value.trim();write(requestKey,all);render();notice('Demo enquiry updated.');}
    }
  });
  document.addEventListener('click',e=>{
    const button=e.target.closest('[data-op]');if(!button)return;
    const op=button.dataset.op;
    if(['back','new','submit'].includes(op)){
      if(op==='back'){stage='form';}
      if(op==='new'){formState=startingForm();stage='form';}
      if(op==='submit'){
        if(stage!=='review')return;
        if(formState.outlet!==outlet() || formState.date<localDate() || (formState.date===localDate() && formState.time<=clock()) || (formState.table && !suitable(formState).some(t=>t.id===formState.table))){
          stage='form';render();transferFocus();notice('Please review your outlet, date, time and seating again.');return;
        }
        const records=read(requestKey,[]);
        lastId='DEMO-'+uid().slice(0,8).toUpperCase();
        records.push({id:lastId,outlet:formState.outlet,type:formState.type,name:formState.name,rows:requestRows(formState),status:pending});
        write(requestKey,records);stage='done';track('booking_request');
      }
      render();transferFocus();window.scrollTo(0,0);return;
    }
    if(!unlocked)return;
    if(op==='lock'){unlocked=false;editData=null;sessionStorage.removeItem('greko-preview');}
    if(['requests','content','metrics'].includes(op))staffTab=op;
    if(op==='preview'||op==='publish'){
      const error=checkContent(editData);if(error){document.querySelector('#op-error').textContent=error;return;}
      if(op==='preview'){write('greko-preview',editData);const routes={tables:'/book/',services:'/book/',bookingPolicy:'/book/',menu:'/menu/',categories:'/menu/',offers:'/offers/',tiers:'/membership/',rewards:'/membership/',outlets:'/locations/',faqs:'/contact/',social:'/contact/'};go(routes[collection]||'/');notice('Previewing your draft in this tab.');return;}
      write('greko-content',editData);sessionStorage.removeItem('greko-preview');sessionStorage.removeItem(draftKey);notice('Content published to this demo session.');
    }
    if(op==='close-preview'){sessionStorage.removeItem('greko-preview');notice('Draft preview ended.');}
    if(op==='add'||op==='remove'){
      const keys=JSON.parse(button.dataset.path);
      if(op==='remove'){const list=getAt(editData,keys.slice(0,-1));list.splice(keys.at(-1),1);}
      else{
        const list=getAt(editData,keys),model=list.at(-1)??getAt(baseSeed,keys)?.[0];
        let item=model===undefined?'':clone(model);
        if(item && typeof item==='object' && !Array.isArray(item)){
          if('id' in item)item.id='example-'+uid().slice(0,8);
          for(const k of ['name','title','question','label'])if(k in item)item[k]='New '+label(keys.at(-1))+' entry';
          if('code' in item)item.code='DEMO'+uid().slice(0,4).toUpperCase();
        }else if(typeof item==='string')item='';
        list.push(item);
      }
      write(draftKey,editData);
    }
    render();
  });
  window.opsPage=route=>route.startsWith('/staff')?staff():booking();
})();
