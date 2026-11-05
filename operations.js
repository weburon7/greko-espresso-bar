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
  .op-shell{max-width:1176px;margin:auto;padding:clamp(22px,5vw,66px) clamp(16px,4vw,54px);color:#342b24}
  .op-shell h1,.op-shell h2,.op-shell h3{font-family:Georgia,serif;font-weight:500;line-height:1.12;margin:0 0 .55em;color:#3d3024}
  .op-shell h1{font-size:clamp(40px,6vw,75px);letter-spacing:-.055em}.op-shell h2{font-size:clamp(26px,3vw,38px);letter-spacing:-.035em}.op-shell h3{font-size:23px}
  .op-shell p{line-height:1.55;margin:0 0 16px}.op-shell .op-eye{color:#536149;font:600 11px/1.3 system-ui;letter-spacing:.15em;text-transform:uppercase;margin-bottom:16px}
  .op-cols{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(240px,1fr);gap:22px;align-items:start}
  .op-panel,.op-side,.op-card{border:1px solid #dad2c1;border-radius:15px;background:#fffcf5;padding:clamp(17px,3vw,30px);min-width:0}.op-side{background:#e9ebdf}
  .op-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px;margin:16px 0}.op-full{grid-column:1 / -1}
  .op-shell label,.op-caption{display:block;font:600 13px/1.5 system-ui;color:#3c382f}.op-shell select,.op-shell input:not([type=checkbox]),.op-shell textarea{display:block;width:100%;min-width:0;font:400 16px/1.4 system-ui;border:1px solid #b8b09d;border-radius:6px;padding:10px 12px;margin-top:5px;background:#fffef9;color:#302b24;box-sizing:border-box}
  .op-shell input[type=checkbox]{width:18px;height:18px;vertical-align:middle;margin-right:8px}.op-check{margin:8px 0}.op-shell textarea{min-height:78px;resize:vertical}.op-shell fieldset{padding:0;border:0;margin:22px 0;min-width:0}.op-shell legend{font:500 20px Georgia,serif;margin-bottom:7px}
  .op-actions{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin:16px 0 0}.op-btn{cursor:pointer;border:1px solid #4b4538;background:transparent;color:#342d25;padding:10px 17px;border-radius:24px;font:600 14px/1.4 system-ui}.op-btn.primary{color:#fffcf4;background:#39452f;border-color:#39452f}.op-shell :focus-visible{outline:3px solid #15709e;outline-offset:3px}.op-note{background:#edeadf;border-left:3px solid #7d8867;padding:11px 14px;font:500 13px/1.5 system-ui}.op-tag{display:inline-block;margin-bottom:10px;background:#e8eadc;color:#435034;padding:4px 10px;border-radius:30px;font:600 12px/1.4 system-ui}
  .op-dl{margin:0 0 16px}.op-dl>div{display:grid;grid-template-columns:minmax(110px,.85fr) 1.2fr;gap:12px;border-bottom:1px solid #d7d3c2;padding:9px 0;font:400 14px/1.45 system-ui;overflow-wrap:anywhere}.op-dl dt{font-weight:600}.op-dl dd{margin:0}.op-small{font:400 13px/1.55 system-ui}.op-section{margin:25px 0}.op-card{padding:18px;margin:12px 0}.op-card summary,.op-guide summary{cursor:pointer;font-weight:650}.op-guide{padding:14px 0}.op-guide li{margin-bottom:7px}.op-shell button[disabled]{opacity:.5;cursor:not-allowed}.op-error{font:600 14px system-ui;color:#922f28}.op-editor{max-height:72vh;overflow:auto;padding:0 4px 6px}.op-list{margin:0;padding-left:20px}.op-lock{max-width:540px}
  @media(max-width:760px){.op-cols{grid-template-columns:1fr}.op-editor{max-height:none}.op-shell{padding-bottom:85px}}
  @media(max-width:480px){.op-grid{grid-template-columns:1fr}}
  </style>`;
  const shell = (eye,title,intro,content) => styles+'<section class="op-shell"><p class="op-eye">'+html(eye)+'</p><h1>'+html(title)+'</h1><p>'+html(intro)+'</p>'+content+'</section>';
  window.opsSeed = {
    tables: Object.keys(places).flatMap(outlet=>[
      {id:outlet+'-window',outlet,name:'Window table',capacity:4,features:'Indoor · window seat'},
      {id:outlet+'-terrace',outlet,name:'Terrace table',capacity:8,features:'Outdoor · open air'},
      {id:outlet+'-group',outlet,name:'Gathering table',capacity:16,features:'Indoor · semi-private'}
    ]),
    services:['Cake','Decorations','Flowers','Custom menu','Other service'].map((name,i)=>({id:'service-'+(i+1),name,charge:'Quote pending client approval'}))
  };
  let formState=null,stage='form',lastId='',staffTab='requests',collection=null;
  let unlocked=false,editData=null;
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
    const t=G.tables.find(t=>t.id===f.table);
    return [['Outlet',places[f.outlet]],['Visit',f.type],['Date & time',[f.date,f.time].filter(Boolean).join(' · ')||'Choose a date and time'],['Guests',f.adults+' adults · '+f.children+' children'],['Seating',f.seating],['Table',t?t.name+' · seats '+t.capacity:'Staff to suggest'],['Optional services',serviceSummary(f)],['Contact',[f.name,f.email,f.phone].filter(Boolean).join(' · ')||'Add sample details'],['Special requests',f.requests||'None']];
  }
  function tableFields(f) {
    const list=suitable(f);
    if(!list.some(t=>t.id===f.table))f.table='';
    return choose('table','Table preference',[['','Ask staff to suggest a table'],...list.map(t=>[t.id,t.name+' · seats '+t.capacity+' · '+t.features])],f.table)+'<p class="op-small">'+(list.length?'These example tables fit your party. Availability is simulated.':'No example table matches this party and seating choice. Staff can review a custom arrangement.')+'</p>';
  }
  function requestForm(f) {
    return '<div class="op-cols"><form id="greko-book" class="op-panel"><h2>Plan your visit</h2><div class="op-grid">'+choose('outlet','Outlet',Object.entries(places),f.outlet)+choose('type','Occasion',pairs(['Regular table','Birthday','Anniversary','Other event']),f.type)+fields('date','Preferred date','date',f.date,'required min="'+localDate()+'"')+'<label>Preferred time · sample slots<select name="time" required>'+options([['','Select a time'],...pairs(['10:00','11:30','13:00','14:30','16:00','17:30','19:00','20:30'])],f.time)+'</select></label>'+fields('adults','Adults','number',f.adults,'required min="1" max="999"')+fields('children','Children','number',f.children,'required min="0" max="999"')+choose('seating','Seating preference',pairs(['Any seating','Indoor','Outdoor','Semi-private']),f.seating)+'<div id="op-tables">'+tableFields(f)+'</div></div><fieldset><legend>Optional services</legend><p class="op-small">Examples for your enquiry. Staff will advise on availability and charges.</p>'+G.services.map(s=>'<label class="op-check"><input type="checkbox" name="service" value="'+html(s.id)+'" '+(f.services.includes(s.id)?'checked':'')+'>'+html(s.name)+' · '+html(s.charge)+'</label>').join('')+'</fieldset><h3>Contact details</h3><p class="op-small">Use fictional contact details for this presentation.</p><div class="op-grid">'+fields('name','Guest name','text',f.name,'required maxlength="100" placeholder="Demo Guest" autocomplete="off"')+fields('email','Email','email',f.email,'required maxlength="150" placeholder="guest@example.com" autocomplete="off"')+fields('phone','Phone (optional)','tel',f.phone,'maxlength="24" autocomplete="off"')+'<label class="op-full">Special requests<textarea name="requests" maxlength="600">'+html(f.requests)+'</textarea></label></div><button class="op-btn primary">Review request</button></form><aside class="op-side"><h2>Your visit</h2><div id="op-summary">'+summary(requestRows(f).slice(0,7))+'</div>'+policy()+'</aside></div>';
  }
  function policy(){return '<h3>Booking policy</h3><p class="op-small">'+html(G.bookingPolicy||'Draft for client approval. A request is subject to staff review. Greko will supply its change, cancellation and event-service terms before launch.')+'</p>';}
  function booking() {
    if(!formState || formState.outlet!==outlet()){formState=startingForm();stage='form';}
    let body;
    if(stage==='review')body='<div class="op-panel"><h2>Review your request</h2>'+summary(requestRows(formState))+policy()+'<div class="op-actions"><button class="op-btn" data-op="back">Edit details</button><button class="op-btn primary" data-op="submit">Request booking</button></div></div>';
    else if(stage==='done'){
      const rec=read(requestKey,[]).find(r=>r.id===lastId);
      body='<div class="op-panel">'+tag(rec?.status||pending)+'<h2>Request saved for the demo</h2><p>Reference '+html(lastId)+'. Staff can review this enquiry in the presentation dashboard.</p>'+summary(rec?.rows||requestRows(formState))+'<button class="op-btn" data-op="new">Start another request</button></div>';
    } else body=requestForm(formState);
    return shell('Tables & occasions','Book a table','Choose an outlet and tell us about your gathering.',msg()+body);
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
    if(['adults','children','outlet','seating'].includes(el.name))document.querySelector('#op-tables').innerHTML=tableFields(formState);
    document.querySelector('#op-summary').innerHTML=summary(requestRows(formState).slice(0,7));
  });
  document.addEventListener('change',e=>{
    if(e.target.matches('#greko-book [name=outlet]')){const id=e.target.value;formState.outlet=id;selectOutlet(id);}
  });
  const uid=()=>hex(crypto.getRandomValues(new Uint8Array(8)));
  const lockKey='greko-local-lock';
  const hex=bytes=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
  async function passwordHash(value,salt) {
    const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(value),'PBKDF2',false,['deriveBits']);
    const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:150000,hash:'SHA-256'},material,256);
    return hex(bits);
  }
  function lockScreen() {
    const exists=!!read(lockKey,null);
    return '<form class="op-panel op-lock" id="op-unlock"><h2>'+ (exists?'Unlock editor':'Set up this demo editor')+'</h2><p class="op-small">The presenter sets a temporary passphrase for this tab. Use a made-up phrase of eight or more characters. Staff access on the live site will require a managed account.</p>'+fields('pass','Demo passphrase','password','','required minlength="8" maxlength="150" autocomplete="off"')+'<p role="alert" class="op-error" id="op-error"></p><button class="op-btn primary">'+(exists?'Unlock editor':'Set passphrase & open editor')+'</button></form>';
  }
  const protectedNames=new Set(['id','slug']);
  const getAt=(o,keys)=>keys.reduce((v,k)=>v?.[k],o);
  const pack=path=>html(JSON.stringify(path));
  const btn=(op,title,extra='')=>'<button type="button" class="op-btn" data-op="'+op+'" '+extra+'>'+html(title)+'</button>';
  const displayName=(v,i)=>v && typeof v==='object' ? (v.name||v.title||v.question||v.code||v.label||v.id||('Entry '+(i+1))) : String(v ?? '');
  function editorField(value,path,title) {
    const indent=path.length, key=path.at(-1);
    if(Array.isArray(value))return '<fieldset><legend>'+html(title)+'</legend>'+value.map((item,index)=>{
      const subpath=[...path,index];
      return '<details class="op-card"><summary>'+html(displayName(item,index))+'</summary>'+editorField(item,subpath,typeof item==='object'?'Details':'Value')+
        (path[0]==='outlets'?'':btn('remove','Remove entry','data-path="'+pack(subpath)+'"'))+'</details>';
    }).join('')+(path[0]==='outlets'?'':btn('add','Add entry','data-path="'+pack(path)+'"'))+'</fieldset>';
    if(value && typeof value==='object')return '<div class="op-grid">'+Object.entries(value).map(([k,v])=>'<div '+(typeof v==='object'?'class="op-full"':'')+'>'+editorField(v,[...path,k],label(k))+'</div>').join('')+'</div>';
    const identity=protectedNames.has(key);
    const attrs=' data-content="'+pack(path)+'"'+(identity?' readonly':'');
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
    return '<div class="op-panel"><h2>Booking enquiries</h2><p>Review simulated requests submitted in this tab. Status changes appear in the local record.</p>'+(list.length?list.slice().reverse().map(r=>'<details class="op-card"><summary>'+html(r.name)+' · '+html(places[r.outlet])+' · '+html(r.type)+' · '+html(r.status)+'</summary><p class="op-small">'+html(r.id)+'</p>'+summary(r.rows)+'<form class="op-decision" data-id="'+html(r.id)+'"><label>Staff note<textarea name="note" maxlength="400" placeholder="Include a reason when requesting changes.">'+html(r.note||'')+'</textarea></label><div class="op-actions">'+[['Approved in demo','Approve'],['Declined in demo','Decline'],['Changes requested','Request changes']].map(([value,title])=>'<button class="op-btn" name="decision" value="'+value+'">'+title+'</button>').join('')+'</div></form></details>').join(''):'<p class="op-note">Your queue is empty. Use the booking form to send a sample enquiry.</p>')+'</div>';
  }
  function activity(){
    const counts=read('greko-events',{}),names={menu_view:'Menu views',directions:'Directions taps',call:'Calls',booking_request:'Booking requests',order_click:'Order clicks',offer_code_use:'Offer code use',membership_signup:'Membership sign-ups'};
    return '<div class="op-panel"><h2>Demo activity</h2><p>Preview counts for this tab. Production measurement requires an approved analytics setup.</p>'+summary(Object.entries({...Object.fromEntries(Object.keys(names).map(k=>[k,0])),...counts}).map(([key,n])=>[names[key]||label(key),n]))+'</div>';
  }
  function staff(){
    return shell('Greko · staff workspace','Staff editor','Manage café content and review guest enquiries.',msg()+(unlocked?'<div class="op-actions">'+btn('requests','Enquiry queue')+btn('content','Content editor')+btn('metrics','Demo activity')+btn('lock','Lock editor')+'</div><details class="op-guide"><summary>How to update the site</summary><ol><li>Open Content editor and choose the section you want to update.</li><li>Change the example fields. Use outlet identifiers exactly as shown when editing eligibility.</li><li>Select Preview draft and check the affected page. Return to Staff editor for further edits.</li><li>Select Publish to demo to apply the changes in this tab. For a booking, open the enquiry queue and record a decision.</li></ol><p class="op-small">Demo storage is temporary. Live publishing requires staff sign-in, server-enforced editor permissions, durable records and an audit log.</p></details><div class="op-section">'+(staffTab==='requests'?requests():staffTab==='metrics'?activity():editor())+'</div>':lockScreen()));
  }
  function saveField(el){
    if(!unlocked||!editData||el.readOnly)return;
    const keys=JSON.parse(el.dataset.content),parent=getAt(editData,keys.slice(0,-1)),key=keys.at(-1);
    if(!parent||protectedNames.has(key))return;
    const value=el.type==='checkbox'?el.checked:el.type==='number'?Number(el.value):el.value;
    parent[key]=value;
    write(draftKey,editData);
  }
  document.addEventListener('input',e=>{if(e.target.hasAttribute('data-content'))saveField(e.target);});
  document.addEventListener('change',e=>{if(unlocked&&e.target.id==='op-collection'){collection=e.target.value;render();}});
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
      e.preventDefault();capture(f);stage='review';render();window.scrollTo(0,0);
    }else if(f.id==='op-unlock'){
      e.preventDefault();
      const button=f.querySelector('button');button.disabled=true;
      try{
        const pass=new FormData(f).get('pass'),old=read(lockKey,null),salt=old?.salt||hex(crypto.getRandomValues(new Uint8Array(16)));
        const digest=await passwordHash(pass,salt);
        if(old && digest!==old.digest){f.querySelector('#op-error').textContent='That demo passphrase did not match.';return;}
        if(!old)write(lockKey,{salt,digest});
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
        const records=read(requestKey,[]);
        lastId='DEMO-'+uid().slice(0,8).toUpperCase();
        records.push({id:lastId,outlet:formState.outlet,type:formState.type,name:formState.name,rows:requestRows(formState),status:pending});
        write(requestKey,records);stage='done';track('booking_request');
      }
      render();window.scrollTo(0,0);return;
    }
    if(!unlocked)return;
    if(op==='lock'){unlocked=false;editData=null;}
    if(['requests','content','metrics'].includes(op))staffTab=op;
    if(op==='preview'||op==='publish'){
      const error=invalidData(editData);if(error){document.querySelector('#op-error').textContent=error;return;}
      if(op==='preview'){write('greko-preview',editData);go('/');notice('Previewing your draft in this tab.');return;}
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
