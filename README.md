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
└── assets/
    ├── logo.png      # brand mark (SVG recreation of the original)
    └── favicon.svg   # browser-tab icon
```

## Page sections

Hero (real KPIs: 100+ clients, 20+ yrs, 4 sectors, 6 focus areas) → capability
marquee → About → Vision, Mission & 5 Core Values → 6 Focus Areas (QC,
Microbiology, R&D, Biotech, Molecular, Engineering) → sector stats → Products &
Principals (8 categories) → Why Choose Us → Clients
(tabbed: 34 pharma, 25 universities, 16 research institutes, 32 healthcare) →
CTA → Contact (real address, phone, emails + form).

## Customizing

- **Content** — all copy lives in `index.html`; remaining `TODO`-free. Client
  lists, stats and contact details match the official company profile.
- **Colors** — edit the design tokens at the top of `css/style.css`
  (`--blue`, `--blue-2`, `--cyan`, background glows). Dark values live in
  `:root`, light values in the `html[data-theme="light"]` block.
- **Fonts** — Montserrat (headings), Inter (body), Comfortaa (accents), loaded
  from Google Fonts in `index.html`.

## Notes

- **Lead collection** — the contact form submits to
  [Web3Forms](https://web3forms.com) (`https://api.web3forms.com/submit`) via
  the `access_key` hidden input in `index.html`; submissions are delivered to
  the email address that access key is registered to. The plain form `action`
  works even without JavaScript, and `js/main.js` enhances it with a `fetch`
  POST for inline success/error messages. A "Request via WhatsApp" button
  sits under the form as a second channel (number: +880 1743-034272). A
  hidden honeypot field filters bots.
- **Themes** — the system preference (`prefers-color-scheme`) is the default
  and is followed live until the visitor toggles; the toggle's choice is then
  persisted in `localStorage` (`srf-theme`). Dark is the fallback when the OS
  reports no preference; hero particles and the browser UI color
  (`theme-color`) follow the active theme too.
- Animations respect `prefers-reduced-motion`; the site is fully usable with
  JavaScript disabled (dark theme, no toggle).
