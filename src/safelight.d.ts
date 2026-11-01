// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// The slice of Safelight's extension API this extension touches, mirrored from
// the app's src/extensions/types.ts, src/extensions/Slot.tsx,
// src/catalog/types.ts, src/state/develop-store.ts,
// src/modules/develop/mask-scope.tsx and src/ui/components/{Panel,Slider}.tsx.
// Extensions are standalone bundles, so the host's source is not on the type
// path; React types come from @types/react (dev only).

import type { ComponentType, ReactNode } from "react";

/** A release line: the process version its stage text was written for, and
 *  the extension's major version. */
export type Line = 1 | 2 | 3;

export interface StoreApi<T> {
  (): T;
  <U>(selector: (state: T) => U): U;
  getState(): T;
  setState(partial: Partial<T> | ((s: T) => Partial<T>)): void;
  subscribe(listener: (state: T, prev: T) => void): () => void;
}

/** The develop params this extension reads. Core's carry many more fields. */
export interface DevelopParams {
  sharpening: number;
  sharpenRadius: number;
  sharpenDetail: number;
  sharpenMasking: number;
  luminanceNR: number;
  luminanceNRDetail: number;
  luminanceNRContrast: number;
  luminanceNRShadows: number;
  luminanceNRHighlights: number;
  colorNR: number;
  colorNRDetail: number;
  colorNRSmoothness: number;
}

/** The Alt/Ctrl-drag preview the canvas draws: 0 off, 1 sharpening's masking,
 *  2 its edge signal, 3 luminance in grey, 4 colour noise against grey. */
export type DetailPreview = 0 | 1 | 2 | 3 | 4;

export interface DevelopStoreState {
  params: DevelopParams;
  setParam<K extends keyof DevelopParams>(key: K, value: DevelopParams[K]): void;
  /** End a gesture: one undoable history step under `label`. */
  commitEdit(label: string): Promise<void>;
  /** Put `keys` back to their defaults as one undoable step under `label`. */
  resetParams(keys: (keyof DevelopParams)[], label: string): Promise<void>;
  /** Turn the canvas's Alt/Ctrl-drag preview on, or off with 0. */
  setSharpenViz(mode: DetailPreview): void;
}

export interface PanelDockDefault {
  module: "library" | "develop";
  direction: "left" | "right" | "bottom";
  order?: number;
  width?: number;
  height?: number;
}

/** A panel's per-mask variant, listed among a mask's sub-panels. */
export interface MaskPanelContribution {
  component: ComponentType;
  /** Sort position among a mask's sub-panels (lower = higher up). */
  order?: number;
  /** The mask values this sub-panel edits. */
  owns: readonly string[];
}

export interface PanelContribution {
  /** Globally unique, e.g. "core.detail" or "my-ext.fancy-curves". */
  id: string;
  title: string;
  component: ComponentType;
  defaultDock?: PanelDockDefault;
  /** Right-clicking the panel's dock header offers "Reset to defaults". */
  onReset?: () => void;
  mask?: MaskPanelContribution;
}

export interface UniformDeclaration {
  key: string;
  glslType: "float";
  default: number;
}

export type StageValue = number;

export interface StageDeriveContext {
  /** One of this extension's settings, or `fallback`. */
  settings<T>(key: string, fallback: T): T;
}

export type StageDerive = (params: DevelopParams, ctx: StageDeriveContext) => Record<string, StageValue>;

export interface ProcessingStageContribution {
  id: string;
  name: string;
  phase: "display-adjust";
  priority?: number;
  /** Where in the develop program the block runs (official stages only). */
  anchor?: "sharpen";
  /** The stage's block in the develop program; `c` is the display colour. */
  glsl: string;
  /** Functions the block calls, declared ahead of main(). */
  helpers?: string;
  uniforms: UniformDeclaration[];
  /** Textures the block samples (none here; part of a line's text). */
  textures?: { key: string; kind: "photo" }[];
  /** The uniforms' values for a photo (official extensions only). */
  derive?: StageDerive;
}

export interface StylesheetContribution {
  id: string;
  css: string;
}

/** The theme's CSS variables as `var(--color-…)` strings. */
export interface UiTokens {
  readonly textMuted: string;
}

export interface PanelProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  /** Double-clicking the track resets to this. */
  defaultValue?: number;
  onChange(value: number): void;
  onCommit?(): void;
  /** Alt/Ctrl held while dragging: true as the preview starts, false as it
   *  ends. */
  onModifierPreview?(active: boolean): void;
}

/** A named mount point extensions fill (registerSlot). */
export interface SlotProps {
  name: "develop-detail";
  /** Drawn while nothing is in the slot. */
  fallback?: ReactNode;
}

/** The mask adjustments Detail's mask instance edits, -100 to 100 each. */
export interface MaskDetail {
  texture: number;
  clarity: number;
  dehaze: number;
  sharpness: number;
}

/** The mask a mask sub-panel instance belongs to: its relative adjustments. */
export interface MaskScope {
  adj: MaskDetail;
  setAdj(partial: Partial<MaskDetail>): void;
  /** End a gesture: one undoable step under `label`. */
  commit(label: string): void;
}

export interface SafelightAPI {
  version: 1;
  extensionId: string;
  react: typeof import("react");
  registerPanel(c: PanelContribution): void;
  registerProcessingStage(c: ProcessingStageContribution): void;
  registerStylesheet(c: StylesheetContribution): void;
  components: {
    /** Core's collapsible panel; inside a dock panel of the same title it
     *  draws its content only. */
    Panel: ComponentType<PanelProps>;
    Slider: ComponentType<SliderProps>;
    /** Every component registered into a slot, or `fallback` while none is. */
    Slot: ComponentType<SlotProps>;
  };
  stores: {
    useDevelopStore: StoreApi<DevelopStoreState>;
  };
  develop: {
    /** The mask a PanelContribution.mask component belongs to. */
    useMaskScope(): MaskScope;
  };
  ui: { tokens: UiTokens };
}

export interface ExtensionModule {
  activate(api: SafelightAPI): void;
  deactivate?(): void;
}
