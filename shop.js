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
      makeItem('flat-white', 'Flat white', 'Coffee', 'A double espresso folded into silky steamed milk.', 220, 'Contains milk', 'flat-white'),
      makeItem('focaccia', 'Demeter garden focaccia', 'Food', 'A nod to the goddess of harvest: roasted vegetables, basil and olive oil on focaccia.', 310, 'Vegetarian · Contains wheat', 'food'),
      makeItem('tiramisu', 'Classic tiramisu', 'Desserts', 'Espresso-soaked sponge layered with mascarpone and cocoa.', 260, 'Contains egg, milk and wheat', 'dessert'),
      makeItem('espresso', 'Zeus double espresso', 'Coffee', 'Two short shots with a thunderbolt of coffee flavour.', 150, 'Plant-based', 'coffee'),
      makeItem('cooler', 'Poseidon citrus cooler', 'Other drinks', 'Sparkling citrus over ice, finished with fresh mint.', 180, 'Plant-based', 'citrus'),
      makeItem('iced-latte', 'Iced latte', 'Coffee', 'Espresso poured over chilled milk and ice.', 240, 'Contains milk', 'drink', [east]),
      makeItem('croissant', 'Butter croissant', 'Food', 'Golden, flaky pastry with a soft butter centre.', 190, 'Contains wheat and milk', 'croissant', [model]),
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
  const safeUrl = (value, photo = false) => {
    if (!value) return '';
    try {
      const url = new URL(value, location.origin);
      if (url.protocol === 'https:' || (photo && url.origin === location.origin)) return e(url.href);
    } catch {}
    return '';
  };
  const demoNotice = () => '<p class="gs-demo">Demo preview — no booking or order has been placed.</p>';
  const controls = {query:'', category:'All'};
  const record = value => value && typeof value === 'object' && !Array.isArray(value);
  const readCarts = () => {
    try {
      const data = JSON.parse(sessionStorage.getItem('greko-preview-carts'));
      return record(data) ? data : {};
    } catch { return {}; }
  };
  let carts = readCarts();
  const cart = () => {
    const id = outlet();
    if (!record(carts[id])) carts[id] = {};
    const current = carts[id];
    if (!record(current.items)) current.items = {};
    if (typeof current.code !== 'string') current.code = '';
    return current;
  };
  const persist = () => {
    try {sessionStorage.setItem('greko-preview-carts', JSON.stringify(carts));}
    catch {notice('This cart is available until you leave this page.');}
  };
  const available = item => item.available === true && item.outlets.includes(outlet());
  const qty = item => Math.min(99,Math.max(0,Math.floor(Number(cart().items[item.id]) || 0)));
  const lines = () => G.menu.filter(item => available(item) && qty(item) > 0);
  function reconcileCart(){
    const current = cart();
    let removed = false;
    for(const id of Object.keys(current.items)){
      const item = G.menu.find(entry=>entry.id===id && available(entry));
      if(!item || !qty(item)){
        delete current.items[id];
        removed = true;
      }
    }
    if(removed) persist();
    return removed;
  }
  // Each browser history entry owns its checkout step. Opening Order again starts
  // at the current outlet’s cart, while Back can return to a previous receipt.
  const stage = () => history.state?.grekoOrder?.outlet === outlet() ? history.state.grekoOrder : {};
  function setStage(step, receipt){
    history.replaceState({...history.state,grekoOrder:{outlet:outlet(),step,receipt}},'');
  }
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
  #main .gs{--navy:#19384f;--brass:#895e28;--line:#c8b99e;--cream:#fff9ed;color:var(--navy);width:min(1240px,100%);padding:clamp(25px,4vw,62px) clamp(18px,5vw,68px) clamp(45px,6vw,90px);margin:auto}
  .gs h1,.gs h2,.gs h3{font:normal 38px/1.07 Georgia,serif;letter-spacing:-.045em;margin:0}
  .gs h1{font-size:clamp(44px,6.7vw,87px);max-width:13ch}.gs h2{font-size:clamp(27px,3.4vw,44px)}.gs h3{font-size:clamp(23px,2.4vw,32px)}
  .gs p{line-height:1.6}.gs-upper,.gs-feat .gs-upper{font-size:.7rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#805323}
  .gs-hero{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(200px,.9fr);align-items:center;gap:clamp(20px,4vw,65px);padding-bottom:26px;border-bottom:3px double var(--brass)}
  .gs-hero h1,.gs-heading h1{margin:.14em 0 .18em}.gs-lead{max-width:53ch}.gs-hero figure{margin:0;overflow:hidden;position:relative;background:var(--navy);height:clamp(210px,22vw,300px);border-radius:120px 120px 4px 4px}
  .gs-hero figure:not(.gs-coin){height:auto;aspect-ratio:16/9;border-radius:3px;align-self:center;width:100%}.gs-hero figure img{width:100%;height:100%;object-fit:cover}.gs-hero .gs-coin img{object-fit:contain;padding:20px;transform:rotate(-9deg)}
  #main .gs .gs-demo{display:block;color:#605541;font-size:.83rem;background:none;border:0;padding:0;margin:14px 0 0}
  .gs-toolbar,.gs-row,.gs-filters,.gs-actions{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.gs-toolbar{align-items:end;margin:28px 0 14px}
  .gs-toolbar label,.gs-check label,.gs label{display:grid;gap:5px;font-size:.86rem;font-weight:650}.gs input,.gs select{line-height:1.4;font-family:inherit;font-size:1rem;font-weight:400;color:var(--navy);min-width:0;width:100%;min-height:46px;padding:10px 13px;border:1px solid #998a73;background:#fffdf6;border-radius:4px}
  .gs-toolbar label:first-child{min-width:180px}.gs-toolbar label:nth-child(2){flex:1}.gs button,.gs-action{font:inherit;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;line-height:1.3;padding:10px 15px;border:1px solid #a09279;background:transparent;color:var(--navy);text-decoration:none;font-size:.9rem;font-weight:650}
  .gs button:disabled{cursor:default}.gs button:hover:not(:disabled),.gs-action:hover{background:#e9dec9}.gs button.primary,.gs .primary,.gs button.selected{color:#fffaf1;background:var(--navy);border-color:var(--navy)}.gs button.primary:hover,.gs .primary:hover,.gs button.selected:hover{background:#315774}
  .gs :focus-visible,.gs-feat a:focus-visible{outline:3px solid #aa6d22;outline-offset:3px}.gs-filters{gap:7px}.gs-filters button{border-radius:32px!important}
  .gs-group{margin:36px 0}.gs-group>h2,.gs-offers-group>h2{border-bottom:1px solid var(--line);padding-bottom:10px;margin-bottom:14px}
  .gs-grid,.gs-offers-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}.gs-feat{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}.gs-feat a{color:inherit;text-decoration:none}.gs-feat img{width:100%;object-fit:cover}.gs-feat h3{margin:0}
  #main .gs .gs-card{display:grid;grid-template-columns:minmax(0,38fr) minmax(0,62fr);gap:clamp(12px,1.4vw,21px);align-items:start;padding:15px;border:1px solid var(--line);background:#fffaf0}.gs-card img{align-self:center;width:100%;height:auto;aspect-ratio:6/5;object-fit:cover;border-radius:2px}.gs-card h3{margin:1px 0 7px}.gs-card p{font-size:.91rem;line-height:1.46}.gs-card .gs-meta{margin-top:8px;color:#5c594f;font-size:.78rem}
  .gs-card .gs-row{gap:8px;margin-top:15px;justify-content:space-between}.gs-price{font-variant-numeric:tabular-nums}.gs-empty{border:1px dashed var(--line);margin:16px 0;padding:24px;display:grid;justify-items:start;gap:12px}
  .gs-offers-group{margin:32px 0}.gs-offer,.gs-sheet{border:1px solid var(--line);background:#fffaf0;padding:clamp(17px,2.5vw,30px)}.gs-offer{border-top:4px solid var(--brass)}.gs-offer h3{margin:8px 0}.gs-offer details{margin:18px 0}.gs-offer summary{font-weight:650;cursor:pointer;text-decoration:underline;text-underline-offset:3px}.gs-offer dl{display:grid;grid-template-columns:auto 1fr;gap:7px 14px;margin-bottom:18px;font-size:.9rem}.gs-offer dd{margin:0}.gs-offer dt{font-weight:650}.gs-offer code{font-size:1rem;letter-spacing:.09em}.gs-offer .gs-row{padding-top:14px;border-top:1px dashed var(--line)}
  .gs-heading{margin-bottom:22px}.gs-layout{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(255px,.8fr);align-items:start;gap:clamp(15px,3vw,40px)}.gs-sheet h2,.gs-total-panel h2{font-size:clamp(25px,2.5vw,34px);margin-bottom:15px}.gs-sheet+.gs-sheet{margin-top:14px}.gs-line,.gs-totals p{display:flex;justify-content:space-between;align-items:center;gap:15px;padding:14px 0;border-bottom:1px solid var(--line)}.gs-line strong,.gs-line small{display:block}.gs-line small{color:#5e5d58}
  .gs-line .gs-row{gap:5px}.gs-totals p{margin:0}.gs-line button{min-width:44px}.gs-total-panel{color:#fff9e9;background:var(--navy);padding:clamp(20px,3vw,35px);border-top:4px solid #b79154}.gs-total-panel h2,.gs-total-panel p{color:inherit}.gs-total-panel .gs-row{margin-top:18px}.gs-total-panel button.primary{background:#f6e5bc;border-color:#f6e5bc;color:var(--navy)}.gs-total-panel button.primary:hover{background:#fff1d1}.gs-total-panel .gs-totals p{border-color:#70808a}.gs-check,.gs-code{display:grid;gap:13px}.gs-code .gs-row{align-items:end}.gs-code label{flex:1;min-width:130px}.gs-feedback{margin:10px 0;color:#654425}.gs-muted{color:#5e5c54;font-size:.87rem}.gs-follow{margin-top:18px}.gs a:not(.gs-action){text-underline-offset:3px}
  @media(max-width:850px){#main .gs .gs-card{grid-template-columns:1fr}.gs-hero figure{height:225px}.gs-layout{grid-template-columns:minmax(0,1fr) minmax(235px,.8fr)}}
  @media(max-width:650px){.gs-hero,.gs-layout{grid-template-columns:minmax(0,1fr)}.gs-hero{gap:15px}.gs-hero figure{height:135px;border-radius:55px 3px 3px 3px}.gs-hero .gs-coin{display:none}.gs-toolbar{gap:10px;align-items:stretch}.gs-toolbar label:first-child,.gs-toolbar label:nth-child(2){min-width:0;flex:1 1 40%}.gs-toolbar .gs-action{flex-basis:100%}.gs-grid,.gs-offers-grid{grid-template-columns:1fr}#main .gs .gs-card{grid-template-columns:minmax(0,36fr) minmax(0,64fr)}.gs-line{flex-wrap:wrap}.gs-feat{grid-template-columns:1fr}.gs-offer dl{grid-template-columns:auto minmax(0,1fr)}}
  @media(max-width:360px){.gs-toolbar label:first-child,.gs-toolbar label:nth-child(2){flex-basis:100%}.gs-card .gs-row>*{width:100%}}
  </style>`;
  const photo = item => '<img src="'+safeUrl(item.photo,true)+'" alt="'+e(item.alt)+'" loading="lazy">';
  const href = route => e(siteHref(route));
  const browse = (label, route='/menu/') => '<a class="gs-action" href="'+href(route)+'">'+label+'</a>';
  window.featured = () => {
    const picks=['espresso','focaccia','cooler'].map(id=>G.menu.find(i=>i.id===id)).filter(Boolean);
    return css+'<div class="gs-feat">'+[...new Set([...picks,...G.menu])].slice(0,3).map(i=>'<a href="'+href('/menu/')+'" data-gs-feature="'+e(i.name)+'">'+photo(i)+'<p class="gs-upper">'+e(i.category)+'</p><h3>'+e(i.name)+'</h3></a>').join('')+'</div>';
  };
  const choose = () => '<label>Pickup outlet<select data-gs-outlet>'+both.map(id => '<option value="'+id+'" '+(id===outlet()?'selected':'')+'>'+place(id)+'</option>').join('')+'</select></label>';
  const hero = (kicker,title,lead,art,alt,coin=false) => '<header class="gs-hero"><div><span class="gs-upper">'+kicker+'</span><h1>'+title+'</h1><p class="gs-lead">'+lead+'</p>'+demoNotice()+'</div><figure class="'+(coin?'gs-coin':'')+'"><img src="'+safeUrl(art,true)+'" alt="'+e(alt)+'"></figure></header>';
  function menuCard(item){
    const canAdd = available(item);
    return '<article class="gs-card">'+photo(item)+'<div><h3>'+e(item.name)+'</h3><p>'+e(item.description)+'</p><p class="gs-meta">'+e(item.dietary)+'<br>'+e(item.outlets.map(place).join(' · '))+'</p><div class="gs-row"><strong class="gs-price">'+rs(item.price)+'</strong><button data-gs-add="'+e(item.id)+'" '+(canAdd?'class="primary"':'disabled')+' aria-label="'+e(canAdd?'Add '+item.name+' to cart':item.name+' unavailable')+'">'+(canAdd?'Add to cart':'Unavailable')+'</button></div></div></article>';
  }
  const menuGrid = () => {
    const rows=G.menu.filter(i=>(controls.category==='All'||i.category===controls.category) && (i.name+' '+i.description+' '+i.dietary).toLowerCase().includes(controls.query.trim().toLowerCase()));
    const groups=[...new Set([...G.categories,...rows.map(i=>i.category)])];
    return rows.length?groups.filter(c=>rows.some(i=>i.category===c)).map(c=>'<section class="gs-group"><h2>'+e(c)+'</h2><div class="gs-grid">'+rows.filter(i=>i.category===c).map(menuCard).join('')+'</div></section>').join(''):'<div class="gs-empty"><p>No items match these filters.</p><button data-gs-reset>Show the full menu</button></div>';
  };
  function menuPage(){
    if (!G.categories.includes(controls.category)) controls.category='All';
    const cover=G.menu.find(i=>i.id==='flat-white') || G.menu[0];
    const top=hero('Coffee &amp; kitchen','The Olympian menu','Choose your café and browse the sample dishes. All prices, ingredients and availability are illustrative.',cover?.photo || siteHref('/images/coffee.jpg'),cover?.alt || 'Sample coffee photography');
    return top+'<div class="gs-toolbar">'+choose()+'<label>Search the menu<input type="search" data-gs-search placeholder="Coffee, focaccia, citrus…" value="'+e(controls.query)+'"></label><a href="'+href('/order/')+'" class="gs-action primary" id="gs-cart-count">View cart ('+count()+')</a></div><div class="gs-filters" role="group" aria-label="Menu categories">'+['All',...G.categories].map(c=>'<button aria-pressed="'+(controls.category===c)+'" class="'+(controls.category===c?'selected':'')+'" data-gs-category="'+e(c)+'">'+e(c)+'</button>').join('')+'</div><div id="gs-results">'+menuGrid()+'</div>';
  }
  const offerCard = o => '<article class="gs-offer"><span class="gs-upper">Sample offer</span><h3>'+e(o.name)+'</h3><p>'+e(o.benefit)+'</p><details><summary>Dates, eligibility and terms</summary><dl><dt>Valid dates</dt><dd>'+e(o.start)+' to '+e(o.end)+'</dd><dt>Outlets</dt><dd>'+e(o.outlets.map(place).join(', '))+'</dd><dt>Eligible items</dt><dd>'+e(o.items.map(id=>G.menu.find(i=>i.id===id)?.name || id).join(', '))+'</dd><dt>Minimum</dt><dd>'+rs(o.minimum)+'</dd><dt>Terms</dt><dd>'+e(o.terms)+'</dd></dl></details><div class="gs-row"><code>'+e(o.code)+'</code><button data-gs-copy="'+e(o.code)+'" aria-label="Copy code '+e(o.code)+'">Copy</button><a class="gs-action" href="'+href('/order/')+'" data-gs-try="'+e(o.code)+'">Try in cart</a></div></article>';
  const offersPage = () => hero('From the counter','Café offers','Explore sample offers, check their terms and try a code on your preview order.',siteHref('/images/owl-coin.webp'),'Owl on the reverse of an Athenian coin',true)+['Active','Upcoming','Expired'].map(s=>'<section class="gs-offers-group"><h2>'+s+' offers</h2><div class="gs-offers-grid">'+ (G.offers.filter(o=>status(o)===s).map(offerCard).join('') || '<p>No '+s.toLowerCase()+' sample offers.</p>')+'</div></section>').join('');
  const getReceipt = () => {
    const offer=offerState();
    return {items:lines().map(i=>({name:i.name,qty:qty(i),price:i.price})),subtotal:subtotal(),discount:offer.discount,code:offer.ok?cart().code:'',total:subtotal()-offer.discount};
  };
  const totals = bill => '<div class="gs-totals"><p><span>Sample subtotal</span><strong>'+rs(bill.subtotal)+'</strong></p><p><span>Sample discount '+e(bill.code)+'</span><strong>−'+rs(bill.discount)+'</strong></p><p><strong>Illustrative total</strong><strong>'+rs(bill.total)+'</strong></p></div>';
  const receiptLines = bill => bill.items.map(i=>'<div class="gs-line"><span>'+e(i.name)+' × '+e(i.qty)+'</span><strong>'+rs(i.qty*i.price)+'</strong></div>').join('');
  const itemsList = () => lines().map(i=>'<div class="gs-line"><div><strong>'+e(i.name)+'</strong><small>'+rs(i.price)+' each · '+rs(i.price*qty(i))+'</small></div><div class="gs-row"><button data-gs-less="'+e(i.id)+'" aria-label="Remove one '+e(i.name)+'">−</button><span aria-label="Quantity">'+qty(i)+'</span><button data-gs-add="'+e(i.id)+'" '+(qty(i)>=99?'disabled':'')+' aria-label="Add one '+e(i.name)+'">+</button></div></div>').join('');
  const provider = () => {
    const info = G.outlets.find(i=>i.id===outlet());
    const url=safeUrl(info?.orderUrl);
    return url?'<a href="'+url+'" target="_blank" rel="noopener" data-gs-provider>Open '+place(outlet())+' ordering provider ↗</a>':'<p class="gs-muted">External ordering for '+place(outlet())+' awaits an approved provider link.</p>';
  };
  const heading=title=>'<header class="gs-heading"><span class="gs-upper">'+place(outlet())+' · Pickup</span><h1 tabindex="-1">'+title+'</h1>'+demoNotice()+'</header>';
  function orderPage(removed){
    const step=stage();
    if(step.step==='done' && step.receipt){
      const receipt=step.receipt;
      return heading('Order preview')+'<div class="gs-layout"><section class="gs-sheet"><h2>Pickup summary</h2><p>Sample guest · '+e(receipt.alias)+'</p>'+receiptLines(receipt)+'<p class="gs-follow">Payment collected: ₹0. This preview stays in your browser.</p></section><aside class="gs-total-panel"><h2>Preview total</h2>'+totals(receipt)+'<div class="gs-row"><button class="primary" data-gs-restart>Back to menu</button></div></aside></div>';
    }
    const bill=getReceipt();
    if(step.step==='checkout' && count()){
      return heading('Demo checkout')+'<div class="gs-layout"><form class="gs-sheet gs-check" data-gs-finish><h2>Pickup details</h2><label>Pickup alias (sample only)<input name="alias" required maxlength="60" value="Demo guest"></label><label>Payment preview<select name="payment"><option>Simulated pay at pickup · ₹0 charged</option></select></label><p class="gs-muted">Complete this step to see a sample receipt. No payment details are required.</p><div class="gs-actions"><button type="button" data-gs-back>Edit cart</button><button class="primary">Complete order preview</button></div></form><aside class="gs-total-panel"><h2>Your pickup</h2>'+receiptLines(bill)+totals(bill)+'</aside></div>';
    }
    const feedback=offerState();
    const cartRows=count()?itemsList():'<div class="gs-empty"><p>Your cart for this outlet is empty.</p>'+browse('Explore the menu')+'</div>';
    const offers='<form class="gs-code" data-gs-apply><div class="gs-row"><label>Offer code<input name="code" aria-describedby="gs-code-feedback" maxlength="60" value="'+e(cart().code)+'" placeholder="Enter a sample code"></label><button>Apply code</button></div><a href="'+href('/offers/')+'">Browse sample offers</a></form><p class="gs-feedback" id="gs-code-feedback" role="status">'+e(feedback.text)+'</p>';
    return heading('Your cart')+'<div class="gs-layout"><div><section class="gs-sheet">'+choose()+(removed?'<p role="status">Items no longer available at this outlet were removed.</p>':'')+cartRows+(count()?'<div class="gs-follow">'+browse('Continue browsing')+'</div>':'')+'</section><section class="gs-sheet">'+offers+'</section></div><aside class="gs-total-panel"><h2>Order summary</h2>'+totals(bill)+'<div class="gs-row"><button class="primary" data-gs-check '+(count()?'':'disabled')+'>Continue to checkout</button></div></aside></div><div class="gs-follow">'+provider()+'</div>';
  }
  window.shopPage = route => {
    const removed=reconcileCart();
    return css+'<section class="gs">'+(route.startsWith('/offers')?offersPage():route.startsWith('/order')?orderPage(removed):menuPage())+'</section>';
  };
  const focusHeading=()=>document.querySelector('.gs-heading h1')?.focus();
  document.addEventListener('input',ev=>{
    if(ev.target.matches('[data-gs-search]')){
      controls.query=ev.target.value;
      document.querySelector('#gs-results').innerHTML=menuGrid();
    }
  });
  document.addEventListener('change',ev=>{
    if(ev.target.matches('[data-gs-outlet]')){
      selectOutlet(ev.target.value);
      setStage('cart');
      render();
      document.querySelector('[data-gs-outlet]')?.focus();
      notice('Pickup outlet: '+place(outlet())+'.');
    }
  });
  document.addEventListener('click',async ev=>{
    const el=ev.target.closest('[data-gs-add],[data-gs-less],[data-gs-category],[data-gs-copy],[data-gs-try],[data-gs-check],[data-gs-back],[data-gs-restart],[data-gs-feature],[data-gs-provider],[data-gs-reset]');
    if (!el || ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey) return;
    const d=el.dataset;
    if ('gsProvider' in d) {track('order_click');return;}
    ev.preventDefault();ev.stopPropagation();
    if ('gsFeature' in d) {controls.query=d.gsFeature;controls.category='All';go('/menu/');return;}
    if ('gsCopy' in d) {
      try {await navigator.clipboard.writeText(d.gsCopy);notice('Copied '+d.gsCopy);}
      catch {notice('Copy this code: '+d.gsCopy);}
      return;
    }
    if ('gsTry' in d) {cart().code=d.gsTry;persist();track('offer_code_use');go('/order/');return;}
    if ('gsRestart' in d) {controls.query='';controls.category='All';go('/menu/');return;}
    if ('gsReset' in d) {controls.query='';controls.category='All';render();document.querySelector('[data-gs-search]')?.focus();return;}
    if ('gsCategory' in d) {controls.category=d.gsCategory;render();document.querySelector('.gs-filters .selected')?.focus();return;}
    if ('gsCheck' in d || 'gsBack' in d) {setStage('gsCheck' in d?'checkout':'cart');render();focusHeading();return;}
    const id=d.gsAdd || d.gsLess;
    const item=G.menu.find(i=>i.id===id);
    if (!item || !available(item)) return;
    const next=Math.max(0,Math.min(99,qty(item)+('gsAdd' in d?1:-1)));
    if(next) cart().items[id]=next;
    else delete cart().items[id];
    persist();
    const counter=document.querySelector('#gs-cart-count');
    if(counter){counter.textContent='View cart ('+count()+')';notice(item.name+' · '+qty(item)+' in cart');}
    else {
      render();
      const btn=[...document.querySelectorAll('[data-gs-add],[data-gs-less]')].find(x=>x.dataset.gsAdd===d.gsAdd && x.dataset.gsLess===d.gsLess && !x.disabled);
      (btn || document.querySelector('[data-gs-outlet]'))?.focus();
      notice(next?item.name+' · '+next+' in cart':item.name+' removed.');
    }
  },true);
  document.addEventListener('submit',ev=>{
    const form=ev.target;
    if(form.matches('[data-gs-apply]')){
      ev.preventDefault();cart().code=new FormData(form).get('code').trim().toUpperCase();persist();track('offer_code_use');render();
      document.querySelector('[data-gs-apply] input')?.focus();
      notice(offerState().text || 'Code cleared.');
    }
    if(form.matches('[data-gs-finish]')){
      ev.preventDefault();
      if(!count() || stage().step!=='checkout') return;
      const alias=new FormData(form).get('alias').trim();
      if(!alias){form.elements.alias.value='';form.elements.alias.reportValidity();return;}
      setStage('done',{...getReceipt(),alias});
      carts[outlet()]={items:{},code:''};persist();render();focusHeading();
    }
  });
})();
