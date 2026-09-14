(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function Home() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(59);
    if ($[0] !== "6e138453945ce92d4fdb669f1db981f6e5fb4efecf4167b4f357b934941d6596") {
        for(let $i = 0; $i < 59; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "6e138453945ce92d4fdb669f1db981f6e5fb4efecf4167b4f357b934941d6596";
    }
    let t0;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = [];
        $[1] = t0;
    } else {
        t0 = $[1];
    }
    const [equipamentos, setEquipamentos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(t0);
    const [carregando, setCarregando] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    let t1;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = async function carregarFrota() {
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("equipamentos").select("*").order("id", {
                ascending: true
            });
            if (error) {
                console.error("Erro ao buscar frota:", error.message);
            } else {
                if (data) {
                    setEquipamentos(data);
                }
            }
            setCarregando(false);
        };
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    const carregarFrota = t1;
    let t2;
    let t3;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = ({
            "Home[useEffect()]": ()=>{
                carregarFrota();
            }
        })["Home[useEffect()]"];
        t3 = [];
        $[3] = t2;
        $[4] = t3;
    } else {
        t2 = $[3];
        t3 = $[4];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t2, t3);
    const totalMaquinas = equipamentos.length;
    let t4;
    if ($[5] !== equipamentos) {
        t4 = equipamentos.filter(_HomeEquipamentosFilter);
        $[5] = equipamentos;
        $[6] = t4;
    } else {
        t4 = $[6];
    }
    const operando = t4.length;
    let t5;
    if ($[7] !== equipamentos) {
        t5 = equipamentos.filter(_HomeEquipamentosFilter2);
        $[7] = equipamentos;
        $[8] = t5;
    } else {
        t5 = $[8];
    }
    const emManutencao = t5.length;
    let t6;
    if ($[9] !== equipamentos) {
        t6 = equipamentos.filter(_HomeEquipamentosFilter3);
        $[9] = equipamentos;
        $[10] = t6;
    } else {
        t6 = $[10];
    }
    const paradas = t6.length;
    let t7;
    let t8;
    let t9;
    if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
        t7 = {
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "24px"
        };
        t8 = {
            background: "rgba(17, 24, 39, 0.75)",
            backdropFilter: "blur(10px)",
            padding: "24px 30px",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px"
        };
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    style: {
                        color: "white",
                        fontSize: "24px",
                        fontWeight: "700",
                        marginBottom: "6px"
                    },
                    children: "🛠️ Robert Engenharia - Visão Geral da Frota"
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 127,
                    columnNumber: 15
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        color: "#9ca3af",
                        fontSize: "14px"
                    }
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 132,
                    columnNumber: 59
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 127,
            columnNumber: 10
        }, this);
        $[11] = t7;
        $[12] = t8;
        $[13] = t9;
    } else {
        t7 = $[11];
        t8 = $[12];
        t9 = $[13];
    }
    let t10;
    let t11;
    let t12;
    let t13;
    let t14;
    if ($[14] === Symbol.for("react.memo_cache_sentinel")) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: t8,
            children: [
                t9,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/maquinas",
                    style: {
                        background: "#ffb000",
                        color: "#111827",
                        padding: "10px 20px",
                        borderRadius: "10px",
                        fontWeight: "600",
                        textDecoration: "none",
                        boxShadow: "0 4px 12px rgba(255, 176, 0, 0.3)"
                    },
                    children: "🚜 Gerenciar Equipamentos"
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 150,
                    columnNumber: 31
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 150,
            columnNumber: 11
        }, this);
        t11 = {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px"
        };
        t12 = {
            background: "rgba(17, 24, 39, 0.75)",
            backdropFilter: "blur(10px)",
            padding: "20px 24px",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
        };
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            style: {
                color: "#9ca3af",
                fontSize: "13px",
                fontWeight: "500"
            },
            children: "Total de Máquinas"
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 172,
            columnNumber: 11
        }, this);
        t14 = {
            fontSize: "32px",
            color: "white",
            fontWeight: "700",
            marginTop: "8px"
        };
        $[14] = t10;
        $[15] = t11;
        $[16] = t12;
        $[17] = t13;
        $[18] = t14;
    } else {
        t10 = $[14];
        t11 = $[15];
        t12 = $[16];
        t13 = $[17];
        t14 = $[18];
    }
    const t15 = carregando ? "..." : totalMaquinas;
    let t16;
    if ($[19] !== t15) {
        t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: t12,
            children: [
                t13,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: t14,
                    children: t15
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 198,
                    columnNumber: 33
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 198,
            columnNumber: 11
        }, this);
        $[19] = t15;
        $[20] = t16;
    } else {
        t16 = $[20];
    }
    let t17;
    let t18;
    let t19;
    if ($[21] === Symbol.for("react.memo_cache_sentinel")) {
        t17 = {
            background: "rgba(17, 24, 39, 0.75)",
            backdropFilter: "blur(10px)",
            padding: "20px 24px",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
        };
        t18 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            style: {
                color: "#9ca3af",
                fontSize: "13px",
                fontWeight: "500"
            },
            children: "Operando"
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 216,
            columnNumber: 11
        }, this);
        t19 = {
            fontSize: "32px",
            color: "#4ade80",
            fontWeight: "700",
            marginTop: "8px"
        };
        $[21] = t17;
        $[22] = t18;
        $[23] = t19;
    } else {
        t17 = $[21];
        t18 = $[22];
        t19 = $[23];
    }
    const t20 = carregando ? "..." : operando;
    let t21;
    if ($[24] !== t20) {
        t21 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: t17,
            children: [
                t18,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: t19,
                    children: t20
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 238,
                    columnNumber: 33
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 238,
            columnNumber: 11
        }, this);
        $[24] = t20;
        $[25] = t21;
    } else {
        t21 = $[25];
    }
    let t22;
    let t23;
    let t24;
    if ($[26] === Symbol.for("react.memo_cache_sentinel")) {
        t22 = {
            background: "rgba(17, 24, 39, 0.75)",
            backdropFilter: "blur(10px)",
            padding: "20px 24px",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
        };
        t23 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            style: {
                color: "#9ca3af",
                fontSize: "13px",
                fontWeight: "500"
            },
            children: "Em Manutenção"
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 256,
            columnNumber: 11
        }, this);
        t24 = {
            fontSize: "32px",
            color: "#facc15",
            fontWeight: "700",
            marginTop: "8px"
        };
        $[26] = t22;
        $[27] = t23;
        $[28] = t24;
    } else {
        t22 = $[26];
        t23 = $[27];
        t24 = $[28];
    }
    const t25 = carregando ? "..." : emManutencao;
    let t26;
    if ($[29] !== t25) {
        t26 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: t22,
            children: [
                t23,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: t24,
                    children: t25
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 278,
                    columnNumber: 33
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 278,
            columnNumber: 11
        }, this);
        $[29] = t25;
        $[30] = t26;
    } else {
        t26 = $[30];
    }
    let t27;
    let t28;
    let t29;
    if ($[31] === Symbol.for("react.memo_cache_sentinel")) {
        t27 = {
            background: "rgba(17, 24, 39, 0.75)",
            backdropFilter: "blur(10px)",
            padding: "20px 24px",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
        };
        t28 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            style: {
                color: "#9ca3af",
                fontSize: "13px",
                fontWeight: "500"
            },
            children: "Paradas"
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 296,
            columnNumber: 11
        }, this);
        t29 = {
            fontSize: "32px",
            color: "#ff7777",
            fontWeight: "700",
            marginTop: "8px"
        };
        $[31] = t27;
        $[32] = t28;
        $[33] = t29;
    } else {
        t27 = $[31];
        t28 = $[32];
        t29 = $[33];
    }
    const t30 = carregando ? "..." : paradas;
    let t31;
    if ($[34] !== t30) {
        t31 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: t27,
            children: [
                t28,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: t29,
                    children: t30
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 318,
                    columnNumber: 33
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 318,
            columnNumber: 11
        }, this);
        $[34] = t30;
        $[35] = t31;
    } else {
        t31 = $[35];
    }
    let t32;
    if ($[36] !== t16 || $[37] !== t21 || $[38] !== t26 || $[39] !== t31) {
        t32 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: t11,
            children: [
                t16,
                t21,
                t26,
                t31
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 326,
            columnNumber: 11
        }, this);
        $[36] = t16;
        $[37] = t21;
        $[38] = t26;
        $[39] = t31;
        $[40] = t32;
    } else {
        t32 = $[40];
    }
    let t33;
    let t34;
    let t35;
    if ($[41] === Symbol.for("react.memo_cache_sentinel")) {
        t33 = {
            background: "rgba(17, 24, 39, 0.75)",
            backdropFilter: "blur(10px)",
            padding: "24px 30px",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
        };
        t34 = {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px"
        };
        t35 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
            style: {
                color: "#ffb000",
                fontSize: "18px",
                fontWeight: "600",
                margin: 0
            },
            children: "📋 Frota Cadastrada"
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 353,
            columnNumber: 11
        }, this);
        $[41] = t33;
        $[42] = t34;
        $[43] = t35;
    } else {
        t33 = $[41];
        t34 = $[42];
        t35 = $[43];
    }
    let t36;
    let t37;
    let t38;
    let t39;
    if ($[44] === Symbol.for("react.memo_cache_sentinel")) {
        t36 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: t34,
            children: [
                t35,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/maquinas",
                    style: {
                        color: "#9ca3af",
                        fontSize: "13px",
                        textDecoration: "none"
                    },
                    children: "Ver tela completa →"
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 372,
                    columnNumber: 33
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 372,
            columnNumber: 11
        }, this);
        t37 = {
            overflowX: "auto"
        };
        t38 = {
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            color: "#e5e7eb"
        };
        t39 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                style: {
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    color: "#9ca3af",
                    fontSize: "13px"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                        style: {
                            padding: "12px"
                        },
                        children: "Equipamento"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 390,
                        columnNumber: 10
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                        style: {
                            padding: "12px"
                        },
                        children: "Modelo"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 392,
                        columnNumber: 28
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                        style: {
                            padding: "12px"
                        },
                        children: "Fabricante"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 394,
                        columnNumber: 23
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                        style: {
                            padding: "12px"
                        },
                        children: "Localização"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 396,
                        columnNumber: 27
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                        style: {
                            padding: "12px"
                        },
                        children: "Horímetro"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 398,
                        columnNumber: 28
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                        style: {
                            padding: "12px"
                        },
                        children: "Status"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 400,
                        columnNumber: 26
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 386,
                columnNumber: 18
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 386,
            columnNumber: 11
        }, this);
        $[44] = t36;
        $[45] = t37;
        $[46] = t38;
        $[47] = t39;
    } else {
        t36 = $[44];
        t37 = $[45];
        t38 = $[46];
        t39 = $[47];
    }
    let t40;
    if ($[48] !== equipamentos) {
        t40 = equipamentos.map(_HomeEquipamentosMap);
        $[48] = equipamentos;
        $[49] = t40;
    } else {
        t40 = $[49];
    }
    let t41;
    if ($[50] !== carregando || $[51] !== equipamentos.length) {
        t41 = !carregando && equipamentos.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                colSpan: 6,
                style: {
                    textAlign: "center",
                    padding: "40px",
                    color: "#9ca3af"
                },
                children: "Nenhum equipamento cadastrado."
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 423,
                columnNumber: 59
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 423,
            columnNumber: 55
        }, this);
        $[50] = carregando;
        $[51] = equipamentos.length;
        $[52] = t41;
    } else {
        t41 = $[52];
    }
    let t42;
    if ($[53] !== t40 || $[54] !== t41) {
        t42 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: t33,
            children: [
                t36,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: t37,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                        style: t38,
                        children: [
                            t39,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                children: [
                                    t40,
                                    t41
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 436,
                                columnNumber: 74
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 436,
                        columnNumber: 50
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 436,
                    columnNumber: 33
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 436,
            columnNumber: 11
        }, this);
        $[53] = t40;
        $[54] = t41;
        $[55] = t42;
    } else {
        t42 = $[55];
    }
    let t43;
    if ($[56] !== t32 || $[57] !== t42) {
        t43 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: t7,
            children: [
                t10,
                t32,
                t42
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 445,
            columnNumber: 11
        }, this);
        $[56] = t32;
        $[57] = t42;
        $[58] = t43;
    } else {
        t43 = $[58];
    }
    return t43;
}
_s(Home, "/geUN/WV44V+25GIeGJVaGVDwH4=");
_c = Home;
function _HomeEquipamentosMap(eq) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
        style: {
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            fontSize: "14px"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                style: {
                    padding: "14px 12px"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: `/maquinas?id=${eq.id}`,
                    style: {
                        color: "white",
                        textDecoration: "none",
                        fontWeight: "600"
                    },
                    children: [
                        "🚜 ",
                        eq.nome
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 460,
                    columnNumber: 8
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 458,
                columnNumber: 6
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                style: {
                    padding: "14px 12px"
                },
                children: eq.modelo
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 464,
                columnNumber: 34
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                style: {
                    padding: "14px 12px"
                },
                children: eq.fabricante
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 466,
                columnNumber: 24
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                style: {
                    padding: "14px 12px"
                },
                children: [
                    "📍 ",
                    eq.localizacao || "N\xE3o informada"
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 468,
                columnNumber: 28
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                style: {
                    padding: "14px 12px"
                },
                children: eq.horimetro
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 470,
                columnNumber: 54
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                style: {
                    padding: "14px 12px"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "500",
                        background: eq.status === "Operando" ? "rgba(74, 222, 128, 0.1)" : eq.status === "Em Manuten\xE7\xE3o" ? "rgba(250, 204, 21, 0.1)" : "rgba(255, 119, 119, 0.1)",
                        color: eq.status === "Operando" ? "#4ade80" : eq.status === "Em Manuten\xE7\xE3o" ? "#facc15" : "#ff7777",
                        border: `1px solid ${eq.status === "Operando" ? "rgba(74, 222, 128, 0.3)" : eq.status === "Em Manuten\xE7\xE3o" ? "rgba(250, 204, 21, 0.3)" : "rgba(255, 119, 119, 0.3"}`
                    },
                    children: eq.status
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 474,
                    columnNumber: 8
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 472,
                columnNumber: 27
            }, this)
        ]
    }, eq.id, true, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 455,
        columnNumber: 10
    }, this);
}
function _HomeEquipamentosFilter3(e_1) {
    return e_1.status === "Parada";
}
function _HomeEquipamentosFilter2(e_0) {
    return e_0.status === "Em Manuten\xE7\xE3o";
}
function _HomeEquipamentosFilter(e) {
    return e.status === "Operando";
}
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/supabase.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-client] (ecmascript) <locals>");
;
const supabaseUrl = 'https://zazcuwgygivwemnrkzzk.supabase.co';
const supabaseKey = 'sb_publishable_n50AIHrpOHoVVcgOeTioeg_P2oIaSTH';
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseKey);
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_0oh2th7._.js.map