import { projects } from './projects.js';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const FORMS = {
  apply: {
    title: 'New developer application',
    fields: { fullName: 'Name', username: 'Username', email: 'Email', country: 'Country', skills: 'Skills', experience: 'Experience', portfolio: 'Portfolio', additional: 'Additional' },
    need: ['fullName', 'username', 'email', 'country', 'skills', 'experience'],
  },
  feedback: {
    title: 'New feedback',
    fields: { name: 'Name', email: 'Email', type: 'Type', message: 'Message' },
    need: ['name', 'email', 'type', 'message'],
  },
};

async function notify(env, text) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) throw new Error('Telegram secrets missing');
  const r = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' }),
  });
  if (!r.ok) throw new Error('Telegram error ' + r.status);
}

async function submit(req, env, k) {
  const f = FORMS[k];
  const j = (o, s = 200) => Response.json(o, { status: s });
  let d;
  try { d = await req.json(); } catch { return j({ error: 'Invalid request' }, 400); }
  if (d.website) return j({ ok: true }); // honeypot
  const v = {};
  for (const key of Object.keys(f.fields)) {
    const x = String(d[key] ?? '').trim().slice(0, key === 'message' ? 1500 : 450);
    if (!x && f.need.includes(key)) return j({ error: 'Please fill in: ' + f.fields[key] }, 400);
    v[key] = x;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) return j({ error: 'Enter a valid email address' }, 400);
  const text = `<b>${f.title}</b>\n\n` + Object.entries(v).filter(([, x]) => x).map(([key, x]) => `<b>${f.fields[key]}:</b> ${esc(x)}`).join('\n');
  try { await notify(env, text); } catch (e) {
    console.error(e.message);
    return j({ error: 'Could not send right now. Please try again later or write to europacrest@gmail.com' }, 502);
  }
  return j({ ok: true });
}

const card = p => `<article class="card"><div class="frame"><img src="${esc(p.image)}" alt="" loading="lazy" onerror="this.remove()"></div><div class="cb"><div class="row"><h3>${esc(p.name)}</h3><span class="st">${esc(p.status)}</span></div><p>${esc(p.description)}</p><a class="btn" href="${esc(p.link)}" target="_blank" rel="noopener">Visit live</a></div></article>`;
const cards = projects.map(card).join('');
const inp = (n, l, req = true, t = 'text') => `<label>${l}<input name="${n}" type="${t}"${req ? ' required' : ''} maxlength="200"></label>`;
const sel = (n, l, o) => `<label>${l}<select name="${n}" required><option value="">Select</option>${o.map(x => `<option>${x}</option>`).join('')}</select></label>`;
const hp = '<input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">';

const CSS = `*{box-sizing:border-box;margin:0}[hidden]{display:none!important}
:root{--bg:#050505;--s:#0d0e0e;--l:rgba(255,255,255,.11);--m:rgba(255,255,255,.62);--a:#35b8b0}
html{scroll-behavior:smooth}
body{background:var(--bg);color:#fff;font:400 16px/1.6 'Schibsted Grotesk',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
a{color:inherit}:focus-visible{outline:2px solid var(--a);outline-offset:3px}
.w{max-width:1040px;margin:0 auto;padding:0 20px}
header{position:sticky;top:0;z-index:5;background:rgba(5,5,5,.9);backdrop-filter:blur(10px);border-bottom:1px solid var(--l)}
header .w{display:flex;align-items:center;justify-content:space-between;gap:14px;padding-top:10px;padding-bottom:10px}
.logo{display:inline-flex;align-items:center;border:1px solid var(--l);border-radius:10px;padding:6px 12px;min-height:46px;font-weight:600;text-decoration:none;flex:none}
.logo img{height:30px;width:auto;display:block}
nav{display:flex;gap:2px;overflow-x:auto}
nav a{padding:8px 12px;border-radius:8px;color:var(--m);text-decoration:none;font-size:15px;white-space:nowrap;transition:color .2s}
nav a:hover,nav a.on{color:#fff}nav a.on{box-shadow:inset 0 -2px var(--a);border-radius:0}
.hero{padding:76px 0 48px}
.hero>*{animation:in .8s cubic-bezier(.2,.7,.2,1) both}.hero p{animation-delay:.12s}.hero .btn{animation-delay:.24s}
@keyframes in{from{opacity:0;transform:translateY(14px)}}
h1{font-size:clamp(38px,7vw,68px);line-height:1.04;letter-spacing:-.03em;font-weight:600;max-width:15ch}
.hero p{color:var(--m);font-size:18px;max-width:52ch;margin:20px 0 28px}
section{padding:36px 0}
h2{font-size:26px;letter-spacing:-.02em;font-weight:600;margin-bottom:6px}
.sub{color:var(--m);max-width:56ch;margin-bottom:22px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px}
.card{border:1px solid var(--l);border-radius:14px;overflow:hidden;background:var(--s)}
.frame{aspect-ratio:16/10;background:linear-gradient(135deg,#111616,#090a0a);border-bottom:1px solid var(--l)}
.frame img{width:100%;height:100%;object-fit:cover;display:block}
.cb{padding:18px}.row{display:flex;justify-content:space-between;align-items:center;gap:10px}
h3{font-size:20px;font-weight:600;letter-spacing:-.01em}
.st{font-size:13px;color:var(--a);border:1px solid rgba(53,184,176,.4);border-radius:99px;padding:1px 10px 1px 8px}
.st:before{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--a);margin-right:6px}
.cb p{color:var(--m);margin:8px 0 16px}
.btn{display:inline-block;background:#fff;color:#000;padding:10px 18px;border-radius:8px;text-decoration:none;border:1px solid #fff;cursor:pointer;font:inherit;font-weight:600;transition:background .15s,color .15s,border-color .15s}
.btn:hover{background:#e4e4e4}.btn.g{background:none;color:#fff;border-color:var(--l)}.btn.g:hover{border-color:var(--a);color:var(--a)}
.btn.sm{padding:7px 14px;font-size:14px}.btn:disabled{opacity:.6;cursor:wait}
.box{border:1px solid var(--l);border-radius:14px;padding:22px;display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin-top:14px}
.box p{color:var(--m)}
.mission{font-size:clamp(22px,3.4vw,32px);line-height:1.3;letter-spacing:-.02em;max-width:30em;margin:14px 0 30px}
.val{display:grid;grid-template-columns:210px 1fr;gap:12px;padding:16px 0;border-top:1px solid var(--l)}
.val b{font-weight:600}.val span{color:var(--m)}
.ppl{display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap;padding:24px 0;border-top:1px solid var(--l)}
.ph{width:132px;height:132px;border-radius:12px;border:1px solid var(--l);background:var(--s);overflow:hidden;flex:none}
.ph img{width:100%;height:100%;object-fit:cover;display:block}
.pt{flex:1;min-width:240px}.role{color:var(--a);font-size:14px;margin-bottom:10px}.pt p{color:var(--m);max-width:62ch}
.lk{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap}
form{display:grid;gap:14px;max-width:560px}
label{display:grid;gap:6px;font-size:14px;color:var(--m)}
input,select,textarea{background:var(--s);border:1px solid var(--l);border-radius:8px;color:#fff;padding:11px 12px;font:inherit}
input:focus,select:focus,textarea:focus{outline:2px solid var(--a);outline-offset:1px}
textarea{min-height:120px;resize:vertical}.hp{position:absolute;left:-9999px}
.msg{min-height:22px;font-size:14px}.msg.ok{color:var(--a)}.msg.err{color:#f08a8a}
form .btn{justify-self:start}
footer{border-top:1px solid var(--l);margin-top:40px;padding:26px 0 36px;color:var(--m);font-size:14px}
footer .w{display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap}
@media(max-width:600px){.val{grid-template-columns:1fr;gap:4px}.hero{padding-top:48px}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}html{scroll-behavior:auto}}`;

const person = (img, name, role, bio, links) => `<div class="ppl"><div class="ph"><img src="${img}" alt="${name}" onerror="this.remove()"></div><div class="pt"><h3>${name}</h3><div class="role">${role}</div><p>${bio}</p>${links ? `<div class="lk">${links}</div>` : ''}</div></div>`;

const HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Europa Crest builds good technology services while keeping your privacy safe."><meta name="theme-color" content="#050505"><title>Europa Crest</title><link href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600&display=swap" rel="stylesheet"><style>${CSS}</style></head><body>
<header><div class="w"><a class="logo" href="#/" aria-label="Europa Crest home"><img src="/logo.png" alt="Europa Crest" onerror="this.replaceWith(document.createTextNode('Europa Crest'))"></a>
<nav><a data-p="home" href="#/">Home</a><a data-p="about" href="#/about">About</a><a data-p="projects" href="#/projects">Projects</a><a data-p="apply" href="#/apply">Apply</a><a data-p="feedback" href="#/feedback">Feedback</a></nav></div></header>

<main id="home" class="page"><div class="w">
<div class="hero"><h1>Technology built with intention.</h1><p>Europa Crest is a technology company focused on building good services while keeping your privacy safe. No ads. No tracking.</p><a class="btn" href="#/projects">View Projects</a></div>
<section><h2>Projects</h2><p class="sub">What we are building right now.</p><div class="grid">${cards}</div></section>
<div class="box"><div><h3>Want to build with us?</h3><p>Developers are welcome. Tell us what you build.</p></div><a class="btn g" href="#/apply">Apply as developer</a></div>
<div class="box"><div><h3>Help us improve</h3><p>Bugs, ideas, complaints. We read all of it.</p></div><a class="btn g" href="#/feedback">Send feedback</a></div>
</div></main>

<main id="about" class="page" hidden><div class="w"><section>
<h2>About</h2>
<p class="mission">Most technology is built to grab attention, collect data and show ads. Europa Crest exists to show that a different way is possible: technology that respects the people who use it.</p>
<div class="val"><b>Privacy First</b><span>No tracking, no selling data, no ad networks. We collect only what a service needs to work.</span></div>
<div class="val"><b>Fast and Reliable</b><span>Built on Cloudflare's global network, so our services stay quick and dependable.</span></div>
<div class="val"><b>Open Development</b><span>Developers can apply to join us and help build what we make.</span></div>
<div class="val"><b>Community Driven</b><span>A small, focused team that cares more about quality than rushing.</span></div>
</section><section><h2>People</h2><div style="height:14px"></div>
${person('/founder.png', 'Ayush Raj Sinha', 'Founder · Student, Independent Researcher', "I'm a student who believes technology should serve people, not the other way around. Europa Crest started with a simple question: what would the internet look like if it was built with intention? No ads, no tracking, no dark patterns. Just tools that actually help. I'm also an independent researcher, and Europa Crest is the practical side of that same idea. It's still early and the team is small, but the direction is clear. Good technology is possible, and we're building it.", '<a class="btn g sm" href="https://www.linkedin.com/in/ayush-raj-sinha-5493b9443" target="_blank" rel="noopener">LinkedIn</a><a class="btn g sm" href="https://ayushonlyyy.github.io/" target="_blank" rel="noopener">Portfolio</a>')}
${person('/vasu.png', 'Vasu Rawat', 'Lead Developer', "I'm Vasu, a web developer from Uttarkashi with two years of experience. I work mostly with JavaScript and CSS, and I also use AI to help with my code. I lead the development side of Europa Crest.", '')}
</section></div></main>

<main id="projects" class="page" hidden><div class="w"><section><h2>Projects</h2><p class="sub">Everything we have built so far.</p><div class="grid">${cards}</div></section></div></main>

<main id="apply" class="page" hidden><div class="w"><section><h2>Apply as a developer</h2><p class="sub">Tell us who you are and what you build. We read every application personally and reply by email if it's a fit.</p>
<form data-k="apply" data-ok="Application received. Thank you for applying.">${hp}${inp('fullName', 'Full name')}${inp('username', 'Username')}${inp('email', 'Email', true, 'email')}${inp('country', 'Country')}${inp('skills', 'Skills')}${sel('experience', 'Experience level', ['Beginner (0–1 years)', 'Intermediate (1–3 years)', 'Experienced (3–5 years)', 'Senior (5+ years)'])}${inp('portfolio', 'Portfolio or GitHub (optional)', false)}<label>Anything else (optional)<textarea name="additional" maxlength="450"></textarea></label><button class="btn" type="submit">Send application</button><div class="msg" role="status"></div></form></section></div></main>

<main id="feedback" class="page" hidden><div class="w"><section><h2>Feedback</h2><p class="sub">Found a bug, have an idea, or want something changed? Tell us. The team reads every message.</p>
<form data-k="feedback" data-ok="Feedback sent. Thank you.">${hp}${inp('name', 'Name')}${inp('email', 'Email', true, 'email')}${sel('type', 'Feedback type', ['General Feedback', 'Bug Report', 'Feature Request', 'Design Suggestion', 'Performance Issue', 'Other'])}<label>Message<textarea name="message" required maxlength="1500"></textarea></label><button class="btn" type="submit">Send feedback</button><div class="msg" role="status"></div></form></section></div></main>

<footer><div class="w"><span>© 2026 Europa Crest. All rights reserved.</span><a href="mailto:europacrest@gmail.com">Contact for queries: europacrest@gmail.com</a></div></footer>
<script>
const T={home:'Europa Crest',about:'About | Europa Crest',projects:'Projects | Europa Crest',apply:'Apply | Europa Crest',feedback:'Feedback | Europa Crest'};
function go(){const h=location.hash.replace('#/','')||'home',id=T[h]?h:'home';
document.querySelectorAll('.page').forEach(p=>p.hidden=p.id!==id);
document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('on',a.dataset.p===id));
document.title=T[id];scrollTo(0,0)}
addEventListener('hashchange',go);go();
document.querySelectorAll('form').forEach(f=>f.addEventListener('submit',async e=>{
e.preventDefault();const m=f.querySelector('.msg'),b=f.querySelector('button');b.disabled=true;m.className='msg';m.textContent='Sending...';
try{const r=await fetch('/api/'+f.dataset.k,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(f)))});const j=await r.json();
if(r.ok){f.reset();m.className='msg ok';m.textContent=f.dataset.ok}else{m.className='msg err';m.textContent=j.error||'Something went wrong'}}
catch(x){m.className='msg err';m.textContent='Network problem. Check your connection and try again.'}
b.disabled=false}));
</script></body></html>`;

export default {
  async fetch(req, env) {
    const p = new URL(req.url).pathname;
    if (req.method === 'POST' && p.startsWith('/api/') && Object.hasOwn(FORMS, p.slice(5))) return submit(req, env, p.slice(5));
    if (req.method === 'GET' && p === '/') {
      return new Response(HTML, { headers: { 'Content-Type': 'text/html;charset=UTF-8', 'X-Content-Type-Options': 'nosniff' } });
    }
    return new Response('Not found', { status: 404 });
  },
};
