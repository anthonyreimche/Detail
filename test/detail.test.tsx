// What activate() registers, the stage every line carries, and the panel: the
// sliders write their params under their group's name with core's defaults,
// Alt/Ctrl-drag turns on each slider's canvas preview, and a denoiser's
// controls take the noise sliders' place. The mask instance shifts the mask's
// own relative detail.

import { createHash } from "node:crypto";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LINE, PANEL_ID, STYLESHEET_ID, activate } from "../src/index";
import { React, initRuntime } from "../src/rt";
import type { DevelopParams, Line, ProcessingStageContribution } from "../src/safelight";
import { STAGE_ID, sharpenStage } from "../src/stages";
import { DEFAULTS, DETAIL_KEYS, DETAIL_MASK_PANEL, DetailPanel } from "../src/DetailPanel";
import manifest from "../safelight.json";
import { fakeApi } from "./support/fake-api";

/** The app's hash of this stage's text (src/rendering/webgl/essential-stages.test.ts). */
const LINE_HASH = "329aff2fafaab25f86cd516e50ffc1c228c55759ab1e6171843403ee192ee161";

/** What a line's hash covers, as the app's stageText writes it. */
const stageText = (s: ProcessingStageContribution): string =>
  JSON.stringify([s.id, s.phase, s.priority ?? null, s.anchor ?? null, s.glsl, s.helpers ?? null, s.uniforms, s.textures ?? null]);

const text = ({ derive: _, ...rest }: ProcessingStageContribution) => rest;

afterEach(cleanup);

describe("sharpenStage", () => {
  it.each([1, 2, 3] as Line[])("registers the same text on line %i, as the app froze it", (line) => {
    expect(createHash("sha256").update(stageText(sharpenStage(line))).digest("hex")).toBe(LINE_HASH);
  });

  it("runs at the sharpen anchor and declares the preview value core draws", () => {
    const stage = sharpenStage(3);
    expect(stage).toMatchObject({ id: STAGE_ID, phase: "display-adjust", anchor: "sharpen" });
    expect(stage.glsl).toContain("float sharpenViz = 0.0;");
  });

  it("binds the four sharpening sliders", () => {
    const p = { ...DEFAULTS, sharpening: 60, sharpenRadius: 1.4, sharpenDetail: 30, sharpenMasking: 12 };
    expect(sharpenStage(3).derive?.(p, { settings: (_k, f) => f })).toEqual({
      uSharpening: 60,
      uSharpenRadius: 1.4,
      uSharpenDetail: 30,
      uSharpenMasking: 12,
    });
  });
});

describe("activate", () => {
  it("registers the Detail panel, as core's core.detail did", () => {
    const rig = fakeApi();
    activate(rig.api);
    expect(rig.panels).toEqual([
      {
        id: "core.detail",
        title: "Detail",
        component: DetailPanel,
        defaultDock: { module: "develop", direction: "right", order: 8, width: 280, height: 150 },
        onReset: expect.any(Function),
        mask: DETAIL_MASK_PANEL,
      },
    ]);
    expect(PANEL_ID).toBe("core.detail");
    expect(DETAIL_MASK_PANEL).toMatchObject({ order: 50, owns: ["texture", "clarity", "dehaze", "sharpness"] });
  });

  it("resets sharpening and the noise sliders as one step from the dock header", () => {
    const rig = fakeApi({ params: { sharpening: 80, colorNR: 0 } });
    activate(rig.api);
    rig.panels[0].onReset?.();
    expect(rig.calls).toEqual([
      {
        resetParams: [
          "sharpening",
          "sharpenRadius",
          "sharpenDetail",
          "sharpenMasking",
          "luminanceNR",
          "luminanceNRDetail",
          "luminanceNRContrast",
          "luminanceNRShadows",
          "luminanceNRHighlights",
          "colorNR",
          "colorNRDetail",
          "colorNRSmoothness",
        ],
        label: "Reset Detail",
      },
    ]);
    expect(DETAIL_KEYS).toHaveLength(12);
  });

  it("registers the stage of its line and its stylesheet", () => {
    const rig = fakeApi();
    activate(rig.api);
    expect(LINE).toBe(Number(manifest.version.split(".")[0]));
    expect(LINE).toBe(3);
    expect(rig.stages.map(text)).toEqual([text(sharpenStage(LINE))]);
    expect(rig.stylesheets.map((s) => s.id)).toEqual([STYLESHEET_ID]);
    expect(rig.stylesheets[0].css).toContain("var(--color-text-muted)");
  });
});

function panel(opts?: Parameters<typeof fakeApi>[0]) {
  const rig = fakeApi(opts);
  initRuntime(rig.api);
  const view = render(<DetailPanel />);
  return { rig, view };
}

const pairs = (rig: ReturnType<typeof fakeApi>, root: ParentNode) =>
  rig.sliders(root).map((s) => [s.label, s.min, s.max, s.step, s.defaultValue]);

describe("the Detail panel", () => {
  it("draws Sharpening and the noise sliders with their ranges and core's defaults", () => {
    const { rig, view } = panel();
    expect(pairs(rig, view.container)).toEqual([
      ["Amount", 0, 150, 1, 25],
      ["Radius", 1, 3, 0.1, 1],
      ["Detail", 0, 100, 1, 25],
      ["Masking", 0, 100, 1, 0],
      ["Luminance", 0, 100, 1, 0],
      ["Detail", 0, 100, 1, 50],
      ["Contrast", 0, 100, 1, 0],
      ["Shadows", 0, 100, 1, 0],
      ["Highlights", 0, 100, 1, 0],
      ["Color", 0, 100, 1, 25],
      ["Detail", 0, 100, 1, 50],
      ["Smoothness", 0, 100, 1, 50],
    ]);
    expect(screen.getByText("Sharpening")).toBeTruthy();
    expect(screen.getByText("Noise Reduction")).toBeTruthy();
  });

  it("writes each slider's param and commits it under its group's name", () => {
    const { rig, view } = panel();
    const [amount, , , , luminance, , , , , color] = rig.sliders(view.container);
    act(() => {
      amount.onChange(70);
      amount.onCommit?.();
      luminance.onChange(20);
      luminance.onCommit?.();
      color.onChange(40);
      color.onCommit?.();
    });
    expect(rig.calls).toEqual([
      { setParam: "sharpening", value: 70 },
      { commitEdit: "Sharpening Amount" },
      { setParam: "luminanceNR", value: 20 },
      { commitEdit: "Noise Reduction Luminance" },
      { setParam: "colorNR", value: 40 },
      { commitEdit: "Color" },
    ]);
  });

  it("turns each slider's canvas preview on with Alt/Ctrl, and off again", () => {
    const { rig, view } = panel();
    const sliders = rig.sliders(view.container);
    const preview = (i: number) => {
      sliders[i].onModifierPreview?.(true);
      sliders[i].onModifierPreview?.(false);
    };
    act(() => [0, 1, 2, 3, 4, 9].forEach(preview));
    expect(rig.previews).toEqual([3, 0, 3, 0, 2, 0, 1, 0, 3, 0, 4, 0]);
  });

  it("shows a denoiser's controls in place of the noise sliders, and the sliders once it goes", () => {
    const { rig, view } = panel();
    const Wavelet = () => React.createElement("p", null, "wavelet controls");
    act(() => rig.fillSlot(Wavelet));
    expect(screen.getByText("wavelet controls")).toBeTruthy();
    expect(screen.queryByText("Noise Reduction")).toBeNull();
    expect(rig.sliders(view.container).map((s) => s.label)).toEqual(["Amount", "Radius", "Detail", "Masking"]);
    act(() => rig.fillSlot(null));
    expect(screen.getByText("Noise Reduction")).toBeTruthy();
  });

  it("shows the photo's values", () => {
    const { rig, view } = panel({ params: { sharpening: 90, colorNR: 0 } as Partial<DevelopParams> });
    const sliders = rig.sliders(view.container);
    expect(sliders[0].value).toBe(90);
    expect(sliders[9].value).toBe(0);
  });
});

describe("the mask instance", () => {
  it("shifts the mask's relative detail, and commits under the mask", () => {
    const rig = fakeApi();
    initRuntime(rig.api);
    const Mask = DETAIL_MASK_PANEL.component;
    const view = render(<Mask />);
    const sliders = rig.sliders(view.container);
    expect(sliders.map((s) => s.label)).toEqual(["Texture", "Clarity", "Dehaze", "Sharpness"]);
    for (const s of sliders) expect(s).toMatchObject({ value: 0, min: -100, max: 100, step: 1, defaultValue: 0 });
    act(() => {
      sliders[3].onChange(-40);
      sliders[3].onCommit?.();
    });
    expect(rig.mask.adj.sharpness).toBe(-40);
    expect(rig.mask.commits).toEqual(["Mask Sharpness"]);
  });
});
