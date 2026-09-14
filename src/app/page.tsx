"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Equipamento = {
  id: number;
  nome: string;
  modelo: string;
  fabricante: string;
  ano: string;
  horimetro: string;
  responsavel: string;
  localizacao: string;
  status: string;
  proxima_manutencao: string;
};

export default function Home() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function carregarFrota() {
    const { data, error } = await supabase.from("equipamentos").select("*").order("id", { ascending: true });
    if (error) {
      console.error("Erro ao buscar frota:", error.message);
    } else if (data) {
      setEquipamentos(data);
    }
    setCarregando(false);
  }

  useEffect(() => {
    carregarFrota();
  }, []);

  const totalMaquinas = equipamentos.length;
  const operando = equipamentos.filter((e) => e.status === "Operando").length;
  const emManutencao = equipamentos.filter((e) => e.status === "Em Manutenção").length;
  const paradas = equipamentos.filter((e) => e.status === "Parada").length;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Balão Flutuante de Cabeçalho (Efeito Vidro) */}
      <div style={{ background: "rgba(17, 24, 39, 0.75)", backdropFilter: "blur(10px)", padding: "24px 30px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 10px 30px rgba(0,0,0,0.3)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
        <div>
          <h1 style={{ color: "white", fontSize: "24px", fontWeight: "700", marginBottom: "6px" }}>🛠️ Robert Engenharia - Visão Geral da Frota</h1>
          <p style={{ color: "#9ca3af", fontSize: "14px" }}></p>
        </div>
        <Link href="/maquinas" style={{ background: "#ffb000", color: "#111827", padding: "10px 20px", borderRadius: "10px", fontWeight: "600", textDecoration: "none", boxShadow: "0 4px 12px rgba(255, 176, 0, 0.3)" }}>
          🚜 Gerenciar Equipamentos
        </Link>
      </div>

      {/* Balões Flutuantes de Indicadores (Efeito Vidro) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        <div style={{ background: "rgba(17, 24, 39, 0.75)", backdropFilter: "blur(10px)", padding: "20px 24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
          <span style={{ color: "#9ca3af", fontSize: "13px", fontWeight: "500" }}>Total de Máquinas</span>
          <p style={{ fontSize: "32px", color: "white", fontWeight: "700", marginTop: "8px" }}>{carregando ? "..." : totalMaquinas}</p>
        </div>
        <div style={{ background: "rgba(17, 24, 39, 0.75)", backdropFilter: "blur(10px)", padding: "20px 24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
          <span style={{ color: "#9ca3af", fontSize: "13px", fontWeight: "500" }}>Operando</span>
          <p style={{ fontSize: "32px", color: "#4ade80", fontWeight: "700", marginTop: "8px" }}>{carregando ? "..." : operando}</p>
        </div>
        <div style={{ background: "rgba(17, 24, 39, 0.75)", backdropFilter: "blur(10px)", padding: "20px 24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
          <span style={{ color: "#9ca3af", fontSize: "13px", fontWeight: "500" }}>Em Manutenção</span>
          <p style={{ fontSize: "32px", color: "#facc15", fontWeight: "700", marginTop: "8px" }}>{carregando ? "..." : emManutencao}</p>
        </div>
        <div style={{ background: "rgba(17, 24, 39, 0.75)", backdropFilter: "blur(10px)", padding: "20px 24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
          <span style={{ color: "#9ca3af", fontSize: "13px", fontWeight: "500" }}>Paradas</span>
          <p style={{ fontSize: "32px", color: "#ff7777", fontWeight: "700", marginTop: "8px" }}>{carregando ? "..." : paradas}</p>
        </div>
      </div>

      {/* Balão Flutuante da Tabela Geral (Efeito Vidro) */}
      <div style={{ background: "rgba(17, 24, 39, 0.75)", backdropFilter: "blur(10px)", padding: "24px 30px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ color: "#ffb000", fontSize: "18px", fontWeight: "600", margin: 0 }}>📋 Frota Cadastrada</h2>
          <Link href="/maquinas" style={{ color: "#9ca3af", fontSize: "13px", textDecoration: "none" }}>
            Ver tela completa →
          </Link>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", color: "#e5e7eb" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af", fontSize: "13px" }}>
                <th style={{ padding: "12px" }}>Equipamento</th>
                <th style={{ padding: "12px" }}>Modelo</th>
                <th style={{ padding: "12px" }}>Fabricante</th>
                <th style={{ padding: "12px" }}>Localização</th>
                <th style={{ padding: "12px" }}>Horímetro</th>
                <th style={{ padding: "12px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {equipamentos.map((eq) => (
                <tr key={eq.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "14px" }}>
                  <td style={{ padding: "14px 12px" }}>
                    <Link href={`/maquinas?id=${eq.id}`} style={{ color: "white", textDecoration: "none", fontWeight: "600" }}>
                      🚜 {eq.nome}
                    </Link>
                  </td>
                  <td style={{ padding: "14px 12px" }}>{eq.modelo}</td>
                  <td style={{ padding: "14px 12px" }}>{eq.fabricante}</td>
                  <td style={{ padding: "14px 12px" }}>📍 {eq.localizacao || "Não informada"}</td>
                  <td style={{ padding: "14px 12px" }}>{eq.horimetro}</td>
                  <td style={{ padding: "14px 12px" }}>
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "500",
                      background: eq.status === "Operando" ? "rgba(74, 222, 128, 0.1)" : eq.status === "Em Manutenção" ? "rgba(250, 204, 21, 0.1)" : "rgba(255, 119, 119, 0.1)",
                      color: eq.status === "Operando" ? "#4ade80" : eq.status === "Em Manutenção" ? "#facc15" : "#ff7777",
                      border: `1px solid ${eq.status === "Operando" ? "rgba(74, 222, 128, 0.3)" : eq.status === "Em Manutenção" ? "rgba(250, 204, 21, 0.3)" : "rgba(255, 119, 119, 0.3"}`
                    }}>
                      {eq.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!carregando && equipamentos.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
                    Nenhum equipamento cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}