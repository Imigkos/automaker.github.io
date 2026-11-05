# Auto Maker

A Greek-language automotive bodywork and painting website built with HTML, Tailwind CSS and vanilla JavaScript modules. GitHub Pages serves the static files.

## Features

- Business information and direct phone, email and map links.
- Two independent before/after image comparisons.
- A responsive gallery showing three photographs on desktop and one on mobile.
- An image viewer with keyboard opening, Escape-to-close and focus restoration.
- Autoplay pauses during interaction, while the viewer is open, and in hidden tabs; reduced-motion preferences disable autoplay.

## Local development

Requires Node.js 18 or newer and npm.

```sh
npm ci
npm run build
```

Serve the repository with a static HTTP server, for example:

```sh
python -m http.server 8000
```

Open http://localhost:8000. JavaScript uses native modules, so use an HTTP server rather than opening the HTML file directly. Visitors do not need Node.js or npm.

## Source structure

| Path                      | Responsibility                                                   |
| ------------------------- | ---------------------------------------------------------------- |
| index.html                | Content, layout and accessible control labels                    |
| script.js                 | Application initialization                                       |
| scripts/gallery.js        | Carousel state, rendering, event handling and playback lifecycle |
| scripts/gallery-images.js | Ordered gallery photo paths                                      |
| scripts/modal.js          | Image viewer and keyboard/focus behavior                         |
| scripts/comparisons.js    | Before/after range controls                                      |
| styles/site.css           | Tailwind directives and custom comparison styles                 |
| tailwind.config.cjs       | Content scanning and brand colors                                |
| assets/site.css           | Generated production stylesheet, committed for Pages hosting     |
| tests/site.test.js        | State and DOM regression tests                                   |
| CNAME                     | Existing custom-domain configuration                             |

The production stylesheet removes Tailwind's runtime CDN dependency. Font Awesome still loads from its existing CDN.

## Making changes

Edit photo order in scripts/gallery-images.js; image paths are relative to index.html. After editing CSS or HTML utility classes, run npm run build and commit assets/site.css. CSS image URLs resolve relative to that generated stylesheet. Keep business content, image assets and domain configuration accurate.

## Validation

```sh
npm run format:check
npm run check
npm run build
npm test
```

Use npm run format to format source files. CI runs these checks and rejects stale generated CSS. Tests cover carousel bounds, responsive changes, playback pause conditions, keyboard interactions, modal closing/focus restoration, independent comparison controls, missing elements and local asset paths. DOM tests use jsdom and do not replace a visual browser check.

The refactor preserves the original desktop and mobile section dimensions. Before publishing future layout changes, compare both sizes and exercise navigation, comparisons and the image viewer in a browser. Original high-resolution photographs remain a separate image-optimization opportunity.
