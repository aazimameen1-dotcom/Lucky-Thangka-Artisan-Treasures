# Lucky Thangka & Artisan Treasures - Website Specification

## Project Overview
- **Project Name**: Lucky Thangka & Artisan Treasures
- **Type**: E-commerce style website for spiritual/artisan shop
- **Core Functionality**: Showcase and inquiry-based sales for high-value spiritual artifacts, thangkas, singing bowls, antiques, and paintings
- **Target Users**: Spiritual seekers, collectors, meditation practitioners, Buddhist practitioners, antique enthusiasts

## UI/UX Specification

### Layout Structure

**Header**
- Logo with Om symbol decorative element
- Navigation: Home, Thangkas, Singing Bowls, Antiques, Paintings, About, Contact
- Contact phone number display
- Mobile hamburger menu

**Hero Section**
- Full-width banner with parallax effect
- Decorative endless knot overlay
- Tagline: "Sacred Art. Sacred Sound. Timeless Treasures."
- CTA button: "Explore Collection"

**Featured Lucky Thangkas Section**
- Section title with Om symbol
- Category tabs: All, Prosperity, Healing, Protection
- Grid of 6 featured thangka cards with:
  - Image placeholder
  - Title (Green Tara, Medicine Buddha, etc.)
  - Category badge
  - Brief description
  - "Inquire to Buy" button

**Singing Bowls Collection Section**
- Section title with lotus symbol
- Filter by chakra alignment
- Grid of 6 bowl cards with:
  - Image placeholder
  - Name and chakra alignment
  - Size/frequency details
  - Healing properties
  - "Inquire to Buy" button

**Antiques & Paintings Section**
- Two columns: Antiques and Original Paintings
- Each with 4 items in grid
- Items: Copper Urlis, Brass Statues, Malas, Butter Lamps, Meditation Stools
- Kashmiri miniatures, Buddhist-inspired art, Nature pieces
- "Inquire to Buy" buttons

**Authenticity Section**
- Certificate badge designs
- "Each Thangka is blessed by a Buddhist monk"
- "Certificates of Authenticity included"
- Trust badges with icons

**Testimonials Section**
- Customer testimonials carousel
- 3-4 testimonials with customer names and locations

**Contact Section**
- Business details: Srinagar, Jammu & Kashmir, India
- Phone: +91 99066 12345
- Email: lucky@artisantreasures.in
- Map placeholder for Srinagar location
- Inquiry form with fields: Name, Email, Phone, Interest, Message

**Footer**
- Quick links
- Social media icons
- Copyright
- Decorative lotus footer border

### Visual Design

**Color Palette**
- Primary: Deep Maroon (#8B2635)
- Secondary: Terracotta (#C45C3E)
- Accent: Gold (#D4A84B)
- Background: Cream (#F5F0E6)
- Text Primary: Dark Brown (#3D2B1F)
- Text Secondary: Warm Gray (#6B5B4F)
- Card Background: Warm White (#FAF7F2)

**Typography**
- Headings: Playfair Display (serif)
- Body: Source Sans Pro (sans-serif)
- Decorative: Noto Sans for Om symbol fallback

**Spacing System**
- Section padding: 80px vertical
- Card padding: 24px
- Grid gap: 32px
- Container max-width: 1200px

**Visual Effects**
- Subtle box shadows on cards
- Hover scale on product images
- Smooth fade-in animations on scroll
- Gold gradient overlays on hero
- Decorative border patterns

### Components

**Navigation**
- Sticky header on scroll
- Active state indication
- Mobile responsive hamburger

**Product Cards**
- Image with hover zoom
- Title, description, price indicator
- Category badge
- Inquire button with hover effect

**Buttons**
- Primary: Maroon background, gold text
- Secondary: Transparent with gold border
- Hover: Scale up slightly, glow effect

**Form Inputs**
- Warm cream background
- Maroon border on focus
- Floating labels

**Decorative Elements**
- Om symbol (ॐ)
- Endless knot
- Lotus flower
- Tibetan border patterns
- Traditional mandala patterns

### Responsive Breakpoints
- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: < 768px

## Functionality Specification

### Core Features
1. Product catalog display with categories
2. Category filtering for thangkas and bowls
3. "Inquire to Buy" button opens modal or smooth scrolls to contact
4. Contact form with validation
5. Mobile navigation toggle
6. Smooth scroll to sections
7. Scroll-triggered fade-in animations

### User Interactions
- Click category tabs to filter products
- Click "Inquire to Buy" to open inquiry modal
- Submit contact form (client-side validation)
- Smooth scroll navigation
- Mobile menu toggle

### Data Handling
- Static product data in HTML/JS
- Form submission shows success message (no backend)

## Acceptance Criteria
1. ✅ Homepage loads with hero banner and all sections visible
2. ✅ All 4 main product categories displayed with items
3. ✅ Category filtering works on thangkas and bowls
4. ✅ "Inquire to Buy" buttons functional
5. ✅ Contact form validates and shows success
6. ✅ Mobile responsive on all breakpoints
7. ✅ All decorative symbols visible
8. ✅ Color palette matches specification
9. ✅ Fonts load correctly (Playfair Display, Source Sans Pro)
10. ✅ Animations smooth and functional