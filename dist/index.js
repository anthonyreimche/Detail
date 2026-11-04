//#region src/rt.ts
var e, t;
function n(n) {
	t = n, e = n.react;
}
//#endregion
//#region src/styles.ts
var r = "safelight-detail", i = {
	groups: `${r}-groups`,
	heading: `${r}-heading`,
	sliders: `${r}-sliders`
};
function a(e) {
	return `
:where(.${i.groups} > :not(:last-child)) { margin-block: 0 0.25rem; }
:where(.${i.heading}) { padding: 0.5rem 0.5rem 0.125rem; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: ${e.textMuted}; }
:where(.${i.sliders} > :not(:last-child)) { margin-block: 0 0.125rem; }
html.sl-larger-text .${i.heading} { font-size: 12px !important; text-transform: none !important; letter-spacing: normal !important; }
html.sl-title-headings .${i.heading} { text-transform: capitalize !important; }
`;
}
//#endregion
//#region src/DetailPanel.tsx
var o = {
	sharpening: 25,
	sharpenRadius: 1,
	sharpenDetail: 25,
	sharpenMasking: 0,
	luminanceNR: 0,
	luminanceNRDetail: 50,
	luminanceNRContrast: 0,
	luminanceNRShadows: 0,
	luminanceNRHighlights: 0,
	colorNR: 25,
	colorNRDetail: 50,
	colorNRSmoothness: 50
}, s = [
	{
		key: "sharpening",
		label: "Amount",
		min: 0,
		max: 150,
		step: 1,
		preview: 3
	},
	{
		key: "sharpenRadius",
		label: "Radius",
		min: 1,
		max: 3,
		step: .1,
		preview: 3
	},
	{
		key: "sharpenDetail",
		label: "Detail",
		min: 0,
		max: 100,
		step: 1,
		preview: 2
	},
	{
		key: "sharpenMasking",
		label: "Masking",
		min: 0,
		max: 100,
		step: 1,
		preview: 1
	}
], c = [
	{
		key: "luminanceNR",
		label: "Luminance",
		min: 0,
		max: 100,
		step: 1,
		preview: 3
	},
	{
		key: "luminanceNRDetail",
		label: "Detail",
		min: 0,
		max: 100,
		step: 1,
		preview: 3
	},
	{
		key: "luminanceNRContrast",
		label: "Contrast",
		min: 0,
		max: 100,
		step: 1,
		preview: 3
	},
	{
		key: "luminanceNRShadows",
		label: "Shadows",
		min: 0,
		max: 100,
		step: 1,
		preview: 3
	},
	{
		key: "luminanceNRHighlights",
		label: "Highlights",
		min: 0,
		max: 100,
		step: 1,
		preview: 3
	}
], l = [
	{
		key: "colorNR",
		label: "Colour",
		min: 0,
		max: 100,
		step: 1,
		preview: 4
	},
	{
		key: "colorNRDetail",
		label: "Detail",
		min: 0,
		max: 100,
		step: 1,
		preview: 4
	},
	{
		key: "colorNRSmoothness",
		label: "Smoothness",
		min: 0,
		max: 100,
		step: 1,
		preview: 4
	}
], u = [
	...s,
	...c,
	...l
].map((e) => e.key);
function d({ title: n, sliders: r }) {
	let { Slider: a } = t.components, s = t.stores.useDevelopStore, c = s((e) => e.params), l = s((e) => e.setParam), u = s((e) => e.commitEdit), d = s((e) => e.setSharpenViz);
	return /* @__PURE__ */ e.createElement("div", null, n && /* @__PURE__ */ e.createElement("div", { className: i.heading }, n), /* @__PURE__ */ e.createElement("div", { className: i.sliders }, r.map((t) => /* @__PURE__ */ e.createElement(a, {
		key: t.key,
		label: t.label,
		value: c[t.key],
		min: t.min,
		max: t.max,
		step: t.step,
		defaultValue: o[t.key],
		onChange: (e) => l(t.key, e),
		onCommit: () => void u(n ? `${n} ${t.label}` : t.label),
		onModifierPreview: (e) => d(e ? t.preview : 0)
	}))));
}
function f() {
	let { Panel: n, Slot: r } = t.components;
	return /* @__PURE__ */ e.createElement(n, { title: "Detail" }, /* @__PURE__ */ e.createElement("div", { className: i.groups }, /* @__PURE__ */ e.createElement(d, {
		title: "Sharpening",
		sliders: s
	}), /* @__PURE__ */ e.createElement(r, {
		name: "develop-detail",
		fallback: /* @__PURE__ */ e.createElement(e.Fragment, null, /* @__PURE__ */ e.createElement(d, {
			title: "Noise Reduction",
			sliders: c
		}), /* @__PURE__ */ e.createElement(d, {
			title: "",
			sliders: l
		}))
	})));
}
var p = [
	{
		key: "texture",
		label: "Texture"
	},
	{
		key: "clarity",
		label: "Clarity"
	},
	{
		key: "dehaze",
		label: "Dehaze"
	},
	{
		key: "sharpness",
		label: "Sharpness"
	}
];
function m() {
	let { Slider: n } = t.components, r = t.develop.useMaskScope();
	return /* @__PURE__ */ e.createElement("div", { className: i.sliders }, p.map((t) => /* @__PURE__ */ e.createElement(n, {
		key: t.key,
		label: t.label,
		value: r.adj[t.key],
		min: -100,
		max: 100,
		step: 1,
		defaultValue: 0,
		onChange: (e) => r.setAdj({ [t.key]: e }),
		onCommit: () => r.commit(`Mask ${t.label}`)
	})));
}
var h = {
	component: m,
	order: 50,
	owns: p.map((e) => e.key)
}, g = "safelight.detail.sharpen", _ = (e) => ({
	key: e,
	glslType: "float",
	default: 0
}), v = "  // Capture sharpening with radius, detail (halo control), and edge masking.\n  // Runs after vibrance/saturation so sharpening halos are not re-saturated.\n  // sharpenViz carries the grayscale preview value when uSharpenViz is active;\n  // the block also runs at amount 0 in that case so the preview is always live.\n  float sharpenViz = 0.0;\n  float sharpen = uSharpening / 100.0;\n  if (sharpen > 0.001 || uSharpenViz > 0) {\n    float lod = mix(0.5, 1.5, (uSharpenRadius - 1.0) / 2.0);\n    float blur = lumaLod(srcUv, lod);\n    float detail = rawLuma - blur;\n    float detailFactor = uSharpenDetail / 100.0;\n    float broadBlur = lumaLod(srcUv, lod + 1.0);\n    detail = mix((rawLuma - broadBlur) * 0.35, detail, detailFactor);\n    float mask = 1.0;\n    if (uSharpenMasking > 0.001) {\n      float edgeMag = abs(rawLuma - lumaLod(srcUv, 0.5));\n      float threshold = (uSharpenMasking / 100.0) * 0.12;\n      mask = smoothstep(threshold * 0.4, threshold, edgeMag);\n    }\n    if (sharpen > 0.001) c += detail * sharpen * 1.6 * mask;\n    if (uSharpenViz == 1) sharpenViz = mask;                          // masking coverage\n    else if (uSharpenViz == 2) sharpenViz = clamp(0.5 + detail * 4.0, 0.0, 1.0); // edge signal\n    else if (uSharpenViz == 3) sharpenViz = luma(clamp(c, 0.0, 1.0)); // sharpened luminance\n  }";
function y(e) {
	return {
		id: g,
		name: "Sharpening",
		phase: "display-adjust",
		anchor: "sharpen",
		glsl: v,
		uniforms: [
			"uSharpening",
			"uSharpenRadius",
			"uSharpenDetail",
			"uSharpenMasking"
		].map(_),
		derive: (e) => ({
			uSharpening: e.sharpening,
			uSharpenRadius: e.sharpenRadius,
			uSharpenDetail: e.sharpenDetail,
			uSharpenMasking: e.sharpenMasking
		})
	};
}
//#endregion
//#region src/index.tsx
var b = "core.detail", x = "safelight.detail.styles", S = 3;
function C(e) {
	n(e), e.registerStylesheet({
		id: x,
		css: a(e.ui.tokens)
	}), e.registerProcessingStage(y(3)), e.registerPanel({
		id: b,
		title: "Detail",
		component: f,
		defaultDock: {
			module: "develop",
			direction: "right",
			order: 8,
			width: 280,
			height: 150
		},
		onReset: () => void e.stores.useDevelopStore.getState().resetParams(u, "Reset Detail"),
		mask: h
	});
}
//#endregion
export { S as LINE, b as PANEL_ID, x as STYLESHEET_ID, C as activate };

//# sourceMappingURL=index.js.map