import { a as SwitchLayoutGroupContext, c as usePresence, i as m, l as LayoutGroupContext, n as track, o as LazyMotion, r as domAnimation, s as AnimatePresence, t as Mark } from "../entry-server.js";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Component, useContext, useEffect, useRef, useState } from "react";
import { Feature, HTMLProjectionNode, PanSession, VisualElementDragControls, addPointerEvent, frame, globalProjectionState, hasReducedMotionListener, initPrefersReducedMotion, microtask, prefersReducedMotion } from "motion-dom";
import { noop, warnOnce } from "motion-utils";
// node_modules/framer-motion/dist/es/gestures/drag/index.mjs
var DragGesture = class extends Feature {
	constructor(node) {
		super(node);
		this.removeGroupControls = noop;
		this.removeListeners = noop;
		this.controls = new VisualElementDragControls(node);
	}
	mount() {
		const { dragControls } = this.node.getProps();
		if (dragControls) this.removeGroupControls = dragControls.subscribe(this.controls);
		this.removeListeners = this.controls.addListeners() || noop;
	}
	update() {
		const { dragControls, drag } = this.node.getProps();
		const { dragControls: prevDragControls, drag: prevDrag } = this.node.prevProps || {};
		if (dragControls !== prevDragControls) {
			this.removeGroupControls();
			if (dragControls) this.removeGroupControls = dragControls.subscribe(this.controls);
		}
		/**
		* If drag is disabled mid-gesture, for instance from onDrag, end the
		* gesture as if released. This must happen before this render's
		* layout change is processed, otherwise the element is still
		* animation-blocked, so it jumps to its new layout and keeps that
		* jump as a drag offset, which release wouldn't animate away as
		* drag is now disabled.
		*/
		if (prevDrag && !drag) this.controls.stop(void 0, void 0, prevDrag);
	}
	unmount() {
		this.removeGroupControls();
		this.removeListeners();
		/**
		* In React 19, during list reorder reconciliation, components may
		* briefly unmount and remount while the drag is still active. If we're
		* actively dragging, we should NOT end the pan session - it will
		* continue tracking pointer events via its window-level listeners.
		*
		* The pan session will be properly cleaned up when:
		* 1. The drag ends naturally (pointerup/pointercancel)
		* 2. The component is truly removed from the DOM
		*/
		if (!this.controls.isDragging) this.controls.endPanSession();
	}
};
// node_modules/framer-motion/dist/es/utils/get-context-window.mjs
var getContextWindow = ({ current }) => {
	return current ? current.ownerDocument.defaultView : null;
};
// node_modules/framer-motion/dist/es/gestures/pan/index.mjs
var asyncHandler = (handler) => (event, info) => {
	if (handler) frame.update(() => handler(event, info), false, true);
};
var PanGesture = class extends Feature {
	constructor() {
		super(...arguments);
		this.removePointerDownListener = noop;
	}
	onPointerDown(pointerDownEvent) {
		this.session = new PanSession(pointerDownEvent, this.createPanHandlers(), {
			transformPagePoint: this.node.getTransformPagePoint(),
			contextWindow: getContextWindow(this.node)
		});
	}
	createPanHandlers() {
		const { onPanSessionStart, onPanStart, onPan, onPanEnd } = this.node.getProps();
		return {
			onSessionStart: asyncHandler(onPanSessionStart),
			onStart: asyncHandler(onPanStart),
			onMove: asyncHandler(onPan),
			onEnd: (event, info) => {
				delete this.session;
				if (onPanEnd) frame.postRender(() => onPanEnd(event, info));
			}
		};
	}
	mount() {
		this.removePointerDownListener = addPointerEvent(this.node.current, "pointerdown", (event) => this.onPointerDown(event));
	}
	update() {
		this.session && this.session.updateHandlers(this.createPanHandlers());
	}
	unmount() {
		this.removePointerDownListener();
		this.session && this.session.end();
	}
};
// node_modules/framer-motion/dist/es/motion/features/layout/MeasureLayout.mjs
/**
* Track whether we've taken any snapshots yet. If not,
* we can safely skip notification of didUpdate.
*
* Difficult to capture in a test but to prevent flickering
* we must set this to true either on update or unmount.
* Running `next-env/layout-id` in Safari will show this behaviour if broken.
*/
var hasTakenAnySnapshot = false;
/**
* The projection node is created with the props from the component's first
* render, so keep these in sync as `layout` can change (or be enabled) later.
*/
var layoutOptions = ({ layout, layoutDependency }) => ({
	layout,
	layoutDependency,
	animationType: typeof layout === "string" ? layout : "both"
});
var MeasureLayoutWithContext = class extends Component {
	/**
	* This only mounts projection nodes for components that
	* need measuring, we might want to do it for all components
	* in order to incorporate transforms
	*/
	componentDidMount() {
		const { visualElement, layoutGroup, switchLayoutGroup, layoutId } = this.props;
		const { projection } = visualElement;
		if (projection) {
			if (layoutGroup.group) layoutGroup.group.add(projection);
			if (switchLayoutGroup && switchLayoutGroup.register && layoutId) switchLayoutGroup.register(projection);
			if (hasTakenAnySnapshot) projection.root.didUpdate();
			projection.addEventListener("animationComplete", () => {
				this.safeToRemove();
			});
			projection.setOptions({
				...projection.options,
				...layoutOptions(this.props),
				onExitComplete: () => this.safeToRemove()
			});
		}
		globalProjectionState.hasEverUpdated = true;
	}
	getSnapshotBeforeUpdate(prevProps) {
		const { layout, layoutDependency, visualElement, drag, isPresent } = this.props;
		const { projection } = visualElement;
		if (!projection) return null;
		/**
		* TODO: We use this data in relegate to determine whether to
		* promote a previous element. There's no guarantee its presence data
		* will have updated by this point - if a bug like this arises it will
		* have to be that we markForRelegation and then find a new lead some other way,
		* perhaps in didUpdate
		*/
		projection.isPresent = isPresent;
		if (prevProps.layoutDependency !== layoutDependency || prevProps.layout !== layout) projection.setOptions({
			...projection.options,
			...layoutOptions(this.props)
		});
		hasTakenAnySnapshot = true;
		if (drag || prevProps.layoutDependency !== layoutDependency || layoutDependency === void 0 || prevProps.isPresent !== isPresent) projection.willUpdate();
		else this.safeToRemove();
		if (prevProps.isPresent !== isPresent) {
			if (isPresent) projection.promote();
			else if (!projection.relegate())
 /**
			* If there's another stack member taking over from this one,
			* it's in charge of the exit animation and therefore should
			* be in charge of the safe to remove. Otherwise we call it here.
			*/
			frame.postRender(() => {
				const stack = projection.getStack();
				if (!stack || !stack.members.length) this.safeToRemove();
			});
		}
		return null;
	}
	componentDidUpdate() {
		const { visualElement, layoutAnchor } = this.props;
		const { projection } = visualElement;
		if (projection) {
			projection.options.layoutAnchor = layoutAnchor;
			projection.root.didUpdate();
			microtask.postRender(() => {
				if (!projection.currentAnimation && projection.isLead()) this.safeToRemove();
			});
		}
	}
	componentWillUnmount() {
		const { visualElement, layoutGroup, switchLayoutGroup: promoteContext } = this.props;
		const { projection } = visualElement;
		hasTakenAnySnapshot = true;
		if (projection) {
			projection.scheduleCheckAfterUnmount();
			if (layoutGroup && layoutGroup.group) layoutGroup.group.remove(projection);
			if (promoteContext && promoteContext.deregister) promoteContext.deregister(projection);
		}
	}
	safeToRemove() {
		const { safeToRemove } = this.props;
		safeToRemove && safeToRemove();
	}
	render() {
		return null;
	}
};
function MeasureLayout(props) {
	const [isPresent, safeToRemove] = usePresence();
	const layoutGroup = useContext(LayoutGroupContext);
	return jsx(MeasureLayoutWithContext, {
		...props,
		layoutGroup,
		switchLayoutGroup: useContext(SwitchLayoutGroupContext),
		isPresent,
		safeToRemove
	});
}
// node_modules/framer-motion/dist/es/render/dom/features-max.mjs
/**
* @public
*/
var domMax = /* @__PURE__ */ Object.assign({}, domAnimation, {
	pan: { Feature: PanGesture },
	drag: {
		Feature: DragGesture,
		ProjectionNode: HTMLProjectionNode,
		MeasureLayout
	}
}, { layout: {
	ProjectionNode: HTMLProjectionNode,
	MeasureLayout
} });
// node_modules/framer-motion/dist/es/utils/reduced-motion/use-reduced-motion.mjs
/**
* A hook that returns `true` if we should be using reduced motion based on the current device's Reduced Motion setting.
*
* This can be used to implement changes to your UI based on Reduced Motion. For instance, replacing motion-sickness inducing
* `x`/`y` animations with `opacity`, disabling the autoplay of background videos, or turning off parallax motion.
*
* It will actively respond to changes and re-render your components with the latest setting.
*
* ```jsx
* export function Sidebar({ isOpen }) {
*   const shouldReduceMotion = useReducedMotion()
*   const closedX = shouldReduceMotion ? 0 : "-100%"
*
*   return (
*     <motion.div animate={{
*       opacity: isOpen ? 1 : 0,
*       x: isOpen ? 0 : closedX
*     }} />
*   )
* }
* ```
*
* @return boolean
*
* @public
*/
function useReducedMotion() {
	/**
	* Lazy initialisation of prefersReducedMotion
	*/
	!hasReducedMotionListener.current && initPrefersReducedMotion();
	const [shouldReduceMotion] = useState(prefersReducedMotion.current);
	if (process.env.NODE_ENV !== "production") warnOnce(shouldReduceMotion !== true, "You have Reduced Motion enabled on your device. Animations may not appear as expected.", "reduced-motion-disabled");
	/**
	* TODO See if people miss automatically updating shouldReduceMotion setting
	*/
	return shouldReduceMotion;
}
// src/lib/waitlist.ts
async function submitWaitlist(entry) {
	await new Promise((r) => setTimeout(r, 900));
	try {
		const list = JSON.parse(localStorage.getItem("rebuildr-waitlist") ?? "[]");
		list.push({
			...entry,
			submittedAt: (/* @__PURE__ */ new Date()).toISOString()
		});
		localStorage.setItem("rebuildr-waitlist", JSON.stringify(list));
	} catch {}
}
// src/components/WaitlistModal.tsx
var EASE = [
	.23,
	1,
	.32,
	1
];
var uses = [
	"Landing page",
	"Client site",
	"Portfolio",
	"Full website"
];
var platforms = [
	"macOS",
	"Windows",
	"Both"
];
function WaitlistModal(props) {
	return /* @__PURE__ */ jsx(LazyMotion, {
		features: domMax,
		strict: true,
		children: /* @__PURE__ */ jsx(ModalInner, { ...props })
	});
}
function ModalInner({ onClose, initialEmail }) {
	const reduce = useReducedMotion();
	const [email, setEmail] = useState(initialEmail);
	const [name, setName] = useState("");
	const [use, setUse] = useState(uses[0]);
	const [platform, setPlatform] = useState("macOS");
	const [status, setStatus] = useState("idle");
	const [invalid, setInvalid] = useState(0);
	const emailRef = useRef(null);
	useEffect(() => {
		emailRef.current?.focus();
	}, []);
	async function onSubmit(e) {
		e.preventDefault();
		if (!/^\S+@\S+\.\S+$/.test(email)) {
			setInvalid((n) => n + 1);
			setStatus("error");
			emailRef.current?.focus();
			return;
		}
		setStatus("sending");
		try {
			await submitWaitlist({
				email,
				name,
				use,
				platform
			});
			track("generate_lead", {
				method: "waitlist",
				use_case: use,
				platform
			});
			setStatus("done");
		} catch {
			setStatus("error");
		}
	}
	const enter = (i) => ({
		initial: reduce ? { opacity: 0 } : {
			opacity: 0,
			y: 10
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: {
			duration: .35,
			ease: EASE,
			delay: reduce ? 0 : .08 + i * .045
		}
	});
	return /* @__PURE__ */ jsxs(m.div, {
		className: "fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6",
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		transition: {
			duration: .2,
			ease: "easeOut"
		},
		children: [/* @__PURE__ */ jsx("div", {
			onClick: onClose,
			className: "absolute inset-0 bg-black/60 backdrop-blur-md"
		}), /* @__PURE__ */ jsxs(m.div, {
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": "wl-title",
			"data-lenis-prevent": true,
			initial: reduce ? { opacity: 0 } : {
				opacity: 0,
				scale: .96,
				y: 16
			},
			animate: {
				opacity: 1,
				scale: 1,
				y: 0
			},
			exit: reduce ? { opacity: 0 } : {
				opacity: 0,
				scale: .97,
				y: 8
			},
			transition: {
				duration: .28,
				ease: EASE
			},
			className: "relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0b0b0b] p-7 pb-[calc(1.75rem+env(safe-area-inset-bottom))] shadow-[0_30px_120px_rgba(0,0,0,.7)] sm:rounded-3xl",
			children: [
				!reduce && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(m.div, {
					"aria-hidden": true,
					className: "pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/25 blur-3xl",
					animate: {
						x: [
							0,
							-20,
							0
						],
						y: [
							0,
							18,
							0
						],
						opacity: [
							.7,
							1,
							.7
						]
					},
					transition: {
						duration: 9,
						repeat: Infinity,
						ease: "easeInOut"
					}
				}), /* @__PURE__ */ jsx(m.div, {
					"aria-hidden": true,
					className: "pointer-events-none absolute -bottom-28 -left-20 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl",
					animate: {
						x: [
							0,
							24,
							0
						],
						y: [
							0,
							-14,
							0
						]
					},
					transition: {
						duration: 11,
						repeat: Infinity,
						ease: "easeInOut"
					}
				})] }),
				/* @__PURE__ */ jsx("button", {
					onClick: onClose,
					"aria-label": "Close",
					className: "absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white",
					children: /* @__PURE__ */ jsx("svg", {
						width: "12",
						height: "12",
						viewBox: "0 0 12 12",
						children: /* @__PURE__ */ jsx("path", {
							d: "M1 1l10 10M11 1L1 11",
							stroke: "currentColor",
							strokeWidth: "1.5",
							strokeLinecap: "round"
						})
					})
				}),
				/* @__PURE__ */ jsx(AnimatePresence, {
					mode: "wait",
					initial: false,
					children: status === "done" ? /* @__PURE__ */ jsx(Success, {
						email,
						reduce: !!reduce,
						onClose
					}, "ok") : /* @__PURE__ */ jsxs(m.form, {
						onSubmit,
						noValidate: true,
						exit: {
							opacity: 0,
							y: -8
						},
						transition: { duration: .18 },
						className: "relative",
						children: [
							/* @__PURE__ */ jsxs(m.div, {
								...enter(0),
								className: "flex items-center gap-2 text-white/80",
								children: [/* @__PURE__ */ jsx(Mark, { className: "h-5 w-5" }), /* @__PURE__ */ jsx("span", {
									className: "text-xs uppercase tracking-[0.2em] text-white/60",
									children: "Early access"
								})]
							}),
							/* @__PURE__ */ jsxs(m.h2, {
								id: "wl-title",
								...enter(1),
								className: "mt-4 text-3xl font-medium leading-tight",
								children: [
									"Be first to",
									/* @__PURE__ */ jsx("br", {}),
									"go from URL to reality."
								]
							}),
							/* @__PURE__ */ jsx(m.p, {
								...enter(2),
								className: "mt-2 text-sm text-white/60",
								children: "Join the waitlist. We’ll email you when the beta opens. No spam."
							}),
							/* @__PURE__ */ jsxs(m.div, {
								...enter(3),
								className: "mt-6 space-y-3",
								children: [/* @__PURE__ */ jsxs(m.div, {
									animate: invalid && !reduce ? { x: [
										0,
										-6,
										6,
										-4,
										4,
										0
									] } : {},
									transition: {
										duration: .35,
										ease: "easeOut"
									},
									children: [
										/* @__PURE__ */ jsx("label", {
											className: "mb-1 block text-xs text-white/60",
											htmlFor: "wl-email",
											children: "Email"
										}),
										/* @__PURE__ */ jsx("input", {
											id: "wl-email",
											ref: emailRef,
											type: "email",
											value: email,
											autoComplete: "email",
											placeholder: "you@company.com",
											onChange: (e) => {
												setEmail(e.target.value);
												if (status === "error") setStatus("idle");
											},
											"aria-invalid": status === "error",
											className: `w-full rounded-xl border bg-white/[0.04] px-4 py-3 text-sm outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-white/60 focus:border-accent/70 focus:shadow-[0_0_0_4px_rgba(255,122,47,.12)] ${status === "error" ? "border-red-400/70" : "border-white/10"}`
										}),
										/* @__PURE__ */ jsx(AnimatePresence, { children: status === "error" && /* @__PURE__ */ jsx(m.p, {
											initial: {
												opacity: 0,
												y: -4
											},
											animate: {
												opacity: 1,
												y: 0
											},
											exit: { opacity: 0 },
											transition: { duration: .18 },
											className: "mt-1.5 text-xs text-red-300",
											role: "alert",
											children: /^\S+@\S+\.\S+$/.test(email) ? "Something went wrong. Please try again." : "Enter a valid email address."
										}) })
									]
								}, invalid), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("label", {
									className: "mb-1 block text-xs text-white/60",
									htmlFor: "wl-name",
									children: ["Name ", /* @__PURE__ */ jsx("span", {
										className: "text-white/60",
										children: "(optional)"
									})]
								}), /* @__PURE__ */ jsx("input", {
									id: "wl-name",
									value: name,
									onChange: (e) => setName(e.target.value),
									autoComplete: "name",
									placeholder: "Ada Lovelace",
									className: "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-white/60 focus:border-accent/70 focus:shadow-[0_0_0_4px_rgba(255,122,47,.12)]"
								})] })]
							}),
							/* @__PURE__ */ jsxs(m.fieldset, {
								...enter(4),
								className: "mt-5",
								children: [/* @__PURE__ */ jsx("legend", {
									className: "mb-2 text-xs text-white/60",
									children: "What will you rebuild first?"
								}), /* @__PURE__ */ jsx("div", {
									className: "flex flex-wrap gap-2",
									children: uses.map((u) => /* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => setUse(u),
										"aria-pressed": use === u,
										className: `relative rounded-full border px-3.5 py-1.5 text-xs transition-[color,border-color,background-color,transform] duration-150 active:scale-[0.97] ${use === u ? "border-accent/60 bg-accent/15 text-white" : "border-white/10 text-white/60 hover:border-white/25 hover:text-white"}`,
										children: u
									}, u))
								})]
							}),
							/* @__PURE__ */ jsxs(m.fieldset, {
								...enter(5),
								className: "mt-5",
								children: [/* @__PURE__ */ jsx("legend", {
									className: "mb-2 text-xs text-white/60",
									children: "Platform"
								}), /* @__PURE__ */ jsx("div", {
									className: "relative grid grid-cols-3 rounded-full border border-white/10 bg-white/[0.04] p-1 text-xs",
									children: platforms.map((p) => /* @__PURE__ */ jsxs("button", {
										type: "button",
										onClick: () => setPlatform(p),
										"aria-pressed": platform === p,
										className: "relative z-10 rounded-full py-1.5 transition-colors duration-150",
										children: [platform === p && /* @__PURE__ */ jsx(m.span, {
											layoutId: "wl-platform",
											transition: {
												type: "spring",
												duration: .4,
												bounce: .15
											},
											className: "absolute inset-0 -z-10 rounded-full bg-white/15"
										}), /* @__PURE__ */ jsx("span", {
											className: platform === p ? "text-white" : "text-white/55",
											children: p
										})]
									}, p))
								})]
							}),
							/* @__PURE__ */ jsxs(m.div, {
								...enter(6),
								children: [/* @__PURE__ */ jsx(m.button, {
									type: "submit",
									disabled: status === "sending",
									whileTap: reduce ? void 0 : { scale: .97 },
									transition: { duration: .12 },
									className: "group relative mt-6 flex w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-b from-[#ff9a4d] to-[#ff6a1f] py-3 text-sm font-medium text-black shadow-[0_0_0_5px_rgba(255,122,47,.12),0_10px_40px_rgba(255,122,47,.3)] disabled:opacity-80",
									children: /* @__PURE__ */ jsx(AnimatePresence, {
										mode: "wait",
										initial: false,
										children: status === "sending" ? /* @__PURE__ */ jsxs(m.span, {
											initial: { opacity: 0 },
											animate: { opacity: 1 },
											exit: { opacity: 0 },
											transition: { duration: .12 },
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ jsx("span", { className: "h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/30 border-t-black" }), " Joining…"]
										}, "s") : /* @__PURE__ */ jsx(m.span, {
											initial: { opacity: 0 },
											animate: { opacity: 1 },
											exit: { opacity: 0 },
											transition: { duration: .12 },
											children: "Join the waitlist"
										}, "i")
									})
								}), /* @__PURE__ */ jsxs("p", {
									className: "mt-3 text-center text-[11px] text-white/60",
									children: [
										"By joining you agree to our ",
										/* @__PURE__ */ jsx("a", {
											href: "/privacy",
											className: "underline hover:text-white/60",
											children: "Privacy Policy"
										}),
										"."
									]
								})]
							})
						]
					}, "form")
				})
			]
		})]
	});
}
var stages = [
	"Inspecting reference",
	"Mapping pages and components",
	"Building project",
	"Ready for review"
];
var URL_TEXT = "example.com";
var blocks = [
	{ cls: "h-3 w-8 rounded" },
	{ cls: "ml-auto h-2 w-10 rounded" },
	{ cls: "h-2 w-10 rounded" },
	{
		cls: "h-4 w-12 rounded-full",
		accent: true
	},
	{ cls: "h-4 w-3/4 rounded" },
	{ cls: "h-4 w-1/2 rounded" },
	{ cls: "h-2 w-2/3 rounded" },
	{
		cls: "h-5 w-16 rounded-full",
		accent: true
	},
	{ cls: "h-12 rounded-md" },
	{
		cls: "h-12 rounded-md",
		accent: true
	},
	{ cls: "h-12 rounded-md" }
];
function Success({ email, reduce, onClose }) {
	const [stage, setStage] = useState(reduce ? stages.length - 1 : 0);
	const [typed, setTyped] = useState(reduce ? URL_TEXT : "");
	useEffect(() => {
		if (reduce) return;
		const timers = [
			.8,
			1.6,
			2.5
		].map((t, i) => setTimeout(() => setStage(i + 1), t * 1e3));
		let n = 0;
		const type = setInterval(() => {
			n += 1;
			setTyped(URL_TEXT.slice(0, n));
			if (n >= 11) clearInterval(type);
		}, 55);
		return () => {
			timers.forEach(clearTimeout);
			clearInterval(type);
		};
	}, [reduce]);
	const outline = (i) => .35 + i * .09;
	const fill = (i) => 1.5 + i * .07;
	const nav = blocks.slice(0, 4), hero = blocks.slice(4, 8), cards = blocks.slice(8);
	const block = (b, i) => /* @__PURE__ */ jsx(m.i, {
		className: `block shrink-0 border ${b.cls} ${b.cls.includes("h-12") ? "flex-1" : ""}`,
		initial: reduce ? false : {
			opacity: 0,
			transform: "translateY(6px) scale(0.96)",
			backgroundColor: "rgba(255,255,255,0)",
			borderColor: "rgba(255,255,255,0.25)",
			borderStyle: "dashed"
		},
		animate: {
			opacity: 1,
			transform: "translateY(0px) scale(1)",
			backgroundColor: b.accent ? "rgba(255,122,47,0.9)" : "rgba(255,255,255,0.14)",
			borderColor: b.accent ? "rgba(255,154,77,1)" : "rgba(255,255,255,0.14)",
			borderStyle: "solid"
		},
		transition: reduce ? { duration: 0 } : {
			opacity: {
				duration: .25,
				delay: outline(i)
			},
			transform: {
				duration: .35,
				ease: EASE,
				delay: outline(i)
			},
			backgroundColor: {
				duration: .35,
				delay: fill(i)
			},
			borderColor: {
				duration: .35,
				delay: fill(i)
			},
			borderStyle: {
				duration: 0,
				delay: fill(i)
			}
		}
	}, i);
	return /* @__PURE__ */ jsxs(m.div, {
		initial: {
			opacity: 0,
			y: reduce ? 0 : 10
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: {
			duration: .35,
			ease: EASE
		},
		className: "relative text-center",
		children: [
			/* @__PURE__ */ jsx("p", {
				className: "text-[11px] uppercase tracking-[0.2em] text-white/60",
				children: "URL → reality"
			}),
			/* @__PURE__ */ jsxs(m.div, {
				className: "relative mx-auto mt-4 overflow-hidden rounded-xl border border-white/10 bg-black/50 text-left",
				initial: false,
				animate: reduce ? void 0 : { boxShadow: [
					"0 0 0 rgba(255,122,47,0)",
					"0 0 50px rgba(255,122,47,0.35)",
					"0 0 24px rgba(255,122,47,0.15)"
				] },
				transition: {
					duration: 1.2,
					delay: 2.5,
					ease: "easeOut"
				},
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2 border-b border-white/10 px-3 py-2",
					children: [/* @__PURE__ */ jsx("span", {
						className: "flex gap-1",
						children: [
							0,
							1,
							2
						].map((d) => /* @__PURE__ */ jsx("i", { className: "h-1.5 w-1.5 rounded-full bg-white/25" }, d))
					}), /* @__PURE__ */ jsxs("span", {
						className: "flex-1 truncate rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/60",
						children: [
							"https://",
							typed,
							typed.length < 11 && /* @__PURE__ */ jsx("span", { className: "ml-px inline-block h-2.5 w-px animate-pulse bg-white/70 align-middle" })
						]
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "relative h-[168px] space-y-3 p-3",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "flex items-center gap-2",
							children: nav.map(block)
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-2 pt-1",
							children: [hero.slice(0, 3).map((b, k) => block(b, k + 4)), block(hero[3], 7)]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "flex gap-2",
							children: cards.map((b, k) => block(b, k + 8))
						}),
						!reduce && /* @__PURE__ */ jsx(m.i, {
							"aria-hidden": true,
							className: "pointer-events-none absolute inset-x-0 top-0 block h-px bg-accent shadow-[0_0_14px_3px_rgba(255,122,47,.7)]",
							initial: {
								opacity: 0,
								transform: "translateY(0px)"
							},
							animate: {
								opacity: [
									0,
									1,
									1,
									0
								],
								transform: [
									"translateY(0px)",
									"translateY(0px)",
									"translateY(166px)",
									"translateY(166px)"
								]
							},
							transition: {
								duration: 1.5,
								delay: .3,
								times: [
									0,
									.08,
									.92,
									1
								],
								ease: "easeInOut"
							}
						})
					]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mx-auto mt-4 max-w-[19rem]",
				children: [/* @__PURE__ */ jsx("div", {
					className: "h-1 overflow-hidden rounded-full bg-white/10",
					children: /* @__PURE__ */ jsx(m.div, {
						className: "h-full origin-left rounded-full bg-gradient-to-r from-[#ff9a4d] to-[#ff6a1f]",
						initial: { transform: reduce ? "scaleX(1)" : "scaleX(0)" },
						animate: { transform: "scaleX(1)" },
						transition: {
							duration: 2.7,
							ease: "linear"
						}
					})
				}), /* @__PURE__ */ jsx("div", {
					className: "relative mt-2 h-4 text-xs text-white/60",
					children: /* @__PURE__ */ jsx(AnimatePresence, {
						mode: "wait",
						initial: false,
						children: /* @__PURE__ */ jsxs(m.span, {
							initial: {
								opacity: 0,
								y: reduce ? 0 : 5
							},
							animate: {
								opacity: 1,
								y: 0
							},
							exit: { opacity: 0 },
							transition: { duration: .15 },
							className: `absolute inset-x-0 ${stage === stages.length - 1 ? "text-accent" : ""}`,
							children: [stages[stage], stage < stages.length - 1 && "…"]
						}, stage)
					})
				})]
			}),
			/* @__PURE__ */ jsxs(m.div, {
				initial: {
					opacity: 0,
					y: reduce ? 0 : 8
				},
				animate: {
					opacity: 1,
					y: 0
				},
				transition: {
					duration: .4,
					ease: EASE,
					delay: reduce ? 0 : 2.6
				},
				children: [
					/* @__PURE__ */ jsx("h2", {
						id: "wl-title",
						className: "mt-6 text-3xl font-medium",
						children: "You’re on the list."
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "mx-auto mt-2 max-w-xs text-sm text-white/60",
						children: [
							"We’ll email ",
							/* @__PURE__ */ jsx("b", {
								className: "font-medium text-white/80",
								children: email
							}),
							" when the Rebuildr beta opens."
						]
					}),
					/* @__PURE__ */ jsx("button", {
						onClick: onClose,
						className: "mt-6 rounded-full border border-white/15 px-6 py-2.5 text-sm transition-[background-color,transform] duration-150 hover:bg-white/10 active:scale-[0.97]",
						children: "Back to site"
					})
				]
			})
		]
	});
}
export { WaitlistModal as default };
