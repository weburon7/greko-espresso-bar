(() => {
  const model = 'model-town';
  const east = 'eastwood-village';
  const both = [model, east];
  const place = id => id === east ? 'Eastwood Village' : 'Model Town';
  const dateAt = offset => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  };
  const makeItem = (id, name, category, description, price, dietary, photo, outlets = both, available = true) => ({
    id, name, category, description, price, dietary, photo: '/greko-espresso-bar/images/' + photo + '.jpg', alt: name + ' category photograph, illustrative', outlets, available
  });
  window.shopSeed = {
    categories: ['Coffee', 'Other drinks', 'Food', 'Desserts'],
    menu: [
      makeItem('flat-white', 'Flat white', 'Coffee', 'A double espresso folded into silky steamed milk.', 220, 'Contains milk', 'coffee'),
      makeItem('focaccia', 'Demeter garden focaccia', 'Food', 'A nod to the goddess of harvest: roasted vegetables, basil and olive oil on focaccia.', 310, 'Vegetarian · Contains wheat', 'food'),
      makeItem('tiramisu', 'Classic tiramisu', 'Desserts', 'Espresso-soaked sponge layered with mascarpone and cocoa.', 260, 'Contains egg, milk and wheat', 'dessert'),
      makeItem('espresso', 'Zeus double espresso', 'Coffee', 'Two short shots with a thunderbolt of coffee flavour.', 150, 'Plant-based', 'coffee'),
      makeItem('cooler', 'Poseidon citrus cooler', 'Other drinks', 'Sparkling citrus over ice, finished with fresh mint.', 180, 'Plant-based', 'drink'),
      makeItem('iced-latte', 'Iced latte', 'Coffee', 'Espresso poured over chilled milk and ice.', 240, 'Contains milk', 'coffee', [east]),
      makeItem('croissant', 'Butter croissant', 'Food', 'Golden, flaky pastry with a soft butter centre.', 190, 'Contains wheat and milk', 'food', [model]),
      makeItem('cocoa', 'Iced cocoa', 'Other drinks', 'Dark cocoa shaken with chilled milk.', 210, 'Contains milk', 'drink', both, false)
    ],
    offers: [
      {code:'SIP10',name:'A little coffee break',benefit:'10% off eligible coffee',percent:10,start:dateAt(-7),end:dateAt(21),outlets:both,items:['flat-white','espresso','iced-latte'],minimum:150,terms:'Discount applies to eligible coffees only. One code per preview order.'},
      {code:'GARDEN15',name:'Lunch in Model Town',benefit:'15% off garden focaccia',percent:15,start:dateAt(-5),end:dateAt(20),outlets:[model],items:['focaccia'],minimum:300,terms:'Available on the sample Model Town menu. One code per preview order.'},
      {code:'NEXT10',name:'Something sweet',benefit:'10% off tiramisu',percent:10,start:dateAt(22),end:dateAt(30),outlets:both,items:['tiramisu'],minimum:250,terms:'Use during the displayed sample dates.'},
      {code:'PAST10',name:'Past coffee special',benefit:'10% off flat whites',percent:10,start:dateAt(-20),end:dateAt(-1),outlets:both,items:['flat-white'],minimum:150,terms:'This example has ended and cannot be applied.'}
    ]
  };
  const e = value => esc(String(value ?? ''));
  const rs = value => '₹' + Number(value || 0).toLocaleString('en-IN', {maximumFractionDigits:2});
  const slug = id => encodeURIComponent(id);
  const safeUrl = (value, photo = false) => {
    if (!value) return '';
    try {
      const url = new URL(value, location.origin);
      if (url.protocol === 'https:' || (photo && url.origin === location.origin)) return e(url.href);
    } catch {}
    return '';
  };
  const demoNotice = () => '<p class="gs-demo">Demo preview — no booking or order has been placed.</p>';
  const controls = {query:'', category:'All', stage:'cart', result:null, note:''};
  let carts;
  try { carts = JSON.parse(sessionStorage.getItem('greko-preview-carts') || '{}') || {}; } catch { carts = {}; }
  const cart = () => carts[outlet()] ||= {items:{}, code:''};
  const persist = () => sessionStorage.setItem('greko-preview-carts', JSON.stringify(carts));
  const available = item => item.available === true && item.outlets.includes(outlet());
  const lines = () => G.menu.filter(item => available(item) && cart().items[item.id] > 0);
  const qty = item => Number(cart().items[item.id]) || 0;
  const subtotal = () => lines().reduce((total, item) => total + item.price * qty(item), 0);
  const count = () => lines().reduce((total,item) => total + qty(item), 0);
  const status = offer => dateAt(0) < offer.start ? 'Upcoming' : dateAt(0) > offer.end ? 'Expired' : 'Active';
  const offerState = () => {
    const code = cart().code.trim().toUpperCase();
    if (!code) return {discount:0,text:''};
    const offer = G.offers.find(o => o.code.toUpperCase() === code);
    let msg = '';
    if (!offer) msg = 'Unknown code. Check the spelling on the Offers page.';
    else if (status(offer) === 'Expired') msg = 'This sample code has expired.';
    else if (status(offer) === 'Upcoming') msg = 'This sample code starts on ' + offer.start + '.';
    else if (!offer.outlets.includes(outlet())) msg = 'This code is only available at ' + offer.outlets.map(place).join(' and ') + '.';
    else if (!lines().some(i => offer.items.includes(i.id))) msg = 'Add an eligible item to use this code.';
    else if (subtotal() < offer.minimum) msg = 'Sample minimum order: ' + rs(offer.minimum) + '.';
    if (msg) return {discount:0,text:msg,ok:false};
    const base = lines().filter(i => offer.items.includes(i.id)).reduce((sum,i) => sum + i.price * qty(i),0);
    return {discount:Math.round(base * Math.max(0,Math.min(100,offer.percent))) / 100, text:code + ' applied to eligible sample items.',ok:true};
  };
  const css = `<style>
  .gs{max-width:1220px;margin:0 auto;padding:clamp(26px,5vw,74px) clamp(16px,4vw,58px);color:#322a22}.gs h1,.gs h2,.gs h3,.gs-feat h3{font-family:Georgia,serif;font-weight:500;letter-spacing:-.035em;margin:.18em 0}.gs h1{font-size:clamp(42px,7vw,82px);line-height:1.04}.gs h2{font-size:clamp(30px,4vw,44px)}.gs h3,.gs-feat h3{font-size:25px}.gs p{line-height:1.5}.gs-intro{max-width:68ch}.gs-demo,.gs-muted,.gs-meta{color:#605744;font-size:.88rem}.gs-demo{border-left:3px solid #8b8750;padding:.4em .8em}.gs-toolbar,.gs-row,.gs-filters{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.gs-toolbar{margin:32px 0 16px}.gs-toolbar label,.gs-check label{display:grid;gap:5px;font-size:.9rem}.gs input,.gs select,.gs textarea{font:inherit;min-height:44px;padding:9px 12px;border:1px solid #b2a68f;border-radius:6px;background:#fffdf6;color:#322a22;max-width:100%}.gs button,.gs-action{cursor:pointer;font:inherit;border:1px solid #766a52;border-radius:5px;padding:10px 17px;min-height:44px;background:transparent;color:inherit;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}.gs .primary,.gs .selected{background:#363b29;color:white;border-color:#363b29}.gs button:disabled{opacity:.55;cursor:default}.gs :focus-visible,.gs-feat a:focus-visible{outline:3px solid #246595;outline-offset:3px}.gs-filters{margin:16px 0 26px}.gs-group{margin:32px 0}.gs-grid,.gs-feat{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(14px,2.2vw,32px)}.gs-card{padding-bottom:18px;border-bottom:1px solid #bfb69d}.gs-card img,.gs-feat img{width:100%;aspect-ratio:1.55;object-fit:cover;border-radius:4px}.gs-feat a{color:inherit;text-decoration:none}.gs-card .gs-meta{margin:5px 0}.gs-card .gs-row{margin-top:12px;justify-content:space-between}.gs-box{padding:clamp(16px,3vw,30px);border:1px solid #c5bba7;border-radius:8px;margin:20px 0}.gs-line,.gs-totals p{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;border-bottom:1px solid #d4cbb8;padding:12px 0;margin:0}.gs-check{display:grid;gap:18px;max-width:630px}.gs-offer dl{display:grid;grid-template-columns:max-content 1fr;gap:6px 16px}.gs-offer dd{margin:0}.gs .gs-upper{font-size:.75rem;letter-spacing:.12em;text-transform:uppercase;color:#526145}.gs strong{font-weight:650}.gs-feat .gs-upper{font-size:.72rem;letter-spacing:.11em;text-transform:uppercase;color:#536047}.gs-feat p{margin:.65em 0 .2em}.gs code{font-size:1rem;letter-spacing:.08em}.gs-toolbar .gs-action{margin-left:auto}.gs a:not(.gs-action){text-decoration:underline;text-underline-offset:3px}
  @media(max-width:760px){.gs-grid,.gs-feat{grid-template-columns:repeat(2,minmax(0,1fr))}.gs-toolbar .gs-action{margin-left:0}.gs-feat h3{font-size:21px}}
  @media(max-width:520px){.gs-grid,.gs-feat{grid-template-columns:1fr}.gs-offer dl{grid-template-columns:1fr;gap:0}.gs-offer dt{font-weight:600}.gs-offer dd{margin-bottom:8px}.gs-toolbar>*{flex:1 1 42%}.gs input,.gs select{min-width:0}.gs-toolbar .gs-action{flex-basis:100%}.gs-feat{gap:20px}}
  </style>`;
  const photo = item => '<img src="'+safeUrl(item.photo,true)+'" alt="'+e(item.alt)+'" loading="lazy">';
  window.featured = () => css+'<div class="gs-feat">'+['espresso','focaccia','cooler'].map(id=>G.menu.find(item=>item.id===id)).filter(Boolean).map(item => '<a href="/greko-espresso-bar/menu/" data-gs-feature="'+e(item.name)+'">'+photo(item)+'<p class="gs-upper">'+e(item.category)+'</p><h3>'+e(item.name)+'</h3></a>').join('')+'</div>';
  const choose = () => '<label>Choose your outlet<select data-gs-outlet>'+both.map(id => '<option value="'+id+'" '+(id===outlet()?'selected':'')+'>'+place(id)+'</option>').join('')+'</select></label>';
  const addButton = item => '<button data-gs-add="'+e(item.id)+'" '+(available(item)?'':'disabled')+' aria-label="Add '+e(item.name)+' to cart">'+(available(item)?'Add to cart':'Unavailable')+'</button>';
  const menuGrid = () => {
    let rows = G.menu.filter(i => (controls.category === 'All' || i.category === controls.category) && (i.name+' '+i.description+' '+i.dietary).toLowerCase().includes(controls.query.toLowerCase()));
    return rows.length ? [...new Set(rows.map(i=>i.category))].map(c => '<section class="gs-group"><h2>'+e(c)+'</h2><div class="gs-grid">'+rows.filter(i=>i.category===c).map(i=>'<article class="gs-card">'+photo(i)+'<h3>'+e(i.name)+'</h3><p>'+e(i.description)+'</p><p class="gs-meta">'+e(i.dietary)+'</p><p class="gs-meta">'+(i.available?'Sample availability':'Sample: unavailable')+' · '+e(i.outlets.map(place).join(' & '))+'</p><div class="gs-row"><strong>Sample '+rs(i.price)+'</strong>'+addButton(i)+'</div></article>').join('')+'</div></section>').join('') : '<p>No matching items. Try a different search or category.</p>';
  };
  const menuPage = () => '<span class="gs-upper">The Olympian counter</span><h1>Our menu</h1><p class="gs-intro">Explore the sample menu and build a preview order at your chosen café. Items, prices, dietary details and availability await Greko’s approval.</p>'+demoNotice()+'<div class="gs-toolbar">'+choose()+'<label>Find an item<input type="search" data-gs-search placeholder="Search the menu" value="'+e(controls.query)+'"></label><a href="/greko-espresso-bar/order/" class="gs-action primary" id="gs-cart-count">View cart ('+count()+')</a></div><div class="gs-filters" aria-label="Menu categories">'+['All',...G.categories].map(c=>'<button aria-pressed="'+(controls.category===c)+'" class="'+(controls.category===c?'selected':'')+'" data-gs-category="'+e(c)+'">'+e(c)+'</button>').join('')+'</div><div id="gs-results">'+menuGrid()+'</div>';
  const offerCard = o => '<article class="gs-box gs-offer"><p class="gs-upper">'+status(o)+' · Sample offer</p><h3>'+e(o.name)+'</h3><p>'+e(o.benefit)+'</p><dl><dt>Valid dates</dt><dd>'+e(o.start)+' to '+e(o.end)+'</dd><dt>Outlets</dt><dd>'+e(o.outlets.map(place).join(', '))+'</dd><dt>Eligible items</dt><dd>'+e(o.items.map(id=>G.menu.find(i=>i.id===id)?.name || id).join(', '))+'</dd><dt>Sample minimum</dt><dd>'+rs(o.minimum)+'</dd><dt>Terms</dt><dd>'+e(o.terms)+'</dd></dl><div class="gs-row"><code>'+e(o.code)+'</code><button data-gs-copy="'+e(o.code)+'">Copy code</button><a class="gs-action" href="/greko-espresso-bar/order/" data-gs-try="'+e(o.code)+'">Try in cart</a></div></article>';
  const offersPage = () => '<span class="gs-upper">At the café</span><h1>Offers</h1><p>Explore sample promotions and try their codes in the demo checkout. All benefits and dates are illustrative.</p>'+demoNotice()+['Active','Upcoming','Expired'].map(s=>'<section><h2>'+s+' offers</h2>'+ (G.offers.filter(o=>status(o)===s).map(offerCard).join('') || '<p>No sample offers in this section.</p>')+'</section>').join('');
  const totals = () => '<div class="gs-totals"><p><span>Sample subtotal</span><b>'+rs(subtotal())+'</b></p><p><span>Sample discount</span><b>−'+rs(offerState().discount)+'</b></p><p><strong>Illustrative total</strong><strong>'+rs(subtotal()-offerState().discount)+'</strong></p></div>';
  const itemsList = change => lines().map(i=>'<div class="gs-line"><span>'+e(i.name)+' × '+qty(i)+'</span><div class="gs-row"><span>'+rs(i.price*qty(i))+'</span>'+(change?'<button data-gs-less="'+e(i.id)+'" aria-label="Remove one '+e(i.name)+'">−</button><button data-gs-add="'+e(i.id)+'" aria-label="Add one '+e(i.name)+'">+</button>':'')+'</div></div>').join('');
  const provider = () => {
    const info = Array.isArray(G.outlets)?G.outlets.find(i=>i.id===outlet()):G.outlets?.[outlet()];
    const url = safeUrl(info?.orderUrl || info?.orderLink || info?.orderingLink);
    return url?'<a href="'+url+'" target="_blank" rel="noopener" data-gs-provider>Open '+place(outlet())+' ordering provider ↗</a>':'<p class="gs-muted">External ordering for '+place(outlet())+' awaits an approved provider link.</p>';
  };
  const orderPage = () => {
    if (controls.stage==='done' && controls.result?.outlet!==outlet()) controls.stage='cart';
    if (controls.stage==='done' && controls.result) return '<h1>Order preview</h1>'+demoNotice()+'<div class="gs-box"><h2>'+place(controls.result.outlet)+'</h2><p>Sample pickup · '+e(controls.result.alias)+'</p>'+controls.result.summary+'<p>Payment collected: ₹0. This preview has not been sent to the café.</p></div><button class="primary" data-gs-restart>Back to menu</button>';
    if (controls.stage==='checkout' && count()) return '<h1>Demo checkout</h1>'+demoNotice()+'<h2>'+place(outlet())+' pickup</h2>'+itemsList(false)+totals()+'<form class="gs-box gs-check" data-gs-finish><label>Pickup alias (sample only)<input name="alias" required maxlength="60" value="Demo guest"></label><label>Payment preview<select name="payment"><option>Simulated pay at pickup · ₹0 charged</option></select></label><p>Completing this step shows a sample order summary. No payment details are required.</p><div class="gs-row"><button type="button" data-gs-back>Edit cart</button><button class="primary">Complete order preview</button></div></form>';
    return '<h1>Your cart</h1>'+demoNotice()+'<div class="gs-toolbar">'+choose()+'</div><h2>'+place(outlet())+' pickup</h2>'+(count()? itemsList(true):'<div class="gs-box"><p>Your cart for this outlet is empty.</p><a class="gs-action" href="/greko-espresso-bar/menu/">Explore the menu</a></div>')+'<form class="gs-toolbar" data-gs-apply><label>Offer code<input name="code" maxlength="60" value="'+e(cart().code)+'" placeholder="Enter a sample code"></label><button>Apply code</button><a href="/greko-espresso-bar/offers/">Browse sample offers</a></form><p role="status">'+e(offerState().text)+'</p>'+totals()+'<div class="gs-toolbar"><a class="gs-action" href="/greko-espresso-bar/menu/">Continue browsing</a><button class="primary" data-gs-check '+(count()?'':'disabled')+'>Continue to checkout</button></div>'+provider();
  };
  window.shopPage = route => css+'<section class="gs">'+(route.startsWith('/offers')?offersPage():route.startsWith('/order')?orderPage():menuPage())+'</section>';
  document.addEventListener('input',ev=>{if(ev.target.matches('[data-gs-search]')){controls.query=ev.target.value; document.querySelector('#gs-results').innerHTML=menuGrid();}});
  document.addEventListener('change',ev=>{if(ev.target.matches('[data-gs-outlet]')){controls.stage='cart';selectOutlet(ev.target.value);render();}});
  document.addEventListener('click',async ev=>{
    const el=ev.target.closest('[data-gs-add],[data-gs-less],[data-gs-category],[data-gs-copy],[data-gs-try],[data-gs-check],[data-gs-back],[data-gs-restart],[data-gs-feature],[data-gs-provider]');
    if (!el) return;
    const d=el.dataset;
    if ('gsProvider' in d) {track('order_click');return;}
    ev.preventDefault();ev.stopPropagation();
    if ('gsFeature' in d) {controls.query=d.gsFeature;controls.category='All';go('/menu/');return;}
    if ('gsCopy' in d) {
      try {await navigator.clipboard.writeText(d.gsCopy);notice('Copied '+d.gsCopy);}
      catch {notice('Copy this code: '+d.gsCopy);}
      return;
    }
    if ('gsTry' in d) {cart().code=d.gsTry;persist();controls.stage='cart';track('offer_code_use');go('/order/');return;}
    if ('gsRestart' in d) {controls.stage='cart';go('/menu/');return;}
    if ('gsCategory' in d) {controls.category=d.gsCategory;render();document.querySelector('.gs-filters .selected')?.focus();return;}
    if ('gsCheck' in d) {controls.stage='checkout';track('order_click');render();return;}
    if ('gsBack' in d) {controls.stage='cart';render();return;}
    const id=d.gsAdd || d.gsLess;
    const item=G.menu.find(i=>i.id===id);
    if (!item || !available(item)) return;
    controls.stage='cart';cart().items[id]=Math.max(0,Math.min(99,qty(item)+('gsAdd' in d?1:-1)));persist();
    const counter=document.querySelector('#gs-cart-count');
    if(counter){counter.textContent='View cart ('+count()+')';notice(item.name+' · '+qty(item)+' in cart');}
    else {render();const btn=[...document.querySelectorAll('[data-gs-add],[data-gs-less]')].find(x=>x.dataset.gsAdd===d.gsAdd && x.dataset.gsLess===d.gsLess);btn?.focus();}
  },true);
  document.addEventListener('submit', ev=>{
    const form=ev.target;
    if (form.matches('[data-gs-apply]')) {ev.preventDefault();cart().code=new FormData(form).get('code').trim().toUpperCase();persist();track('offer_code_use');render();notice(offerState().text || 'Code cleared.');}
    if (form.matches('[data-gs-finish]')) {ev.preventDefault();if(!count())return;controls.result={outlet:outlet(),alias:new FormData(form).get('alias'),summary:itemsList(false)+totals()};carts[outlet()]={items:{},code:''};persist();controls.stage='done';render();}
  });
})();
