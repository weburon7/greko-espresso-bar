(() => {
  'use strict';

  window.memberSeed = {
    tiers: [
      {name: 'Regular', description: 'The starting tier. Collect sample points on eligible café visits.', threshold: 0},
      {name: 'House Guest', description: 'A second tier with access to additional sample rewards.', threshold: 250},
    ],
    rewards: [
      {name: 'A classic espresso', description: 'A sample espresso reward at either outlet.', points: 100},
      {name: 'Birthday dessert', description: 'An example birthday-month treat after a qualifying visit.', points: 200},
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
    return `<div class="member-lead"><div><small>Membership preview</small><h1>The Greko Club</h1><p>A little extra for your coffee ritual. Explore a sample points balance, birthday benefits and rewards for returning guests.</p>
      <div class="member-actions"><button type="button" data-member="signup">Try demo sign-up</button><button class="secondary" type="button" data-member="signin">Demo sign-in</button></div></div>
      <img src="/greko-espresso-bar/images/drink.jpg" alt="Stock photograph of milk swirling into iced coffee"></div>
      <section><h2>Sample tiers</h2><p>In this example, each qualifying visit earns 25 points. Joining is optional for browsing, ordering and booking.</p><div class="member-grid">${tiers}</div></section>
      <section><h2>Example rewards</h2><div class="member-grid">${rewards}</div></section>
      <details><summary>Membership terms for this preview</summary><p>The client will approve earning rates, eligible purchases, birthday eligibility, expiry, redemption rules and privacy terms before launch. All balances and rewards shown here are sample data with no cash value.</p></details>`;
  }

  function accountForm(signup) {
    const saved = read(savedKey);
    return `<button class="secondary" type="button" data-member="intro">← Membership</button><section><small>Sample account</small><h1>${signup ? 'Join the club' : 'Welcome back'}</h1>
      <p>${signup ? 'Choose a fictional display name and a favourite outlet for your sample profile.' : 'Choose a sample profile to explore its dashboard.'} This demo lasts for this browser tab.</p>
      <form id="greko-member-form" class="member-form" data-mode="${signup ? 'signup' : 'signin'}">
      ${signup ? `<label>Demo display name<select name="alias"><option>Coffee Guest</option><option>Weekend Guest</option><option>Morning Guest</option></select></label>
      <label>Favourite outlet<select name="favourite"><option>Model Town</option><option>Eastwood Village</option></select></label>
      <label><input type="checkbox" required> I understand that this profile and its rewards are for demonstration.</label>`
      : `<label>Demo profile<select name="profile">${saved ? '<option value="saved">My demo profile</option>' : ''}<option value="guest">Returning guest · 150 sample points</option></select></label>`}
      <button type="submit">${signup ? 'Create demo profile' : 'Sign in to demo'}</button></form></section>`;
  }

  function dashboard(profile) {
    const tiers = [...G.tiers].sort((a,b) => Number(b.threshold)-Number(a.threshold));
    const tier = tiers.find(t => Number(t.threshold) <= profile.points);
    return `<small>Member dashboard · Preview data</small><h1>Hello, ${esc(profile.alias)}.</h1>
      <div class="member-grid"><article><small>Sample balance</small><h2>${esc(profile.points)} points</h2><p>${esc(tier?.name || 'Guest')} member</p></article>
      <article><small>Your profile</small><h2>${esc(profile.favourite)}</h2><p>Favourite café outlet</p></article></div>
      <section><h2>Rewards</h2><div class="member-grid">${G.rewards.map(r => `<article><small>${Number(r.points) <= profile.points ? 'Available in preview' : esc(Math.max(0,Number(r.points)-profile.points))+' more sample points needed'}</small><h3>${esc(r.name)}</h3><p>${esc(r.description)} · ${esc(r.points)} points</p></article>`).join('')}</div></section>
      <section><h2>Offer history</h2><p>${profile.returning ? 'Welcome visit · Example member offer used on a past sample visit.' : 'Your new demo profile has no offer history yet.'}</p></section>
      <button class="secondary" type="button" data-member="signout">Sign out of demo</button>`;
  }

  window.memberPage = () => {
    const profile = read(sessionKey);
    return `<div class="member-wrap"><style>
      .member-wrap{max-width:1120px;padding:clamp(24px,5vw,64px) 5%;margin:auto;color:#352821}.member-wrap section{margin:2.4rem 0}.member-wrap h1,.member-wrap h2,.member-wrap h3{margin:.45em 0}.member-wrap h1{font-size:clamp(2.5rem,6vw,5rem);line-height:1.04}.member-wrap p{max-width:68ch;line-height:1.65}.member-wrap small{font:600 .78rem/1.4 system-ui;letter-spacing:.05em;color:#5c6247}.member-lead,.member-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:center;gap:clamp(1rem,3vw,3rem)}.member-lead img{width:100%;height:clamp(220px,28vw,340px);object-fit:cover;border-radius:8px}.member-grid{align-items:stretch;gap:1rem}.member-grid article{background:#f6f1e7;border:1px solid #d5ccb8;border-radius:6px;padding:clamp(18px,2.5vw,30px)}.member-actions{display:flex;gap:.7rem;flex-wrap:wrap}.member-wrap button{cursor:pointer;border:1px solid #383d2b;background:#383d2b;color:#fffaf2;padding:12px 19px;border-radius:5px;font:600 .94rem/1.3 system-ui}.member-wrap button.secondary{background:transparent;color:#383d2b}.member-form{max-width:520px;display:grid;gap:18px}.member-form label{display:block}.member-form select{display:block;width:100%;padding:.7rem;font:inherit;margin-top:.35rem}.member-form input[type=checkbox]{display:inline;width:auto}.member-wrap summary{cursor:pointer;font-weight:600}.member-demo{margin-top:2.5rem;font-size:.86rem;color:#5b554c}@media(max-width:650px){.member-lead,.member-grid{grid-template-columns:1fr}.member-lead img{height:195px}}
      </style>${profile ? dashboard(profile) : view === 'signin' || view === 'signup' ? accountForm(view === 'signup') : intro()}
      <p class="member-demo">Demo preview — no booking or order has been placed.</p></div>`;
  };

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-member]');
    if (!button) return;
    view = button.dataset.member;
    if (view === 'signout') { sessionStorage.removeItem(sessionKey); view = 'intro'; }
    render();
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
      profile ||= {alias:'Café Guest', favourite:'Eastwood Village', points:150, returning:true};
    }
    sessionStorage.setItem(sessionKey,JSON.stringify(profile));
    view = 'intro';
    render();
    window.scrollTo(0, 0);
  });
})();
