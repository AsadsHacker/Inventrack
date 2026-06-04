---
name: Industrial Intelligence
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c1c6d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8b90a0'
  outline-variant: '#414755'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e69'
  primary-container: '#4b8eff'
  on-primary-container: '#00285c'
  inverse-primary: '#005bc1'
  secondary: '#ffb95f'
  on-secondary: '#472a00'
  secondary-container: '#ee9800'
  on-secondary-container: '#5b3800'
  tertiary: '#ffb2b7'
  on-tertiary: '#67001b'
  tertiary-container: '#ff516a'
  on-tertiary-container: '#5b0017'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b7'
  on-tertiary-fixed: '#40000d'
  on-tertiary-fixed-variant: '#92002a'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
  signal-blue: '#007AFF'
  signal-amber: '#F59E0B'
  signal-rose: '#F43F5E'
  signal-teal: '#14B8A6'
  slate-950: '#020617'
  slate-50: '#F8FAFC'
  glass-surface: rgba(30, 41, 59, 0.7)
typography:
  display-kpi:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-sm: 12px
  margin-md: 24px
  margin-lg: 40px
  bento-gap: 16px
---

## Brand & Style

This design system embodies the concept of a **Diagnostic Instrument**. It is engineered for high-stakes industrial environments where clarity, speed of thought, and predictive foresight are paramount. The brand personality is authoritative yet refined, shifting away from passive monitoring toward proactive intelligence.

The visual style is a sophisticated fusion of **Minimalism** and **Tactile Skeuomorphism**. By utilizing a "Bento Box" modular layout, the system organizes high-density information into digestible, hierarchical clusters. The aesthetic is "Consumerized Industrial"—it maintains the rigorous discipline of enterprise software while adopting the polished, sensory-rich interfaces of high-end consumer technology. Every element is designed to feel physical and deliberate, reducing cognitive load through spatial awareness and muscle-memory-focused interaction.

## Colors

The palette is rooted in a **True Black / Deep Slate** foundation to reduce eye strain during 12-hour shifts and to provide a high-contrast stage for data. 

- **Monochromatic Base:** A range of deep slates and crisp off-whites handles 90% of the UI chrome, ensuring the interface remains quiet and non-distracting.
- **Signal Colors:** Chromatic impact is reserved strictly for utility. **Electric Blue** (Primary) denotes interaction and focus; **Amber** warns of predictive low-stock or threshold breaches; **Rose** signals critical failures or shipment delays; **Teal** confirms healthy system states.
- **Glassmorphism:** Translucent layers are utilized for secondary overlays and command interfaces, allowing the user to maintain spatial context of underlying geospatial maps or complex grids.

## Typography

The typography system prioritizes **Diagnostic Clarity**. **Hanken Grotesk** is the primary typeface, chosen for its sharp, contemporary geometry and exceptional legibility in dense dashboards.

- **KPI Metrics:** Large display styles are used for critical "Health Scores," ensuring the most vital data is visible from a distance.
- **Data Attributes:** **JetBrains Mono** is introduced for technical values, coordinates, and "Days of Stock Remaining" to provide a clear distinction between narrative labels and variable data.
- **Hierarchy:** Strong weight contrasts and purposeful use of uppercase monospaced labels guide the eye through the "Bento Box" modules.

## Layout & Spacing

The layout is governed by a **Modular Bento Grid**. This approach groups related metrics and visualizations into distinct rectangular containers of varying sizes, creating a clear visual hierarchy of information density.

- **Grid Logic:** A 12-column fluid grid system on desktop, collapsing to a single column on mobile. Containers should span 3, 4, 6, or 12 columns depending on data priority.
- **L-Shaped Navigation:** A fixed left-hand rail for global modules combined with a top-bar for breadcrumbs and the Cmd+K Command Bar, maximizing the central workspace.
- **Progressive Disclosure:** Spacing is generous between major modules (`bento-gap`) but tight within containers to maintain high data density. Secondary details are hidden behind interaction layers to prevent data paralysis.

## Elevation & Depth

Hierarchy is established through **Tactile Layering** and **Tonal Depth** rather than traditional flat shadows.

- **Surface Tiers:** The base layer is the "True Black" workspace. Bento modules sit on the "Surface-1" tier with a subtle 1px border of high-contrast slate.
- **Subtle Skeuomorphism:** Buttons and interactive cards feature ultra-soft, layered shadows with a slight top-down light source effect, making them appear physically raised and "clickable."
- **Glassmorphism Overlays:** Modals, dropdowns, and the Command Bar use a high-refraction backdrop blur (20px-30px) and a semi-transparent slate fill. This maintains "Spatial Awareness" by allowing the user to see the obscured data's color-coded signals beneath the overlay.

## Shapes

The shape language balances industrial precision with modern approachability. 

- **Bento Containers:** Use a `rounded-lg` (16px) corner radius to soften the high-density data.
- **Interactive Elements:** Buttons and input fields follow the `rounded-md` (8px) standard, providing enough curve to feel tactile but enough sharpness to remain professional.
- **Status Indicators:** Small, circular dots or "pill" badges for status tags to provide a distinct silhouette against the rectangular grid.

## Components

- **High-Density Cards:** Each card in the Bento grid must include a header with a monospaced label and a primary KPI. Secondary sparklines or status indicators should be tucked into the bottom right.
- **Tactile Buttons:** Primary buttons use the **Electric Blue** fill with a subtle inner glow on the top edge to simulate depth. Secondary buttons are ghost-style with a 1px border.
- **Translucent Overlays:** Used for the Cmd+K interface. The background must blur the dashboard behind it, maintaining the visual "anchor" to the current task.
- **Status Indicators:** Use the "Signal Color" palette. Critical alerts (Rose) should feature a subtle "pulse" animation if immediate action is required.
- **Input Fields:** Dark-filled surfaces with a high-contrast border that glows Electric Blue on focus.
- **Geospatial Maps:** Custom dark-themed MapBox styles with translucent data overlays that follow the system's transparency and rounding rules.