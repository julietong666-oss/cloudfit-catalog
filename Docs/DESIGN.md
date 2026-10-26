---
name: Mekong Cloud Horizon
colors:
  surface: '#faf9fd'
  surface-dim: '#dbd9dd'
  surface-bright: '#faf9fd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f7'
  surface-container: '#efedf1'
  surface-container-high: '#e9e7eb'
  surface-container-highest: '#e3e2e6'
  on-surface: '#1a1b1e'
  on-surface-variant: '#414754'
  inverse-surface: '#2f3033'
  inverse-on-surface: '#f1f0f4'
  outline: '#727785'
  outline-variant: '#c1c6d6'
  surface-tint: '#005bc0'
  primary: '#005bbf'
  on-primary: '#ffffff'
  primary-container: '#1a73e8'
  on-primary-container: '#ffffff'
  inverse-primary: '#adc7ff'
  secondary: '#006e2c'
  on-secondary: '#ffffff'
  secondary-container: '#86f898'
  on-secondary-container: '#00722f'
  tertiary: '#795900'
  on-tertiary: '#ffffff'
  tertiary-container: '#987000'
  on-tertiary-container: '#ffffff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc7ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#89fa9b'
  secondary-fixed-dim: '#6ddd81'
  on-secondary-fixed: '#002108'
  on-secondary-fixed-variant: '#005320'
  tertiary-fixed: '#ffdfa0'
  tertiary-fixed-dim: '#fbbc05'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5c4300'
  background: '#faf9fd'
  on-background: '#1a1b1e'
  surface-variant: '#e3e2e6'
typography:
  display-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: 0em
  headline-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
  code-sm:
    fontFamily: Space Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system delivers an intelligent, accessible, and structured cloud advisory interface designed specifically for Vietnamese founders, technical leads, and SME operators. Built on the tenets of modern cloud ergonomics and Material Design 3 evolutions, the aesthetic balances institutional reliability with rapid, approachable utility. 

Key attributes:
- **Tone:** Authoritative yet empowering, frictionless, pragmatic, and transparent.
- **Visual Style:** Modern Tech Cleanroom. High-order information density mediated by generous white space, structured tonal tiers, translucent status surfaces, and exactingly refined hairline outlines.
- **Audience Context:** Vietnamese entrepreneurs, high-growth tech startups, and local digital-transformation teams navigating complex multi-product tiers (compute, databases, Vertex AI, Kubernetes). The interface must minimize cognitive friction under dense decision trees while operating seamlessly across high-frequency mobile environments in localized connectivity.

## Colors

The palette establishes Google Cloud's foundational blue as the structural anchor, supported by functional state accents derived from the Google quadri-color paradigm and calibrated for accessibility and contrast:

- **Primary (`#1A73E8` - Cloud Blue):** Primary actions, selection steppers, interactive focus states, active filters, and key metrics.
- **Secondary (`#34A853` - Growth Green):** Positive ROI indicators, service health uptime, optimized cost tier badges, and final confirmation CTAs.
- **Tertiary (`#FBBC04` - Insight Gold / Amber):** Warning flags, quota utilization notices, beta/advisory badges, and architectural trade-off markers.
- **Destructive / Alert (`#EA4335` - Engine Red):** High-cost alerts, resource deletion, deprecation indicators, and critical quota limits.
- **Neutral Stack:**
  - **Text Primary (`#202124`):** High-contrast base typography.
  - **Text Secondary (`#5F6368`):** Contextual captions, field labels, metadata, and empty states.
  - **Surface Canvas (`#F8F9FA`):** Low-strain, warm neutral foundation for primary page canvas.
  - **Surface Container (`#FFFFFF`):** Base for elevated cards, active panels, and floating sheets.
  - **Border / Divider (`#DADCE0`):** Subtle hairline structural framing.
  - **Surface Dim / Variant (`#F1F3F4`):** Unselected chips, subtle input backgrounds, and disabled controls.

## Typography

The design system standardizes on **Be Vietnam Pro** across all typographic scales to deliver native diacritic clarity and visual cadence for Vietnamese-language cloud terminology, technical specifications, and executive summaries.

- **Display & Headlines:** Tightly tracked with balanced ascenders and descenders to support diacritic stacking without line clipping or overlap.
- **Body:** Open counters and clean geometric terminals maintain clarity across multi-column comparison tables and complex sizing calculators.
- **Labels & Badges:** Slightly wider tracking on uppercase and title-case labels ensures fast scanning of cloud tags (e.g., `GKE AUTOPILOT`, `CLOUD RUN`, `BIGQUERY`).
- **Monospace Integration:** Technical tokens, SKU IDs, CLI outputs, and architecture pricing variables utilize `Space Mono` for unambiguous character distinction.

## Layout & Spacing

The layout model uses a responsive fluid grid system anchored by an 8pt spatial baseline:

- **Desktop (1200px+):** 12-column fluid grid, `2rem` outer margins, `1.5rem` gutters. Solution builder panels dock into a dual-pane master-detail arrangement (filters/steppers on the left 4 columns, architecture blueprints and dynamic cost breakdowns on the right 8 columns).
- **Tablet (768px - 1199px):** 8-column layout, `1.5rem` margins and gutters. Steppers collapse into sticky top anchor navigations with side-drawer filter triggers.
- **Mobile (< 768px):** 4-column layout, `1rem` margins, `1rem` gutters. Layout converts to a strictly linear card stream with fixed bottom navigation drawers for active budget calculators and solution recommendation summaries.

All vertical spacing between form groups, stepper milestones, and filter tags adheres strictly to the `space-*` scale to maintain rhythm across localized text density changes.

## Elevation & Depth

Visual hierarchy uses tonal surface stacking paired with soft ambient diffusion:

- **Level 0 (Flat / Canvas):** Neutral background (`#F8F9FA`), non-elevated containers, structural side-rail backgrounds.
- **Level 1 (Framed Surfaces):** Primary content cards and standard solution blocks set against `#FFFFFF`, framed with a hairline outline (`1px solid #DADCE0`). Flat baseline with zero offset shadow until interactive hover.
- **Level 2 (Active Cards & Hover):** Interactive solution modules and recommended configurations lift with a subtle ambient shadow: `box-shadow: 0 4px 12px -2px rgba(32, 33, 36, 0.08), 0 2px 6px -1px rgba(32, 33, 36, 0.04)`.
- **Level 3 (Floating Sheets & Action Bars):** Sticky mobile recommendation summaries, multi-select floating toolbars, and filter bottom sheets: `box-shadow: 0 12px 24px -4px rgba(32, 33, 36, 0.12), 0 4px 8px -2px rgba(32, 33, 36, 0.04)`.
- **Level 4 (Modals & Deep Advisory Views):** Architectural comparison overlays and quota recalculation panels: `box-shadow: 0 24px 48px -8px rgba(32, 33, 36, 0.16)`.

## Shapes

The design system incorporates intentional corner radii reflecting Google Material 3 geometric softness:

- **Cards & Primary Modules:** Standardized to `rounded-xl` (1.5rem / 24px) for distinct, approachable enclosure of solution stacks.
- **Interactive Inputs & Dialogs:** Set at standard `0.5rem` (8px) for crisp field definition.
- **Buttons, Badges, and Filter Chips:** Uniformly pill-shaped (`9999px` / full roundedness) to balance rectangular card containers with touch-friendly controls.

## Components

### Buttons
- **Primary:** Filled `#1A73E8`, white text (`label-lg`), pill-shaped (`9999px`), 44px height (mobile: 48px), 24px horizontal padding. Hover elevation: subtle lift with `#1557B0` surface color.
- **Secondary / Outlined:** Hairline border `1px solid #DADCE0`, transparent background, text `#1A73E8`. Hover: `#F1F3F4` container fill.
- **Elevated Action CTA:** High-intent buttons (e.g., "Export Architecture to GCP Console") leverage Google Cloud Blue with `box-shadow: 0 2px 6px 0 rgba(26, 115, 232, 0.3)`.

### Chips & Filter Pills
- **Filter Chip:** Height 32px, pill-shaped, border `1px solid #DADCE0`, background `#FFFFFF`. Selected state: fill `#E8F0FE`, border `1px solid #1A73E8`, text `#1A73E8` with a leading checkmark icon.
- **Status / Category Badge:** Height 24px, pill-shaped, borderless.
  - *Compute:* Background `#E8F0FE`, Text `#1A73E8`.
  - *Cost Saver:* Background `#CEEAD6`, Text `#0D652D`.
  - *Architecture Warning:* Background `#FEF7E0`, Text `#B06000`.

### Cards & Solution Blocks
- Surface `#FFFFFF`, border radius `1.5rem` (24px), border `1px solid #DADCE0`.
- Padding: `1.5rem` desktop, `1rem` mobile.
- Header block includes Google Cloud service icon (40x40 container with soft tint), title in `headline-sm`, pricing estimates in `headline-md`, and metadata tags aligned via flex wrap.

### Stepper & Recommendation Wizard Controls
- **Step Trackers:** Horizontal rail with numbered circular nodes (32px diameter). Active step: filled `#1A73E8` with white typography; completed step: `#34A853` with check icon; inactive step: `#F1F3F4` with `#5F6368` label.
- **Mobile Progress:** Replaces full stepper with a sticky top segmented linear progress bar (4px height, `#1A73E8` fill, `#E8EAED` track) with step indicators (e.g., "Bước 2 trên 5").

### Form Fields & Inputs
- Outlined style with floating labels (`label-md`).
- Default: `1px solid #DADCE0` on `#FFFFFF` fill, 8px corner radius.
- Active / Focus: `2px solid #1A73E8`, outline offset 0.
- Touch Targets: Minimum 48px height across all mobile form controls.

### Checkboxes & Radios
- 20x20px container with 4px border radius for checkboxes, circular for radios.
- Unchecked: `2px solid #5F6368`.
- Checked: `#1A73E8` fill with sharp white glyphs. Smooth scaling transition (150ms ease-out).

### Cost Calculator Drawer (Product Specific)
- Persistent floating bottom sheet on mobile, anchored right-sidebar on desktop.
- Displays running monthly estimate in Vietnamese Đồng (VND) alongside USD conversion, tier breakdown tags, and immediate architecture deploy links.