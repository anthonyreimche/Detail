# Detail for Safelight

The Develop **Detail** panel: Sharpening, and the sliders for Safelight's
built-in noise reduction.

- **Sharpening:** Amount, Radius, Detail (halo control) and Masking (0
  sharpens everything, 100 only edges).
- **Noise Reduction:** Luminance with its Detail, Contrast, Shadows and
  Highlights, and Colour with its Detail and Smoothness.
- Hold **Alt** or **Ctrl** while dragging a slider to preview it on the
  canvas: Masking shows the edges it keeps, Detail the edge signal, the
  luminance sliders the image in grey, and the colour sliders its colour
  noise against grey.
- A denoiser extension shows its own controls in place of the noise sliders.
- Masks get relative Texture, Clarity, Dehaze and Sharpness of their own.

Right-click the panel's header and choose **Reset to defaults** to put every
slider back as one step.

Until Safelight 3.2.0 this panel was built in. It keeps the built-in panel's
id (`core.detail`), so layouts saved before then keep it where it was, and
photos keep their settings. Noise reduction is Safelight's own and keeps
rendering while this extension is off or uninstalled; sharpening doesn't, and
Develop says so for photos that sharpen.

## Release lines

A release's major version is its line, the process version its stage text was
written for. Sharpening never differed between process versions, so every
line carries the same text.

## Development

```bash
npm install
npm run typecheck
npm run build    # dist/index.js, the file Safelight loads
npm test         # vitest; the bundle checks read dist/, so build first
npm run check    # all three, in that order
```

`test/detail.test.tsx` pins the stage text with the same hash as Safelight's
own copy (`src/rendering/webgl/essential-stages.test.ts` in the app). Change
both together.
