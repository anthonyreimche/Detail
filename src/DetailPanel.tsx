// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// The Develop "Detail" panel: Sharpening, and the noise-reduction sliders of
// core's built-in noise reduction, which core renders whether this extension
// runs or not. A denoiser extension that fills core's develop-detail slot
// shows its own controls in their place (core also stops applying the
// built-in). Holding Alt or Ctrl while dragging a slider shows its preview on
// the canvas. The per-mask instance has the local detail controls the masks'
// display pass supports; noise reduction has no per-mask path.

import { React, api } from "./rt";
import type { DetailPreview, DevelopParams, MaskDetail, MaskPanelContribution } from "./safelight";
import { cls } from "./styles";

interface SliderDef {
  key: keyof DevelopParams;
  label: string;
  min: number;
  max: number;
  step: number;
  preview: DetailPreview;
}

// Core's defaults, which a double-click on the track goes back to.
export const DEFAULTS: DevelopParams = {
  sharpening: 25,
  sharpenRadius: 1.0,
  sharpenDetail: 25,
  sharpenMasking: 0,
  luminanceNR: 0,
  luminanceNRDetail: 50,
  luminanceNRContrast: 0,
  luminanceNRShadows: 0,
  luminanceNRHighlights: 0,
  colorNR: 25,
  colorNRDetail: 50,
  colorNRSmoothness: 50,
};

const SHARPENING: SliderDef[] = [
  { key: "sharpening", label: "Amount", min: 0, max: 150, step: 1, preview: 3 },
  { key: "sharpenRadius", label: "Radius", min: 1, max: 3, step: 0.1, preview: 3 },
  { key: "sharpenDetail", label: "Detail", min: 0, max: 100, step: 1, preview: 2 },
  { key: "sharpenMasking", label: "Masking", min: 0, max: 100, step: 1, preview: 1 },
];

const LUMINANCE_NR: SliderDef[] = [
  { key: "luminanceNR", label: "Luminance", min: 0, max: 100, step: 1, preview: 3 },
  { key: "luminanceNRDetail", label: "Detail", min: 0, max: 100, step: 1, preview: 3 },
  { key: "luminanceNRContrast", label: "Contrast", min: 0, max: 100, step: 1, preview: 3 },
  { key: "luminanceNRShadows", label: "Shadows", min: 0, max: 100, step: 1, preview: 3 },
  { key: "luminanceNRHighlights", label: "Highlights", min: 0, max: 100, step: 1, preview: 3 },
];

const COLOR_NR: SliderDef[] = [
  { key: "colorNR", label: "Color", min: 0, max: 100, step: 1, preview: 4 },
  { key: "colorNRDetail", label: "Detail", min: 0, max: 100, step: 1, preview: 4 },
  { key: "colorNRSmoothness", label: "Smoothness", min: 0, max: 100, step: 1, preview: 4 },
];

export const DETAIL_KEYS: (keyof DevelopParams)[] = [...SHARPENING, ...LUMINANCE_NR, ...COLOR_NR].map((s) => s.key);

function SliderGroup({ title, sliders }: { title: string; sliders: SliderDef[] }) {
  const { Slider } = api.components;
  const useDevelopStore = api.stores.useDevelopStore;
  const params = useDevelopStore((s) => s.params);
  const setParam = useDevelopStore((s) => s.setParam);
  const commitEdit = useDevelopStore((s) => s.commitEdit);
  const setSharpenViz = useDevelopStore((s) => s.setSharpenViz);

  return (
    <div>
      {title && <div className={cls.heading}>{title}</div>}
      <div className={cls.sliders}>
        {sliders.map((s) => (
          <Slider
            key={s.key}
            label={s.label}
            value={params[s.key]}
            min={s.min}
            max={s.max}
            step={s.step}
            defaultValue={DEFAULTS[s.key]}
            onChange={(v) => setParam(s.key, v)}
            onCommit={() => void commitEdit(title ? `${title} ${s.label}` : s.label)}
            onModifierPreview={(active) => setSharpenViz(active ? s.preview : 0)}
          />
        ))}
      </div>
    </div>
  );
}

export function DetailPanel() {
  const { Panel, Slot } = api.components;
  return (
    <Panel title="Detail">
      <div className={cls.groups}>
        <SliderGroup title="Sharpening" sliders={SHARPENING} />
        <Slot
          name="develop-detail"
          fallback={
            <>
              <SliderGroup title="Noise Reduction" sliders={LUMINANCE_NR} />
              <SliderGroup title="" sliders={COLOR_NR} />
            </>
          }
        />
      </div>
    </Panel>
  );
}

// A mask's Texture, Clarity and Dehaze live here rather than in Basic,
// matching where they run in the masks' display pass.
const MASK_SLIDERS: { key: keyof MaskDetail; label: string }[] = [
  { key: "texture", label: "Texture" },
  { key: "clarity", label: "Clarity" },
  { key: "dehaze", label: "Dehaze" },
  { key: "sharpness", label: "Sharpness" },
];

function DetailMaskPanel() {
  const { Slider } = api.components;
  const scope = api.develop.useMaskScope();
  return (
    <div className={cls.sliders}>
      {MASK_SLIDERS.map((s) => (
        <Slider
          key={s.key}
          label={s.label}
          value={scope.adj[s.key]}
          min={-100}
          max={100}
          step={1}
          defaultValue={0}
          onChange={(v) => scope.setAdj({ [s.key]: v })}
          onCommit={() => scope.commit(`Mask ${s.label}`)}
        />
      ))}
    </div>
  );
}

export const DETAIL_MASK_PANEL: MaskPanelContribution = {
  component: DetailMaskPanel,
  order: 50,
  owns: MASK_SLIDERS.map((s) => s.key),
};
