# SRF Corporation — Static Website

**Empowering Laboratories. Enabling Science.**

Dark, futuristic single-page marketing site for SRF Corporation — laboratory
solutions for the pharmaceutical, life science, diagnostic and research sectors
of Bangladesh. Built around the brand mark (angular S-bolt in a hexagon, deep
royal blue → light blue on black). Ships with a **light + dark theme** and a
toggle in the header (remembers the visitor's choice, defaults to their
system preference).

## Run it

No build step, no dependencies. Open `index.html` in a browser, or serve the
folder with any static server:

```bash
npx serve .          # or:  python -m http.server 8000
```

## Structure

```
srf-corporation/
├── index.html        # all sections & content (from the company profile)
├── css/style.css     # theme, layout, animations (design tokens at the top)
├── js/main.js        # particles, reveals, counters, tabs, nav, form (no dependencies)
├── tools/lead-form.gs # lead backend: paste into a Google Sheet's Apps Script & deploy
└── assets/
    ├── logo.svg      # brand mark (SVG recreation of the original)
    └── favicon.svg   # browser-tab icon
```

## Page sections

Hero (real KPIs: 100+ clients, 20+ yrs, 4 sectors, 6 focus areas) → capability
marquee → About → Vision, Mission & 5 Core Values → 6 Focus Areas (QC,
Microbiology, R&D, Biotech, Molecular, Engineering) → sector stats → Products &
Principals (8 categories) → Why Choose Us → 8-member Leadership Team → Clients
(tabbed: 34 pharma, 25 universities, 16 research institutes, 32 healthcare) →
CTA → Contact (real address, phone, emails + form).

## Customizing

- **Content** — all copy lives in `index.html`; remaining `TODO`-free. Client
  lists, team, stats and contact details match the official company profile.
- **Team photos** — replace the initials avatars by dropping photos into
  `assets/` and swapping the `.team-avatar` spans for `<img>` elements.
- **Using the original logo file** — drop the original `logo.png` into
  `assets/` and swap the `<img src="assets/logo.svg">` references (header,
  hero, about panel, footer).
- **Colors** — edit the design tokens at the top of `css/style.css`
  (`--blue`, `--blue-2`, `--cyan`, background glows). Dark values live in
  `:root`, light values in the `html[data-theme="light"]` block.
- **Fonts** — Montserrat (headings), Inter (body), Comfortaa (accents), loaded
  from Google Fonts in `index.html`.

## Notes

- **Lead collection** — the contact form POSTs to a Google Apps Script web app
  (`tools/lead-form.gs`) that appends every lead to a Google Sheet and emails
  `sales@srfbd.com`. Until `LEADS_ENDPOINT` in `js/main.js` is set to the
  deployed web-app URL, the form falls back to opening the visitor's email
  client. A "Request via WhatsApp" button sits under the form as a second
  channel (number: +880 1743-034272). A hidden honeypot field filters bots.
- **Themes** — the header toggle switches light/dark, persists the choice in
  `localStorage` (`srf-theme`) and falls back to `prefers-color-scheme`. Dark
  is the default for first visits without a system preference; hero particles
  and the browser UI color (`theme-color`) follow the active theme too.
- Animations respect `prefers-reduced-motion`; the site is fully usable with
  JavaScript disabled (dark theme, no toggle).
