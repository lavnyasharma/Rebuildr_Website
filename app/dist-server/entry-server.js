import { renderToString } from "react-dom/server";
import { Link, Route, Routes, StaticRouter, useLocation } from "react-router-dom";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import * as React from "react";
import { Children, Fragment as Fragment$1, Suspense, createContext, createElement, forwardRef, isValidElement, lazy, useCallback, useContext, useEffect, useId, useInsertionEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Feature, HTMLVisualElement, SVGVisualElement, addDomEvent, addToScope, bindToScope, buildHTMLStyles, buildSVGAttrs, cancelFrame, cancelMicrotask, collectMotionValues, createAnimationState, extractEventInfo, frame, frameData, getFeatureDefinitions, hover, isAnimationControls, isControllingVariants, isForcedMotionValue, isHTMLElement, isMotionValue, isSVGTag, isVariantLabel, isVariantNode, microtask, motionValue, optimizedAppearDataAttribute, press, resize, resolveMotionValue, resolveVariant, resolveVariantFromProps, rootProjectionNode, scrapeHTMLMotionValuesFromProps, scrapeSVGMotionValuesFromProps, setFeatureDefinitions, supportsScrollTimeline, supportsViewTimeline, transform } from "motion-dom";
import { clamp, invariant, noop, pipe, progress, velocityPerSecond, warnOnce, warning } from "motion-utils";
// node_modules/framer-motion/dist/es/context/LayoutGroupContext.mjs
var LayoutGroupContext = /* @__PURE__ */ createContext({});
// node_modules/framer-motion/dist/es/utils/use-constant.mjs
/**
* Creates a constant value over the lifecycle of a component.
*
* Even if `useMemo` is provided an empty array as its final argument, it doesn't offer
* a guarantee that it won't re-run for performance reasons later on. By using `useConstant`
* you can ensure that initialisers don't execute twice or more.
*/
function useConstant(init) {
	const ref = useRef(null);
	if (ref.current === null) ref.current = init();
	return ref.current;
}
// node_modules/framer-motion/dist/es/utils/use-isomorphic-effect.mjs
var useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
// node_modules/framer-motion/dist/es/context/PresenceContext.mjs
/**
* @public
*/
var PresenceContext = /* @__PURE__ */ createContext(null);
// node_modules/framer-motion/dist/es/context/MotionConfigContext.mjs
/**
* @public
*/
var MotionConfigContext = /* @__PURE__ */ createContext({
	transformPagePoint: (p) => p,
	isStatic: false,
	reducedMotion: "never"
});
// node_modules/framer-motion/dist/es/utils/use-composed-ref.mjs
/**
* Taken from https://github.com/radix-ui/primitives/blob/main/packages/react/compose-refs/src/compose-refs.tsx
*/
/**
* Set a given ref to a given value
* This utility takes care of different types of refs: callback refs and RefObject(s)
*/
function setRef(ref, value) {
	if (typeof ref === "function") return ref(value);
	else if (ref !== null && ref !== void 0) ref.current = value;
}
/**
* A utility to compose multiple refs together
* Accepts callback refs and RefObject(s)
*/
function composeRefs(...refs) {
	return (node) => {
		let hasCleanup = false;
		const cleanups = refs.map((ref) => {
			const cleanup = setRef(ref, node);
			if (!hasCleanup && typeof cleanup === "function") hasCleanup = true;
			return cleanup;
		});
		if (hasCleanup) return () => {
			for (let i = 0; i < cleanups.length; i++) {
				const cleanup = cleanups[i];
				if (typeof cleanup === "function") cleanup();
				else setRef(refs[i], null);
			}
		};
	};
}
/**
* A custom hook that composes multiple refs
* Accepts callback refs and RefObject(s)
*/
function useComposedRefs(...refs) {
	return React.useCallback(composeRefs(...refs), refs);
}
// node_modules/framer-motion/dist/es/components/AnimatePresence/PopChild.mjs
/**
* Measurement functionality has to be within a separate component
* to leverage snapshot lifecycle.
*/
var PopChildMeasure = class extends React.Component {
	getSnapshotBeforeUpdate(prevProps) {
		const element = this.props.getElement();
		if (isHTMLElement(element) && prevProps.isPresent && !this.props.isPresent && this.props.pop !== false) {
			const parent = element.offsetParent;
			const parentWidth = isHTMLElement(parent) ? parent.offsetWidth || 0 : 0;
			const parentHeight = isHTMLElement(parent) ? parent.offsetHeight || 0 : 0;
			const computedStyle = getComputedStyle(element);
			const size = this.props.sizeRef.current;
			size.height = parseFloat(computedStyle.height);
			size.width = parseFloat(computedStyle.width);
			size.top = element.offsetTop;
			size.left = element.offsetLeft;
			size.right = parentWidth - size.width - size.left;
			size.bottom = parentHeight - size.height - size.top;
			size.direction = computedStyle.direction;
		}
		return null;
	}
	/**
	* Required with getSnapshotBeforeUpdate to stop React complaining.
	*/
	componentDidUpdate() {}
	render() {
		return this.props.children;
	}
};
function PopChild({ children, isPresent, anchorX, anchorY, root, pop, popNode }) {
	const id = useId();
	const ref = useRef(null);
	const size = useRef({
		width: 0,
		height: 0,
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		direction: "ltr"
	});
	const { nonce } = useContext(MotionConfigContext);
	const composedRef = useComposedRefs(ref, pop !== false ? children.props?.ref ?? children?.ref : void 0);
	/**
	* The child's element: the one our ref reached or, if the child can't
	* be given a ref (for instance a function component that doesn't
	* forward it), its outermost motion component's element (#2503).
	*/
	const getElement = () => ref.current || popNode?.current?.current;
	/**
	* We create and inject a style block so we can apply this explicit
	* sizing in a non-destructive manner by just deleting the style block.
	*
	* We can't apply size via render as the measurement happens
	* in getSnapshotBeforeUpdate (post-render), likewise if we apply the
	* styles directly on the DOM node, we might be overwriting
	* styles set via the style prop.
	*/
	useInsertionEffect(() => {
		const { width, height, top, left, right, bottom, direction } = size.current;
		const element = getElement();
		if (isPresent || pop === false || !element || !width || !height) return;
		const isRTL = direction === "rtl";
		const x = anchorX === "left" ? isRTL ? `right: ${right}` : `left: ${left}` : isRTL ? `left: ${left}` : `right: ${right}`;
		const y = anchorY === "bottom" ? `bottom: ${bottom}` : `top: ${top}`;
		element.dataset.motionPopId = id;
		/**
		* Use the element's own document so this works when rendering
		* into another window or iframe (e.g. via window.open()).
		*/
		const doc = element.ownerDocument;
		const style = doc.createElement("style");
		if (nonce) style.nonce = nonce;
		const parent = root ?? doc.head;
		parent.appendChild(style);
		if (style.sheet) style.sheet.insertRule(`
          [data-motion-pop-id="${id}"] {
            position: absolute !important;
            width: ${width}px !important;
            height: ${height}px !important;
            ${x}px !important;
            ${y}px !important;
          }
        `);
		return () => {
			element.removeAttribute("data-motion-pop-id");
			if (parent.contains(style)) parent.removeChild(style);
		};
	}, [isPresent]);
	return jsx(PopChildMeasure, {
		isPresent,
		getElement,
		sizeRef: size,
		pop,
		children: pop === false ? children : React.cloneElement(children, { ref: composedRef })
	});
}
// node_modules/framer-motion/dist/es/components/AnimatePresence/PresenceChild.mjs
var PresenceChild = ({ children, initial, isPresent, onExitComplete, custom, presenceAffectsLayout, mode, anchorX, anchorY, root }) => {
	const presenceChildren = useConstant(newChildrenMap);
	const id = useId();
	/**
	* The outermost motion component within this child. popLayout falls
	* back to its element when the child can't be given a ref, for instance
	* a function component that doesn't forward refs (#2503).
	*/
	const popNode = useRef();
	const isPresentRef = useRef(isPresent);
	const onExitCompleteRef = useRef(onExitComplete);
	useIsomorphicLayoutEffect(() => {
		isPresentRef.current = isPresent;
		onExitCompleteRef.current = onExitComplete;
	});
	let isReusedContext = true;
	let context = useMemo(() => {
		isReusedContext = false;
		return {
			id,
			initial,
			isPresent,
			custom,
			onExitComplete: (childId) => {
				presenceChildren.set(childId, true);
				for (const isComplete of presenceChildren.values()) if (!isComplete) return;
				onExitComplete && onExitComplete();
			},
			register: (childId, node) => {
				presenceChildren.set(childId, false);
				if (node && node.parent?.presenceContext?.id !== id) popNode.current = node;
				return () => {
					presenceChildren.delete(childId);
					!isPresentRef.current && !presenceChildren.size && onExitCompleteRef.current?.();
				};
			}
		};
	}, [
		isPresent,
		presenceChildren,
		onExitComplete
	]);
	/**
	* If the presence of a child affects the layout of the components around it,
	* we want to make a new context value to ensure they get re-rendered
	* so they can detect that layout change.
	*/
	if (presenceAffectsLayout && isReusedContext) context = { ...context };
	useMemo(() => {
		presenceChildren.forEach((_, key) => presenceChildren.set(key, false));
	}, [isPresent]);
	/**
	* If there's no `motion` components to fire exit animations, we want to remove this
	* component immediately.
	*/
	React.useEffect(() => {
		!isPresent && !presenceChildren.size && onExitComplete && onExitComplete();
	}, [isPresent]);
	children = jsx(PopChild, {
		pop: mode === "popLayout",
		isPresent,
		anchorX,
		anchorY,
		root,
		popNode,
		children
	});
	return jsx(PresenceContext.Provider, {
		value: context,
		children
	});
};
function newChildrenMap() {
	return /* @__PURE__ */ new Map();
}
// node_modules/framer-motion/dist/es/components/AnimatePresence/use-presence.mjs
/**
* When a component is the child of `AnimatePresence`, it can use `usePresence`
* to access information about whether it's still present in the React tree.
*
* ```jsx
* import { usePresence } from "framer-motion"
*
* export const Component = () => {
*   const [isPresent, safeToRemove] = usePresence()
*
*   useEffect(() => {
*     !isPresent && setTimeout(safeToRemove, 1000)
*   }, [isPresent])
*
*   return <div />
* }
* ```
*
* If `isPresent` is `false`, it means that a component has been removed from the tree,
* but `AnimatePresence` won't really remove it until `safeToRemove` has been called.
*
* @public
*/
function usePresence(subscribe = true) {
	const context = useContext(PresenceContext);
	if (context === null) return [true, null];
	const { isPresent, onExitComplete, register } = context;
	const id = useId();
	useEffect(() => {
		if (subscribe) return register(id);
	}, [subscribe]);
	const safeToRemove = useCallback(() => subscribe && onExitComplete && onExitComplete(id), [
		id,
		onExitComplete,
		subscribe
	]);
	return !isPresent && onExitComplete ? [false, safeToRemove] : [true];
}
// node_modules/framer-motion/dist/es/components/AnimatePresence/utils.mjs
var getChildKey = (child) => child.key || "";
function onlyElements(children) {
	const filtered = [];
	Children.forEach(children, (child) => {
		if (isValidElement(child)) filtered.push(child);
	});
	return filtered;
}
// node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs
/**
* `AnimatePresence` enables the animation of components that have been removed from the tree.
*
* When adding/removing more than a single child, every child **must** be given a unique `key` prop.
*
* Any `motion` components that have an `exit` property defined will animate out when removed from
* the tree.
*
* ```jsx
* import { motion, AnimatePresence } from 'framer-motion'
*
* export const Items = ({ items }) => (
*   <AnimatePresence>
*     {items.map(item => (
*       <motion.div
*         key={item.id}
*         initial={{ opacity: 0 }}
*         animate={{ opacity: 1 }}
*         exit={{ opacity: 0 }}
*       />
*     ))}
*   </AnimatePresence>
* )
* ```
*
* You can sequence exit animations throughout a tree using variants.
*
* If a child contains multiple `motion` components with `exit` props, it will only unmount the child
* once all `motion` components have finished animating out. Likewise, any components using
* `usePresence` all need to call `safeToRemove`.
*
* @public
*/
var AnimatePresence = ({ children, custom, initial = true, onExitComplete, presenceAffectsLayout = true, mode = "sync", propagate = false, anchorX = "left", anchorY = "top", root }) => {
	const [isParentPresent, safeToRemove] = usePresence(propagate);
	/**
	* Filter any children that aren't ReactElements. We can only track components
	* between renders with a props.key.
	*/
	const presentChildren = useMemo(() => onlyElements(children), [children]);
	/**
	* Track the keys of the currently rendered children. This is used to
	* determine which children are exiting.
	*/
	const presentKeys = propagate && !isParentPresent ? [] : presentChildren.map(getChildKey);
	/**
	* If `initial={false}` we only want to pass this to components in the first render.
	*/
	const isInitialRender = useRef(true);
	/**
	* Track which exiting children have finished animating out.
	*/
	const exitComplete = useConstant(() => /* @__PURE__ */ new Map());
	/**
	* Track which components are currently processing exit to prevent duplicate processing.
	*/
	const exitingComponents = useRef(/* @__PURE__ */ new Set());
	/**
	* Save children to render as React state. To ensure this component is concurrent-safe,
	* we check for exiting children via an effect.
	*/
	const [diffedChildren, setDiffedChildren] = useState(presentChildren);
	const [renderedChildren, setRenderedChildren] = useState(presentChildren);
	useIsomorphicLayoutEffect(() => {
		if (propagate && !isParentPresent && !renderedChildren.length) safeToRemove?.();
	}, [
		isParentPresent,
		propagate,
		renderedChildren.length,
		safeToRemove
	]);
	/**
	* When every exit completes, we re-render to remove the exited children
	* and store onExitComplete here. It fires from the cleanup of an effect
	* keyed on the rendered children, so it runs in the commit that removes
	* them (or when we unmount), after their own effect cleanups.
	*/
	const pendingExitComplete = useRef();
	useEffect(() => () => {
		const callback = pendingExitComplete.current;
		pendingExitComplete.current = void 0;
		callback?.();
	}, [renderedChildren]);
	useIsomorphicLayoutEffect(() => {
		isInitialRender.current = false;
		/**
		* Update complete status of exiting children.
		*/
		for (let i = 0; i < renderedChildren.length; i++) {
			const key = getChildKey(renderedChildren[i]);
			if (!presentKeys.includes(key)) {
				if (exitComplete.get(key) !== true) exitComplete.set(key, false);
			} else {
				exitComplete.delete(key);
				exitingComponents.current.delete(key);
			}
		}
	}, [
		renderedChildren,
		presentKeys.length,
		presentKeys.join("-")
	]);
	const exitingChildren = [];
	if (presentChildren !== diffedChildren) {
		let nextChildren = [...presentChildren];
		/**
		* Loop through all the currently rendered components and decide which
		* are exiting.
		*
		* Exiting children are reinserted directly after the child they
		* previously followed. Splicing at their index within the previously
		* rendered children, as we used to, indexes into the wrong list: it
		* can interleave them with entering children and push present children
		* to new positions, remounting them (#3746).
		*/
		let insertionIndex = 0;
		for (const child of renderedChildren) {
			const presentIndex = presentKeys.indexOf(getChildKey(child));
			if (presentIndex === -1) {
				nextChildren.splice(insertionIndex++, 0, child);
				exitingChildren.push(child);
			} else insertionIndex = presentIndex + exitingChildren.length + 1;
		}
		/**
		* Once every exiting child has finished animating out, remove them
		* all at once. Otherwise, if we're in "wait" mode, we want to only
		* render the exiting children until they've all exited.
		*/
		if (exitingChildren.every((child) => exitComplete.get(getChildKey(child)))) nextChildren = presentChildren;
		else if (mode === "wait") nextChildren = exitingChildren;
		setRenderedChildren(onlyElements(nextChildren));
		setDiffedChildren(presentChildren);
		/**
		* Early return to ensure once we've set state with the latest diffed
		* children, we can immediately re-render.
		*/
		return null;
	}
	if (process.env.NODE_ENV !== "production" && mode === "wait" && renderedChildren.length > 1) console.warn(`You're attempting to animate multiple children within AnimatePresence, but its mode is set to "wait". This will lead to odd visual behaviour.`);
	/**
	* If we've been provided a forceRender function by the LayoutGroupContext,
	* we can use it to force a re-render amongst all surrounding components once
	* all components have finished animating out.
	*/
	const { forceRender } = useContext(LayoutGroupContext);
	return jsx(Fragment, { children: renderedChildren.map((child) => {
		const key = getChildKey(child);
		const isPresent = propagate && !isParentPresent ? false : presentChildren === renderedChildren || presentKeys.includes(key);
		const onExit = () => {
			if (exitingComponents.current.has(key)) return;
			if (exitComplete.has(key)) {
				exitingComponents.current.add(key);
				exitComplete.set(key, true);
			} else return;
			let isEveryExitComplete = true;
			exitComplete.forEach((isExitComplete) => {
				if (!isExitComplete) isEveryExitComplete = false;
			});
			if (isEveryExitComplete) {
				forceRender?.();
				/**
				* Re-diff rather than setting the children to render
				* directly: this update can be applied after a
				* transition has committed new children, so any
				* children read now could be stale by then.
				*/
				setDiffedChildren([]);
				propagate && safeToRemove?.();
				pendingExitComplete.current = onExitComplete;
			}
		};
		return jsx(PresenceChild, {
			isPresent,
			initial: !isInitialRender.current || initial ? void 0 : false,
			custom,
			presenceAffectsLayout,
			mode,
			root,
			onExitComplete: isPresent ? void 0 : onExit,
			anchorX,
			anchorY,
			children: child
		}, key);
	}) });
};
// node_modules/framer-motion/dist/es/context/LazyContext.mjs
var LazyContext = /* @__PURE__ */ createContext({ strict: false });
// node_modules/framer-motion/dist/es/motion/features/definitions.mjs
var featureProps = {
	animation: [
		"animate",
		"variants",
		"whileHover",
		"whileTap",
		"exit",
		"whileInView",
		"whileFocus",
		"whileDrag"
	],
	exit: ["exit"],
	drag: ["drag", "dragControls"],
	focus: ["whileFocus"],
	hover: [
		"whileHover",
		"onHoverStart",
		"onHoverEnd"
	],
	tap: [
		"whileTap",
		"onTap",
		"onTapStart",
		"onTapCancel"
	],
	pan: [
		"onPan",
		"onPanStart",
		"onPanSessionStart",
		"onPanEnd"
	],
	inView: [
		"whileInView",
		"onViewportEnter",
		"onViewportLeave"
	],
	layout: ["layout", "layoutId"]
};
var isInitialized = false;
/**
* Initialize feature definitions with isEnabled checks.
* This must be called before any motion components are rendered.
*/
function initFeatureDefinitions() {
	if (isInitialized) return;
	const initialFeatureDefinitions = {};
	for (const key in featureProps) initialFeatureDefinitions[key] = { isEnabled: (props) => featureProps[key].some((name) => !!props[name]) };
	setFeatureDefinitions(initialFeatureDefinitions);
	isInitialized = true;
}
/**
* Get the current feature definitions, initializing if needed.
*/
function getInitializedFeatureDefinitions() {
	initFeatureDefinitions();
	return getFeatureDefinitions();
}
// node_modules/framer-motion/dist/es/motion/features/load-features.mjs
function loadFeatures(features) {
	const featureDefinitions = getInitializedFeatureDefinitions();
	for (const key in features) featureDefinitions[key] = {
		...featureDefinitions[key],
		...features[key]
	};
	setFeatureDefinitions(featureDefinitions);
}
// node_modules/framer-motion/dist/es/components/LazyMotion/index.mjs
/**
* Used in conjunction with the `m` component to reduce bundle size.
*
* `m` is a version of the `motion` component that only loads functionality
* critical for the initial render.
*
* `LazyMotion` can then be used to either synchronously or asynchronously
* load animation and gesture support.
*
* ```jsx
* // Synchronous loading
* import { LazyMotion, m, domAnimation } from "framer-motion"
*
* function App() {
*   return (
*     <LazyMotion features={domAnimation}>
*       <m.div animate={{ scale: 2 }} />
*     </LazyMotion>
*   )
* }
*
* // Asynchronous loading
* import { LazyMotion, m } from "framer-motion"
*
* function App() {
*   return (
*     <LazyMotion features={() => import('./path/to/domAnimation')}>
*       <m.div animate={{ scale: 2 }} />
*     </LazyMotion>
*   )
* }
* ```
*
* @public
*/
function LazyMotion({ children, features, strict = false }) {
	const [, setIsLoaded] = useState(!isLazyBundle(features));
	const loadedRenderer = useRef(void 0);
	/**
	* If this is a synchronous load, load features immediately
	*/
	if (!isLazyBundle(features)) {
		const { renderer, ...loadedFeatures } = features;
		loadedRenderer.current = renderer;
		loadFeatures(loadedFeatures);
	}
	useEffect(() => {
		if (isLazyBundle(features)) features().then(({ renderer, ...loadedFeatures }) => {
			loadFeatures(loadedFeatures);
			loadedRenderer.current = renderer;
			setIsLoaded(true);
		});
	}, []);
	return jsx(LazyContext.Provider, {
		value: {
			renderer: loadedRenderer.current,
			strict
		},
		children
	});
}
function isLazyBundle(features) {
	return typeof features === "function";
}
// node_modules/framer-motion/dist/es/context/MotionContext/index.mjs
var MotionContext = /* @__PURE__ */ createContext({});
// node_modules/framer-motion/dist/es/context/MotionContext/utils.mjs
function getCurrentTreeVariants(props, context) {
	if (isControllingVariants(props)) {
		const { initial, animate } = props;
		return {
			initial: initial === false || isVariantLabel(initial) ? initial : void 0,
			animate: isVariantLabel(animate) ? animate : void 0
		};
	}
	return props.inherit !== false ? context : {};
}
// node_modules/framer-motion/dist/es/context/MotionContext/create.mjs
function useCreateMotionContext(props) {
	const { initial, animate } = getCurrentTreeVariants(props, useContext(MotionContext));
	return useMemo(() => ({
		initial,
		animate
	}), [variantLabelsAsDependency(initial), variantLabelsAsDependency(animate)]);
}
function variantLabelsAsDependency(prop) {
	return Array.isArray(prop) ? prop.join(" ") : prop;
}
// node_modules/framer-motion/dist/es/render/html/utils/create-render-state.mjs
var createHtmlRenderState = () => ({
	style: {},
	transform: {},
	transformOrigin: {},
	vars: {}
});
// node_modules/framer-motion/dist/es/render/html/use-props.mjs
function copyRawValuesOnly(target, source, props) {
	for (const key in source) if (!isMotionValue(source[key]) && !isForcedMotionValue(key, props)) target[key] = source[key];
}
function useInitialMotionValues({ transformTemplate }, visualState) {
	return useMemo(() => {
		const state = createHtmlRenderState();
		buildHTMLStyles(state, visualState, transformTemplate);
		return Object.assign({}, state.vars, state.style);
	}, [visualState]);
}
function useStyle(props, visualState) {
	const styleProp = props.style || {};
	const style = {};
	/**
	* Copy non-Motion Values straight into style
	*/
	copyRawValuesOnly(style, styleProp, props);
	Object.assign(style, useInitialMotionValues(props, visualState));
	return style;
}
function useHTMLProps(props, visualState) {
	const htmlProps = {};
	const style = useStyle(props, visualState);
	if (props.drag && props.dragListener !== false) {
		htmlProps.draggable = false;
		style.userSelect = style.WebkitUserSelect = style.WebkitTouchCallout = "none";
		style.touchAction = props.drag === true ? "none" : `pan-${props.drag === "x" ? "y" : "x"}`;
	}
	if (props.tabIndex === void 0 && (props.onTap || props.onTapStart || props.whileTap)) htmlProps.tabIndex = 0;
	htmlProps.style = style;
	return htmlProps;
}
// node_modules/framer-motion/dist/es/render/svg/utils/create-render-state.mjs
var createSvgRenderState = () => ({
	...createHtmlRenderState(),
	attrs: {}
});
// node_modules/framer-motion/dist/es/render/svg/use-props.mjs
function useSVGProps(props, visualState, _isStatic, Component) {
	const visualProps = useMemo(() => {
		const state = createSvgRenderState();
		buildSVGAttrs(state, visualState, isSVGTag(Component), props.transformTemplate, props.style);
		return {
			...state.attrs,
			style: { ...state.style }
		};
	}, [visualState]);
	if (props.style) {
		/**
		* Build a fresh style each render rather than writing back into
		* the memoised visualProps, which would carry the previous
		* render's raw styles over (and above) the latest ones.
		*/
		const style = {};
		copyRawValuesOnly(style, props.style, props);
		return {
			...visualProps,
			style: {
				...style,
				...visualProps.style
			}
		};
	}
	return visualProps;
}
// node_modules/framer-motion/dist/es/motion/utils/valid-prop.mjs
/**
* A list of all valid MotionProps.
*
* @privateRemarks
* This doesn't throw if a `MotionProp` name is missing - it should.
*/
var validMotionProps = /* @__PURE__ */ new Set([
	"animate",
	"exit",
	"variants",
	"initial",
	"style",
	"values",
	"transition",
	"transformTemplate",
	"custom",
	"inherit",
	"onBeforeLayoutMeasure",
	"onAnimationStart",
	"onAnimationComplete",
	"onUpdate",
	"onDragStart",
	"onDrag",
	"onDragEnd",
	"onMeasureDragConstraints",
	"onDirectionLock",
	"onDragTransitionEnd",
	"_dragX",
	"_dragY",
	"onHoverStart",
	"onHoverEnd",
	"onViewportEnter",
	"onViewportLeave",
	"globalTapTarget",
	"propagate",
	"ignoreStrict",
	"viewport"
]);
/**
* Check whether a prop name is a valid `MotionProp` key.
*
* @param key - Name of the property to check
* @returns `true` is key is a valid `MotionProp`.
*
* @public
*/
function isValidMotionProp(key) {
	return key.startsWith("while") || key.startsWith("drag") && key !== "draggable" || key.startsWith("layout") || key.startsWith("onTap") || key.startsWith("onPan") || key.startsWith("onLayout") || validMotionProps.has(key);
}
// node_modules/framer-motion/dist/es/render/dom/utils/filter-props.mjs
function shouldForward(key, isValidProp) {
	return key.startsWith("on") ? !isValidMotionProp(key) : isValidProp?.(key) ?? !isValidMotionProp(key);
}
function filterProps(props, isDom, forwardMotionProps, isValidProp) {
	const filteredProps = {};
	for (const key in props) {
		/**
		* values is considered a valid prop by Emotion, so if it's present
		* this will be rendered out to the DOM unless explicitly filtered.
		*
		* We check the type as it could be used with the `feColorMatrix`
		* element, which we support.
		*/
		if (key === "values" && typeof props.values === "object") continue;
		if (isMotionValue(props[key])) continue;
		if (shouldForward(key, isValidProp) || forwardMotionProps === true && isValidMotionProp(key) || !isDom && !isValidMotionProp(key) || props["draggable"] && key.startsWith("onDrag")) filteredProps[key] = props[key];
	}
	return filteredProps;
}
// node_modules/framer-motion/dist/es/render/svg/lowercase-elements.mjs
/**
* We keep these listed separately as we use the lowercase tag names as part
* of the runtime bundle to detect SVG components
*/
var lowercaseSVGElements = [
	"animate",
	"circle",
	"defs",
	"desc",
	"ellipse",
	"g",
	"image",
	"line",
	"filter",
	"marker",
	"mask",
	"metadata",
	"path",
	"pattern",
	"polygon",
	"polyline",
	"rect",
	"stop",
	"switch",
	"symbol",
	"svg",
	"text",
	"tspan",
	"use",
	"view"
];
// node_modules/framer-motion/dist/es/render/dom/utils/is-svg-component.mjs
function isSVGComponent(Component) {
	if (typeof Component !== "string" || Component.includes("-")) return false;
	else if (lowercaseSVGElements.indexOf(Component) > -1 || /[A-Z]/u.test(Component)) return true;
	return false;
}
// node_modules/framer-motion/dist/es/render/dom/use-render.mjs
function useRender(Component, props, ref, { latestValues }, isStatic, forwardMotionProps = false, isSVG, isValidProp) {
	const visualProps = (isSVG ?? isSVGComponent(Component) ? useSVGProps : useHTMLProps)(props, latestValues, isStatic, Component);
	const filteredProps = filterProps(props, typeof Component === "string", forwardMotionProps, isValidProp);
	const elementProps = Component !== Fragment$1 ? {
		...filteredProps,
		...visualProps,
		ref
	} : {};
	/**
	* If component has been handed a motion value as its child,
	* memoise its initial value and render that. Subsequent updates
	* will be handled by the onChange handler
	*/
	const { children } = props;
	const renderedChildren = useMemo(() => isMotionValue(children) ? children.get() : children, [children]);
	return createElement(Component, {
		...elementProps,
		children: renderedChildren
	});
}
// node_modules/framer-motion/dist/es/motion/utils/use-visual-state.mjs
function makeState({ scrapeMotionValuesFromProps, createRenderState }, props, context, presenceContext) {
	return {
		latestValues: makeLatestValues(props, context, presenceContext, scrapeMotionValuesFromProps),
		renderState: createRenderState()
	};
}
function makeLatestValues(props, context, presenceContext, scrapeMotionValues) {
	const values = {};
	const motionValues = scrapeMotionValues(props, {});
	for (const key in motionValues) values[key] = resolveMotionValue(motionValues[key]);
	let { initial, animate } = props;
	const isControllingVariants$1 = isControllingVariants(props);
	const isVariantNode$1 = isVariantNode(props);
	if (context && isVariantNode$1 && !isControllingVariants$1 && props.inherit !== false) {
		if (initial === void 0) initial = context.initial;
		if (animate === void 0) animate = context.animate;
	}
	let isInitialAnimationBlocked = presenceContext ? presenceContext.initial === false : false;
	isInitialAnimationBlocked = isInitialAnimationBlocked || initial === false;
	const variantToSet = isInitialAnimationBlocked ? animate : initial;
	if (variantToSet && typeof variantToSet !== "boolean" && !isAnimationControls(variantToSet)) {
		const list = Array.isArray(variantToSet) ? variantToSet : [variantToSet];
		for (let i = 0; i < list.length; i++) {
			const resolved = resolveVariantFromProps(props, list[i]);
			if (resolved) {
				const { transitionEnd, transition, ...target } = resolved;
				for (const key in target) {
					let valueTarget = target[key];
					if (Array.isArray(valueTarget)) {
						/**
						* Take final keyframe if the initial animation is blocked because
						* we want to initialise at the end of that blocked animation.
						*/
						const index = isInitialAnimationBlocked ? valueTarget.length - 1 : 0;
						valueTarget = valueTarget[index];
					}
					if (valueTarget !== null) values[key] = valueTarget;
				}
				for (const key in transitionEnd) values[key] = transitionEnd[key];
			}
		}
	}
	return values;
}
var makeUseVisualState = (config) => (props, isStatic) => {
	const context = useContext(MotionContext);
	const presenceContext = useContext(PresenceContext);
	const make = () => makeState(config, props, context, presenceContext);
	return isStatic ? make() : useConstant(make);
};
// node_modules/framer-motion/dist/es/render/html/use-html-visual-state.mjs
var useHTMLVisualState = /*@__PURE__*/ makeUseVisualState({
	scrapeMotionValuesFromProps: scrapeHTMLMotionValuesFromProps,
	createRenderState: createHtmlRenderState
});
// node_modules/framer-motion/dist/es/render/svg/use-svg-visual-state.mjs
var useSVGVisualState = /*@__PURE__*/ makeUseVisualState({
	scrapeMotionValuesFromProps: scrapeSVGMotionValuesFromProps,
	createRenderState: createSvgRenderState
});
// node_modules/framer-motion/dist/es/motion/utils/symbol.mjs
var motionComponentSymbol = /* @__PURE__ */ Symbol.for("motionComponentSymbol");
// node_modules/framer-motion/dist/es/motion/utils/use-motion-ref.mjs
/**
* Creates a ref function that, when called, hydrates the provided
* external ref and VisualElement.
*/
function useMotionRef(visualState, visualElement, externalRef) {
	/**
	* Store externalRef in a ref to avoid including it in the useCallback
	* dependency array. Including externalRef in dependencies causes issues
	* with libraries like Radix UI that create new callback refs on each render
	* when using asChild - this would cause the callback to be recreated,
	* triggering element remounts and breaking AnimatePresence exit animations.
	*/
	const externalRefContainer = useRef(externalRef);
	useInsertionEffect(() => {
		externalRefContainer.current = externalRef;
	});
	const refCleanup = useRef(null);
	return useCallback((instance) => {
		if (instance) visualState.onMount?.(instance);
		if (visualElement) instance ? visualElement.mount(instance) : visualElement.unmount();
		const ref = externalRefContainer.current;
		if (typeof ref === "function") {
			if (instance) {
				const cleanup = ref(instance);
				if (typeof cleanup === "function") refCleanup.current = cleanup;
			} else if (refCleanup.current) {
				refCleanup.current();
				refCleanup.current = null;
			} else ref(instance);
		} else if (ref) ref.current = instance;
	}, [visualElement]);
}
// node_modules/framer-motion/dist/es/context/SwitchLayoutGroupContext.mjs
/**
* Internal, exported only for usage in Framer
*/
var SwitchLayoutGroupContext = /* @__PURE__ */ createContext({});
// node_modules/framer-motion/dist/es/utils/is-ref-object.mjs
function isRefObject(ref) {
	return ref && typeof ref === "object" && Object.prototype.hasOwnProperty.call(ref, "current");
}
// node_modules/framer-motion/dist/es/motion/utils/use-visual-element.mjs
function useVisualElement(Component, visualState, props, createVisualElement, ProjectionNodeConstructor, isSVG) {
	const { visualElement: parent } = useContext(MotionContext);
	const lazyContext = useContext(LazyContext);
	const presenceContext = useContext(PresenceContext);
	const motionConfig = useContext(MotionConfigContext);
	const reducedMotionConfig = motionConfig.reducedMotion;
	const skipAnimations = motionConfig.skipAnimations;
	const visualElementRef = useRef(null);
	/**
	* Track whether the component has been through React's commit phase.
	* Used to detect when LazyMotion features load after the component has mounted.
	*/
	const hasMountedOnce = useRef(false);
	/**
	* If we haven't preloaded a renderer, check to see if we have one lazy-loaded
	*/
	createVisualElement = createVisualElement || lazyContext.renderer;
	if (!visualElementRef.current && createVisualElement) {
		visualElementRef.current = createVisualElement(Component, {
			visualState,
			parent,
			props,
			presenceContext,
			blockInitialAnimation: presenceContext ? presenceContext.initial === false : false,
			reducedMotionConfig,
			skipAnimations,
			isSVG
		});
		/**
		* If the component has already mounted before features loaded (e.g. via
		* LazyMotion with async feature loading), we need to force the initial
		* animation to run. Otherwise state changes that occurred before features
		* loaded will be lost and the element will snap to its final state.
		*/
		if (hasMountedOnce.current && visualElementRef.current) visualElementRef.current.manuallyAnimateOnMount = true;
	}
	const visualElement = visualElementRef.current;
	/**
	* Load Motion gesture and animation features. These are rendered as renderless
	* components so each feature can optionally make use of React lifecycle methods.
	*/
	const initialLayoutGroupConfig = useContext(SwitchLayoutGroupContext);
	if (visualElement && !visualElement.projection && ProjectionNodeConstructor && (visualElement.type === "html" || visualElement.type === "svg")) createProjectionNode(visualElementRef.current, props, ProjectionNodeConstructor, initialLayoutGroupConfig);
	useInsertionEffect(() => {
		/**
		* Skip the update if the visual element was created with these props.
		* This isn't gated on the layout effect below having run, as a hidden
		* <Activity> runs insertion effects but not layout effects, and
		* props from renders made while hidden must still reach the element.
		*/
		if (visualElement && visualElement.props !== props) visualElement.update(props, presenceContext);
	});
	/**
	* Cache this value as we want to know whether HandoffAppearAnimations
	* was present on initial render - it will be deleted after this.
	*/
	const optimisedAppearId = props[optimizedAppearDataAttribute];
	const wantsHandoff = useRef(Boolean(optimisedAppearId) && typeof window !== "undefined" && !window.MotionHandoffIsComplete?.(optimisedAppearId) && window.MotionHasOptimisedAnimation?.(optimisedAppearId));
	/**
	* Layout effects re-run when a hidden Suspense/Activity boundary is
	* revealed, but passive effects only re-run if this component re-renders
	* (not the case for memoized elements). Replay animations on every
	* reconnection. Must be declared before the effect that sets hasMountedOnce.
	*/
	useIsomorphicLayoutEffect(() => {
		if (!hasMountedOnce.current || !visualElement) return;
		visualElement.animationState?.animateChanges();
		visualElement.enteringChildren = void 0;
	}, []);
	useIsomorphicLayoutEffect(() => {
		/**
		* Track that this component has mounted. This is used to detect when
		* LazyMotion features load after the component has already committed.
		*/
		hasMountedOnce.current = true;
		if (!visualElement) return;
		window.MotionIsMounted = true;
		visualElement.updateFeatures();
		visualElement.scheduleRenderMicrotask();
		/**
		* Ideally this function would always run in a useEffect.
		*
		* However, if we have optimised appear animations to handoff from,
		* it needs to happen synchronously to ensure there's no flash of
		* incorrect styles in the event of a hydration error.
		*
		* So if we detect a situation where optimised appear animations
		* are running, we use useLayoutEffect to trigger animations.
		*/
		if (wantsHandoff.current && visualElement.animationState) visualElement.animationState.animateChanges();
	});
	useEffect(() => {
		if (!visualElement) return;
		if (!wantsHandoff.current && visualElement.animationState) visualElement.animationState.animateChanges();
		if (wantsHandoff.current) {
			queueMicrotask(() => {
				window.MotionHandoffMarkAsComplete?.(optimisedAppearId);
			});
			wantsHandoff.current = false;
		}
		/**
		* Now we've finished triggering animations for this element we
		* can wipe the enteringChildren set for the next render.
		*/
		visualElement.enteringChildren = void 0;
	});
	return visualElement;
}
function createProjectionNode(visualElement, props, ProjectionNodeConstructor, initialPromotionConfig) {
	const { layoutId, layout, drag, dragConstraints, layoutScroll, layoutRoot, layoutAnchor, layoutCrossfade } = props;
	const projection = visualElement.projection = new ProjectionNodeConstructor(visualElement.latestValues, props["data-framer-portal-id"] ? void 0 : getClosestProjectingNode(visualElement.parent));
	projection.setOptions({
		layoutId,
		layout,
		alwaysMeasureLayout: Boolean(drag) || dragConstraints && isRefObject(dragConstraints),
		visualElement,
		/**
		* TODO: Update options in an effect. This could be tricky as it'll be too late
		* to update by the time layout animations run.
		* We also need to fix this safeToRemove by linking it up to the one returned by usePresence,
		* ensuring it gets called if there's no potential layout animations.
		*
		*/
		animationType: typeof layout === "string" ? layout : "both",
		initialPromotionConfig,
		crossfade: layoutCrossfade,
		layoutScroll,
		layoutRoot,
		layoutAnchor
	});
	/**
	* This node will take over from its layoutId's current lead, so snapshot
	* the lead now, while rendering. By the time the lead unmounts (or this
	* node mounts) React may already have committed DOM changes that come
	* before it in the tree, like a sibling changing height, and a snapshot
	* taken then starts the animation from a position never seen on screen.
	*
	* If React discards this render (e.g. it suspends), nothing else
	* completes the update, so check it after the next frame as an
	* unmounting node does.
	*/
	const lead = projection.getStack()?.lead;
	if (lead && !projection.root.isUpdateBlocked()) {
		lead.willUpdate();
		lead.scheduleCheckAfterUnmount();
	}
}
function getClosestProjectingNode(visualElement) {
	if (!visualElement) return void 0;
	return visualElement.options.allowProjection !== false ? visualElement.projection : getClosestProjectingNode(visualElement.parent);
}
// node_modules/framer-motion/dist/es/motion/index.mjs
/**
* Create a `motion` component.
*
* This function accepts a Component argument, which can be either a string (ie "div"
* for `motion.div`), or an actual React component.
*
* Alongside this is a config option which provides a way of rendering the provided
* component "offline", or outside the React render cycle.
*/
function createMotionComponent(Component, { forwardMotionProps = false, type } = {}, preloadedFeatures, createVisualElement) {
	preloadedFeatures && loadFeatures(preloadedFeatures);
	/**
	* Determine whether to use SVG or HTML rendering based on:
	* 1. Explicit `type` option (highest priority)
	* 2. Auto-detection via `isSVGComponent`
	*/
	const isSVG = type ? type === "svg" : isSVGComponent(Component);
	const useVisualState = isSVG ? useSVGVisualState : useHTMLVisualState;
	function MotionDOMComponent(props, externalRef) {
		/**
		* If we need to measure the element we load this functionality in a
		* separate class component in order to gain access to getSnapshotBeforeUpdate.
		*/
		let MeasureLayout;
		const layoutId = useLayoutId(props);
		/**
		* An element that mounts with the layoutId of one that's already
		* rendered takes over from it with a shared layout animation, so
		* visually it has already entered. Mount it as if initial={false}
		* rather than replaying its entrance.
		*
		* Only when it has an initial: without one there's no entrance to
		* skip, and initial={false} would make its animate values its base
		* values, so removing them later wouldn't return it to its defaults.
		*/
		if (useConstant(() => !!rootProjectionNode.current?.sharedNodes.get(layoutId)?.lead && props.initial)) props = {
			...props,
			initial: false
		};
		const configAndProps = {
			...useContext(MotionConfigContext),
			...props,
			layoutId
		};
		const { isStatic, isValidProp } = configAndProps;
		const context = useCreateMotionContext(props);
		const visualState = useVisualState(props, isStatic);
		if (!isStatic && typeof window !== "undefined") {
			useStrictMode(configAndProps, preloadedFeatures);
			const layoutProjection = getProjectionFunctionality(configAndProps);
			MeasureLayout = layoutProjection.MeasureLayout;
			/**
			* Create a VisualElement for this component. A VisualElement provides a common
			* interface to renderer-specific APIs (ie DOM/Three.js etc) as well as
			* providing a way of rendering to these APIs outside of the React render loop
			* for more performant animations and interactions
			*/
			context.visualElement = useVisualElement(Component, visualState, configAndProps, createVisualElement, layoutProjection.ProjectionNode, isSVG);
		}
		/**
		* The mount order and hierarchy is specific to ensure our element ref
		* is hydrated by the time features fire their effects.
		*/
		return jsxs(MotionContext.Provider, {
			value: context,
			children: [MeasureLayout && context.visualElement ? jsx(MeasureLayout, {
				visualElement: context.visualElement,
				...configAndProps
			}) : null, useRender(Component, props, useMotionRef(visualState, context.visualElement, externalRef), visualState, isStatic, forwardMotionProps, isSVG, isValidProp)]
		});
	}
	MotionDOMComponent.displayName = `motion.${typeof Component === "string" ? Component : `create(${Component.displayName ?? Component.name ?? ""})`}`;
	const ForwardRefMotionComponent = forwardRef(MotionDOMComponent);
	ForwardRefMotionComponent[motionComponentSymbol] = Component;
	return ForwardRefMotionComponent;
}
function useLayoutId({ layoutId }) {
	const layoutGroupId = useContext(LayoutGroupContext).id;
	return layoutGroupId && layoutId !== void 0 ? layoutGroupId + "-" + layoutId : layoutId;
}
function useStrictMode(configAndProps, preloadedFeatures) {
	const isStrict = useContext(LazyContext).strict;
	/**
	* If we're in development mode, check to make sure we're not rendering a motion component
	* as a child of LazyMotion, as this will break the file-size benefits of using it.
	*/
	if (process.env.NODE_ENV !== "production" && preloadedFeatures && isStrict) {
		const strictMessage = "You have rendered a `motion` component within a `LazyMotion` component. This will break tree shaking. Import and render a `m` component instead.";
		configAndProps.ignoreStrict ? warning(false, strictMessage, "lazy-strict-mode") : invariant(false, strictMessage, "lazy-strict-mode");
	}
}
function getProjectionFunctionality(props) {
	const { drag, layout } = getInitializedFeatureDefinitions();
	if (!drag && !layout) return {};
	const combined = {
		...drag,
		...layout
	};
	return {
		MeasureLayout: drag?.isEnabled(props) || layout?.isEnabled(props) ? combined.MeasureLayout : void 0,
		ProjectionNode: combined.ProjectionNode
	};
}
// node_modules/framer-motion/dist/es/render/components/create-proxy.mjs
function createMotionProxy(preloadedFeatures, createVisualElement) {
	if (typeof Proxy === "undefined") return createMotionComponent;
	/**
	* A cache of generated `motion` components, e.g `motion.div`, `motion.input` etc.
	* Rather than generating them anew every render.
	*/
	const componentCache = /* @__PURE__ */ new Map();
	const factory = (Component, options) => {
		return createMotionComponent(Component, options, preloadedFeatures, createVisualElement);
	};
	/**
	* Support for deprecated`motion(Component)` pattern
	*/
	const deprecatedFactoryFunction = (Component, options) => {
		if (process.env.NODE_ENV !== "production") warnOnce(false, "motion() is deprecated. Use motion.create() instead.");
		return factory(Component, options);
	};
	return new Proxy(deprecatedFactoryFunction, { 
	/**
	* Called when `motion` is referenced with a prop: `motion.div`, `motion.input` etc.
	* The prop name is passed through as `key` and we can use that to generate a `motion`
	* DOM component with that name.
	*/
get: (_target, key) => {
		if (key === "create") return factory;
		/**
		* If this element doesn't exist in the component cache, create it and cache.
		*/
		if (!componentCache.has(key)) componentCache.set(key, createMotionComponent(key, void 0, preloadedFeatures, createVisualElement));
		return componentCache.get(key);
	} });
}
// node_modules/framer-motion/dist/es/render/components/m/proxy.mjs
var m = /*@__PURE__*/ createMotionProxy();
// node_modules/framer-motion/dist/es/render/dom/create-visual-element.mjs
var createDomVisualElement = (Component, options) => {
	return options.isSVG ?? isSVGComponent(Component) ? new SVGVisualElement(options) : new HTMLVisualElement(options, { allowProjection: Component !== Fragment$1 });
};
// node_modules/framer-motion/dist/es/motion/features/animation/index.mjs
var AnimationFeature = class extends Feature {
	/**
	* We dynamically generate the AnimationState manager as it contains a reference
	* to the underlying animation library. We only want to load that if we load this,
	* so people can optionally code split it out using the `m` component.
	*/
	constructor(node) {
		super(node);
		node.animationState || (node.animationState = createAnimationState(node));
	}
	updateAnimationControlsSubscription() {
		const { animate } = this.node.getProps();
		if (isAnimationControls(animate)) this.unmountControls = animate.subscribe(this.node);
	}
	/**
	* Subscribe any provided AnimationControls to the component's VisualElement
	*/
	mount() {
		this.updateAnimationControlsSubscription();
	}
	update() {
		const { animate } = this.node.getProps();
		const { animate: prevAnimate } = this.node.prevProps || {};
		if (animate !== prevAnimate) this.updateAnimationControlsSubscription();
	}
	unmount() {
		this.node.animationState.reset();
		this.unmountControls?.();
	}
};
// node_modules/framer-motion/dist/es/motion/features/animation/exit.mjs
var id = 0;
var ExitAnimationFeature = class extends Feature {
	constructor() {
		super(...arguments);
		this.id = id++;
	}
	update() {
		const { presenceContext, prevPresenceContext, animationState } = this.node;
		if (!presenceContext || !animationState) return;
		const { isPresent, onExitComplete } = presenceContext;
		const prevIsPresent = prevPresenceContext?.isPresent;
		if (isPresent === prevIsPresent) return;
		if (isPresent && prevIsPresent === false) {
			/**
			* When re-entering after the exit completed (element is at
			* rest), replay the enter animation from initial.
			*/
			if (this.exit === true) {
				const { initial } = this.node.getProps();
				if (initial && !Array.isArray(initial)) {
					const { transition, transitionEnd, ...target } = resolveVariant(this.node, initial) || {};
					for (const key in target) this.node.getValue(key)?.jump(target[key]);
				}
				/**
				* A re-entering element is no longer an initial child, so
				* AnimatePresence's initial={false} mustn't block its enter.
				*/
				this.node.blockInitialAnimation = false;
				animationState.reset();
				animationState.animateChanges();
			} else animationState.setActive("exit", false);
			this.exit = void 0;
			return;
		}
		const exit = this.exit = animationState.setActive("exit", !isPresent);
		if (onExitComplete && !isPresent) exit.then(() => {
			/**
			* An exit can resolve after the element has re-entered, e.g.
			* when its final tick lands in the stop() of the enter.
			*/
			if (this.exit !== exit) return;
			this.exit = true;
			onExitComplete(this.id);
		});
	}
	mount() {
		const { register, onExitComplete } = this.node.presenceContext || {};
		if (onExitComplete) onExitComplete(this.id);
		if (register) this.unmount = register(this.id, this.node);
	}
	unmount() {}
};
// node_modules/framer-motion/dist/es/motion/features/animations.mjs
var animations = {
	animation: { Feature: AnimationFeature },
	exit: { Feature: ExitAnimationFeature }
};
// node_modules/framer-motion/dist/es/gestures/hover.mjs
function handleHoverEvent(node, event, lifecycle) {
	const { props } = node;
	if (node.animationState && props.whileHover) node.animationState.setActive("whileHover", lifecycle === "Start");
	const callback = props["onHover" + lifecycle];
	if (callback) frame.postRender(() => callback(event, extractEventInfo(event)));
}
var HoverGesture = class extends Feature {
	mount() {
		const { current } = this.node;
		if (!current) return;
		this.unmount = hover(current, (_element, startEvent) => {
			handleHoverEvent(this.node, startEvent, "Start");
			return (endEvent) => handleHoverEvent(this.node, endEvent, "End");
		});
	}
	unmount() {}
};
// node_modules/framer-motion/dist/es/gestures/focus.mjs
var FocusGesture = class extends Feature {
	constructor() {
		super(...arguments);
		this.isActive = false;
	}
	onFocus() {
		let isFocusVisible = false;
		/**
		* If this element doesn't match focus-visible then don't
		* apply whileHover. But, if matches throws that focus-visible
		* is not a valid selector then in that browser outline styles will be applied
		* to the element by default and we want to match that behaviour with whileFocus.
		*/
		try {
			isFocusVisible = this.node.current.matches(":focus-visible");
		} catch (e) {
			isFocusVisible = true;
		}
		if (!isFocusVisible || !this.node.animationState) return;
		this.node.animationState.setActive("whileFocus", true);
		this.isActive = true;
	}
	onBlur() {
		if (!this.isActive || !this.node.animationState) return;
		this.node.animationState.setActive("whileFocus", false);
		this.isActive = false;
	}
	mount() {
		this.unmount = pipe(addDomEvent(this.node.current, "focus", () => this.onFocus()), addDomEvent(this.node.current, "blur", () => this.onBlur()));
	}
	unmount() {}
};
// node_modules/framer-motion/dist/es/gestures/press.mjs
function handlePressEvent(node, event, lifecycle) {
	const { props } = node;
	if (node.current instanceof HTMLButtonElement && node.current.disabled) return;
	if (node.animationState && props.whileTap) node.animationState.setActive("whileTap", lifecycle === "Start");
	const callback = props["onTap" + (lifecycle === "End" ? "" : lifecycle)];
	if (callback) frame.postRender(() => callback(event, extractEventInfo(event)));
}
var PressGesture = class extends Feature {
	mount() {
		const { current } = this.node;
		if (!current) return;
		const { globalTapTarget, propagate } = this.node.props;
		this.unmount = press(current, (_element, startEvent) => {
			handlePressEvent(this.node, startEvent, "Start");
			return (endEvent, { success }) => handlePressEvent(this.node, endEvent, success ? "End" : "Cancel");
		}, {
			useGlobalTarget: globalTapTarget,
			stopPropagation: propagate?.tap === false
		});
	}
	unmount() {}
};
// node_modules/framer-motion/dist/es/motion/features/viewport/observers.mjs
/**
* Map an IntersectionHandler callback to an element. We only ever make one handler for one
* element, so even though these handlers might all be triggered by different
* observers, we can keep them in the same map.
*/
var observerCallbacks = /* @__PURE__ */ new WeakMap();
/**
* Multiple observers can be created for multiple element/document roots. Each with
* different settings. So here we store dictionaries of observers to each root,
* using serialised settings (threshold/margin) as lookup keys.
*/
var observers = /* @__PURE__ */ new WeakMap();
var fireObserverCallback = (entry) => {
	const callback = observerCallbacks.get(entry.target);
	callback && callback(entry);
};
var fireAllObserverCallbacks = (entries) => {
	entries.forEach(fireObserverCallback);
};
function initIntersectionObserver({ root, ...options }) {
	const lookupRoot = root || document;
	/**
	* If we don't have an observer lookup map for this root, create one.
	*/
	if (!observers.has(lookupRoot)) observers.set(lookupRoot, {});
	const rootObservers = observers.get(lookupRoot);
	const key = JSON.stringify(options);
	/**
	* If we don't have an observer for this combination of root and settings,
	* create one.
	*/
	if (!rootObservers[key]) rootObservers[key] = new IntersectionObserver(fireAllObserverCallbacks, {
		root,
		...options
	});
	return rootObservers[key];
}
function observeIntersection(element, options, callback) {
	const rootInteresectionObserver = initIntersectionObserver(options);
	observerCallbacks.set(element, callback);
	rootInteresectionObserver.observe(element);
	return () => {
		observerCallbacks.delete(element);
		rootInteresectionObserver.unobserve(element);
	};
}
// node_modules/framer-motion/dist/es/motion/features/viewport/index.mjs
var thresholdNames = {
	some: 0,
	all: 1
};
var InViewFeature = class extends Feature {
	constructor() {
		super(...arguments);
		this.hasEnteredView = false;
		this.isInView = false;
	}
	startObserver() {
		this.stopObserver?.();
		const { viewport = {} } = this.node.getProps();
		const { root, margin: rootMargin, amount = "some", once } = viewport;
		const options = {
			root: root ? root.current : void 0,
			rootMargin,
			threshold: typeof amount === "number" ? amount : thresholdNames[amount]
		};
		const onIntersectionUpdate = (entry) => {
			const { isIntersecting } = entry;
			/**
			* If there's been no change in the viewport state, early return.
			*/
			if (this.isInView === isIntersecting) return;
			this.isInView = isIntersecting;
			/**
			* Handle hasEnteredView. If this is only meant to run once, and
			* element isn't visible, early return. Otherwise set hasEnteredView to true.
			*/
			if (once && !isIntersecting && this.hasEnteredView) return;
			else if (isIntersecting) this.hasEnteredView = true;
			if (this.node.animationState) this.node.animationState.setActive("whileInView", isIntersecting);
			/**
			* Use the latest committed props rather than the ones in scope
			* when this observer is created
			*/
			const { onViewportEnter, onViewportLeave } = this.node.getProps();
			const callback = isIntersecting ? onViewportEnter : onViewportLeave;
			callback && callback(entry);
		};
		this.stopObserver = observeIntersection(this.node.current, options, onIntersectionUpdate);
	}
	mount() {
		this.startObserver();
	}
	update() {
		if (typeof IntersectionObserver === "undefined") return;
		const { props, prevProps } = this.node;
		if ([
			"amount",
			"margin",
			"root"
		].some(hasViewportOptionChanged(props, prevProps))) this.startObserver();
	}
	unmount() {
		this.stopObserver?.();
		this.hasEnteredView = false;
		this.isInView = false;
	}
};
function hasViewportOptionChanged({ viewport = {} }, { viewport: prevViewport = {} } = {}) {
	return (name) => viewport[name] !== prevViewport[name];
}
// node_modules/framer-motion/dist/es/render/dom/features-animation.mjs
/**
* @public
*/
var domAnimation = /* @__PURE__ */ Object.assign({ renderer: createDomVisualElement }, animations, {
	inView: { Feature: InViewFeature },
	tap: { Feature: PressGesture },
	focus: { Feature: FocusGesture },
	hover: { Feature: HoverGesture }
});
// node_modules/framer-motion/dist/es/utils/use-motion-value-event.mjs
function useMotionValueEvent(value, event, callback) {
	/**
	* useInsertionEffect will create subscriptions before any other
	* effects will run. Effects run upwards through the tree so it
	* can be that binding a useLayoutEffect higher up the tree can
	* miss changes from lower down the tree.
	*/
	useInsertionEffect(() => value.on(event, callback), [
		value,
		event,
		callback
	]);
}
// node_modules/framer-motion/dist/es/render/dom/scroll/info.mjs
/**
* A time in milliseconds, beyond which we consider the scroll velocity to be 0.
*/
var maxElapsed = 50;
var createAxisInfo = () => ({
	current: 0,
	offset: [],
	progress: 0,
	scrollLength: 0,
	targetOffset: 0,
	targetLength: 0,
	containerLength: 0,
	velocity: 0
});
var createScrollInfo = () => ({
	time: 0,
	x: createAxisInfo(),
	y: createAxisInfo()
});
/**
* Also iterated with for...in as the list of axes.
*/
var axisKeys = {
	x: {
		length: "Width",
		position: "Left"
	},
	y: {
		length: "Height",
		position: "Top"
	}
};
var styles = /* @__PURE__ */ new WeakMap();
/**
* Whether an axis scrolls from its end, which browsers report as a scroll
* position running from 0 to -scrollLength (#3340). This is read from style
* rather than the sign of the scroll position, as elastic overscroll pushes
* the position past 0 in either kind of axis (#3791).
*/
function isReversed(element, axisName) {
	/**
	* The viewport takes its writing mode and direction from <body>, which
	* not every browser reflects in the root element's computed style. It
	* doesn't adopt the root element's flex layout.
	*/
	const isRoot = element === document.scrollingElement;
	const source = isRoot && document.body || element;
	let style = styles.get(source);
	if (!style) styles.set(source, style = getComputedStyle(source));
	const { writingMode, flexDirection } = style;
	const isInline = axisName === "x" !== /^[vs]/.test(writingMode);
	return (isInline ? style.direction === "rtl" !== (writingMode === "sideways-lr") : writingMode.endsWith("rl")) !== (!isRoot && style.display.includes("flex") && (isInline !== (flexDirection[0] === "c") ? flexDirection : style.flexWrap).endsWith("reverse"));
}
function updateAxisInfo(element, axisName, info, time) {
	const axis = info[axisName];
	const { length, position } = axisKeys[axisName];
	const prev = axis.current;
	const prevTime = info.time;
	const scrollPosition = element[`scroll${position}`];
	axis.current = isReversed(element, axisName) ? -scrollPosition || 0 : scrollPosition;
	axis.containerLength = element[`client${length}`];
	axis.targetLength = element[`scroll${length}`];
	axis.scrollLength = axis.targetLength - axis.containerLength;
	axis.offset.length = 0;
	axis.offset[0] = 0;
	axis.offset[1] = axis.scrollLength;
	axis.progress = clamp(0, 1, progress(0, axis.scrollLength, axis.current));
	const elapsed = time - prevTime;
	axis.velocity = elapsed > maxElapsed ? 0 : velocityPerSecond(axis.current - prev, elapsed);
}
/**
* Measures a scroll container. Runs once per container per frame; every
* handler on that container derives its info from the result.
*/
function updateScrollInfo(element, info, time) {
	for (const axis in axisKeys) updateAxisInfo(element, axis, info, time);
	info.time = time;
}
// node_modules/framer-motion/dist/es/render/dom/scroll/offsets/edge.mjs
var namedEdges = {
	start: 0,
	center: .5,
	end: 1
};
function resolveEdge(edge, length, inset = 0) {
	let delta = 0;
	/**
	* If we have this edge defined as a preset, replace the definition
	* with the numerical value.
	*/
	if (edge in namedEdges) edge = namedEdges[edge];
	/**
	* Handle unit values
	*/
	if (typeof edge === "string") {
		const asNumber = parseFloat(edge);
		if (edge.endsWith("px")) delta = asNumber;
		else if (edge.endsWith("%")) edge = asNumber / 100;
		else if (edge.endsWith("vw")) delta = asNumber / 100 * document.documentElement.clientWidth;
		else if (edge.endsWith("vh")) delta = asNumber / 100 * document.documentElement.clientHeight;
		else edge = asNumber;
	}
	/**
	* If the edge is defined as a number, handle as a progress value.
	*/
	if (typeof edge === "number") delta = length * edge;
	return inset + delta;
}
// node_modules/framer-motion/dist/es/render/dom/scroll/offsets/offset.mjs
var defaultOffset = [0, 0];
function resolveOffset(offset, containerLength, targetLength, targetInset) {
	let offsetDefinition = Array.isArray(offset) ? offset : defaultOffset;
	let targetPoint = 0;
	let containerPoint = 0;
	if (typeof offset === "number")
 /**
	* If we're provided offset: [0, 0.5, 1] then each number x should become
	* [x, x], so we default to the behaviour of mapping 0 => 0 of both target
	* and container etc.
	*/
	offsetDefinition = [offset, offset];
	else if (typeof offset === "string") {
		offset = offset.trim();
		if (offset.includes(" ")) offsetDefinition = offset.split(" ");
		else
 /**
		* If we're provided a definition like "100px" then we want to apply
		* that only to the top of the target point, leaving the container at 0.
		* Whereas a named offset like "end" should be applied to both.
		*/
		offsetDefinition = [offset, namedEdges[offset] ? offset : `0`];
	}
	targetPoint = resolveEdge(offsetDefinition[0], targetLength, targetInset);
	containerPoint = resolveEdge(offsetDefinition[1], containerLength);
	return targetPoint - containerPoint;
}
// node_modules/framer-motion/dist/es/render/dom/scroll/offsets/presets.mjs
var ScrollOffset = { All: [[0, 0], [1, 1]] };
// node_modules/framer-motion/dist/es/render/dom/scroll/offsets/index.mjs
/**
* Resolved offsets map to evenly spaced progress values, so progress is
* derived from the segment index rather than building an interpolator.
*/
function offsetsToProgress(offsets, v) {
	const n = offsets.length - 1;
	if (n < 1) return 0;
	const reverse = offsets[0] > offsets[n];
	const at = (i) => offsets[reverse ? n - i : i];
	/**
	* Matches interpolate(), which checks for a zero-length first range
	* before reversing descending offsets.
	*/
	if (offsets[0] === offsets[1] && v < at(0)) return reverse ? 1 : 0;
	let i = 0;
	while (i < n - 1 && v >= at(i + 1)) i++;
	const p = (i + progress(at(i), at(i + 1), v)) / n;
	return reverse ? 1 - p : p;
}
function resolveOffsets(info, options) {
	const { offset: offsetDefinition = ScrollOffset.All, axis = "y" } = options;
	const axisInfo = info[axis];
	/**
	* Reset the length of the resolved offset array rather than creating a new one.
	*/
	axisInfo.offset.length = 0;
	/**
	* Populate the offset array by resolving the user's offset definition into
	* a list of pixel scroll offsets.
	*/
	const numOffsets = offsetDefinition.length;
	for (let i = 0; i < numOffsets; i++) axisInfo.offset[i] = resolveOffset(offsetDefinition[i], axisInfo.containerLength, axisInfo.targetLength, axisInfo.targetOffset);
	axisInfo.progress = clamp(0, 1, offsetsToProgress(axisInfo.offset, axisInfo.current));
}
// node_modules/framer-motion/dist/es/render/dom/scroll/offsets/inset.mjs
function calcInset(element, container) {
	const inset = {
		x: 0,
		y: 0
	};
	let current = element;
	while (current && current !== container) if (isHTMLElement(current)) {
		inset.x += current.offsetLeft;
		inset.y += current.offsetTop;
		current = current.offsetParent;
	} else if (current.tagName === "svg") {
		/**
		* This isn't an ideal approach to measuring the offset of <svg /> tags.
		* It would be preferable, given they behave like HTMLElements in most ways
		* to use offsetLeft/Top. But these don't exist on <svg />. Likewise we
		* can't use .getBBox() like most SVG elements as these provide the offset
		* relative to the SVG itself, which for <svg /> is usually 0x0.
		*/
		const svgBoundingBox = current.getBoundingClientRect();
		current = current.parentElement;
		const parentBoundingBox = current.getBoundingClientRect();
		inset.x += svgBoundingBox.left - parentBoundingBox.left;
		inset.y += svgBoundingBox.top - parentBoundingBox.top;
	} else if (current instanceof SVGGraphicsElement) {
		const { x, y } = current.getBBox();
		inset.x += x;
		inset.y += y;
		let svg = null;
		let parent = current.parentNode;
		while (!svg) {
			if (parent.tagName === "svg") svg = parent;
			parent = current.parentNode;
		}
		current = svg;
	} else break;
	return inset;
}
// node_modules/framer-motion/dist/es/render/dom/scroll/on-scroll-handler.mjs
function getTargetSize(target) {
	return "getBBox" in target && target.tagName !== "svg" ? target.getBBox() : {
		width: target.clientWidth,
		height: target.clientHeight
	};
}
function createOnScrollHandler(container, onScroll, info, options = {}) {
	const { target } = options;
	/**
	* In development mode ensure scroll containers aren't position: static as this makes
	* it difficult to measure their relative positions. The document scrolling element
	* is exempt: offsetParent measurements naturally resolve relative to the document.
	*/
	if (process.env.NODE_ENV !== "production") {
		if (target && target !== container && container !== document.documentElement && container !== document.scrollingElement && container !== document.body) warnOnce(getComputedStyle(container).position !== "static", "Please ensure that the container has a non-static position, like 'relative', 'fixed', or 'absolute' to ensure scroll offset is calculated correctly.");
	}
	/**
	* Handlers without a target or offset are notified with the container's
	* shared info object, so they measure nothing themselves.
	*/
	const needsOwnInfo = target || options.offset;
	return {
		measure: (containerInfo) => {
			if (!needsOwnInfo) return;
			info.time = containerInfo.time;
			for (const key in axisKeys) {
				const axis = key;
				const { offset } = info[axis];
				Object.assign(info[axis], containerInfo[axis]);
				info[axis].offset = offset;
			}
			if (target && target !== container) {
				const inset = calcInset(target, container);
				const size = getTargetSize(target);
				info.x.targetOffset = inset.x;
				info.y.targetOffset = inset.y;
				info.x.targetLength = size.width;
				info.y.targetLength = size.height;
			}
			resolveOffsets(info, options);
		},
		notify: (containerInfo) => onScroll(needsOwnInfo ? info : containerInfo)
	};
}
// node_modules/framer-motion/dist/es/render/dom/scroll/track.mjs
var scrollListeners = /* @__PURE__ */ new WeakMap();
var resizeListeners = /* @__PURE__ */ new WeakMap();
var onScrollHandlers = /* @__PURE__ */ new WeakMap();
var dimensionCheckProcesses = /* @__PURE__ */ new WeakMap();
var getEventTarget = (element) => element === document.scrollingElement ? window : element;
function scrollInfo(onScroll, { container = document.scrollingElement, trackContentSize = false, ...options } = {}) {
	if (!container) return noop;
	let containerHandlers = onScrollHandlers.get(container);
	/**
	* Get the onScroll handlers for this container.
	* If one isn't found, create a new one.
	*/
	if (!containerHandlers) {
		containerHandlers = /* @__PURE__ */ new Set();
		onScrollHandlers.set(container, containerHandlers);
	}
	const containerHandler = createOnScrollHandler(container, onScroll, createScrollInfo(), options);
	containerHandlers.add(containerHandler);
	/**
	* Check if there's a scroll event listener for this container.
	* If not, create one.
	*/
	if (!scrollListeners.has(container)) {
		const containerInfo = createScrollInfo();
		const measureAll = () => {
			updateScrollInfo(container, containerInfo, frameData.timestamp);
			for (const handler of containerHandlers) handler.measure(containerInfo);
			frame.preUpdate(notifyAll);
		};
		const notifyAll = () => {
			for (const handler of containerHandlers) handler.notify(containerInfo);
		};
		const listener = () => frame.read(measureAll);
		scrollListeners.set(container, listener);
		const target = getEventTarget(container);
		window.addEventListener("resize", listener);
		if (container !== document.documentElement) resizeListeners.set(container, resize(container, listener));
		target.addEventListener("scroll", listener);
		listener();
	}
	/**
	* Enable content size tracking if requested and not already enabled.
	*/
	if (trackContentSize && !dimensionCheckProcesses.has(container)) {
		const listener = scrollListeners.get(container);
		const size = {
			width: container.scrollWidth,
			height: container.scrollHeight
		};
		const checkScrollDimensions = () => {
			const newWidth = container.scrollWidth;
			const newHeight = container.scrollHeight;
			if (size.width !== newWidth || size.height !== newHeight) {
				listener();
				size.width = newWidth;
				size.height = newHeight;
			}
		};
		const dimensionCheckProcess = frame.read(checkScrollDimensions, true);
		dimensionCheckProcesses.set(container, dimensionCheckProcess);
	}
	const listener = scrollListeners.get(container);
	frame.read(listener, false, true);
	return () => {
		cancelFrame(listener);
		/**
		* Check if we even have any handlers for this container.
		*/
		const currentHandlers = onScrollHandlers.get(container);
		if (!currentHandlers) return;
		currentHandlers.delete(containerHandler);
		if (currentHandlers.size) return;
		/**
		* If no more handlers, remove the scroll listener too. The handler
		* set goes with it, as a measure still queued from this listener
		* would otherwise notify handlers added by a later scrollInfo call.
		*/
		onScrollHandlers.delete(container);
		const scrollListener = scrollListeners.get(container);
		scrollListeners.delete(container);
		if (scrollListener) {
			getEventTarget(container).removeEventListener("scroll", scrollListener);
			resizeListeners.get(container)?.();
			window.removeEventListener("resize", scrollListener);
		}
		const dimensionCheckProcess = dimensionCheckProcesses.get(container);
		if (dimensionCheckProcess) {
			cancelFrame(dimensionCheckProcess);
			dimensionCheckProcesses.delete(container);
		}
	};
}
// node_modules/framer-motion/dist/es/render/dom/scroll/utils/can-use-native-timeline.mjs
function canUseNativeTimeline(target) {
	if (typeof window === "undefined") return false;
	return target ? supportsViewTimeline() : supportsScrollTimeline();
}
// node_modules/framer-motion/dist/es/render/dom/scroll/utils/get-timeline.mjs
var timelineCache = /* @__PURE__ */ new Map();
/**
* Native timelines are only attached to WAAPI animations. Offsets are
* applied to each animation as a range, so a timeline is shared by every
* offset.
*/
function getTimeline({ container, target, axis }) {
	let containerCache = timelineCache.get(container);
	if (!containerCache) {
		containerCache = /* @__PURE__ */ new Map();
		timelineCache.set(container, containerCache);
	}
	const targetKey = target ?? "self";
	let targetCache = containerCache.get(targetKey);
	if (!targetCache) {
		targetCache = {};
		containerCache.set(targetKey, targetCache);
	}
	return targetCache[axis] || (targetCache[axis] = target ? new ViewTimeline({
		subject: target,
		axis
	}) : new ScrollTimeline({
		source: container,
		axis
	}));
}
// node_modules/framer-motion/dist/es/render/dom/scroll/utils/offset-to-range.mjs
/**
* Resolved offsets are linear in the target and container lengths, so
* probing them gives [target progress, container progress, pixels].
* vw/vh can resolve to 0px, so they're rejected up front.
*/
var toIntersection = (o) => {
	if (/v/u.test(o)) return [];
	const px = resolveOffset(o, 0, 0, 0);
	return [
		resolveOffset(o, 0, 1, 0) - px,
		px - resolveOffset(o, 1, 0, 0),
		px
	];
};
var toRange = ([t, c, px]) => !px && (c === 0 || c === 1) && `${c ? "entry" : "exit"}-crossing ${t * 100}%`;
/**
* Maps an offset to an equivalent ViewTimeline range. Returns undefined when
* there isn't one, which signals the caller to fall back to JS-based scroll
* tracking.
*/
function offsetToViewTimelineRange(offset = ScrollOffset.All) {
	if (offset.length !== 2) return;
	const [start, end] = offset.map(toIntersection);
	const points = [toRange(start), toRange(end)];
	const a = end[0] - start[0];
	const b = start[1] - end[1];
	if (points[0] && points[1] && (a || b)) return {
		points,
		a,
		b,
		cover: !start[0] && a === 1 && b === 1
	};
}
// node_modules/framer-motion/dist/es/render/dom/scroll/attach-animation.mjs
function attachToAnimation(animation, options) {
	const { target, container, axis } = options;
	const range = target && offsetToViewTimelineRange(options.offset);
	/**
	* Use native timeline when:
	* - No target and no offset: ScrollTimeline
	* - Target with mappable offset: ViewTimeline with named range
	* - Otherwise: fall back to JS observe. A ScrollTimeline has no offset,
	*   so page offsets are applied by the JS timeline.
	*/
	const native = canUseNativeTimeline(target) && (target ? !!range : !options.offset);
	const animations = /* @__PURE__ */ new Map();
	const observed = /* @__PURE__ */ new Set();
	let stopObserving;
	let reverse = false;
	/**
	* When an offset's second point comes first, its range is swapped and
	* the animation played backwards. The range is set after the direction,
	* as that's what realigns a running animation with its timeline. Chrome
	* skips that realignment when the range changes in the frame the
	* animation starts, leaving it offset for good, so it's replayed too.
	*/
	const apply = (direction, waapi) => {
		const [start, end] = range.points;
		waapi.effect.updateTiming({ direction: reverse ? direction === "normal" ? "reverse" : "alternate-reverse" : direction });
		Object.assign(waapi, {
			rangeStart: reverse ? end : start,
			rangeEnd: reverse ? start : end
		});
		waapi.play();
	};
	const stops = [animation.attachTimeline({
		/**
		* Read only by WAAPI animations, so values driven from JS don't
		* create a native timeline they won't use.
		*/
		get timeline() {
			return native ? getTimeline(options) : void 0;
		},
		onAttach: range && ((waapi) => {
			const direction = waapi.effect.getTiming().direction;
			animations.set(waapi, direction);
			apply(direction, waapi);
		}),
		/**
		* Values driven from JS all track the offset with scrollInfo,
		* which measures once per frame for all of them.
		*/
		observe: (valueAnimation) => {
			valueAnimation.pause();
			observed.add(valueAnimation);
			stopObserving || (stopObserving = scrollInfo((info) => {
				observed.forEach((observedAnimation) => {
					observedAnimation.time = observedAnimation.iterationDuration * info[axis].progress;
				});
			}, options));
			return () => observed.delete(valueAnimation);
		}
	})];
	if (native && range) {
		const { a, b } = range;
		const length = axis === "y" ? "clientHeight" : "clientWidth";
		/**
		* Offsets like All only run forwards when the target is longer than
		* the container, so their direction is remeasured on resize.
		*/
		const update = () => {
			if (reverse !== (reverse = a * target[length] + b * container[length] < 0)) animations.forEach(apply);
		};
		update();
		if (a * b < 0) stops.push(resize(update), resize([target, container], update));
	}
	return () => {
		stops.forEach((stop) => stop());
		stopObserving?.();
	};
}
// node_modules/framer-motion/dist/es/render/dom/scroll/index.mjs
function scroll(onScroll, { axis = "y", source, container = document.scrollingElement, ...options } = {}) {
	if (!container) return noop;
	const optionsWithDefaults = {
		axis,
		container: source || container,
		...options
	};
	if (typeof onScroll === "function") {
		const callback = bindToScope(onScroll);
		return addToScope(scrollInfo((info) => callback(info[axis].progress, info), optionsWithDefaults));
	}
	return addToScope(attachToAnimation(onScroll, optionsWithDefaults));
}
// node_modules/framer-motion/dist/es/value/use-scroll.mjs
var createScrollMotionValues = () => ({
	scrollX: motionValue(0),
	scrollY: motionValue(0),
	scrollXProgress: motionValue(0),
	scrollYProgress: motionValue(0)
});
var isRefPending = (ref) => {
	if (!ref) return false;
	return !ref.current;
};
function makeAccelerateConfig(axis, options, container, target) {
	return {
		factory: (animation) => {
			let cleanup;
			const start = () => {
				if (isRefPending(container) || isRefPending(target)) {
					microtask.read(start);
					return;
				}
				cleanup = scroll(animation, {
					...options,
					axis,
					container: container?.current || void 0,
					target: target?.current || void 0
				});
			};
			microtask.read(start);
			return () => {
				cancelMicrotask(start);
				cleanup?.();
			};
		},
		times: [0, 1],
		keyframes: [0, 1],
		ease: (v) => v,
		duration: 1
	};
}
function canAccelerateScroll(target, offset) {
	if (typeof window === "undefined") return false;
	return target ? supportsViewTimeline() && !!offsetToViewTimelineRange(offset) : supportsScrollTimeline() && !offset;
}
function useScroll({ container, target, ...options } = {}) {
	const values = useConstant(createScrollMotionValues);
	if (canAccelerateScroll(target, options.offset)) {
		values.scrollXProgress.accelerate = makeAccelerateConfig("x", options, container, target);
		values.scrollYProgress.accelerate = makeAccelerateConfig("y", options, container, target);
	}
	const scrollAnimation = useRef(null);
	const needsStart = useRef(false);
	const start = useCallback(() => {
		scrollAnimation.current = scroll((_progress, { x, y }) => {
			values.scrollX.set(x.current);
			values.scrollXProgress.set(x.progress);
			values.scrollY.set(y.current);
			values.scrollYProgress.set(y.progress);
		}, {
			...options,
			container: container?.current || void 0,
			target: target?.current || void 0
		});
		return () => {
			scrollAnimation.current?.();
		};
	}, [
		container,
		target,
		JSON.stringify(options.offset)
	]);
	useIsomorphicLayoutEffect(() => {
		needsStart.current = false;
		if (isRefPending(container) || isRefPending(target)) {
			needsStart.current = true;
			return;
		} else return start();
	}, [start]);
	useEffect(() => {
		if (!needsStart.current) return;
		let cleanup;
		const tryStart = () => {
			const containerPending = isRefPending(container);
			const targetPending = isRefPending(target);
			invariant(!containerPending, "Container ref is defined but not hydrated", "use-scroll-ref");
			invariant(!targetPending, "Target ref is defined but not hydrated", "use-scroll-ref");
			if (!containerPending && !targetPending) cleanup = start();
		};
		microtask.read(tryStart);
		return () => {
			cancelMicrotask(tryStart);
			cleanup?.();
		};
	}, [start]);
	return values;
}
// node_modules/framer-motion/dist/es/value/use-motion-value.mjs
/**
* Creates a `MotionValue` to track the state and velocity of a value.
*
* Usually, these are created automatically. For advanced use-cases, like use with `useTransform`, you can create `MotionValue`s externally and pass them into the animated component via the `style` prop.
*
* ```jsx
* export const MyComponent = () => {
*   const scale = useMotionValue(1)
*
*   return <motion.div style={{ scale }} />
* }
* ```
*
* @param initial - The initial state.
*
* @public
*/
function useMotionValue(initial) {
	const value = useConstant(() => motionValue(initial));
	/**
	* If this motion value is being used in static mode, like on
	* the Framer canvas, force components to rerender when the motion
	* value is updated.
	*/
	const { isStatic } = useContext(MotionConfigContext);
	if (isStatic) {
		const [, setLatest] = useState(initial);
		useEffect(() => value.on("change", setLatest), []);
	}
	return value;
}
// node_modules/framer-motion/dist/es/value/use-combine-values.mjs
function useCombineMotionValues(values, combineValues) {
	/**
	* Initialise the returned motion value. This remains the same between renders.
	*/
	const value = useMotionValue(combineValues());
	/**
	* Create a function that will update the template motion value with the latest values.
	* This is pre-bound so whenever a motion value updates it can schedule its
	* execution in Framesync. If it's already been scheduled it won't be fired twice
	* in a single frame.
	*/
	const updateValue = () => value.set(combineValues());
	/**
	* Synchronously update the motion value with the latest values during the render.
	* This ensures that within a React render, the styles applied to the DOM are up-to-date.
	*/
	updateValue();
	/**
	* Subscribe to all motion values found within the template. Whenever any of them change,
	* schedule an update.
	*/
	useIsomorphicLayoutEffect(() => {
		const scheduleUpdate = () => frame.preRender(updateValue, false, true);
		const subscriptions = values.map((v) => v.on("change", scheduleUpdate));
		/**
		* Catch up on changes made while unsubscribed. A source can change
		* between render and this subscription (e.g. in a child's layout
		* effect), and Strict Mode or <Activity> can re-run this effect
		* without a render after the cleanup cancelled a scheduled update.
		*/
		updateValue();
		return () => {
			subscriptions.forEach((unsubscribe) => unsubscribe());
			cancelFrame(updateValue);
		};
	});
	return value;
}
// node_modules/framer-motion/dist/es/value/use-computed.mjs
function useComputed(compute) {
	/**
	* Open session of collectMotionValues. Any MotionValue that calls get()
	* will be saved into this array.
	*/
	collectMotionValues.current = [];
	compute();
	const value = useCombineMotionValues(collectMotionValues.current, compute);
	/**
	* Synchronously close session of collectMotionValues.
	*/
	collectMotionValues.current = void 0;
	return value;
}
// node_modules/framer-motion/dist/es/value/use-transform.mjs
function useTransform(input, inputRangeOrTransformer, outputRangeOrMap, options) {
	if (typeof input === "function") return useComputed(input);
	if (outputRangeOrMap !== void 0 && !Array.isArray(outputRangeOrMap) && typeof inputRangeOrTransformer !== "function") return useMapTransform(input, inputRangeOrTransformer, outputRangeOrMap, options);
	const transformer = typeof inputRangeOrTransformer === "function" ? inputRangeOrTransformer : transform(inputRangeOrTransformer, outputRangeOrMap, options);
	const result = Array.isArray(input) ? useListTransform(input, transformer) : useListTransform([input], ([latest]) => transformer(latest));
	const inputAccelerate = !Array.isArray(input) ? input.accelerate : void 0;
	if (inputAccelerate && !inputAccelerate.isTransformed && typeof inputRangeOrTransformer !== "function" && Array.isArray(outputRangeOrMap) && options?.clamp !== false) {
		const ease = options?.ease;
		/**
		* WAAPI fills missing 0 and 1 offsets with the underlying value, so
		* hold the end values to match the clamped transform.
		*/
		result.accelerate = {
			...inputAccelerate,
			times: [
				0,
				...inputRangeOrTransformer,
				1
			],
			keyframes: [
				outputRangeOrMap[0],
				...outputRangeOrMap,
				outputRangeOrMap[outputRangeOrMap.length - 1]
			],
			isTransformed: true,
			...ease ? { ease: Array.isArray(ease) ? [ease[0], ...ease] : ease } : {}
		};
	}
	return result;
}
function useListTransform(values, transformer) {
	const latest = useConstant(() => []);
	return useCombineMotionValues(values, () => {
		latest.length = 0;
		const numValues = values.length;
		for (let i = 0; i < numValues; i++) latest[i] = values[i].get();
		return transformer(latest);
	});
}
function useMapTransform(inputValue, inputRange, outputMap, options) {
	/**
	* Capture keys once to ensure hooks are called in consistent order.
	*/
	const keys = useConstant(() => Object.keys(outputMap));
	const output = useConstant(() => ({}));
	for (const key of keys) output[key] = useTransform(inputValue, inputRange, outputMap[key], options);
	return output;
}
// node_modules/lenis/dist/lenis.mjs
var version = "1.3.27";
/**
* Clamp a value between a minimum and maximum value
*
* @param min Minimum value
* @param input Value to clamp
* @param max Maximum value
* @returns Clamped value
*/
function clamp$1(min, input, max) {
	return Math.max(min, Math.min(input, max));
}
/**
*  Linearly interpolate between two values using an amount (0 <= t <= 1)
*
* @param x First value
* @param y Second value
* @param t Amount to interpolate (0 <= t <= 1)
* @returns Interpolated value
*/
function lerp(x, y, t) {
	return (1 - t) * x + t * y;
}
/**
* Damp a value over time using a damping factor
* {@link http://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/}
*
* @param x Initial value
* @param y Target value
* @param lambda Damping factor
* @param dt Time elapsed since the last update
* @returns Damped value
*/
function damp(x, y, lambda, deltaTime) {
	return lerp(x, y, 1 - Math.exp(-lambda * deltaTime));
}
/**
* Calculate the modulo of the dividend and divisor while keeping the result within the same sign as the divisor
* {@link https://anguscroll.com/just/just-modulo}
*
* @param n Dividend
* @param d Divisor
* @returns Modulo
*/
function modulo(n, d) {
	return (n % d + d) % d;
}
/**
* Animate class to handle value animations with lerping or easing
*
* @example
* const animate = new Animate()
* animate.fromTo(0, 100, { duration: 1, easing: (t) => t })
* animate.advance(0.5) // 50
*/
var Animate = class {
	isRunning = false;
	value = 0;
	from = 0;
	to = 0;
	currentTime = 0;
	lerp;
	duration;
	easing;
	onUpdate;
	/**
	* Advance the animation by the given delta time
	*
	* @param deltaTime - The time in seconds to advance the animation
	*/
	advance(deltaTime) {
		if (!this.isRunning) return;
		let completed = false;
		if (this.duration && this.easing) {
			this.currentTime += deltaTime;
			const linearProgress = clamp$1(0, this.currentTime / this.duration, 1);
			completed = linearProgress >= 1;
			const easedProgress = completed ? 1 : this.easing(linearProgress);
			this.value = this.from + (this.to - this.from) * easedProgress;
		} else if (this.lerp) {
			this.value = damp(this.value, this.to, this.lerp * 60, deltaTime);
			if (Math.round(this.value) === Math.round(this.to)) {
				this.value = this.to;
				completed = true;
			}
		} else {
			this.value = this.to;
			completed = true;
		}
		if (completed) this.stop();
		this.onUpdate?.(this.value, completed);
	}
	/** Stop the animation */
	stop() {
		this.isRunning = false;
	}
	/**
	* Set up the animation from a starting value to an ending value
	* with optional parameters for lerping, duration, easing, and onUpdate callback
	*
	* @param from - The starting value
	* @param to - The ending value
	* @param options - Options for the animation
	*/
	fromTo(from, to, { lerp, duration, easing, onStart, onUpdate }) {
		this.from = this.value = from;
		this.to = to;
		this.lerp = lerp;
		this.duration = duration;
		this.easing = easing;
		this.currentTime = 0;
		this.isRunning = true;
		onStart?.();
		this.onUpdate = onUpdate;
	}
};
function debounce(callback, delay) {
	let timer;
	return function(...args) {
		clearTimeout(timer);
		timer = setTimeout(() => {
			timer = void 0;
			callback.apply(this, args);
		}, delay);
	};
}
/**
* Dimensions class to handle the size of the content and wrapper
*
* @example
* const dimensions = new Dimensions(wrapper, content)
* dimensions.on('resize', (e) => {
*   console.log(e.width, e.height)
* })
*/
var Dimensions = class {
	width = 0;
	height = 0;
	scrollHeight = 0;
	scrollWidth = 0;
	debouncedResize;
	wrapperResizeObserver;
	contentResizeObserver;
	constructor(wrapper, content, { autoResize = true, debounce: debounceValue = 250 } = {}) {
		this.wrapper = wrapper;
		this.content = content;
		if (autoResize) {
			this.debouncedResize = debounce(this.resize, debounceValue);
			if (this.wrapper instanceof Window) window.addEventListener("resize", this.debouncedResize);
			else {
				this.wrapperResizeObserver = new ResizeObserver(this.debouncedResize);
				this.wrapperResizeObserver.observe(this.wrapper);
			}
			this.contentResizeObserver = new ResizeObserver(this.debouncedResize);
			this.contentResizeObserver.observe(this.content);
		}
		this.resize();
	}
	destroy() {
		this.wrapperResizeObserver?.disconnect();
		this.contentResizeObserver?.disconnect();
		if (this.wrapper === window && this.debouncedResize) window.removeEventListener("resize", this.debouncedResize);
	}
	resize = () => {
		this.onWrapperResize();
		this.onContentResize();
	};
	onWrapperResize = () => {
		if (this.wrapper instanceof Window) {
			this.width = window.innerWidth;
			this.height = window.innerHeight;
		} else {
			this.width = this.wrapper.clientWidth;
			this.height = this.wrapper.clientHeight;
		}
	};
	onContentResize = () => {
		if (this.wrapper instanceof Window) {
			this.scrollHeight = this.content.scrollHeight;
			this.scrollWidth = this.content.scrollWidth;
		} else {
			this.scrollHeight = this.wrapper.scrollHeight;
			this.scrollWidth = this.wrapper.scrollWidth;
		}
	};
	get limit() {
		return {
			x: this.scrollWidth - this.width,
			y: this.scrollHeight - this.height
		};
	}
};
/**
* Emitter class to handle events
* @example
* const emitter = new Emitter()
* emitter.on('event', (data) => {
*   console.log(data)
* })
* emitter.emit('event', 'data')
*/
var Emitter = class {
	events = {};
	/**
	* Emit an event with the given data
	* @param event Event name
	* @param args Data to pass to the event handlers
	*/
	emit(event, ...args) {
		const callbacks = this.events[event] || [];
		for (let i = 0, length = callbacks.length; i < length; i++) callbacks[i]?.(...args);
	}
	/**
	* Add a callback to the event
	* @param event Event name
	* @param cb Callback function
	* @returns Unsubscribe function
	*/
	on(event, cb) {
		if (this.events[event]) this.events[event].push(cb);
		else this.events[event] = [cb];
		return () => {
			this.events[event] = this.events[event]?.filter((i) => cb !== i);
		};
	}
	/**
	* Remove a callback from the event
	* @param event Event name
	* @param callback Callback function
	*/
	off(event, callback) {
		this.events[event] = this.events[event]?.filter((i) => callback !== i);
	}
	/**
	* Remove all event listeners and clean up
	*/
	destroy() {
		this.events = {};
	}
};
var LINE_HEIGHT = 100 / 6;
var listenerOptions = { passive: false };
function getDeltaMultiplier(deltaMode, size) {
	if (deltaMode === 1) return LINE_HEIGHT;
	if (deltaMode === 2) return size;
	return 1;
}
var VirtualScroll = class {
	touchStart = {
		x: 0,
		y: 0
	};
	lastDelta = {
		x: 0,
		y: 0
	};
	window = {
		width: 0,
		height: 0
	};
	emitter = new Emitter();
	constructor(element, options = {
		wheelMultiplier: 1,
		touchMultiplier: 1
	}) {
		this.element = element;
		this.options = options;
		window.addEventListener("resize", this.onWindowResize);
		this.onWindowResize();
		this.element.addEventListener("wheel", this.onWheel, listenerOptions);
		this.element.addEventListener("touchstart", this.onTouchStart, listenerOptions);
		this.element.addEventListener("touchmove", this.onTouchMove, listenerOptions);
		this.element.addEventListener("touchend", this.onTouchEnd, listenerOptions);
	}
	/**
	* Add an event listener for the given event and callback
	*
	* @param event Event name
	* @param callback Callback function
	*/
	on(event, callback) {
		return this.emitter.on(event, callback);
	}
	/** Remove all event listeners and clean up */
	destroy() {
		this.emitter.destroy();
		window.removeEventListener("resize", this.onWindowResize);
		this.element.removeEventListener("wheel", this.onWheel, listenerOptions);
		this.element.removeEventListener("touchstart", this.onTouchStart, listenerOptions);
		this.element.removeEventListener("touchmove", this.onTouchMove, listenerOptions);
		this.element.removeEventListener("touchend", this.onTouchEnd, listenerOptions);
	}
	/**
	* Event handler for 'touchstart' event
	*
	* @param event Touch event
	*/
	onTouchStart = (event) => {
		const { clientX, clientY } = event.targetTouches ? event.targetTouches[0] : event;
		this.touchStart.x = clientX;
		this.touchStart.y = clientY;
		this.lastDelta = {
			x: 0,
			y: 0
		};
		this.emitter.emit("scroll", {
			deltaX: 0,
			deltaY: 0,
			event
		});
	};
	/** Event handler for 'touchmove' event */
	onTouchMove = (event) => {
		const { clientX, clientY } = event.targetTouches ? event.targetTouches[0] : event;
		const deltaX = -(clientX - this.touchStart.x) * this.options.touchMultiplier;
		const deltaY = -(clientY - this.touchStart.y) * this.options.touchMultiplier;
		this.touchStart.x = clientX;
		this.touchStart.y = clientY;
		this.lastDelta = {
			x: deltaX,
			y: deltaY
		};
		this.emitter.emit("scroll", {
			deltaX,
			deltaY,
			event
		});
	};
	onTouchEnd = (event) => {
		this.emitter.emit("scroll", {
			deltaX: this.lastDelta.x,
			deltaY: this.lastDelta.y,
			event
		});
	};
	/** Event handler for 'wheel' event */
	onWheel = (event) => {
		let { deltaX, deltaY, deltaMode } = event;
		const multiplierX = getDeltaMultiplier(deltaMode, this.window.width);
		const multiplierY = getDeltaMultiplier(deltaMode, this.window.height);
		deltaX *= multiplierX;
		deltaY *= multiplierY;
		deltaX *= this.options.wheelMultiplier;
		deltaY *= this.options.wheelMultiplier;
		this.emitter.emit("scroll", {
			deltaX,
			deltaY,
			event
		});
	};
	onWindowResize = () => {
		this.window = {
			width: window.innerWidth,
			height: window.innerHeight
		};
	};
};
var defaultEasing = (t) => Math.min(1, 1.001 - 2 ** (-10 * t));
var Lenis = class {
	_isScrolling = false;
	_isStopped = false;
	_isLocked = false;
	_preventNextNativeScrollEvent = false;
	_resetVelocityTimeout = null;
	_rafId = null;
	_isDraggingSelection = false;
	reducedMotionMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
	/**
	* Whether or not the user is touching the screen
	*/
	isTouching;
	/**
	* Whether or not the device is running iOS
	*/
	isIos;
	/**
	* The time in ms since the lenis instance was created
	*/
	time = 0;
	/**
	* User data that will be forwarded through the scroll event
	*
	* @example
	* lenis.scrollTo(100, {
	*   userData: {
	*     foo: 'bar'
	*   }
	* })
	*/
	userData = {};
	/**
	* The last velocity of the scroll
	*/
	lastVelocity = 0;
	/**
	* The current velocity of the scroll
	*/
	velocity = 0;
	/**
	* The direction of the scroll
	*/
	direction = 0;
	/**
	* The options passed to the lenis instance
	*/
	options;
	/**
	* The target scroll value
	*/
	targetScroll;
	/**
	* The animated scroll value
	*/
	animatedScroll;
	animate = new Animate();
	emitter = new Emitter();
	dimensions;
	virtualScroll;
	constructor({ wrapper = window, content = document.documentElement, eventsTarget = wrapper, smoothWheel = true, syncTouch = false, syncTouchLerp = .075, touchInertiaExponent = 1.7, duration, easing, lerp = .1, infinite = false, orientation = "vertical", gestureOrientation = orientation === "horizontal" ? "both" : "vertical", touchMultiplier = 1, wheelMultiplier = 1, autoResize = true, prevent, virtualScroll, overscroll = true, autoRaf = false, anchors = false, autoToggle = false, allowNestedScroll = false, __experimental__naiveDimensions = false, naiveDimensions = __experimental__naiveDimensions, stopInertiaOnNavigate = false, respectReducedMotion = true } = {}) {
		window.lenisVersion = version;
		if (!window.lenis) window.lenis = {};
		window.lenis.version = version;
		if (orientation === "horizontal") window.lenis.horizontal = true;
		if (syncTouch === true) window.lenis.touch = true;
		this.isIos = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
		if (!wrapper || wrapper === document.documentElement) wrapper = window;
		if (typeof duration === "number" && typeof easing !== "function") easing = defaultEasing;
		else if (typeof easing === "function" && typeof duration !== "number") duration = 1;
		this.options = {
			wrapper,
			content,
			eventsTarget,
			smoothWheel,
			syncTouch,
			syncTouchLerp,
			touchInertiaExponent,
			duration,
			easing,
			lerp,
			infinite,
			gestureOrientation,
			orientation,
			touchMultiplier,
			wheelMultiplier,
			autoResize,
			prevent,
			virtualScroll,
			overscroll,
			autoRaf,
			anchors,
			autoToggle,
			allowNestedScroll,
			naiveDimensions,
			stopInertiaOnNavigate,
			respectReducedMotion
		};
		this.dimensions = new Dimensions(wrapper, content, { autoResize });
		this.updateClassName();
		this.targetScroll = this.animatedScroll = this.actualScroll;
		this.options.wrapper.addEventListener("scroll", this.onNativeScroll);
		this.options.wrapper.addEventListener("scrollend", this.onScrollEnd, { capture: true });
		if (this.options.anchors || this.options.stopInertiaOnNavigate) this.options.wrapper.addEventListener("click", this.onClick);
		this.options.wrapper.addEventListener("pointerdown", this.onPointerDown);
		this.virtualScroll = new VirtualScroll(eventsTarget, {
			touchMultiplier,
			wheelMultiplier
		});
		this.virtualScroll.on("scroll", this.onVirtualScroll);
		if (this.options.autoToggle) {
			this.checkOverflow();
			this.rootElement.addEventListener("transitionend", this.onTransitionEnd);
		}
		if (this.options.autoRaf) this._rafId = requestAnimationFrame(this.raf);
	}
	/**
	* Destroy the lenis instance, remove all event listeners and clean up the class name
	*/
	destroy() {
		this.emitter.destroy();
		if (this._resetVelocityTimeout !== null) {
			clearTimeout(this._resetVelocityTimeout);
			this._resetVelocityTimeout = null;
		}
		this.options.wrapper.removeEventListener("scroll", this.onNativeScroll);
		this.options.wrapper.removeEventListener("scrollend", this.onScrollEnd, { capture: true });
		this.options.wrapper.removeEventListener("pointerdown", this.onPointerDown);
		if (this.options.anchors || this.options.stopInertiaOnNavigate) this.options.wrapper.removeEventListener("click", this.onClick);
		this.virtualScroll.destroy();
		this.dimensions.destroy();
		this.cleanUpClassName();
		if (this._rafId) cancelAnimationFrame(this._rafId);
	}
	on(event, callback) {
		return this.emitter.on(event, callback);
	}
	off(event, callback) {
		return this.emitter.off(event, callback);
	}
	onScrollEnd = (e) => {
		if (!(e instanceof CustomEvent)) {
			if (this.isScrolling === "smooth" || this.isScrolling === false) e.stopPropagation();
		}
	};
	dispatchScrollendEvent = () => {
		this.options.wrapper.dispatchEvent(new CustomEvent("scrollend", {
			bubbles: this.options.wrapper === window,
			detail: { lenisScrollEnd: true }
		}));
	};
	get overflow() {
		const property = this.isHorizontal ? "overflow-x" : "overflow-y";
		return getComputedStyle(this.rootElement)[property];
	}
	checkOverflow() {
		if (["hidden", "clip"].includes(this.overflow)) this.internalStop();
		else this.internalStart();
	}
	onTransitionEnd = (event) => {
		if (event.propertyName?.includes("overflow") && event.target === this.rootElement) this.checkOverflow();
	};
	setScroll(scroll) {
		if (this.isHorizontal) this.options.wrapper.scrollTo({
			left: scroll,
			behavior: "instant"
		});
		else this.options.wrapper.scrollTo({
			top: scroll,
			behavior: "instant"
		});
	}
	onClick = (event) => {
		const linkElementsUrls = event.composedPath().filter((node) => node instanceof HTMLAnchorElement && node.href).map((element) => new URL(element.href));
		const currentUrl = new URL(window.location.href);
		if (this.options.anchors) {
			const anchorElementUrl = linkElementsUrls.find((targetUrl) => currentUrl.host === targetUrl.host && currentUrl.pathname === targetUrl.pathname && targetUrl.hash);
			if (anchorElementUrl) {
				const options = typeof this.options.anchors === "object" && this.options.anchors ? this.options.anchors : void 0;
				const target = decodeURIComponent(anchorElementUrl.hash);
				this.scrollTo(target, options);
				return;
			}
		}
		if (this.options.stopInertiaOnNavigate) {
			if (linkElementsUrls.some((targetUrl) => currentUrl.host === targetUrl.host && currentUrl.pathname !== targetUrl.pathname)) {
				this.reset();
				return;
			}
		}
	};
	onPointerDown = (event) => {
		if (event.button === 1) this.reset();
	};
	isTouchOnSelectionHandle(event) {
		const selection = window.getSelection();
		if (!selection || selection.isCollapsed || selection.rangeCount === 0) return false;
		const touch = event.targetTouches[0] ?? event.changedTouches[0];
		if (!touch) return false;
		const rects = selection.getRangeAt(0).getClientRects();
		if (rects.length === 0) return false;
		const first = rects[0];
		const last = rects[rects.length - 1];
		const HANDLE_RADIUS = 40;
		const nearStart = Math.hypot(touch.clientX - first.left, touch.clientY - first.top) <= HANDLE_RADIUS;
		const nearEnd = Math.hypot(touch.clientX - last.right, touch.clientY - last.bottom) <= HANDLE_RADIUS;
		return nearStart || nearEnd;
	}
	onVirtualScroll = (data) => {
		if (typeof this.options.virtualScroll === "function" && this.options.virtualScroll(data) === false) return;
		const { deltaX, deltaY, event } = data;
		this.emitter.emit("virtual-scroll", {
			deltaX,
			deltaY,
			event
		});
		if (event.ctrlKey) return;
		if (event.lenisStopPropagation) return;
		const isTouch = event.type.includes("touch");
		const isWheel = event.type.includes("wheel");
		if (isTouch && this.isIos) {
			if (event.type === "touchstart") this._isDraggingSelection = this.isTouchOnSelectionHandle(event);
			if (this._isDraggingSelection) {
				if (event.type === "touchend") this._isDraggingSelection = false;
				return;
			}
		}
		this.isTouching = event.type === "touchstart" || event.type === "touchmove";
		const isClickOrTap = deltaX === 0 && deltaY === 0;
		if (this.options.syncTouch && isTouch && event.type === "touchstart" && isClickOrTap && !this.isStopped && !this.isLocked) {
			this.reset();
			return;
		}
		const isUnknownGesture = this.options.gestureOrientation === "vertical" && deltaY === 0 || this.options.gestureOrientation === "horizontal" && deltaX === 0;
		if (isClickOrTap || isUnknownGesture) return;
		let composedPath = event.composedPath();
		composedPath = composedPath.slice(0, composedPath.indexOf(this.rootElement));
		const prevent = this.options.prevent;
		const gestureOrientation = Math.abs(deltaX) >= Math.abs(deltaY) ? "horizontal" : "vertical";
		if (composedPath.find((node) => node instanceof HTMLElement && (typeof prevent === "function" && prevent?.(node) || node.hasAttribute?.("data-lenis-prevent") || gestureOrientation === "vertical" && node.hasAttribute?.("data-lenis-prevent-vertical") || gestureOrientation === "horizontal" && node.hasAttribute?.("data-lenis-prevent-horizontal") || isTouch && node.hasAttribute?.("data-lenis-prevent-touch") || isWheel && node.hasAttribute?.("data-lenis-prevent-wheel") || this.options.allowNestedScroll && this.hasNestedScroll(node, {
			deltaX,
			deltaY
		})))) return;
		if (this.isStopped || this.isLocked) {
			if (event.cancelable) event.preventDefault();
			return;
		}
		if (!(this.options.syncTouch && isTouch || this.options.smoothWheel && isWheel)) {
			this.isScrolling = "native";
			this.animate.stop();
			event.lenisStopPropagation = true;
			return;
		}
		let delta = deltaY;
		if (this.options.gestureOrientation === "both") delta = Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX;
		else if (this.options.gestureOrientation === "horizontal") delta = deltaX;
		if (!this.options.overscroll || this.options.infinite || this.options.wrapper !== window && this.limit > 0 && (this.animatedScroll > 0 && this.animatedScroll < this.limit || this.animatedScroll === 0 && deltaY > 0 || this.animatedScroll === this.limit && deltaY < 0)) event.lenisStopPropagation = true;
		if (event.cancelable) event.preventDefault();
		const isSyncTouch = isTouch && this.options.syncTouch;
		const hasTouchInertia = isTouch && event.type === "touchend";
		if (hasTouchInertia) delta = Math.sign(delta) * Math.abs(this.velocity) ** this.options.touchInertiaExponent;
		this.scrollTo(this.targetScroll + delta, {
			programmatic: false,
			...isSyncTouch ? { lerp: hasTouchInertia ? this.options.syncTouchLerp : 1 } : {
				lerp: this.options.lerp,
				duration: this.options.duration,
				easing: this.options.easing
			}
		});
	};
	/**
	* Force lenis to recalculate the dimensions
	*/
	resize() {
		this.dimensions.resize();
		this.animatedScroll = this.targetScroll = this.actualScroll;
		this.emit();
	}
	emit() {
		this.emitter.emit("scroll", this);
	}
	onNativeScroll = () => {
		if (this._resetVelocityTimeout !== null) {
			clearTimeout(this._resetVelocityTimeout);
			this._resetVelocityTimeout = null;
		}
		if (this._preventNextNativeScrollEvent) {
			this._preventNextNativeScrollEvent = false;
			return;
		}
		if (this.isScrolling === false || this.isScrolling === "native") {
			const lastScroll = this.animatedScroll;
			this.animatedScroll = this.targetScroll = this.actualScroll;
			this.lastVelocity = this.velocity;
			this.velocity = this.animatedScroll - lastScroll;
			this.direction = Math.sign(this.animatedScroll - lastScroll);
			if (!this.isStopped) this.isScrolling = "native";
			this.emit();
			if (this.velocity !== 0) this._resetVelocityTimeout = setTimeout(() => {
				this.lastVelocity = this.velocity;
				this.velocity = 0;
				this.isScrolling = false;
				this.emit();
			}, 400);
		}
	};
	reset() {
		this.isLocked = false;
		this.isScrolling = false;
		this.animatedScroll = this.targetScroll = this.actualScroll;
		this.lastVelocity = this.velocity = 0;
		this.animate.stop();
	}
	/**
	* Start lenis scroll after it has been stopped
	*/
	start() {
		if (!this.isStopped) return;
		if (this.options.autoToggle) {
			this.rootElement.style.removeProperty("overflow");
			return;
		}
		this.internalStart();
	}
	internalStart() {
		if (!this.isStopped) return;
		this.reset();
		this.isStopped = false;
		this.emit();
	}
	/**
	* Stop lenis scroll
	*/
	stop() {
		if (this.isStopped) return;
		if (this.options.autoToggle) {
			this.rootElement.style.setProperty("overflow", "clip");
			return;
		}
		this.internalStop();
	}
	internalStop() {
		if (this.isStopped) return;
		this.reset();
		this.isStopped = true;
		this.emit();
	}
	/**
	* RequestAnimationFrame for lenis
	*
	* @param time The time in ms from an external clock like `requestAnimationFrame` or Tempus
	*/
	raf = (time) => {
		const deltaTime = time - (this.time || time);
		this.time = time;
		this.animate.advance(deltaTime * .001);
		if (this.options.autoRaf) this._rafId = requestAnimationFrame(this.raf);
	};
	/**
	* Scroll to a target value
	*
	* @param target The target value to scroll to
	* @param options The options for the scroll
	*
	* @example
	* lenis.scrollTo(100, {
	*   offset: 100,
	*   duration: 1,
	*   easing: (t) => 1 - Math.cos((t * Math.PI) / 2),
	*   lerp: 0.1,
	*   onStart: () => {
	*     console.log('onStart')
	*   },
	*   onComplete: () => {
	*     console.log('onComplete')
	*   },
	* })
	*/
	scrollTo(_target, { offset = 0, immediate = false, lock = false, programmatic = true, lerp = programmatic ? this.options.lerp : void 0, duration = programmatic ? this.options.duration : void 0, easing = programmatic ? this.options.easing : void 0, onStart, onComplete, force = false, userData } = {}) {
		if (this.prefersReducedMotion) if (programmatic) immediate = true;
		else {
			lerp = 1;
			duration = void 0;
			easing = void 0;
		}
		if ((this.isStopped || this.isLocked) && !force) return;
		let target = _target;
		let adjustedOffset = offset;
		if (typeof target === "string" && [
			"top",
			"left",
			"start",
			"#"
		].includes(target)) target = 0;
		else if (typeof target === "string" && [
			"bottom",
			"right",
			"end"
		].includes(target)) target = this.limit;
		else {
			let node = null;
			if (typeof target === "string") {
				node = target.startsWith("#") ? document.getElementById(target.slice(1)) : document.querySelector(target);
				if (!node) if (target === "#top") target = 0;
				else console.warn("Lenis: Target not found", target);
			} else if (target instanceof Element) node = target;
			if (node) {
				if (this.options.wrapper !== window) {
					const wrapperRect = this.rootElement.getBoundingClientRect();
					adjustedOffset -= this.isHorizontal ? wrapperRect.left : wrapperRect.top;
				}
				const rect = node.getBoundingClientRect();
				const targetStyle = getComputedStyle(node);
				const scrollMargin = this.isHorizontal ? Number.parseFloat(targetStyle.scrollMarginLeft) : Number.parseFloat(targetStyle.scrollMarginTop);
				const containerStyle = getComputedStyle(this.rootElement);
				const scrollPadding = this.isHorizontal ? Number.parseFloat(containerStyle.scrollPaddingLeft) : Number.parseFloat(containerStyle.scrollPaddingTop);
				target = (this.isHorizontal ? rect.left : rect.top) + this.animatedScroll - (Number.isNaN(scrollMargin) ? 0 : scrollMargin) - (Number.isNaN(scrollPadding) ? 0 : scrollPadding);
			}
		}
		if (typeof target !== "number") return;
		target += adjustedOffset;
		if (this.options.infinite) {
			if (programmatic) {
				this.targetScroll = this.animatedScroll = this.scroll;
				const distance = target - this.animatedScroll;
				if (distance > this.limit / 2) target -= this.limit;
				else if (distance < -this.limit / 2) target += this.limit;
			}
		} else target = clamp$1(0, target, this.limit);
		if (target === this.targetScroll) {
			onStart?.(this);
			onComplete?.(this);
			return;
		}
		this.userData = userData ?? {};
		if (immediate) {
			this.animatedScroll = this.targetScroll = target;
			this.setScroll(this.scroll);
			this.reset();
			this.preventNextNativeScrollEvent();
			this.emit();
			onComplete?.(this);
			this.userData = {};
			requestAnimationFrame(() => {
				this.dispatchScrollendEvent();
			});
			return;
		}
		if (!programmatic) this.targetScroll = target;
		if (typeof duration === "number" && typeof easing !== "function") easing = defaultEasing;
		else if (typeof easing === "function" && typeof duration !== "number") duration = 1;
		this.animate.fromTo(this.animatedScroll, target, {
			duration,
			easing,
			lerp,
			onStart: () => {
				if (lock) this.isLocked = true;
				this.isScrolling = "smooth";
				onStart?.(this);
			},
			onUpdate: (value, completed) => {
				this.isScrolling = "smooth";
				this.lastVelocity = this.velocity;
				this.velocity = value - this.animatedScroll;
				this.direction = Math.sign(this.velocity);
				this.animatedScroll = value;
				this.setScroll(this.scroll);
				if (programmatic) this.targetScroll = value;
				if (!completed) this.emit();
				if (completed) {
					this.reset();
					this.emit();
					onComplete?.(this);
					this.userData = {};
					requestAnimationFrame(() => {
						this.dispatchScrollendEvent();
					});
					this.preventNextNativeScrollEvent();
				}
			}
		});
	}
	preventNextNativeScrollEvent() {
		this._preventNextNativeScrollEvent = true;
		requestAnimationFrame(() => {
			this._preventNextNativeScrollEvent = false;
		});
	}
	hasNestedScroll(node, { deltaX, deltaY }) {
		const time = Date.now();
		if (!node._lenis) node._lenis = {};
		const cache = node._lenis;
		let hasOverflowX;
		let hasOverflowY;
		let isScrollableX;
		let isScrollableY;
		let hasOverscrollBehaviorX;
		let hasOverscrollBehaviorY;
		let scrollWidth;
		let scrollHeight;
		let clientWidth;
		let clientHeight;
		if (time - (cache.time ?? 0) > 2e3) {
			cache.time = Date.now();
			const computedStyle = window.getComputedStyle(node);
			cache.computedStyle = computedStyle;
			hasOverflowX = [
				"auto",
				"overlay",
				"scroll"
			].includes(computedStyle.overflowX);
			hasOverflowY = [
				"auto",
				"overlay",
				"scroll"
			].includes(computedStyle.overflowY);
			hasOverscrollBehaviorX = ["auto"].includes(computedStyle.overscrollBehaviorX);
			hasOverscrollBehaviorY = ["auto"].includes(computedStyle.overscrollBehaviorY);
			cache.hasOverflowX = hasOverflowX;
			cache.hasOverflowY = hasOverflowY;
			if (!(hasOverflowX || hasOverflowY)) return false;
			scrollWidth = node.scrollWidth;
			scrollHeight = node.scrollHeight;
			clientWidth = node.clientWidth;
			clientHeight = node.clientHeight;
			isScrollableX = scrollWidth > clientWidth;
			isScrollableY = scrollHeight > clientHeight;
			cache.isScrollableX = isScrollableX;
			cache.isScrollableY = isScrollableY;
			cache.scrollWidth = scrollWidth;
			cache.scrollHeight = scrollHeight;
			cache.clientWidth = clientWidth;
			cache.clientHeight = clientHeight;
			cache.hasOverscrollBehaviorX = hasOverscrollBehaviorX;
			cache.hasOverscrollBehaviorY = hasOverscrollBehaviorY;
		} else {
			isScrollableX = cache.isScrollableX;
			isScrollableY = cache.isScrollableY;
			hasOverflowX = cache.hasOverflowX;
			hasOverflowY = cache.hasOverflowY;
			scrollWidth = cache.scrollWidth;
			scrollHeight = cache.scrollHeight;
			clientWidth = cache.clientWidth;
			clientHeight = cache.clientHeight;
			hasOverscrollBehaviorX = cache.hasOverscrollBehaviorX;
			hasOverscrollBehaviorY = cache.hasOverscrollBehaviorY;
		}
		if (!(hasOverflowX && isScrollableX || hasOverflowY && isScrollableY)) return false;
		const orientation = Math.abs(deltaX) >= Math.abs(deltaY) ? "horizontal" : "vertical";
		let scroll;
		let maxScroll;
		let delta;
		let hasOverflow;
		let isScrollable;
		let hasOverscrollBehavior;
		if (orientation === "horizontal") {
			scroll = Math.round(node.scrollLeft);
			maxScroll = scrollWidth - clientWidth;
			delta = deltaX;
			hasOverflow = hasOverflowX;
			isScrollable = isScrollableX;
			hasOverscrollBehavior = hasOverscrollBehaviorX;
		} else if (orientation === "vertical") {
			scroll = Math.round(node.scrollTop);
			maxScroll = scrollHeight - clientHeight;
			delta = deltaY;
			hasOverflow = hasOverflowY;
			isScrollable = isScrollableY;
			hasOverscrollBehavior = hasOverscrollBehaviorY;
		} else return false;
		if (!hasOverscrollBehavior && (scroll >= maxScroll || scroll <= 0)) return true;
		return (delta > 0 ? scroll < maxScroll : scroll > 0) && hasOverflow && isScrollable;
	}
	/**
	* The root element on which lenis is instanced
	*/
	get rootElement() {
		return this.options.wrapper === window ? document.documentElement : this.options.wrapper;
	}
	/**
	* The limit which is the maximum scroll value
	*/
	get limit() {
		if (this.options.naiveDimensions) {
			if (this.isHorizontal) return this.rootElement.scrollWidth - this.rootElement.clientWidth;
			return this.rootElement.scrollHeight - this.rootElement.clientHeight;
		}
		return this.dimensions.limit[this.isHorizontal ? "x" : "y"];
	}
	/**
	* Whether or not the scroll is horizontal
	*/
	get isHorizontal() {
		return this.options.orientation === "horizontal";
	}
	/**
	* The actual scroll value
	*/
	get actualScroll() {
		const wrapper = this.options.wrapper;
		return this.isHorizontal ? wrapper.scrollX ?? wrapper.scrollLeft : wrapper.scrollY ?? wrapper.scrollTop;
	}
	/**
	* The current scroll value
	*/
	get scroll() {
		return this.options.infinite ? modulo(this.animatedScroll, this.limit) : this.animatedScroll;
	}
	/**
	* The progress of the scroll relative to the limit
	*/
	get progress() {
		return this.limit === 0 ? 1 : this.scroll / this.limit;
	}
	/**
	* Current scroll state
	*/
	get isScrolling() {
		return this._isScrolling;
	}
	set isScrolling(value) {
		if (this._isScrolling !== value) {
			this._isScrolling = value;
			this.updateClassName();
		}
	}
	/**
	* Check if lenis is stopped
	*/
	get isStopped() {
		return this._isStopped;
	}
	set isStopped(value) {
		if (this._isStopped !== value) {
			this._isStopped = value;
			this.updateClassName();
		}
	}
	/**
	* Check if lenis is locked
	*/
	get isLocked() {
		return this._isLocked;
	}
	set isLocked(value) {
		if (this._isLocked !== value) {
			this._isLocked = value;
			this.updateClassName();
		}
	}
	/**
	* Check if lenis is smooth scrolling
	*/
	get isSmooth() {
		return this.isScrolling === "smooth";
	}
	/**
	* Whether the user prefers reduced motion and lenis is honoring it (see `respectReducedMotion` option)
	*/
	get prefersReducedMotion() {
		return this.options.respectReducedMotion && this.reducedMotionMediaQuery.matches;
	}
	/**
	* The class name applied to the wrapper element
	*/
	get className() {
		let className = "lenis";
		if (this.options.autoToggle) className += " lenis-autoToggle";
		if (this.isStopped) className += " lenis-stopped";
		if (this.isLocked) className += " lenis-locked";
		if (this.isScrolling) className += " lenis-scrolling";
		if (this.isScrolling === "smooth") className += " lenis-smooth";
		return className;
	}
	updateClassName() {
		this.cleanUpClassName();
		this.className.split(" ").forEach((className) => {
			this.rootElement.classList.add(className);
		});
	}
	cleanUpClassName() {
		for (const className of Array.from(this.rootElement.classList)) if (className === "lenis" || className.startsWith("lenis-")) this.rootElement.classList.remove(className);
	}
};
// src/lib/lenis.ts
var scroller = { current: null };
// src/components/SmoothScroll.tsx
function SmoothScroll({ children }) {
	useEffect(() => {
		const lenis = new Lenis({
			duration: 1.1,
			smoothWheel: true,
			anchors: true
		});
		scroller.current = lenis;
		let raf = 0;
		const loop = (t) => {
			lenis.raf(t);
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => {
			cancelAnimationFrame(raf);
			lenis.destroy();
			scroller.current = null;
		};
	}, []);
	return /* @__PURE__ */ jsx(Fragment, { children });
}
// src/components/ScrollManager.tsx
function ScrollManager() {
	const { pathname, hash } = useLocation();
	useEffect(() => {
		if (hash) {
			const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView(), 50);
			return () => clearTimeout(t);
		}
		window.scrollTo(0, 0);
	}, [pathname, hash]);
	return null;
}
// src/lib/analytics.ts
var GA_ID = "G-TMZZGGXBZP";
var KEY = "rebuildr-analytics-consent";
function getConsent() {
	try {
		const v = localStorage.getItem(KEY);
		return v === "granted" || v === "denied" ? v : null;
	} catch {
		return null;
	}
}
function setConsent(v) {
	try {
		localStorage.setItem(KEY, v);
	} catch {}
	if (v === "granted") loadAnalytics();
}
var loaded = false;
function loadAnalytics() {
	if (loaded || typeof document === "undefined") return;
	loaded = true;
	window.dataLayer = window.dataLayer || [];
	window.gtag = function gtag() {
		window.dataLayer.push(arguments);
	};
	window.gtag("js", /* @__PURE__ */ new Date());
	window.gtag("config", GA_ID, {
		send_page_view: false,
		anonymize_ip: true
	});
	const s = document.createElement("script");
	s.async = true;
	s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
	document.head.appendChild(s);
	trackPageView();
}
function trackPageView() {
	if (!loaded) return;
	window.gtag("event", "page_view", {
		page_path: location.pathname + location.search,
		page_title: document.title
	});
}
/** Custom event. Never pass personal data (emails, names). */
function track(name, params) {
	if (!loaded) return;
	window.gtag("event", name, params);
}
// src/components/WaitlistProvider.tsx
var WaitlistModal = lazy(() => import("./assets/WaitlistModal-BAhhQ1st.js"));
var WaitlistContext = createContext({ open: () => {} });
var useWaitlist = () => useContext(WaitlistContext);
function WaitlistProvider({ children }) {
	const [isOpen, setIsOpen] = useState(false);
	const [prefill, setPrefill] = useState("");
	const trigger = useRef(null);
	const open = useCallback((email = "") => {
		trigger.current = document.activeElement;
		setPrefill(email);
		setIsOpen(true);
		track("waitlist_open");
	}, []);
	const close = useCallback(() => {
		setIsOpen(false);
		trigger.current?.focus?.();
	}, []);
	useEffect(() => {
		if (!isOpen) return;
		scroller.current?.stop();
		const onKey = (e) => e.key === "Escape" && close();
		window.addEventListener("keydown", onKey);
		return () => {
			scroller.current?.start();
			window.removeEventListener("keydown", onKey);
		};
	}, [isOpen, close]);
	return /* @__PURE__ */ jsxs(WaitlistContext.Provider, {
		value: { open },
		children: [children, /* @__PURE__ */ jsx(AnimatePresence, { children: isOpen && /* @__PURE__ */ jsx(Suspense, {
			fallback: null,
			children: /* @__PURE__ */ jsx(WaitlistModal, {
				onClose: close,
				initialEmail: prefill
			}, "wl")
		}) })]
	});
}
// src/components/Button.tsx
function Button({ to = "#", waitlist, variant = "dark", children, className = "" }) {
	const { pathname } = useLocation();
	const { open } = useWaitlist();
	const base = "relative inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium sm:min-h-0 transition-transform duration-200 hover:scale-[1.04] active:scale-95";
	const styles = variant === "accent" ? "bg-gradient-to-b from-[#ff9a4d] to-[#ff6a1f] text-black shadow-[0_0_0_5px_rgba(255,122,47,.12),0_0_30px_rgba(255,122,47,.35)]" : "bg-gradient-to-b from-white/15 to-white/[0.03] text-white shadow-[0_0_0_5px_rgba(255,255,255,.06)] hover:bg-white/10";
	return /* @__PURE__ */ jsx(Fragment, { children: waitlist ? /* @__PURE__ */ jsx("button", {
		type: "button",
		onClick: () => open(),
		className: `${base} ${styles} ${className}`,
		children
	}) : to.startsWith("#") && pathname !== "/" ? /* @__PURE__ */ jsx(Link, {
		to: `/${to}`,
		className: `${base} ${styles} ${className}`,
		children
	}) : /* @__PURE__ */ jsx("a", {
		href: to,
		className: `${base} ${styles} ${className}`,
		children
	}) });
}
// src/components/Logo.tsx
function Mark({ className = "h-5 w-5" }) {
	return /* @__PURE__ */ jsx("img", {
		src: "/brand/mark.png",
		width: 192,
		height: 186,
		alt: "",
		"aria-hidden": true,
		decoding: "async",
		className: `inline-block object-contain ${className}`
	});
}
function Logo({ className = "" }) {
	return /* @__PURE__ */ jsx(Link, {
		to: "/",
		"aria-label": "Rebuildr home",
		className: `block py-3 ${className}`,
		children: /* @__PURE__ */ jsx("img", {
			src: "/brand/logo-header.png",
			width: 150,
			height: 31,
			alt: "Rebuildr",
			fetchPriority: "high",
			decoding: "async",
			className: "h-auto w-[120px] sm:w-[150px]"
		})
	});
}
// src/components/Header.tsx
var links = [
	["Features", "#features"],
	["How it works", "#how-it-works"],
	["Pricing", "#pricing"],
	["FAQ", "#faq"]
];
function Header() {
	const [mobile, setMobile] = useState(false);
	const { pathname } = useLocation();
	const NavLink = ({ href, label, onClick }) => pathname === "/" ? /* @__PURE__ */ jsx("a", {
		href,
		onClick,
		className: "px-3.5 py-2 text-[15px] text-white/90 transition-colors hover:text-white",
		children: label
	}) : /* @__PURE__ */ jsx(Link, {
		to: `/${href}`,
		onClick,
		className: "px-3.5 py-2 text-[15px] text-white/90 transition-colors hover:text-white",
		children: label
	});
	return /* @__PURE__ */ jsxs("header", {
		className: "fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] border-b border-white/5 bg-black/70 backdrop-blur-md",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex h-16 items-center gap-4 px-4 sm:h-[72px] sm:gap-8 sm:px-5 md:px-8",
			children: [
				/* @__PURE__ */ jsx(Logo, {}),
				/* @__PURE__ */ jsx("nav", {
					className: "hidden items-center gap-1 md:flex",
					children: links.map(([label, href]) => /* @__PURE__ */ jsx(NavLink, {
						href,
						label
					}, label))
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "ml-auto flex items-center gap-2 sm:gap-4",
					children: [/* @__PURE__ */ jsxs(Button, {
						waitlist: true,
						className: "!px-4 !py-2 sm:!px-5 sm:!py-2.5",
						children: ["Join", /* @__PURE__ */ jsx("span", {
							className: "hidden sm:inline",
							children: "\xA0waitlist"
						})]
					}), /* @__PURE__ */ jsx("button", {
						"aria-label": "Menu",
						onClick: () => setMobile(!mobile),
						className: "glass flex h-11 w-11 items-center justify-center rounded-full md:hidden",
						children: /* @__PURE__ */ jsxs("span", {
							className: "block w-3.5 space-y-1",
							children: [
								/* @__PURE__ */ jsx("i", { className: "block h-px bg-white" }),
								/* @__PURE__ */ jsx("i", { className: "block h-px bg-white" }),
								/* @__PURE__ */ jsx("i", { className: "block h-px bg-white" })
							]
						})
					})]
				})
			]
		}), /* @__PURE__ */ jsx(AnimatePresence, { children: mobile && /* @__PURE__ */ jsx(m.nav, {
			initial: {
				opacity: 0,
				y: -10
			},
			animate: {
				opacity: 1,
				y: 0
			},
			exit: {
				opacity: 0,
				y: -10
			},
			className: "glass mx-5 rounded-2xl bg-black/90 p-5 md:hidden",
			children: /* @__PURE__ */ jsx("ul", {
				className: "grid grid-cols-2 gap-3 text-sm text-white/80",
				children: links.map(([label, href]) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(NavLink, {
					href,
					label,
					onClick: () => setMobile(false)
				}) }, label))
			})
		}) })]
	});
}
// src/components/Footer.tsx
var cols$1 = {
	Product: [
		{
			label: "Features",
			to: "/#features"
		},
		{
			label: "How it works",
			to: "/#how-it-works"
		},
		{
			label: "Compare",
			to: "/#compare"
		},
		{
			label: "Pricing",
			to: "/#pricing"
		}
	],
	Resources: [{
		label: "FAQ",
		to: "/#faq"
	}],
	Legal: [{
		label: "Privacy Policy",
		to: "/privacy"
	}, {
		label: "Terms of Service",
		to: "/terms"
	}]
};
var stack = [
	"Next.js",
	"TypeScript",
	"Tailwind CSS",
	"React",
	"Responsive layouts",
	"Reusable components",
	"Local dev server",
	"Browser checks"
];
function Footer() {
	const { open } = useWaitlist();
	const [email, setEmail] = useState("");
	return /* @__PURE__ */ jsx("footer", {
		id: "contact",
		className: "px-5 pb-[env(safe-area-inset-bottom)] pt-20 md:px-11",
		children: /* @__PURE__ */ jsxs("div", {
			className: "mx-auto max-w-[1500px]",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "grid gap-10 md:grid-cols-[1.4fr_repeat(3,auto)] md:gap-16",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "max-w-sm",
						children: [
							/* @__PURE__ */ jsx("h2", {
								className: "text-2xl font-medium",
								children: "Be first to rebuild."
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-2 text-sm text-white/60",
								children: "Rebuildr is in development. Leave your email and we will let you know when the beta opens."
							}),
							/* @__PURE__ */ jsxs("form", {
								onSubmit: (e) => {
									e.preventDefault();
									open(email);
								},
								className: "mt-4 flex gap-2",
								children: [/* @__PURE__ */ jsx("input", {
									type: "email",
									"aria-label": "Email address",
									value: email,
									onChange: (e) => setEmail(e.target.value),
									placeholder: "you@company.com",
									className: "glass min-w-0 flex-1 rounded-full bg-transparent px-4 py-2 text-sm outline-none placeholder:text-white/45 focus:border-white/30"
								}), /* @__PURE__ */ jsx("button", {
									className: "rounded-full bg-gradient-to-b from-[#ff9a4d] to-[#ff6a1f] px-5 py-2 text-sm font-medium text-black",
									children: "Join"
								})]
							})
						]
					}), Object.entries(cols$1).map(([h, links]) => /* @__PURE__ */ jsxs("nav", {
						"aria-label": h,
						children: [/* @__PURE__ */ jsx("h3", {
							className: "mb-4 text-xs uppercase tracking-widest text-white/60",
							children: h
						}), /* @__PURE__ */ jsx("ul", {
							className: "text-sm text-white/70",
							children: links.map((l) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, {
								to: l.to,
								className: "block py-3 hover:text-white md:py-1.5",
								children: l.label
							}) }, l.label))
						})]
					}, h))]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-14 flex flex-wrap items-center justify-between gap-4 border-y border-white/10 py-4 text-sm text-white/70",
					children: [/* @__PURE__ */ jsx("span", { children: "English" }), /* @__PURE__ */ jsx("span", { children: "Available for macOS and Windows" })]
				}),
				/* @__PURE__ */ jsx("img", {
					src: "/brand/logo-dark-full.webp",
					width: "2000",
					height: "667",
					loading: "lazy",
					decoding: "async",
					alt: "Rebuildr, from URL to reality",
					className: "mx-auto my-6 h-auto w-full max-w-[1100px]"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-center justify-between gap-4 text-sm text-white/60",
					children: [/* @__PURE__ */ jsx("span", { children: "Copyright © 2026 Rebuildr. All rights reserved" }), /* @__PURE__ */ jsx("span", {
						className: "hidden md:block",
						children: "From URL to reality."
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					"aria-hidden": true,
					className: "mt-6 overflow-hidden border-t border-white/10 py-6 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]",
					children: /* @__PURE__ */ jsx("div", {
						className: "marquee flex w-max gap-16 text-2xl font-medium text-white/60",
						children: [...stack, ...stack].map((p, i) => /* @__PURE__ */ jsx("span", { children: p }, i))
					})
				})
			]
		})
	});
}
// src/pages/home/Hero.tsx
var combos = [
	[
		"A founder",
		"Startup",
		"a landing page"
	],
	[
		"A developer",
		"Agency",
		"a client site"
	],
	[
		"A designer",
		"Product team",
		"a pricing page"
	],
	[
		"A builder",
		"Side project",
		"a full website"
	]
];
var prompt = "https://example.com — rebuild as Next.js + Tailwind";
function Chip({ text, tone }) {
	return /* @__PURE__ */ jsx(AnimatePresence, {
		mode: "wait",
		initial: false,
		children: /* @__PURE__ */ jsx(m.span, {
			initial: {
				y: 14,
				filter: "blur(6px)"
			},
			animate: {
				y: 0,
				filter: "blur(0px)"
			},
			exit: {
				y: -14,
				filter: "blur(6px)"
			},
			transition: { duration: .35 },
			className: `inline-block rounded-xl border border-white/10 px-3 py-1 ${tone}`,
			children: text
		}, text)
	});
}
function TypedPrompt() {
	const [typed, setTyped] = useState(prompt);
	useEffect(() => {
		let n = 0;
		const t = setInterval(() => {
			n = (n + 1) % 76;
			setTyped(prompt.slice(0, n));
		}, 55);
		return () => clearInterval(t);
	}, []);
	return /* @__PURE__ */ jsx(Fragment, { children: typed });
}
function Hero() {
	const [i, setI] = useState(0);
	const { scrollY } = useScroll();
	const opacity = useTransform(scrollY, [0, 500], [1, 0]);
	const y = useTransform(scrollY, [0, 500], [0, -80]);
	useEffect(() => {
		const t = setInterval(() => setI((n) => (n + 1) % combos.length), 2800);
		return () => clearInterval(t);
	}, []);
	const [name, team, asset] = combos[i];
	return /* @__PURE__ */ jsxs("section", {
		className: "relative flex h-svh items-center justify-center px-5 pb-12 pt-20",
		children: [/* @__PURE__ */ jsxs(m.div, {
			style: {
				opacity,
				y
			},
			className: "flex max-w-3xl flex-col items-center text-center",
			children: [
				/* @__PURE__ */ jsxs("p", {
					className: "flex flex-wrap items-center justify-center gap-2 text-lg text-white/60 md:text-2xl",
					children: [
						"Let ",
						/* @__PURE__ */ jsx(Chip, {
							text: name,
							tone: "bg-indigo-500/20 text-white"
						}),
						" from",
						/* @__PURE__ */ jsx(Chip, {
							text: team,
							tone: "bg-orange-500/25 text-white"
						}),
						" rebuild",
						/* @__PURE__ */ jsx(Chip, {
							text: asset,
							tone: "bg-white/10 text-white"
						})
					]
				}),
				/* @__PURE__ */ jsx("h1", {
					className: "mt-3 text-4xl font-medium tracking-tight md:text-6xl",
					children: "From URL to reality."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "glass mt-8 h-28 w-full max-w-xl sm:mt-10 sm:h-32 rounded-2xl p-4 text-left text-sm text-white/70",
					children: [
						/* @__PURE__ */ jsx(TypedPrompt, {}),
						/* @__PURE__ */ jsx("span", { className: "ml-0.5 inline-block h-4 w-px animate-pulse bg-white align-middle" }),
						/* @__PURE__ */ jsx("div", {
							className: "mt-6 flex justify-end",
							children: /* @__PURE__ */ jsx("span", {
								className: "flex h-8 w-8 items-center justify-center rounded-full bg-accent text-black",
								children: "→"
							})
						})
					]
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-5 max-w-md text-xs text-white/60",
					children: "Rebuildr is a URL to website creator for macOS and Windows. Paste a website URL and our AI website builder inspects it, generates a clean Next.js project on your machine, runs it locally and checks it in a real browser."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-5 flex gap-3",
					children: [/* @__PURE__ */ jsx(Button, {
						waitlist: true,
						children: "Join the waitlist"
					}), /* @__PURE__ */ jsx(Button, {
						to: "#how-it-works",
						variant: "accent",
						children: "See how it works"
					})]
				}),
				/* @__PURE__ */ jsx("span", {
					className: "mt-10 text-[10px] uppercase tracking-widest text-white/60 [@media(max-height:720px)]:hidden",
					children: "Scroll to explore"
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-white/5 px-5 py-3 text-xs text-white/60 md:px-8",
			children: [
				/* @__PURE__ */ jsx("span", { children: "macOS · Windows" }),
				/* @__PURE__ */ jsx("span", {
					className: "hidden gap-8 md:flex",
					children: [
						"Next.js",
						"TypeScript",
						"Tailwind CSS",
						"React"
					].map((l) => /* @__PURE__ */ jsx("b", {
						className: "font-medium",
						children: l
					}, l))
				}),
				/* @__PURE__ */ jsx("span", { children: "Your code stays on your machine" })
			]
		})]
	});
}
// src/components/CardArt.tsx
function CardArt({ title, hue, className = "" }) {
	return /* @__PURE__ */ jsxs("div", {
		className: `flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-lg p-3 text-black ${className}`,
		style: { background: `linear-gradient(145deg, hsl(${hue} 90% 62%), hsl(${(hue + 50) % 360} 85% 45%))` },
		children: [
			/* @__PURE__ */ jsx("div", { className: "mb-auto h-8 w-8 rounded-full bg-white/50" }),
			/* @__PURE__ */ jsx("b", {
				className: "text-sm leading-tight",
				children: title
			}),
			/* @__PURE__ */ jsx("i", { className: "mt-1 block h-1.5 w-10 rounded bg-black/40" })
		]
	});
}
// src/data/cards.ts
var cards = [
	{
		title: "Landing page",
		hue: 20
	},
	{
		title: "Pricing",
		hue: 280
	},
	{
		title: "Blog index",
		hue: 140
	},
	{
		title: "Docs home",
		hue: 200
	},
	{
		title: "Dashboard",
		hue: 340
	},
	{
		title: "Portfolio",
		hue: 50
	},
	{
		title: "Checkout",
		hue: 170
	},
	{
		title: "Sign-in",
		hue: 250
	},
	{
		title: "Product page",
		hue: 10
	},
	{
		title: "About",
		hue: 310
	},
	{
		title: "Contact",
		hue: 30
	},
	{
		title: "Changelog",
		hue: 220
	}
];
// src/pages/home/ScrollTunnel.tsx
var words = [
	"Inspected",
	"Planned",
	"Built"
];
var copy = [
	"Rebuildr maps the pages, layout, typography, spacing and visible interactions of your reference site.",
	"It plans reusable components and routes, so you get a codebase, not a screenshot-shaped single page.",
	"A Next.js + TypeScript + Tailwind project is generated, started locally and checked in a real browser."
];
function FlyingCard({ i, progress }) {
	const angle = i / cards.length * Math.PI * 2 + .4;
	const dist = 38 + i % 3 * 8;
	const start = i / cards.length * .4;
	const x = useTransform(progress, [start, start + .5], [0, Math.cos(angle) * dist * 12]);
	const y = useTransform(progress, [start, start + .5], [0, Math.sin(angle) * dist * 8]);
	const scale = useTransform(progress, [start, start + .5], [.2, 1.2]);
	const opacity = useTransform(progress, [
		start,
		start + .08,
		start + .45,
		start + .55
	], [
		0,
		1,
		1,
		0
	]);
	return /* @__PURE__ */ jsx(m.div, {
		style: {
			x,
			y,
			scale,
			opacity
		},
		className: "absolute w-32 md:w-44",
		children: /* @__PURE__ */ jsx(CardArt, {
			...cards[i],
			className: "shadow-2xl"
		})
	});
}
function ScrollTunnel() {
	const ref = useRef(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start start", "end end"]
	});
	const [idx, setIdx] = useState(0);
	useMotionValueEvent(scrollYProgress, "change", (v) => setIdx(Math.min(2, Math.floor(v * 3))));
	const glow = useTransform(scrollYProgress, [
		0,
		.1,
		.9,
		1
	], [
		0,
		1,
		1,
		0
	]);
	return /* @__PURE__ */ jsx("div", {
		ref,
		className: "relative h-[450vh]",
		children: /* @__PURE__ */ jsxs("div", {
			className: "sticky top-0 flex h-svh items-center justify-center overflow-hidden",
			children: [
				/* @__PURE__ */ jsx(m.div, {
					style: { opacity: glow },
					className: "edge-glow absolute inset-0"
				}),
				cards.map((_, i) => /* @__PURE__ */ jsx(FlyingCard, {
					i,
					progress: scrollYProgress
				}, i)),
				/* @__PURE__ */ jsxs("div", {
					className: "relative z-10 max-w-md px-5 text-center",
					children: [
						/* @__PURE__ */ jsx("p", {
							className: "text-[10px] uppercase tracking-widest text-white/60",
							children: "From a single URL"
						}),
						/* @__PURE__ */ jsxs(m.h2, {
							initial: {
								opacity: 0,
								y: 12
							},
							animate: {
								opacity: 1,
								y: 0
							},
							className: "mt-4 text-3xl font-medium md:text-4xl",
							children: [
								/* @__PURE__ */ jsxs("span", {
									className: "relative",
									children: [words[idx], /* @__PURE__ */ jsx("svg", {
										className: "absolute -bottom-2 left-0 w-full",
										viewBox: "0 0 100 8",
										preserveAspectRatio: "none",
										children: /* @__PURE__ */ jsx(m.path, {
											d: "M0 5 Q 25 0 50 4 T 100 3",
											fill: "none",
											stroke: "#4ade80",
											strokeWidth: "2",
											initial: { pathLength: 0 },
											animate: { pathLength: 1 },
											transition: { duration: .6 }
										})
									})]
								}),
								/* @__PURE__ */ jsx("br", {}),
								"from a URL",
								/* @__PURE__ */ jsx("br", {}),
								"Running & editable."
							]
						}, idx),
						/* @__PURE__ */ jsx("p", {
							className: "mt-4 text-xs text-white/60",
							children: copy[idx]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "mt-4 flex justify-center gap-1.5",
							children: words.map((_, k) => /* @__PURE__ */ jsx("i", { className: `h-1 w-1 rounded-full ${k === idx ? "bg-white" : "bg-white/30"}` }, k))
						})
					]
				})
			]
		})
	});
}
// src/pages/home/HowItWorks.tsx
var steps = [
	{
		t: "Paste a URL",
		short: "Paste",
		d: "Enter the reference site, pick a target stack (Next.js + TypeScript + Tailwind CSS) and a local folder. Nothing is created until you confirm."
	},
	{
		t: "Choose a mode",
		short: "Choose",
		d: "Visual reconstruction for a fast, pixel-focused match of one page, or Full reconstruction for a bounded multi-page build with shared layout and components."
	},
	{
		t: "Review the preview",
		short: "Review",
		d: "Rebuildr builds the project, starts the dev server and opens a live preview, with validation findings and one-click targeted repairs."
	}
];
var progress$1 = [
	"Inspecting reference",
	"Building project",
	"Running browser checks",
	"Ready for review"
];
var Dot = ({ on }) => /* @__PURE__ */ jsx("span", { className: `h-2 w-2 shrink-0 rounded-full ${on ? "bg-accent" : "border border-white/30"}` });
var panels = [
	/* @__PURE__ */ jsxs("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ jsx("p", {
				className: "text-[13px] text-white/60",
				children: "Reference website"
			}),
			/* @__PURE__ */ jsx("div", {
				className: "rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-[15px] text-white",
				children: "https://example.com"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "text-[13px] text-white/60",
				children: "Next.js · TypeScript · Tailwind CSS"
			})
		]
	}, "a"),
	/* @__PURE__ */ jsxs("div", {
		className: "space-y-2",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center justify-between rounded-xl border border-white/10 px-4 py-3",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
				className: "text-[15px] text-white",
				children: "Visual"
			}), /* @__PURE__ */ jsx("p", {
				className: "text-[13px] text-white/60",
				children: "One page, closest match"
			})] }), /* @__PURE__ */ jsx(Dot, {})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex items-center justify-between rounded-xl border border-accent/50 bg-accent/10 px-4 py-3",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
				className: "text-[15px] text-white",
				children: "Full"
			}), /* @__PURE__ */ jsx("p", {
				className: "text-[13px] text-white/60",
				children: "Multi-page, routes and components"
			})] }), /* @__PURE__ */ jsx(Dot, { on: true })]
		})]
	}, "b"),
	/* @__PURE__ */ jsx("ul", {
		className: "space-y-2.5",
		children: progress$1.map((p, i) => /* @__PURE__ */ jsxs("li", {
			className: "flex items-center gap-3 text-[14px] text-white/80",
			children: [/* @__PURE__ */ jsx(Dot, { on: i === progress$1.length - 1 }), p]
		}, p))
	}, "c")
];
function HowItWorks() {
	const ref = useRef(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start start", "end end"]
	});
	const [active, setActive] = useState(0);
	useMotionValueEvent(scrollYProgress, "change", (v) => setActive(Math.min(2, Math.floor(v * 3))));
	const fade = (on) => `col-start-1 row-start-1 ${on ? "opacity-100 transition-opacity duration-150 ease-out" : "pointer-events-none opacity-0 transition-none"}`;
	return /* @__PURE__ */ jsx("div", {
		id: "how-it-works",
		ref,
		className: "relative h-[300vh]",
		children: /* @__PURE__ */ jsxs("div", {
			className: "sticky top-0 grid h-svh content-center items-center gap-4 px-5 pb-4 pt-[4.5rem] md:grid-cols-[1.2fr_1fr] md:gap-8 md:px-12 md:pb-0 md:pt-0",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 md:h-[340px] md:p-8 [@media(max-height:600px)]:hidden md:[@media(max-height:600px)]:flex",
				children: [/* @__PURE__ */ jsxs("p", {
					className: "text-[11px] uppercase tracking-[0.18em] text-white/60",
					children: [
						"Step ",
						active + 1,
						" of 3"
					]
				}), /* @__PURE__ */ jsx("div", {
					className: "grid md:flex-1 md:content-center",
					children: panels.map((p, i) => /* @__PURE__ */ jsx("div", {
						"aria-hidden": active !== i,
						className: fade(active === i),
						children: p
					}, i))
				})]
			}), /* @__PURE__ */ jsxs("div", { children: [
				/* @__PURE__ */ jsx("p", {
					className: "text-[10px] uppercase tracking-widest text-white/60",
					children: "How it works"
				}),
				/* @__PURE__ */ jsxs("h2", {
					className: "mt-1 text-[1.65rem] font-medium leading-tight sm:text-3xl md:mt-3 md:text-5xl [@media(max-height:600px)]:text-2xl",
					children: [
						"Paste it.",
						/* @__PURE__ */ jsx("br", {}),
						"Build it.",
						/* @__PURE__ */ jsx("br", {}),
						"Run it locally."
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-5 hidden gap-3 sm:flex",
					children: [/* @__PURE__ */ jsx(Button, {
						waitlist: true,
						children: "Join the waitlist"
					}), /* @__PURE__ */ jsx(Button, {
						to: "#pricing",
						variant: "accent",
						children: "See plans"
					})]
				}),
				/* @__PURE__ */ jsx("ol", {
					className: "mt-5 grid grid-cols-3 gap-2 md:hidden",
					"aria-label": "Steps",
					children: steps.map((s, i) => /* @__PURE__ */ jsxs("li", {
						"aria-current": active === i ? "step" : void 0,
						children: [/* @__PURE__ */ jsx("span", { className: `block h-0.5 rounded-full transition-colors duration-200 ${i <= active ? "bg-accent" : "bg-white/15"}` }), /* @__PURE__ */ jsx("span", {
							className: `mt-2 block text-[13px] transition-colors duration-200 ${active === i ? "text-white" : "text-white/60"}`,
							children: s.short
						})]
					}, s.t))
				}),
				/* @__PURE__ */ jsx("ol", {
					className: "mt-8 hidden space-y-2 md:block",
					children: steps.map((s, i) => /* @__PURE__ */ jsx("li", {
						className: `rounded-2xl border px-4 py-3 text-sm transition-colors duration-200 ${active === i ? "border-white/20 bg-white/[0.06] text-white" : "border-white/10 text-white/60"}`,
						children: s.t
					}, s.t))
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-3 grid min-h-[3.75rem] text-[13px] leading-snug text-white/60 md:min-h-[4.5rem]",
					children: steps.map((s, i) => /* @__PURE__ */ jsx("p", {
						"aria-hidden": active !== i,
						className: fade(active === i),
						children: s.d
					}, s.t))
				})
			] })]
		})
	});
}
// src/components/Reveal.tsx
function Reveal({ children, delay = 0, className = "" }) {
	return /* @__PURE__ */ jsx(m.div, {
		className,
		initial: {
			opacity: 0,
			y: 28
		},
		whileInView: {
			opacity: 1,
			y: 0
		},
		viewport: {
			once: true,
			margin: "-80px"
		},
		transition: {
			duration: .7,
			delay,
			ease: [
				.22,
				1,
				.36,
				1
			]
		},
		children
	});
}
// src/pages/home/Difference.tsx
var layers = [
	"app/layout.tsx",
	"components/Header.tsx",
	"components/Hero.tsx",
	"components/PricingCards.tsx",
	"tailwind.config.ts"
];
function Difference() {
	return /* @__PURE__ */ jsxs("section", {
		className: "mx-auto max-w-6xl px-5 py-32",
		children: [/* @__PURE__ */ jsxs(Reveal, {
			className: "text-center",
			children: [
				/* @__PURE__ */ jsx("p", {
					className: "text-[10px] uppercase tracking-widest text-white/60",
					children: "The difference"
				}),
				/* @__PURE__ */ jsxs("h2", {
					className: "mt-3 text-4xl font-medium md:text-5xl",
					children: [
						"Screenshots give you a picture.",
						/* @__PURE__ */ jsx("br", {}),
						"We give you a project."
					]
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-3 text-white/60",
					children: "A screenshot-to-code snippet is where your work starts. A project you can run, read and extend is where it ends."
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "mt-14 grid gap-6 md:grid-cols-2 [&>*]:min-w-0",
			children: [/* @__PURE__ */ jsx(Reveal, { children: /* @__PURE__ */ jsxs("div", {
				className: "glass rounded-3xl p-6",
				children: [
					/* @__PURE__ */ jsx("h3", {
						className: "text-lg",
						children: "One long file."
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-sm text-white/60",
						children: "Pixel-matched, but hard to maintain."
					}),
					/* @__PURE__ */ jsx(CardArt, {
						title: "index.html",
						hue: 200,
						className: "mx-auto mt-6 w-56"
					})
				]
			}) }), /* @__PURE__ */ jsx(Reveal, {
				delay: .1,
				children: /* @__PURE__ */ jsxs("div", {
					className: "glass rounded-3xl p-6",
					children: [
						/* @__PURE__ */ jsx("h3", {
							className: "text-lg",
							children: "A real codebase."
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-sm text-white/60",
							children: "Reusable components, routes, ready to run."
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-6 flex flex-col items-start gap-5 sm:flex-row sm:gap-6",
							children: [/* @__PURE__ */ jsx(CardArt, {
								title: "Next.js app",
								hue: 20,
								className: "w-40"
							}), /* @__PURE__ */ jsxs("ul", {
								className: "w-full min-w-0 flex-1 space-y-2 text-sm",
								children: [/* @__PURE__ */ jsx("li", {
									className: "text-xs uppercase tracking-widest text-white/60",
									children: "Project files"
								}), layers.map((l) => /* @__PURE__ */ jsx("li", {
									className: "truncate rounded-lg border border-white/10 px-3 py-1.5 transition-colors hover:bg-white/10",
									children: l
								}, l))]
							})]
						})
					]
				})
			})]
		})]
	});
}
// src/pages/home/Capabilities.tsx
var items = [
	{
		t: "Visual reconstruction",
		d: "Layout, typography, spacing, colors and responsive behavior of a single page, matched closely and built from reusable components.",
		hue: 20,
		icon: "◎"
	},
	{
		t: "Full reconstruction",
		d: "A bounded multi-page route plan with shared navigation, layouts and visible interactions. Observed behavior is kept separate from inferred behavior.",
		hue: 280,
		icon: "✻"
	},
	{
		t: "Browser validation",
		d: "Rebuildr runs your project in a real browser and compares it to the reference, reporting what passed, what failed and what is uncertain.",
		hue: 150,
		icon: "⌂"
	},
	{
		t: "Targeted repairs",
		d: "Point at a section that is off and ask for a fix. Rebuildr applies it and re-runs the checks, keeping your own edits.",
		hue: 200,
		icon: "◔"
	},
	{
		t: "Local-first",
		d: "Projects are created in a folder you choose. Your source stays on your machine and remains yours after any subscription ends.",
		hue: 330,
		icon: "✺"
	}
];
function Capabilities() {
	const ref = useRef(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start start", "end end"]
	});
	const [active, setActive] = useState(0);
	useMotionValueEvent(scrollYProgress, "change", (v) => {
		if (window.matchMedia("(min-width: 768px)").matches) setActive(Math.min(items.length - 1, Math.floor(v * items.length)));
	});
	const it = items[active];
	return /* @__PURE__ */ jsx("div", {
		id: "features",
		ref,
		className: "relative md:h-[450vh]",
		children: /* @__PURE__ */ jsxs("div", {
			className: "grid items-center gap-6 px-5 py-24 md:sticky md:top-0 md:h-svh md:grid-cols-[1.1fr_1fr] md:overflow-hidden md:px-10 md:py-0 md:pt-16",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "relative flex h-[300px] items-center justify-center overflow-hidden md:h-[80svh] md:overflow-visible",
				children: [
					/* @__PURE__ */ jsx("div", { className: "absolute left-[-10%] top-1/2 h-[60svh] w-[60svh] max-w-[110%] -translate-y-1/2 rounded-full border border-white/10" }),
					/* @__PURE__ */ jsx("div", {
						className: "absolute left-[-6%] top-1/2 h-[44svh] w-[44svh] max-w-[100%] -translate-y-1/2 animate-[spin-slow_40s_linear_infinite] rounded-full border border-dashed border-white/20",
						children: [
							0,
							1,
							2,
							3
						].map((n) => /* @__PURE__ */ jsx("i", {
							className: "absolute h-2 w-2 rounded-full bg-white/70",
							style: {
								left: `${50 + 50 * Math.cos(n * 1.7)}%`,
								top: `${50 + 50 * Math.sin(n * 1.7)}%`
							}
						}, n))
					}),
					/* @__PURE__ */ jsx(Mark, { className: "absolute left-0 top-1/2 hidden h-24 w-24 -translate-y-1/2 md:block" }),
					/* @__PURE__ */ jsx(AnimatePresence, {
						mode: "wait",
						children: /* @__PURE__ */ jsxs(m.div, {
							initial: {
								opacity: 0,
								y: 40,
								scale: .94
							},
							animate: {
								opacity: 1,
								y: 0,
								scale: 1
							},
							exit: {
								opacity: 0,
								y: -40,
								scale: .94
							},
							transition: {
								duration: .5,
								ease: [
									.22,
									1,
									.36,
									1
								]
							},
							className: "relative grid grid-cols-2 items-end gap-4",
							children: [/* @__PURE__ */ jsx(CardArt, {
								title: it.t,
								hue: it.hue,
								className: "w-40 md:w-56"
							}), /* @__PURE__ */ jsx(CardArt, {
								title: "Preview",
								hue: it.hue + 40,
								className: "mb-10 w-28 md:w-40"
							})]
						}, active)
					})
				]
			}), /* @__PURE__ */ jsxs("div", { children: [
				/* @__PURE__ */ jsx("p", {
					className: "text-[11px] font-semibold uppercase tracking-[0.25em] text-accent",
					children: "Built for how builders actually work"
				}),
				/* @__PURE__ */ jsxs("h2", {
					className: "mt-3 text-5xl font-medium leading-[1.05] md:text-6xl",
					children: [
						"One URL.",
						/* @__PURE__ */ jsx("br", {}),
						"A whole codebase."
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-6 flex gap-3",
					children: [/* @__PURE__ */ jsx(Button, {
						waitlist: true,
						children: "Join the waitlist"
					}), /* @__PURE__ */ jsx(Button, {
						to: "#how-it-works",
						variant: "accent",
						children: "How it works"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-8 space-y-2.5",
					children: items.map((x, i) => /* @__PURE__ */ jsxs(m.button, {
						onClick: () => setActive(i),
						animate: { backgroundColor: active === i ? "rgba(255,255,255,.06)" : "rgba(255,255,255,0)" },
						className: "flex w-full items-center gap-4 rounded-2xl border border-white/10 px-4 py-3.5 text-left",
						children: [/* @__PURE__ */ jsx("span", {
							className: "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl",
							children: x.icon
						}), /* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("b", {
							className: `block font-normal ${active === i ? "text-white" : "text-white/60"}`,
							children: x.t
						}), /* @__PURE__ */ jsx(m.span, {
							initial: false,
							animate: {
								height: active === i ? "auto" : 0,
								opacity: active === i ? 1 : 0
							},
							className: "block overflow-hidden text-sm text-white/60",
							children: x.d
						})] })]
					}, x.t))
				})
			] })]
		})
	});
}
// src/pages/home/Compare.tsx
var cols = [
	"Drag-and-drop builders",
	"Screenshot-to-code tools",
	"Rebuildr"
];
var rows = [
	[
		"Starts from",
		"A template you fill in",
		"An image of a page",
		"A website URL"
	],
	[
		"What you get",
		"A hosted site on their platform",
		"A single long file",
		"A Next.js + TypeScript + Tailwind project"
	],
	[
		"Code structure",
		"Generated, often locked in",
		"One file, hard to maintain",
		"Reusable components and routes"
	],
	[
		"Where it runs",
		"Their servers",
		"Wherever you paste it",
		"On your computer, with a local preview"
	],
	[
		"Checked in a browser",
		"Manual",
		"Rarely",
		"Yes, with a report of what passed and failed"
	],
	[
		"Who owns the code",
		"Depends on the platform",
		"You",
		"You, even if you cancel"
	]
];
var tabs = [
	{
		name: "Rebuildr",
		col: 3
	},
	{
		name: "Builders",
		col: 1
	},
	{
		name: "Screenshot",
		col: 2
	}
];
function Compare() {
	const [tab, setTab] = useState(0);
	return /* @__PURE__ */ jsxs("section", {
		id: "compare",
		className: "mx-auto max-w-5xl scroll-mt-24 px-5 py-24 md:px-8",
		children: [
			/* @__PURE__ */ jsxs(Reveal, {
				className: "text-center",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "text-[10px] uppercase tracking-widest text-white/60",
						children: "Compare"
					}),
					/* @__PURE__ */ jsx("h2", {
						className: "mt-3 text-4xl font-medium md:text-5xl",
						children: "Looking for a website builder like this?"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mx-auto mt-3 max-w-xl text-white/60",
						children: "Most website builders start from a template, and screenshot-to-code tools start from a picture. Rebuildr, a URL to website creator, starts from the site you point it at and gives you a real codebase."
					})
				]
			}),
			/* @__PURE__ */ jsxs(Reveal, {
				className: "mt-8 md:hidden",
				children: [/* @__PURE__ */ jsx("div", {
					role: "tablist",
					"aria-label": "Compare approaches",
					className: "grid grid-cols-3 gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 text-[13px]",
					children: tabs.map((t, i) => /* @__PURE__ */ jsx("button", {
						role: "tab",
						"aria-selected": tab === i,
						onClick: () => setTab(i),
						className: `min-h-11 rounded-full px-2 transition-colors duration-150 ${tab === i ? i === 0 ? "bg-accent text-black" : "bg-white/15 text-white" : "text-white/60"}`,
						children: t.name
					}, t.name))
				}), /* @__PURE__ */ jsx("div", {
					className: "mt-3 grid rounded-2xl border border-white/10 bg-white/[0.03] px-4",
					children: tabs.map((t, i) => /* @__PURE__ */ jsx("dl", {
						role: "tabpanel",
						"aria-hidden": tab !== i,
						className: `col-start-1 row-start-1 divide-y divide-white/10 ${tab === i ? "opacity-100 transition-opacity duration-150" : "pointer-events-none opacity-0"}`,
						children: rows.map((r) => /* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-[6.5rem_1fr] gap-3 py-3 text-[13px] leading-snug",
							children: [/* @__PURE__ */ jsx("dt", {
								className: "text-white/60",
								children: r[0]
							}), /* @__PURE__ */ jsx("dd", {
								className: i === 0 ? "text-white" : "text-white/80",
								children: r[t.col]
							})]
						}, r[0]))
					}, t.name))
				})]
			}),
			/* @__PURE__ */ jsx(Reveal, {
				className: "mt-10 hidden overflow-x-auto rounded-3xl border border-white/10 md:block",
				children: /* @__PURE__ */ jsxs("table", {
					className: "w-full min-w-[640px] border-collapse text-left text-sm",
					children: [
						/* @__PURE__ */ jsx("caption", {
							className: "sr-only",
							children: "How Rebuildr compares with other ways to build a website"
						}),
						/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
							className: "border-b border-white/10",
							children: [/* @__PURE__ */ jsx("th", {
								scope: "col",
								className: "p-4 font-normal text-white/60",
								children: /* @__PURE__ */ jsx("span", {
									className: "sr-only",
									children: "Feature"
								})
							}), cols.map((c, i) => /* @__PURE__ */ jsx("th", {
								scope: "col",
								className: `p-4 font-medium ${i === 2 ? "text-accent" : "text-white/80"}`,
								children: c
							}, c))]
						}) }),
						/* @__PURE__ */ jsx("tbody", { children: rows.map(([k, a, b, c]) => /* @__PURE__ */ jsxs("tr", {
							className: "border-b border-white/5 last:border-0",
							children: [
								/* @__PURE__ */ jsx("th", {
									scope: "row",
									className: "p-4 font-normal text-white/60",
									children: k
								}),
								/* @__PURE__ */ jsx("td", {
									className: "p-4 text-white/70",
									children: a
								}),
								/* @__PURE__ */ jsx("td", {
									className: "p-4 text-white/70",
									children: b
								}),
								/* @__PURE__ */ jsx("td", {
									className: "bg-accent/[0.06] p-4 text-white",
									children: c
								})
							]
						}, k)) })
					]
				})
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-3 text-center text-xs text-white/60",
				children: "General comparison of approaches; individual products vary."
			})
		]
	});
}
// src/components/Accordion.tsx
function Accordion({ items }) {
	const [open, setOpen] = useState(0);
	return /* @__PURE__ */ jsx("div", {
		className: "divide-y divide-white/10 border-y border-white/10",
		children: items.map((it, i) => /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("button", {
			onClick: () => setOpen(open === i ? null : i),
			className: "flex w-full items-center justify-between py-5 text-left text-lg",
			children: [it.title, /* @__PURE__ */ jsx(m.span, {
				animate: { rotate: open === i ? 45 : 0 },
				className: "text-2xl text-white/60",
				children: "+"
			})]
		}), /* @__PURE__ */ jsx(AnimatePresence, {
			initial: false,
			children: open === i && /* @__PURE__ */ jsx(m.div, {
				initial: {
					height: 0,
					opacity: 0
				},
				animate: {
					height: "auto",
					opacity: 1
				},
				exit: {
					height: 0,
					opacity: 0
				},
				transition: {
					duration: .3,
					ease: [
						.4,
						0,
						.2,
						1
					]
				},
				className: "overflow-hidden",
				children: /* @__PURE__ */ jsx("div", {
					className: "pb-5 text-white/60",
					children: it.body
				})
			})
		})] }, it.title))
	});
}
// src/data/faqs.ts
var faqs = [
	{
		title: "What is a URL to website creator?",
		body: "A URL to website creator turns a reference website address into a working website project. Rebuildr inspects the page you point it at, plans reusable components and routes, generates a Next.js, TypeScript and Tailwind CSS project on your computer, runs it locally and checks it in a real browser."
	},
	{
		title: "What is the best URL to website creator?",
		body: "The best tool depends on what you need. Rebuildr is built for people who want a real, editable codebase rather than a screenshot or a locked-in hosted page: it runs on your machine, produces reusable components, validates the result in a browser and reports honestly what it could not reproduce."
	},
	{
		title: "Is there a website builder like this?",
		body: "Drag-and-drop website builders start from templates, and screenshot-to-code tools produce a single long file. Rebuildr starts from a URL and produces a structured Next.js project you own. See the comparison above for how the approaches differ."
	},
	{
		title: "What do I get at the end?",
		body: "A Next.js, TypeScript and Tailwind CSS project in a folder you chose, already running on a local dev server, with reusable components and routes."
	},
	{
		title: "Will it copy any website perfectly?",
		body: "No, and we say so. Rebuildr reports pages it cannot reach, sign-in walls, dynamic content limits and validation failures, so you know exactly what was and was not reproduced."
	},
	{
		title: "Does my code leave my machine?",
		body: "Generated projects are created locally and stay there by default. You keep them even if you stop subscribing."
	},
	{
		title: "Which platforms are supported?",
		body: "Rebuildr is a desktop app for macOS and Windows."
	},
	{
		title: "Who pays for AI usage?",
		body: "We will be explicit about supported sign-in paths and who pays for AI usage before launch. Subscription and AI-provider billing are kept separate."
	},
	{
		title: "Should I only rebuild sites I own?",
		body: "Use Rebuildr on sites you own or have permission to reproduce, and respect each site’s terms and licensing, including its images, fonts and copy."
	}
];
// src/pages/home/PricingSection.tsx
var plans = [{
	name: "Free",
	blurb: "Try Rebuildr on a real site.",
	price: "$0",
	note: "Limited jobs per billing period",
	feats: [
		"Small route limit",
		"Basic validation",
		"Visual reconstruction",
		"Your code stays local"
	],
	cta: "Join the waitlist"
}, {
	name: "Pro",
	blurb: "For people who rebuild sites regularly.",
	price: "Announced at launch",
	note: "Monthly or annual billing",
	feats: [
		"Higher job and route limits",
		"Full reconstruction mode",
		"Visual repair",
		"Project history",
		"Your code stays yours after cancelling"
	],
	cta: "Join the waitlist",
	featured: true
}];
function PricingSection() {
	const [yearly, setYearly] = useState(false);
	return /* @__PURE__ */ jsxs("section", {
		id: "pricing",
		className: "mx-auto max-w-5xl scroll-mt-20 px-5 py-32 md:px-8",
		children: [
			/* @__PURE__ */ jsxs(Reveal, {
				className: "text-center",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "text-[10px] uppercase tracking-widest text-white/60",
						children: "Plans"
					}),
					/* @__PURE__ */ jsxs("h2", {
						className: "mt-3 text-5xl font-medium md:text-6xl",
						children: [
							"Start free.",
							/* @__PURE__ */ jsx("br", {}),
							"Upgrade when you build more."
						]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mx-auto mt-4 max-w-md text-sm text-white/60",
						children: "Rebuildr is in development. Join the waitlist and we will tell you when the beta opens."
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "glass relative mx-auto mt-8 grid w-56 grid-cols-2 rounded-full p-1 text-sm",
						children: [/* @__PURE__ */ jsx("span", {
							"aria-hidden": true,
							className: "absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-white/15 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
							style: { transform: yearly ? "translateX(100%)" : "translateX(0)" }
						}), ["Monthly", "Annual"].map((l, k) => /* @__PURE__ */ jsx("button", {
							onClick: () => setYearly(k === 1),
							"aria-pressed": k === 1 === yearly,
							className: "relative z-10 py-3 sm:py-2",
							children: l
						}, l))]
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-14 grid gap-5 md:grid-cols-2",
				children: plans.map((p, i) => /* @__PURE__ */ jsx(Reveal, {
					delay: i * .07,
					children: /* @__PURE__ */ jsxs("div", {
						className: `glass relative flex h-full flex-col rounded-3xl p-7 ${p.featured ? "border-accent/60 shadow-[0_0_60px_rgba(255,122,47,.15)]" : ""}`,
						children: [
							p.featured && /* @__PURE__ */ jsx("span", {
								className: "absolute -top-3 left-7 rounded-full bg-accent px-3 py-0.5 text-[10px] font-medium text-black",
								children: "Most capable"
							}),
							/* @__PURE__ */ jsxs("h3", {
								className: "text-xl",
								children: [p.name, p.featured && /* @__PURE__ */ jsx("span", {
									className: "ml-2 text-sm text-white/60",
									children: yearly ? "annual" : "monthly"
								})]
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-1 text-sm text-white/60",
								children: p.blurb
							}),
							/* @__PURE__ */ jsx("div", {
								className: "mt-6 text-4xl font-light",
								children: p.price
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-2 text-xs text-white/60",
								children: p.note
							}),
							/* @__PURE__ */ jsx(Button, {
								waitlist: true,
								variant: p.featured ? "accent" : "dark",
								className: "mt-5",
								children: p.cta
							}),
							/* @__PURE__ */ jsx("ul", {
								className: "mt-6 space-y-2 text-sm text-white/70",
								children: p.feats.map((f) => /* @__PURE__ */ jsxs("li", { children: ["• ", f] }, f))
							})
						]
					})
				}, p.name))
			}),
			/* @__PURE__ */ jsxs(Reveal, {
				className: "mx-auto mt-24 max-w-3xl scroll-mt-24",
				children: [/* @__PURE__ */ jsx("h2", {
					id: "faq",
					className: "mb-8 scroll-mt-24 text-center text-4xl font-medium",
					children: "Frequently asked questions"
				}), /* @__PURE__ */ jsx(Accordion, { items: faqs })]
			})
		]
	});
}
// src/pages/home/Testimonials.tsx
var quotes = [
	{
		q: "Your code stays on your machine, and it stays yours, even if you cancel.",
		a: "Local-first"
	},
	{
		q: "We show what was tested, what passed, what failed, and what is still uncertain.",
		a: "Honest validation"
	},
	{
		q: "We tell you when a page needs sign-in or can’t be reproduced, instead of guessing.",
		a: "No overclaiming"
	}
];
function Testimonials() {
	const [i, setI] = useState(0);
	useEffect(() => {
		const t = setInterval(() => setI((n) => (n + 1) % quotes.length), 5e3);
		return () => clearInterval(t);
	}, []);
	return /* @__PURE__ */ jsxs("section", {
		className: "px-5 py-32 text-center",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "mx-auto h-40 max-w-3xl",
				children: /* @__PURE__ */ jsx(AnimatePresence, {
					mode: "wait",
					children: /* @__PURE__ */ jsxs(m.div, {
						initial: {
							opacity: 0,
							y: 12
						},
						animate: {
							opacity: 1,
							y: 0
						},
						exit: {
							opacity: 0,
							y: -12
						},
						children: [/* @__PURE__ */ jsxs("p", {
							className: "text-2xl font-light md:text-4xl",
							children: [
								"“",
								quotes[i].q,
								"”"
							]
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-4 text-sm text-white/60",
							children: quotes[i].a
						})]
					}, i)
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-4 flex justify-center",
				children: quotes.map((_, k) => /* @__PURE__ */ jsx("button", {
					"aria-label": `Quote ${k + 1}`,
					"aria-current": k === i,
					onClick: () => setI(k),
					className: "flex h-11 w-8 items-center justify-center sm:h-6 sm:w-6",
					children: /* @__PURE__ */ jsx("span", { className: `h-1.5 w-1.5 rounded-full ${k === i ? "bg-white" : "bg-white/30"}` })
				}, k))
			}),
			/* @__PURE__ */ jsxs(Reveal, {
				className: "mt-32",
				children: [/* @__PURE__ */ jsx("h2", {
					className: "text-4xl font-medium md:text-6xl",
					children: "Ready to rebuild your first site?"
				}), /* @__PURE__ */ jsxs("div", {
					className: "mt-6 flex justify-center gap-3",
					children: [/* @__PURE__ */ jsx(Button, {
						waitlist: true,
						children: "Join the waitlist"
					}), /* @__PURE__ */ jsx(Button, {
						to: "#how-it-works",
						variant: "accent",
						children: "See how it works"
					})]
				})]
			})
		]
	});
}
// src/pages/Home.tsx
function Home() {
	return /* @__PURE__ */ jsxs("div", {
		id: "top",
		children: [
			/* @__PURE__ */ jsx(Hero, {}),
			/* @__PURE__ */ jsx(ScrollTunnel, {}),
			/* @__PURE__ */ jsx(HowItWorks, {}),
			/* @__PURE__ */ jsx(Difference, {}),
			/* @__PURE__ */ jsx(Capabilities, {}),
			/* @__PURE__ */ jsx(Compare, {}),
			/* @__PURE__ */ jsx(PricingSection, {}),
			/* @__PURE__ */ jsx(Testimonials, {})
		]
	});
}
// src/data/legal.ts
var LEGAL = {
	product: "Rebuildr",
	company: "[Legal entity name]",
	address: "[Registered address]",
	contactEmail: "[contact email]",
	governingLaw: "[Governing law and jurisdiction]",
	effective: "October 25, 2026"
};
// src/pages/Legal.tsx
function Legal({ title, intro, sections }) {
	return /* @__PURE__ */ jsxs("article", {
		className: "mx-auto max-w-6xl px-5 pb-24 pt-36 md:px-8",
		children: [
			/* @__PURE__ */ jsx("p", {
				className: "text-[10px] uppercase tracking-widest text-white/60",
				children: "Legal"
			}),
			/* @__PURE__ */ jsx("h1", {
				className: "mt-3 text-4xl font-medium md:text-6xl",
				children: title
			}),
			/* @__PURE__ */ jsxs("p", {
				className: "mt-3 text-sm text-white/60",
				children: ["Effective ", LEGAL.effective]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-6 max-w-3xl text-white/70",
				children: intro
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-12 grid gap-12 md:grid-cols-[220px_1fr]",
				children: [/* @__PURE__ */ jsx("nav", {
					"aria-label": "On this page",
					className: "hidden md:block",
					children: /* @__PURE__ */ jsx("ul", {
						className: "sticky top-28 space-y-2 text-sm text-white/60",
						children: sections.map((s, i) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("a", {
							href: `#${s.id}`,
							className: "hover:text-white",
							children: [
								i + 1,
								". ",
								s.title
							]
						}) }, s.id))
					})
				}), /* @__PURE__ */ jsx("div", {
					className: "max-w-3xl space-y-10",
					children: sections.map((s, i) => /* @__PURE__ */ jsxs("section", {
						id: s.id,
						className: "scroll-mt-28",
						children: [/* @__PURE__ */ jsxs("h2", {
							className: "text-2xl font-medium",
							children: [
								i + 1,
								". ",
								s.title
							]
						}), /* @__PURE__ */ jsx("div", {
							className: "mt-3 space-y-3 leading-relaxed text-white/65 [&_a]:text-white [&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-medium [&_strong]:text-white/90",
							children: s.body
						})]
					}, s.id))
				})]
			})
		]
	});
}
// src/pages/Privacy.tsx
function Privacy() {
	return /* @__PURE__ */ jsx(Legal, {
		title: "Privacy Policy",
		intro: /* @__PURE__ */ jsxs("p", { children: [
			"This policy explains what ",
			LEGAL.product,
			" (“we”, “us”) collects when you visit our website or use the ",
			LEGAL.product,
			" desktop app for macOS and Windows, how we use it, and the choices you have. ",
			LEGAL.product,
			" is built local-first: the projects it generates stay on your computer by default."
		] }),
		sections: [
			{
				id: "who",
				title: "Who we are",
				body: /* @__PURE__ */ jsxs("p", { children: [
					"The controller of your personal data is ",
					LEGAL.company,
					", ",
					LEGAL.address,
					". You can reach us at ",
					LEGAL.contactEmail,
					"."
				] })
			},
			{
				id: "collect",
				title: "What we collect",
				body: /* @__PURE__ */ jsxs(Fragment, { children: [
					/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("strong", { children: "Information you give us." }), " If you join the waitlist or contact us, we collect your email address and anything you include in your message."] }),
					/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("strong", { children: "Website usage data." }), " Our servers and hosting provider may automatically record technical data such as IP address, browser type, pages requested and timestamps, for security and reliability. We do not run advertising or cross-site tracking on this website."] }),
					/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("strong", { children: "Analytics (only with your consent)." }), " If you accept analytics, we use Google Analytics to measure how the site is used, such as pages viewed, approximate location, device and browser, and whether you joined the waitlist. We do not send your email address or name to Google Analytics. IP addresses are anonymized. You can decline, and the site works the same either way."] }),
					/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("strong", { children: "Account and subscription data (when available)." }), " If we offer accounts or paid plans, we will process the details needed to run them, such as your email, plan and entitlement status. Card details are handled by our payment provider and are not stored by us."] }),
					/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("strong", { children: "Diagnostics (opt-in)." }), " The app does not send diagnostic reports unless you choose to. Reports are designed to exclude secrets and the contents of your generated projects."] })
				] })
			},
			{
				id: "local",
				title: "What stays on your device",
				body: /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("p", { children: "Projects Rebuildr generates, your chosen destination folders, and project history are stored on your computer. We do not receive your generated source code unless you choose to send it to us, for example in a support request." }), /* @__PURE__ */ jsx("p", { children: "When you enter a URL, the app loads that page on your device to inspect it. Content from that page is treated as untrusted input and is not used as instructions." })] })
			},
			{
				id: "ai",
				title: "AI providers",
				body: /* @__PURE__ */ jsxs("p", { children: [
					"Reconstruction uses an AI runtime that you sign in to through a supported, documented method. Content needed to complete a task, such as information about the reference page you asked us to rebuild, may be sent to that provider and is then governed by the provider’s own terms and privacy policy. Your AI usage and billing are separate from any ",
					LEGAL.product,
					" subscription. We do not ask you to paste long-lived secrets into the app and we do not extract tokens from other applications."
				] })
			},
			{
				id: "use",
				title: "How we use information",
				body: /* @__PURE__ */ jsxs("ul", { children: [
					/* @__PURE__ */ jsx("li", { children: "To provide, secure and improve the website and the app." }),
					/* @__PURE__ */ jsx("li", { children: "To send you the waitlist and launch updates you asked for. You can unsubscribe at any time." }),
					/* @__PURE__ */ jsx("li", { children: "To respond to support and legal requests." }),
					/* @__PURE__ */ jsx("li", { children: "To prevent abuse and comply with law." })
				] })
			},
			{
				id: "basis",
				title: "Legal bases (EEA, UK)",
				body: /* @__PURE__ */ jsx("p", { children: "Where data protection law requires a legal basis, we rely on your consent (for example waitlist emails), performance of a contract (providing the app you use), our legitimate interests (security, reliability and product improvement, balanced against your rights), and legal obligations." })
			},
			{
				id: "share",
				title: "Who we share it with",
				body: /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("p", { children: "We do not sell your personal data. We share it only with service providers that help us operate, such as hosting, email delivery, payments and support tools, under agreements that limit their use of it, and with authorities where the law requires." }), /* @__PURE__ */ jsx("p", { children: "If we are involved in a merger, acquisition or sale of assets, personal data may be transferred as part of it, and we will tell you if its handling materially changes." })] })
			},
			{
				id: "transfers",
				title: "International transfers",
				body: /* @__PURE__ */ jsx("p", { children: "Our providers may process data in countries other than yours. Where required, we use safeguards such as standard contractual clauses." })
			},
			{
				id: "retention",
				title: "Retention",
				body: /* @__PURE__ */ jsx("p", { children: "We keep waitlist and contact data until you unsubscribe or ask us to delete it, or until it is no longer needed for the purposes above. Server logs are kept for a limited period. We may keep records longer where the law requires it." })
			},
			{
				id: "rights",
				title: "Your rights",
				body: /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("p", { children: "Depending on where you live, you may have the right to access, correct, delete or export your personal data, to object to or restrict certain processing, to withdraw consent, and to complain to your local data protection authority. California residents have rights to know, delete and correct, and to opt out of sale or sharing; we do not sell or share personal data for cross-context advertising." }), /* @__PURE__ */ jsxs("p", { children: [
					"To exercise a right, email ",
					LEGAL.contactEmail,
					". We may need to verify your identity first."
				] })] })
			},
			{
				id: "cookies",
				title: "Cookies",
				body: /* @__PURE__ */ jsx("p", { children: "This website does not set advertising cookies. Analytics cookies from Google Analytics are set only if you choose “Accept” in the analytics bar. If you decline, nothing is loaded from Google. To change your mind, clear this site’s data in your browser and you will be asked again." })
			},
			{
				id: "security",
				title: "Security",
				body: /* @__PURE__ */ jsx("p", { children: "We use reasonable technical and organizational measures to protect personal data, including keeping secrets out of logs and separating the app’s internal configuration from your projects. No system is perfectly secure, so we cannot guarantee absolute security." })
			},
			{
				id: "children",
				title: "Children",
				body: /* @__PURE__ */ jsxs("p", { children: [LEGAL.product, " is not directed at children under 16, and we do not knowingly collect their personal data. If you believe a child has given us data, contact us and we will delete it."] })
			},
			{
				id: "changes",
				title: "Changes to this policy",
				body: /* @__PURE__ */ jsx("p", { children: "We may update this policy. We will post the new version here with a new effective date and, for material changes, notify you by a reasonable means." })
			},
			{
				id: "contact",
				title: "Contact",
				body: /* @__PURE__ */ jsxs("p", { children: [
					"Questions about privacy: ",
					LEGAL.contactEmail,
					", ",
					LEGAL.company,
					", ",
					LEGAL.address,
					"."
				] })
			}
		]
	});
}
// src/pages/Terms.tsx
function Terms() {
	return /* @__PURE__ */ jsx(Legal, {
		title: "Terms of Service",
		intro: /* @__PURE__ */ jsxs("p", { children: [
			"These terms govern your use of the ",
			LEGAL.product,
			" website and desktop app (the “Service”), provided by ",
			LEGAL.company,
			". By using the Service you agree to them. If you do not agree, do not use it."
		] }),
		sections: [
			{
				id: "service",
				title: "The Service",
				body: /* @__PURE__ */ jsxs("p", { children: [LEGAL.product, " helps you turn a reference website into a locally running project, by inspecting the reference, planning, generating code, and checking the result in a browser. Features, supported stacks, limits and platforms (currently macOS and Windows) may change. Some features may be in beta."] })
			},
			{
				id: "eligibility",
				title: "Eligibility and accounts",
				body: /* @__PURE__ */ jsx("p", { children: "You must be at least 16 and able to form a binding contract. If you use the Service for an organization, you confirm you have authority to bind it. Keep any account credentials secure; you are responsible for activity under your account." })
			},
			{
				id: "license",
				title: "License to the app",
				body: /* @__PURE__ */ jsx("p", { children: "We grant you a limited, non-exclusive, non-transferable, revocable license to install and use the app for your own lawful purposes, subject to these terms. You may not copy, modify, reverse engineer or resell the app, or remove notices, except where the law gives you that right." })
			},
			{
				id: "permission",
				title: "Rebuild only what you may reproduce",
				body: /* @__PURE__ */ jsxs(Fragment, { children: [
					/* @__PURE__ */ jsxs("p", { children: [
						"You are responsible for the websites you ask ",
						LEGAL.product,
						" to reproduce. Use the Service only with sites you own, or where you have the owner’s permission or another lawful right."
					] }),
					/* @__PURE__ */ jsx("p", { children: "Website text, images, fonts, logos, code, trademarks and designs are often protected by copyright and other rights. A rebuilt site does not give you rights to a third party’s content. You must replace or license protected assets and must respect each site’s terms of use." }),
					/* @__PURE__ */ jsx("p", { children: "Rebuildr reports pages it cannot reach, such as those behind sign-in, and does not bypass access controls, paywalls or bot protections. You must not ask it to." })
				] })
			},
			{
				id: "acceptable",
				title: "Acceptable use",
				body: /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("p", { children: "You agree not to:" }), /* @__PURE__ */ jsxs("ul", { children: [
					/* @__PURE__ */ jsx("li", { children: "use the Service for phishing, impersonation, fraud or to copy a site in order to mislead people;" }),
					/* @__PURE__ */ jsx("li", { children: "infringe or misappropriate anyone’s intellectual property or privacy;" }),
					/* @__PURE__ */ jsx("li", { children: "circumvent authentication, rate limits, usage limits or technical protections, or attack, overload or probe any site or system;" }),
					/* @__PURE__ */ jsx("li", { children: "use the Service to build or distribute malware or anything unlawful;" }),
					/* @__PURE__ */ jsx("li", { children: "attempt to access internal configuration, extract credentials, or interfere with the Service or other users." })
				] })] })
			},
			{
				id: "projects",
				title: "Your projects and output",
				body: /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("p", { children: "Generated projects are stored on your computer. As between you and us, you own the code and files the Service generates for you, subject to the rights of third parties in any material taken from a reference site and to any open-source licenses that apply to included dependencies." }), /* @__PURE__ */ jsx("p", { children: "You keep your generated projects if you cancel or your subscription ends. We do not guarantee that output is unique, free of errors, secure, accessible or fit for production. Review and test it before you rely on it." })] })
			},
			{
				id: "ai",
				title: "AI features and third-party services",
				body: /* @__PURE__ */ jsxs("p", { children: [
					"The Service uses an AI runtime you sign in to using supported methods, and other third-party tools. Those services have their own terms, availability and costs, which you are responsible for. Subscription fees for ",
					LEGAL.product,
					" are separate from any AI-provider charges. AI output can be inaccurate or incomplete."
				] })
			},
			{
				id: "plans",
				title: "Plans, fees and billing",
				body: /* @__PURE__ */ jsx("p", { children: "The Service may offer a free plan with limits and paid plans billed monthly or annually. Prices, limits and entitlements will be shown before you buy. Unless stated otherwise, paid plans renew automatically until you cancel, and cancellation takes effect at the end of the current period. Taxes may apply. Refunds are handled as stated at purchase and as required by law." })
			},
			{
				id: "privacy",
				title: "Privacy",
				body: /* @__PURE__ */ jsxs("p", { children: [
					"How we handle personal data is described in our ",
					/* @__PURE__ */ jsx("a", {
						href: "/privacy",
						children: "Privacy Policy"
					}),
					"."
				] })
			},
			{
				id: "feedback",
				title: "Feedback",
				body: /* @__PURE__ */ jsx("p", { children: "If you send us feedback or suggestions, you allow us to use them without restriction or obligation to you." })
			},
			{
				id: "ip",
				title: "Our intellectual property",
				body: /* @__PURE__ */ jsxs("p", { children: [
					"The Service, including the ",
					LEGAL.product,
					" name, logos, software and website, belongs to ",
					LEGAL.company,
					" and its licensors. These terms do not give you any right to them except the license above."
				] })
			},
			{
				id: "disclaimer",
				title: "Disclaimers",
				body: /* @__PURE__ */ jsx("p", { children: "The Service is provided “as is” and “as available”. To the fullest extent the law allows, we disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, non-infringement, and that the Service will be uninterrupted, error-free, or that output will match any reference site. Some laws do not allow certain disclaimers, so some may not apply to you." })
			},
			{
				id: "liability",
				title: "Limitation of liability",
				body: /* @__PURE__ */ jsx("p", { children: "To the fullest extent the law allows, we are not liable for indirect, incidental, special, consequential or punitive damages, or for lost profits, data or goodwill. Our total liability for any claim relating to the Service is limited to the greater of the amount you paid us in the 12 months before the claim and USD 100. Nothing here limits liability that cannot be limited by law, such as for fraud or for death or personal injury caused by negligence." })
			},
			{
				id: "indemnity",
				title: "Indemnity",
				body: /* @__PURE__ */ jsx("p", { children: "You will defend and indemnify us against claims, losses and costs arising from your misuse of the Service, your breach of these terms, or your reproduction or use of third-party content without the right to do so." })
			},
			{
				id: "termination",
				title: "Suspension and termination",
				body: /* @__PURE__ */ jsx("p", { children: "You may stop using the Service at any time. We may suspend or end your access if you breach these terms, create risk or legal exposure, or if we discontinue the Service. Sections that by nature should survive, such as ownership, disclaimers, liability limits and indemnity, will survive termination. Your local projects remain yours." })
			},
			{
				id: "changes",
				title: "Changes to these terms",
				body: /* @__PURE__ */ jsx("p", { children: "We may update these terms. We will post the new version with a new effective date and, for material changes, give reasonable notice. Continued use after the effective date means you accept the changes." })
			},
			{
				id: "law",
				title: "Governing law and disputes",
				body: /* @__PURE__ */ jsxs("p", { children: [
					"These terms are governed by ",
					LEGAL.governingLaw,
					", without regard to conflict-of-law rules. Mandatory consumer protections in your country of residence still apply. Courts in that jurisdiction have exclusive jurisdiction, except where the law gives you the right to bring a claim elsewhere."
				] })
			},
			{
				id: "contact",
				title: "Contact",
				body: /* @__PURE__ */ jsxs("p", { children: [
					"Questions about these terms: ",
					LEGAL.contactEmail,
					", ",
					LEGAL.company,
					", ",
					LEGAL.address,
					"."
				] })
			}
		]
	});
}
// src/data/site.ts
var SITE = {
	url: "https://rebuildr.app",
	name: "Rebuildr",
	tagline: "From URL to reality",
	ogImage: "/brand/og-image.png"
};
// src/seo.ts
var routes = [
	{
		path: "/",
		title: "Rebuildr – URL to Website Creator | AI Website Builder for Any URL",
		description: "Rebuildr is a URL to website creator for macOS and Windows. Paste a URL and get a clean, editable Next.js + Tailwind project that runs locally and is checked in a real browser.",
		priority: "1.0"
	},
	{
		path: "/privacy",
		title: "Privacy Policy | Rebuildr",
		description: "How Rebuildr handles your data. Projects are generated locally and stay on your computer by default.",
		priority: "0.3"
	},
	{
		path: "/terms",
		title: "Terms of Service | Rebuildr",
		description: "The terms for using the Rebuildr website and desktop app, including rules for rebuilding websites you have permission to reproduce.",
		priority: "0.3"
	}
];
var metaFor = (path) => routes.find((r) => r.path === path) ?? routes[0];
var absolute = (p) => `${SITE.url.replace(/\/$/, "")}${p}`;
var esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
function jsonLd(path) {
	if (path !== "/") return [];
	return [
		{
			"@context": "https://schema.org",
			"@type": "Organization",
			name: SITE.name,
			url: absolute("/"),
			logo: absolute("/brand/app-icon.png")
		},
		{
			"@context": "https://schema.org",
			"@type": "WebSite",
			name: SITE.name,
			url: absolute("/")
		},
		{
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			name: SITE.name,
			applicationCategory: "DeveloperApplication",
			operatingSystem: "macOS, Windows",
			description: metaFor("/").description,
			url: absolute("/"),
			offers: {
				"@type": "Offer",
				price: "0",
				priceCurrency: "USD",
				availability: "https://schema.org/PreOrder"
			}
		},
		{
			"@context": "https://schema.org",
			"@type": "FAQPage",
			mainEntity: faqs.map((f) => ({
				"@type": "Question",
				name: f.title,
				acceptedAnswer: {
					"@type": "Answer",
					text: f.body
				}
			}))
		}
	];
}
/** HTML for <head> (prerender). The client keeps title/description in sync on navigation via useSeo. */
function headHtml(path) {
	const m = metaFor(path);
	const url = absolute(path === "/" ? "/" : path);
	const img = absolute(SITE.ogImage);
	return [
		`<title>${esc(m.title)}</title>`,
		`<meta name="description" content="${esc(m.description)}" />`,
		`<link rel="canonical" href="${url}" />`,
		`<meta name="robots" content="index,follow,max-image-preview:large" />`,
		`<meta property="og:type" content="website" />`,
		`<meta property="og:site_name" content="${SITE.name}" />`,
		`<meta property="og:title" content="${esc(m.title)}" />`,
		`<meta property="og:description" content="${esc(m.description)}" />`,
		`<meta property="og:url" content="${url}" />`,
		`<meta property="og:image" content="${img}" />`,
		`<meta property="og:image:alt" content="Rebuildr logo: from URL to reality" />`,
		`<meta name="twitter:card" content="summary_large_image" />`,
		`<meta name="twitter:title" content="${esc(m.title)}" />`,
		`<meta name="twitter:description" content="${esc(m.description)}" />`,
		`<meta name="twitter:image" content="${img}" />`,
		...jsonLd(path).map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}<\/script>`)
	].join("\n    ");
}
// src/useSeo.ts
function useSeo() {
	const { pathname } = useLocation();
	useEffect(() => {
		const m = metaFor(pathname);
		document.title = m.title;
		document.querySelector("meta[name=\"description\"]")?.setAttribute("content", m.description);
		document.querySelector("link[rel=\"canonical\"]")?.setAttribute("href", absolute(pathname));
	}, [pathname]);
}
// src/components/Analytics.tsx
/** Loads GA once consent is stored, reports SPA page views, and shows a minimal consent bar. */
function Analytics() {
	const { pathname } = useLocation();
	const [ask, setAsk] = useState(false);
	const first = useRef(true);
	useEffect(() => {
		const c = getConsent();
		if (c === "granted") loadAnalytics();
		else if (c === null) setAsk(true);
	}, []);
	useEffect(() => {
		if (first.current) {
			first.current = false;
			return;
		}
		trackPageView();
	}, [pathname]);
	if (!ask) return null;
	const choose = (v) => {
		setConsent(v);
		setAsk(false);
	};
	return /* @__PURE__ */ jsxs("div", {
		role: "dialog",
		"aria-label": "Analytics consent",
		className: "fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-xl rounded-2xl border border-white/10 bg-[#0b0b0b]/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl sm:bottom-5",
		children: [/* @__PURE__ */ jsxs("p", {
			className: "text-[13px] leading-snug text-white/70",
			children: ["We use Google Analytics to understand how the site is used. It only runs if you accept. ", /* @__PURE__ */ jsx(Link, {
				to: "/privacy#cookies",
				className: "text-white underline",
				children: "Learn more"
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "mt-3 flex gap-2",
			children: [/* @__PURE__ */ jsx("button", {
				onClick: () => choose("denied"),
				className: "min-h-11 flex-1 rounded-full border border-white/15 text-sm text-white/80",
				children: "Decline"
			}), /* @__PURE__ */ jsx("button", {
				onClick: () => choose("granted"),
				className: "min-h-11 flex-1 rounded-full bg-gradient-to-b from-[#ff9a4d] to-[#ff6a1f] text-sm font-medium text-black",
				children: "Accept"
			})]
		})]
	});
}
// src/App.tsx
function App() {
	useSeo();
	return /* @__PURE__ */ jsx(LazyMotion, {
		features: domAnimation,
		strict: true,
		children: /* @__PURE__ */ jsx(SmoothScroll, { children: /* @__PURE__ */ jsxs(WaitlistProvider, { children: [
			/* @__PURE__ */ jsx(ScrollManager, {}),
			/* @__PURE__ */ jsx(Analytics, {}),
			/* @__PURE__ */ jsx(Header, {}),
			/* @__PURE__ */ jsx("main", { children: /* @__PURE__ */ jsxs(Routes, { children: [
				/* @__PURE__ */ jsx(Route, {
					path: "/",
					element: /* @__PURE__ */ jsx(Home, {})
				}),
				/* @__PURE__ */ jsx(Route, {
					path: "/privacy",
					element: /* @__PURE__ */ jsx(Privacy, {})
				}),
				/* @__PURE__ */ jsx(Route, {
					path: "/terms",
					element: /* @__PURE__ */ jsx(Terms, {})
				}),
				/* @__PURE__ */ jsx(Route, {
					path: "*",
					element: /* @__PURE__ */ jsx(Home, {})
				})
			] }) }),
			/* @__PURE__ */ jsx(Footer, {})
		] }) })
	});
}
// src/entry-server.tsx
function render(url) {
	return renderToString(/* @__PURE__ */ jsx(StaticRouter, {
		location: url,
		children: /* @__PURE__ */ jsx(App, {})
	}));
}
export { SwitchLayoutGroupContext as a, absolute, usePresence as c, headHtml, m as i, LayoutGroupContext as l, track as n, LazyMotion as o, domAnimation as r, render, routes, AnimatePresence as s, Mark as t };
