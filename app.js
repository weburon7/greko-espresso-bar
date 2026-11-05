const pagesBase = '/greko-espresso-bar';
function siteHref(path){if(outletRoutes.has(path))path=guestRoute(path,{id:outlet()});return path.startsWith('/') && !path.startsWith('//') ? pagesBase+path : path}
function pageRoute(){return location.pathname.slice(pagesBase.length).replace(/index\.html$/,'')||'/'}
const demo='Demo preview — no booking or order has been placed.';
const locationsSeed=['Model Town','Eastwood Village'].map(name=>({name,id:name.toLowerCase().replaceAll(' ','-'),address:'Street address awaiting approval',hours:'Regular hours awaiting approval',holidayHours:'Holiday hours awaiting approval',phone:'',mapUrl:'',orderUrl:'',bookingUrl:'',photo:'/greko-espresso-bar/images/'+(name==='Model Town'?'hero':'atmosphere')+'.jpg'}));
const baseSeed={outlets:locationsSeed,home:{headline:'Olympus,',emphasis:'by the cup.',intro:'Espresso, café plates and a little Greek mythology in the heart of Jalandhar.',cover:'/greko-espresso-bar/images/apollo-cover.webp',coverAlt:'A marble bust of Apollo with an espresso cup on a sunlit counter',hero:'/greko-espresso-bar/images/hero.jpg',heroAlt:'Coffee and a French press on a sunlit café table',gallery:'/greko-espresso-bar/images/atmosphere.jpg'},faqs:[{question:'Can I order or book as a guest?',answer:'Yes. Choose an outlet and browse the menu or request a table without joining the membership program.'},{question:'How can I change a booking?',answer:'Changes and cancellations will follow the policy approved by Greko. For this presentation, requests stay in the demo.'},{question:'Are these offers available in the café?',answer:'All offers, prices and rewards shown are illustrative and await approval from Greko.'}],social:{instagram:''},seo:Object.fromEntries(Object.entries({'/':'Home','/menu/':'Menu','/book/':'Events & Bookings','/locations/':'Our locations','/locations/model-town/':'Model Town café, Jalandhar','/locations/eastwood-village/':'Eastwood Village café, Jalandhar','/membership/':'Membership','/order/':'Your order','/offers/':'Offers','/contact/':'Contact','/staff/':'Staff studio'}).map(([key,title])=>[key,{title:title+' | Greko Espresso Bar',description:title+' at Greko Espresso Bar, Model Town and Eastwood Village, Jalandhar.'}])),...window.shopSeed,...window.opsSeed,...window.memberSeed};
const outletRoutes=new Set(['/menu/','/book/','/order/']);
let G;
function read(key,def){try{return JSON.parse(sessionStorage.getItem(key))??def}catch{return def}}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function safe(v){return /^(https?:\/\/|\/(?!\/))/.test(v)?esc(v):''}
function outlet(){return sessionStorage.getItem('greko-outlet')||'model-town'}
function selectOutlet(id){if(!G.outlets.some(o=>o.id===id))return; sessionStorage.setItem('greko-outlet',id);if(outletRoutes.has(pageRoute())){const url=new URL(location.href);url.searchParams.set('outlet',id);history.replaceState(history.state,'',url);for(const a of document.querySelectorAll('#header a,#quick a')){const next=new URL(a.href);if(outletRoutes.has(next.pathname.slice(pagesBase.length))){next.searchParams.set('outlet',id);a.href=next.href}}}}
function track(event){const counts=read('greko-events',{});counts[event]=(counts[event]||0)+1;sessionStorage.setItem('greko-events',JSON.stringify(counts))}
function notice(msg){const el=document.querySelector('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(notice.timer);notice.timer=setTimeout(()=>el.classList.remove('show'),4700)}
function go(path){const [route]=path.split('?');if(route==='/menu/')track('menu_view');if(outletRoutes.has(route)&&!path.includes('?'))path=guestRoute(path,{id:outlet()});history.pushState({},'',siteHref(path));render();scrollTo(0,0);document.querySelector('#main').focus({preventScroll:true})}
const symbols={clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',call:'<path d="M6 3h3l2 5-3 2a16 16 0 0 0 6 6l2-3 5 2v3q0 3-3 3C10 20 4 14 3 6q0-3 3-3Z"/>',pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.4"/>',cup:'<path d="M3 8h14v5a7 7 0 0 1-14 0zM17 9h2a3 3 0 0 1 0 6h-3M2 22h17M6 5l1-3m4 3 1-3"/>',book:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 2v6m10-6v6M3 11h18"/>',arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',bag:'<path d="M5 7h14l1 14H4zM9 8V5a3 3 0 0 1 6 0v3"/>',menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 1v4m0 14v4M1 12h4m14 0h4M4 4l3 3m10 10 3 3M4 20l3-3M17 7l3-3"/>'};
function ico(k){return '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+symbols[k]+'</svg>'}
const nav=[['Home','/'],['Menu','/menu/'],['Locations','/locations/'],['Events & Bookings','/book/'],['Offers','/offers/'],['Membership','/membership/'],['Contact','/contact/']];
const photos = pagesBase + '/images/';
const outletEditions = {
  'model-town': { patron: 'Athena', motif: 'The olive branch', tone: 'olive', feature: 'espresso', detailPhoto: 'coffee.jpg', art: 'athena-coin.webp' },
  'eastwood-village': { patron: 'Poseidon', motif: 'The Aegean wave', tone: 'aegean', feature: 'cooler', detailPhoto: 'drink.jpg', art: 'wave.svg' }
};
function edition(o){return outletEditions[o.id] || outletEditions['model-town']}
function outletRoute(o){return '/locations/'+encodeURIComponent(o.id)+'/'}
function guestRoute(path,o){return path+'?outlet='+encodeURIComponent(o.id)}
function navCurrent(p,l){return p===l || (l!=='/' && p.startsWith(l))}
function brand(){
  return `<a class="brand" href="${siteHref('/')}" aria-label="Greko Espresso Bar home"><svg class="brandmark" aria-hidden="true" viewBox="0 0 42 46" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 7h26c6 0 8 8 1 9-5 1-6-5-2-5M30 7H9c-7 0-8 9-2 9 5 0 6-5 2-5M8 5h24M9 20h20l-2 16H13zM12 38h17M9 41h23M16 20l1 14m4-14v14m4-14-1 14"/></svg><span><b>Greko</b><small>ESPRESSO BAR</small></span></a>`;
}
function link(path,label,cls='btn'){return '<a class="'+cls+'" href="'+siteHref(path)+'">'+label+'</a>'}
function header(p){
  const links=nav.map(([n,l])=>'<a '+(navCurrent(p,l)?'aria-current="'+(p===l?'page':'location')+'"':'')+' href="'+siteHref(l)+'">'+n+'</a>').join('');
  return brand()+'<nav id="site-nav" class="topnav" aria-label="Primary">'+links+'</nav>'+link('/order/',ico('bag')+' Order online','btn headOrder')+'<button type="button" class="navToggle" aria-label="Open navigation" aria-expanded="false" aria-controls="site-nav">'+ico('menu')+'</button>';
}
function label(text){return '<div class="eyeline">'+text+'</div>'}
function cards(){
  return '<div class="atlas-grid">'+G.outlets.map(o=>{
    const ed=edition(o);
    return `<a class="atlas-card ${ed.tone}" href="${siteHref(outletRoute(o))}">
      <div class="atlas-photo"><img loading="lazy" src="${safe(o.photo)}" alt="Café atmosphere concept for ${esc(o.name)}"><span class="photo-credit">Preview photography</span></div>
      <div class="atlas-caption"><div><span class="eyeline">${ed.motif} · Jalandhar</span><h3>${esc(o.name)}</h3></div><span class="round-arrow">${ico('arrow')}</span></div></a>`;
  }).join('')+'</div>';
}
function indexLocations(){
  return `<div class="page atlas-index"><header class="page-intro">${label('Our locations · Jalandhar')}<h1>Two neighbourhoods.<br><em>One Greko.</em></h1><p>Pick your café to explore its menu, plan a visit or request a table.</p></header>${cards()}</div>`;
}
function home(){
  const h=G.home, offer=G.offers[0];
  return `<section class="cover">
    <img class="cover-art" src="${safe(h.cover||photos+'apollo-cover.webp')}" alt="${esc(h.coverAlt||'Marble Apollo bust and a blue espresso cup in afternoon light')}" fetchpriority="high">
    <div class="cover-inner">${label('Greko Espresso Bar · Jalandhar')}
      <h1>${esc(h.headline)}<br><em>${esc(h.emphasis)}</em></h1><p>${esc(h.intro)}</p>
      <div class="actions">${link('/menu/','Explore the menu '+ico('arrow'),'btn light')}${link('/book/',ico('book')+' Book a table','btn glass')}</div>
    </div><small class="cover-credit">Apollo at the counter · Concept artwork</small></section>
    <nav class="location-bar" aria-label="Choose a location"><span>${ico('pin')} Choose a location</span>${G.outlets.map(o=>link(outletRoute(o),esc(o.name)+' '+ico('arrow'),'outlet-link')).join('')}</nav>
    <section class="section counter-menu"><div class="sectionHead"><div>${label('From the sample menu')}<h2>The Olympian counter</h2></div>${link('/menu/','Full menu '+ico('arrow'),'textLink')}</div>${window.featured()}</section>
    <section class="section home-outlets"><div class="sectionHead"><div>${label('Our locations')}<h2>Choose your Greko</h2></div></div>${cards()}</section>
    <section class="stories"><article class="offer-story"><div>${label('Sample offers')}<h2>At the coffee bar</h2><p>${offer?esc(offer.benefit)+' with <b>'+esc(offer.code)+'</b> in the demo checkout.':'Explore sample promotions.'}</p>${link('/offers/','See offers '+ico('arrow'),'textLink')}</div></article><article class="club-story"><img src="${photos}athena-coin.webp" alt="" loading="lazy"><div>${label('Membership preview')}<h2>The Laurel Club</h2><p>Discover the points, tiers and rewards in the sample membership.</p>${link('/membership/','Explore the club '+ico('arrow'),'textLink')}</div></article></section>
    <section class="section gallery"><div class="sectionHead"><div>${label('Café gallery')}<h2>At Hestia’s table</h2></div></div><div class="gallery-images"><img loading="lazy" src="${safe(h.gallery)}" alt="Café seating concept"><img loading="lazy" src="${safe(h.hero)}" alt="${esc(h.heroAlt)}"></div><small>Café photography is illustrative throughout this preview.</small></section>`;
}
function previewAction(o,kind){
  const isCall=kind==='Call';
  const number=String(o.phone||'').trim();
  const url=isCall?(/^\+?[\d ()-]{6,}$/.test(number)?'tel:'+number.replace(/[ ()-]/g,''):''):safe(o.mapUrl);
  if(!url)return '<span class="pending-action">'+ico(isCall?'call':'pin')+' '+(isCall?'Phone pending':'Map pin pending')+'</span>';
  return '<a class="btn outline" href="'+url+'" data-contact="'+kind+'" data-oid="'+esc(o.id)+'">'+ico(isCall?'call':'pin')+' '+kind+'</a>';
}
function locPage(o){
  const ed=edition(o), other=G.outlets.find(x=>x.id!==o.id);
  const available=G.menu.filter(i=>i.available&&i.outlets.includes(o.id));
  const signature=available.find(i=>i.id===ed.feature);
  const features=[];
  for(const item of [signature,...available]){
    if(item&&!features.some(p=>p.category===item.category))features.push(item);
    if(features.length===3)break;
  }
  const fact=(icon,title,val,fallback)=>'<div class="visit-fact">'+ico(icon)+'<div><dt>'+title+'</dt><dd>'+esc(val||fallback)+'</dd></div></div>';
  const localAction=(path,text,cls)=>link(guestRoute(path,o),text,cls);
  return `<div class="outlet-page ${ed.tone}">
    <section class="outlet-cover"><img src="${safe(o.photo)}" class="cover-art" alt="Café photography concept for ${esc(o.name)}" fetchpriority="high">
      <div class="outlet-cover-inner">${link('/locations/','← All locations','crumb')}
      <div class="outlet-title">${label('Greko Espresso Bar · Jalandhar')}<h1>${esc(o.name)}</h1>
        <div class="actions">${localAction('/menu/','View outlet menu '+ico('arrow'),'btn light')}${localAction('/book/',ico('book')+' Book a table','btn glass')}</div>
      </div></div><small class="cover-credit">Café concept photography</small>
    </section>
    <section class="outlet-layout"><div class="outlet-left">
      <div class="house-mark"><img src="${photos+ed.art}" alt=""><span>${ed.patron}<small>${ed.motif}</small></span></div>
      ${label('The outlet menu')}<h2>At the counter</h2><p>Explore a few sample picks for ${esc(o.name)}.</p>
      <div class="outlet-picks">${features.map(i=>`<a href="${siteHref(guestRoute('/menu/',o))}" data-gs-feature="${esc(i.name)}"><img src="${safe(i.photo)}" alt="" loading="lazy"><span><small>${esc(i.category)}</small><b>${esc(i.name)}</b></span>${ico('arrow')}</a>`).join('')||'<p>Menu items are being prepared for this outlet.</p>'}</div>
      <div class="actions">${localAction('/order/','Order from '+esc(o.name)+' '+ico('arrow'),'btn')}${safe(o.bookingUrl)?link(safe(o.bookingUrl),'Booking provider','textLink'):''}</div>
    </div><aside class="visit-panel">${label('Visitor information')}<h2>Plan your visit</h2><dl>
      ${fact('pin','Address',o.address,'Street address pending')}${fact('clock','Regular hours',o.hours,'Hours pending')}${fact('book','Holiday hours',o.holidayHours,'Holiday hours pending')}${fact('call','Telephone',o.phone,'Number pending')}
      </dl><div class="actions">${previewAction(o,'Directions')}${previewAction(o,'Call')}</div></aside></section>
    ${other?`<aside class="other-house"><span>Explore the other café</span>${link(outletRoute(other),esc(other.name)+' '+ico('arrow'),'other-link')}</aside>`:''}
  </div>`;
}
function footer(){return `<div class="footer-main">${brand()}<p>Model Town &amp; Eastwood Village<br>Jalandhar, Punjab</p><nav aria-label="Footer">${link('/locations/','Visit Greko','footLink')}${link('/contact/','Contact','footLink')}${link('/staff/','Staff studio','footLink')}</nav></div><div class="footer-note">Greko Espresso Bar <span>Client preview · Sample menu, offers &amp; photography</span></div>`}
function render(){G={...structuredClone(baseSeed),...read('greko-content',{}),...read('greko-preview',{})};window.G=G;let p=pageRoute().replace(/\/?$/,'/');const requested=new URLSearchParams(location.search).get('outlet');if(outletRoutes.has(p)&&requested)selectOutlet(requested);const o=G.outlets.find(o=>p==='/locations/'+o.id+'/');if(o)selectOutlet(o.id);const meta=G.seo[p];if(meta){document.title=meta.title;document.querySelector('meta[name=description]').content=meta.description}document.querySelector('link[rel=canonical]').href=location.origin+pagesBase+p;document.querySelector('[type="application/ld+json"]')?.remove();if(o){const ld=document.createElement('script');ld.type='application/ld+json';ld.textContent=JSON.stringify({'@context':'https://schema.org','@type':'Restaurant',name:'Greko Espresso Bar — '+o.name,url:location.origin+pagesBase+p,address:{'@type':'PostalAddress',addressLocality:'Jalandhar',addressCountry:'IN'}});document.head.append(ld)}
document.querySelector('#header').innerHTML=header(p);let html=p==='/'?home():o?locPage(o):p==='/locations/'?indexLocations():p==='/contact/'?window.contactPage():['/menu/','/order/','/offers/'].includes(p)?shopPage(p):['/book/','/staff/'].includes(p)?opsPage(p):p==='/membership/'?memberPage(p):'<section class="section"><h1>Page unavailable</h1><a href="/greko-espresso-bar/">Return home</a></section>';document.querySelector('#main').innerHTML=(sessionStorage.getItem('greko-preview')?'<aside class="draft">Staff draft preview · <a href="/greko-espresso-bar/staff/">Return to editor</a></aside>':'')+html;document.querySelector('#footer').innerHTML=footer();document.querySelector('#quick').innerHTML=[['cup','Menu','/menu/'],['pin','Directions','/locations/'],['book','Book','/book/'],['bag','Order','/order/']].map(([i,n,l])=>link(l,ico(i)+n,'')).join('')}
document.addEventListener('click',e=>{const toggle=e.target.closest('.navToggle');if(toggle){let open=document.querySelector('.topnav').classList.toggle('open');toggle.setAttribute('aria-expanded',open);toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');return}const a=e.target.closest('a');if(!a||e.defaultPrevented||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;if(a.dataset.contact){selectOutlet(a.dataset.oid);track(a.dataset.contact==='Call'?'call':'directions');if(a.hash==='#details'){e.preventDefault();notice(a.dataset.contact+' details for '+G.outlets.find(o=>o.id===a.dataset.oid).name+' await client approval.');return}}if(a.origin===location.origin&&a.getAttribute('href').startsWith(pagesBase+'/')&&!a.target){e.preventDefault();go(a.pathname.slice(pagesBase.length)+a.search);if(a.pathname===pagesBase+'/order/')track('order_click')}});
document.addEventListener('click',event=>{
  const nav=document.querySelector('.topnav.open');
  if(nav&&!event.target.closest('#header')){
    nav.classList.remove('open');
    const toggle=document.querySelector('.navToggle');
    toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-label','Open navigation');
  }
});
addEventListener('popstate',render);if(pageRoute()==='/menu/')track('menu_view');render();
document.addEventListener('keydown',event=>{
  if(event.key!=='Escape')return;
  const menu=document.querySelector('.topnav.open');
  if(menu){menu.classList.remove('open');const toggle=document.querySelector('.navToggle');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open navigation');toggle.focus();}
});
