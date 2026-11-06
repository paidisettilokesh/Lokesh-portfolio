# Lokesh Paidisetti — Portfolio

A responsive portfolio for Lokesh Paidisetti, a Computer Science student and AI-focused web developer. The site presents independent projects, services of interest, internship and education history, current toolkit, and contact details.

## Run locally

Requires Node.js 18 or later. There are no runtime packages to install.

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build and preview

```bash
npm run build
npm run preview
```

The static production files are written to `dist/`. No backend, API key, database, or deployment step is required. The contact inquiry button opens the visitor's email application with a pre-filled subject line.

## Architectural 3D city

The hero scene uses native WebGL geometry to keep the city lightweight and avoid downloading a 3D model or third-party runtime.

- Drag with a mouse or touch to orbit the city.
- Use the scroll wheel / trackpad to zoom.
- Use the `+`, `−`, and reset controls.
- Focus the canvas and use arrow keys and `+` / `−` for keyboard control.
- Labeled city markers navigate to Work, Services, Journey, and Contact.
- The city renders on demand instead of continuously consuming GPU time while idle.
- Pixel ratio is capped more aggressively on small screens.
- If WebGL cannot start or its context is lost, a labeled fallback and the section links remain available.
- Reduced-motion preferences are respected by the page transitions and reveal effects.

## Design details

- Deep navy, warm ivory, muted teal, and restrained amber palette.
- Editorial typography with a compact mono label system.
- Fixed navigation with current-section indication and keyboard-operable mobile menu.
- Conceptual UI illustrations are identified as visuals, not represented as actual application screenshots.
- Project architecture strips explain the high-level implementation flow.
- Subtle perspective response on project visuals and service tiles is limited to fine-pointer devices.

## Content and accuracy

Projects are described as independent builds, not client engagements. The skills section separates programming foundations from project-based experience. There are no client testimonials, fictional outcomes, unsupported metrics, or résumé download. Syntra AI links to the supplied GitHub profile because a direct repository URL was not provided.
