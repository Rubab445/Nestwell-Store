# Nestwell

A Shopify storefront for a home & lifestyle decor brand, built on top of Shopify's [Dawn](https://github.com/Shopify/dawn) theme (v16.0.0).

Dawn provides the core commerce functionality (cart, checkout, search, accessibility scaffolding). On top of that, this project adds a fully custom set of `nestwell-*` sections for the brand's storefront, product, and about/contact pages.
Live demo: https://nestwell-l0x0fgzs.myshopify.com/?preview_theme_id=162091237600 
Password: (Password available on request)

## What's custom vs. stock

| Layer | Status |
|---|---|
| Cart, checkout, search, facets, localization | Stock Dawn — untouched |
| `sections/nestwell-*.liquid` (hero, header, footer, main product, about pages, contact, rooms/story) | Custom |
| `assets/nestwell-main-product.js` | Custom |
| Design tokens (`--nestwell-primary`, `--nestwell-surface`, etc.) and BEM-style CSS | Custom |

## Custom sections

- `nestwell-header` — sticky/scroll-shrink header, mobile nav drawer with focus trapping
- `nestwell-hero` — homepage hero with scroll-in animation
- `nestwell-footer`
- `nestwell-main-product` — product gallery, variant/swatch selector, add-to-cart
- `nestwell-about-hero`, `nestwell-about-story`, `nestwell-about-values`, `nestwell-about-gallery`, `nestwell-about-cta`
- `nestwell-contact`
- `nestwell-rooms`, `nestwell-story`
- `nestwell-product-recommendations`

## Getting started

**Requirements:** [Shopify CLI](https://shopify.dev/docs/api/shopify-cli), a Shopify store (dev store is fine).

```bash
# clone
git clone https://github.com/Rubab445/Nestwell-Store.git
cd Nestwell-Store

# connect to a store and preview locally
shopify theme dev --store your-store.myshopify.com
```

To push to a store's theme library:

```bash
shopify theme push --store your-store.myshopify.com
```

## Notable implementation details

- Responsive images throughout (`srcset`/`sizes`, `fetchpriority="high"` on the hero) rather than a single fixed-size image.
- Accessibility: `aria-expanded`/`aria-controls` on the nav toggle, keyboard Tab-cycling and Escape-to-close in the mobile drawer, `prefers-reduced-motion` respected in scroll animations.
- Product page JS was pulled out of the section file into `assets/nestwell-main-product.js` so the browser can cache it instead of re-parsing it on every page load.



## Credits

Built on [Dawn](https://github.com/Shopify/dawn) by Shopify, used under its MIT license.
