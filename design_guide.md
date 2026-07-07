# GCC 2026 AI — Knowledge Base Design Guide

> Derived from **Command Centre Planning.pptx** (AB InBev GCC 2026)  
> Applied to: `knowledge-base-app/` (React + Vite + Tailwind)

---

## 1. Brand Context

The **Command Centre** is AB InBev's centralized planning intelligence hub. It covers:

| Product | Description |
|---|---|
| Circular Plan (Retpack) | Automated, centralized RetPack material forecasting via o9 + Anaplan |
| Demand Planning Cockpit | Unified view of O9 Statistical + DP Forecasts |
| E2E Material Planning | MRP dashboard closing the Plan-to-Execute gap |
| O9 Adoption & Touchless Plan | User adoption tracking and forecast accuracy |
| Core-Design Planning | Process mapping — AS-IS vs TO-BE |
| Order Management (O2D) | Touchless Order-to-Delivery visibility |

---

## 2. Color Palette

All colors extracted directly from `Command Centre Planning.pptx` shape fills and font colors.

### Primary — Gold (AB InBev Signature)

| Token | Hex | Use |
|---|---|---|
| `--gold-400` | `#E5B611` | **Primary accent** — CTAs, icons, active states |
| `--gold-300` | `#FFD40F` | Hover highlights, glow effects |
| `--gold-200` | `#FEEA72` | Light tints, selected backgrounds |
| `--gold-600` | `#CCA500` | Pressed/deep state, gradient end |
| `--gold-900` | `#464001` | Dark gold — subtle bg accents |

### Secondary — Forest Green

| Token | Hex | Use |
|---|---|---|
| `--forest-500` | `#274F31` | Secondary brand, section headers |
| `--forest-400` | `#00B050` | Success, positive KPIs, go-live |
| `--forest-300` | `#70AD47` | Medium success indicators |
| `--forest-200` | `#92D050` | Light success, sparklines |

### Dark Surfaces

| Token | Hex | Use |
|---|---|---|
| `--bg-base` | `#0D0D0D` | App background |
| `--bg-surface` | `#161616` | Page sections |
| `--bg-card` | `#1C1C1C` | Cards, panels |
| `--bg-elevated` | `#232323` | Modals, dropdowns |

### Text

| Token | Hex | Use |
|---|---|---|
| `--text-primary` | `#FFFFFF` | Headings |
| `--text-secondary` | `#E5E5E5` | Body copy |
| `--text-muted` | `#9CA3AF` | Labels, placeholders |
| `--text-faint` | `#6B7280` | Disabled, captions |

### Status

| Token | Hex | Use |
|---|---|---|
| `--status-success` | `#00B050` | Live, completed, on-track |
| `--status-warning` | `#E5B611` | In progress, highlights |
| `--status-error` | `#FF0000` | Delayed, critical, lowlights |
| `--status-neutral` | `#4B4B4A` | Neutral, archived |

---

## 3. Typography

Fonts found in the PPTX (prioritized for web):

| Role | Font | Weight | Google Fonts |
|---|---|---|---|
| **Heading / Display** | Montserrat | 600, 700, 800 | ✅ |
| **Body / Paragraph** | Poppins | 400, 500 | ✅ |
| **Labels / UI** | Barlow | 500, 600 | ✅ |
| **Code / Data** | ui-monospace / Consolas | — | system |

> Fonts are loaded via `@import` in `index.css` from Google Fonts.

### Type Scale

| Class | Size | Weight | Use |
|---|---|---|---|
| `display-xl` | 3.5rem | 700 | Hero headline |
| `display-lg` | 2.75rem | 700 | Page title |
| `display-md` | 2rem | 600 | Section title |
| `h1` | 1.75rem | 600 | Card header |
| `h2` | 1.375rem | 600 | Sub-section |
| `h3` | 1.125rem | 500 | Card title |
| `body-lg` | 1rem | 400 | Body |
| `body-sm` | 0.875rem | 400 | Secondary body |
| `label` | 0.75rem | 500 | ALL-CAPS label |
| `caption` | 0.6875rem | 400 | Metadata |

---

## 4. Iconography

The app uses **lucide-react** (already installed). Recommended icon mappings per section:

| Section | Icon | lucide-react name |
|---|---|---|
| Recordings | 🎥 | `Video` |
| Presentations | 📊 | `PresentationChart` / `LayoutDashboard` |
| BRD / Documents | 📄 | `FileText` |
| Training | 🎓 | `GraduationCap` |
| Architecture | 🏗️ | `GitBranch` / `Network` |
| Spreadsheets | 📈 | `BarChart2` |
| Search | 🔍 | `Search` |
| Filter | ⚙️ | `SlidersHorizontal` |
| Folder | 📁 | `Folder` |
| External link | ↗️ | `ExternalLink` |
| Settings | ⚙️ | `Settings` |
| User | 👤 | `User` |
| Calendar | 📅 | `Calendar` |
| Tag | 🏷️ | `Tag` |
| KPI / Metrics | 📉 | `TrendingUp` |
| Alert | ⚠️ | `AlertTriangle` |
| Touchless | 🤖 | `Zap` |
| Planning | 🗺️ | `Map` |
| Globe / Global | 🌍 | `Globe` |

---

## 5. Component Tokens

### Cards
```css
/* Default card */
background: var(--bg-card);
border: 1px solid var(--border-subtle);
border-radius: 14px;
box-shadow: var(--shadow-card);
/* On hover */
border-color: var(--border-gold);
box-shadow: var(--shadow-card), var(--shadow-gold);
transform: translateY(-2px);
```

### Buttons
- **Primary** — Gold gradient, dark text, gold glow shadow
- **Secondary** — Transparent, gold border + text
- **Ghost** — Transparent, muted text, subtle hover

### Badges
| Variant | Background | Border | Text |
|---|---|---|---|
| `gold` | `rgba(229,182,17,0.15)` | `rgba(229,182,17,0.3)` | `#E5B611` |
| `green` | `rgba(0,176,80,0.15)` | `rgba(0,176,80,0.3)` | `#00B050` |
| `neutral` | `rgba(75,75,74,0.4)` | `rgba(75,75,74,0.6)` | `#9CA3AF` |
| `error` | `rgba(255,0,0,0.12)` | `rgba(255,0,0,0.25)` | `#FF6666` |

---

## 6. Design Principles

1. **Dark-first** — The command centre operates 24/7. Dark mode is default.
2. **Gold as signal** — Use gold sparingly for the most important actions and data points.
3. **Data density** — Cards should show key KPIs at a glance. No unnecessary whitespace.
4. **Motion with purpose** — `slideUp` on page load, `fadeIn` for async content. No decorative animation.
5. **Green = success** — `#00B050` for live, on-time, positive. Red only for critical failures.
6. **Barlow uppercase labels** — Section labels are ALWAYS uppercase, spaced, 11px, gold.

---

## 7. Tailwind Class Reference

Quick reference for Tailwind custom classes (configured in `tailwind.config.js`):

```
Colors:
  gold-400, gold-300, gold-600, gold-900
  forest-400, forest-500, forest-200
  surface-700 (card), surface-800 (base), surface-600 (elevated)

Fonts:
  font-heading, font-body, font-label, font-mono

Shadows:
  shadow-gold-sm, shadow-gold-md, shadow-gold-lg
  shadow-card, shadow-card-hover, shadow-elevated

Backgrounds:
  bg-gold-gradient, bg-gold-subtle, bg-forest-gradient
  bg-surface-gradient, bg-hero-gradient

Animations:
  animate-fade-in, animate-slide-up, animate-slide-in
  animate-pulse-gold, animate-shimmer
```

---

## 8. Layout Grid

- **Max content width:** 1280px (centered)
- **Column grid:** 12-col on desktop, 4-col on mobile
- **Card grid:** 3-col on desktop (`grid-cols-3`), 2-col tablet, 1-col mobile
- **Sidebar + main:** 280px sidebar / fluid main content

---

## 9. Project Domain Vocabulary

Terms used in the UI copy (from PPTX slides):

| Term | Meaning |
|---|---|
| o9 | Planning platform (O9 Solutions) |
| Touchless | Automated, no-human-intervention planning |
| MRP | Material Requirements Planning |
| BGT | Budget |
| LE | Latest Estimate |
| SOP | Sales & Operations Planning |
| ZCC | Zone Capability Centre |
| OnTime | Execution planning system |
| BrewDat | AB InBev data platform |
| GCC | Global Capability Centre |
| O2D | Order-to-Delivery |
| STO | Stock Transfer Order |
| STR | Stock Transfer Requisition |
| IBP | Integrated Business Planning |
| CoE | Centre of Excellence |
