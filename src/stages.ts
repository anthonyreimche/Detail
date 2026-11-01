// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// Sharpening's block of the develop program. Until Safelight 3.2.0 it was
// core's own; its GLSL is core's, moved as written. It runs at the program's
// sharpen anchor, on the display colour, and reads core's rawLuma, lumaLod
// and the Alt/Ctrl-drag preview mode uSharpenViz, which core binds. It
// declares sharpenViz, the grey value core's preview output draws: core
// stands in 0 for it while this extension is away. The block never differed
// between process versions, so every line carries the same text.

import type { Line, ProcessingStageContribution, UniformDeclaration } from "./safelight";

export const STAGE_ID = "safelight.detail.sharpen";

const float = (key: string): UniformDeclaration => ({ key, glslType: "float", default: 0 });

const SHARPEN = `  // Capture sharpening with radius, detail (halo control), and edge masking.
  // Runs after vibrance/saturation so sharpening halos are not re-saturated.
  // sharpenViz carries the grayscale preview value when uSharpenViz is active;
  // the block also runs at amount 0 in that case so the preview is always live.
  float sharpenViz = 0.0;
  float sharpen = uSharpening / 100.0;
  if (sharpen > 0.001 || uSharpenViz > 0) {
    float lod = mix(0.5, 1.5, (uSharpenRadius - 1.0) / 2.0);
    float blur = lumaLod(srcUv, lod);
    float detail = rawLuma - blur;
    float detailFactor = uSharpenDetail / 100.0;
    float broadBlur = lumaLod(srcUv, lod + 1.0);
    detail = mix((rawLuma - broadBlur) * 0.35, detail, detailFactor);
    float mask = 1.0;
    if (uSharpenMasking > 0.001) {
      float edgeMag = abs(rawLuma - lumaLod(srcUv, 0.5));
      float threshold = (uSharpenMasking / 100.0) * 0.12;
      mask = smoothstep(threshold * 0.4, threshold, edgeMag);
    }
    if (sharpen > 0.001) c += detail * sharpen * 1.6 * mask;
    if (uSharpenViz == 1) sharpenViz = mask;                          // masking coverage
    else if (uSharpenViz == 2) sharpenViz = clamp(0.5 + detail * 4.0, 0.0, 1.0); // edge signal
    else if (uSharpenViz == 3) sharpenViz = luma(clamp(c, 0.0, 1.0)); // sharpened luminance
  }`;

/** The stage of release line `_line`: the same on every line. */
export function sharpenStage(_line: Line): ProcessingStageContribution {
  return {
    id: STAGE_ID,
    name: "Sharpening",
    phase: "display-adjust",
    anchor: "sharpen",
    glsl: SHARPEN,
    uniforms: ["uSharpening", "uSharpenRadius", "uSharpenDetail", "uSharpenMasking"].map(float),
    derive: (p) => ({
      uSharpening: p.sharpening,
      uSharpenRadius: p.sharpenRadius,
      uSharpenDetail: p.sharpenDetail,
      uSharpenMasking: p.sharpenMasking,
    }),
  };
}
