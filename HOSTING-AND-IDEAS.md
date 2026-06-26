# HerNurse — Site Guide, Hosting Steps & Ideas

A complete starter website for **hernurse.com**, styled after HealthyWomen.org (editorial, magazine-style layout with a slate-blue palette, category nav, featured stories, and a newsletter band) but framed around your nurse-led women's health service.

## What's in this folder

| File | Page |
|------|------|
| `index.html` | Homepage — featured story, mission, health topics, real stories, services teaser, newsletter |
| `services.html` | "Your Care" — six services + pricing tiers (placeholder prices) |
| `about.html` | Story, values, team bios (placeholders) |
| `contact.html` | Booking / contact form (demo — not yet wired to email) |
| `topics.html` | Health & wellness articles (placeholders) |
| `stories.html` | Real Women, Real Stories (placeholders) |
| `styles.css` | Shared styling for all pages |

Everything is plain HTML/CSS — no build step, no dependencies. Open `index.html` in any browser to preview.

## Before you go live — edit these placeholders

1. **Pricing** — replace every `$—` in `services.html` with your real rates.
2. **Team** — add real names, credentials, photos and bios in `about.html`.
3. **Articles & stories** — swap the placeholder cards in `topics.html`, `stories.html`, and the homepage for your own content (and real images).
4. **Email address** — `hello@hernurse.com` appears in the footer and contact page; set up that inbox or change it.
5. **Images** — colored blocks and emoji are placeholders. Drop in real photos (a `/images` folder works well).
6. **Legal** — wire up real Privacy Policy and Terms pages (linked in the footer), and keep the medical disclaimer.

## Hosting — recommended easiest path

For a static site like this, **Cloudflare Pages** or **Netlify** are the simplest, and both have free tiers with free SSL. Here's the Cloudflare route since you'll likely want to manage the domain's DNS there anyway.

### Option A — Netlify (drag-and-drop, fastest)
1. Go to **netlify.com** and sign up (free).
2. On the dashboard, drag this entire `hernurse` folder onto the "deploy" area. Your site is live on a temporary `*.netlify.app` URL in seconds.
3. Go to **Site settings → Domain management → Add custom domain** and enter `hernurse.com`.
4. Netlify shows you DNS records. At your domain registrar (where you bought hernurse.com), either point the nameservers to Netlify or add the records they specify.
5. Enable HTTPS (Netlify provisions a free certificate automatically). Done.

### Option B — Cloudflare Pages
1. Sign up at **cloudflare.com** and add `hernurse.com` as a site; update the nameservers at your registrar to the two Cloudflare gives you.
2. In the dashboard go to **Workers & Pages → Create → Pages → Upload assets**, and upload this folder.
3. Under your Pages project → **Custom domains**, add `hernurse.com`. Cloudflare handles SSL automatically.

### Option C — GitHub Pages (free, version-controlled)
1. Create a GitHub repo, upload these files.
2. **Settings → Pages →** deploy from the `main` branch root.
3. Add `hernurse.com` under "Custom domain" and create a `CNAME`/`A` records at your registrar pointing to GitHub's IPs.

Whichever you pick, the move is the same: **upload the folder → add hernurse.com as a custom domain → point DNS at the host → let it issue SSL.**

## Making the forms actually work

The newsletter and contact forms are currently demos (they just show a thank-you message). To collect real submissions without writing backend code:

- **Netlify Forms** — add `netlify` to the `<form>` tag; submissions show up in your Netlify dashboard (no code).
- **Formspree** (formspree.io) — point the form `action` at a Formspree endpoint; works on any host.
- **Calendly / Cal.com** — for booking, embed a scheduler on `contact.html` so clients pick a time directly.
- **Email lists** — Mailchimp, ConvertKit, or Beehiiv give you an embeddable signup form for the newsletter.

## The "Ask a Nurse" box on the homepage

The homepage has an interactive question box: a visitor types a medical question, gets a **short, plain-language answer**, and taps **More info** to reveal the next bite-sized piece — one chunk at a time, GotQuestions-style (breadcrumb → "Question" → big heading → "Answer" → progressive paragraphs → related questions).

**Out of the box** it works fully offline using a built-in knowledge base of 16 common women's-health questions (hot flashes, UTIs, perimenopause, PCOS, mammograms, postpartum depression, and more). To add or edit answers, open `index.html`, find the `const KB = [` block, and copy the pattern — each topic has `keys` (words that trigger it), `q` (the headline question), `chunks` (the bite-sized answer parts, shown one at a time), and `related`.

**To answer *any* question live with AI:**
1. In `index.html`, set `const USE_AI = true;`
2. Deploy a tiny serverless function at `/api/ask` that calls an AI model and returns short chunks. On Netlify or Cloudflare Pages this is a few lines. Example (Netlify function, using Claude):

```js
// netlify/functions/ask.js
export default async (req) => {
  const { question } = await req.json();
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      system: "You are a women's-health nurse educator. Answer in 3-5 SHORT, bite-sized chunks (1-2 sentences each), plain language, safe and general, never a diagnosis. Return ONLY a JSON array of strings.",
      messages: [{ role: "user", content: question }]
    })
  });
  const data = await r.json();
  let chunks = [];
  try { chunks = JSON.parse(data.content[0].text); } catch { chunks = [data.content?.[0]?.text || ""]; }
  return Response.json({ chunks });
};
```

3. Add your `ANTHROPIC_API_KEY` as an environment variable in your host's dashboard (never put the key in the HTML).

> **Safety note:** any "ask a medical question" feature should keep the disclaimer (already included), avoid diagnosing, and steer users to real care. If you let AI answer freely, review the system prompt carefully and consider logging/monitoring.

## Concept ideas to grow into

- **Editorial + service hybrid** (what this site is): publish trustworthy nurse-written articles to build SEO and trust, and convert readers into consultations. This is exactly HealthyWomen's playbook, scaled to a service.
- **Lead magnet**: a free "Women's Health Checkup Checklist" PDF in exchange for an email — fuels the newsletter.
- **Niche down**: menopause/midlife care is booming and underserved; you could make that the hero focus.
- **Memberships**: the "ongoing support" tier can become a recurring revenue subscription.
- **Local + virtual**: in-home concierge nursing for a local area, plus virtual visits nationwide (check nursing licensure rules per state).

## One important note

Offering nursing services involves **licensing, scope-of-practice, and liability considerations** that vary by state/country (e.g., RN licensure, telehealth rules, malpractice insurance, HIPAA for any health data you collect). Before taking real clients, confirm requirements with your nursing board and consider a healthcare attorney. I'm not able to give legal advice — this is just a flag so it's on your radar.
