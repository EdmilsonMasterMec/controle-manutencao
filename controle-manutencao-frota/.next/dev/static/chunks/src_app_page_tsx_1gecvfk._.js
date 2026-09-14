(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BackgroundSlide
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const imagens = [
    "https://images.unsplash.com/photo-1541888946425-d0fbb18f86f6?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1920&q=80"
];
function BackgroundSlide() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(9);
    if ($[0] !== "9675f75245f9f7c009e59c0b3b895335bcce2e050b9298cbd31f9309e175218d") {
        for(let $i = 0; $i < 9; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "9675f75245f9f7c009e59c0b3b895335bcce2e050b9298cbd31f9309e175218d";
    }
    const [indiceAtual, setIndiceAtual] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    let t0;
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = ({
            "BackgroundSlide[useEffect()]": ()=>{
                const intervalo = setInterval({
                    "BackgroundSlide[useEffect() > setInterval()]": ()=>{
                        setIndiceAtual(_BackgroundSlideUseEffectSetIntervalSetIndiceAtual);
                    }
                }["BackgroundSlide[useEffect() > setInterval()]"], 5000);
                return ()=>clearInterval(intervalo);
            }
        })["BackgroundSlide[useEffect()]"];
        t1 = [];
        $[1] = t0;
        $[2] = t1;
    } else {
        t0 = $[1];
        t1 = $[2];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t0, t1);
    let t2;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = {
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: -1,
            overflow: "hidden"
        };
        $[3] = t2;
    } else {
        t2 = $[3];
    }
    let t3;
    if ($[4] !== indiceAtual) {
        t3 = imagens.map({
            "BackgroundSlide[imagens.map()]": (img, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundImage: `url(${img})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        opacity: index === indiceAtual ? 1 : 0,
                        transition: "opacity 1.5s ease-in-out"
                    }
                }, img, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 54,
                    columnNumber: 57
                }, this)
        }["BackgroundSlide[imagens.map()]"]);
        $[4] = indiceAtual;
        $[5] = t3;
    } else {
        t3 = $[5];
    }
    let t4;
    if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(11, 15, 25, 0.55)"
            }
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 74,
            columnNumber: 10
        }, this);
        $[6] = t4;
    } else {
        t4 = $[6];
    }
    let t5;
    if ($[7] !== t3) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: t2,
            children: [
                t3,
                t4
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 88,
            columnNumber: 10
        }, this);
        $[7] = t3;
        $[8] = t5;
    } else {
        t5 = $[8];
    }
    return t5;
}
_s(BackgroundSlide, "DnndehVPVf7aJjJvp5vPnGprkWw=");
_c = BackgroundSlide;
function _BackgroundSlideUseEffectSetIntervalSetIndiceAtual(prev) {
    return (prev + 1) % imagens.length;
}
var _c;
__turbopack_context__.k.register(_c, "BackgroundSlide");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_app_page_tsx_1gecvfk._.js.map