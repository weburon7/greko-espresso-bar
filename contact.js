(() => {
  'use strict';

  const styles = `<style>
    .contact-page{--navy:#182f45;--brass:#826434;--line:#c7b99e;max-width:1320px;padding:clamp(26px,4vw,60px) 6%;margin:auto;color:var(--navy)}
    #main .contact-page :is(h1,h2,h3){font:400 clamp(31px,3.6vw,50px)/1.05 Georgia,serif;letter-spacing:-.045em;margin:0 0 .4em}#main .contact-page h1{font-size:clamp(48px,6.8vw,98px)}#main .contact-page h3{font-size:clamp(25px,2.8vw,36px)}
    .contact-page .eyeline{font:700 .7rem/1.5 system-ui;letter-spacing:.14em;color:var(--brass);margin-bottom:14px}
    .contact-intro{display:grid;grid-template-columns:1fr .83fr;gap:clamp(20px,6vw,90px);align-items:center;margin-bottom:clamp(28px,4vw,54px)}
    .contact-intro img{width:100%;height:clamp(210px,19vw,290px);object-fit:cover;object-position:center 54%;border-bottom:4px solid #b2925b}.contact-intro p{max-width:43ch}
    .contact-outlets,.contact-lower{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(18px,3.5vw,48px)}
    .contact-outlets article{padding:20px 0;border-top:1px solid var(--brass)}.contact-outlets .actions{margin-top:16px;gap:8px}.contact-outlets p{font-size:.94rem;color:#435469}.contact-page .btn{min-height:44px;border-radius:3px}.contact-page .btn.outline:hover{background:#e6dcc9}
    .contact-lower{margin-top:clamp(26px,4vw,55px);align-items:start}.contact-enquiry{background:#f2e9d7;border-top:3px solid #ab8c58;padding:clamp(20px,3vw,40px)}
    .contact-enquiry form{display:grid;gap:14px;margin-top:20px}.contact-enquiry label{font-weight:600;font-size:.94rem}
    .contact-enquiry :is(input,textarea,select){display:block;min-height:44px;width:100%;margin:6px 0 0;border-radius:2px;border:1px solid #9c907b;color:#182f45;background:#fffbf2;padding:10px 12px}.contact-enquiry textarea{resize:vertical}.contact-enquiry button{justify-self:start}
    .contact-page summary{padding:15px 0;font-weight:600}.contact-page details{border-top:1px solid var(--line)}.contact-page details p{margin-bottom:14px}.contact-social{margin:18px 0}.contact-social p,.contact-note{font-size:.86rem;color:#4a5360}
    .contact-result dl{margin:18px 0}.contact-result dt{font:700 .77rem/1.5 system-ui;color:var(--brass);margin-top:12px}.contact-result dd{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}.contact-result button{margin-top:18px}
    @media(max-width:680px){.contact-intro,.contact-outlets,.contact-lower{grid-template-columns:1fr}.contact-intro img{height:165px}.contact-outlets{gap:0}.contact-lower{gap:36px}.contact-outlets article{padding-block:16px}}
  </style>`;

  function outletCard(o) {
    return `<article><h3>${esc(o.name)}</h3><p>${esc(o.address)}</p><p>${esc(o.phone || 'Phone number awaiting approval')}</p>
      <div class="actions">${previewAction(o,'Call')}${previewAction(o,'Directions')}${link('/locations/'+encodeURIComponent(o.id)+'/', 'Outlet details '+ico('arrow'),'textLink')}</div></article>`;
  }

  function formMarkup() {
    return `<h2>Send an enquiry</h2><p>Use fictional contact details to try the form.</p>
      <form id="contact-preview-form">
      <label>Outlet<select required name="outlet">${G.outlets.map(o => `<option value="${esc(o.id)}"${o.id===outlet()?' selected':''}>${esc(o.name)}</option>`).join('')}</select></label>
      <label>Your name<input required maxlength="80" name="name" autocomplete="off" placeholder="Sample guest"></label>
      <label>Email address<input required type="email" maxlength="180" name="email" autocomplete="off" placeholder="guest@example.com"></label>
      <label>Your message<textarea required maxlength="1800" rows="4" name="message" placeholder="What would you like to ask?"></textarea></label>
      <button type="submit" class="btn">Preview enquiry ${ico('arrow')}</button>
      <p class="contact-note">${esc(demo)}</p></form>`;
  }

  window.contactPage = () => `<section class="contact-page">${styles}
    <header class="contact-intro"><div>${label('Contact Greko')}<h1>Get in <em>touch.</em></h1><p>Choose your café in Jalandhar for directions, a call or a question for the team.</p></div>
    <img src="${safe(G.home.gallery)}" alt="Café seating and coffee counter, sample photography"></header>
    <div class="contact-outlets">${G.outlets.map(outletCard).join('')}</div>
    <div class="contact-lower"><section class="contact-enquiry">${formMarkup()}</section><section>
    <h2>Good to know</h2>${G.faqs.map(f => `<details><summary>${esc(f.question)}</summary><p>${esc(f.answer)}</p></details>`).join('')}
    <details><summary>Where can I find the café policies?</summary><p>Greko will supply approved wording for booking changes, cancellations, offers and membership before launch.</p></details>
    <div class="contact-social">${safe(G.social.instagram)?link(safe(G.social.instagram),'Find Greko on Instagram '+ico('arrow'),'textLink'):'<p>Greko’s social links are awaiting approval.</p>'}</div>
    </section></div></section>`;

  document.addEventListener('submit', event => {
    if (event.target.id !== 'contact-preview-form') return;
    event.preventDefault();
    const data = new FormData(event.target);
    const branch = G.outlets.find(o => o.id === data.get('outlet'));
    if (!branch) return;
    selectOutlet(branch.id);
    const panel = event.target.closest('.contact-enquiry');
    panel.innerHTML = `<div class="contact-result">${label('Enquiry preview')}<h2 tabindex="-1">Your message for ${esc(branch.name)}</h2>
      <dl><dt>From</dt><dd>${esc(data.get('name'))} · ${esc(data.get('email'))}</dd><dt>Message</dt><dd>${esc(data.get('message'))}</dd></dl>
      <p>This preview stays on your screen. Sending an enquiry requires a connected café inbox.</p>
      <p class="contact-note">${esc(demo)}</p><button class="btn outline" type="button" data-contact-restart>Start another enquiry</button></div>`;
    panel.querySelector('h2').focus();
  });
  document.addEventListener('click', event => {
    const reset = event.target.closest('[data-contact-restart]');
    if (!reset) return;
    const panel = reset.closest('.contact-enquiry');
    panel.innerHTML = formMarkup();
    panel.querySelector('select').focus();
  });
})();
