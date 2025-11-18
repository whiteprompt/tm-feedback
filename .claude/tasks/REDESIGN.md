# Product Requirements Document (PRD)
## Home Section Redesign - Phase 1

**Project:** Site-wide Style Redesign  
**Phase:** 1 of 5 (Home Section)  
**Version:** 1.0  
**Last Updated:** November 17, 2025  
**Design Reference:** [Whiteprompt - From Idea to MVP](https://www.whiteprompt.com/from-idea-to-mvp)

---

## 1. Overview

### 1.1 Objective
Redesign the Home section of the application to match the modern, clean aesthetic of Whiteprompt's design system, creating a professional and engaging first impression for users.

### 1.2 Design Philosophy
- **Minimalist & Clean:** Focus on white space, clarity, and simplicity
- **AI-Forward Messaging:** Emphasize modern technology and innovation
- **Professional Yet Approachable:** Balance corporate credibility with user-friendliness
- **Action-Oriented:** Clear CTAs and intuitive navigation

---

## 2. Design System (Based on Whiteprompt Reference)

### 2.1 Color Palette

**Primary Colors:**
- **Background:** `#1A1A1A` (Dark charcoal) → Tailwind: `bg-gray-900` or custom `bg-[#1A1A1A]`
- **Primary Text:** `#FFFFFF` (White) → Tailwind: `text-white`
- **Secondary Text:** `#A0A0A0` (Light gray) → Tailwind: `text-gray-400`

**Accent Colors:**
- **Primary Accent (Cyan):** `#00D9FF` → Tailwind: `bg-cyan-400` or custom `bg-[#00D9FF]`
- **Secondary Background:** `#4A4D57` (Medium gray) → Tailwind: `bg-gray-700`
- **Borders:** `#3A3D45` (Subtle dark gray) → Tailwind: `border-gray-700`
- **Badge/Pill:** `#3D4068` (Purple-tinted) → Tailwind: custom `bg-[#3D4068]`

**Status Colors (if needed):**
- **Success:** `#10B981` (Green)
- **Info:** `#3B82F6` (Blue)
- **Warning:** `#F59E0B` (Amber)
- **Error:** `#EF4444` (Red)

### 2.2 Typography

**Font Family:**
- Primary: Modern sans-serif similar to Inter or system fonts
- Tailwind: `font-sans` (default) or custom font-family
- Recommended: `'Inter', 'Helvetica Neue', Arial, sans-serif`

**Font Sizes & Weights (with Tailwind Classes):**
- **Hero Headline:** 48-64px → `text-5xl md:text-6xl lg:text-7xl`, `font-bold`
- **Section Heading:** 32-40px → `text-3xl md:text-4xl`, `font-semibold`
- **Subsection Heading:** 24-28px → `text-2xl md:text-3xl`, `font-semibold`
- **Body Text:** 16-18px → `text-base md:text-lg`, `font-normal`
- **Small Text:** 14px → `text-sm`, `font-normal`
- **CTA Button Text:** 16px → `text-base`, `font-medium`

**Line Heights (Tailwind):**
- Headlines: `leading-tight` (1.25)
- Body text: `leading-relaxed` (1.625)
- Buttons: `leading-normal` (1.5)

### 2.3 Spacing System
Use Tailwind's default 4px base spacing scale:
- **Base unit:** 4px (1 unit in Tailwind)
- **Common spacing:** 
  - `space-2` (8px)
  - `space-4` (16px)
  - `space-6` (24px)
  - `space-8` (32px)
  - `space-12` (48px)
  - `space-16` (64px)
  - `space-24` (96px)
- **Section padding:** `py-16 md:py-24` (64-96px top/bottom)
- **Content max-width:** `max-w-7xl` (1280px) or `max-w-6xl` (1152px)

### 2.4 Components

**Buttons:**
- **Primary Button (Cyan):**
  - Classes: `bg-cyan-400 text-gray-900 px-8 py-3 rounded-lg font-medium hover:bg-cyan-300 transition-colors`
  - Background: Cyan `#00D9FF`
  - Text: Dark gray/black
  
- **Secondary Button (White):**
  - Classes: `bg-white text-gray-900 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors`
  - Background: White
  - Text: Dark gray/black

- **Outlined Button:**
  - Classes: `border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors`
  - Border: White
  - Text: White
  - Hover: Subtle white overlay

**Cards:**
- Classes: `bg-gray-800 border border-gray-700 rounded-xl p-8 shadow-lg`
- Background: Dark gray `#4A4D57` or `bg-gray-800`
- Border: Subtle gray
- Border-radius: `rounded-xl` (12px)
- Padding: `p-8` (32px)
- Box-shadow: `shadow-lg` for subtle depth

**Badge/Pills:**
- Classes: `bg-[#3D4068] text-white px-4 py-2 rounded-full text-sm font-medium`
- Background: Purple-tinted dark
- Text: White
- Border-radius: Full rounded

### 2.5 Logo Integration
- Use Whiteprompt's style: **white** text with **cyan** accent on "prompt"
- Logo format: `white` + `prompt` (with cyan color on "prompt")
- Example structure: `<span class="text-white">white</span><span class="text-cyan-400">prompt</span>`
- Logo should be simple, clean, and scalable
- Size in navigation: `text-2xl md:text-3xl` with appropriate padding
- Include the arrow/chevron symbol if desired: `⟩` in cyan

---

## 3. Home Section - Detailed Requirements

### 3.1 Hero Section

**Layout:**
- Full-width section with centered content
- Background: `bg-gray-900` (dark charcoal)
- Container: `max-w-7xl mx-auto px-4 md:px-8`
- Text color: `text-white`

**Content Elements:**
1. **Badge/Category Tag** (Optional)
   - Small pill badge above headline
   - Classes: `bg-[#3D4068] text-white px-4 py-2 rounded-full text-sm font-medium inline-block mb-6`
   - Example: "Discovery & Design"

2. **Main Headline**
   - Large, bold text
   - Classes: `text-5xl md:text-6xl lg:text-7xl font-bold leading-tight`
   - Format: "[Value Proposition] in [Timeframe/Benefit]"
   - Example style: "From idea to MVP in 8 weeks"
   - Color: `text-white`

3. **Subheadline**
   - Classes: `text-lg md:text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto`
   - 1-2 sentences explaining the value
   - Color: `text-gray-400`

4. **CTA Buttons**
   - Container: `flex flex-col sm:flex-row gap-4 justify-center`
   - Primary CTA: "Schedule a call" (White button with arrow icon)
     - Classes: `bg-white text-gray-900 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2`
   - Secondary CTA: "Learn more" (Outlined button)
     - Classes: `border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors`

5. **Hero Visual**
   - Animated code editor GIF/illustration similar to Whiteprompt
   - Classes: `mt-12 rounded-xl shadow-2xl border border-gray-700 overflow-hidden`
   - Shows product in action (coding interface, dashboard, etc.)
   - Responsive: `w-full max-w-5xl mx-auto`

**Spacing:**
- Section: `py-16 md:py-24 lg:py-32`
- Vertical gap between elements: `space-y-6 md:space-y-8`
- Text centering: `text-center`

---

### 3.2 Value Proposition Section

**Design Pattern:** Step-by-step process cards (like Whiteprompt's 5-D Method)

**Layout:**
- Grid layout with 3-5 steps
- Background: `bg-gray-900` or alternating `bg-gray-800/50`
- Container: `max-w-7xl mx-auto px-4 md:px-8`
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`

**Each Card Contains:**
- Classes: `bg-gray-800 border border-gray-700 rounded-xl p-8 hover:border-cyan-400 transition-all duration-300`
- Icon or emoji (48x48px): `text-4xl mb-4`
- Step number or label: `text-cyan-400 text-sm font-semibold mb-2 uppercase tracking-wide`
- Heading: `text-2xl font-semibold text-white mb-3`
- Description: `text-base text-gray-400 leading-relaxed`

**Content Structure:**
- Section heading: `text-3xl md:text-4xl font-semibold text-white text-center mb-12`
- Example: "The 5-Step Method: Your Path to Success"
- Brief intro paragraph (optional): `text-lg text-gray-400 text-center max-w-3xl mx-auto mb-12`

**Spacing:**
- Section: `py-16 md:py-24`
- Grid gap: `gap-8`
- Card padding: `p-8`

---

### 3.3 Features Overview

**Layout:**
- Full-width sections (no alternating for dark theme)
- Background: `bg-gray-900` 
- Container: `max-w-7xl mx-auto px-4 md:px-8`
- Grid for each feature: `grid grid-cols-1 lg:grid-cols-2 gap-12 items-center`

**Each Feature Block Contains:**
1. **Visual**
   - Product screenshot or illustration
   - Classes: `rounded-xl border border-gray-700 shadow-2xl overflow-hidden`
   - Consider adding subtle glow effect: `shadow-cyan-500/10`
   - Responsive: `w-full h-auto`

2. **Content**
   - Container: `space-y-4`
   - Feature headline: `text-3xl md:text-4xl font-semibold text-white`
   - Description paragraph: `text-base md:text-lg text-gray-400 leading-relaxed`
   - Bullet points or key benefits: 
     - List: `space-y-3 mt-6`
     - Each item: `flex items-start gap-3`
     - Icon: `text-cyan-400 mt-1 flex-shrink-0`
     - Text: `text-gray-400`
   - Optional "Learn More" link: `text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-2 mt-4`

**Spacing:**
- Section per feature: `py-16 md:py-20`
- Gap between image and text: `gap-12 lg:gap-16`
- Max 3-5 key features
- Separator between features: `border-t border-gray-800` (optional)

---

### 3.4 Social Proof / Testimonials (Optional)

**Layout:**
- Centered section
- Background: `bg-gray-800/50` or `bg-gray-900`
- Container: `max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24`

**Elements:**
- Section heading: `text-3xl md:text-4xl font-semibold text-white text-center mb-12`
- Example: "Trusted by Teams Like Yours"
- Grid of testimonials: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`
- Each testimonial card:
  - Classes: `bg-gray-800 border border-gray-700 rounded-xl p-8`
  - Quote text: `text-lg text-gray-300 italic mb-4`
  - Author name: `text-white font-semibold`
  - Title/Company: `text-sm text-gray-400`
  - Optional: Company logo with `opacity-50 hover:opacity-100 transition-opacity`

---

### 3.5 Final CTA Section

**Layout:**
- Full-width section
- Background: `bg-gradient-to-b from-gray-900 to-gray-800` or solid `bg-gray-900`
- Border top: `border-t border-gray-800` for subtle separation
- Container: `max-w-4xl mx-auto px-4 md:px-8 py-20 md:py-28 text-center`

**Content:**
- Compelling headline: `text-3xl md:text-5xl font-bold text-white mb-6`
- Brief description: `text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto`
- Primary CTA button: 
  - Classes: `bg-cyan-400 text-gray-900 px-10 py-4 rounded-lg font-semibold text-lg hover:bg-cyan-300 transition-colors inline-flex items-center gap-2`
  - Include arrow icon: `→` or chevron
- Optional secondary text or link: `text-sm text-gray-500 mt-6`
  - Example: "No credit card required" or "Free consultation"

---

## 4. Responsive Behavior

### 4.1 Breakpoints
- **Desktop:** 1200px and above
- **Tablet:** 768px - 1199px
- **Mobile:** Below 768px

### 4.2 Mobile Adaptations
- Hero text: Reduce to 32-40px
- Stack all horizontal layouts vertically
- Full-width buttons on mobile
- Reduce section padding to 48px
- Cards stack in single column
- Images scale to 100% width

---

## 5. Interactions & Animations

### 5.1 Hover States
- Buttons: Subtle color change (defined in components)
- Links: Underline or color change to `#333333`
- Cards: Subtle shadow increase or border color change

### 5.2 Scroll Animations (Optional)
- Fade-in on scroll for sections
- Use subtle, professional animations
- Intersection Observer for performance

### 5.3 Loading States
- Skeleton screens for dynamic content
- Smooth transitions (0.3s ease)

---

## 6. Technical Implementation Notes

### 6.1 Tailwind CSS with MCP Server
**CRITICAL: Use Tailwind CSS MCP Server for Implementation**

All styling must be implemented using Tailwind CSS with the MCP server integration to ensure:
- Accurate utility class usage
- Design system consistency
- Best practices for responsive design
- Optimized class combinations
- Real-time validation of Tailwind classes

**Development Workflow:**
1. Connect to Tailwind CSS MCP server before starting implementation
2. Use MCP server to query appropriate Tailwind classes for each component
3. Validate color codes against Tailwind's color palette
4. Ensure responsive modifiers are correctly applied
5. Leverage MCP server for custom configuration guidance

**Benefits:**
- Prevents invalid or deprecated class usage
- Ensures consistent spacing using Tailwind's spacing scale
- Provides autocomplete and validation for utility classes
- Optimizes bundle size by using only necessary classes

### 6.2 Performance
- Optimize images (WebP format, lazy loading)
- Minimize CSS and JS
- Use Tailwind's JIT (Just-In-Time) compiler
- Purge unused CSS in production
- Target Core Web Vitals:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1

### 6.2 Accessibility
- Semantic HTML5 elements
- ARIA labels where needed
- Keyboard navigation support
- Color contrast ratio: Minimum AA compliance (4.5:1)
- Focus indicators visible
- Alt text for all images

### 6.3 SEO Considerations
- Proper heading hierarchy (H1 → H6)
- Meta descriptions
- Structured data where applicable
- Clean URL structure

---

## 7. Success Metrics

### 7.1 Quantitative
- Bounce rate reduction by 15%
- Time on page increase by 20%
- CTA click-through rate increase by 25%
- Mobile engagement increase by 30%

### 7.2 Qualitative
- User feedback on visual appeal
- A/B testing on different headlines
- Heatmap analysis of user interactions

---

## 8. Development Phases

### Phase 1.1: Setup & Foundation
- [ ] Set up design system variables (colors, typography, spacing)
- [ ] Create reusable component library
- [ ] Implement responsive grid system

### Phase 1.2: Hero Section
- [ ] Build hero layout
- [ ] Implement CTA buttons
- [ ] Add hero visual/animation
- [ ] Mobile responsive adjustments

### Phase 1.3: Content Sections
- [ ] Value proposition cards
- [ ] Feature blocks (alternating layout)
- [ ] Testimonials section (if applicable)

### Phase 1.4: Final CTA & Polish
- [ ] Build final CTA section
- [ ] Add animations and interactions
- [ ] Cross-browser testing
- [ ] Performance optimization

### Phase 1.5: QA & Launch
- [ ] Accessibility audit
- [ ] Responsive testing (all devices)
- [ ] User acceptance testing
- [ ] Deploy to production

---

## 9. Dependencies & Constraints

### 9.1 Dependencies
- Design assets (logo, icons, images)
- Content copy finalized
- Brand guidelines approved

### 9.2 Constraints
- Must maintain existing functionality
- No disruption to user sessions
- Backend API unchanged for Phase 1

---

## 10. Next Phases

After Home section completion:
- **Phase 2:** My Profile
- **Phase 3:** My Projects  
- **Phase 4:** My Requests - Leaves
- **Phase 5:** My Requests - Expense Refunds

Each phase will follow the same design system established in Phase 1.

---

## 11. Approval & Sign-off

**Design Approved by:** _______________ Date: ___/___/___  
**Technical Lead Approved by:** _______________ Date: ___/___/___  
**Product Owner Approved by:** _______________ Date: ___/___/___

---

## Appendix A: Design Reference Screenshots

*(In actual PRD, include screenshots from Whiteprompt reference page)*

## Appendix B: Asset Inventory

**Required Assets:**
- [ ] Logo (SVG format, multiple sizes)
- [ ] Hero illustration/animation
- [ ] Feature screenshots
- [ ] Icons for value proposition cards
- [ ] Company/testimonial logos

## Appendix C: Content Template

**Hero Section:**
- Headline: [To be provided]
- Subheadline: [To be provided]
- CTA 1 text: [To be provided]
- CTA 2 text: [To be provided]

*[Continue for each section]*