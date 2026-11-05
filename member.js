(() => {
  'use strict';

  window.memberSeed = {
    tiers: [
      {name: 'Regular', description: 'Start here and collect points with each qualifying visit.', threshold: 0},
      {name: 'House Guest', description: 'Reach this tier to explore additional member rewards.', threshold: 250},
    ],
    rewards: [
      {name: 'A classic espresso', description: 'A classic cup from the bar at either café.', points: 100},
      {name: 'Birthday dessert', description: 'A birthday-month treat after a qualifying visit.', points: 200},
    ],
  };

  const sessionKey = 'greko-member-session';
  const savedKey = 'greko-demo-profile';
  let view = 'intro';

  function read(key) {
    try { return JSON.parse(sessionStorage.getItem(key)); }
    catch { return null; }
  }

  function intro() {
    const tiers = G.tiers.map(tier => `<article><small>From ${esc(tier.threshold)} sample points</small><h3>${esc(tier.name)}</h3><p>${esc(tier.description)}</p></article>`).join('');
    const rewards = G.rewards.map(reward => `<article><small>${esc(reward.points)} sample points</small><h3>${esc(reward.name)}</h3><p>${esc(reward.description)}</p></article>`).join('');
    return `<div class="member-lead"><div><small>Membership preview</small><h1>The <em>Laurel</em> Club</h1><p>A club for familiar faces at the coffee counter. Explore sample points, birthday treats and rewards for your next visit.</p>
      <div class="member-actions"><button type="button" data-member="signup">Try demo sign-up</button><button class="secondary" type="button" data-member="signin">Demo sign-in</button></div></div>
      <figure><img src="/greko-espresso-bar/images/drink.jpg" alt="Milk swirling into a glass of iced coffee, sample photography"><figcaption>From the espresso bar</figcaption></figure></div>
      <section><h2>Membership tiers</h2><p>In this example, each qualifying visit earns 25 points. Joining is optional for browsing, ordering and booking.</p><div class="member-grid">${tiers}</div></section>
      <section><h2>Sample rewards</h2><div class="member-grid">${rewards}</div></section>
      <details><summary>Membership terms for this preview</summary><p>The client will approve earning rates, eligible purchases, birthday eligibility, expiry, redemption rules and privacy terms before launch. All balances and rewards shown here are sample data with no cash value.</p></details>`;
  }

  function accountForm(signup) {
    const saved = read(savedKey);
    return `<button class="secondary" type="button" data-member="intro">← Membership</button><section><small>Sample account</small><h1>${signup ? 'Join the club' : 'Welcome back'}</h1>
      <p>${signup ? 'Choose a fictional display name and a favourite outlet for your sample profile.' : 'Choose a sample profile to explore its dashboard.'} This demo lasts for this browser tab.</p>
      <form id="greko-member-form" class="member-form" data-mode="${signup ? 'signup' : 'signin'}">
      ${signup ? `<label>Demo display name<select name="alias"><option>Coffee Guest</option><option>Weekend Guest</option><option>Morning Guest</option></select></label>
      <label>Favourite outlet<select name="favourite">${G.outlets.map(o=>'<option>'+esc(o.name)+'</option>').join('')}</select></label>
      <label><input type="checkbox" required> I understand that this profile and its rewards are for demonstration.</label>`
      : `<label>Demo profile<select name="profile">${saved ? '<option value="saved">My demo profile</option>' : ''}<option value="guest">Returning guest · 150 sample points</option></select></label>`}
      <button type="submit">${signup ? 'Create demo profile' : 'Sign in to demo'}</button></form></section>`;
  }

  function dashboard(profile) {
    const tiers = [...G.tiers].sort((a,b) => Number(b.threshold)-Number(a.threshold));
    const tier = tiers.find(t => Number(t.threshold) <= profile.points);
    return `<small>Member dashboard · Preview data</small><h1>Hello, <em>${esc(profile.alias)}</em>.</h1>
      <div class="member-grid"><article><small>Sample balance</small><h2>${esc(profile.points)} points</h2><p>${esc(tier?.name || 'Guest')} member</p></article>
      <article><small>Your profile</small><h2>${esc(profile.favourite)}</h2><p>Favourite café outlet</p></article></div>
      <section><h2>Rewards</h2><div class="member-grid">${G.rewards.map(r => `<article><small>${Number(r.points) <= profile.points ? 'Available in preview' : esc(Math.max(0,Number(r.points)-profile.points))+' more sample points needed'}</small><h3>${esc(r.name)}</h3><p>${esc(r.description)} · ${esc(r.points)} points</p></article>`).join('')}</div></section>
      <section><h2>Offer history</h2><p>${profile.returning ? 'Welcome visit · Example member offer used on a past sample visit.' : 'Your new demo profile has no offer history yet.'}</p></section>
      <button class="secondary" type="button" data-member="signout">Sign out of demo</button>`;
  }

  window.memberPage = () => {
    const profile = read(sessionKey);
    return `<div class="member-wrap"><style>
      .member-wrap{--navy:#182f45;--brass:#826434;--line:#c7b99e;max-width:1320px;margin:auto;padding:clamp(26px,4vw,60px) 6%;color:var(--navy)}
      .member-wrap section{margin:clamp(34px,5vw,70px) 0}.member-wrap h1,.member-wrap h2,.member-wrap h3{margin:.35em 0}
      #main .member-wrap :is(h1,h2,h3){font-family:Georgia,serif;font-weight:400;letter-spacing:-.045em;line-height:1.05}
      #main .member-wrap h1{font-size:clamp(45px,6.3vw,94px);border:0}#main .member-wrap h2{font-size:clamp(31px,3.6vw,50px)}#main .member-wrap h3{font-size:clamp(25px,2.8vw,37px)}
      .member-wrap p{max-width:62ch;line-height:1.65}.member-wrap small{font:700 .7rem/1.5 system-ui;letter-spacing:.14em;color:var(--brass);text-transform:uppercase}
      .member-lead{display:grid;grid-template-columns:1.1fr 1fr;background:var(--navy);color:#fff6e8;align-items:stretch;border-bottom:4px solid #b2925b}
      .member-lead>div{padding:clamp(24px,4vw,58px);align-self:center}.member-lead small,.member-lead em{color:#eed8ad}#main .member-wrap .member-lead h1{color:#fff6e8}
      .member-lead figure{position:relative;min-height:270px;margin:0;overflow:hidden}.member-lead img{width:100%;height:100%;position:absolute;object-fit:cover;object-position:50% 55%}.member-lead figcaption{position:absolute;bottom:0;right:0;color:#fff6e8;background:#142b3f;padding:8px 14px;font:italic 14px Georgia}
      .member-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;margin-top:20px}
      #main .member-wrap .member-grid article{padding:22px 0;border:0;border-top:1px solid var(--brass);background:transparent;border-radius:0}
      .member-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}.member-wrap button{cursor:pointer;border:1px solid var(--navy);background:var(--navy);color:#fff6e8;padding:12px 18px;border-radius:3px;font:600 .9rem/1.4 system-ui;min-height:44px}
      .member-wrap button.secondary{background:transparent;color:var(--navy)}.member-lead button{background:#efdbb4;color:var(--navy);border-color:#efdbb4}.member-lead button.secondary{color:#fff6e8;border-color:#b7ad9b}.member-wrap button:hover{filter:brightness(.9)}
      .member-form{max-width:510px;display:grid;gap:18px;margin:24px 0;padding:clamp(20px,3vw,32px);background:#f4ead6;border:1px solid var(--line)}.member-form label{display:block}.member-form select{display:block;width:100%;padding:.75rem;font:inherit;margin-top:.4rem;color:var(--navy);background:#fffbf2;border:1px solid #a59985;border-radius:2px}.member-form input[type=checkbox]{display:inline;width:auto;accent-color:var(--navy)}
      .member-wrap details{padding:15px 0;border-block:1px solid var(--line)}.member-wrap summary{cursor:pointer;font-weight:600}.member-wrap details p{margin-top:8px}.member-demo{margin-top:24px;font-size:.84rem}
      @media(max-width:680px){.member-lead,.member-grid{grid-template-columns:1fr}.member-lead figure{min-height:170px;max-height:200px}.member-wrap .member-grid{gap:0}.member-wrap section{margin:32px 0}.member-wrap .member-grid article{padding:15px 0}}
      </style>${profile ? dashboard(profile) : view === 'signin' || view === 'signup' ? accountForm(view === 'signup') : intro()}
      <p class="member-demo">Demo preview — no booking or order has been placed.</p></div>`;
  };

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-member]');
    if (!button) return;
    view = button.dataset.member;
    if (view === 'signout') { sessionStorage.removeItem(sessionKey); view = 'intro'; }
    render();
    document.querySelector('#main').focus({preventScroll:true});
    window.scrollTo(0, 0);
  });

  document.addEventListener('submit', event => {
    if (event.target.id !== 'greko-member-form') return;
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    let profile;
    if (form.dataset.mode === 'signup') {
      profile = {alias:data.get('alias'), favourite:data.get('favourite'), points:0, returning:false};
      sessionStorage.setItem(savedKey,JSON.stringify(profile));
      track('membership_signup');
    } else {
      profile = data.get('profile') === 'saved' ? read(savedKey) : null;
      profile ||= {alias:'Café Guest', favourite:G.outlets.at(-1)?.name || 'No favourite yet', points:150, returning:true};
    }
    sessionStorage.setItem(sessionKey,JSON.stringify(profile));
    view = 'intro';
    render();
    document.querySelector('#main').focus({preventScroll:true});
    window.scrollTo(0, 0);
  });
})();
