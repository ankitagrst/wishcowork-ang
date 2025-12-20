Hero + Search — Quick Visual Spec

Goal
- Make the hero feel bespoke and trustworthy (not a template). Focus messaging on one core value and one primary action.
- Make search prominent, scannable and fast (city + category + keyword). Keep layout calm and simple.

High-level proposal
- Hero: left column -> short value prop + one primary CTA + secondary CTAs (if needed).
- Right column: decorative illustration / solid accent card (no heavy photo container). Keep it minimal.
- Search: centered card immediately under the hero (desktop) or under the hero copy on mobile. Includes: City select, Category pills, Search input, Primary CTA.

Wireframe (desktop)

-------------------------------------------------------------
| HERO (accent bg #f7b355, black text)                        |
|  [Left]                          |  [Right decorative card]   |
|  H1: Short value prop            |  Illustration / emblem      |
|  P: one supporting sentence      |  small supporting text      |
|  Primary CTA (black text on accent)                         |
-------------------------------------------------------------

  [Centered Search Card]   [City] [Category pills] [search input] [CTA]

Desktop behaviors
- Search card is elevated (shadow-2xl), width 720–900px depending on viewport.
- Category pills: reveal small "coming soon" badges or disabled state.
- Primary CTA: uses accent (bg-accent-500) + black text.
- Secondary CTA: white background with mint border/text (primary color) for contrast.

Mobile behaviors
- Hero becomes single-column; value prop first, then search card, then decorative card (or reordered for emphasis).
- Category pills wrap to multiple rows; city select becomes picklist.

Accessibility notes
- Accent (#f7b355) with black text must pass contrast; if any combination fails, slightly darken accent (we have accent-600 fallback).
- Inputs have visible focus states (ring-2, ring-primary-200). All actionable elements have clear label/aria attributes.

Micro-interactions
- Buttons: subtle scale on hover (scale-102), stronger scale on active state (scale-98).
- Category pill toggle: quick color fill + micro-shadow.
- Search input: on focus, show suggestions and highlight the CTA.

Suggested implementation (HTML snippet)

<section class="relative bg-accent-400 text-black pt-12 pb-12">
  <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-center px-4 sm:px-6">
    <div>
      <h1 class="text-4xl font-bold">Premium workspaces across cities</h1>
      <p class="mt-3 text-lg text-black/80">Book desks, private offices and meeting rooms by the day or month.</p>
      <div class="mt-6 space-x-3">
        <button class="btn-primary">Search Workspaces</button>
        <a class="btn-secondary">Explore plans</a>
      </div>
    </div>
    <div class="flex justify-center">
      <!-- decorative emblem / card -->
      <div class="w-80 h-56 rounded-2xl bg-black/5 flex items-center justify-center">Emblem</div>
    </div>
  </div>
  <!-- search card below hero -->
  <div class="mx-auto mt-8 max-w-4xl px-4">
    <div class="bg-white rounded-3xl shadow-xl p-4 grid md:grid-cols-3 gap-3 items-center">
      <select class="p-3 rounded-xl border">...</select>
      <input class="col-span-2 p-3 rounded-xl border" placeholder="Search city, workspace or area" />
      <button class="btn-primary col-span-full md:col-span-1">View Workspaces</button>
    </div>
  </div>
</section>

Component state (TS overview)
- selectedCity: string
- selectedCategory: string
- keyword: string
- search(): build queryParams and navigate to /properties

Design choices rationale
- Accent card hero: unique and brand-forward without relying on stock photos (avoids template look).
- Centered search card reduces cognitive load and matches user intent (most visitors want to search quickly).
- Mint (primary) remains as subtle accent color and used for micro UI and links; accent = action color.

Next step
- I can implement this directly and run a focused pass replacing the homepage hero and search with the exact spec above.
- Or if you prefer, I can produce two quick visual mock variants (A: hero w/ small emblem; B: hero with subtle pattern texture) for you to pick.

Which do you prefer? Reply: "Implement now" or "Show visual variants".