// A stand-in Safelight API over real React and zustand. The develop store holds
// Detail's twelve params and the canvas preview mode, the way core's does, and
// records every write. Core's Panel draws its children; core's Slot draws
// what a test puts in develop-detail, or its fallback; core's Slider is a stub
// that keeps the props it was last rendered with, so a test can drive it the
// way the real one would.

import * as React from "react";
import { create } from "zustand";
import type {
  DetailPreview,
  DevelopParams,
  DevelopStoreState,
  MaskDetail,
  MaskScope,
  PanelContribution,
  PanelProps,
  ProcessingStageContribution,
  SafelightAPI,
  SliderProps,
  SlotProps,
  StoreApi,
  StylesheetContribution,
  UiTokens,
} from "../../src/safelight";
import { DEFAULTS } from "../../src/DetailPanel";

export type DevelopCall =
  | { setParam: keyof DevelopParams; value: number }
  | { commitEdit: string }
  | { resetParams: (keyof DevelopParams)[]; label: string };

export const TOKENS: UiTokens = { textMuted: "var(--color-text-muted)" };

export interface Rig {
  api: SafelightAPI;
  develop: StoreApi<DevelopStoreState>;
  calls: DevelopCall[];
  /** Every preview mode the panel set, in order. */
  previews: DetailPreview[];
  panels: PanelContribution[];
  stages: ProcessingStageContribution[];
  stylesheets: StylesheetContribution[];
  /** Fill develop-detail, as a denoiser extension would, or empty it. */
  fillSlot(component: React.ComponentType | null): void;
  /** The latest props of each slider drawn in `root`, in document order. */
  sliders(root: ParentNode): SliderProps[];
  mask: { adj: MaskDetail; commits: string[] };
}

export function fakeApi({ params = {} as Partial<DevelopParams> } = {}): Rig {
  const calls: DevelopCall[] = [];
  const previews: DetailPreview[] = [];
  const panels: PanelContribution[] = [];
  const stages: ProcessingStageContribution[] = [];
  const stylesheets: StylesheetContribution[] = [];
  const slot = create<{ component: React.ComponentType | null }>(() => ({ component: null }));
  const mask: Rig["mask"] = { adj: { texture: 0, clarity: 0, dehaze: 0, sharpness: 0 }, commits: [] };
  const maskStore = create<{ adj: MaskDetail }>(() => ({ adj: mask.adj }));
  const sliderProps = new Map<number, SliderProps>();
  let nextSlider = 0;

  const develop: StoreApi<DevelopStoreState> = create<DevelopStoreState>()((set) => ({
    params: { ...DEFAULTS, ...params },
    setParam: (key, value) => {
      calls.push({ setParam: key, value });
      set((s) => ({ params: { ...s.params, [key]: value } }));
    },
    commitEdit: async (label) => {
      calls.push({ commitEdit: label });
    },
    resetParams: async (keys, label) => {
      calls.push({ resetParams: keys, label });
      set({ params: { ...DEFAULTS } });
    },
    setSharpenViz: (mode) => void previews.push(mode),
  }));

  function Panel({ children, title }: PanelProps) {
    return React.createElement("section", { "aria-label": title }, children);
  }

  function Slider(props: SliderProps) {
    const id = React.useRef(nextSlider++).current;
    sliderProps.set(id, props);
    return React.createElement("div", { "data-slider": id }, `${props.label} ${props.value}`);
  }

  function Slot({ fallback = null }: SlotProps) {
    const Filled = slot((s) => s.component);
    return Filled ? React.createElement(Filled) : React.createElement(React.Fragment, null, fallback);
  }

  const api: SafelightAPI = {
    version: 1,
    extensionId: "safelight.detail",
    react: React,
    registerPanel: (c) => void panels.push(c),
    registerProcessingStage: (c) => void stages.push(c),
    registerStylesheet: (c) => void stylesheets.push(c),
    components: { Panel, Slider, Slot },
    stores: { useDevelopStore: develop },
    develop: {
      useMaskScope: (): MaskScope => {
        const adj = maskStore((s) => s.adj);
        return {
          adj,
          setAdj: (partial) => {
            mask.adj = { ...mask.adj, ...partial };
            maskStore.setState({ adj: mask.adj });
          },
          commit: (label) => void mask.commits.push(label),
        };
      },
    },
    ui: { tokens: TOKENS },
  };

  return {
    api,
    develop,
    calls,
    previews,
    panels,
    stages,
    stylesheets,
    fillSlot: (component) => slot.setState({ component }),
    sliders: (root) =>
      [...root.querySelectorAll("[data-slider]")].map((el) => {
        const props = sliderProps.get(Number(el.getAttribute("data-slider")));
        if (!props) throw new Error("a slider without props");
        return props;
      }),
    mask,
  };
}
