# Auto Maker Website

A Greek-language automotive bodywork and painting website built with HTML, CSS and vanilla JavaScript.

## Features

- Business and service information with contact links.
- Before/after image comparison sliders.
- Responsive photo carousel and full-screen image previews.
- A static structure suitable for GitHub Pages hosting.

## Run locally

No application build or package installation is required. Open `index.html` in a browser, or serve this directory with a local static server. For example, if Python 3 is installed:

```sh
python -m http.server 8000
```

Then open `http://localhost:8000`.

The page loads Tailwind CSS and Font Awesome from external CDNs, so internet access is needed for their styles. This repository uses Tailwind's browser CDN rather than a generated production stylesheet.

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | Page content and layout |
| `style.css` | Custom styles and comparison sliders |
| `script.js` | Gallery, autoplay and image-modal interactions |
| `CNAME` | GitHub Pages custom-domain configuration |
| Image files | Business photographs and before/after examples |

## Checks

Requires Node.js 18 or newer for the regression tests; the website itself does not require Node.js.

```sh
node --check script.js
node --test tests/gallery.test.cjs
```

The tests cover carousel bounds and timer behavior using a simulated browser environment. Manually verify desktop/mobile layout, comparison sliders, gallery navigation, modal closing and contact links before publishing visual changes. Large source photographs remain an opportunity for image optimization.
