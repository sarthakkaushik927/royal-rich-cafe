# Product Requirements Document
## Fine Dining Restaurant Website — Full-Bleed Image Layout (ReactJS Build)

**Prepared for:** Lovable (AI App Builder)
**Version:** 2.0 (Rebuild — corrects boxy/card layout issue from v1)
**Date:** July 2, 2026

---

## ⚠️ CRITICAL FIX FROM PREVIOUS BUILD — READ FIRST

The previous generation turned every image into a **small boxed/card image sitting next to text in a grid**. That is WRONG for this design. In the reference design, images for the Hero and Atmosphere sections are **full-bleed section backgrounds** — the photo fills 100% of the section's width and height, and text sits **on top of the image** (with a dark gradient overlay for readability), not beside it in a separate column.

**Rule for Lovable to follow exactly:**
- Hero section and "Sophisticated Atmosphere" section → image = CSS `background-image` (or absolutely-positioned `<img>` with `object-fit: cover`) covering the **entire section**, `width: 100%`, `min-height` set per section (not a fixed small box). Text is layered on top using `position: relative` / a flex container with `z-index`, NOT placed in a sibling column div.
- Do **NOT** wrap these hero/atmosphere images in a rounded card, border, shadow, or padded container. No `max-width` constraint on the image itself — it must touch all four edges of the section.
- Add a **dark gradient overlay** (`linear-gradient(to right, rgba(0,0,0,0.75), rgba(0,0,0,0.2))` or similar, direction depends on which side the text sits) between the image and the text so copy stays legible over bright parts of the photo.
- The **"Exquisite Cuisine"** section is the one exception with two images — but even there, images sit **flush/edge-to-edge** in their grid column with **no border, no card shadow, no rounded corners** — just the raw photo, with the caption text and button placed directly below it (not inside a bordered card).

If Lovable defaults to a "boxed image + text card" pattern (which most site builders do), explicitly override that default per the instructions above.

---

## 1. Tech Stack

- **Framework:** React (Vite)
- **Styling:** Tailwind CSS — use `bg-cover bg-center` utilities + custom gradient overlays for the full-bleed sections (this is the easiest way to avoid the "boxy" default)
- **Icons:** lucide-react (for the 3 feature icons in the reservation section: utensils/cuisine, wine glass/cocktails, sparkle/ambiance)
- **Animation:** Framer Motion — fade/slide-in for headings and buttons on scroll
- **Fonts (Google Fonts):**
  - Script font (e.g., "Alex Brush" or "Great Vibes") for "Welcome to"
  - Elegant serif (e.g., "Playfair Display" or "Cormorant Garamond") for all major headings ("Fine Dining Experience," "Exquisite Cuisine," "Sophisticated Atmosphere," "Reserve Your Table")
  - Clean sans-serif (e.g., "Lato" or "Poppins") for nav, body copy, form labels
- **Forms:** Native `<select>`/custom dropdown components for Date/Time/Guests — client-side only for v1

---

## 2. Design System

### Colors
| Token | Hex (approx) | Usage |
|---|---|---|
| `--bg-dark` | `#0D0B09` | Section backgrounds (non-image sections) |
| `--gold` | `#D4A24C` / `#C9A24A` | Headings, borders, button fill, icons |
| `--gold-dark-text` | `#1A1410` | Text color *on top of* gold buttons (dark, not white) |
| `--text-white` | `#F7F3EC` | Headings/text over dark or image backgrounds |
| `--text-muted` | `#C7BFB2` | Subheadings, body copy |
| `--overlay-black` | `rgba(0,0,0,0.55–0.8)` | Gradient scrim over background images |

### Typography Scale
- Script accent line ("Welcome to"): ~32–40px, italic script, white
- H1 (hero): ~48–56px, serif, gold, bold
- H2 (section titles): ~36–42px, serif, white/gold, centered
- Subheading under H2: ~16px, muted, letter-spaced, centered
- Body: ~15–16px, muted, line-height 1.6

### Buttons
- **Single style used throughout:** solid gold fill (`--gold`), dark text (`--gold-dark-text`), sharp/slightly rounded corners (~4px), medium padding (`py-3 px-8`), no border. Hover: slightly darker gold + subtle scale.
- All CTAs in this design are the same visual weight — there is no "outline" secondary button style here (unlike some other templates).

### Dividers
- Thin gold horizontal rule with extra letter-spacing, used under section captions ("Discover Our Menu", "Chef's Specialties") and flanking "Reserve Your Table" heading.

---

## 3. Section-by-Section PRD

### 3.1 Navbar
**Content:** `Home` · `Menu` · `About` · `Reservations`
**Layout:**
- Transparent background sitting directly over the hero image (no solid bar behind it in the initial view — becomes solid dark on scroll)
- Nav links centered-left or left-aligned, white/off-white text, gold underline/active state on hover
- Thin gold hairline rule beneath the entire nav bar, full width
- No logo/brand text in this version — leave a placeholder logo slot on the far left if a brand name is added later
- Mobile: collapses to hamburger → slide-in drawer with same 4 links

---

### 3.2 Hero Section — "Welcome to Fine Dining Experience"
**Content (exact copy):**
- Script line: "Welcome to"
- Main heading: "Fine Dining Experience"
- Subheading: "Savor the flavors of gourmet cuisine in an elegant ambiance"
- Button: "Book a Table"

**Layout (full-bleed):**
- ONE full-width, full-height (≈90–100vh) background image: a set dinner table with a plated steak/asparagus dish, wine glasses, and lit candles, warm low-key lighting
- Dark gradient overlay from left (strong, ~75% black) fading to right (light, ~20% black) — because the food/wine glasses sit on the right side of the photo and should stay visible, while text sits on the left in the darker region
- Text block (script line → heading → subheading → button) is **left-aligned**, vertically centered, positioned as an overlay div on top of the background image — max-width ~500–550px so it doesn't stretch across the whole section
- Button sits below the subheading with spacing (~24px)

**Do not** render this as: image-on-right-half + text-on-left-half split into two equal `<div>` columns. The image must span the full section width behind the text.

---

### 3.3 "Exquisite Cuisine" Section
**Content (exact copy):**
- H2: "Exquisite Cuisine"
- Subheading: "A Culinary Journey of Delight"
- Two feature blocks, side by side:
  1. Image: seafood/shrimp dish → Caption: "Discover Our Menu" (with small gold divider under it) → Button: "View Menu"
  2. Image: mushroom risotto dish → Caption: "Chef's Specialties" (gold divider under it) → Button: "Learn More"

**Layout:**
- Plain dark background (`--bg-dark`) for the section itself — this section is NOT a background image, it's a solid dark section containing two images
- Centered H2 + subheading at top
- Below: 2-column grid (stacks to 1 column on mobile), equal width, small gap between columns (~24–32px)
- Each image: fills its column edge-to-edge (no border, no rounded corners, no card shadow, no padding around the image) — flat rectangular photo
- Caption + gold divider + button are centered directly beneath each image, roughly 16–20px gap from image bottom

---

### 3.4 "Sophisticated Atmosphere" Section
**Content (exact copy):**
- H2: "Sophisticated Atmosphere"
- Subheading: "Dine in Style & Comfort"
- Button: "View Gallery"

**Layout (full-bleed, mirrored from Hero):**
- Full-width, full-height background image: restaurant interior with chandeliers, warm ambient lighting, dining tables and lounge seating
- Dark gradient overlay from right (strong) fading to left (light) — opposite direction from the Hero section, since here the text sits on the **right** side of the section this time
- Text block (H2 → subheading → button) is **right-aligned** (or centered-right), vertically centered, overlaying the image
- Same button style as Hero ("Book a Table" style) but labeled "View Gallery"

Same rule as Hero: this must be one continuous background image behind the whole section, not a boxed photo next to a text column.

---

### 3.5 "Reserve Your Table" Section
**Content (exact copy):**
- H2: "Reserve Your Table" (flanked by short gold horizontal rule flourishes on each side)
- Subheading: "Experience an unforgettable evening with us."
- Reservation bar: 4 elements in a single horizontal row (stacks vertically on mobile):
  1. "Select Date" dropdown
  2. "Select Time" dropdown
  3. "Guests" dropdown
  4. "Reserve Now" button (solid gold, same button style as rest of site)
- Below the reservation bar, a row of 3 icon+label feature items, separated by a thin horizontal gold divider line above them:
  1. Icon (open book/menu icon) — "Gourmet Cuisine"
  2. Icon (heart/wine glasses icon) — "Fine Wines & Cocktails"
  3. Icon (sparkle/prestige icon) — "Luxurious Ambiance"

**Layout:**
- Plain dark textured background (`--bg-dark`), centered content, generous vertical padding (this is the final visible section in the reference — treat it as the page's closing/booking section)
- Date/Time/Guests dropdowns: dark background with thin gold border, white text, small chevron icon, rounded corners (~4px), consistent height with the Reserve Now button so they align in one row
- The 3 feature icons below: evenly spaced in a row (`justify-between` or `justify-center` with gap), gold line-icon style (not filled/solid icons), small caption text in muted white beneath each icon, centered

---

## 4. Suggested Component File Structure

\`\`\`
src/
├── components/
│   ├── Navbar.jsx
│   ├── HeroSection.jsx          // full-bleed bg image + left-aligned overlay text
│   ├── ExquisiteCuisine.jsx      // solid bg + 2-col flush image grid
│   │   └── CuisineFeature.jsx    // single image + caption + button
│   ├── AtmosphereSection.jsx    // full-bleed bg image + right-aligned overlay text
│   ├── ReserveTable.jsx         // heading + reservation bar + 3 icon features
│   │   ├── ReservationForm.jsx  // Date/Time/Guests + Reserve Now, one row
│   │   └── FeatureIcon.jsx      // icon + label, reused 3x
│   └── GoldButton.jsx           // single reusable button (solid gold, dark text)
├── data/
│   └── content.js
├── assets/images/
├── App.jsx
└── main.jsx
\`\`\`

### Reusable `GoldButton` (single style, used everywhere)
\`\`\`jsx
const GoldButton = ({ children, ...props }) => (
  <button
    className="bg-[#D4A24C] text-[#1A1410] font-medium px-8 py-3 rounded
               hover:bg-[#c8963f] transition-colors duration-200"
    {...props}
  >
    {children}
  </button>
);
\`\`\`

### Full-bleed section pattern (Hero / Atmosphere) — use this exact approach
\`\`\`jsx
<section
  className="relative w-full min-h-[90vh] bg-cover bg-center flex items-center"
  style={{ backgroundImage: "url('/images/hero-table.jpg')" }}
>
  {/* gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />

  {/* content overlay */}
  <div className="relative z-10 max-w-xl px-8 md:px-20 text-left">
    <p className="font-script text-2xl text-white mb-2">Welcome to</p>
    <h1 className="font-serif text-5xl text-[#D4A24C] mb-4">Fine Dining Experience</h1>
    <p className="text-[#C7BFB2] mb-6">Savor the flavors of gourmet cuisine in an elegant ambiance</p>
    <GoldButton>Book a Table</GoldButton>
  </div>
</section>
\`\`\`
(Mirror this for the Atmosphere section: flip gradient direction to `from-black/0 to-black/75` and align content to the right with `ml-auto text-right`.)

---

## 5. Functional Requirements

- [ ] Fully responsive: desktop, tablet, mobile — on mobile, full-bleed hero/atmosphere sections keep image as background (adjust `min-height`, reduce overlay text width to full padding, keep left/right alignment or switch to centered on very small screens)
- [ ] Sticky/transparent-to-solid navbar on scroll
- [ ] Mobile hamburger menu with slide-in drawer
- [ ] "Book a Table" / "Reserve Now" opens a reservation flow (v1: can be the inline form in section 3.5, or a modal — do not duplicate logic, reuse one form)
- [ ] Date/Time/Guests dropdowns are functional client-side selects (values wired to state; submission can be a placeholder handler for v1)
- [ ] "View Menu" / "Learn More" / "View Gallery" — anchor links or route placeholders
- [ ] Lazy-load all background/section images
- [ ] Semantic HTML: `<nav>`, `<section>` per block, `<h1>`/`<h2>` hierarchy respected as above

## 6. Non-Functional Requirements

- Background images compressed/served responsively (`srcset` or CDN-resized) since full-bleed hero images are the largest asset on the page
- Text-over-image contrast must pass WCAG AA — rely on the gradient overlay, don't rely on font color alone
- No layout shift: reserve image container height before load (skeleton or fixed aspect/min-height)
- Cross-browser: Chrome, Safari, Firefox, Edge (latest 2 versions)

---

## 7. Explicit Non-Goals / Do Not Do

- ❌ Do not put hero or atmosphere images inside a bordered/rounded/shadowed `<div>` card next to a text column
- ❌ Do not use a 3-card grid layout for "Exquisite Cuisine" — this design has exactly **2** flush images side by side
- ❌ Do not add an outline-style secondary button anywhere — every button in this design is the same solid gold style
- ❌ Do not add a testimonials/reviews section or multi-column footer unless separately requested — this reference screenshot ends at the "Reserve Your Table" icon row

---

## 8. Success Criteria

- Hero and Atmosphere sections render as true full-bleed background images with overlaid text — verified by inspecting that the image element/CSS spans 100% of section width/height with no visible container edge
- "Exquisite Cuisine" renders as 2 flush, uncarded images with captions beneath, not boxed cards
- Reservation bar renders as one aligned horizontal row of 3 dropdowns + button on desktop
- Pixel-close match to reference screenshot in layout proportions, alignment (left/center/right per section), and copy