# Ribbons

Four Three.js studies at https://ribbons.natzke.com, recreated from Erik Natzke's 2008 Flash experiments.

- 01 Particle: particleemmiter_12, free particles, friction and ground bounce.
- 02 Cord: cord_10, connected particles and a variable-width curved cord.
- 03 Ribbon: ribbon_16, translucent curved panels with a live mouse/auto tip.
- 04 Bitmap Draw: bitmapdraw_09, color-sampled translucent ribbon accumulation. Defaults to a Natzke palette gradient; a local image can replace it. This substitutes for the original embedded sampling bitmap.

`originals/` preserves all four original folders unchanged (FLA, SWF, HTML and JS). `extracted/` contains best-effort readable ActionScript fragments extracted from the FLAs; these may include old embedded revisions or incomplete prefixes and are not authoritative exports. `web/` is the standalone modern app. Original artwork rights remain with Natzke. Three.js and Source Sans licenses are bundled in web.

Run `python3 -m http.server 8766 --directory web` and visit localhost:8766. No build or installation is required. Auto stays active until canvas click or choosing Mouse. Pause/Reset and light/dark themes are supported. Bitmap Draw's image processing stays local to the browser.

The ports preserve the main source algorithms, with modern live-head interaction and responsive bounds. They are not pixel-identical Flash emulation. Physics advances at 30 Hz; the live tip draws each browser frame. Bitmap accumulation is cleared on resize, reset or Clear.

## Release

GitHub main is development. production identifies the release uploaded to SiteGround. Package only web, never the source archive, for public hosting:

    git archive --format=zip --output=ribbons-siteground.zip production:web

Extract the archive into ribbons.natzke.com/public_html using SiteGround File Manager. The repository is private; the experiences are public. Pushes do not automatically deploy.
