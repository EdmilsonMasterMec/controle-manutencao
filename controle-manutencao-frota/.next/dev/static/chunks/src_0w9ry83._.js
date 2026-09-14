(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/layout.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MecanicosPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function MecanicosPage() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(41);
    if ($[0] !== "79a89832bee456fc29af884f79241f45b71c18587db46bd9fe8bc18e7cec009f") {
        for(let $i = 0; $i < 41; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "79a89832bee456fc29af884f79241f45b71c18587db46bd9fe8bc18e7cec009f";
    }
    let t0;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = [];
        $[1] = t0;
    } else {
        t0 = $[1];
    }
    const [tecnicos, setTecnicos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(t0);
    const [mostrarCadastro, setMostrarCadastro] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [nome, setNome] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [especialidade, setEspecialidade] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [telefone, setTelefone] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("Dispon\xEDvel");
    let t1;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = async function carregarTecnicos() {
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("mecanicos").select("*").order("id", {
                ascending: true
            });
            if (error) {
                console.error("Erro ao buscar t\xE9cnicos:", error.message);
            } else {
                if (data) {
                    setTecnicos(data);
                }
            }
        };
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    const carregarTecnicos = t1;
    let t2;
    let t3;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = ({
            "MecanicosPage[useEffect()]": ()=>{
                carregarTecnicos();
            }
        })["MecanicosPage[useEffect()]"];
        t3 = [];
        $[3] = t2;
        $[4] = t3;
    } else {
        t2 = $[3];
        t3 = $[4];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t2, t3);
    let t4;
    if ($[5] !== especialidade || $[6] !== nome || $[7] !== status || $[8] !== telefone) {
        t4 = async function salvarTecnico(e) {
            e.preventDefault();
            if (!nome) {
                alert("Preencha o nome do t\xE9cnico respons\xE1vel.");
                return;
            }
            const { error: error_0 } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("mecanicos").insert([
                {
                    nome,
                    especialidade,
                    telefone,
                    status
                }
            ]);
            if (error_0) {
                alert("Erro ao cadastrar: " + error_0.message);
            } else {
                alert("T\xE9cnico Respons\xE1vel cadastrado com sucesso!");
                setNome("");
                setEspecialidade("");
                setTelefone("");
                setStatus("Dispon\xEDvel");
                setMostrarCadastro(false);
                carregarTecnicos();
            }
        };
        $[5] = especialidade;
        $[6] = nome;
        $[7] = status;
        $[8] = telefone;
        $[9] = t4;
    } else {
        t4 = $[9];
    }
    const salvarTecnico = t4;
    let t5;
    if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = async function alternarStatus(id, statusAtual) {
            const novoStatus = statusAtual === "Dispon\xEDvel" ? "Em Servi\xE7o" : "Dispon\xEDvel";
            const { error: error_1 } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("mecanicos").update({
                status: novoStatus
            }).eq("id", id);
            if (!error_1) {
                carregarTecnicos();
            }
        };
        $[10] = t5;
    } else {
        t5 = $[10];
    }
    const alternarStatus = t5;
    let t6;
    if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
        t6 = async function excluirTecnico(id_0) {
            if (!confirm("Deseja realmente excluir este t\xE9cnico respons\xE1vel?")) {
                return;
            }
            const { error: error_2 } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("mecanicos").delete().eq("id", id_0);
            if (!error_2) {
                carregarTecnicos();
            }
        };
        $[11] = t6;
    } else {
        t6 = $[11];
    }
    const excluirTecnico = t6;
    let t7;
    let t8;
    let t9;
    if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
        t7 = {
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "24px"
        };
        t8 = {
            background: "#111827",
            padding: "24px 30px",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.06)",
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
                    children: "👨‍🔧 Equipe Técnica"
                }, void 0, false, {
                    fileName: "[project]/src/app/layout.tsx",
                    lineNumber: 169,
                    columnNumber: 15
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        color: "#9ca3af",
                        fontSize: "14px"
                    },
                    children: "Gerenciamento da equipe técnica e profissionais"
                }, void 0, false, {
                    fileName: "[project]/src/app/layout.tsx",
                    lineNumber: 174,
                    columnNumber: 35
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/layout.tsx",
            lineNumber: 169,
            columnNumber: 10
        }, this);
        $[12] = t7;
        $[13] = t8;
        $[14] = t9;
    } else {
        t7 = $[12];
        t8 = $[13];
        t9 = $[14];
    }
    let t10;
    if ($[15] !== mostrarCadastro) {
        t10 = ({
            "MecanicosPage[<button>.onClick]": ()=>setMostrarCadastro(!mostrarCadastro)
        })["MecanicosPage[<button>.onClick]"];
        $[15] = mostrarCadastro;
        $[16] = t10;
    } else {
        t10 = $[16];
    }
    let t11;
    if ($[17] === Symbol.for("react.memo_cache_sentinel")) {
        t11 = {
            background: "#ffb000",
            color: "#111827",
            padding: "10px 20px",
            borderRadius: "10px",
            fontWeight: "600",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(255, 176, 0, 0.3)"
        };
        $[17] = t11;
    } else {
        t11 = $[17];
    }
    const t12 = mostrarCadastro ? "Cancelar" : "+ Novo T\xE9cnico Respons\xE1vel";
    let t13;
    if ($[18] !== t10 || $[19] !== t12) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: t8,
            children: [
                t9,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: t10,
                    style: t11,
                    children: t12
                }, void 0, false, {
                    fileName: "[project]/src/app/layout.tsx",
                    lineNumber: 215,
                    columnNumber: 31
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/layout.tsx",
            lineNumber: 215,
            columnNumber: 11
        }, this);
        $[18] = t10;
        $[19] = t12;
        $[20] = t13;
    } else {
        t13 = $[20];
    }
    let t14;
    if ($[21] !== especialidade || $[22] !== mostrarCadastro || $[23] !== nome || $[24] !== salvarTecnico || $[25] !== status || $[26] !== telefone) {
        t14 = mostrarCadastro && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                background: "#111827",
                padding: "24px 30px",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    style: {
                        color: "#ffb000",
                        fontSize: "18px",
                        fontWeight: "600",
                        marginBottom: "20px"
                    },
                    children: "Cadastrar Novo Técnico Responsável"
                }, void 0, false, {
                    fileName: "[project]/src/app/layout.tsx",
                    lineNumber: 230,
                    columnNumber: 8
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: salvarTecnico,
                    style: {
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "15px"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            placeholder: "Nome do T\xE9cnico",
                            value: nome,
                            onChange: {
                                "MecanicosPage[<input>.onChange]": (e_0)=>setNome(e_0.target.value)
                            }["MecanicosPage[<input>.onChange]"],
                            required: true,
                            style: {
                                padding: "12px",
                                background: "#0b0f19",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "8px",
                                color: "white"
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/app/layout.tsx",
                            lineNumber: 239,
                            columnNumber: 10
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            placeholder: "Especialidade (Ex: Hidr\xE1ulica / El\xE9trica)",
                            value: especialidade,
                            onChange: {
                                "MecanicosPage[<input>.onChange]": (e_1)=>setEspecialidade(e_1.target.value)
                            }["MecanicosPage[<input>.onChange]"],
                            style: {
                                padding: "12px",
                                background: "#0b0f19",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "8px",
                                color: "white"
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/app/layout.tsx",
                            lineNumber: 247,
                            columnNumber: 14
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            placeholder: "Telefone / Contato",
                            value: telefone,
                            onChange: {
                                "MecanicosPage[<input>.onChange]": (e_2)=>setTelefone(e_2.target.value)
                            }["MecanicosPage[<input>.onChange]"],
                            style: {
                                padding: "12px",
                                background: "#0b0f19",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "8px",
                                color: "white"
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/app/layout.tsx",
                            lineNumber: 255,
                            columnNumber: 14
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                            value: status,
                            onChange: {
                                "MecanicosPage[<select>.onChange]": (e_3)=>setStatus(e_3.target.value)
                            }["MecanicosPage[<select>.onChange]"],
                            style: {
                                padding: "12px",
                                background: "#0b0f19",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "8px",
                                color: "white"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: "Dispon\xEDvel",
                                    children: "Disponível"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/layout.tsx",
                                    lineNumber: 271,
                                    columnNumber: 12
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: "Em Servi\xE7o",
                                    children: "Em Serviço"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/layout.tsx",
                                    lineNumber: 271,
                                    columnNumber: 63
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/layout.tsx",
                            lineNumber: 263,
                            columnNumber: 14
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                gridColumn: "1 / -1",
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "10px",
                                marginTop: "10px"
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                style: {
                                    background: "#ffb000",
                                    color: "#111827",
                                    padding: "10px 20px",
                                    borderRadius: "8px",
                                    fontWeight: "600",
                                    border: "none",
                                    cursor: "pointer"
                                },
                                children: "Salvar Técnico"
                            }, void 0, false, {
                                fileName: "[project]/src/app/layout.tsx",
                                lineNumber: 277,
                                columnNumber: 12
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/layout.tsx",
                            lineNumber: 271,
                            columnNumber: 123
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/layout.tsx",
                    lineNumber: 235,
                    columnNumber: 49
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/layout.tsx",
            lineNumber: 224,
            columnNumber: 30
        }, this);
        $[21] = especialidade;
        $[22] = mostrarCadastro;
        $[23] = nome;
        $[24] = salvarTecnico;
        $[25] = status;
        $[26] = telefone;
        $[27] = t14;
    } else {
        t14 = $[27];
    }
    let t15;
    if ($[28] === Symbol.for("react.memo_cache_sentinel")) {
        t15 = {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px"
        };
        $[28] = t15;
    } else {
        t15 = $[28];
    }
    let t16;
    if ($[29] !== tecnicos) {
        let t17;
        if ($[31] === Symbol.for("react.memo_cache_sentinel")) {
            t17 = ({
                "MecanicosPage[tecnicos.map()]": (tec)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: "#111827",
                            padding: "24px",
                            borderRadius: "16px",
                            border: "1px solid rgba(255,255,255,0.06)",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "15px"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: {
                                            color: "white",
                                            fontSize: "18px",
                                            fontWeight: "600",
                                            marginBottom: "4px"
                                        },
                                        children: [
                                            "👨‍🔧 ",
                                            tec.nome
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/layout.tsx",
                                        lineNumber: 321,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            color: "#9ca3af",
                                            fontSize: "13px"
                                        },
                                        children: tec.especialidade || "Especialidade n\xE3o informada"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/layout.tsx",
                                        lineNumber: 326,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/layout.tsx",
                                lineNumber: 321,
                                columnNumber: 12
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: "14px",
                                    color: "#e5e7eb"
                                },
                                children: [
                                    "📞 ",
                                    tec.telefone || "Sem telefone cadastrado"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/layout.tsx",
                                lineNumber: 329,
                                columnNumber: 81
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginTop: "10px",
                                    paddingTop: "15px",
                                    borderTop: "1px solid rgba(255,255,255,0.06)"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            padding: "4px 10px",
                                            borderRadius: "20px",
                                            fontSize: "12px",
                                            fontWeight: "500",
                                            background: tec.status === "Dispon\xEDvel" ? "rgba(74, 222, 128, 0.1)" : "rgba(250, 204, 21, 0.1)",
                                            color: tec.status === "Dispon\xEDvel" ? "#4ade80" : "#facc15",
                                            border: `1px solid ${tec.status === "Dispon\xEDvel" ? "rgba(74, 222, 128, 0.3)" : "rgba(250, 204, 21, 0.3)"}`
                                        },
                                        children: [
                                            "Status: ",
                                            tec.status
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/layout.tsx",
                                        lineNumber: 339,
                                        columnNumber: 14
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            gap: "8px"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: {
                                                    "MecanicosPage[tecnicos.map() > <button>.onClick]": ()=>alternarStatus(tec.id, tec.status)
                                                }["MecanicosPage[tecnicos.map() > <button>.onClick]"],
                                                title: "Alterar Status",
                                                style: {
                                                    background: "rgba(255,255,255,0.05)",
                                                    border: "1px solid rgba(255,255,255,0.1)",
                                                    color: "white",
                                                    padding: "6px 10px",
                                                    borderRadius: "6px",
                                                    cursor: "pointer",
                                                    fontSize: "12px"
                                                },
                                                children: "🔄 Status"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/layout.tsx",
                                                lineNumber: 350,
                                                columnNumber: 16
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: {
                                                    "MecanicosPage[tecnicos.map() > <button>.onClick]": ()=>excluirTecnico(tec.id)
                                                }["MecanicosPage[tecnicos.map() > <button>.onClick]"],
                                                title: "Excluir T\xE9cnico",
                                                style: {
                                                    background: "rgba(255, 119, 119, 0.1)",
                                                    border: "1px solid rgba(255, 119, 119, 0.3)",
                                                    color: "#ff7777",
                                                    padding: "6px 10px",
                                                    borderRadius: "6px",
                                                    cursor: "pointer",
                                                    fontSize: "12px"
                                                },
                                                children: "🗑"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/layout.tsx",
                                                lineNumber: 360,
                                                columnNumber: 36
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/layout.tsx",
                                        lineNumber: 347,
                                        columnNumber: 43
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/layout.tsx",
                                lineNumber: 332,
                                columnNumber: 66
                            }, this)
                        ]
                    }, tec.id, true, {
                        fileName: "[project]/src/app/layout.tsx",
                        lineNumber: 312,
                        columnNumber: 49
                    }, this)
            })["MecanicosPage[tecnicos.map()]"];
            $[31] = t17;
        } else {
            t17 = $[31];
        }
        t16 = tecnicos.map(t17);
        $[29] = tecnicos;
        $[30] = t16;
    } else {
        t16 = $[30];
    }
    let t17;
    if ($[32] !== tecnicos.length) {
        t17 = tecnicos.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                gridColumn: "1 / -1",
                background: "#111827",
                padding: "40px",
                borderRadius: "16px",
                textAlign: "center",
                color: "#9ca3af",
                border: "1px solid rgba(255,255,255,0.06)"
            },
            children: "Nenhum técnico responsável cadastrado."
        }, void 0, false, {
            fileName: "[project]/src/app/layout.tsx",
            lineNumber: 384,
            columnNumber: 36
        }, this);
        $[32] = tecnicos.length;
        $[33] = t17;
    } else {
        t17 = $[33];
    }
    let t18;
    if ($[34] !== t16 || $[35] !== t17) {
        t18 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: t15,
            children: [
                t16,
                t17
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/layout.tsx",
            lineNumber: 400,
            columnNumber: 11
        }, this);
        $[34] = t16;
        $[35] = t17;
        $[36] = t18;
    } else {
        t18 = $[36];
    }
    let t19;
    if ($[37] !== t13 || $[38] !== t14 || $[39] !== t18) {
        t19 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: t7,
            children: [
                t13,
                t14,
                t18
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/layout.tsx",
            lineNumber: 409,
            columnNumber: 11
        }, this);
        $[37] = t13;
        $[38] = t14;
        $[39] = t18;
        $[40] = t19;
    } else {
        t19 = $[40];
    }
    return t19;
}
_s(MecanicosPage, "/I04F9ybeQbRNAVU/JAM7E6mtZY=");
_c = MecanicosPage;
var _c;
__turbopack_context__.k.register(_c, "MecanicosPage");
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

//# sourceMappingURL=src_0w9ry83._.js.map